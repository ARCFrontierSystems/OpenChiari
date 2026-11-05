/**
 * "See it in your room": the Simple model, life size, on a table or the floor through the phone's camera.
 * - iPhone and iPad: Apple's built-in viewer (AR Quick Look), from a USDZ file made on the device.
 * - Android (Chrome): inside the page, with WebXR (Matthew, 2026-11-05: "Inside the browser"), nothing goes to Google.
 * The camera picture never leaves the phone and the site doesn't see it. The model is the Explorer's view as it is
 * now (condition and layers), cut at the midline with the figure on the cut face.
 */
import * as THREE from 'three';

export type ArKind = 'quicklook' | 'webxr' | null;

export async function arSupport(): Promise<ArKind> {
  const a = document.createElement('a');
  if (a.relList?.supports?.('ar')) return 'quicklook';
  const xr = (navigator as Navigator & { xr?: { isSessionSupported(mode: string): Promise<boolean> } }).xr;
  try {
    if (xr && (await xr.isSessionSupported('immersive-ar'))) return 'webxr';
  } catch {
    // Not available.
  }
  return null;
}

export interface ArText {
  title: string;
  caption: string;
  hint: string;
  close: string;
}

/** Life size (millimetres to metres), standing on its lowest point, centered. */
function placeOnFloor(model: THREE.Group): THREE.Group {
  const root = new THREE.Group();
  model.scale.setScalar(0.001);
  root.add(model);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.set(-c.x, -box.min.y, -c.z);
  return root;
}

async function quickLook(model: THREE.Group, text: ArText): Promise<void> {
  const { USDZExporter } = await import('three/examples/jsm/exporters/USDZExporter.js');
  const data = await new USDZExporter().parseAsync(placeOnFloor(model));
  const url = URL.createObjectURL(new Blob([data], { type: 'model/vnd.usdz+zip' }));
  // Apple's banner under the model carries the name and the required caption.
  const banner = new URLSearchParams({ checkoutTitle: text.title, checkoutSubtitle: text.caption, callToAction: text.close });
  const a = document.createElement('a');
  a.rel = 'ar';
  a.href = `${url}#${banner.toString().replace(/\+/g, '%20')}`;
  a.appendChild(document.createElement('img'));
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function webXR(model: THREE.Group, text: ArText): Promise<void> {
  const xr = (navigator as Navigator & { xr: { requestSession(mode: string, init: object): Promise<XRSession> } }).xr;
  // The words shown over the camera picture: name, caption, how to place it, and Close.
  const overlay = document.createElement('div');
  overlay.className = 'ar-overlay';
  overlay.innerHTML = `<div class="ar-text"><p class="ar-title"></p><p class="ar-caption"></p><p class="ar-hint"></p></div><button type="button" class="ar-close"></button>`;
  overlay.querySelector('.ar-title')!.textContent = text.title;
  overlay.querySelector('.ar-caption')!.textContent = text.caption;
  overlay.querySelector('.ar-hint')!.textContent = text.hint;
  overlay.querySelector('.ar-close')!.textContent = text.close;
  document.body.appendChild(overlay);
  const session = await xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: overlay } });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(0.5, 1, 0.8);
  scene.add(sun);
  const placed = placeOnFloor(model);
  placed.visible = false;
  scene.add(placed);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x7fb3d3 }));
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
  await renderer.xr.setSession(session);

  const viewerSpace = await session.requestReferenceSpace('viewer');
  const hitSource = await session.requestHitTestSource?.({ space: viewerSpace });
  if (!hitSource) {
    await session.end();
    return;
  }
  session.addEventListener('select', () => {
    if (!reticle.visible) return;
    placed.position.setFromMatrixPosition(reticle.matrix);
    // Face the person: the cut face (the figure) toward the camera.
    const cam = renderer.xr.getCamera();
    placed.rotation.y = Math.atan2(cam.position.x - placed.position.x, cam.position.z - placed.position.z);
    placed.visible = true;
  });
  renderer.setAnimationLoop((_, frame) => {
    const ref = renderer.xr.getReferenceSpace();
    const hit = frame && ref ? frame.getHitTestResults(hitSource)[0] : undefined;
    const pose = hit && ref ? hit.getPose(ref) : undefined;
    reticle.visible = !!pose;
    if (pose) reticle.matrix.fromArray(pose.transform.matrix);
    renderer.render(scene, renderer.xr.getCamera());
  });
  const end = () => {
    renderer.setAnimationLoop(null);
    hitSource.cancel();
    renderer.dispose();
    overlay.remove();
  };
  overlay.querySelector('.ar-close')!.addEventListener('click', () => session.end());
  session.addEventListener('end', end);
}

export async function openAr(kind: ArKind, model: THREE.Group, text: ArText): Promise<void> {
  if (kind === 'quicklook') return quickLook(model, text);
  if (kind === 'webxr') return webXR(model, text);
}
