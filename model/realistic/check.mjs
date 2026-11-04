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
ok(Math.abs(tip[2]) < 2.5, 'the tonsils\' lowest point should be at the midline, so the midline cut shows it');
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
    const along = Math.max(...t) - (opisthion[0] * 0.902 + opisthion[1] * 0.432); // from the opisthion up
    console.log(`Bone removed at the back of the opening: about ${along.toFixed(0)} mm up the skull by ${across.toFixed(0)} mm across (EVIDENCE.md: a window about 3 x 2.5 cm)`);
    ok(across >= 26 && across <= 34 && along >= 21 && along <= 29, 'the bone removed should be about 30 mm across and 25 mm up the skull from the opisthion');
  } else problems.push('the removed bone is missing');
  // The back rim of the opening itself, which curves down and forward off the midline: removed across about 25 mm.
  const rimPts = (g) => g.verts.filter((v) => Math.abs(v[2]) < 12 && v[0] > 6 && above(v) > -12 && (v[0] - opisthion[0]) * 0.902 + (v[1] - opisthion[1]) * 0.432 < 0).length;
  const savedDoc = doc;
  doc = await io.read(typicalFile);
  const rimBefore = rimPts(mesh('occipital'));
  doc = savedDoc;
  const rimAfter = rimPts(mesh('occipital'));
  console.log(`Back rim of the opening within 12 mm of the midline: ${rimAfter} points left (typical: ${rimBefore}) (PMC11912941: about 2.5 cm of the posterior margin excised)`);
  ok(rimBefore > 0 && rimAfter === 0, 'after decompression the back rim of the opening should be removed across about 25 mm');
  const c1 = mesh('c1');
  const middle = c1.verts.filter((v) => Math.abs(v[2]) < 12 && v[0] > 8).length;
  console.log(`C1 back arch: ${middle} points left in its middle (EVIDENCE.md: the middle of the back arch removed)`);
  ok(middle === 0, 'the middle of the C1 back arch should be removed');
  const patch = mesh('dural-patch');
  ok(!!patch, 'the dural patch is missing');
  if (patch) {
    // No fluid behind the patch: fluid points near it must lie on its front side.
    const pts = mesh('csf-cranial').verts.filter((v, i) => i % 3 === 0 && v[0] > 0 && Math.abs(v[2]) < 20 && v[1] > -25 && v[1] < 20);
    const tris = patch.tris.map((t) => t.map((i) => patch.verts[i]));
    let outside = 0;
    for (const p of pts) {
      let best = Infinity, q0 = null, n0 = null;
      for (const [a, b, c] of tris) {
        const q = closestOnTri(p, a, b, c), d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
        if (d < best) { best = d; q0 = q; const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]; n0 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; }
      }
      // behind = on the side of the patch's back face (its outward direction points toward the back of the head)
      const nl = Math.hypot(...n0) || 1;
      if (best < 6 && n0[0] > 0 && ((p[0] - q0[0]) * n0[0] + (p[1] - q0[1]) * n0[1] + (p[2] - q0[2]) * n0[2]) / nl > 0.3) { outside++; if (process.env.DEBUG && outside < 15) console.log("  behind patch", p.map((x) => x.toFixed(1)).join(","), "dist", best.toFixed(1)); }
    }
    console.log(`Fluid behind the dural patch: ${outside} points (EVIDENCE.md: re-formed space in front of it)`);
    ok(outside === 0, 'no fluid should sit behind the dural patch');
    // The patch covers the whole bone window: looking straight back from the fluid above the opening, there is
    // always bone or the patch (no gap where the fluid is open to the outside).
    const shell = [...['occipital', 'skull'].flatMap((n) => { const g = mesh(n); return g ? g.tris.map((t) => t.map((i) => g.verts[i])) : []; }), ...tris];
    const pts2 = mesh('csf-cranial').verts.filter((v, i) => i % 3 === 0 && v[0] > 0 && Math.abs(v[2]) < 20 && above(v) > -18 && v[1] < 20);
    const shellC1 = [...shell, ...['c1', 'c2'].flatMap((n) => { const g = mesh(n); return g ? g.tris.map((t) => t.map((i) => g.verts[i])) : []; })];
    const uncovered = pts2.filter((p) => rayHits(p, [1, 0, 0], shellC1) === 0).length;
    console.log(`Fluid in the bone window not covered by the patch: ${uncovered} points`);
    ok(uncovered === 0, 'the dural patch should cover the whole bone window');
    const cbM = mesh('cerebellum');
    const cbT = cbM.tris.map((t) => t.map((i) => cbM.verts[i])).filter((t) => t.some((v) => v[0] > 10));
    const dirs5 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0.6, 0.48, 0.64]];
    const patchInCb = patch.verts.filter((v) => dirs5.filter((d) => rayHits(v, d, cbT) % 2 === 1).length >= 3).length;
    console.log(`Dural patch inside the cerebellum: ${patchInCb} points`);
    ok(patchInCb === 0, 'the dural patch should stay out of the cerebellum');
  }
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

/** Closest point on triangle abc to p (Ericson, Real-Time Collision Detection). */
function closestOnTri(p, a, b, c) {
  const sub = (u, v) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]], dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const add = (u, v, k) => [u[0] + v[0] * k, u[1] + v[1] * k, u[2] + v[2] * k];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap); if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return add(a, ab, d1 / (d1 - d3));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return add(a, ac, d2 / (d2 - d6));
  const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return add(b, sub(c, b), (d4 - d3) / (d4 - d3 + d5 - d6));
  const den = 1 / (va + vb + vc); return add(add(a, ab, vb * den), ac, vc * den);
}
/** How deep each point lies inside the named surfaces (0 if outside), using the nearest surface point and its facing. */
/* Only small overlaps (up to `reach` mm) are judged: some atlas surfaces face inconsistent ways, which makes
   deeper readings unreliable. */
/** Number of times a ray from o along d crosses the triangles (Moller-Trumbore). */
function rayHits(o, d, tris) {
  let n = 0;
  for (const [a, b, c] of tris) {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const p = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]];
    const det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2];
    if (Math.abs(det) < 1e-9) continue;
    const s = [o[0] - a[0], o[1] - a[1], o[2] - a[2]], u = (s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) / det;
    if (u < 0 || u > 1) continue;
    const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
    const v = (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]) / det;
    if (v < 0 || u + v > 1) continue;
    if ((e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det > 1e-6) n++;
  }
  return n;
}
/** How deep each point is inside the named closed structures (0 when outside). The nearest face's direction
 * finds candidates; with confirm, each candidate must also be inside by ray parity (odd crossings) in at least
 * 3 of 5 directions, because near edges and folds the nearest face can point the wrong way. */
function depthsInside(points, names, reach = 2.5, confirm = false) {
  const d = depthsInsideRaw(points, names, reach);
  if (!confirm) return d;
  const tris = [];
  for (const n of names) { const g = mesh(n); if (g) for (const t of g.tris) tris.push(t.map((i) => g.verts[i])); }
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0.6, 0.64, 0.48]];
  return d.map((v, i) => (v > 0 && dirs.filter((dir) => rayHits(points[i], dir, tris) % 2 === 1).length >= 3 ? v : 0));
}
function depthsInsideRaw(points, names, reach) {
  const tris = [];
  for (const n of names) { const g = mesh(n); if (!g) continue; for (const t of g.tris) tris.push(t.map((i) => g.verts[i])); }
  const B = 4, grid = new Map(), key = (x, y, z) => `${x},${y},${z}`;
  for (const t of tris) {
    const lo = [0, 1, 2].map((k) => Math.floor((Math.min(t[0][k], t[1][k], t[2][k]) - reach) / B));
    const hi = [0, 1, 2].map((k) => Math.floor((Math.max(t[0][k], t[1][k], t[2][k]) + reach) / B));
    for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) {
      const k = key(x, y, z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(t);
    }
  }
  return points.map((p) => {
    const cand = grid.get(key(...p.map((v) => Math.floor(v / B)))) ?? [];
    let best = Infinity, side = 1;
    for (const [a, b, c] of cand) {
      const q = closestOnTri(p, a, b, c), d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      if (d < best) {
        best = d;
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        side = (p[0] - q[0]) * nrm[0] + (p[1] - q[1]) * nrm[1] + (p[2] - q[2]) * nrm[2];
      }
    }
    return best < reach && side < 0 ? best : 0;
  });
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
const deep = (d) => d.filter((x) => x > 0.5);
const inBone = deep(depthsInside(low, ['occipital', 'c1', 'c2'])), inCord = deep(depthsInside(low, ['cord', 'brainstem'], 2.5, true));
console.log(`Tonsils inside bone: ${inBone.length} points, inside the cord or brainstem: ${inCord.length} points (of ${low.length} near the opening; deeper than 0.5 mm)`);
ok(inBone.length === 0 && inCord.length === 0, 'the tonsils should not pass into bone, the cord or the brainstem');
// The tonsils reach the midline near their lowest point, so the midline cut shows them there.
const tonsilMid = section('tonsil').filter((p) => p[1] < tip[1] + 3);
console.log(`Tonsils on the midline near their tip: ${tonsilMid.length ? 'yes' : 'no'} (lowest point ${Math.abs(tip[2]).toFixed(1)} mm from the midline)`);
ok(tonsilMid.length > 0, 'the midline cut should pass through the tonsils near their lowest point');

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
// The fluid has two parts: the space around the cerebellum (csf-cranial, computed) and a solid tube around the
// spinal cord down the neck (csf-spinal; the cord sits inside it). Together they run from behind the cerebellum,
// through the opening, down the neck.
const spinal = mesh('csf-spinal');
ok(!!spinal, 'the fluid around the spinal cord is missing');
const csfTop = csf.verts.reduce((m, v) => Math.max(m, above(v)), -Infinity);
const cranialBottom = csf.verts.reduce((m, v) => Math.min(m, above(v)), Infinity);
const spinalTop = spinal.verts.reduce((m, v) => Math.max(m, above(v)), -Infinity);
const spinalBottom = spinal.verts.reduce((m, v) => Math.min(m, v[1]), Infinity);
console.log(`Fluid: around the cerebellum from ${csfTop.toFixed(0)} mm above the line down to ${(-cranialBottom).toFixed(1)} mm below it; around the cord from ${spinalTop.toFixed(1)} mm above the line to ${(-spinalBottom).toFixed(0)} mm below the foramen magnum (EVIDENCE.md: continuous through the foramen magnum and down behind the cord)`);
ok(csfTop > 10 && spinalBottom < -90 && spinalTop > cranialBottom + 1, 'the fluid should run from behind the cerebellum through the opening and down the neck, the two parts overlapping at the opening');
// Behind the cerebellum just above the opening: open in every view (in Chiari I narrowed by the tonsils, not emptied).
const cisterna = csf.verts.filter((v) => v[0] > 5 && above(v) > 2 && above(v) < 12).length;
console.log(`Fluid behind the cerebellum 2 to 12 mm above the line: ${cisterna} points`);
ok(cisterna > 0, 'the fluid space behind the cerebellum should not be left empty');
// At the opening, behind the cord, at the level of the Chiari I tonsils (3 to 10 mm below the line).
const cordMesh = mesh('cord');
const cordBack = (y) => { const c = cordMesh.verts.filter((v) => Math.abs(v[1] - y) < 1.5 && Math.abs(v[2]) < 7); return c.length ? Math.max(...c.map((v) => v[0])) : 0; };
const passagePts = [...csf.verts, ...spinal.verts].filter((v) => above(v) < -3 && above(v) > -10 && Math.abs(v[2]) < 6 && v[0] > cordBack(v[1]) + 1);
const passage = passagePts.length;
console.log(`Fluid behind the cord at the opening (3 to 10 mm below the line): ${passage} points (EVIDENCE.md: open in typical; in Chiari I flow often slows or is blocked there)`);
if (condition === 'chiari' || condition === 'syrinx') ok(passage === 0, 'in Chiari I the passage behind the cord at the opening should be plugged by the tonsils');
else ok(passage > 0, 'the passage behind the cord at the opening should be open');
// The cord sits inside the fluid tube at every level, and the tube is about 14 mm front to back below C1.
const cordSec = section('cord'), tubeSec = section('csf-spinal');
let cordOut = 0;
for (let y = -15; y >= -90; y -= 5) {
  const c = cordSec.filter((p) => Math.abs(p[1] - y) < 1.5), f = tubeSec.filter((p) => Math.abs(p[1] - y) < 1);
  if (!c.length || !f.length || Math.min(...c.map((p) => p[0])) <= Math.min(...f.map((p) => p[0])) || Math.max(...c.map((p) => p[0])) >= Math.max(...f.map((p) => p[0]))) {
    cordOut++;
    if (process.env.DEBUG) console.log('  cord not inside the fluid at', y, 'cord', c.length ? [Math.min(...c.map((p) => p[0])), Math.max(...c.map((p) => p[0]))].map((v) => v.toFixed(1)).join('..') : '-', 'tube', f.length ? [Math.min(...f.map((p) => p[0])), Math.max(...f.map((p) => p[0]))].map((v) => v.toFixed(1)).join('..') : '-');
  }
}
const col = tubeSec.filter((p) => Math.abs(p[1] + 50) < 1);
const colAP = Math.max(...col.map((p) => p[0])) - Math.min(...col.map((p) => p[0]));
console.log(`Fluid around the neck cord: ${colAP.toFixed(1)} mm front to back at C3; cord not inside it at ${cordOut} of 16 levels (EVIDENCE.md: canal 13 to 15 mm)`);
ok(cordOut === 0, 'the spinal cord should sit inside the fluid all the way down');
ok(colAP >= 12.5 && colAP <= 15.5, 'the fluid around the neck cord should be about 14 mm front to back (13 to 15)');
// The fluid stays out of bone and discs (both parts), and the space around the cerebellum stays out of the brain
// (sampled; deeper than 0.3 mm). The tube contains the cord by design; the cut view shows the cord over it.
const csfSample = [...csf.verts.filter((v, i) => i % 4 === 0), ...spinal.verts];
const intoBone = depthsInside(csfSample, ['occipital', 'c1', 'c2', 'c3-c5', 'discs']).filter((d) => d > 0.3);
const cranialSample = csf.verts.filter((v, i) => i % 4 === 0);
const brainDepth = depthsInside(cranialSample, ['cord', 'tonsil', 'brainstem', 'syrinx'], 2.5, true);
const intoBrain = brainDepth.filter((d) => d > 0.3);
if (process.env.DEBUG) { for (const n of ['cord', 'tonsil', 'brainstem']) console.log(`  fluid inside ${n}: ${depthsInside(cranialSample, [n], 2.5, true).filter((d) => d > 0.3).length}`); const w = cranialSample.filter((_, i) => brainDepth[i] > 0.3); if (w.length) console.log(`  heights: ${[...new Set(w.map((v) => Math.round(v[1])))].sort((a, b) => a - b).join(' ')}`); }
// The tonsils are never inside either fluid surface (it would be drawn over them in the cut view), counted by rays.
{
  const fluidTris = ['csf-cranial', 'csf-spinal'].flatMap((n) => { const g = mesh(n); return g ? g.tris.map((t) => t.map((i) => g.verts[i])).filter((t) => t.some((v) => v[1] < 20 && v[1] > -40)) : []; });
  const tonsilPts = tonsil.verts.filter((v, i) => i % 10 === 0 && v[1] < 10);
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0.6, 0.64, 0.48]];
  const engulfed = tonsilPts.filter((p) => dirs.filter((d) => rayHits(p, d, fluidTris) % 2 === 1).length >= 3).length;
  console.log(`Tonsils inside a fluid surface: ${engulfed} of ${tonsilPts.length} points`);
  ok(engulfed === 0, 'the tonsils should not sit inside the fluid (it would cover them in the cut view)');
}
console.log(`Fluid inside bone or discs: ${intoBone.length} points (deepest ${intoBone.length ? Math.max(...intoBone).toFixed(1) : 0} mm); fluid around the cerebellum inside the cord, tonsils or brainstem: ${intoBrain.length} points (deepest ${intoBrain.length ? Math.max(...intoBrain).toFixed(1) : 0} mm)`);
ok(intoBone.length <= csfSample.length * 0.002, 'the fluid should stay out of the bones and discs');
ok(intoBrain.length === 0, 'the fluid should stay out of the cord, tonsils and brainstem (otherwise it paints over them in the cut view)');

// ---- The tonsil surface is smooth, not crumpled: near and below the McRae line (up to 4 mm above it), at most 1% of
// the surface area may be folded back, meaning a face turned more than 120 degrees from the faces next to it (the
// independent audit's measure). Vertices at the same place are merged first.
{
  const key = (v) => v.map((x) => Math.round(x * 1000)).join(',');
  const id = new Map(), P = [];
  const vi = tonsil.verts.map((v) => { const k = key(v); if (!id.has(k)) { id.set(k, P.length); P.push(v); } return id.get(k); });
  const faces = tonsil.tris.map((t) => t.map((i) => vi[i]));
  const fn = faces.map(([a, b, c]) => { const u = [0, 1, 2].map((k) => P[b][k] - P[a][k]), w = [0, 1, 2].map((k) => P[c][k] - P[a][k]); return [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; });
  const edges = new Map();
  faces.forEach((f, i) => { for (let e = 0; e < 3; e++) { const a = f[e], b = f[(e + 1) % 3], k = a < b ? `${a}_${b}` : `${b}_${a}`; if (!edges.has(k)) edges.set(k, []); edges.get(k).push(i); } });
  const len = (v) => Math.hypot(v[0], v[1], v[2]);
  let bandArea = 0, foldArea = 0, folded = 0;
  faces.forEach((f, i) => {
    const ctr = [0, 1, 2].map((k) => (P[f[0]][k] + P[f[1]][k] + P[f[2]][k]) / 3);
    if (above(ctr) > 4) return;
    const area = len(fn[i]) / 2;
    bandArea += area;
    const avg = [0, 0, 0];
    for (let e = 0; e < 3; e++) { const a = f[e], b = f[(e + 1) % 3]; for (const j of edges.get(a < b ? `${a}_${b}` : `${b}_${a}`)) if (j !== i) for (let k = 0; k < 3; k++) avg[k] += fn[j][k]; }
    const cos = (avg[0] * fn[i][0] + avg[1] * fn[i][1] + avg[2] * fn[i][2]) / (len(avg) * len(fn[i]) || 1);
    if (cos < -0.5) { folded++; foldArea += area; }
  });
  const pct = (100 * foldArea) / Math.max(1e-9, bandArea);
  console.log(`Tonsil surface up to 4 mm above the line: ${pct.toFixed(2)}% of its area folded (${folded} faces)`);
  ok(pct <= 1, 'the tonsil surface should be smooth (no crumpled folds): at most 1% of its area folded');
}

// ---- From behind, the joined tonsil tips still read as two: a groove down the middle of their back, above the tip.
{
  const tipA = above(tip);
  let shallowest = Infinity, rows = 0;
  for (let h = 4; h <= 12; h += 1) {
    const a = tipA + h;
    if (a > 5) break;
    const row = tonsil.verts.filter((v) => Math.abs(above(v) - a) < 0.5);
    const mid = row.filter((v) => Math.abs(v[2]) < 0.5), side = row.filter((v) => Math.abs(v[2]) > 2 && Math.abs(v[2]) < 4);
    if (!mid.length || !side.length) continue;
    rows++;
    shallowest = Math.min(shallowest, Math.max(...side.map((v) => v[0])) - Math.max(...mid.map((v) => v[0])));
  }
  console.log(`Groove between the tonsils, from behind: ${rows ? shallowest.toFixed(1) + ' mm deep at its shallowest' : 'no joined part to check'} (${rows} heights)`);
  if (rows) ok(shallowest >= 0.4, 'the joined tonsil tips should keep a groove between them, so they read as two');
}

// ---- Typical: behind the cord, from the opening down to C1, the canal is fluid out to its back edge (the line
// from the opisthion to C1's back arch), not left empty.
if (condition === 'typical') {
  const c1 = mesh('c1');
  const arch = c1.verts.filter((v) => Math.abs(v[2]) < 3 && v[0] > 3).reduce((a, v) => (v[0] < a[0] ? v : a));
  const fl = [...section('csf-spinal'), ...section('csf-cranial')];
  const cordS = section('cord'), bonesS = [...section('c1'), ...section('occipital')];
  let worst = Infinity, at = '';
  for (let y = Math.round(opisthion[1]) - 3; y >= arch[1] + 1; y -= 2) {
    const t = (opisthion[1] - y) / (opisthion[1] - arch[1]);
    const canal = opisthion[0] + (arch[0] - opisthion[0]) * t;
    const cb = cordS.filter((p) => Math.abs(p[1] - y) < 1.5), fr = fl.filter((p) => Math.abs(p[1] - y) < 1);
    if (!cb.length || !fr.length) { worst = 0; at = `${y} (no section)`; break; }
    const cordBackX = Math.max(...cb.map((p) => p[0])), fluidBackX = Math.max(...fr.map((p) => p[0]));
    // the back edge is the line, or bone (C1's arch top) where it comes first
    const bone = bonesS.filter((p) => p[1] <= y + 0.3 && p[1] >= y - 1 && p[0] > cordBackX).map((p) => p[0]);
    // measured from the opening down to the top of C1's arch (below that the arch itself is the back edge)
    if (bone.length) break;
    const edge = canal;
    // fluid past bone at the same height (within 0.3 mm) would be inside or behind it
    const past = fr.some((f) => bonesS.some((b) => Math.abs(b[1] - f[1]) < 0.3 && b[0] > cordBackX && f[0] > b[0] + 0.5));
    if (past) { worst = 0; at = `${y} mm (fluid passes the bone)`; break; }
    const share = (fluidBackX - cordBackX) / (edge - cordBackX);
    if (share < worst) { worst = share; at = `${y} mm`; }
  }
  console.log(`Canal behind the cord from the opening to the top of C1: fluid reaches ${(worst * 100).toFixed(0)}% of the way to its back edge at least (at ${at}; C1 arch at ${arch.map((v) => v.toFixed(1)).join(', ')})`);
  ok(worst >= 0.85, 'in Typical the fluid behind the cord should reach the back of the canal from the opening down to C1');
}

// ---- Fluid all the way round the cord, at every height below C1 (not only on the midline): cross-sections across
// the neck, measured from the cord's centre in 12 directions. Chiari I's back is plugged near the opening, so its
// check starts lower.
{
  const ring = (g, y0) => {
    const pts = [];
    for (const t of g.tris) for (let e = 0; e < 3; e++) {
      const a = g.verts[t[e]], b = g.verts[t[(e + 1) % 3]];
      if ((a[1] > y0) !== (b[1] > y0)) { const k = (y0 - a[1]) / (b[1] - a[1]); pts.push([a[0] + k * (b[0] - a[0]), a[2] + k * (b[2] - a[2])]); }
    }
    return pts;
  };
  let thinnest = Infinity, where = '';
  for (let y = -20; y >= -90; y -= 5) {
    const c = ring(cordMesh, y), f = ring(spinal, y);
    if (c.length < 6 || f.length < 6) { thinnest = 0; where = `${y} (no section)`; break; }
    const cx = c.reduce((s, p) => s + p[0], 0) / c.length, cz = c.reduce((s, p) => s + p[1], 0) / c.length;
    const reach = (pts, ang) => {
      let best = 0;
      for (const p of pts) {
        const dx = p[0] - cx, dz = p[1] - cz, a = Math.atan2(dz, dx);
        let da = Math.abs(a - ang); if (da > Math.PI) da = 2 * Math.PI - da;
        if (da < Math.PI / 12) best = Math.max(best, Math.hypot(dx, dz));
      }
      return best;
    };
    for (let k = 0; k < 12; k++) {
      const ang = -Math.PI + (k * Math.PI) / 6;
      const gap = reach(f, ang) - reach(c, ang);
      if (gap < thinnest) { thinnest = gap; where = `${y} mm, ${Math.round((ang * 180) / Math.PI)} deg`; }
    }
  }
  console.log(`Fluid around the cord below C1: at least ${thinnest.toFixed(1)} mm thick all the way round (thinnest at ${where})`);
  ok(thinnest >= 0.75, 'the fluid should surround the neck cord on every side, at every height (at least 0.75 mm where it meets the bone)');
}

// ---- No brain outside the skull: looking outward from the cerebellum's centre, every cerebellum point above the
// opening has bone beyond it.
{
  const cb = mesh('cerebellum');
  const ctr = [0, 1, 2].map((k) => cb.verts.reduce((s, v) => s + v[k], 0) / cb.verts.length);
  const shell = ['occipital', 'skull'].flatMap((n) => { const g = mesh(n); return g ? g.tris.map((t) => t.map((i) => g.verts[i])) : []; })
    .filter((t) => t.some((v) => v[0] > -10));
  // the back half, where the cerebellum lies against the occipital bone
  const pts = cb.verts.filter((v, i) => i % 7 === 0 && above(v) > 5 && v[0] > ctr[0]);
  // looking straight out sideways and back (level, so the ray can't slip out through the opening below)
  const outside = pts.filter((v) => { const d = [v[0] - ctr[0], 0, v[2] - ctr[2]], L = Math.hypot(...d); return rayHits(v, d.map((x) => x / L), shell) === 0; });
  console.log(`Cerebellum outside the skull: ${outside.length} of ${pts.length} points`);
  if (process.env.DEBUG) for (const v of outside.slice(0, 6)) console.log('  outside', v.map((x) => x.toFixed(1)).join(','));
  ok(outside.length === 0, 'no part of the cerebellum should show outside the skull');
}

// ---- Fourth ventricle: the tonsils stay out of it, and its outlet opens into the fluid behind the cerebellum.
{
  const v4 = mesh('ventricle-fourth');
  const v4T = v4.tris.map((t) => t.map((i) => v4.verts[i]));
  const tonT = tonsil.tris.map((t) => t.map((i) => tonsil.verts[i]));
  const dirs = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0.6, 0.64, 0.48]];
  const inside = (p, T) => dirs.filter((d) => rayHits(p, d, T) % 2 === 1).length >= 3;
  const tonIn = tonsil.verts.filter((v, i) => i % 5 === 0 && above(v) > 3 && inside(v, v4T)).length;
  const v4In = v4.verts.filter((v) => above(v) < 20 && inside(v, tonT)).length;
  // measured in the midline cut (what the visitor sees): from the ventricle's lowest point there to the fluid
  const v4cut = section('ventricle-fourth'), csfCut = section('csf-cranial');
  const outlet = v4cut.reduce((a, p) => (above(p) < above(a) ? p : a));
  let near = Infinity;
  for (const p of csfCut) near = Math.min(near, dist(p, outlet));
  console.log(`Fourth ventricle: tonsils inside it ${tonIn}, it inside the tonsils ${v4In}; fluid behind the cerebellum ${near.toFixed(1)} mm from its outlet in the midline cut (EVIDENCE.md: from the fourth ventricle outlet into the cisterna magna)`);
  ok(tonIn === 0 && v4In === 0, 'the tonsils should stay out of the fourth ventricle');
  ok(near <= 2, 'the fourth ventricle outlet should open into the fluid behind the cerebellum in the midline cut (within about 2 mm)');
}

if (problems.length) {
  console.error('\nFAILED: the realistic model does not match docs/EVIDENCE.md yet:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nAll measurements match docs/EVIDENCE.md.');
