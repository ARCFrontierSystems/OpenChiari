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
// ---- What the midline cut shows, for labels and flow marks -------------------------------------------------------
// Looking at the cut from the side (as the Explorer's side view does), each 1 mm cell of the midline shows the first
// surface behind the cut. That map, made from each view's own build, places the labels (each points at the middle of
// where its structure shows) and the fluid-flow marks (in the fluid in front of and behind the cord, and behind the
// cerebellum), so both follow the realistic model rather than the drawn figure.
const GX0 = -100, GX1 = 100, GY0 = -110, GY1 = 130;
function midlineMap(doc, keep = () => true, nameOf = (n) => n) {
  const tris = [];
  for (const node of doc.getRoot().listNodes()) {
    if (!node.getMesh() || !keep(node)) continue;
    const name = nameOf(node.getName()), m = node.getWorldMatrix(), el = [0, 0, 0];
    if (name === 'skin') continue;
    for (const prim of node.getMesh().listPrimitives()) {
      const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray(), V = [];
      for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, el); V.push([0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r])); }
      for (let t = 0; t < idx.length; t += 3) {
        const a = V[idx[t]], b = V[idx[t + 1]], c = V[idx[t + 2]];
        if (a[2] > 0 && b[2] > 0 && c[2] > 0) continue; // cut away (the view keeps z <= 0)
        tris.push([name, a, b, c]);
      }
    }
  }
  // Bin triangles by their extent in x and y (rays run along z).
  const B = 4, bins = new Map();
  for (const t of tris) {
    const xs = [t[1][0], t[2][0], t[3][0]], ys = [t[1][1], t[2][1], t[3][1]];
    for (let bx = Math.floor(Math.min(...xs) / B); bx <= Math.floor(Math.max(...xs) / B); bx++)
      for (let by = Math.floor(Math.min(...ys) / B); by <= Math.floor(Math.max(...ys) / B); by++) {
        const k = bx * 1000 + by;
        if (!bins.has(k)) bins.set(k, []);
        bins.get(k).push(t);
      }
  }
  const map = new Map();
  for (let x = GX0; x <= GX1; x++)
    for (let y = GY0; y <= GY1; y++) {
      let best = Infinity, who = null;
      for (const [name, a, b, c] of bins.get(Math.floor(x / B) * 1000 + Math.floor(y / B)) ?? []) {
        // where the line through (x, y) along z meets this triangle (2D barycentric test), at z <= 0
        const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
        if (Math.abs(d) < 1e-12) continue;
        const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d;
        const v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d;
        if (u < 0 || v < 0 || u + v > 1) continue;
        const z = u * a[2] + v * b[2] + (1 - u - v) * c[2];
        if (z > 0) continue;
        if (-z < best) { best = -z; who = name; }
      }
      if (who) map.set(`${x},${y}`, who);
    }
  return map;
}
const at = (map, x, y) => map.get(`${Math.round(x)},${Math.round(y)}`) ?? null;
/** The cell of a structure's region (within limits) farthest from anything else: where a label should point. */
function middleOf(map, names, lim = {}) {
  const inside = (x, y) => names.includes(at(map, x, y));
  const cells = [];
  for (let x = lim.x0 ?? GX0; x <= (lim.x1 ?? GX1); x++)
    for (let y = lim.y0 ?? GY0; y <= (lim.y1 ?? GY1); y++) if (inside(x, y)) cells.push([x, y]);
  if (!cells.length) return null;
  // distance to the region's edge, by growing in from outside (8 neighbours)
  const dist = new Map(cells.map(([x, y]) => [`${x},${y}`, Infinity]));
  let frontier = cells.filter(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !dist.has(`${x + dx},${y + dy}`)));
  for (const [x, y] of frontier) dist.set(`${x},${y}`, 1);
  let d = 1;
  while (frontier.length) {
    const next = [];
    for (const [x, y] of frontier)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (dist.get(k) === Infinity) { dist.set(k, d + 1); next.push([x + dx, y + dy]); }
      }
    frontier = next; d++;
  }
  let best = cells[0], bd = -1;
  for (const [x, y] of cells) { const v = dist.get(`${x},${y}`); if (v > bd) { bd = v; best = [x, y]; } }
  return best;
}
/** Along a row (height y), the fluid run that touches the cord on one side (+1 behind it, -1 in front): its middle and width. */
function fluidBeside(map, y, side) {
  let x = 0;
  // find the cord at this height (search outward from the cord's rough centre)
  const cordXs = [];
  for (let cx = -40; cx <= 30; cx++) if (at(map, cx, y) === 'cord') cordXs.push(cx);
  if (!cordXs.length) return null;
  x = side > 0 ? Math.max(...cordXs) + 1 : Math.min(...cordXs) - 1;
  const run = [];
  for (let k = 0; k < 12; k++, x += side) {
    const w = at(map, x, y);
    if (w === 'csf-cranial' || w === 'csf-spinal') run.push(x);
    else if (run.length) break;
    else if (k > 1) break;
  }
  if (!run.length) return null;
  return { x: (Math.min(...run) + Math.max(...run)) / 2, width: Math.max(...run) - Math.min(...run) + 1 };
}
const PART_NODES = {
  cerebrum: ['cerebrum'], callosum: ['callosum'], cerebellum: ['cerebellum'], ventricle: ['ventricle-fourth'], brainstem: ['brainstem'],
  tonsil: ['tonsil'], cord: ['cord'], csf: ['csf-spinal', 'csf-cranial'], c2: ['c2'], syrinx: ['syrinx'], removed: ['bone-removed'],
};
const PART_LIMITS = { cord: { y0: -45, y1: -12 }, csf: { y0: -75, y1: -40 }, cerebrum: { y1: 125 } };
function guides(lm) {
  const out = { labels: {}, flow: {} };
  const mid = [(lm.mcrae.basion[0] + lm.mcrae.opisthion[0]) / 2, (lm.mcrae.basion[1] + lm.mcrae.opisthion[1]) / 2];
  for (const c of ['typical', 'chiari', 'syrinx', 'surgery']) {
    const map = midlineMap(src[c]);
    if (process.env.DEBUG_MAP && c === process.env.DEBUG_MAP) {
      const L = { cord: 'C', brainstem: 'B', tonsil: 'T', 'csf-cranial': '~', 'csf-spinal': '-', cerebellum: 'c', occipital: 'o', c1: '1', c2: '2' };
      for (let y = 4; y >= -14; y--) { let r = ''; for (let x = -20; x <= 20; x++) r += L[at(map, x, y)] ?? (at(map, x, y) ? '?' : '.'); console.log(String(y).padStart(4), r); }
    }
    const labels = { foramen: mid.map((v) => +v.toFixed(1)) };
    for (const [part, names] of Object.entries(PART_NODES)) {
      const p = middleOf(map, names, PART_LIMITS[part]);
      if (p) labels[part] = p;
    }
    out.labels[c] = labels;
    // Flow: chevrons [x, y, width, moves freely (1) or barely (0)], restricted marks [x1, y1, x2, y2].
    const blocked = c === 'chiari' || c === 'syrinx';
    const chev = [], marks = [];
    for (const y of [-25, -45, -65]) {
      const f = fluidBeside(map, y, -1);
      if (f) chev.push([f.x, y, Math.min(5, Math.max(2.5, f.width * 0.9)), 1]);
    }
    for (const y of blocked ? [-35, -55] : [-8, -30, -50]) {
      const f = fluidBeside(map, y, 1);
      if (f) chev.push([f.x, y, Math.min(5, Math.max(2.5, f.width * 0.9)), blocked ? 0 : 1]);
    }
    if (!blocked) {
      // behind the cerebellum (cisterna magna): the middle of the fluid there, above the line
      const p = middleOf(map, ['csf-cranial'], { x0: 5, y0: Math.ceil(mid[1]) + 2, y1: Math.ceil(mid[1]) + 25 });
      if (p) chev.push([p[0], p[1], 5, 1]);
    } else {
      // where the tonsils plug the passage behind the cord at the opening: three short red marks
      for (const dy of [1, -3, -7]) {
        const y = Math.round(mid[1] + dy);
        const cordXs = [];
        for (let cx = -40; cx <= 30; cx++) if (at(map, cx, y) === 'cord' || at(map, cx, y) === 'brainstem') cordXs.push(cx);
        const x = (cordXs.length ? Math.max(...cordXs) : 0) + 2;
        marks.push([x, y - 1.5, x + 4, y + 1.5]);
      }
    }
    out.flow[c] = { chevrons: chev.map((a) => a.map((v) => +v.toFixed(1))), marks };
  }
  return out;
}

const LANDMARKS = landmarks();
Object.assign(LANDMARKS, guides(LANDMARKS));
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
    // Labels point at their own structure, and flow marks sit in the fluid, as this file draws the midline cut.
    const map = midlineMap(doc, (n) => (n.getExtras().conditions ?? []).includes(c), base);
    for (const [part, xy] of Object.entries(LANDMARKS.labels[c])) {
      if (part === 'foramen') continue;
      const who = at(map, xy[0], xy[1]);
      if (!PART_NODES[part].includes(who)) problems.push(`${level} ${c}: the ${part} label points at ${who ?? 'nothing'}`);
    }
    for (const part of ['cerebrum', 'callosum', 'cerebellum', 'ventricle', 'brainstem', 'tonsil', 'cord', 'csf', 'c2', ...(c === 'syrinx' ? ['syrinx'] : []), ...(c === 'surgery' ? ['removed'] : [])])
      if (!LANDMARKS.labels[c][part]) problems.push(`${level} ${c}: no place found for the ${part} label`);
    const fl = LANDMARKS.flow[c];
    for (const [x, y] of fl.chevrons) if (!['csf-cranial', 'csf-spinal'].includes(at(map, x, y))) problems.push(`${level} ${c}: flow mark at ${x}, ${y} is not in the fluid (${at(map, x, y)})`);
    if (fl.chevrons.length < (c === 'chiari' || c === 'syrinx' ? 4 : 7)) problems.push(`${level} ${c}: only ${fl.chevrons.length} flow marks`);
    if ((c === 'chiari' || c === 'syrinx') !== fl.marks.length > 0) problems.push(`${level} ${c}: restricted-flow marks ${fl.marks.length ? 'shown' : 'missing'}`);
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
