// Automatic measurements of the realistic model against docs/EVIDENCE.md (CLAUDE.md rule 1a, check 2).
// Works on the raw export (millimetres, origin at the middle of the foramen magnum, +x back, +y up, +z side).
// Run: node model/realistic/check.mjs typical-raw.glb [--condition typical]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

await MeshoptDecoder.ready;
const file = process.argv[2];
const condition = process.argv.includes('--condition') ? process.argv[process.argv.indexOf('--condition') + 1] : 'typical';
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(file);
const problems = [];

/** World-space vertices and triangles of one structure. */
function mesh(name) {
  const node = doc.getRoot().listNodes().find((n) => n.getName() === name);
  if (!node) return null;
  const m = node.getWorldMatrix(), verts = [], tris = [];
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute('POSITION'), idx = prim.getIndices()?.getArray(), base = verts.length, el = [0, 0, 0];
    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, el);
      verts.push([0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r]));
    }
    const n = idx ? idx.length : pos.getCount();
    for (let t = 0; t < n; t += 3) tris.push([0, 1, 2].map((k) => base + (idx ? idx[t + k] : t + k)));
  }
  return { verts, tris };
}
/** Points where a structure's surface crosses the plane z = z0 (the midline when z0 = 0), as [x, y] pairs. */
function section(name, z0 = 0) {
  const g = mesh(name);
  if (!g) return [];
  const pts = [];
  for (const t of g.tris)
    for (let e = 0; e < 3; e++) {
      const a = g.verts[t[e]], b = g.verts[t[(e + 1) % 3]];
      if ((a[2] > z0) !== (b[2] > z0)) {
        const k = (z0 - a[2]) / (b[2] - a[2]);
        pts.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]);
      }
    }
  return pts;
}
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const ok = (cond, msg) => { if (!cond) problems.push(msg); };

// ---- McRae line: on the midline, the occipital bone is cut in two by the foramen magnum. The basion is the
// back tip of the front piece and the opisthion the front tip of the back piece: the closest pair across the gap.
const occ = section('occipital').filter((p) => Math.abs(p[1]) < 20 && Math.abs(p[0]) < 35);
const front = occ.filter((p) => p[0] < 0), back = occ.filter((p) => p[0] > 0);
let basion = null, opisthion = null, best = Infinity;
for (const p of front) for (const q of back) { const d = dist(p, q); if (d < best) { best = d; basion = p; opisthion = q; } }
const mcrae = dist(basion, opisthion);
const dir = [(opisthion[0] - basion[0]) / mcrae, (opisthion[1] - basion[1]) / mcrae];
const nrm = dir[0] > 0 ? [-dir[1], dir[0]] : [dir[1], -dir[0]];
const above = (p) => (p[0] - basion[0]) * nrm[0] + (p[1] - basion[1]) * nrm[1];
console.log(`McRae line: ${mcrae.toFixed(1)} mm, basion (${basion.map((v) => v.toFixed(1))}), opisthion (${opisthion.map((v) => v.toFixed(1))}) (EVIDENCE.md: foramen magnum about 33 to 36 mm; 36.2 ± 3.3 mm in controls)`);
ok(mcrae >= 30 && mcrae <= 40, 'the foramen magnum (McRae line) should be about 33 to 36 mm (within 30 to 40)');

// ---- Tonsils
const tonsil = mesh('tonsil');
const tip = tonsil.verts.reduce((a, v) => (above(v) < above(a) ? v : a));
const tipAbove = above(tip);
const tipText = tipAbove >= 0 ? `${tipAbove.toFixed(1)} mm above` : `${(-tipAbove).toFixed(1)} mm below`;
if (condition === 'typical') {
  console.log(`Tonsil tip: ${tipText} the McRae line (EVIDENCE.md typical: about 1 mm above)`);
  ok(tipAbove >= 0 && tipAbove <= 2, `typical tonsil tip ${tipText} the line (expected about 1 mm above, 0 to 2)`);
}

// ---- Clivus: dorsum sellae (top of the clivus, behind the sella) to the basion.
const skull0 = section('skull');
const dorsumCands = skull0.filter((p) => p[0] > -45 && p[0] < -25 && p[1] > 28 && p[1] < 60);
if (dorsumCands.length) {
  const dorsum = dorsumCands.reduce((a, p) => (p[1] > a[1] ? p : a));
  const clivus = dist(dorsum, basion);
  console.log(`Clivus: ${clivus.toFixed(1)} mm, dorsum sellae (${dorsum.map((v) => v.toFixed(1))}) to the basion (EVIDENCE.md: about 39 to 47 mm)`);
  ok(clivus >= 37 && clivus <= 49, 'the clivus should be about 39 to 47 mm');
} else problems.push('could not find the dorsum sellae');

// ---- Spinal cord at C2 (about 28 mm below the foramen magnum), front to back on the midline.
const cordAt = (y) => { const s = section('cord', 2).filter((p) => Math.abs(p[1] - y) < 1); return s.length ? Math.max(...s.map((p) => p[0])) - Math.min(...s.map((p) => p[0])) : NaN; };
const cordC2 = cordAt(-28);
console.log(`Spinal cord at C2: ${cordC2.toFixed(1)} mm front to back (EVIDENCE.md: about 9 mm; 8.8 mm at C2)`);
ok(cordC2 >= 7.5 && cordC2 <= 10.5, 'the spinal cord should be about 9 mm front to back at C2');

// ---- Dens: tip below the basion and in front of the cord.
const c2 = mesh('c2');
const densTip = c2.verts.filter((v) => Math.abs(v[2]) < 6).reduce((a, v) => (v[1] > a[1] ? v : a));
const cordFront = Math.min(...section('cord', 2).filter((p) => Math.abs(p[1] - densTip[1]) < 6).map((p) => p[0]));
console.log(`Dens: tip ${(-above(densTip)).toFixed(1)} mm below the McRae line, ${(cordFront - densTip[0]).toFixed(1)} mm in front of the cord (EVIDENCE.md: tip below the basion, in front of the cord)`);
ok(densTip[1] < basion[1], 'the dens tip should sit below the basion');
ok(densTip[0] < cordFront, 'the dens should sit in front of the spinal cord');

// ---- Fourth ventricle stays above the foramen magnum.
const v4 = mesh('ventricle-fourth');
const v4low = Math.min(...v4.verts.map(above));
console.log(`Fourth ventricle: lowest point ${v4low.toFixed(1)} mm above the McRae line (EVIDENCE.md: normal position)`);
ok(v4low > 0, 'the fourth ventricle should stay above the foramen magnum');

// ---- Fluid around the cerebellum: one piece, no stray bits.
function pieces(g) {
  const key = new Map(), id = new Int32Array(g.verts.length);
  g.verts.forEach((v, i) => { const k = v.map((c) => c.toFixed(3)).join(','); if (!key.has(k)) key.set(k, key.size); id[i] = key.get(k); });
  const parent = Array.from({ length: key.size }, (_, i) => i);
  const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
  for (const t of g.tris) { const a = find(id[t[0]]); parent[find(id[t[1]])] = a; parent[find(id[t[2]])] = a; }
  const size = new Map(), box = new Map(), pos = [...key.keys()].map((k) => k.split(',').map(Number));
  for (let i = 0; i < key.size; i++) {
    const r = find(i), p = pos[i];
    size.set(r, (size.get(r) ?? 0) + 1);
    const b = box.get(r) ?? [1e9, -1e9, 1e9, -1e9, 1e9, -1e9];
    for (let k = 0; k < 3; k++) { b[2 * k] = Math.min(b[2 * k], p[k]); b[2 * k + 1] = Math.max(b[2 * k + 1], p[k]); }
    box.set(r, b);
  }
  if (process.env.PIECES) for (const [r, n] of [...size].sort((a, b) => b[1] - a[1])) console.log('  piece', n, 'x', box.get(r).slice(0, 2).map((v) => v.toFixed(0)).join('..'), 'y', box.get(r).slice(2, 4).map((v) => v.toFixed(0)).join('..'), 'z', box.get(r).slice(4).map((v) => v.toFixed(0)).join('..'));
  return [...size.values()].sort((a, b) => b - a);
}
const csf = mesh('csf-cranial');
const parts = pieces(csf);
console.log(`Fluid around the cerebellum: ${parts.length} piece(s) (largest ${parts[0]} points${parts.length > 1 ? `, others ${parts.slice(1, 6).join(', ')}` : ''})`);
ok(parts.length === 1, 'the fluid around the cerebellum should be one continuous space (no stray spots)');

if (problems.length) {
  console.error('\nFAILED: the realistic model does not match docs/EVIDENCE.md yet:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nAll measurements match docs/EVIDENCE.md.');
