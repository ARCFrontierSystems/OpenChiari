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
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Store, ViewState, LayerId, CameraView, CutPlane } from './state';
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
  box: THREE.Box3;
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
  close: [28, -12],
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
  // Past the midline it goes up to 30 mm toward the far side (60 mm left only a sliver of the head).
  return slider < 50 ? ((50 - slider) / 50) * 100 : -((slider - 50) / 50) * 30;
}

export interface ViewerOptions {
  /** Container for the 3D labels (positioned over the view). */
  labelsHost?: HTMLElement | null;
  /** Space kept clear above and below the label column (px). The Explorer keeps room for its toolbar and captions. */
  labelMargins?: { top: number; bottom: number };
  labels?: LabelDef[];
  /** Called when the visitor taps a structure in the model. */
  onPick?: (part: string) => void;
  /** Where to load the realistic model from, when the visitor picks it (preview builds only). */
  realisticUrl?: () => string;
  /** Called when the realistic model starts or finishes loading, or fails ('loading' | 'ready' | 'failed'). */
  onRealistic?: (status: 'loading' | 'ready' | 'failed') => void;
  /** Start from this exact camera (an Explain It link): azimuth and elevation in degrees, zoom 1 = whole head. */
  startOrbit?: { az: number; el: number; zoom: number } | null;
  /** false: look only (no turning, zooming, moving or camera keys), for a shared view the sender fixed. */
  interactive?: boolean;
  /** true when the viewer sits inside a page that scrolls (Explain It, embeds): an up-or-down swipe on the model
   *  scrolls the page, and a sideways swipe turns the model. */
  pageScroll?: boolean;
  /** Side by side: called whenever this view's camera moves (turned by hand, a camera button, or a glide). */
  onCameraChange?: (camera: { position: number[]; target: number[] }) => void;
}

export async function createViewer(host: HTMLElement, store: Store, figureStrings: FigureStrings, options: ViewerOptions = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true, powerPreference: 'low-power' });
  // Sharpness: up to 2 device pixels per CSS pixel at rest. On touch screens (phones and tablets) the model is drawn at
  // 1 while a finger is turning or zooming it, which needs far less of the phone's graphics power, then sharp again as
  // soon as the finger lifts.
  let restRatio = Math.min(window.devicePixelRatio, 2);
  let movingRatio = 1;
  const touchScreen = window.matchMedia('(pointer: coarse)').matches;
  renderer.setPixelRatio(restRatio);
  // The realistic model has far more detail to shade than the Simple one, so on touch screens it is drawn a little
  // less sharply: 1.5 at rest and 0.75 while a finger moves it.
  const realisticOnTouch = () => touchScreen && realisticShown();
  function setMoving(moving: boolean) {
    const rest = realisticOnTouch() ? Math.min(restRatio, 1.5) : restRatio;
    const move = realisticOnTouch() ? Math.min(movingRatio, 0.75) : movingRatio;
    const ratio = moving && touchScreen ? Math.min(rest, move) : rest;
    if (renderer.getPixelRatio() !== ratio) {
      renderer.setPixelRatio(ratio);
      requestRender();
    }
  }
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

  // Studio quality (3D roadmap step 1, Nov 5): on computers, the realistic model gets physically based materials lit
  // by a soft studio environment made in the browser (no download), plus a rim light from behind that separates
  // structures from the background and from each other. Phones and tablets keep the lighter matte shading.
  // Only the shading changes: the shapes, and so every measurement, stay exactly the same.
  const studio = !touchScreen;
  let studioEnv: THREE.Texture | null = null;
  if (studio) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const rimLight = new THREE.DirectionalLight(0xfff4ea, 0.55);
    rimLight.position.set(0.5, 0.35, -1);
    camera.add(rimLight);
  }
  /** How shiny each tissue looks (1 = fully matte). Bone and skin are dry; brain is soft; fluid is wet. */
  const ROUGHNESS: Record<string, number> = { skin: 0.9, bone: 0.78, brain: 0.62, csf: 0.3 };

  // Depth range: the camera's near and far limits hug the model (its bounding sphere), so the depth buffer can tell
  // apart surfaces about 1 mm apart, such as the tonsils and the fluid around them, even on devices with a coarse
  // (16-bit) depth buffer. A fixed 10 mm to 3 m range could not.
  const modelBox = new THREE.Box3();
  const modelSphere = new THREE.Sphere();
  function fitDepthRange() {
    if (modelBox.isEmpty()) return;
    modelBox.getBoundingSphere(modelSphere);
    const d = camera.position.distanceTo(modelSphere.center);
    const near = Math.max(5, d - modelSphere.radius - 10);
    const far = d + modelSphere.radius + 10;
    if (Math.abs(camera.near - near) > 0.5 || Math.abs(camera.far - far) > 0.5) {
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }

  // Keeps z <= depth. The plane faces the default (side) camera.
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  // The cut frame (Nov 5, coronal and axial cuts): the axis points toward the part that is cut away; points with
  // axis . p <= cutD are kept. Side to side: +z (the near half). Front to back: +x (the back of the head is removed and
  // the view is from behind). Across: -y (everything below is removed and the view is from below, as MRI shows it).
  const cutAxis = new THREE.Vector3(0, 0, 1);
  let cutD = 0;
  const AXES: Record<CutPlane, THREE.Vector3> = { sagittal: new THREE.Vector3(0, 0, 1), coronal: new THREE.Vector3(1, 0, 0), axial: new THREE.Vector3(0, -1, 0) };
  /** Where the cut sits for a plane and slider value: side to side as before; front to back and across, 0 to 100
   *  runs through the head with 50 at the skull opening. */
  function cutFor(planeId: CutPlane, slider: number, condition: string): number {
    if (planeId === 'sagittal') return cutDepth(slider);
    const [fx, fy] = labelAnchor('foramen', condition);
    const x0 = (fx - ORIGIN.x) / FIGURE_UNITS_PER_MM, y0 = -(fy - ORIGIN.y) / FIGURE_UNITS_PER_MM;
    if (planeId === 'coronal') return x0 + (slider - 50) * 1.4;
    return -(y0 + (slider - 50) * 1.6);
  }
  /** The range of axis . p over a box's corners. */
  function axisRange(box: THREE.Box3): [number, number] {
    let lo = Infinity, hi = -Infinity;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const v = cutAxis.x * x + cutAxis.y * y + cutAxis.z * z;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    return [lo, hi];
  }
  const Z_UP = new THREE.Vector3(0, 0, 1);

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
    // The realistic model uses simpler (matte) shading, which costs a phone much less per pixel and looks the same
    // on these non-shiny surfaces; the Simple model keeps its original shading.
    const studioMaterial = model === 'realistic' && studio && studioEnv;
    mesh.material = new (model === 'realistic' && !studioMaterial ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial)({
      // Studio shading reflects more light than the matte one, so its base colors are a little deeper to look the same.
      color: studioMaterial ? color.clone().multiplyScalar(0.8) : color,
      ...(model === 'realistic'
        ? studioMaterial
          ? { roughness: ROUGHNESS[String(extras.layer)] ?? 0.7, metalness: 0, envMap: studioEnv, envMapIntensity: 0.12 }
          : {}
        : { roughness: 0.85, metalness: 0 }),
      side: THREE.DoubleSide,
      clippingPlanes: [plane],
      transparent: baseOpacity < 1,
      opacity: baseOpacity,
      depthWrite: baseOpacity >= 1,
    });
    mesh.renderOrder = 1000;
    // The realistic skin is see-through, but its cut face (its inside) is painted solid as the head's backdrop.
    // Drawn first among the see-through parts, so it never covers the fluid or other see-through parts in front of it.
    if (model === 'realistic' && extras.layer === 'skin') mesh.renderOrder = 999;
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
      box: new THREE.Box3(),
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
    p.box.copy(box);
    modelBox.union(box);
    p.stencil.children.forEach((c) => c.matrix.copy(p.mesh.matrixWorld));
    // The realistic model paints its own cut faces (see above), so it needs no stencil caps.
    if (model === 'simple') scene.add(p.stencil, p.cap);
  }
  }
  await addParts(gltf.scene, 'simple');
  lap('materials and normals');

  // Realistic model: loaded the first time the visitor picks it.
  let realistic: 'none' | 'loading' | 'ready' | 'failed' = 'none';
  /** The realistic model's own McRae line and tonsil tips (model mm), saved in its file by model/realistic/web.mjs. */
  interface RealisticLandmarks {
    mcrae: { basion: number[]; opisthion: number[] };
    tonsilTip: Record<string, number[]>;
    /** Where each label points on the midline cut, per view (model mm), from the model itself. */
    labels?: Record<string, Record<string, number[]>>;
    /** Flow marks per view: chevrons [x, y, width, moves freely 1 / barely 0] and restricted marks [x1, y1, x2, y2] (mm). */
    flow?: Record<string, { chevrons: number[][]; marks: number[][] }>;
  }
  let realisticLandmarks: RealisticLandmarks | null = null;
  /** Whether the realistic model is what's on screen now. */
  const realisticShown = () => store.get().model === 'realistic' && realistic === 'ready';
  async function loadRealistic() {
    if (realistic !== 'none' || !options.realisticUrl) return;
    realistic = 'loading';
    options.onRealistic?.('loading');
    try {
      const g = await loader.loadAsync(options.realisticUrl());
      realisticLandmarks = (g.scene.userData as RealisticLandmarks).mcrae ? (g.scene.userData as RealisticLandmarks) : null;
      await addParts(g.scene, 'realistic');
      await renderer.compileAsync(scene, camera);
      realistic = 'ready';
      options.onRealistic?.('ready');
      setMoving(false);
      // The structure picked before the model arrived gets its highlight on the new parts too.
      applyHighlight(store.get().part);
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

  // "What happens in surgery": the After decompression view drawn part way through (null = the finished view).
  // Stages: 0 before surgery, 1 incision, 2 bone removed, 3 patch, 4 the result (src/lib/anatomy-figure.ts).
  let surgeryStage: number | null = null;
  const STAGE_PARTS: Record<string, (s: number) => boolean> = {
    skull: (s) => s < 2, 'skull-surgery': (s) => s >= 2, 'bone-removed': (s) => s >= 2,
    c1: (s) => s < 2, 'c1-surgery': (s) => s >= 2, 'dural-patch': (s) => s >= 3,
    'tonsil-chiari': (s) => s < 4, 'tonsil-surgery': (s) => s >= 4,
    'csf-chiari': (s) => s < 4, 'csf-surgery': (s) => s >= 4,
  };
  // Moving from one stage to the next, the parts that change fade over FADE_MS (none in Calm mode): video-like.
  const FADE_MS = 1100;
  let stageFade: { start: number; fadeIn: Set<string>; fadeOut: Set<string> } | null = null;
  const fadeProgress = () => (stageFade ? Math.min(1, (performance.now() - stageFade.start) / FADE_MS) : 1);
  /** How much of a structure shows while a stage change fades in or out (1 = fully). */
  function stageMix(name: string): number {
    if (!stageFade) return 1;
    const t = fadeProgress();
    const eased = t * t * (3 - 2 * t);
    return stageFade.fadeIn.has(name) ? eased : stageFade.fadeOut.has(name) ? 1 - eased : 1;
  }
  /** Whether a structure belongs in the view: its condition, or, part way through surgery, its stage. */
  function inView(p: { name: string; conditions: string[] | null }, condition: string): boolean {
    if (surgeryStage !== null && condition === 'surgery' && p.name in STAGE_PARTS) return STAGE_PARTS[p.name](surgeryStage);
    return !p.conditions || p.conditions.includes(condition);
  }

  let sectionKey = '';
  let sectionJob = 0;
  // The surgery stage the cut face shows (undefined until first drawn), so a new stage can fade in over it.
  let sectionStage: number | null | undefined;
  async function drawSection(st: ViewState) {
    const layers: Partial<Record<FigureLayer, number>> = {};
    for (const id of ['skin', 'bone', 'brain', 'csf'] as FigureLayer[]) {
      const l = st.layers[id as LayerId];
      layers[id] = l.on ? l.opacity / 100 : 0;
    }
    const key = JSON.stringify([st.condition, layers, st.part, surgeryStage]);
    if (key === sectionKey) return;
    sectionKey = key;
    const job = ++sectionJob;
    const svg = anatomyFigureSvg({ condition: st.condition, flow: false, measure: false, labels: false, layers, surgeryStage: surgeryStage ?? undefined }, figureStrings)
      .replace('<svg ', `<svg width="${sectionCanvas.width}" height="${sectionCanvas.height}" `);
    const t0 = performance.now();
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const t1 = performance.now();
    if (job !== sectionJob) return;
    const ctx = sectionCanvas.getContext('2d')!;
    // A new surgery stage fades in over the last one (not in Calm mode).
    if (stageFade && surgeryStage !== null && sectionStage !== surgeryStage && sectionStage !== undefined) {
      const before = document.createElement('canvas');
      before.width = sectionCanvas.width;
      before.height = sectionCanvas.height;
      before.getContext('2d')!.drawImage(sectionCanvas, 0, 0);
      sectionStage = surgeryStage;
      const fadeStart = performance.now();
      await new Promise<void>((done) => {
        const step = () => {
          if (job !== sectionJob) return done();
          const t = Math.min(1, (performance.now() - fadeStart) / FADE_MS);
          ctx.clearRect(0, 0, sectionCanvas.width, sectionCanvas.height);
          ctx.globalAlpha = 1;
          ctx.drawImage(before, 0, 0);
          ctx.globalAlpha = t * t * (3 - 2 * t);
          ctx.drawImage(img, 0, 0, sectionCanvas.width, sectionCanvas.height);
          ctx.globalAlpha = 1;
          sectionTexture.needsUpdate = true;
          requestRender();
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        step();
      });
      if (job !== sectionJob) return;
    }
    sectionStage = surgeryStage;
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
  const interactive = options.interactive !== false;
  controls.enabled = interactive;
  // Phones: a look-only model never takes the finger from the page; in a scrolling page, swiping up or down scrolls.
  // (Set after OrbitControls, which sets its own.)
  renderer.domElement.style.touchAction = !interactive ? 'auto' : options.pageScroll ? 'pan-y' : 'none';
  // Only a real turn, zoom or move by the visitor counts as leaving a named camera view (a tap doesn't).
  let userMoving = false;
  controls.addEventListener('start', () => {
    stopTween();
    userMoving = true;
    setMoving(true);
  });
  controls.addEventListener('end', () => {
    userMoving = false;
    setMoving(false);
  });
  let following = false; // true while copying another view's camera (side by side), so it isn't sent back
  controls.addEventListener('change', () => {
    if (userMoving && store.get().camera !== 'custom') store.set({ camera: 'custom' });
    if (!following) options.onCameraChange?.({ position: camera.position.toArray(), target: controls.target.toArray() });
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

  // The viewer's size, read only when it changes (reading it on every frame makes the browser redo its layout).
  let hostW = host.clientWidth || 1, hostH = host.clientHeight || 1;
  let labelsCssShown = true;
  let labelsWasHidden: boolean | null = null;
  /** Whether the label column is showing: re-measured only when it's switched on or off, or the viewer resizes. */
  function labelsShowing() {
    if (!labelsHost || labelsHost.hidden) {
      labelsWasHidden = true;
      return false;
    }
    if (labelsWasHidden !== false) {
      labelsCssShown = labelsHost.offsetParent !== null;
      labelsWasHidden = false;
    }
    return labelsCssShown;
  }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    hostW = w;
    hostH = h;
    labelsWasHidden = null;
    outlineMaterial.resolution.set(w, h);
    syrinxOutlineMaterial.resolution.set(w, h);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }

  // ----- Speed guard -----
  // If a phone still can't keep up while the model is being turned (slower than about 20 frames a second), it draws
  // a little coarser while moving (0.75) and a little less sharp at rest (1.5), so the model stays smooth. This
  // happens at most once per visit and never steps back up.
  let lastFrame = 0;
  const slowFrames: number[] = [];
  function watchSpeed() {
    const now = performance.now();
    const gap = now - lastFrame;
    lastFrame = now;
    if (!userMoving || !touchScreen || gap > 250) return;
    slowFrames.push(gap);
    if (slowFrames.length < 30) return;
    const sorted = [...slowFrames].sort((a, b) => a - b);
    slowFrames.length = 0;
    // (A little stricter for the realistic model: about 25 frames a second.)
    if (sorted[15] > (realisticShown() ? 40 : 50) && movingRatio === 1) {
      movingRatio = 0.75;
      restRatio = Math.min(restRatio, 1.5);
      setMoving(true);
    }
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
        watchSpeed();
        applyOpacity();
        updateLabelSpace();
        fitDepthRange();
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
  /** Seen edge-on to the cut (from the back, front or below), the skull hides everything the cut shows, so it
   *  fades like the skin; seen from the side, where the cut faces the camera, it stays solid. */
  const viewDir = new THREE.Vector3();
  function boneFade(): number {
    if (!fadeEnabled) return 1;
    camera.getWorldDirection(viewDir);
    const facing = Math.abs(viewDir.z); // 1 = looking straight at the cut face, 0 = edge-on
    const t = THREE.MathUtils.clamp((facing - 0.35) / 0.35, 0, 1);
    // The skull has several surfaces one behind the other, so it fades further than the skin. After surgery it fades
    // less, so the gap where bone was removed stays readable.
    const EDGE_ON = store.get().condition === 'surgery' ? 0.45 : 0.12;
    return EDGE_ON + (1 - EDGE_ON) * t;
  }
  /** How see-through a structure is drawn right now. */
  function drawnOpacity(p: { ghost: boolean; layer: LayerId; opacity: number; partId: string | null }, fade: number, bone: number): number {
    // The "bone removed" marking (after surgery) never fades: it is what that view is there to show.
    return p.ghost ? p.opacity * fade : p.layer === 'bone' && p.partId !== 'removed' ? p.opacity * bone : p.opacity;
  }
  function applyOpacity() {
    const fade = skinFade();
    const bone = boneFade();
    // The measure marks show through the model only when the midline is exposed (cut there or
    // further) or the skin is faded or off; otherwise they stay inside the head with the anatomy.
    const st = store.get();
    const skin = st.layers.skin;
    const skinOpacity = skin.on ? (skin.opacity / 100) * fade : 0;
    const showThrough = (st.plane === 'sagittal' && cutDepth(st.cut) <= 0.01) || skinOpacity < 0.6;
    for (const m of measureMats) m.depthTest = !showThrough;
    for (const p of parts) {
      const opacity = drawnOpacity(p, fade, bone) * stageMix(p.name);
      const see = opacity < 1;
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      if (mat.transparent !== see) mat.needsUpdate = true;
      mat.opacity = opacity;
      mat.transparent = see;
      mat.depthWrite = !see;
      // A see-through skin shows only its outside, so it doesn't look muddy.
      mat.side = see && (p.ghost || p.layer === 'bone') && p.model === 'simple' ? THREE.FrontSide : THREE.DoubleSide;
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
  // The site's highlight blue (--accent). The surface glows blue. On the realistic model, whose structures sit behind
  // and inside one another, the selected one is also laid over the view as an even blue shape, so its whole outline
  // shows even where other structures cover it, with a light line where the cut passes through it.
  const HIGHLIGHT = new THREE.Color('#1F5F8B');
  const OUTLINE = new THREE.Color('#ECEAE4'); // --x-text
  const BLACK = new THREE.Color(0x000000);
  let highlighted = '';
  function isSelected(p: Part, part: string) {
    return p.partId === part && p.name !== 'skull' && p.name !== 'skull-surgery';
  }
  // Each pixel of the blue shape is drawn once (the stencil marks it), so folds don't make it patchy.
  const overlayMaterial = new THREE.MeshBasicMaterial({
    color: HIGHLIGHT,
    transparent: true,
    opacity: 0.55,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    clippingPlanes: [plane],
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: THREE.NotEqualStencilFunc,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  const overlays: THREE.Mesh[] = [];
  function applyHighlight(part: string) {
    highlighted = part;
    for (const o of overlays.splice(0)) o.removeFromParent();
    for (const p of parts) {
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      const on = isSelected(p, part);
      mat.emissive.copy(on ? HIGHLIGHT : BLACK);
      mat.emissiveIntensity = on ? 0.6 : 0;
      if (on && p.model === 'realistic') {
        const o = new THREE.Mesh(p.mesh.geometry, overlayMaterial);
        o.renderOrder = 2800;
        o.onAfterRender = (r) => r.clearStencil();
        p.mesh.add(o);
        overlays.push(o);
      }
    }
    updateOutline();
  }

  // The outline: where the cut plane passes through the selected structure (realistic model only).
  const outlineMaterial = new LineMaterial({ color: OUTLINE.getHex(), linewidth: 2, depthTest: false, transparent: true });
  const outline = new LineSegments2(new LineSegmentsGeometry(), outlineMaterial);
  outline.renderOrder = 2900;
  outline.visible = false;
  outline.frustumCulled = false;
  scene.add(outline);
  // The syrinx always has a dark blue edge where the cut passes through it, as in the Simple model's picture
  // (fill #7FB3D3, edge #3F6F90): its fill is close to the spinal fluid's blue, and without the edge it is easy to miss
  // inside the cord. When the syrinx is the selected part, the light selection outline takes over.
  // Unlike the selection outline, it is hidden behind anything solid in front of it (it is always on, so it must not
  // show through the head when the view is turned).
  const syrinxOutlineMaterial = new LineMaterial({ color: 0x3f6f90, linewidth: 2.5, transparent: true });
  const syrinxOutline = new LineSegments2(new LineSegmentsGeometry(), syrinxOutlineMaterial);
  syrinxOutline.renderOrder = 2850;
  syrinxOutline.visible = false;
  syrinxOutline.frustumCulled = false;
  scene.add(syrinxOutline);
  const triA = new THREE.Vector3(), triB = new THREE.Vector3(), triC = new THREE.Vector3();
  function updateOutline() {
    setLines(outline, cutLines((p) => isSelected(p, highlighted)));
    setLines(syrinxOutline, cutLines((p) => p.partId === 'syrinx' && highlighted !== 'syrinx'));
  }
  function setLines(line: LineSegments2, points: number[]) {
    line.visible = points.length > 0;
    if (line.visible) {
      line.geometry.dispose();
      line.geometry = new LineSegmentsGeometry().setPositions(points);
    }
  }
  /** Where the cut plane passes through the chosen structures of the realistic model, as line pieces. */
  function cutLines(pick: (p: Part) => boolean): number[] {
    const depth = cutD;
    const points: number[] = [];
    if (realisticShown()) {
      for (const p of parts) {
        if (p.model !== 'realistic' || !p.mesh.visible || !pick(p)) continue;
        const pos = p.mesh.geometry.getAttribute('position');
        const index = p.mesh.geometry.getIndex();
        const count = index ? index.count : pos.count;
        p.mesh.updateWorldMatrix(true, false);
        const m = p.mesh.matrixWorld;
        const vert = (i: number, v: THREE.Vector3) => v.fromBufferAttribute(pos, index ? index.getX(i) : i).applyMatrix4(m);
        for (let i = 0; i < count; i += 3) {
          vert(i, triA);
          vert(i + 1, triB);
          vert(i + 2, triC);
          // Where the triangle crosses the cut plane, the crossing is one piece of the outline (lifted 0.2 mm toward
          // the camera so it draws on top of the cut face).
          const cross: THREE.Vector3[] = [];
          for (const [a, b] of [[triA, triB], [triB, triC], [triC, triA]] as const) {
            const da = cutAxis.dot(a) - depth, db = cutAxis.dot(b) - depth;
            if ((da < 0) !== (db < 0)) cross.push(a.clone().lerp(b, da / (da - db)).addScaledVector(cutAxis, 0.2));
          }
          if (cross.length === 2) points.push(cross[0].x, cross[0].y, cross[0].z, cross[1].x, cross[1].y, cross[1].z);
        }
      }
    }
    return points;
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
  /** A structure's anchor point (its label's point on the midline), in model mm. */
  function anchorPoint(part: string) {
    const [fx, fy] = labelAnchor(part, store.get().condition);
    return new THREE.Vector3((fx - ORIGIN.x) / FIGURE_UNITS_PER_MM, -(fy - ORIGIN.y) / FIGURE_UNITS_PER_MM, 0);
  }
  function goToPreset(view: CameraView) {
    if (view === 'custom') return;
    const [az, el] = PRESET_ANGLES[view];
    // The close-up looks at the skull opening from a little behind and below, near enough to see the tonsils clearly.
    if (view === 'close') moveCamera(az, el, defaultDistance() * 0.42, anchorPoint('foramen'));
    else moveCamera(az, el);
  }
  /** Glide to the selected structure and bring it close (or jump, in Calm mode). */
  function focusPart(part: string) {
    const [az, el] = anglesNow();
    moveCamera(az, el, defaultDistance() * 0.5, anchorPoint(part));
    if (store.get().camera !== 'custom') store.set({ camera: 'custom' });
  }
  /** Back to the starting view: side, whole head in view. */
  function resetCamera() {
    moveCamera(0, 0, defaultDistance(), TARGET.clone());
    if (store.get().camera !== 'side') store.set({ camera: 'side' });
  }

  // ----- Keyboard: arrows turn, Shift+arrows move, + and - zoom, 1 to 4 presets, 0 resets -----
  host.tabIndex = interactive ? 0 : -1;
  host.addEventListener('keydown', (e) => {
    if (!interactive) return;
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
      case '5': store.set({ camera: 'close' }); break;
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
    const depth = cutD;
    const shown = parts.filter((p) => p.mesh.visible);
    const fade = skinFade();
    const bone = boneFade();
    const cutFace = new THREE.Vector3();
    const facesCut = cutAxis.dot(camera.position) > depth && raycaster.ray.intersectPlane(new THREE.Plane(cutAxis.clone(), -depth), cutFace);
    const cutDistance = facesCut ? raycaster.ray.origin.distanceTo(cutFace) : Infinity;
    for (const hit of raycaster.intersectObjects(shown.map((p) => p.mesh), false)) {
      if (cutAxis.dot(hit.point) > depth + 0.05) continue; // cut away
      if (hit.distance > cutDistance) break; // the ray reached the cut face first
      const p = parts.find((q) => q.mesh === hit.object)!;
      const opacity = drawnOpacity(p, fade, bone);
      if (opacity < 0.5) continue; // see-through: look past it
      if (p.partId === 'foramen' && hit.point.length() > 25) return null; // skull, away from the opening
      return p.partId;
    }
    if (!facesCut) return null;
    // On a cut face: which structures contain that point? Pick the innermost.
    cutFace.addScaledVector(cutAxis, -0.05);
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
    const showing = labelsShowing();
    const w = hostW;
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
    if (!labelsHost || !labelSvg || !labelsShowing()) return;
    const st = store.get();
    const w = hostW, h = hostH;
    const box = `0 0 ${w} ${h}`;
    if (labelSvg.getAttribute('viewBox') !== box) labelSvg.setAttribute('viewBox', box);
    // Part way through surgery, the "bone removed" label waits until the bone is out.
    const stageHides = (part: string) => surgeryStage !== null && surgeryStage < 2 && part === 'removed';
    const shownDefs = [...labelEls.values()].filter(({ def }) => st.layers[def.layer].on && (!def.conditions || def.conditions.includes(st.condition)) && !stageHides(def.part));
    const top = options.labelMargins?.top ?? 76, bottom = h - (options.labelMargins?.bottom ?? 56);
    const gap = shownDefs.length > 1 ? Math.min(46, (bottom - top) / (shownDefs.length - 1)) : 0;
    let row = 0;
    for (const { button, line, def } of labelEls.values()) {
      const on = shownDefs.some((d) => d.def === def);
      button.hidden = !on;
      line.style.display = on ? '' : 'none';
      if (!on) continue;
      const y = top + gap * row++;
      button.style.top = `${y}px`;
      button.classList.toggle('is-selected', def.part === st.part);
      // On the realistic model, its own anchor (model mm); otherwise the figure's leader-line end.
      const own = realisticShown() ? realisticLandmarks?.labels?.[st.condition]?.[def.part] : undefined;
      if (own) anchorV.set(own[0], own[1], 0).project(camera);
      else {
        const [fx, fy] = labelAnchor(def.part, st.condition);
        anchorV.set((fx - ORIGIN.x) / FIGURE_UNITS_PER_MM, -(fy - ORIGIN.y) / FIGURE_UNITS_PER_MM, 0).project(camera);
      }
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
  function chevron(width = 5, thickness = 1) {
    const g = new THREE.Group();
    const h = (width / 5) * 1.5;
    g.add(bar(new THREE.Vector3(-width / 2, h, 0), new THREE.Vector3(0, -h, 0), thickness, flowMat));
    g.add(bar(new THREE.Vector3(0, -h, 0), new THREE.Vector3(width / 2, h, 0), thickness, flowMat));
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
  function buildFlow(condition: string, lm: RealisticLandmarks | null) {
    const own = lm?.flow?.[condition];
    const key = `${condition}:${own ? 'realistic' : 'simple'}`;
    if (key === flowCondition) return;
    flowCondition = key;
    flowGroup.clear();
    chevrons = [];
    if (own) {
      // Realistic model: marks placed in its own fluid spaces (model/realistic/web.mjs), just in front of the cut.
      for (const [x, y, w, free] of own.chevrons) {
        // sized to the fluid space, with lines a steady 0.8 mm thick so narrow ones stay visible
        const obj = chevron(w, 0.8);
        const base = new THREE.Vector3(x, y, 0.35);
        obj.position.copy(base);
        chevrons.push({ obj, base, amp: free ? 3 : 0.8 });
        obj.traverse((m) => (m.renderOrder = 2500));
        flowGroup.add(obj);
      }
      for (const [x1, y1, x2, y2] of own.marks) {
        const mark = bar(new THREE.Vector3(x1, y1, 0.35), new THREE.Vector3(x2, y2, 0.35), 1, restrictedMat);
        mark.renderOrder = 2500;
        flowGroup.add(mark);
      }
      return;
    }
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
  /** The cough (Matthew approved, 2026-11-05; EVIDENCE.md "Coughing"): the spinal fluid marks move up through the
   *  opening into the head, then ease back to the heartbeat pulse, the same in every view. Nothing else moves. The
   *  size of the movement is drawn to be easy to see, not measured ("Animation simplified"). */
  const COUGH_SECONDS = 2.6, COUGH_UP = 6; // mm
  let coughStart = -1;
  /** 0 at rest, 1 at the top of the cough's push. */
  function coughLift(now: number): number {
    if (coughStart < 0) return 0;
    const t = (now - coughStart) / COUGH_SECONDS;
    if (t >= 1) {
      coughStart = -1;
      return 0;
    }
    return t < 0.25 ? Math.sin((t / 0.25) * (Math.PI / 2)) : 0.5 + 0.5 * Math.cos(((t - 0.25) / 0.75) * Math.PI);
  }
  function placeFlow(seconds: number | null, lift = 0) {
    const w = seconds === null ? 0.5 : heartbeat(seconds);
    for (const c of chevrons) {
      c.obj.position.set(c.base.x, c.base.y - c.amp * (w - 0.5) * (1 - lift) + COUGH_UP * lift, c.base.z);
      // Pointing up while the fluid is pushed up, as in the figure's arrows.
      c.obj.rotation.z = lift > 0.5 ? Math.PI : 0;
    }
    flowMat.opacity = seconds === null ? 1 : 0.65 + 0.35 * w;
  }
  let flowLoop = 0;
  /** 1 = normal, 0.4 = slow, 0 = paused. */
  let flowSpeed = 1;
  let flowClock = performance.now() / 1000;
  let lastFlowFrame = 0;
  let lastPageScroll = -Infinity;
  window.addEventListener('scroll', () => (lastPageScroll = performance.now()), { passive: true, capture: true });
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
      // About 30 frames a second is plenty for a gentle pulse, and easier on phone batteries. The pulse holds
      // still while the page is scrolling, so the phone can give scrolling its full attention.
      if (visible && !document.hidden && now - lastFlowFrame > 30 && now - lastPageScroll > 250) {
        // Flow time runs at the chosen speed (paused = 0), so pausing keeps the marks where they are.
        flowClock += (Math.min(100, now - (lastFlowFrame || now)) / 1000) * flowSpeed;
        lastFlowFrame = now;
        const lift = coughLift(now / 1000);
        placeFlow(flowClock, lift);
        measureGroup.visible = store.get().measure && coughStart < 0; // the bracket is hidden while the cough plays
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
  function buildMeasure(condition: string, lm: RealisticLandmarks | null) {
    const key = condition + (lm ? ' realistic' : ' simple');
    if (key === measureCondition) return;
    measureCondition = key;
    measureGroup.clear();
    const [bx, by] = shapes.mcrae.basion, [ox, oy] = shapes.mcrae.opisthion;
    // On the realistic model, its own McRae line (model mm), just in front of the midline cut.
    const mmPoint = (p: number[]) => new THREE.Vector3(p[0], p[1], 0.5);
    const b = lm ? mmPoint(lm.mcrae.basion) : fig(bx, by, 0.5), o = lm ? mmPoint(lm.mcrae.opisthion) : fig(ox, oy, 0.5);
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
    if (lm && condition !== 'typical') {
      // From the line straight down to the tonsils' lowest point, at the tip's own front-to-back position.
      const t = lm.tonsilTip[condition];
      const d = [o.x - b.x, o.y - b.y], len = Math.hypot(d[0], d[1]);
      const k = ((t[0] - b.x) * d[0] + (t[1] - b.y) * d[1]) / (len * len);
      const top = new THREE.Vector3(b.x + k * d[0], b.y + k * d[1], 0.5), end = new THREE.Vector3(t[0], t[1], 0.5);
      measureGroup.add(bar(top, end, 0.75, bracketMat));
      measureGroup.add(bar(new THREE.Vector3(t[0] - 3, t[1], 0.5), new THREE.Vector3(t[0] + 3, t[1], 0.5), 0.75, bracketMat));
    }
    const tip = lm || condition === 'typical' ? null : condition === 'surgery' ? 467 : 471;
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
  let lastCondition = '';
  /** Switching between conditions: the structures that differ (the tonsils, the fluid behind them, the syrinx) fade
   *  over FADE_MS, so the change reads in place. None in Calm mode or during the surgery play-through. */
  function fadeCondition(before: string, after: string) {
    if (!before || before === after || surgeryStage !== null || stillOnly()) return;
    const was = new Set(parts.filter((p) => inView(p, before)).map((p) => p.name));
    const now = new Set(parts.filter((p) => inView(p, after)).map((p) => p.name));
    stageFade = {
      start: performance.now(),
      fadeIn: new Set([...now].filter((n) => !was.has(n))),
      fadeOut: new Set([...was].filter((n) => !now.has(n))),
    };
    const tick = () => {
      requestRender();
      if (fadeProgress() < 1) requestAnimationFrame(tick);
      else {
        stageFade = null;
        apply(store.get());
      }
    };
    requestAnimationFrame(tick);
  }
  function apply(st: ViewState) {
    setMoving(userMoving); // the resting sharpness depends on which model is showing
    if (st.condition !== lastCondition) {
      fadeCondition(lastCondition, st.condition);
      lastCondition = st.condition;
    }
    cutAxis.copy(AXES[st.plane]);
    cutD = cutFor(st.plane, st.cut, st.condition);
    const depth = cutD;
    plane.normal.copy(cutAxis).negate();
    plane.constant = depth;
    const midline = st.plane === 'sagittal' && depth === 0;
    for (const p of parts) {
      const layer = st.layers[p.layer];
      const model = st.model === 'realistic' && realistic === 'ready' ? 'realistic' : 'simple';
      // Show only / hide the selected structure (the skull counts as bone, never as the selected part).
      const focusOk = st.focus === 'all' || (st.focus === 'only' ? isSelected(p, st.part) : !isSelected(p, st.part));
      // Front and across cuts are for the realistic model only; while it loads, the Simple model isn't shown cut that way.
      const planeOk = st.plane === 'sagittal' || p.model === 'realistic';
      const shown = p.model === model && layer.on && focusOk && planeOk && (inView(p, st.condition) || !!stageFade?.fadeOut.has(p.name));
      const opacity = p.baseOpacity * (layer.opacity / 100);
      p.opacity = opacity;
      p.mesh.visible = shown && opacity > 0;
      // Cut faces are only needed where the cut actually passes through this structure.
      const [lo, hi] = axisRange(p.box);
      const cutsThrough = p.model === 'simple' && !midline && depth > lo && depth < hi;
      p.stencil.visible = p.mesh.visible && cutsThrough;
      p.cap.visible = p.mesh.visible && cutsThrough;
      // The cap lies in the cut plane, facing the camera side.
      p.cap.quaternion.setFromUnitVectors(Z_UP, cutAxis);
      p.cap.position.set(TARGET.x, TARGET.y, 0).addScaledVector(cutAxis, depth - cutAxis.dot(new THREE.Vector3(TARGET.x, TARGET.y, 0)));
    }
    // The figure on the midline cut face belongs to the Simple model.
    const simpleShown = !(st.model === 'realistic' && realistic === 'ready');
    if (st.model === 'realistic') void loadRealistic();
    // The flat midline picture shows every structure, so it steps aside while one structure is shown alone or hidden.
    section.visible = midline && simpleShown && st.focus === 'all';
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
    overlayPlane.normal.copy(cutAxis).negate();
    overlayPlane.constant = cutD + 1;
    buildFlow(st.condition, simpleShown ? null : realisticLandmarks);
    updateOutline();
    // Flow marks follow the fluid spaces of the model on show (the figure's, or the realistic model's own).
    // Part way through surgery the fluid space is still as in Chiari I, so neither the flow marks nor the measure show.
    flowGroup.visible = st.flow && st.layers.csf.on && (simpleShown || !!realisticLandmarks?.flow) && surgeryStage === null;
    if (flowGroup.visible && !stillOnly()) startFlowLoop();
    else {
      // Stop right away (not on the next frame), so turning flow off or Calm mode on takes effect at once.
      if (flowLoop) cancelAnimationFrame(flowLoop);
      flowLoop = 0;
      placeFlow(null);
    }
    buildMeasure(st.condition, simpleShown ? null : realisticLandmarks);
    measureGroup.visible = st.measure && surgeryStage === null;
    requestRender();
  }
  store.subscribe(apply);
  // Calm mode or the system's reduced-motion setting can change while the page is open.
  onCalmChange(() => apply(store.get()));
  reducedMotion.addEventListener('change', () => apply(store.get()));

  resize();
  frame();
  // Start from the view asked for: an exact camera from a shared link, or a named direction other than the side.
  {
    const start = store.get().camera;
    const placeAt = (az: number, el: number, dist: number) => {
      const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
      camera.position.set(
        controls.target.x + dist * Math.sin(a) * Math.cos(e),
        controls.target.y + dist * Math.sin(e),
        controls.target.z + dist * Math.cos(a) * Math.cos(e),
      );
      controls.update();
    };
    if (options.startOrbit) placeAt(options.startOrbit.az, options.startOrbit.el, defaultDistance() / options.startOrbit.zoom);
    else if (start !== 'side' && start !== 'custom') placeAt(...PRESET_ANGLES[start], defaultDistance());
  }
  lap('set up');
  // Prepare the graphics programs in the background where the browser supports it.
  section.visible = true;
  await renderer.compileAsync(scene, camera);
  lap('prepare graphics');
  apply(store.get());
  fitDepthRange();
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
  /** "See it in your room": a copy of one Simple structure, cut at the midline like the Explorer's main view
   *  (only the half that stays, z <= 0), in millimetres. The shapes themselves are unchanged. */
  function clipAtMidline(mesh: THREE.Mesh): THREE.BufferGeometry | null {
    mesh.updateMatrixWorld();
    const geom = mesh.geometry;
    const pos = geom.getAttribute('position');
    const index = geom.getIndex();
    const count = index ? index.count : pos.count;
    const corner = (i: number) => new THREE.Vector3().fromBufferAttribute(pos, index ? index.getX(i) : i).applyMatrix4(mesh.matrixWorld);
    const out: number[] = [];
    for (let i = 0; i + 2 < count; i += 3) {
      const tri = [corner(i), corner(i + 1), corner(i + 2)];
      // Keep the part of the triangle on the near side of the cut (Sutherland-Hodgman against z = 0).
      const poly: THREE.Vector3[] = [];
      for (let k = 0; k < 3; k++) {
        const a = tri[k], b = tri[(k + 1) % 3];
        if (a.z <= 0) poly.push(a);
        if (a.z <= 0 !== b.z <= 0) poly.push(a.clone().lerp(b, a.z / (a.z - b.z)));
      }
      for (let k = 1; k + 1 < poly.length; k++) out.push(...poly[0].toArray(), ...poly[k].toArray(), ...poly[k + 1].toArray());
    }
    if (!out.length) return null;
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
    result.computeVertexNormals();
    return result;
  }

  (host as HTMLElement & { viewer?: unknown }).viewer = {
    look,
    reset: frame,
    /** "What happens in surgery": show the After decompression view at a stage (0 to 4), or null for the usual view. */
    setSurgeryStage(stage: number | null) {
      const before = surgeryStage;
      const names = (s: number | null) =>
        new Set(Object.keys(STAGE_PARTS).filter((n) => (s === null ? parts.some((p) => p.name === n && p.conditions?.includes('surgery')) : STAGE_PARTS[n](s))));
      // Fade only between two stages of the play-through, and never in Calm mode.
      if (before !== null && stage !== null && before !== stage && !stillOnly()) {
        const was = names(before), now = names(stage);
        stageFade = {
          start: performance.now(),
          fadeIn: new Set([...now].filter((n) => !was.has(n))),
          fadeOut: new Set([...was].filter((n) => !now.has(n))),
        };
        const tick = () => {
          requestRender();
          if (fadeProgress() < 1) requestAnimationFrame(tick);
          else {
            stageFade = null;
            apply(store.get());
          }
        };
        requestAnimationFrame(tick);
      } else stageFade = null;
      surgeryStage = stage;
      apply(store.get());
      placeLabels();
    },
    /** One cough: the fluid marks move up into the head and ease back (about 2.6 seconds). In Calm mode, or with
     *  reduced motion, nothing moves: the "pushed up" still frame is shown for the same time, then the rest frame. */
    async cough(onPhase?: (phase: 'up' | 'back' | 'done') => void): Promise<void> {
      const now = store.get();
      if (!now.flow || !now.layers.csf.on) store.set({ flow: true, layers: { ...now.layers, csf: { ...now.layers.csf, on: true } } });
      onPhase?.('up');
      if (stillOnly()) {
        placeFlow(null, 1);
        measureGroup.visible = false;
        requestRender();
        await new Promise((r) => setTimeout(r, COUGH_SECONDS * 400));
        onPhase?.('back');
        await new Promise((r) => setTimeout(r, COUGH_SECONDS * 600));
        placeFlow(null, 0);
        measureGroup.visible = store.get().measure;
        requestRender();
        onPhase?.('done');
        return;
      }
      coughStart = performance.now() / 1000;
      startFlowLoop();
      await new Promise((r) => setTimeout(r, COUGH_SECONDS * 250));
      onPhase?.('back');
      await new Promise((r) => setTimeout(r, COUGH_SECONDS * 750 + 100));
      measureGroup.visible = store.get().measure;
      requestRender();
      onPhase?.('done');
    },
    /** "See it in your room": the Simple model as now shown (condition and layers), cut at the midline with the
     *  figure on the cut face, in millimetres. Used for the phone's augmented-reality view (src/explorer/ar.ts). */
    async arModel(): Promise<THREE.Group> {
      const st = store.get();
      sectionKey = '';
      await drawSection(st);
      const group = new THREE.Group();
      for (const p of parts) {
        if (p.model !== 'simple') continue;
        const layer = st.layers[p.layer];
        if (!layer.on || !inView(p, st.condition)) continue;
        const opacity = p.ghost ? p.opacity * SKIN_SEE_THROUGH : p.opacity;
        if (opacity <= 0) continue;
        const geom = clipAtMidline(p.mesh);
        if (!geom) continue;
        const color = (p.mesh.material as THREE.MeshStandardMaterial).color.clone();
        group.add(new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, transparent: opacity < 1, opacity })));
      }
      const faceTexture = new THREE.CanvasTexture(sectionCanvas);
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      const face = new THREE.Mesh(section.geometry.clone(), new THREE.MeshStandardMaterial({ map: faceTexture, roughness: 1, metalness: 0, transparent: true, alphaTest: 0.02 }));
      face.position.copy(section.position);
      group.add(face);
      return group;
    },
    /** Explain It picture: the view as it is now, drawn fresh at full sharpness (the labels are not part of it). */
    snapshot(): HTMLCanvasElement {
      const ratio = renderer.getPixelRatio();
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(hostW, hostH, false);
      applyOpacity();
      renderer.render(scene, camera);
      const copy = document.createElement('canvas');
      copy.width = renderer.domElement.width;
      copy.height = renderer.domElement.height;
      copy.getContext('2d')!.drawImage(renderer.domElement, 0, 0);
      renderer.setPixelRatio(ratio);
      renderer.setSize(hostW, hostH, false);
      requestRender();
      return copy;
    },
    /** The camera now, as an Explain It link records it: azimuth, elevation (degrees) and zoom (1 = whole head). */
    orbit() {
      const [az, el] = anglesNow();
      return { az, el, zoom: defaultDistance() / camera.position.distanceTo(controls.target) };
    },
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
    /** For checks: where a model point (mm) appears in the view, in CSS pixels from the view's top left. */
    project(x: number, y: number, z: number) {
      const v = new THREE.Vector3(x, y, z).project(camera);
      return { x: ((v.x + 1) / 2) * host.clientWidth, y: ((1 - v.y) / 2) * host.clientHeight };
    },
    /** For checks: the realistic model's saved landmarks (labels, flow marks), once loaded. */
    get realisticLandmarks() {
      return realisticLandmarks;
    },
    /** Side by side: take another view's camera exactly (where it is and what it looks at). */
    followCamera(position: number[], target: number[]) {
      following = true;
      stopTween();
      camera.position.fromArray(position);
      controls.target.fromArray(target);
      controls.update();
      following = false;
      requestRender();
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
    /** Glide to a structure and bring it close. */
    focusPart,
    /** Flow speed: 1 normal, 0.4 slow, 0 paused. */
    setFlowSpeed(speed: number) {
      flowSpeed = speed;
      requestRender();
    },
    /** For tests and the screen reader text. */
    get partCount() {
      return parts.length;
    },
  };
}
