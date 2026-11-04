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
import type { Store, ViewState, LayerId } from './state';
import { anatomyFigureSvg, type FigureStrings, type FigureLayer } from '../lib/anatomy-figure';

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

export async function createViewer(host: HTMLElement, store: Store, figureStrings: FigureStrings) {
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
    const key = JSON.stringify([st.condition, st.flow, st.measure, layers]);
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
    sectionTexture.needsUpdate = true;
    requestRender();
  }

  // Controls: drag to rotate, scroll or pinch to zoom, right-drag / two fingers / Shift-drag to move.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(TARGET);
  controls.enableDamping = false;
  controls.minDistance = 250;
  controls.maxDistance = 2000;
  controls.addEventListener('change', () => requestRender());
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
        renderer.render(scene, camera);
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

  // ----- Apply the view state -----
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
    reset: frame,
    /** For tests and the screen reader text. */
    get partCount() {
      return parts.length;
    },
  };
}
