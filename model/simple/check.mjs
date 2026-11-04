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

// After decompression: tonsils rise only partly (about 4 mm on average in one series) and may stay below the line.
if (tips['tonsil-surgery'] !== undefined) {
  const rise = tips['tonsil-surgery'] - tips['tonsil-chiari'];
  console.log(`After decompression: tonsils risen ${rise.toFixed(1)} mm from Chiari I, still ${(-tips['tonsil-surgery']).toFixed(1)} mm below the line (EVIDENCE.md: rise only partly, about 4 mm on average; may stay below)`);
  if (!(tips['tonsil-surgery'] < 0 && rise >= 2 && rise <= 6)) problems.push('after decompression the tonsils should be partly risen (2 to 6 mm) and still below the line');
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

if (problems.length) {
  console.error('\nFAILED: the model no longer matches docs/EVIDENCE.md:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nAll measurements match docs/EVIDENCE.md.');
