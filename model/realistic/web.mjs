// Turns the four realistic builds (typical, chiari, syrinx, surgery; from extract.py) into one compact file per
// detail level for the Explorer: structures shared by all views appear once, and structures that differ carry the
// views they belong to (extras.conditions), as in the Simple model. Each structure is simplified to a triangle
// budget, then quantized and compressed (meshopt).
// Run: node model/realistic/web.mjs <folder with typical-raw.glb, chiari-raw.glb, syrinx-raw.glb, surgery-raw.glb>
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup, prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { statSync } from 'node:fs';

const dir = process.argv[2];
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
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
  ['csf-spinal-typical', 'csf-spinal', 'typical', ['typical']],
  ['csf-spinal-chiari', 'csf-spinal', 'chiari', ['chiari', 'syrinx']],
  ['csf-spinal-surgery', 'csf-spinal', 'surgery', ['surgery']],
  ['syrinx', 'syrinx', 'syrinx', ['syrinx']],
  ['bone-removed', 'bone-removed', 'surgery', ['surgery']],
  ['dural-patch', 'dural-patch', 'surgery', ['surgery']],
];
// Triangle budgets (desktop); the phone version gets about a third.
const BUDGET = {
  skin: 40000, skull: 60000, occipital: 12000, c1: 6000, c2: 8000, 'c3-c5': 15000, discs: 4000, tentorium: 3000,
  cerebrum: 80000, callosum: 6000, diencephalon: 8000, brainstem: 14000, cerebellum: 40000, tonsil: 5000, cord: 4000,
  ventricles: 8000, 'ventricle-fourth': 4000, 'csf-cranial': 26000, 'csf-spinal': 5000, syrinx: 2000, 'bone-removed': 2000, 'dural-patch': 1400,
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

// ---- Check the finished web files: in every view each structure appears exactly once, the parts each view needs
// are there, and the tonsils' lowest point still matches the measured landmark after simplification.
const NEEDS = {
  typical: ['skull', 'occipital', 'c1', 'cord', 'brainstem', 'cerebellum', 'tonsil', 'csf-cranial', 'csf-spinal'],
  chiari: ['skull', 'occipital', 'c1', 'cord', 'brainstem', 'cerebellum', 'tonsil', 'csf-cranial', 'csf-spinal'],
  syrinx: ['skull', 'occipital', 'c1', 'cord', 'brainstem', 'cerebellum', 'tonsil', 'csf-cranial', 'csf-spinal', 'syrinx'],
  surgery: ['skull', 'occipital', 'c1', 'cord', 'brainstem', 'cerebellum', 'tonsil', 'csf-cranial', 'csf-spinal', 'bone-removed', 'dural-patch'],
};
const base = (name) => PLAN.find((p) => p[0] === name)[1];
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0.6, 0.64, 0.48]];
/** Midline cut, as the viewer draws it: at points on the midline inside the tonsils (0.5 mm grid), looking
 * straight to either side, the tonsils' far wall must come before any fluid surface. Returns the failing points. */
function coveredTonsil(tonT, fluT) {
  let bad = 0;
  const box = tonT.flat().reduce((b, v) => [Math.min(b[0], v[0]), Math.max(b[1], v[0]), Math.min(b[2], v[1]), Math.max(b[3], v[1])], [Infinity, -Infinity, Infinity, -Infinity]);
  for (let x = box[0]; x <= box[1]; x += 0.5)
    for (let y = box[2]; y <= Math.min(box[3], 12); y += 0.5) {
      const o = [x, y, 0];
      if (DIRS.filter((d) => rayHits(o, d, tonT) % 2 === 1).length < 3) continue; // not inside the tonsils here
      coveredTonsil.tested = (coveredTonsil.tested ?? 0) + 1;
      for (const dz of [1, -1]) {
        const t = firstHit(o, [0, 0, dz], tonT), f = firstHit(o, [0, 0, dz], fluT);
        if (f < t - 0.05) { bad++; break; }
      }
    }
  return bad;
}
function firstHit(o, d, tris) {
  let best = Infinity;
  for (const [a, b, c] of tris) {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
    const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
    if (Math.abs(det) < 1e-9) continue;
    const s = [o[0] - a[0], o[1] - a[1], o[2] - a[2]], u = (s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) / det;
    if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
    const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det;
    if (v < 0 || u + v > 1) continue;
    const t = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det;
    if (t > 1e-6 && t < best) best = t;
  }
  return best;
}
function rayHits(o, d, tris) {
  let n = 0;
  for (const [a, b, c] of tris) {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
    const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
    if (Math.abs(det) < 1e-9) continue;
    const s = [o[0] - a[0], o[1] - a[1], o[2] - a[2]], u = (s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) / det;
    if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
    const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det;
    if (v < 0 || u + v > 1) continue;
    if ((e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det > 1e-6) n++;
  }
  return n;
}
const problems = [];
for (const level of ['desktop', 'phone']) {
  const doc = await io.read(new URL(`./web/realistic-${level}.glb`, import.meta.url).pathname);
  const nodes = doc.getRoot().listNodes();
  for (const c of ALL) {
    const shown = nodes.filter((n) => (n.getExtras().conditions ?? []).includes(c));
    const parts = shown.map((n) => base(n.getName()));
    const twice = parts.filter((p, i) => parts.indexOf(p) !== i);
    if (twice.length) problems.push(`${level} ${c}: shown twice: ${twice.join(', ')}`);
    const missing = NEEDS[c].filter((p) => !parts.includes(p));
    if (missing.length) problems.push(`${level} ${c}: missing ${missing.join(', ')}`);
    // The fluid and the tonsils must not overlap after simplification (fluid would be drawn over the tonsils in the
    // cut view): no tonsil point inside a fluid surface and no fluid point inside the tonsils, counted by rays.
    const world = (n) => {
      const m = n.getWorldMatrix(), V = [], T = [], el = [0, 0, 0];
      for (const prim of n.getMesh().listPrimitives()) {
        const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray(), b = V.length;
        for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, el); V.push([0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r])); }
        for (let t = 0; t < idx.length; t += 3) T.push([V[b + idx[t]], V[b + idx[t + 1]], V[b + idx[t + 2]]]);
      }
      return { V, T };
    };
    const near = (g) => ({ V: g.V, T: g.T.filter((t) => t.some((v) => v[1] < 15 && v[1] > -35)) });
    const tonT = near(world(shown.find((n) => base(n.getName()) === 'tonsil'))).T;
    const fluT = shown.filter((n) => base(n.getName()).startsWith('csf-')).flatMap((n) => near(world(n)).T);
    const covered = coveredTonsil(tonT, fluT);
    if (process.env.DEBUG) console.log(level, c, 'midline tonsil points tested', coveredTonsil.tested, 'covered', covered); coveredTonsil.tested = 0;
    if (covered) problems.push(`${level} ${c}: fluid drawn over the tonsils in the midline cut at ${covered} points`);
    const ton = shown.find((n) => base(n.getName()) === 'tonsil');
    if (ton) {
      // positions are quantized; the node's matrix turns them back into millimetres
      const pos = ton.getMesh().listPrimitives()[0].getAttribute('POSITION'), el = [0, 0, 0], m = ton.getWorldMatrix();
      let low = Infinity;
      for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, el); low = Math.min(low, m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13]); }
      const want = LANDMARKS.tonsilTip[c][1];
      if (Math.abs(low - want) > 1) problems.push(`${level} ${c}: tonsils' lowest point ${low.toFixed(1)} vs measured ${want.toFixed(1)}`);
    }
  }
}
if (problems.length) {
  console.error('\nFAILED: the web files do not match the measured views:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nWeb files: every view has its parts once each, and the tonsil tips match the measurements.');
