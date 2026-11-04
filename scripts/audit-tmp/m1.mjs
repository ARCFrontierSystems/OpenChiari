import { load, V, bbox } from './lib.mjs';
for (const c of ['typical', 'chiari', 'syrinx', 'surgery']) {
  const m = await load(`${V}/${c}-raw.glb`);
  console.log('==', c);
  for (const n of m.names) { const g = m.mesh(n); const b = bbox(g.verts); console.log(n.padEnd(18), String(g.tris.length).padStart(8), b.map(r => r.map(v => v.toFixed(1)).join('..')).join('  ')); }
}
