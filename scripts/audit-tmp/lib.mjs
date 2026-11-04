import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
export const V = '/tmp/claude-0/za/view';
export async function load(file) {
  const doc = await io.read(file);
  const cache = {};
  const names = doc.getRoot().listNodes().filter(n => n.getMesh()).map(n => n.getName());
  function mesh(name) {
    if (cache[name]) return cache[name];
    const node = doc.getRoot().listNodes().find((n) => n.getName() === name);
    if (!node || !node.getMesh()) return null;
    const m = node.getWorldMatrix(), verts = [], tris = [];
    for (const prim of node.getMesh().listPrimitives()) {
      const pos = prim.getAttribute('POSITION'), idx = prim.getIndices()?.getArray(), base = verts.length, el = [0, 0, 0];
      for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, el); verts.push([0, 1, 2].map((r) => m[r] * el[0] + m[4 + r] * el[1] + m[8 + r] * el[2] + m[12 + r])); }
      const n = idx ? idx.length : pos.getCount();
      for (let t = 0; t < n; t += 3) tris.push([0, 1, 2].map((k) => base + (idx ? idx[t + k] : t + k)));
    }
    return (cache[name] = { verts, tris, extras: node.getExtras() });
  }
  return { doc, mesh, names };
}
// sagittal section at z=z0: segments [[x,y],[x,y]]
export function section(g, z0 = 0) {
  const segs = [];
  for (const t of g.tris) {
    const pts = [];
    for (let e = 0; e < 3; e++) {
      const a = g.verts[t[e]], b = g.verts[t[(e + 1) % 3]];
      if ((a[2] > z0) !== (b[2] > z0)) { const k = (z0 - a[2]) / (b[2] - a[2]); pts.push([a[0] + k * (b[0] - a[0]), a[1] + k * (b[1] - a[1])]); }
    }
    if (pts.length === 2) segs.push(pts);
  }
  return segs;
}
// crossings of a horizontal line y=y0 within a section (list of x)
export function hcross(segs, y0) {
  const xs = [];
  for (const [a, b] of segs) if ((a[1] > y0) !== (b[1] > y0)) xs.push(a[0] + (y0 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
  return xs.sort((p, q) => p - q);
}
export function vcross(segs, x0) {
  const ys = [];
  for (const [a, b] of segs) if ((a[0] > x0) !== (b[0] > x0)) ys.push(a[1] + (x0 - a[0]) / (b[0] - a[0]) * (b[1] - a[1]));
  return ys.sort((p, q) => p - q);
}
// Inside test by ray parity along +x, majority over 3 axis rays (+x, +y, +z), grid-accelerated.
export function insideTester(g) {
  const T = g.tris.map((t) => t.map((i) => g.verts[i]));
  const makeAxis = (ax) => {
    const [u, v] = [[1, 2], [0, 2], [0, 1]][ax];
    const grid = new Map();
    T.forEach((tri, ti) => {
      const u0 = Math.floor(Math.min(...tri.map(p => p[u]))), u1 = Math.floor(Math.max(...tri.map(p => p[u])));
      const v0 = Math.floor(Math.min(...tri.map(p => p[v]))), v1 = Math.floor(Math.max(...tri.map(p => p[v])));
      for (let a = u0; a <= u1; a++) for (let b = v0; b <= v1; b++) { const k = a * 100000 + b; let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(ti); }
    });
    return (p) => {
      const l = grid.get(Math.floor(p[u]) * 100000 + Math.floor(p[v])) || [];
      let c = 0;
      for (const ti of l) {
        const [A, B, C] = T[ti];
        // 2D point in triangle (u,v), barycentric
        const d = (B[u] - A[u]) * (C[v] - A[v]) - (C[u] - A[u]) * (B[v] - A[v]);
        if (Math.abs(d) < 1e-12) continue;
        const s = ((p[u] - A[u]) * (C[v] - A[v]) - (C[u] - A[u]) * (p[v] - A[v])) / d;
        const t = ((B[u] - A[u]) * (p[v] - A[v]) - (p[u] - A[u]) * (B[v] - A[v])) / d;
        if (s < 0 || t < 0 || s + t > 1) continue;
        const h = A[ax] + s * (B[ax] - A[ax]) + t * (C[ax] - A[ax]);
        if (h > p[ax]) c++;
      }
      return c % 2 === 1;
    };
  };
  const axes = [0, 1, 2].map(makeAxis);
  return (p) => axes.reduce((n, f) => n + (f([p[0] + 1e-4, p[1] + 2e-4, p[2] + 3e-4]) ? 1 : 0), 0) >= 2;
}
export function mcrae(occ) {
  const segs = section(occ);
  const pts = segs.flat().filter((p) => Math.abs(p[1]) < 20 && Math.abs(p[0]) < 35);
  const front = pts.filter((p) => p[0] < 0), back = pts.filter((p) => p[0] > 0);
  let best = Infinity, B, O;
  for (const p of front) for (const q of back) { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < best) { best = d; B = p; O = q; } }
  const L = best, dir = [(O[0] - B[0]) / L, (O[1] - B[1]) / L];
  const n = dir[0] > 0 ? [-dir[1], dir[0]] : [dir[1], -dir[0]];
  return { B, O, L, above: (p) => (p[0] - B[0]) * n[0] + (p[1] - B[1]) * n[1] };
}
export const bbox = (vs) => [0, 1, 2].map((k) => vs.reduce((r, v) => [Math.min(r[0], v[k]), Math.max(r[1], v[k])], [Infinity, -Infinity]));
