// Turns the four realistic builds (typical, chiari, syrinx, surgery; from extract.py) into one compact file per
// detail level for the Explorer: structures shared by all views appear once, and structures that differ carry the
// views they belong to (extras.conditions), as in the Simple model. Each structure is simplified to a triangle
// budget, then quantized and compressed (meshopt).
// Run: node model/realistic/web.mjs <folder with typical-raw.glb, chiari-raw.glb, syrinx-raw.glb, surgery-raw.glb>
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync } from 'node:fs';

const dir = process.argv[2];
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const src = {};
for (const c of ['typical', 'chiari', 'syrinx', 'surgery']) src[c] = await io.read(`${dir}/${c}-raw.glb`);

// What each output structure is made from: [name, source view, conditions it shows in].
const ALL = ['typical', 'chiari', 'syrinx', 'surgery'];
const PLAN = [
  ...['skin', 'skull', 'c2', 'c3-c5', 'discs', 'tentorium', 'cerebrum', 'callosum', 'diencephalon', 'brainstem', 'cerebellum',
    'cord', 'ventricles', 'ventricle-fourth'].map((n) => [n, n, 'typical', ALL]),
  ['occipital', 'occipital', 'typical', ['typical', 'chiari', 'syrinx']],
  ['occipital-surgery', 'occipital', 'surgery', ['surgery']],
  ['c1', 'c1', 'typical', ['typical', 'chiari', 'syrinx']],
  ['c1-surgery', 'c1', 'surgery', ['surgery']],
  ['tonsil-typical', 'tonsil', 'typical', ['typical']],
  ['tonsil-chiari', 'tonsil', 'chiari', ['chiari', 'syrinx']],
  ['tonsil-surgery', 'tonsil', 'surgery', ['surgery']],
  ['csf-cranial-typical', 'csf-cranial', 'typical', ['typical']],
  ['csf-cranial-chiari', 'csf-cranial', 'chiari', ['chiari', 'syrinx']],
  ['csf-cranial-surgery', 'csf-cranial', 'surgery', ['surgery']],
  ['syrinx', 'syrinx', 'syrinx', ['syrinx']],
  ['bone-removed', 'bone-removed', 'surgery', ['surgery']],
  ['dural-patch', 'dural-patch', 'surgery', ['surgery']],
];
// Triangle budgets (desktop); the phone version gets about a third.
const BUDGET = {
  skin: 40000, skull: 60000, occipital: 12000, c1: 6000, c2: 8000, 'c3-c5': 15000, discs: 4000, tentorium: 3000,
  cerebrum: 80000, callosum: 6000, diencephalon: 8000, brainstem: 14000, cerebellum: 40000, tonsil: 5000, cord: 4000,
  ventricles: 8000, 'ventricle-fourth': 4000, 'csf-cranial': 26000, syrinx: 2000, 'bone-removed': 2000, 'dural-patch': 1400,
};

function sourceNode(doc, name) {
  return doc.getRoot().listNodes().find((n) => n.getName() === name);
}
function worldVerts(doc, name) {
  const node = sourceNode(doc, name), m = node.getWorldMatrix(), out = [], el = [0, 0, 0];
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, el); out.push([0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r])); }
  }
  return out;
}
// Landmarks for the Explorer's Measure tool, from the realistic model itself (same method as check.mjs):
// the McRae line (basion and opisthion, where the occipital bone is cut in two on the midline) and each view's
// lowest tonsil point.
function landmarks() {
  const node = sourceNode(src.typical, 'occipital'), m = node.getWorldMatrix(), pts = [], el = [0, 0, 0];
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray();
    const V = (i) => { pos.getElement(i, el); return [0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r]); };
    for (let t = 0; t < idx.length; t += 3) {
      const v = [V(idx[t]), V(idx[t + 1]), V(idx[t + 2])];
      for (let e = 0; e < 3; e++) {
        const a = v[e], b = v[(e + 1) % 3];
        if ((a[2] > 0) !== (b[2] > 0)) { const k = a[2] / (a[2] - b[2]); pts.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]); }
      }
    }
  }
  const near = pts.filter((p) => Math.abs(p[1]) < 20 && Math.abs(p[0]) < 35);
  let best = Infinity, basion, opisthion;
  for (const p of near.filter((q) => q[0] < 0)) for (const q of near.filter((r) => r[0] > 0)) {
    const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < best) { best = d; basion = p; opisthion = q; }
  }
  const L = best, dir = [(opisthion[0] - basion[0]) / L, (opisthion[1] - basion[1]) / L];
  const n = dir[0] > 0 ? [-dir[1], dir[0]] : [dir[1], -dir[0]];
  const above = (v) => (v[0] - basion[0]) * n[0] + (v[1] - basion[1]) * n[1];
  const tonsilTip = {};
  for (const c of ['typical', 'chiari', 'syrinx', 'surgery']) {
    const tip = worldVerts(src[c], 'tonsil').reduce((a, v) => (above(v) < above(a) ? v : a));
    tonsilTip[c] = tip.map((x) => +x.toFixed(2));
  }
  return { mcrae: { basion: basion.map((x) => +x.toFixed(2)), opisthion: opisthion.map((x) => +x.toFixed(2)) }, tonsilTip };
}
const LANDMARKS = landmarks();
console.log('landmarks', JSON.stringify(LANDMARKS));

async function build(level) {
  const out = new Document();
  out.createBuffer();
  const scene = out.createScene('realistic').setExtras(LANDMARKS);
  for (const [name, from, view, conditions] of PLAN) {
    const node = sourceNode(src[view], from);
    if (!node) throw new Error(`${from} missing in ${view}`);
    const m = node.getWorldMatrix();
    const positions = [], indices = [];
    for (const prim of node.getMesh().listPrimitives()) {
      const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray(), el = [0, 0, 0], base = positions.length / 3;
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, el);
        for (let r = 0; r < 3; r++) positions.push(m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r]);
      }
      for (const k of idx) indices.push(base + k);
    }
    // Simplify this structure alone, in its own document, to its budget.
    const one = new Document();
    const b = one.createBuffer();
    const p = one.createPrimitive()
      .setAttribute('POSITION', one.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(b))
      .setIndices(one.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(b));
    one.createScene().addChild(one.createNode(name).setMesh(one.createMesh(name).addPrimitive(p)));
    const target = Math.round(BUDGET[from] * (level === 'phone' ? 0.33 : 1));
    const before = indices.length / 3;
    await one.transform(weld());
    if (before > target) await one.transform(simplify({ simplifier: MeshoptSimplifier, ratio: target / before, error: 0.02 }));
    const sp = one.getRoot().listMeshes()[0].listPrimitives()[0];
    const tris = sp.getIndices().getCount() / 3;
    // Copy into the output document.
    const op = out.createPrimitive()
      .setAttribute('POSITION', out.createAccessor().setType('VEC3').setArray(sp.getAttribute('POSITION').getArray().slice()))
      .setIndices(out.createAccessor().setType('SCALAR').setArray(sp.getIndices().getArray().slice()));
    const extras = { ...node.getExtras(), conditions };
    const n = out.createNode(name).setMesh(out.createMesh(name).addPrimitive(op)).setExtras(extras);
    scene.addChild(n);
    console.log(`${level.padEnd(7)} ${name.padEnd(22)} ${String(before).padStart(7)} -> ${String(tris).padStart(6)} triangles`);
  }
  await out.transform(dedup(), prune(), quantize({ quantizePosition: 14 }), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
  const file = new URL(`./web/realistic-${level}.glb`, import.meta.url).pathname;
  await io.write(file, out);
  console.log(`wrote ${file}: ${(statSync(file).size / 1e6).toFixed(2)} MB`);
}
await build('desktop');
await build('phone');
