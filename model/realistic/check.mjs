// Automatic measurements of the realistic model against docs/EVIDENCE.md (CLAUDE.md rule 1a, check 2).
// Works on the raw export (millimetres, origin at the middle of the foramen magnum, +x back, +y up, +z side).
// Run: node model/realistic/check.mjs typical-raw.glb [--condition typical]
//      node model/realistic/check.mjs chiari-raw.glb --condition chiari --typical typical-raw.glb
//      node model/realistic/check.mjs surgery-raw.glb --condition surgery --typical typical-raw.glb --chiari chiari-raw.glb
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

await MeshoptDecoder.ready;
const file = process.argv[2];
const condition = process.argv.includes('--condition') ? process.argv[process.argv.indexOf('--condition') + 1] : 'typical';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
let doc = await io.read(file);
const typicalFile = process.argv.includes('--typical') ? process.argv[process.argv.indexOf('--typical') + 1] : null;
const chiariFile = process.argv.includes('--chiari') ? process.argv[process.argv.indexOf('--chiari') + 1] : null;
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
// After decompression the back edge has been removed; the line then shows where the opening was, taken from the
// typical model (same skull).
let occ;
if (condition === 'surgery') {
  if (!typicalFile) throw new Error('after decompression needs --typical <file> for the McRae line');
  const saved = doc;
  doc = await io.read(typicalFile);
  occ = section('occipital');
  doc = saved;
} else occ = section('occipital');
occ = occ.filter((p) => Math.abs(p[1]) < 20 && Math.abs(p[0]) < 35);
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
} else if (condition === 'chiari' || condition === 'syrinx') {
  console.log(`Tonsil tip: ${tipText} the McRae line (EVIDENCE.md Chiari I: at least about 5 mm below; model about 12 mm)`);
  ok(tipAbove <= -10 && tipAbove >= -14, `Chiari I tonsil tip ${tipText} the line (expected about 12 mm below, 10 to 14)`);
} else {
  console.log(`Tonsil tip: ${tipText} the McRae line (EVIDENCE.md after decompression: often rise only partly and may stay below)`);
  ok(tipAbove < 0, 'after decompression the tonsils should still be below the line');
}
console.log(`Tonsil tip: ${Math.abs(tip[2]).toFixed(1)} mm from the midline (EVIDENCE.md: shown at their lowest point on the midline view, as MRI measures them)`);
ok(Math.abs(tip[2]) < 3.5, 'the tonsils\' lowest point should be on the midline, so the midline cut shows it');
/** Front-to-back width of the tonsils 3 mm above their lowest point: rounded tips are wide, pointed ones narrow. */
// Only the tonsil around its tip (within 10 mm of it, side to side and front to back).
const tipWidth = (verts, tipY, tipV) => { const band = verts.filter((v) => Math.abs(v[1] - (tipY + 3)) < 1.2 && Math.hypot(v[0] - tipV[0], v[2] - tipV[2]) < 10); return Math.max(...band.map((v) => v[0])) - Math.min(...band.map((v) => v[0])); };
const myWidth = tipWidth(tonsil.verts, tip[1], tip);
if (typicalFile) {
  const saved = doc;
  doc = await io.read(typicalFile);
  const t = mesh('tonsil');
  const tTip = t.verts.reduce((a, v) => (v[1] < a[1] ? v : a));
  const typWidth = tipWidth(t.verts, tTip[1], tTip);
  doc = saved;
  console.log(`Tonsil tip shape (width 3 mm above the tip): ${condition} ${myWidth.toFixed(1)} mm, typical ${typWidth.toFixed(1)} mm (EVIDENCE.md: rounded vs often pointed or peg-shaped)`);
  if (condition !== 'typical') ok(myWidth < typWidth * 0.85 && myWidth > typWidth * 0.45, 'the Chiari I tonsil tip should be narrower (peg-shaped) than the typical one, but not a sharp spike (45 to 85% of its width)');
} else console.log(`Tonsil tip width 3 mm above the tip: ${myWidth.toFixed(1)} mm`);

if (chiariFile) {
  const saved = doc;
  doc = await io.read(chiariFile);
  const c = mesh('tonsil');
  const cTip = Math.min(...c.verts.map(above));
  doc = saved;
  const rise = tipAbove - cTip;
  console.log(`After decompression: tonsils risen ${rise.toFixed(1)} mm from Chiari I (EVIDENCE.md: about 2 mm on average)`);
  ok(rise >= 1 && rise <= 3, 'after decompression the tonsils should rise about 2 mm (1 to 3) from Chiari I');
}

// ---- After decompression: bone removed, C1 arch, dural patch.
if (condition === 'surgery') {
  const rem = mesh('bone-removed');
  if (rem) {
    const skullPart = rem.verts.filter((v) => above(v) > -3);
    const across = Math.max(...skullPart.map((v) => v[2])) - Math.min(...skullPart.map((v) => v[2]));
    // Along the bone: up the back of the skull from the opisthion (the window's own direction).
    const t = skullPart.map((v) => v[0] * 0.902 + v[1] * 0.432);
    const along = Math.max(...t) - Math.min(...t);
    console.log(`Bone removed at the back of the opening: about ${along.toFixed(0)} mm up the skull by ${across.toFixed(0)} mm across (EVIDENCE.md: a window about 3 x 2.5 cm)`);
    ok(across >= 26 && across <= 34 && along >= 21 && along <= 30, 'the bone removed should be about 30 mm across and 25 mm up the skull');
  } else problems.push('the removed bone is missing');
  const c1 = mesh('c1');
  const middle = c1.verts.filter((v) => Math.abs(v[2]) < 12 && v[0] > 8).length;
  console.log(`C1 back arch: ${middle} points left in its middle (EVIDENCE.md: the middle of the back arch removed)`);
  ok(middle === 0, 'the middle of the C1 back arch should be removed');
  ok(!!mesh('dural-patch'), 'the dural patch is missing');
}

// ---- Syrinx: in the neck part of the cord, inside it, near its centre.
if (condition === 'syrinx') {
  const sy = mesh('syrinx');
  if (sy) {
    const cord = mesh('cord');
    const top = sy.verts.reduce((m, v) => Math.max(m, v[1]), -Infinity), bottom = sy.verts.reduce((m, v) => Math.min(m, v[1]), Infinity);
    let worst = 0;
    for (let y = Math.ceil(bottom) + 1; y < top - 1; y += 3) {
      const s = sy.verts.filter((v) => Math.abs(v[1] - y) < 0.6), c = cord.verts.filter((v) => Math.abs(v[1] - y) < 1.5);
      if (!s.length || !c.length) continue;
      const span = (a, k) => [Math.min(...a.map((v) => v[k])), Math.max(...a.map((v) => v[k]))];
      const [sx0, sx1] = span(s, 0), [sz0, sz1] = span(s, 2), [cx0, cx1] = span(c, 0), [cz0, cz1] = span(c, 2);
      worst = Math.max(worst, (sx1 - sx0) / (cx1 - cx0), (sz1 - sz0) / (cz1 - cz0));
      ok(sx0 > cx0 && sx1 < cx1 && sz0 > cz0 && sz1 < cz1, `the syrinx should stay inside the cord (at ${y} mm)`);
    }
    console.log(`Syrinx: from ${(-top).toFixed(0)} to ${(-bottom).toFixed(0)} mm below the foramen magnum, at most ${(worst * 100).toFixed(0)}% of the cord's width (EVIDENCE.md: inside the cord, most often in the neck part)`);
    ok(top < -30, 'the syrinx should be in the neck part of the cord, below the opening');
    ok(worst < 0.7, 'the syrinx should sit inside the cord, not fill it');
  } else problems.push('the syrinx is missing');
}

// ---- Tonsils clear of bone and the spinal cord (nearest surface faces away from the point).
function insideCount(points, names) {
  const tris = [];
  for (const n of names) { const g = mesh(n); if (!g) continue; for (const t of g.tris) { const [a, b, c] = t.map((i) => g.verts[i]); if (Math.min(a[1], b[1], c[1]) < 25 && Math.max(a[1], b[1], c[1]) > -30) tris.push([a, b, c]); } }
  let n = 0;
  for (const p of points) {
    let best = Infinity, side = 1;
    for (const [a, b, c] of tris) {
      const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3, cz = (a[2] + b[2] + c[2]) / 3;
      const d = (p[0] - cx) ** 2 + (p[1] - cy) ** 2 + (p[2] - cz) ** 2;
      if (d < best) {
        best = d;
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        side = (p[0] - cx) * nrm[0] + (p[1] - cy) * nrm[1] + (p[2] - cz) * nrm[2];
      }
    }
    if (best < 4 && side < 0) n++;
  }
  return n;
}
const low = tonsil.verts.filter((v) => v[1] < 8);
const inBone = insideCount(low, ['occipital', 'c1']), inCord = insideCount(low, ['cord']);
console.log(`Tonsils inside bone: ${inBone} points, inside the spinal cord: ${inCord} points (of ${low.length} near the opening)`);
ok(inBone <= low.length * 0.01 && inCord <= low.length * 0.01, 'the tonsils should not pass into bone or the spinal cord');

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
const cordAt = (y) => { const s = section('cord', 0).filter((p) => Math.abs(p[1] - y) < 1); return s.length ? Math.max(...s.map((p) => p[0])) - Math.min(...s.map((p) => p[0])) : NaN; };
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
const v4low = v4.verts.reduce((m, v) => Math.min(m, above(v)), Infinity);
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
// The fluid runs from behind the cerebellum, through the opening, down the neck around the cord.
const csfTop = csf.verts.reduce((m, v) => Math.max(m, above(v)), -Infinity);
const csfBottom = csf.verts.reduce((m, v) => Math.min(m, v[1]), Infinity);
console.log(`Fluid reaches from ${csfTop.toFixed(0)} mm above the McRae line to ${(-csfBottom).toFixed(0)} mm below the foramen magnum (EVIDENCE.md: continuous through the foramen magnum and down behind the cord)`);
ok(csfTop > 10 && csfBottom < -90, 'the fluid should run from behind the cerebellum down the neck');
// Behind the cerebellum just above the opening: open in every view (in Chiari I narrowed by the tonsils, not emptied).
const cisterna = csf.verts.filter((v) => v[0] > 5 && above(v) > 2 && above(v) < 12).length;
console.log(`Fluid behind the cerebellum 2 to 12 mm above the line: ${cisterna} points`);
ok(cisterna > 0, 'the fluid space behind the cerebellum should not be left empty');
// At the opening, behind the cord, at the level of the Chiari I tonsils (3 to 10 mm below the line).
const cordSec = section('cord', 1.5); // just off the midline: near the opening the cord is the atlas's two medulla halves
const cordMesh = mesh('cord');
// Back of the cord at a height, from its whole surface near the midline (near the opening the cord is the atlas's
// two medulla halves, so a single midline cut can miss its back).
const cordBack = (y) => { const c = cordMesh.verts.filter((v) => Math.abs(v[1] - y) < 1.5 && Math.abs(v[2]) < 7); return c.length ? Math.max(...c.map((v) => v[0])) : 0; };
const passagePts = csf.verts.filter((v) => above(v) < -3 && above(v) > -10 && Math.abs(v[2]) < 6 && v[0] > cordBack(v[1]) + 1);
const passage = passagePts.length;
if (process.env.DEBUG && passage) { const r = (k) => `${Math.min(...passagePts.map((v) => v[k])).toFixed(1)}..${Math.max(...passagePts.map((v) => v[k])).toFixed(1)}`; console.log(`  passage points x ${r(0)} y ${r(1)} z ${r(2)}; cord back there ${cordBack(passagePts[0][1]).toFixed(1)}`); }
console.log(`Fluid behind the cord at the opening (3 to 10 mm below the line): ${passage} points (EVIDENCE.md: open in typical; in Chiari I flow often slows or is blocked there)`);
if (condition === 'chiari' || condition === 'syrinx') ok(passage === 0, 'in Chiari I the passage behind the cord at the opening should be plugged by the tonsils');
else ok(passage > 0, 'the passage behind the cord at the opening should be open');
// The cord sits inside the fluid all the way down, and the fluid column is about 14 mm front to back below C1.
const csfSec = section('csf-cranial', 1.5);
let cordOut = 0;
for (let y = -15; y >= -90; y -= 5) {
  const c = cordSec.filter((p) => Math.abs(p[1] - y) < 1), f = csfSec.filter((p) => Math.abs(p[1] - y) < 1);
  if (!c.length || !f.length) { cordOut++; continue; }
  if (Math.min(...c.map((p) => p[0])) <= Math.min(...f.map((p) => p[0])) || Math.max(...c.map((p) => p[0])) >= Math.max(...f.map((p) => p[0]))) { cordOut++; if (process.env.DEBUG) console.log('  cord outside at', y, 'cord', Math.min(...c.map((p) => p[0])).toFixed(1), Math.max(...c.map((p) => p[0])).toFixed(1), 'fluid', Math.min(...f.map((p) => p[0])).toFixed(1), Math.max(...f.map((p) => p[0])).toFixed(1)); }
}
const col = csfSec.filter((p) => Math.abs(p[1] + 50) < 1);
const colAP = Math.max(...col.map((p) => p[0])) - Math.min(...col.map((p) => p[0]));
console.log(`Fluid around the neck cord: ${colAP.toFixed(1)} mm front to back at C3; cord outside it at ${cordOut} of 16 levels (EVIDENCE.md: canal 13 to 15 mm)`);
ok(cordOut === 0, 'the spinal cord should sit inside the fluid all the way down');
ok(colAP >= 12 && colAP <= 18, 'the fluid around the neck cord should be about 14 mm front to back');
if (condition === 'surgery') {
  const reach = csf.verts.filter((v) => v[0] > 0).reduce((m, v) => Math.min(m, above(v)), Infinity);
  console.log(`Re-formed fluid space reaches ${(-reach).toFixed(1)} mm below the McRae line, behind the cord (EVIDENCE.md: re-formed and joined to the fluid behind the cord)`);
  ok(reach < -8, 'after decompression the re-formed fluid space should reach down past the opening, behind the cord');
}

if (problems.length) {
  console.error('\nFAILED: the realistic model does not match docs/EVIDENCE.md yet:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nAll measurements match docs/EVIDENCE.md.');
