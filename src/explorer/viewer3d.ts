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
 * - Realistic model (Phase 2, preview only): loaded on request into the same scene, from the URL given in
 *   options.realisticUrl. Its cut faces are the inside of each surface painted flat in the structure's color,
 *   which works even where the atlas surfaces have small gaps. If it can't load, the view goes back to Simple.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { Store, ViewState, LayerId, CameraView } from './state';
import { anatomyFigureSvg, FLOW, type FigureStrings, type FigureLayer } from '../lib/anatomy-figure';
import { isCalm, onCalmChange } from '../lib/calm';
import shapes from '../lib/anatomy-shapes.json';

const MODEL_URL = '/models/simple.glb';
const FIGURE_UNITS_PER_MM = 2;
// Origin of the model: middle of the foramen magnum, in figure units (see build.mjs).
const ORIGIN = { x: 369, y: 444.5 };
// The figure without labels uses this viewBox; the midline cut face covers the same area.
const SECTION_BOX = { x: 60, y: 128, w: 488, h: 512 };
const BACKGROUND = 0x1a1c20; // --x-viewport
// Middle of the head, in mm, where the camera looks.
const TARGET = new THREE.Vector3(-40, 40, 0);

interface Part {
  mesh: THREE.Mesh;
  /** Which model this structure belongs to. */
  model: 'simple' | 'realistic';
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
  /** Only shown in these conditions (part 11: the syrinx, or the bone removed). */
  conditions?: string[];
}

/** Where each structure's label points, in figure units (the figure's own leader-line ends). */
export function labelAnchor(part: string, condition: string): [number, number] {
  const tonsilMid = condition === 'typical' ? 430 : condition === 'surgery' ? 446 : 448;
  const anchors: Record<string, [number, number]> = {
    cerebrum: [262, 262], callosum: [300, 265], cerebellum: [440, 390], ventricle: [360, 394], brainstem: [326, 370],
    tonsil: [386, tonsilMid], foramen: [372, 445], cord: [342, 480], csf: [351, 620], c2: [318, 500],
    syrinx: [337, 585], removed: [420, 440],
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
  /** Where to load the realistic model from, when the visitor picks it (preview builds only). */
  realisticUrl?: () => string;
  /** Called when the realistic model starts or finishes loading, or fails ('loading' | 'ready' | 'failed'). */
  onRealistic?: (status: 'loading' | 'ready' | 'failed') => void;
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

  const timing: Record<string, number> = {};
  let mark = performance.now();
  const lap = (name: string) => {
    const now = performance.now();
    timing[name] = Math.round(now - mark);
    mark = now;
  };
  // Unpack the compressed model on a background thread, so the page stays responsive.
  if (MeshoptDecoder.supported && 'useWorkers' in MeshoptDecoder) MeshoptDecoder.useWorkers(2);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  lap('download and decode');

  const parts: Part[] = [];
  let order = 1;
  const capGeometry = new THREE.PlaneGeometry(400, 400);
  // Set up a few structures at a time and let the page breathe in between (no long freezes).
  const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
  async function addParts(root: THREE.Object3D, model: Part['model']) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
  });
  for (const [i, mesh] of meshes.entries()) {
    if (i % 4 === 3) await breathe();
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
    if (model === 'realistic') {
      // Cut faces: where the cut opens a surface, its inside shows, painted flat in the structure's color.
      // The skin's inside stays solid even when its outside is see-through, so the head's outline shows.
      // Written after the renderer's color conversion, so convert to screen colors here.
      const capColor = color.clone().multiplyScalar(0.92).convertLinearToSRGB();
      const capAlpha = { value: baseOpacity };
      mesh.userData.capAlpha = capAlpha;
      // One pass for both sides, so 'inside' is the real inside even when see-through.
      (mesh.material as THREE.MeshStandardMaterial).forceSinglePass = true;
      (mesh.material as THREE.MeshStandardMaterial).onBeforeCompile = (shader) => {
        shader.uniforms.capColor = { value: capColor };
        shader.uniforms.capAlpha = capAlpha;
        shader.fragmentShader = 'uniform vec3 capColor;\nuniform float capAlpha;\n' + shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          '#include <dithering_fragment>\n  if (!gl_FrontFacing) gl_FragColor = vec4(capColor, capAlpha);',
        );
      };
    }

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
      model,
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
  }
  scene.add(root);
  for (const p of parts) {
    if (p.model !== model) continue;
    // Stencil meshes follow the model's transform.
    p.mesh.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(p.mesh);
    p.zMin = box.min.z;
    p.zMax = box.max.z;
    p.stencil.children.forEach((c) => c.matrix.copy(p.mesh.matrixWorld));
    // The realistic model paints its own cut faces (see above), so it needs no stencil caps.
    if (model === 'simple') scene.add(p.stencil, p.cap);
  }
  }
  await addParts(gltf.scene, 'simple');
  lap('materials and normals');

  // Realistic model: loaded the first time the visitor picks it.
  let realistic: 'none' | 'loading' | 'ready' | 'failed' = 'none';
  async function loadRealistic() {
    if (realistic !== 'none' || !options.realisticUrl) return;
    realistic = 'loading';
    options.onRealistic?.('loading');
    try {
      const g = await loader.loadAsync(options.realisticUrl());
      await addParts(g.scene, 'realistic');
      await renderer.compileAsync(scene, camera);
      realistic = 'ready';
      options.onRealistic?.('ready');
      apply(store.get());
    } catch (error) {
      console.warn('Realistic model unavailable, staying with Simple.', error);
      realistic = 'failed';
      options.onRealistic?.('failed');
      store.set({ model: 'simple' });
    }
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
    const key = JSON.stringify([st.condition, layers, st.part]);
    if (key === sectionKey) return;
    sectionKey = key;
    const job = ++sectionJob;
    const svg = anatomyFigureSvg({ condition: st.condition, flow: false, measure: false, labels: false, layers }, figureStrings)
      .replace('<svg ', `<svg width="${sectionCanvas.width}" height="${sectionCanvas.height}" `);
    const t0 = performance.now();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const t1 = performance.now();
    if (job !== sectionJob) return;
    const ctx = sectionCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, sectionCanvas.width, sectionCanvas.height);
    ctx.drawImage(img, 0, 0, sectionCanvas.width, sectionCanvas.height);
    timing.sectionDecode = Math.round(t1 - t0);
    timing.sectionDraw = Math.round(performance.now() - t1);
    drawHighlight(ctx, st);
    sectionTexture.needsUpdate = true;
    requestRender();
  }

  /** Outline the selected structure on the midline cut face. */
  function drawHighlight(ctx: CanvasRenderingContext2D, st: ViewState) {
    const S = shapes as unknown as Record<string, unknown>;
    const tonsil = (shapes.tonsil as Record<string, string>)[st.condition === 'syrinx' ? 'chiari' : st.condition];
    const back = shapes.csfBack[st.condition === 'syrinx' ? 'chiari' : st.condition];
    const byPart: Record<string, unknown[]> = {
      cerebrum: [S.cerebrum], callosum: [S.callosum], cerebellum: [S.cerebellum], ventricle: [S.fourthVentricle],
      brainstem: [S.brainstem], tonsil: [tonsil], cord: [S.cord], c2: [S.dens, S.c2Body, S.spinous2],
      csf: [S.csfFront, back], syrinx: [S.syrinx], removed: [shapes.boneRemovedSkull.d, S.boneRemovedC1],
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
  const toCamera = new THREE.Vector3();
  /** The skin's surface is always see-through in 3D (Matthew, 2026-11-04): a plain, smooth head that shows
   *  where everything sits without hiding it. Its midline cut face stays solid, like the figure. */
  const SKIN_SEE_THROUGH = 0.35;
  let fadeEnabled = true;
  function skinFade(): number {
    return fadeEnabled ? SKIN_SEE_THROUGH : 1;
  }
  function applyOpacity() {
    const fade = skinFade();
    // The measure marks show through the model only when the midline is exposed (cut there or
    // further) or the skin is faded or off; otherwise they stay inside the head with the anatomy.
    const st = store.get();
    const skin = st.layers.skin;
    const skinOpacity = skin.on ? (skin.opacity / 100) * fade : 0;
    const showThrough = cutDepth(st.cut) <= 0.01 || skinOpacity < 0.6;
    for (const m of measureMats) m.depthTest = !showThrough;
    for (const p of parts) {
      const opacity = p.ghost ? p.opacity * fade : p.opacity;
      const see = opacity < 1;
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      if (mat.transparent !== see) mat.needsUpdate = true;
      mat.opacity = opacity;
      mat.transparent = see;
      mat.depthWrite = !see;
      // A see-through skin shows only its outside, so it doesn't look muddy.
      mat.side = see && p.ghost && p.model === 'simple' ? THREE.FrontSide : THREE.DoubleSide;
      if (p.model === 'realistic') (p.mesh.userData.capAlpha as { value: number }).value = p.ghost ? p.opacity : opacity;
      const capMat = p.cap.material as THREE.MeshBasicMaterial;
      const capOpacity = p.ghost ? p.opacity : opacity;
      const capSee = capOpacity < 1;
      if (capMat.transparent !== capSee) capMat.needsUpdate = true;
      capMat.opacity = capOpacity;
      capMat.transparent = capSee;
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
    const shownDefs = [...labelEls.values()].filter(({ def }) => st.layers[def.layer].on && (!def.conditions || def.conditions.includes(st.condition)));
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
      const [fx, fy] = labelAnchor(def.part, st.condition);
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

  // ----- Fluid flow and Measure, drawn in the model -----
  /** A point on the midline, from figure units, just in front of the midline cut face. */
  const fig = (x: number, y: number, z = 0.35) =>
    new THREE.Vector3((x - ORIGIN.x) / FIGURE_UNITS_PER_MM, -(y - ORIGIN.y) / FIGURE_UNITS_PER_MM, z);
  /** A thin bar between two points (used for chevrons, marks, lines). */
  function bar(a: THREE.Vector3, b: THREE.Vector3, width: number, material: THREE.Material) {
    const length = a.distanceTo(b);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, width, 0.3), material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.rotation.z = Math.atan2(b.y - a.y, b.x - a.x);
    return mesh;
  }
  const FLOW_BLUE = '#1F5F8B';
  const RESTRICTED = '#9A3412';
  // Flow marks sit just in front of the cut face, so they get their own cut, 1 mm further out.
  const overlayPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1);
  // (Marked see-through so they're drawn after the cut face, in the order set below.)
  const flowMat = new THREE.MeshBasicMaterial({ color: FLOW_BLUE, clippingPlanes: [overlayPlane], transparent: true });
  const restrictedMat = new THREE.MeshBasicMaterial({ color: RESTRICTED, clippingPlanes: [overlayPlane], transparent: true });
  /** A downward chevron (as in the figure: 5 mm wide, 3 mm tall), centred on the origin. */
  function chevron() {
    const g = new THREE.Group();
    g.add(bar(new THREE.Vector3(-2.5, 1.5, 0), new THREE.Vector3(0, -1.5, 0), 1, flowMat));
    g.add(bar(new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(2.5, 1.5, 0), 1, flowMat));
    return g;
  }
  // Chevron positions and the restricted-flow marks are the figure's own (src/lib/anatomy-figure.ts).
  const FLOW_OPEN: [number, number, number][] = [...FLOW.front.map(([x, y]): [number, number, number] => [x, y, 2.5]), ...FLOW.backOpen];
  const FLOW_BLOCKED: [number, number, number][] = [...FLOW.front.map(([x, y]): [number, number, number] => [x, y, 2.5]), ...FLOW.backBlocked];
  const RESTRICTED_MARKS: [number, number, number, number][] = [[390, 440, 398, 434], [390, 448, 398, 442], [390, 456, 398, 450]];
  const flowGroup = new THREE.Group();
  flowGroup.renderOrder = 2500;
  scene.add(flowGroup);
  /** Each chevron with its resting place and how far it moves with each heartbeat (mm). */
  let chevrons: { obj: THREE.Object3D; base: THREE.Vector3; amp: number }[] = [];
  let flowCondition = '';
  function buildFlow(condition: string) {
    if (condition === flowCondition) return;
    flowCondition = condition;
    flowGroup.clear();
    chevrons = [];
    const blocked = condition === 'chiari' || condition === 'syrinx';
    for (const [x, y, w] of blocked ? FLOW_BLOCKED : FLOW_OPEN) {
      const obj = chevron();
      // Narrow chevrons where the neck canal is narrow (the figure's half-width, in figure units).
      obj.scale.setScalar(w / 5);
      const base = fig(x, y);
      obj.position.copy(base);
      // Behind the cord in Chiari views, below the tonsils, fluid barely moves (restricted); elsewhere it moves freely.
      const restrictedHere = blocked && x > 345;
      chevrons.push({ obj, base, amp: restrictedHere ? 0.8 : 3 });
      obj.traverse((m) => (m.renderOrder = 2500));
      flowGroup.add(obj);
    }
    if (blocked)
      for (const [x1, y1, x2, y2] of RESTRICTED_MARKS) {
        const mark = bar(fig(x1, y1), fig(x2, y2), 1, restrictedMat);
        mark.renderOrder = 2500;
        flowGroup.add(mark);
      }
  }
  /** Heartbeat-like motion, about 72 beats a minute: a quick push down, then a slower return. */
  const BEAT = 60 / 72;
  function heartbeat(seconds: number) {
    const p = (seconds % BEAT) / BEAT;
    return p < 0.3 ? Math.sin((p / 0.3) * (Math.PI / 2)) : 0.5 + 0.5 * Math.cos(((p - 0.3) / 0.7) * Math.PI);
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stillOnly = () => isCalm() || reducedMotion.matches;
  function placeFlow(seconds: number | null) {
    const w = seconds === null ? 0.5 : heartbeat(seconds);
    for (const c of chevrons) c.obj.position.set(c.base.x, c.base.y - c.amp * (w - 0.5), c.base.z);
    flowMat.opacity = seconds === null ? 1 : 0.65 + 0.35 * w;
  }
  let flowLoop = 0;
  let lastFlowFrame = 0;
  function startFlowLoop() {
    if (flowLoop) return;
    const tick = (now: number) => {
      flowLoop = 0;
      const st = store.get();
      if (!st.flow || stillOnly() || !flowGroup.visible) {
        placeFlow(null);
        requestRender();
        return;
      }
      // About 30 frames a second is plenty for a gentle pulse, and easier on phone batteries.
      if (visible && !document.hidden && now - lastFlowFrame > 30) {
        lastFlowFrame = now;
        placeFlow(now / 1000);
        requestRender();
      }
      flowLoop = requestAnimationFrame(tick);
    };
    flowLoop = requestAnimationFrame(tick);
  }

  // Measure: the McRae line (basion to opisthion) and the bracket down to the lowest tonsil tip.
  // Drawn on top of the model so it stays visible when the model is turned.
  const measureGroup = new THREE.Group();
  scene.add(measureGroup);
  const inkMat = new THREE.MeshBasicMaterial({ color: '#1C1D21', depthTest: false, depthWrite: false, transparent: true });
  const bracketMat = new THREE.MeshBasicMaterial({ color: FLOW_BLUE, depthTest: false, depthWrite: false, transparent: true });
  const measureMats = [inkMat, bracketMat];
  let measureCondition = '';
  function buildMeasure(condition: string) {
    if (condition === measureCondition) return;
    measureCondition = condition;
    measureGroup.clear();
    const [bx, by] = shapes.mcrae.basion, [ox, oy] = shapes.mcrae.opisthion;
    const b = fig(bx, by, 0.5), o = fig(ox, oy, 0.5);
    // Dashed line: 2 mm dashes, 1.5 mm gaps (the figure's dash pattern).
    const total = b.distanceTo(o);
    for (let d = 0; d < total; d += 3.5) {
      const a = b.clone().lerp(o, d / total), e = b.clone().lerp(o, Math.min(total, d + 2) / total);
      measureGroup.add(bar(a, e, 0.65, inkMat));
    }
    for (const p of [b, o]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 12), inkMat);
      dot.position.copy(p);
      measureGroup.add(dot);
    }
    const tip = condition === 'typical' ? null : condition === 'surgery' ? 467 : 471;
    if (tip !== null) {
      // Starts on the McRae line at x = 368 (y 444.4), ends at the tonsil tip.
      measureGroup.add(bar(fig(368, 444.4, 0.5), fig(368, tip, 0.5), 0.75, bracketMat));
      measureGroup.add(bar(fig(362, tip, 0.5), fig(374, tip, 0.5), 0.75, bracketMat));
    }
    measureGroup.traverse((m) => (m.renderOrder = 3000));
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
      const model = st.model === 'realistic' && realistic === 'ready' ? 'realistic' : 'simple';
      const shown = p.model === model && layer.on && (!p.conditions || p.conditions.includes(st.condition));
      const opacity = p.baseOpacity * (layer.opacity / 100);
      p.opacity = opacity;
      p.mesh.visible = shown && opacity > 0;
      // Cut faces are only needed where the cut actually passes through this structure.
      const cutsThrough = p.model === 'simple' && !midline && depth > p.zMin && depth < p.zMax;
      p.stencil.visible = p.mesh.visible && cutsThrough;
      p.cap.visible = p.mesh.visible && cutsThrough;
      p.cap.position.set(TARGET.x, TARGET.y, depth);
    }
    // The figure on the midline cut face belongs to the Simple model.
    const simpleShown = !(st.model === 'realistic' && realistic === 'ready');
    if (st.model === 'realistic') void loadRealistic();
    section.visible = midline && simpleShown;
    if (section.visible) void drawSection(st);
    if (st.part !== lastPart) {
      lastPart = st.part;
      applyHighlight(st.part);
    }
    if (st.camera !== lastCamera) {
      lastCamera = st.camera;
      goToPreset(st.camera);
    }
    if (labelsHost) labelsHost.hidden = !st.labels;
    overlayPlane.constant = cutDepth(st.cut) + 1;
    buildFlow(st.condition);
    // Flow marks follow the Simple figure's fluid spaces; not shown on the realistic model yet.
    flowGroup.visible = st.flow && st.layers.csf.on && simpleShown;
    if (flowGroup.visible && !stillOnly()) startFlowLoop();
    else {
      // Stop right away (not on the next frame), so turning flow off or Calm mode on takes effect at once.
      if (flowLoop) cancelAnimationFrame(flowLoop);
      flowLoop = 0;
      placeFlow(null);
    }
    buildMeasure(st.condition);
    measureGroup.visible = st.measure;
    requestRender();
  }
  store.subscribe(apply);
  // Calm mode or the system's reduced-motion setting can change while the page is open.
  onCalmChange(() => apply(store.get()));
  reducedMotion.addEventListener('change', () => apply(store.get()));

  resize();
  frame();
  lap('set up');
  // Prepare the graphics programs in the background where the browser supports it.
  section.visible = true;
  await renderer.compileAsync(scene, camera);
  lap('prepare graphics');
  apply(store.get());
  renderer.render(scene, camera);
  lap('first frame');
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
    /** For tests: camera distance from its target, and the target itself (mm). */
    cameraState() {
      return { distance: camera.position.distanceTo(controls.target), target: controls.target.toArray() };
    },
    /** For performance checks: how long each setup stage took (ms). */
    timing,
    /** For performance checks: what the last frame drew. */
    stats() {
      const r = renderer.info.render;
      return { triangles: r.triangles, drawCalls: r.calls, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures };
    },
    /** For tests: whether the fluid flow is animating right now. */
    get flowAnimating() {
      return flowLoop !== 0;
    },
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
