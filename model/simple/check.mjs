/**
 * Checks the Simple model file: every surface closed, and the key measurements match docs/EVIDENCE.md
 * (foramen magnum length, tonsil tip above or below the McRae line). Run: npm run model:check
 */
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2] ?? new URL('../../public/models/simple.glb', import.meta.url).pathname);
for (const node of doc.getRoot().listNodes()) {
  const prim = node.getMesh().listPrimitives()[0];
  const idx = prim.getIndices().getArray();
  const count = new Map();
  for (let t = 0; t < idx.length; t += 3) for (let e = 0; e < 3; e++) { const k = idx[t + e] + ',' + idx[t + (e + 1) % 3]; count.set(k, (count.get(k) ?? 0) + 1); }
  let open = 0, dup = 0, degenerate = 0;
  for (const [k, n] of count) { const [a, b] = k.split(','); if (!count.has(b + ',' + a)) open++; if (n > 1) dup += n - 1; }
  for (let t = 0; t < idx.length; t += 3) if (idx[t] === idx[t + 1] || idx[t + 1] === idx[t + 2] || idx[t] === idx[t + 2]) degenerate++;
  console.log(node.getName().padEnd(18), String(idx.length / 3).padStart(6), 'open', open, 'dup', dup, 'degenerate', degenerate);
}

// ---- Measurements against EVIDENCE.md ----
// McRae line from basion to opisthion (model mm; origin at the middle of the foramen magnum).
const shapes = JSON.parse((await import('node:fs')).readFileSync(new URL('../../src/lib/anatomy-shapes.json', import.meta.url), 'utf8'));
const toMm = ([x, y]) => [(x - 369) / shapes.unitsPerMm, -(y - 444.5) / shapes.unitsPerMm];
const B = toMm(shapes.mcrae.basion), O = toMm(shapes.mcrae.opisthion);
const len = Math.hypot(O[0] - B[0], O[1] - B[1]);
const problems = [];
if (len < 33 || len > 36) problems.push(`foramen magnum ${len.toFixed(1)} mm is outside 33 to 36 mm`);
console.log(`\nForamen magnum, basion to opisthion: ${len.toFixed(1)} mm (EVIDENCE.md: about 33 to 36 mm)`);
// Signed perpendicular distance from the line; positive = above (toward the head).
const nrm = [-(O[1] - B[1]) / len, (O[0] - B[0]) / len];
const above = ([x, y]) => (x - B[0]) * nrm[0] + (y - B[1]) * nrm[1];
/** All vertices of a part, in millimetres. */
function vertices(name) {
  const node = doc.getRoot().listNodes().find((n) => n.getName() === name);
  if (!node) return [];
  const pos = node.getMesh().listPrimitives()[0].getAttribute('POSITION');
  const m = node.getWorldMatrix();
  const el = [0, 0, 0], out = [];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, el);
    out.push([
      m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12],
      m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13],
      m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14],
    ]);
  }
  return out;
}
const tips = {};
for (const node of doc.getRoot().listNodes()) {
  if (!node.getName().startsWith('tonsil')) continue;
  const prim = node.getMesh().listPrimitives()[0];
  const pos = prim.getAttribute('POSITION');
  const el = [0, 0, 0];
  // Positions are stored compressed (quantized); the node's transform turns them back into millimetres.
  const m = node.getWorldMatrix();
  let lowest = Infinity;
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, el);
    const x = m[0] * el[0] + m[4] * el[1] + m[8] * el[2] + m[12];
    const y = m[1] * el[0] + m[5] * el[1] + m[9] * el[2] + m[13];
    const z = m[2] * el[0] + m[6] * el[1] + m[10] * el[2] + m[14];
    if (Math.abs(z) < 1.5) lowest = Math.min(lowest, above([x, y]));
  }
  const text = lowest >= 0 ? `${lowest.toFixed(1)} mm above` : `${(-lowest).toFixed(1)} mm below`;
  // Allowed ranges come from docs/EVIDENCE.md ("3D model shapes").
  const name = node.getName();
  if (name === 'tonsil-typical' && !(lowest >= 0 && lowest <= 2)) problems.push(`typical tonsil tip ${text} (expected about 1 mm above)`);
  if (name === 'tonsil-chiari' && !(lowest <= -10 && lowest >= -14)) problems.push(`Chiari I tonsil tip ${text} (expected about 12 mm below)`);
  tips[name] = lowest;
  console.log(`${node.getName().padEnd(16)} lowest tip ${text} the McRae line`);
}
console.log('EVIDENCE.md: typical about 1 mm above; Chiari I model about 12 mm below (at least about 5 mm by definition).');

// After decompression: tonsils rise only partly (about 2 mm on average in one study, PMC10549945) and may stay below the line.
if (tips['tonsil-surgery'] !== undefined) {
  const rise = tips['tonsil-surgery'] - tips['tonsil-chiari'];
  console.log(`After decompression: tonsils risen ${rise.toFixed(1)} mm from Chiari I, still ${(-tips['tonsil-surgery']).toFixed(1)} mm below the line (EVIDENCE.md: rise only partly, about 2 mm on average; may stay below)`);
  if (!(tips['tonsil-surgery'] < 0 && rise >= 1 && rise <= 3)) problems.push('after decompression the tonsils should be partly risen (about 2 mm, 1 to 3) and still below the line');
} else problems.push('the after-decompression tonsils are missing');

// Syrinx: in the neck part of the spinal cord, inside the cord.
const syrinx = vertices('syrinx'), cord = vertices('cord');
if (syrinx.length && cord.length) {
  const top = Math.max(...syrinx.map((v) => above([v[0], v[1]])));
  const halfWidth = Math.max(...syrinx.map((v) => Math.abs(v[2])));
  const cordHalfWidth = Math.max(...cord.map((v) => Math.abs(v[2])));
  const length = Math.max(...syrinx.map((v) => v[1])) - Math.min(...syrinx.map((v) => v[1]));
  console.log(`Syrinx: top ${(-top).toFixed(1)} mm below the McRae line, ${length.toFixed(0)} mm long in view, ${(2 * halfWidth).toFixed(1)} mm wide inside a ${(2 * cordHalfWidth).toFixed(1)} mm cord`);
  if (!(top < 0)) problems.push('the syrinx should be below the skull opening, in the neck cord');
  if (!(halfWidth < cordHalfWidth)) problems.push('the syrinx should be inside the spinal cord');
} else problems.push('the syrinx or spinal cord is missing');

// ---- Shapes and positions described in docs/EVIDENCE.md ("3D model shapes", "After decompression") ----
const midline = (vs, slab = 2.5) => vs.filter((v) => Math.abs(v[2]) < slab);
const tipWidth = (name) => {
  // Front-to-back width of the tonsil 3 mm above its lowest point, on the midline: rounded tips are wide, pointed tips narrow.
  const vs = midline(vertices(name));
  const tip = Math.min(...vs.map((v) => v[1]));
  const band = vs.filter((v) => Math.abs(v[1] - (tip + 3)) < 1.2);
  return band.length ? Math.max(...band.map((v) => v[0])) - Math.min(...band.map((v) => v[0])) : NaN;
};
const wTyp = tipWidth('tonsil-typical'), wChi = tipWidth('tonsil-chiari');
console.log(`Tonsil tip shape (width 3 mm above the tip): typical ${wTyp.toFixed(1)} mm, Chiari I ${wChi.toFixed(1)} mm (EVIDENCE.md: rounded vs often pointed or peg-shaped)`);
if (!(wChi < wTyp)) problems.push('the Chiari I tonsil tip should be more pointed (narrower) than the typical one');

const c2 = vertices('c2');
const denTip = c2.reduce((a, v) => (v[1] > a[1] ? v : a), c2[0]);
const cordFront = Math.min(...midline(vertices('cord')).map((v) => v[0]));
console.log(`Dens of C2: tip ${(-above([denTip[0], denTip[1]])).toFixed(1)} mm below the McRae line at the basion end; ${(cordFront - denTip[0]).toFixed(1)} mm in front of the cord (EVIDENCE.md: tip below the basion, in front of the cord)`);
if (!(denTip[1] < B[1])) problems.push('the dens tip should sit below the basion');
if (!(denTip[0] < cordFront)) problems.push('the dens should sit in front of the spinal cord');

const v4 = vertices('ventricle-fourth');
const v4low = Math.min(...v4.map((v) => above([v[0], v[1]])));
console.log(`Fourth ventricle: lowest point ${v4low.toFixed(1)} mm above the McRae line in every condition (EVIDENCE.md: normal position in Chiari I)`);
if (!(v4low > 0)) problems.push('the fourth ventricle should stay above the foramen magnum');

const removed = vertices('bone-removed');
if (removed.length) {
  const across = Math.max(...removed.map((v) => v[2])) - Math.min(...removed.map((v) => v[2]));
  const skullPart = removed.filter((v) => above([v[0], v[1]]) > -1);
  let along = 0;
  for (let i = 0; i < skullPart.length; i += 7)
    for (let j = i + 7; j < skullPart.length; j += 7)
      along = Math.max(along, Math.hypot(skullPart[i][0] - skullPart[j][0], skullPart[i][1] - skullPart[j][1]));
  console.log(`Bone removed at the back of the foramen magnum: about ${along.toFixed(0)} mm by ${across.toFixed(0)} mm (EVIDENCE.md: a window about 3 cm across by 2.5 cm, model about 30 x 25 mm)`);
  if (!(across >= 27 && across <= 33 && along >= 22 && along <= 29)) problems.push('the bone removed should be about 30 mm across and 25 mm along the skull');
} else problems.push('the removed bone is missing');

// Spinal cord and canal in the neck (EVIDENCE.md "Spinal cord, upper neck" and "Spinal canal, neck").
// Measured on the midline, front to back, at C2 (cord) and C3 (fluid space, wall to wall).
/** Front-to-back width of a structure where the midline cut meets the level figY (figure units): the
 *  mesh's triangles are cut by the horizontal plane there and the points near the midline kept. */
function atLevel(name, figY) {
  const node = doc.getRoot().listNodes().find((n) => n.getName() === name);
  const idx = node.getMesh().listPrimitives()[0].getIndices().getArray();
  const vs = vertices(name), y0 = -(figY - 444.5) / shapes.unitsPerMm, xs = [];
  for (let t = 0; t < idx.length; t += 3)
    for (let e = 0; e < 3; e++) {
      const p = vs[idx[t + e]], q = vs[idx[t + (e + 1) % 3]];
      if ((p[1] - y0) * (q[1] - y0) > 0 || p[1] === q[1]) continue;
      const k = (y0 - p[1]) / (q[1] - p[1]);
      if (Math.abs(p[2] + k * (q[2] - p[2])) < 1.5) xs.push(p[0] + k * (q[0] - p[0]));
    }
  return xs.length ? Math.max(...xs) - Math.min(...xs) : NaN;
}
const cordAP = atLevel('cord', 500);
console.log(`Spinal cord at C2: ${cordAP.toFixed(1)} mm front to back (EVIDENCE.md: about 9 mm; 8.8 mm at C2)`);
if (!(cordAP >= 8 && cordAP <= 10)) problems.push('the spinal cord should be about 9 mm front to back at C2');
for (const name of ['csf-typical', 'csf-chiari', 'csf-surgery']) {
  const canal = atLevel(name, 546);
  console.log(`Spinal canal at C3 (${name}): ${canal.toFixed(1)} mm front to back (EVIDENCE.md: about 13 to 15 mm)`);
  if (!(canal >= 13 && canal <= 16)) problems.push(`the neck canal (${name}) should be about 13 to 16 mm front to back`);
}

// Fluid pathway (EVIDENCE.md "Fluid pathway"): one continuous piece. Typical and after surgery reach from inside
// the skull (behind the cerebellum) down into the neck; in Chiari I nothing passes the tonsil into the skull.
function pieces(name) {
  const node = doc.getRoot().listNodes().find((n) => n.getName() === name);
  const prim = node.getMesh().listPrimitives()[0];
  const idx = prim.getIndices().getArray(), pos = prim.getAttribute('POSITION');
  // Vertices may be split at the same position: join them by position first.
  const key = new Map(), id = new Int32Array(pos.getCount()), el = [0, 0, 0];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, el);
    const k = el.map((v) => v.toFixed(4)).join(',');
    if (!key.has(k)) key.set(k, key.size);
    id[i] = key.get(k);
  }
  const parent = Array.from({ length: key.size }, (_, i) => i);
  const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
  for (let t = 0; t < idx.length; t += 3) {
    const a = find(id[idx[t]]), b = find(id[idx[t + 1]]), c = find(id[idx[t + 2]]);
    parent[b] = a; parent[find(c)] = a;
  }
  const sizes = new Map();
  for (let i = 0; i < key.size; i++) sizes.set(find(i), (sizes.get(find(i)) ?? 0) + 1);
  if (process.env.DEBUG_PIECES) {
    const ext = new Map();
    const wv = vertices(name); for (let i = 0; i < pos.getCount(); i++) { const el2 = wv[i]; el[0] = el2[0]; el[1] = el2[1]; const r = find(id[i]); const e = ext.get(r) ?? [1e9, -1e9, 1e9, -1e9]; e[0] = Math.min(e[0], el[0]); e[1] = Math.max(e[1], el[0]); e[2] = Math.min(e[2], el[1]); e[3] = Math.max(e[3], el[1]); ext.set(r, e); }
    console.log(name, [...sizes.entries()].map(([r, n]) => `${n} verts x ${ext.get(r).map((v) => v.toFixed(0))}`));
  }
  return sizes.size;
}
for (const name of ['csf-typical', 'csf-chiari', 'csf-surgery']) {
  const vs = vertices(name);
  const top = Math.max(...vs.map((v) => above([v[0], v[1]]))), bottom = Math.min(...vs.map((v) => v[1]));
  const n = pieces(name);
  console.log(`Fluid (${name}): ${n} piece(s), from ${top.toFixed(1)} mm above the McRae line down to ${(-bottom).toFixed(0)} mm below the foramen magnum`);
  if (n !== 1) problems.push(`the spinal fluid (${name}) should be one continuous space`);
  if (name !== 'csf-chiari' && !(top > 10)) problems.push(`the fluid (${name}) should continue up behind the cerebellum`);
  if (name === 'csf-chiari' && !(top < 2)) problems.push('in Chiari I the tonsil should fill the fluid space behind it (no fluid continuing up into the skull)');
}

// Clivus (EVIDENCE.md "Clivus"): dorsum sellae to basion on the midline, about 39 to 47 mm.
{
  const top = [...shapes.clivus.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]).reduce((a, p) => (p[1] < a[1] ? p : a));
  const len = Math.hypot(top[0] - shapes.mcrae.basion[0], top[1] - shapes.mcrae.basion[1]) / shapes.unitsPerMm;
  console.log(`Clivus: ${len.toFixed(1)} mm from the dorsum sellae to the basion (EVIDENCE.md: about 39 to 47 mm)`);
  if (!(len >= 39 && len <= 47)) problems.push('the clivus should be about 39 to 47 mm long');
}

if (problems.length) {
  console.error('\nFAILED: the model no longer matches docs/EVIDENCE.md:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nAll measurements match docs/EVIDENCE.md.');
