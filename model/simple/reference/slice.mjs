// Cuts a model (glTF, millimetres, origin at the middle of the foramen magnum, +x back, +y up, +z side)
// along the midline (z = 0) and writes each structure's outline loops in figure units
// (2 units = 1 mm, foramen magnum centre at 369, 444.5), as JSON.
// Run: node model/simple/reference/slice.mjs in.glb out.json [z offset in mm]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { writeFileSync } from 'node:fs';

const [inFile, outFile, zArg] = process.argv.slice(2);
const Z0 = Number(zArg ?? 0); // slice this many mm to the side of the midline
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(inFile);
const toFig = ([x, y]) => [369 + 2 * x, 444.5 - 2 * y];
const result = {};
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  const segs = [];
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'), idx = prim.getIndices()?.getArray();
    const n = idx ? idx.length : pos.getCount();
    const el = [0, 0, 0];
    const P = (i) => { pos.getElement(i, el); return [0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r]); };
    for (let t = 0; t < n; t += 3) {
      const v = [0, 1, 2].map((k) => P(idx ? idx[t + k] : t + k));
      const pts = [];
      for (let e = 0; e < 3; e++) {
        const a = v[e], b = v[(e + 1) % 3];
        if ((a[2] > Z0) !== (b[2] > Z0)) { const k = (a[2] - Z0) / (a[2] - b[2]); pts.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]); }
      }
      if (pts.length === 2) segs.push(pts);
    }
  }
  if (!segs.length) continue;
  // Chain segments into loops by nearest endpoints.
  const key = (p) => p[0].toFixed(3) + ',' + p[1].toFixed(3);
  const ends = new Map();
  segs.forEach((s, i) => s.forEach((p) => ends.set(key(p), [...(ends.get(key(p)) ?? []), i])));
  const used = new Set(), loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const loop = [segs[i][0], segs[i][1]];
    for (;;) {
      const nxt = (ends.get(key(loop[loop.length - 1])) ?? []).find((j) => !used.has(j));
      if (nxt === undefined) break;
      used.add(nxt);
      const [a, b] = segs[nxt];
      loop.push(key(a) === key(loop[loop.length - 1]) ? b : a);
    }
    if (loop.length > 6) loops.push(loop.map(toFig).map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]));
  }
  result[node.getName()] = loops;
}
writeFileSync(outFile, JSON.stringify(result));
console.log(Object.entries(result).map(([k, v]) => `${k}: ${v.length} loops, ${v.reduce((a, l) => a + l.length, 0)} points`).join('\n'));
