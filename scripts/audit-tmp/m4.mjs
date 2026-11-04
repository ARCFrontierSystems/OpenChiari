import { load, V, insideTester } from './lib.mjs';
const c = process.argv[2];
const m = await load(`${V}/${c}-raw.glb`);
const testers = {};
const T = (n) => testers[n] ??= (m.mesh(n) ? insideTester(m.mesh(n)) : null);
function count(src, targets, filter = () => true, step = 1) {
  const g = m.mesh(src); if (!g) return;
  const pts = g.verts.filter((v, i) => i % step === 0 && filter(v));
  const out = [];
  for (const t of targets) {
    const f = T(t); if (!f) continue;
    let n = 0, worst = null;
    for (const p of pts) if (f(p)) { n++; worst = p; }
    out.push(`${t}: ${n}${worst ? ' e.g. (' + worst.map(v => v.toFixed(1)) + ')' : ''}`);
  }
  console.log(`${c}: ${src} points (${pts.length}) inside -> ${out.join(' | ')}`);
}
count('tonsil', ['occipital', 'c1', 'c2', 'skull', 'cord', 'brainstem', 'dural-patch']);
count('cerebellum', ['occipital', 'skull', 'tentorium', 'brainstem'], (v) => true, 5);
count('cord', ['c1', 'c2', 'c3-c5', 'occipital']);
// cord outside the dura (below the dura's top)
{ const f = T('dura'); const pts = m.mesh('cord').verts.filter(v => v[1] < -15 && v[1] > -97); let n = 0, ex = null; for (const p of pts) if (!f(p)) { n++; ex = p; } console.log(`${c}: cord points below -15 mm outside the dura: ${n} of ${pts.length}`, ex ? ex.map(v=>v.toFixed(1)) : ''); }
{ const f = T('dura'); const pts = m.mesh('tonsil').verts.filter(v => v[1] < -13.8); let n = 0; for (const p of pts) if (!f(p)) n++; console.log(`${c}: tonsil points below the dura top outside the dura: ${n} of ${pts.length}`); }
count('csf-cranial', ['occipital', 'skull', 'cerebellum', 'tonsil', 'brainstem', 'c1'], () => true, 7);
if (m.mesh('syrinx')) { const f = T('cord'); const pts = m.mesh('syrinx').verts; let n = 0; for (const p of pts) if (!f(p)) n++; console.log(`${c}: syrinx points outside the cord: ${n} of ${pts.length}`); }
if (m.mesh('dural-patch')) count('dural-patch', ['occipital', 'skull', 'c1', 'cerebellum', 'tonsil', 'cord', 'csf-cranial']);
