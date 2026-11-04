import { load, V, section, hcross, vcross, mcrae, bbox } from './lib.mjs';
const T = await load(`${V}/typical-raw.glb`), C = await load(`${V}/chiari-raw.glb`), S = await load(`${V}/surgery-raw.glb`);
const mc = mcrae(T.mesh('occipital'));
console.log('McRae', mc.L.toFixed(1), 'B', mc.B.map(v=>v.toFixed(1)), 'O', mc.O.map(v=>v.toFixed(1)));
// occipital midline behind the opisthion
const occS = section(T.mesh('occipital'));
console.log('-- occipital midline, x columns: y crossings (inner/outer table)');
for (let x = 18; x <= 70; x += 4) console.log('x', x, vcross(occS, x).filter(y => y > -15 && y < 80).map(v => v.toFixed(1)).join(' '));
// dura and fluid gap at FM in typical, along midline x columns behind the cord
const dS = section(T.mesh('dura')), cS = section(T.mesh('csf-cranial')), cordS = section(T.mesh('cord'));
console.log('-- typical midline: for y levels, crossings x of csf, dura, cord');
for (let y = 4; y >= -20; y -= 2) console.log('y', y, 'csf', hcross(cS, y).map(v => v.toFixed(1)).join(' '), '| dura', hcross(dS, y).map(v => v.toFixed(1)).join(' '), '| cord', hcross(cordS, y).map(v => v.toFixed(1)).join(' '));
// dura top shape
const dv = T.mesh('dura').verts; const top = dv.filter(v => v[1] > -15); console.log('dura points above -15:', top.length, bbox(top).map(r=>r.map(v=>v.toFixed(1)).join('..')).join(' '));
// dorsum / clivus
const skS = section(T.mesh('skull'));
console.log('-- skull midline near dorsum sellae: x columns y crossings');
for (let x = -46; x <= -20; x += 2) console.log('x', x, vcross(skS, x).filter(y => y > 0 && y < 70).map(v => v.toFixed(1)).join(' '));
console.log('-- occipital (clivus part) front of FM');
for (let x = -40; x <= -16; x += 2) console.log('x', x, vcross(occS, x).filter(y => y > -10 && y < 70).map(v => v.toFixed(1)).join(' '));
// fastigium: most posterior point of fourth ventricle near midline
const v4 = T.mesh('ventricle-fourth').verts.filter(v => Math.abs(v[2]) < 1.5);
const fast = v4.reduce((a, v) => v[0] > a[0] ? v : a);
console.log('fastigium approx', fast.map(v=>v.toFixed(1)), 'above McRae', mc.above(fast).toFixed(1), '(PMC9834072 M4 controls 27.43 +- 2.98, Chiari 23.23 +- 4.36)');
const v4low = T.mesh('ventricle-fourth').verts.reduce((a, v) => mc.above(v) < mc.above(a) ? v : a);
console.log('4V lowest (obex region)', v4low.map(v=>v.toFixed(1)), mc.above(v4low).toFixed(1));
