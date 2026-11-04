/**
 * The 3D view (Simple model). Loaded only on the Explorer page, after the 2D figure is showing,
 * and only if the browser supports WebGL. If anything fails, the 2D figure stays.
 *
 * - Model: public/models/simple.glb, built by model/simple/build.mjs from the figure's shapes.
 * - Cut-away: a clipping plane. At the midline the cut face is painted with the figure itself
 *   (exact match with design/figures/); at other depths cut faces are filled with each
 *   structure's palette color (stencil caps).
 * - Renders only when something changes (no animation loop), so nothing runs while idle,
 *   off screen or in a hidden tab.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Store, ViewState, LayerId, CameraView } from './state';
import { anatomyFigureSvg, type FigureStrings, type FigureLayer } from '../lib/anatomy-figure';
import { isCalm } from '../lib/calm';
import shapes from '../lib/anatomy-shapes.json';

const MODEL_URL = '/models/simple.glb';
const FIGURE_UNITS_PER_MM = 2;
// Origin of the model: middle of the foramen magnum, in figure units (see build.mjs).
const ORIGIN = { x: 369, y: 444.5 };
// The figure without labels uses this viewBox; the midline cut face covers the same area.
const SECTION_BOX = { x: 36, y: 62, w: 522, h: 578 };
const BACKGROUND = 0x1a1c20; // --x-viewport
// Middle of the head, in mm, where the camera looks.
const TARGET = new THREE.Vector3(-40, 40, 0);

interface Part {
  mesh: THREE.Mesh;
  name: string;
  /** Structure-list id (cerebrum, tonsil, ...) or null for parts not in the list. */
  partId: string | null;
  layer: LayerId;
  conditions: string[] | null;
  baseOpacity: number;
  /** The skin layer fades when the model is turned away from the side view. */
  ghost: boolean;
  /** Opacity from the model and the layer slider, before any fading. */
  opacity: number;
  /** Side-to-side extent (mm); a cut outside it doesn't touch this structure. */
  zMin: number;
  zMax: number;
  stencil: THREE.Group;
  cap: THREE.Mesh;
}

/** A label in the 3D view: anchored at a point on the midline (figure units), shown in a column. */
export interface LabelDef {
  part: string;
  num: string;
  name: string;
  layer: LayerId;
  anchor: [number, number];
}

/** Where each structure's label points, in figure units (the figure's own leader-line ends). */
export function labelAnchor(part: string, condition: string): [number, number] {
  const tonsilMid = condition === 'typical' ? 430 : condition === 'surgery' ? 444 : 448;
  const anchors: Record<string, [number, number]> = {
    cerebrum: [250, 170], callosum: [300, 214], cerebellum: [452, 372], ventricle: [364, 384], brainstem: [318, 372],
    tonsil: [386, tonsilMid], foramen: [372, 445], cord: [350, 480], csf: [380, 620], c2: [318, 500],
  };
  return anchors[part] ?? [369, 444.5];
}

const PRESET_ANGLES: Record<Exclude<CameraView, 'custom'>, [number, number]> = {
  side: [0, 0],
  back: [90, 0],
  below: [0, -80],
  front: [-90, 0],
};

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Cut-away slider (0 whole, 50 midline, 100 far side) to plane depth in mm. */
function cutDepth(slider: number): number {
  if (slider === 50) return 0;
  return slider < 50 ? ((50 - slider) / 50) * 100 : -((slider - 50) / 50) * 60;
}

export interface ViewerOptions {
  /** Container for the 3D labels (positioned over the view). */
  labelsHost?: HTMLElement | null;
  labels?: LabelDef[];
  /** Called when the visitor taps a structure in the model. */
  onPick?: (part: string) => void;
}

export async function createViewer(host: HTMLElement, store: Store, figureStrings: FigureStrings, options: ViewerOptions = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  renderer.setClearColor(BACKGROUND);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.touchAction = 'none';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 3000);
  camera.position.set(TARGET.x, TARGET.y, 900);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8278, 2.0));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(-0.4, 0.8, 1);
  camera.add(keyLight);
  scene.add(camera);

  // Keeps z <= depth. The plane faces the default (side) camera.
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);

  const parts: Part[] = [];
  let order = 1;
  const capGeometry = new THREE.PlaneGeometry(400, 400);
  gltf.scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const extras = (mesh.userData.layer ? mesh.userData : mesh.parent?.userData) as Record<string, unknown>;
    const color = new THREE.Color(String(extras.color));
    const baseOpacity = Number(extras.opacity ?? 1);
    mesh.geometry.computeVertexNormals();
    mesh.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0,
      side: THREE.DoubleSide,
      clippingPlanes: [plane],
      transparent: baseOpacity < 1,
      opacity: baseOpacity,
      depthWrite: baseOpacity >= 1,
    });
    mesh.renderOrder = 1000;

    // Stencil passes count how many surfaces lie behind the cut plane; where the count is odd
    // the plane is inside this structure, so its cap is drawn there.
    const stencilBase = {
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
      clippingPlanes: [plane],
    };
    const back = new THREE.MeshBasicMaterial({
      ...stencilBase,
      side: THREE.BackSide,
      stencilFail: THREE.IncrementWrapStencilOp,
      stencilZFail: THREE.IncrementWrapStencilOp,
      stencilZPass: THREE.IncrementWrapStencilOp,
    });
    const front = new THREE.MeshBasicMaterial({
      ...stencilBase,
      side: THREE.FrontSide,
      stencilFail: THREE.DecrementWrapStencilOp,
      stencilZFail: THREE.DecrementWrapStencilOp,
      stencilZPass: THREE.DecrementWrapStencilOp,
    });
    const stencil = new THREE.Group();
    for (const m of [back, front]) {
      const s = new THREE.Mesh(mesh.geometry, m);
      s.renderOrder = order;
      s.matrixAutoUpdate = false;
      stencil.add(s);
    }
    const cap = new THREE.Mesh(
      capGeometry,
      new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: baseOpacity < 1,
        opacity: baseOpacity,
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
      }),
    );
    cap.renderOrder = order + 0.5;
    cap.onAfterRender = (r) => r.clearStencil();
    order += 1;

    parts.push({
      mesh,
      name: mesh.name,
      partId: (extras.part as string | null) ?? null,
      layer: extras.layer as LayerId,
      conditions: (extras.conditions as string[] | null) ?? null,
      baseOpacity,
      ghost: extras.layer === 'skin',
      opacity: baseOpacity,
      zMin: 0,
      zMax: 0,
      stencil,
      cap,
    });
  });
  scene.add(gltf.scene);
  for (const p of parts) {
    // Stencil meshes follow the model's transform.
    p.mesh.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(p.mesh);
    p.zMin = box.min.z;
    p.zMax = box.max.z;
    p.stencil.children.forEach((c) => c.matrix.copy(p.mesh.matrixWorld));
    scene.add(p.stencil, p.cap);
  }

  // Midline cut face: the figure itself, drawn without labels.
  const sectionCanvas = document.createElement('canvas');
  sectionCanvas.width = 1440;
  sectionCanvas.height = Math.round((1440 * SECTION_BOX.h) / SECTION_BOX.w);
  const sectionTexture = new THREE.CanvasTexture(sectionCanvas);
  sectionTexture.colorSpace = THREE.SRGBColorSpace;
  sectionTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const section = new THREE.Mesh(
    new THREE.PlaneGeometry(SECTION_BOX.w / FIGURE_UNITS_PER_MM, SECTION_BOX.h / FIGURE_UNITS_PER_MM),
    new THREE.MeshBasicMaterial({ map: sectionTexture, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide }),
  );
  section.position.set(
    (SECTION_BOX.x + SECTION_BOX.w / 2 - ORIGIN.x) / FIGURE_UNITS_PER_MM,
    -(SECTION_BOX.y + SECTION_BOX.h / 2 - ORIGIN.y) / FIGURE_UNITS_PER_MM,
    0.02,
  );
  section.renderOrder = 2000;
  scene.add(section);

  let sectionKey = '';
  let sectionJob = 0;
  async function drawSection(st: ViewState) {
    const layers: Partial<Record<FigureLayer, number>> = {};
    for (const id of ['skin', 'bone', 'brain', 'csf'] as FigureLayer[]) {
      const l = st.layers[id as LayerId];
      layers[id] = l.on ? l.opacity / 100 : 0;
    }
    const key = JSON.stringify([st.condition, st.flow, st.measure, layers, st.part]);
    if (key === sectionKey) return;
    sectionKey = key;
    const job = ++sectionJob;
    const svg = anatomyFigureSvg({ condition: st.condition, flow: st.flow, measure: st.measure, labels: false, layers }, figureStrings)
      .replace('<svg ', `<svg width="${sectionCanvas.width}" height="${sectionCanvas.height}" `);
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    if (job !== sectionJob) return;
    const ctx = sectionCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, sectionCanvas.width, sectionCanvas.height);
    ctx.drawImage(img, 0, 0, sectionCanvas.width, sectionCanvas.height);
    drawHighlight(ctx, st);
    sectionTexture.needsUpdate = true;
    requestRender();
  }

  /** Outline the selected structure on the midline cut face. */
  function drawHighlight(ctx: CanvasRenderingContext2D, st: ViewState) {
    const S = shapes as unknown as Record<string, unknown>;
    const tonsil = (shapes.tonsil as Record<string, string>)[st.condition === 'syrinx' ? 'chiari' : st.condition];
    const csfExtra = st.condition === 'typical' ? ['cisterna'] : st.condition === 'surgery' ? ['surgeryCsf'] : [];
    const byPart: Record<string, unknown[]> = {
      cerebrum: [S.cerebrum], callosum: [S.callosum], cerebellum: [S.cerebellum], ventricle: [S.fourthVentricle],
      brainstem: [S.brainstem], tonsil: [tonsil], cord: [S.cord], c2: [S.dens, S.c2Body, S.spinous2],
      csf: [S.csfAnterior, S.csfPosterior, ...csfExtra.map((k) => S[k])],
    };
    const scale = sectionCanvas.width / SECTION_BOX.w;
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, -SECTION_BOX.x * scale, -SECTION_BOX.y * scale);
    ctx.strokeStyle = '#1F5F8B';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    if (st.part === 'foramen') {
      const [bx, by] = shapes.mcrae.basion, [ox, oy] = shapes.mcrae.opisthion;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(ox, oy);
      ctx.stroke();
    }
    for (const shape of byPart[st.part] ?? []) {
      const path = new Path2D();
      if (typeof shape === 'string') path.addPath(new Path2D(shape));
      else if (shape && typeof shape === 'object' && 'ellipse' in shape) {
        const [cx, cy, rx, ry] = (shape as { ellipse: number[] }).ellipse;
        path.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      } else if (shape && typeof shape === 'object' && 'rect' in shape) {
        const [x, y, w, h, r] = (shape as { rect: number[] }).rect;
        path.roundRect(x, y, w, h, r);
      }
      ctx.stroke(path);
    }
    ctx.restore();
  }

  // Controls: drag to rotate, scroll or pinch to zoom, right-drag / two fingers / Shift-drag to move.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = false;
  controls.minDistance = 250;
  controls.maxDistance = 2000;
  // Only a real turn, zoom or move by the visitor counts as leaving a named camera view (a tap doesn't).
  let userMoving = false;
  controls.addEventListener('start', () => {
    stopTween();
    userMoving = true;
  });
  controls.addEventListener('end', () => (userMoving = false));
  controls.addEventListener('change', () => {
    if (userMoving && store.get().camera !== 'custom') store.set({ camera: 'custom' });
    requestRender();
  });
  // Shift-drag pans (as the Explorer hint says).
  renderer.domElement.addEventListener('pointerdown', (e) => {
    controls.mouseButtons.LEFT = e.shiftKey ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  }, { capture: true });

  host.appendChild(renderer.domElement);

  /** Fit the head to the view from the side. */
  function frame() {
    const w = host.clientWidth, h = host.clientHeight;
    const aspect = w / Math.max(1, h);
    const halfH = 160, halfW = 140; // mm, head and neck with a margin
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(halfH / t, halfW / (t * aspect));
    camera.position.set(TARGET.x, TARGET.y, dist);
    controls.target.copy(TARGET);
    controls.update();
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }

  // ----- Rendering on demand, paused when not visible -----
  let visible = true;
  let pending = false;
  function requestRender() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (visible && !document.hidden) {
        applyOpacity();
        updateLabelSpace();
        renderer.render(scene, camera);
        placeLabels();
      }
    });
  }
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) requestRender();
  }).observe(host);
  document.addEventListener('visibilitychange', () => !document.hidden && requestRender());
  new ResizeObserver(resize).observe(host);

  // ----- Opacity, including the skin fading when the model is turned -----
  const SIDE_VIEW = new THREE.Vector3(0, 0, 1);
  const toCamera = new THREE.Vector3();
  /** 1 within 15 degrees of the side view, fading to 0.3 by 35 degrees. */
  let fadeEnabled = true;
  function skinFade(): number {
    if (!fadeEnabled) return 1;
    toCamera.copy(camera.position).sub(controls.target).normalize();
    const angle = THREE.MathUtils.radToDeg(toCamera.angleTo(SIDE_VIEW));
    return 1 - 0.7 * THREE.MathUtils.clamp((angle - 15) / 20, 0, 1);
  }
  function applyOpacity() {
    const fade = skinFade();
    for (const p of parts) {
      const opacity = p.ghost ? p.opacity * fade : p.opacity;
      const see = opacity < 1;
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      if (mat.transparent !== see) mat.needsUpdate = true;
      mat.opacity = opacity;
      mat.transparent = see;
      mat.depthWrite = !see;
      // A see-through skin shows only its outside, so it doesn't look muddy.
      mat.side = see && p.ghost ? THREE.FrontSide : THREE.DoubleSide;
      const capMat = p.cap.material as THREE.MeshBasicMaterial;
      if (capMat.transparent !== see) capMat.needsUpdate = true;
      capMat.opacity = opacity;
      capMat.transparent = see;
    }
  }

  // ----- Highlight the selected structure in the model -----
  const HIGHLIGHT = new THREE.Color('#1F5F8B');
  function applyHighlight(part: string) {
    for (const p of parts) {
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      const on = p.partId === part && p.name !== 'skull' && p.name !== 'skull-surgery';
      mat.emissive.copy(on ? HIGHLIGHT : new THREE.Color(0x000000));
      mat.emissiveIntensity = on ? 0.45 : 0;
    }
  }

  // ----- Camera presets (glide, or jump in Calm mode) -----
  let tween = 0;
  let goal: [number, number] | null = null;
  function stopTween() {
    if (tween) cancelAnimationFrame(tween);
    tween = 0;
    goal = null;
  }
  /** Current direction, or where the camera is gliding to (so quick key presses add up). */
  function anglesNow(): [number, number] {
    if (goal) return goal;
    toCamera.copy(camera.position).sub(controls.target);
    const d = toCamera.length();
    return [THREE.MathUtils.radToDeg(Math.atan2(toCamera.x, toCamera.z)), THREE.MathUtils.radToDeg(Math.asin(toCamera.y / d))];
  }
  /** Move the camera to a direction (and optionally a distance and target), gliding unless in Calm mode. */
  function moveCamera(az: number, el: number, dist?: number, target?: THREE.Vector3) {
    stopTween();
    const [a0, e0] = anglesNow();
    const d0 = camera.position.distanceTo(controls.target);
    const t0 = controls.target.clone();
    const d1 = dist ?? d0, t1 = target ?? t0;
    goal = [az, el];
    let da = az - a0;
    da = ((da + 540) % 360) - 180; // shortest way round
    const place = (k: number) => {
      const a = THREE.MathUtils.degToRad(a0 + da * k), e = THREE.MathUtils.degToRad(e0 + (el - e0) * k);
      const d = d0 + (d1 - d0) * k;
      controls.target.lerpVectors(t0, t1, k);
      camera.position.set(
        controls.target.x + d * Math.sin(a) * Math.cos(e),
        controls.target.y + d * Math.sin(e),
        controls.target.z + d * Math.cos(a) * Math.cos(e),
      );
      controls.update();
      requestRender();
    };
    if (isCalm()) {
      place(1);
      goal = null;
      return;
    }
    const start = performance.now(), duration = 450;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      place(k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
      tween = k < 1 ? requestAnimationFrame(step) : 0;
      if (k >= 1) goal = null;
    };
    tween = requestAnimationFrame(step);
  }
  function defaultDistance() {
    const w = host.clientWidth, h = host.clientHeight;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(160 / t, 140 / (t * (w / Math.max(1, h))));
  }
  function goToPreset(view: CameraView) {
    if (view === 'custom') return;
    const [az, el] = PRESET_ANGLES[view];
    moveCamera(az, el);
  }
  /** Back to the starting view: side, whole head in view. */
  function resetCamera() {
    moveCamera(0, 0, defaultDistance(), TARGET.clone());
    if (store.get().camera !== 'side') store.set({ camera: 'side' });
  }

  // ----- Keyboard: arrows turn, Shift+arrows move, + and - zoom, 1 to 4 presets, 0 resets -----
  host.tabIndex = 0;
  host.addEventListener('keydown', (e) => {
    const [az, el] = anglesNow();
    const dist = camera.position.distanceTo(controls.target);
    const custom = () => store.get().camera !== 'custom' && store.set({ camera: 'custom' });
    const pan = (dx: number, dy: number) => {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0).multiplyScalar(dx);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1).multiplyScalar(dy);
      const t = controls.target.clone().add(right).add(up);
      moveCamera(az, el, dist, t);
    };
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft': e.shiftKey ? pan(-12, 0) : moveCamera(az - 15, el); custom(); break;
      case 'ArrowRight': e.shiftKey ? pan(12, 0) : moveCamera(az + 15, el); custom(); break;
      case 'ArrowUp': e.shiftKey ? pan(0, 12) : moveCamera(az, Math.min(85, el + 15)); custom(); break;
      case 'ArrowDown': e.shiftKey ? pan(0, -12) : moveCamera(az, Math.max(-85, el - 15)); custom(); break;
      case '+': case '=': moveCamera(az, el, Math.max(controls.minDistance, dist * 0.85)); break;
      case '-': case '_': moveCamera(az, el, Math.min(controls.maxDistance, dist / 0.85)); break;
      case '1': store.set({ camera: 'side' }); break;
      case '2': store.set({ camera: 'back' }); break;
      case '3': store.set({ camera: 'below' }); break;
      case '4': store.set({ camera: 'front' }); break;
      case '0': case 'Home': resetCamera(); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  // ----- Tap or click a structure to select it -----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  // Inner structures first, so tapping the tonsil picks the tonsil rather than the cerebellum around it.
  const PRIORITY = ['tonsil', 'ventricle', 'callosum', 'cord', 'brainstem', 'c2', 'cerebellum', 'cerebrum', 'csf', 'foramen'];
  function contains(mesh: THREE.Mesh, point: THREE.Vector3): boolean {
    const r = new THREE.Raycaster(point, new THREE.Vector3(1, 0.013, 0.007).normalize());
    return r.intersectObject(mesh, false).length % 2 === 1;
  }
  function pick(clientX: number, clientY: number): string | null {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const depth = plane.constant;
    const shown = parts.filter((p) => p.mesh.visible);
    const fade = skinFade();
    const cutFace = new THREE.Vector3();
    const facesCut = camera.position.z > depth && raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -depth), cutFace);
    const cutDistance = facesCut ? raycaster.ray.origin.distanceTo(cutFace) : Infinity;
    for (const hit of raycaster.intersectObjects(shown.map((p) => p.mesh), false)) {
      if (hit.point.z > depth + 0.05) continue; // cut away
      if (hit.distance > cutDistance) break; // the ray reached the cut face first
      const p = parts.find((q) => q.mesh === hit.object)!;
      const opacity = p.ghost ? p.opacity * fade : p.opacity;
      if (opacity < 0.5) continue; // see-through: look past it
      if (p.partId === 'foramen' && hit.point.length() > 25) return null; // skull, away from the opening
      return p.partId;
    }
    if (!facesCut) return null;
    // On a cut face: which structures contain that point? Pick the innermost.
    cutFace.z = depth - 0.05;
    const inside = new Set(shown.filter((p) => p.partId && contains(p.mesh, cutFace)).map((p) => p.partId!));
    if (inside.has('foramen') && cutFace.length() > 25) inside.delete('foramen');
    return PRIORITY.find((id) => inside.has(id)) ?? null;
  }
  let downAt: { x: number; y: number; t: number } | null = null;
  renderer.domElement.addEventListener('pointerdown', (e) => (downAt = { x: e.clientX, y: e.clientY, t: performance.now() }));
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const tap = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6 && performance.now() - downAt.t < 600;
    downAt = null;
    if (!tap) return;
    const part = pick(e.clientX, e.clientY);
    if (part) options.onPick?.(part);
  });

  // ----- Labels: a column beside the model, with lines to each structure -----
  const labelsHost = options.labelsHost ?? null;
  const labelEls = new Map<string, { button: HTMLButtonElement; line: SVGLineElement; def: LabelDef }>();
  let labelSvg: SVGSVGElement | null = null;
  if (labelsHost && options.labels) {
    labelSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    labelSvg.setAttribute('aria-hidden', 'true');
    labelSvg.classList.add('x-label-lines');
    labelsHost.appendChild(labelSvg);
    for (const def of options.labels) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'x-label';
      button.dataset.labelPart = def.part;
      const num = document.createElement('span');
      num.className = 'x-label-num';
      num.textContent = def.num;
      button.append(num, document.createTextNode(def.name));
      button.addEventListener('click', () => options.onPick?.(def.part));
      labelsHost.appendChild(button);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      labelSvg.appendChild(line);
      labelEls.set(def.part, { button, line, def });
    }
  }
  const anchorV = new THREE.Vector3();
  /** When labels are showing, shift the picture left so the label column doesn't cover the head. */
  const LABEL_SPACE = 236; // px
  function updateLabelSpace() {
    const showing = !!labelsHost && !labelsHost.hidden && labelsHost.offsetParent !== null;
    const w = host.clientWidth || 1;
    // Shift the picture left by half the label column: film offset = 2 * shift / width * film width * tan(fov / 2) * aspect.
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const offset = showing ? ((2 * (LABEL_SPACE / 2)) / w) * camera.getFilmWidth() * tan * camera.aspect : 0;
    // ...and zoom out just enough for the head to fit in the space that's left.
    const zoom = showing ? Math.min(1, (w - LABEL_SPACE) / (w * 0.93)) : 1;
    if (camera.filmOffset !== offset || camera.zoom !== zoom) {
      camera.filmOffset = offset;
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }
  function placeLabels() {
    if (!labelsHost || !labelSvg || labelsHost.hidden) return;
    const st = store.get();
    const w = host.clientWidth, h = host.clientHeight;
    labelSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const shownDefs = [...labelEls.values()].filter(({ def }) => st.layers[def.layer].on);
    const top = 76, bottom = h - 56;
    const gap = shownDefs.length > 1 ? Math.min(40, (bottom - top) / (shownDefs.length - 1)) : 0;
    let row = 0;
    for (const { button, line, def } of labelEls.values()) {
      const on = shownDefs.some((d) => d.def === def);
      button.hidden = !on;
      line.style.display = on ? '' : 'none';
      if (!on) continue;
      const y = top + gap * row++;
      button.style.top = `${y}px`;
      button.classList.toggle('is-selected', def.part === st.part);
      const [fx, fy] = def.part === 'tonsil' ? labelAnchor('tonsil', st.condition) : def.anchor;
      anchorV.set((fx - ORIGIN.x) / FIGURE_UNITS_PER_MM, -(fy - ORIGIN.y) / FIGURE_UNITS_PER_MM, 0).project(camera);
      const ax = ((anchorV.x + 1) / 2) * w, ay = ((1 - anchorV.y) / 2) * h;
      const labelX = w - 216;
      const visibleAnchor = anchorV.z < 1 && ax > 0 && ax < labelX && ay > 0 && ay < h;
      line.style.display = visibleAnchor ? '' : 'none';
      line.setAttribute('x1', String(labelX - 6));
      line.setAttribute('y1', String(y + 14));
      line.setAttribute('x2', String(ax));
      line.setAttribute('y2', String(ay));
    }
  }

  // ----- Apply the view state -----
  let lastCamera: CameraView = store.get().camera;
  let lastPart = '';
  function apply(st: ViewState) {
    const depth = cutDepth(st.cut);
    plane.constant = depth;
    const midline = depth === 0;
    for (const p of parts) {
      const layer = st.layers[p.layer];
      const shown = layer.on && (!p.conditions || p.conditions.includes(st.condition));
      const opacity = p.baseOpacity * (layer.opacity / 100);
      p.opacity = opacity;
      p.mesh.visible = shown && opacity > 0;
      // Cut faces are only needed where the cut actually passes through this structure.
      const cutsThrough = !midline && depth > p.zMin && depth < p.zMax;
      p.stencil.visible = p.mesh.visible && cutsThrough;
      p.cap.visible = p.mesh.visible && cutsThrough;
      p.cap.position.set(TARGET.x, TARGET.y, depth);
    }
    section.visible = midline;
    if (midline) void drawSection(st);
    if (st.part !== lastPart) {
      lastPart = st.part;
      applyHighlight(st.part);
    }
    if (st.camera !== lastCamera) {
      lastCamera = st.camera;
      goToPreset(st.camera);
    }
    if (labelsHost) labelsHost.hidden = !st.labels;
    requestRender();
  }
  store.subscribe(apply);

  resize();
  frame();
  requestRender();

  /** Look from a direction: azimuth 0 = side (default), 90 = back, -90 = front; elevation in degrees. */
  function look(azimuth: number, elevation = 0) {
    const dist = camera.position.distanceTo(controls.target);
    const a = THREE.MathUtils.degToRad(azimuth), e = THREE.MathUtils.degToRad(elevation);
    camera.position.set(
      controls.target.x + dist * Math.sin(a) * Math.cos(e),
      controls.target.y + dist * Math.sin(e),
      controls.target.z + dist * Math.cos(a) * Math.cos(e),
    );
    controls.update();
    requestRender();
  }
  // Camera helpers on the element, used by tests (and the camera buttons in step 6).
  (host as HTMLElement & { viewer?: unknown }).viewer = {
    look,
    reset: frame,
    /** For screenshots of the head's shape: keep the skin solid when turned. */
    setSkinFade(on: boolean) {
      fadeEnabled = on;
      requestRender();
    },
  };

  return {
    renderer,
    look,
    reset: resetCamera,
    pick,
    /** For tests and the screen reader text. */
    get partCount() {
      return parts.length;
    },
  };
}
