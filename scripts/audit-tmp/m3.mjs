import { load, V, section, hcross, mcrae } from './lib.mjs';
const z0 = Number(process.argv[2] ?? 0.01);
const names = ['brainstem', 'cord', 'cerebellum', 'tonsil', 'csf-cranial', 'occipital', 'c1', 'dura', 'dural-patch', 'bone-removed', 'syrinx'];
const short = { brainstem: 'BS', cord: 'CD', cerebellum: 'CB', tonsil: 'TO', 'csf-cranial': 'FL', occipital: 'OC', c1: 'C1', dura: 'DU', 'dural-patch': 'PA', 'bone-removed': 'RM', syrinx: 'SY' };
for (const c of process.argv.slice(3)) {
  const m = await load(`${V}/${c}-raw.glb`);
  const secs = {}; for (const n of names) { const g = m.mesh(n); if (g) secs[n] = section(g, z0); }
  console.log(`== ${c} at z=${z0}: per height y, structures crossing (x positions), only x > -20`);
  for (let y = 24; y >= -26; y -= 2) {
    const ev = [];
    for (const n of Object.keys(secs)) for (const x of hcross(secs[n], y)) if (x > -20 && x < 60) ev.push([x, short[n]]);
    ev.sort((a, b) => a[0] - b[0]);
    console.log(String(y).padStart(4), ev.map(([x, s]) => `${s}${x.toFixed(1)}`).join(' '));
  }
}
