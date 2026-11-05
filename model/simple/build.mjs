/**
 * Builds the Simple 3D model (public/models/simple.glb) from the midline figure.
 *
 * How it works, in plain terms:
 * - Every structure starts as its midline shape from src/lib/anatomy-shapes.json, which is the
 *   same shape the 2D figure draws (so EVIDENCE.md numbers, like the tonsil tip relative to the
 *   McRae line, carry over exactly).
 * - Each shape is given width to either side of the midline ("inflated"), rounded at the edges.
 *   The midline slice of every structure is therefore exactly its figure shape.
 * - The skull is a shell around an inflated cranial cavity, with the foramen magnum left open.
 *   The upper neck vertebrae get rings (arches) around the spinal canal.
 * - Surfaces are extracted from these 3D fields (surface nets), smoothed, simplified and saved
 *   as a compressed glTF file. Re-running gives the same result.
 *
 * Units: figure units (2 per mm) while building; the saved model is in millimetres with the
 * origin at the middle of the foramen magnum, x toward the back of the head, y up, z to the side.
 *
 * Run: npm run model:simple
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, quantize, meshopt, dedup } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const S = JSON.parse(readFileSync(new URL('../../src/lib/anatomy-shapes.json', import.meta.url), 'utf8'));
const OUT = new URL('../../public/models/simple.glb', import.meta.url);

// ---------------------------------------------------------------- 2D geometry

/** Parse an absolute SVG path (M, L, C, Z only, as used by the figure) into polylines. */
function pathToPolylines(d, bezierSteps = 16) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g);
  const lines = [];
  let cur = null;
  let i = 0;
  let cmd = null;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === 'M') {
      cur = { pts: [[num(), num()]], closed: false };
      lines.push(cur);
      cmd = 'L';
    } else if (cmd === 'L') {
      cur.pts.push([num(), num()]);
    } else if (cmd === 'C') {
      const p0 = cur.pts[cur.pts.length - 1];
      const p1 = [num(), num()], p2 = [num(), num()], p3 = [num(), num()];
      for (let s = 1; s <= bezierSteps; s++) {
        const t = s / bezierSteps, u = 1 - t;
        cur.pts.push([
          u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ]);
      }
    } else if (cmd === 'Z') {
      cur.closed = true;
      cmd = null;
    }
  }
  return lines;
}

function ellipsePolyline([cx, cy, rx, ry], n = 64) {
  const pts = [];
  for (let k = 0; k < n; k++) pts.push([cx + rx * Math.cos((2 * Math.PI * k) / n), cy + ry * Math.sin((2 * Math.PI * k) / n)]);
  return [{ pts, closed: true }];
}

function rectPolyline([x, y, w, h, r]) {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let k = 0; k <= 6; k++) {
      const a = a0 + (Math.PI / 2) * (k / 6);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return [{ pts, closed: true }];
}

function shapeLines(shape) {
  if (typeof shape === 'string') return pathToPolylines(shape);
  if (shape.ellipse) return ellipsePolyline(shape.ellipse);
  if (shape.rect) return rectPolyline(shape.rect);
  return pathToPolylines(shape.d);
}

function segmentsOf(lines, closedOverride) {
  const segs = [];
  for (const l of lines) {
    const closed = closedOverride ?? l.closed;
    const n = l.pts.length;
    for (let k = 0; k < n - 1; k++) segs.push([...l.pts[k], ...l.pts[k + 1]]);
    if (closed) segs.push([...l.pts[n - 1], ...l.pts[0]]);
  }
  return segs;
}

function distToSegs(x, y, segs) {
  let best = Infinity;
  for (const [ax, ay, bx, by] of segs) {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1e-9;
    let t = ((x - ax) * dx + (y - ay) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = ax + t * dx - x, ey = ay + t * dy - y;
    const d2 = ex * ex + ey * ey;
    if (d2 < best) best = d2;
  }
  return Math.sqrt(best);
}

function insideSegs(x, y, segs) {
  let inside = false;
  for (const [ax, ay, bx, by] of segs) {
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

function bboxOf(segs, margin) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [ax, ay, bx, by] of segs) {
    x0 = Math.min(x0, ax, bx); y0 = Math.min(y0, ay, by);
    x1 = Math.max(x1, ax, bx); y1 = Math.max(y1, ay, by);
  }
  return [x0 - margin, y0 - margin, x1 + margin, y1 + margin];
}

/**
 * Signed distance grid of a 2D region: positive inside (in figure units).
 * `band` turns an open line into a filled band of that half-width (like an SVG stroke).
 */
function distanceGrid(shape, { band = 0, unsigned = false, margin = 12, step = 1, blur = 0 } = {}) {
  const lines = shapeLines(shape);
  const segs = segmentsOf(lines, band || unsigned ? false : true);
  const [x0, y0, x1, y1] = bboxOf(segs, margin + band);
  const nx = Math.ceil((x1 - x0) / step) + 1, ny = Math.ceil((y1 - y0) / step) + 1;
  const data = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const x = x0 + i * step, y = y0 + j * step;
      const d = distToSegs(x, y, segs);
      data[i + nx * j] = unsigned ? d : band ? band - d : insideSegs(x, y, segs) ? d : -d;
    }
  }
  let dMax = 0;
  for (const v of data) if (v > dMax) dMax = v;
  const sample = (x, y) => {
    const fx = (x - x0) / step, fy = (y - y0) / step;
    if (fx < 0 || fy < 0 || fx >= nx - 1 || fy >= ny - 1) return unsigned ? margin : -margin;
    const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j;
    const a = data[i + nx * j], b = data[i + 1 + nx * j], c = data[i + nx * (j + 1)], e = data[i + 1 + nx * (j + 1)];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + e * tx) * ty;
  };
  // Optional smoothed copy (repeated box blur, `blur` cells wide), for surfaces that must stay crease-free.
  let sampleSmooth = sample;
  if (blur > 0) {
    let a = Float32Array.from(data), b = new Float32Array(nx * ny);
    for (let pass = 0; pass < 3; pass++) {
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        let sum = 0, n = 0;
        for (let k = -blur; k <= blur; k++) { const ii = i + k; if (ii >= 0 && ii < nx) { sum += a[ii + nx * j]; n++; } }
        b[i + nx * j] = sum / n;
      }
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        let sum = 0, n = 0;
        for (let k = -blur; k <= blur; k++) { const jj = j + k; if (jj >= 0 && jj < ny) { sum += b[i + nx * jj]; n++; } }
        a[i + nx * j] = sum / n;
      }
    }
    sampleSmooth = (x, y) => {
      const fx = (x - x0) / step, fy = (y - y0) / step;
      if (fx < 0 || fy < 0 || fx >= nx - 1 || fy >= ny - 1) return -margin;
      const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j;
      const p = a[i + nx * j], q = a[i + 1 + nx * j], r = a[i + nx * (j + 1)], e = a[i + 1 + nx * (j + 1)];
      return (p * (1 - tx) + q * tx) * (1 - ty) + (r * (1 - tx) + e * tx) * ty;
    };
  }
  return { sample, sampleSmooth, bbox: [x0, y0, x1, y1], dMax };
}

// ---------------------------------------------------------------- 3D fields

/** Rounded half-width: 0 at the edge, rising like a quarter-ellipse to W over `r` units inward. */
function roundedHalfWidth(d, W, r) {
  if (d <= 0) return d;
  const t = Math.min(d, r) / r;
  return W * Math.sqrt(1 - (1 - t) * (1 - t));
}

/**
 * A midline shape given width to the sides. `W` may be a number or a function of (x, y).
 * `r` is how far in from the edge the rounding reaches; 'auto' rounds over the whole shape
 * (the deepest point of the shape gets the full width W), which gives egg-like, natural forms.
 */
function inflate(grid, W, r = 'auto') {
  // (see inflatedField below)
  if (r === 'auto') r = grid.dMax;
  const Wf = typeof W === 'function' ? W : () => W;
  return {
    bbox: grid.bbox,
    zMax: typeof W === 'function' ? null : W,
    f: (x, y, z) => inflatedField(grid.sample(x, y), Wf(x, y), r, z),
  };
}

/**
 * Field of an inflated shape (positive inside). Outside the midline outline it is minus the distance
 * to the outline's rim, which stays smooth across the midline, so blends with other shapes don't crease.
 */
function inflatedField(d, W, r, z) {
  return d > 0 ? roundedHalfWidth(d, W, r) - Math.abs(z) : -Math.hypot(d, z);
}

const smoothstep = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- surface extraction

/** Surface nets: smooth quads where the field crosses zero. Field > 0 is inside. */
function extract(f, [x0, y0, z0], [x1, y1, z1], step) {
  const nx = Math.ceil((x1 - x0) / step) + 1, ny = Math.ceil((y1 - y0) / step) + 1, nz = Math.ceil((z1 - z0) / step) + 1;
  const v = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) v[i + nx * (j + ny * k)] = f(x0 + i * step, y0 + j * step, z0 + k * step);

  const idx = (i, j, k) => i + nx * (j + ny * k);
  const cellVert = new Int32Array(nx * ny * nz).fill(-1);
  const pos = [];
  const corners = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          cv[c] = v[idx(i + corners[c][0], j + corners[c][1], k + corners[c][2])];
          if (cv[c] > 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (const [a, b] of edges) {
          if (cv[a] > 0 === cv[b] > 0) continue;
          const t = cv[a] / (cv[a] - cv[b]);
          sx += corners[a][0] + t * (corners[b][0] - corners[a][0]);
          sy += corners[a][1] + t * (corners[b][1] - corners[a][1]);
          sz += corners[a][2] + t * (corners[b][2] - corners[a][2]);
          n++;
        }
        cellVert[idx(i, j, k)] = pos.length / 3;
        pos.push(x0 + (i + sx / n) * step, y0 + (j + sy / n) * step, z0 + (k + sz / n) * step);
      }

  const tris = [];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) tris.push(a, d, c, a, c, b);
    else tris.push(a, b, c, a, c, d);
  };
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const a = v[idx(i, j, k)] > 0, b = v[idx(i + 1, j, k)] > 0;
        if (a !== b) quad(cellVert[idx(i, j - 1, k - 1)], cellVert[idx(i, j, k - 1)], cellVert[idx(i, j, k)], cellVert[idx(i, j - 1, k)], !a);
      }
  for (let k = 1; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const a = v[idx(i, j, k)] > 0, b = v[idx(i, j + 1, k)] > 0;
        if (a !== b) quad(cellVert[idx(i - 1, j, k - 1)], cellVert[idx(i - 1, j, k)], cellVert[idx(i, j, k)], cellVert[idx(i, j, k - 1)], !a);
      }
  for (let k = 0; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const a = v[idx(i, j, k)] > 0, b = v[idx(i, j, k + 1)] > 0;
        if (a !== b) quad(cellVert[idx(i - 1, j - 1, k)], cellVert[idx(i, j - 1, k)], cellVert[idx(i, j, k)], cellVert[idx(i - 1, j, k)], !a);
      }
  return { pos: new Float32Array(pos), tris: new Uint32Array(tris) };
}

/** Taubin smoothing: removes the voxel stair-steps without shrinking the shape. */
function smooth(mesh, iterations = 10) {
  const { pos, tris } = mesh;
  const n = pos.length / 3;
  const nbr = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < tris.length; t += 3)
    for (let e = 0; e < 3; e++) {
      const a = tris[t + e], b = tris[t + ((e + 1) % 3)];
      nbr[a].add(b);
      nbr[b].add(a);
    }
  const lists = nbr.map((s) => Array.from(s));
  const tmp = new Float32Array(pos.length);
  const pass = (factor) => {
    for (let a = 0; a < n; a++) {
      const L = lists[a];
      if (!L.length) { tmp.set(pos.subarray(a * 3, a * 3 + 3), a * 3); continue; }
      let sx = 0, sy = 0, sz = 0;
      for (const b of L) { sx += pos[b * 3]; sy += pos[b * 3 + 1]; sz += pos[b * 3 + 2]; }
      tmp[a * 3] = pos[a * 3] + factor * (sx / L.length - pos[a * 3]);
      tmp[a * 3 + 1] = pos[a * 3 + 1] + factor * (sy / L.length - pos[a * 3 + 1]);
      tmp[a * 3 + 2] = pos[a * 3 + 2] + factor * (sz / L.length - pos[a * 3 + 2]);
    }
    pos.set(tmp);
  };
  for (let it = 0; it < iterations; it++) { pass(0.5); pass(-0.53); }
  return mesh;
}

// ---------------------------------------------------------------- the structures

// Cranial cavity: inside the skull's midline curve, closed along the skull base, the clivus and
// across the foramen magnum (which is cut open again below).
const CAVITY_PATH =
  S.skull.d +
  ' L334 440 C318 414 304 382 299 360 L290 368 C284 381 268 378 266 362 C265 356 261 352 252 351 C222 350 185 356 150 352 Z';
const cavity = distanceGrid(CAVITY_PATH, { margin: 130, step: 1 });
const CAV_W = 132; // half-width of the cranial cavity at its widest: 66 mm
const CAV_R = cavity.dMax;
const cavityLateral = (x, y) => roundedHalfWidth(cavity.sample(x, y), CAV_W, CAV_R);
/** The cranial cavity grown (offset > 0) or shrunk (offset < 0) by `offset` units, as a field. */
const cavityOffset = (x, y, z, offset) => inflatedField(cavity.sample(x, y) + offset, CAV_W + offset, CAV_R + offset, z);
/** Keeps brain structures inside the skull's inner surface (8 units of bone plus 1 of margin). */
const insideSkull = (x, y, z) => cavityOffset(x, y, z, -9);

// Skull thickness follows the figure: 8 units (4 mm) for the vault, thinner along the base.
const vaultLine = distanceGrid(S.skull.d, { unsigned: true, margin: 40 });
const baseLine = distanceGrid(S.skullBase.d + ' C304 382 318 414 334 440 L404 449', { unsigned: true, margin: 40 });
function skullHalfThickness(x, y) {
  const dv = vaultLine.sample(x, y), db = baseLine.sample(x, y);
  return lerp(8, 3.5, smoothstep(30, -30, db - dv));
}
const clivus = inflate(distanceGrid(S.clivus), 22);
const [bx, by] = S.mcrae.basion, [ox, oy] = S.mcrae.opisthion;
const fmCenter = [(bx + ox) / 2, (by + oy) / 2];
const fmHalfLength = Math.hypot(ox - bx, oy - by) / 2;
const mcraeY = (x) => by + ((x - bx) * (oy - by)) / (ox - bx);
/** The foramen magnum: an oval opening, 35 mm front to back (from the figure) and 30 mm across. */
const foramen = (x, y, z) =>
  Math.min((1 - ((x - fmCenter[0]) / fmHalfLength) ** 2 - (z / 30) ** 2) * 20, 18 - Math.abs(y - mcraeY(x)));
/** Bone = inside the outer surface and outside the inner surface. At the midline this is exactly the figure's band. */
const skullField = (x, y, z) => {
  const t = skullHalfThickness(x, y);
  const shell = Math.min(cavityOffset(x, y, z, t), -cavityOffset(x, y, z, -t));
  return Math.min(Math.max(shell, clivus.f(x, y, z)), -foramen(x, y, z));
};

// ---------------------------------------------------------------- after decompression
// Bone removed at the back of the foramen magnum: the stretch of skull the figure marks in red
// (about 25 mm along the skull from the opisthion), about 30 mm across (EVIDENCE.md: a window of
// about 3 x 2.5 cm in published series). And the middle of the C1 back arch, about 25 mm across.
const removedSkullLine = distanceGrid(S.boneRemovedSkull.d, { unsigned: true, margin: 30 });
// Only between the two ends of the figure's red dashed line (opisthion end to the far end), no further.
const [rx0, ry0, rx1, ry1] = [398, 448, 442, 427];
const removedLength = Math.hypot(rx1 - rx0, ry1 - ry0);
const alongRemoved = (x, y) => ((x - rx0) * (rx1 - rx0) + (y - ry0) * (ry1 - ry0)) / removedLength;
const skullRemoval = (x, y, z) => {
  const t = alongRemoved(x, y);
  return Math.min((S.boneRemovedSkull.halfWidth + 6) - removedSkullLine.sample(x, y), 30 - Math.abs(z), t + 2, removedLength - t);
};
const c1Removal = (x, y, z) => Math.min(x - 394, 25 - Math.abs(z));
const skullAfterSurgery = (x, y, z) => Math.min(skullField(x, y, z), -skullRemoval(x, y, z));
const skullRemovedPiece = (x, y, z) => Math.min(skullField(x, y, z), skullRemoval(x, y, z));

// ---------------------------------------------------------------- the head (skin)
// The real head surface from the Z-Anatomy atlas (CC BY-SA 4.0), saved by
// model/simple/reference/extract-skin.mjs. Matthew chose a real head on 2026-11-04 after the
// sculpted heads looked unnatural. It is turned into a smooth inside/outside field on a 1.5 mm grid
// (rays across the head mark what is inside), so it meshes like every other structure.
const skinIO = new NodeIO();
const skinDoc = await skinIO.read(new URL('./reference/head-skin.glb', import.meta.url).pathname);
const skinTris = (() => {
  const prim = skinDoc.getRoot().listMeshes()[0].listPrimitives()[0];
  const pos = prim.getAttribute('POSITION'), idx = prim.getIndices().getArray(), el = [0, 0, 0];
  const v = [];
  for (let i = 0; i < pos.getCount(); i++) {
    pos.getElement(i, el);
    v.push([fmCenter[0] + el[0] * S.unitsPerMm, fmCenter[1] - el[1] * S.unitsPerMm, el[2] * S.unitsPerMm]);
  }
  const t = [];
  for (let k = 0; k < idx.length; k += 3) t.push([v[idx[k]], v[idx[k + 1]], v[idx[k + 2]]]);
  return t;
})();
const SK = { x0: 30, y0: 110, z0: -210, step: 3, nx: 0, ny: 0, nz: 0 };
SK.nx = Math.ceil((590 - SK.x0) / SK.step) + 1;
SK.ny = Math.ceil((660 - SK.y0) / SK.step) + 1;
SK.nz = Math.ceil(-2 * SK.z0 / SK.step) + 1;
const skinGrid3 = (() => {
  const { x0, y0, z0, step, nx, ny, nz } = SK;
  const occ = new Float32Array(nx * ny * nz).fill(-1);
  const idx3 = (i, j, k) => i + nx * (j + ny * k);
  // Cast rays along one axis (a) across a grid of the other two (u, v); mark cells between the first and
  // last crossing as inside. Done along z (side to side) and x (front to back): a point is inside if
  // either says so, so openings such as the ear canals can't tunnel through the head.
  const lo = [x0, y0, z0], n3 = [nx, ny, nz];
  const cast = (a, u, v) => {
    const B = 6, bu = Math.ceil(n3[u] / B), bv = Math.ceil(n3[v] / B), buckets = Array.from({ length: bu * bv }, () => []);
    for (const tri of skinTris) {
      const us = tri.map((p) => (p[u] - lo[u]) / step), vs = tri.map((p) => (p[v] - lo[v]) / step);
      for (let j = Math.max(0, Math.floor(Math.min(...vs) / B)); j <= Math.min(bv - 1, Math.floor(Math.max(...vs) / B)); j++)
        for (let i = Math.max(0, Math.floor(Math.min(...us) / B)); i <= Math.min(bu - 1, Math.floor(Math.max(...us) / B)); i++) buckets[i + bu * j].push(tri);
    }
    for (let j = 0; j < n3[v]; j++)
      for (let i = 0; i < n3[u]; i++) {
        const pu = lo[u] + i * step + 0.013, pv = lo[v] + j * step + 0.017;
        let zin = Infinity, zout = -Infinity, count = 0;
        for (const [A, Bp, C] of buckets[Math.floor(i / B) + bu * Math.floor(j / B)]) {
          const d = (Bp[v] - C[v]) * (A[u] - C[u]) + (C[u] - Bp[u]) * (A[v] - C[v]);
          if (Math.abs(d) < 1e-12) continue;
          const l1 = ((Bp[v] - C[v]) * (pu - C[u]) + (C[u] - Bp[u]) * (pv - C[v])) / d;
          const l2 = ((C[v] - A[v]) * (pu - C[u]) + (A[u] - C[u]) * (pv - C[v])) / d;
          const l3 = 1 - l1 - l2;
          if (l1 < 0 || l2 < 0 || l3 < 0) continue;
          const h = l1 * A[a] + l2 * Bp[a] + l3 * C[a];
          zin = Math.min(zin, h); zout = Math.max(zout, h); count++;
        }
        if (count < 2) continue;
        for (let k = 0; k < n3[a]; k++) {
          const h = lo[a] + k * step;
          if (h > zin && h < zout) {
            const c = [0, 0, 0]; c[a] = k; c[u] = i; c[v] = j;
            occ[idx3(c[0], c[1], c[2])] = 1;
          }
        }
      }
  };
  cast(2, 0, 1);
  cast(0, 1, 2);
  // Smooth (two box passes in each direction) so the surface is soft rather than stepped.
  const blur = (a, stride, n, count) => {
    const out = new Float32Array(a.length);
    for (let s = 0; s < a.length; s++) {
      const p = Math.floor(s / stride) % n;
      let sum = 0, w = 0;
      for (let d = -1; d <= 1; d++) if (p + d >= 0 && p + d < n) { sum += a[s + d * stride]; w++; }
      out[s] = sum / w;
    }
    return count > 1 ? blur(out, stride, n, count - 1) : out;
  };
  let g = blur(occ, 1, nx, 2);
  g = blur(g, nx, ny, 2);
  g = blur(g, nx * ny, nz, 2);
  return g;
})();
/** The real head as a field: about the distance in figure units near the surface, positive inside. */
function realSkin(x, y, z) {
  const { x0, y0, z0, step, nx, ny, nz } = SK;
  const fx = (x - x0) / step, fy = (y - y0) / step, fz = (z - z0) / step;
  if (fx < 0 || fy < 0 || fz < 0 || fx >= nx - 1 || fy >= ny - 1 || fz >= nz - 1) return -6;
  const i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz), tx = fx - i, ty = fy - j, tz = fz - k;
  const at = (a, b, c) => skinGrid3[i + a + nx * (j + b + ny * (k + c))];
  const lx = (b, c) => at(0, b, c) * (1 - tx) + at(1, b, c) * tx;
  const v = (lx(0, 0) * (1 - ty) + lx(1, 0) * ty) * (1 - tz) + (lx(0, 1) * (1 - ty) + lx(1, 1) * ty) * tz;
  return v * 6;
}
const bottomY = 640; // the figure's bottom edge
const smoothUnion = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + (h * h * k) / 4;
};
/** Head and neck, as an "inside is positive" field in figure units. Always covers the skull. */
const skinField = (x, y, z) => Math.min(smoothUnion(realSkin(x, y, z), cavityOffset(x, y, z, 14), 8), bottomY - y);

if (process.env.SLICE) {
  // Text map of the skull (#) and the cavity (.) on a slice across the head at figure x = SLICE.
  const xx = Number(process.env.SLICE);
  for (let yy = 80; yy <= 360; yy += 8) {
    let row = '';
    for (let zz = -150; zz <= 150; zz += 5) row += skullField(xx, yy, zz) > 0 ? '#' : cavityOffset(xx, yy, zz, 0) > 0 ? '.' : ' ';
    console.log(String(yy).padStart(4), row);
  }
  process.exit(0);
}
if (process.env.PROBE) {
  // Front surface position (figure x) across the midline at a few heights, to look for creases.
  for (const yy of [280, 330, 600]) {
    const row = [];
    for (let zz = -8; zz <= 8; zz += 2) {
      let xs = null;
      for (let xx = 30; xx < 300; xx += 0.05) if (skinField(xx, yy, zz) > 0) { xs = xx; break; }
      row.push(`${zz}:${xs?.toFixed(2)}`);
    }
    console.log('y', yy, row.join('  '));
  }
  process.exit(0);
}
// The skin must cover the skull everywhere (with at least 1 mm to spare).
{
  let exposed = 0;
  const exposedAt = [];
  for (let xx = 90; xx <= 550; xx += 4)
    for (let yy = 60; yy <= 480; yy += 4)
      for (let zz = -150; zz <= 150; zz += 4) if (skullField(xx, yy, zz) > 0 && skinField(xx, yy, zz) < 2) { exposed++; if (exposedAt.length < 12) exposedAt.push([xx, yy, zz]); }
  if (exposed) console.warn(`WARNING: the skull comes within 1 mm of the skin surface at ${exposed} sample points, e.g. ${exposedAt.map((p) => p.join(',')).join('  ')}`);
  else console.log('Skin covers the skull everywhere.');
}


/** A ring (vertebral arch) around the spinal canal. */
function ring({ xc, yc, tilt = 0, a, b, tube, tubeSide = tube, tall = tube, tallSide = tall }) {
  return (x, y, z) => {
    const ux = (x - xc) / a, uz = z / b;
    const th = Math.atan2(uz, ux);
    const px = xc + a * Math.cos(th), pz = b * Math.sin(th);
    const side = Math.sin(th) ** 2;
    const rh = lerp(tube, tubeSide, side), rv = lerp(tall, tallSide, side);
    const dy = y - (yc + (x - xc) * tilt);
    const dh = Math.hypot(x - px, z - pz);
    return (1 - (dh / rh) ** 2 - (dy / rv) ** 2) * Math.min(rh, rv);
  };
}
const union = (...fs) => (x, y, z) => Math.max(...fs.map((f) => f(x, y, z)));

/** C1 (the atlas): front arch, back arch and the ring between them around the spinal canal. */
const c1Field = union(
  inflate(distanceGrid(S.c1Anterior), 10, 6).f,
  inflate(distanceGrid(S.c1Posterior), 10, 7).f,
  ring({ xc: 356, yc: 466, tilt: 8 / 116, a: 58, b: 46, tube: 7.5, tubeSide: 15, tall: 7, tallSide: 13 }),
);

const brainstemW = (x, y) => lerp(34, 16, smoothstep(330, 446, y));

/** All structures. part = id used by the structure list; layer = layer switch it belongs to. */
const structures = [
  // Skin and soft tissue
  { name: 'skin', layer: 'skin', part: null, color: '#EFE3D8', step: 2.5, field: skinField, box: [30, 110, -205, 590, 645, 205] },
  { name: 'palate', layer: 'skin', part: null, color: '#D2BBAA', step: 1, ...inflateBox(distanceGrid(S.palate.d, { band: S.palate.halfWidth }), 30, 2.5) },
  { name: 'pharynx', layer: 'skin', part: null, color: '#E2CFC2', step: 1.5, ...inflateBox(distanceGrid(S.pharynx.d, { band: S.pharynx.halfWidth }), 26, 8) },

  // Skull and spine
  { name: 'skull', layer: 'bone', part: 'foramen', conditions: ['typical', 'chiari', 'syrinx'], color: '#E7DFCF', step: 2, field: skullField, box: [90, 65, -150, 550, 480, 150] },
  { name: 'tentorium', layer: 'bone', part: null, color: '#A69B85', step: 1, ...inflateBox(distanceGrid(S.tentorium.d, { band: S.tentorium.halfWidth }), 80, 1.25, insideSkull) },
  { name: 'c1', layer: 'bone', part: null, conditions: ['typical', 'chiari', 'syrinx'], color: '#E7DFCF', step: 1, box: [270, 440, -80, 440, 495, 80], field: c1Field },
  // After decompression: C1 without the middle of its back arch, and the removed bone shown as a faint red outline.
  { name: 'c1-surgery', layer: 'bone', part: null, conditions: ['surgery'], color: '#E7DFCF', step: 1, box: [270, 440, -80, 440, 495, 80], field: (x, y, z) => Math.min(c1Field(x, y, z), -c1Removal(x, y, z)) },
  { name: 'skull-surgery', layer: 'bone', part: 'foramen', conditions: ['surgery'], color: '#E7DFCF', step: 2, field: skullAfterSurgery, box: [90, 65, -150, 550, 480, 150] },
  {
    name: 'bone-removed', layer: 'bone', part: 'removed', conditions: ['surgery'], color: '#9A3412', opacity: 0.45, step: 1, box: [370, 400, -45, 470, 495, 45],
    field: (x, y, z) => Math.max(skullRemovedPiece(x, y, z), Math.min(c1Field(x, y, z), c1Removal(x, y, z))),
  },
  {
    name: 'c2', layer: 'bone', part: 'c2', color: '#E7DFCF', step: 1, box: [280, 430, -60, 470, 535, 60],
    field: union(
      inflate(distanceGrid(S.dens), 9, 6).f,
      inflate(distanceGrid(S.c2Body), 18, 6).f,
      inflate(distanceGrid(S.spinous2), 8, 4).f,
      ring({ xc: 341.4, yc: 506, tilt: 0.05, a: 20.5, b: 34, tube: 6, tubeSide: 8, tall: 7 }),
    ),
  },
  {
    name: 'c3', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [280, 520, -60, 450, 572, 60],
    field: union(inflate(distanceGrid(S.c3Body), 18, 6).f, inflate(distanceGrid(S.spinous3), 8, 4).f, ring({ xc: 339.6, yc: 546, tilt: 0.05, a: 20.5, b: 34, tube: 6, tubeSide: 8, tall: 7 })),
  },
  {
    name: 'c4', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [280, 562, -60, 450, 612, 60],
    field: union(inflate(distanceGrid(S.c4Body), 18, 6).f, inflate(distanceGrid(S.spinous4), 8, 4).f, ring({ xc: 337.8, yc: 587, tilt: 0.05, a: 20.5, b: 34, tube: 6, tubeSide: 8, tall: 7 })),
  },
  {
    name: 'c5', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [280, 603, -60, 450, 640, 60],
    field: union(inflate(distanceGrid(S.c5Body), 18, 6).f, inflate(distanceGrid(S.spinous5), 8, 4).f, ring({ xc: 336, yc: 626, tilt: 0.05, a: 20.5, b: 34, tube: 6, tubeSide: 8, tall: 7 })),
  },
  { name: 'discs', layer: 'bone', part: null, color: '#D9C3A4', step: 1, box: [280, 512, -25, 335, 616, 25], field: union(inflate(distanceGrid(S.disc23), 17, 3).f, inflate(distanceGrid(S.disc34), 17, 3).f, inflate(distanceGrid(S.disc45), 17, 3).f) },

  // Brain and spinal cord
  { name: 'cerebrum', layer: 'brain', part: 'cerebrum', color: '#E9CFC6', step: 2.5, ...inflateBox(distanceGrid(S.cerebrum, { step: 1.5 }), 128, 'auto', insideSkull) },
  { name: 'callosum', layer: 'brain', part: 'callosum', color: '#F4E6E1', step: 1, ...inflateBox(distanceGrid(S.callosum), 20, 8) },
  { name: 'thalamus', layer: 'brain', part: null, color: '#E3BFB3', step: 1, ...inflateBox(distanceGrid(S.thalamus), 30) },
  { name: 'brainstem', layer: 'brain', part: 'brainstem', color: '#E3C2B6', step: 1, ...inflateBox(distanceGrid(S.brainstem), brainstemW, 'auto', null, 40) },
  { name: 'cerebellum', layer: 'brain', part: 'cerebellum', color: '#DDBDB3', step: 1.5, ...inflateBox(distanceGrid(S.cerebellum), 100, 'auto', insideSkull) },
  { name: 'tonsil-typical', layer: 'brain', part: 'tonsil', conditions: ['typical'], color: '#DDBDB3', step: 1, ...inflateBox(distanceGrid(S.tonsil.typical), 22) },
  { name: 'tonsil-chiari', layer: 'brain', part: 'tonsil', conditions: ['chiari', 'syrinx'], color: '#D2A79B', step: 1, ...inflateBox(distanceGrid(S.tonsil.chiari), 22) },
  { name: 'tonsil-surgery', layer: 'brain', part: 'tonsil', conditions: ['surgery'], color: '#DDBDB3', step: 1, ...inflateBox(distanceGrid(S.tonsil.surgery), 22) },
  { name: 'cord', layer: 'brain', part: 'cord', color: '#EAD9B9', step: 1, ...inflateBox(distanceGrid(S.cord), 12) },
  // Syrinx: the beaded fluid cavity in the center of the neck cord, from the figure (about 2.5 mm to either side).
  { name: 'syrinx', layer: 'brain', part: 'syrinx', conditions: ['syrinx'], color: '#7FB3D3', step: 0.75, ...inflateBox(distanceGrid(S.syrinx, { step: 0.5 }), 5) },

  // Spinal fluid
  // One fluid volume per condition: in front of the cord, around it, and behind it (EVIDENCE.md "Fluid pathway").
  // Typical and after surgery: continuous from the fourth ventricle outlet to the neck; Chiari I: the tonsil fills it.
  csfStructure('csf-typical', ['typical'], S.csfBack.typical),
  csfStructure('csf-chiari', ['chiari', 'syrinx'], S.csfBack.chiari),
  csfStructure('csf-surgery', ['surgery'], S.csfBack.surgery),
  // After decompression: the dural patch.
  { name: 'dural-patch', layer: 'csf', part: null, conditions: ['surgery'], color: '#7D6F58', opacity: 0.55, step: 1, ...inflateBox(distanceGrid(S.surgeryPatch, { band: 1.5 }), 32, 1.5) },
  { name: 'ventricle-lateral', layer: 'csf', part: null, color: '#A9CBE0', step: 1, ...inflateBox(distanceGrid(S.lateralVentricle), 22, 4) },
  { name: 'ventricle-fourth', layer: 'csf', part: 'ventricle', color: '#A9CBE0', step: 1, ...inflateBox(distanceGrid(S.fourthVentricle), 14, 6) },
];

/** Spinal fluid for one condition: the midline fluid outlines, given width to the sides (about 12.5 mm
 *  to either side in the neck canal, wider inside the skull but kept within it). */
function csfStructure(name, conditions, back) {
  const front = distanceGrid(S.csfFront), behind = distanceGrid(back), sac = distanceGrid(S.cord);
  const W = (x, y) => lerp(25, 40, smoothstep(448, 436, y));
  const inSkull = (x, y, z) => (y > 432 ? 1e3 : insideSkull(x, y, z)); // open through the foramen magnum
  const parts = [inflate(front, 25, 4).f, inflate(behind, W, 4).f, inflate(sac, 25, 4).f];
  const field = (x, y, z) => Math.min(Math.max(parts[0](x, y, z), parts[1](x, y, z), parts[2](x, y, z)), inSkull(x, y, z));
  const [x0, y0] = [Math.min(front.bbox[0], behind.bbox[0]), Math.min(front.bbox[1], behind.bbox[1])];
  const [x1, y1] = [Math.max(front.bbox[2], behind.bbox[2]), Math.max(front.bbox[3], behind.bbox[3])];
  return { name, layer: 'csf', part: 'csf', conditions, color: '#9CC3DA', opacity: 0.75, step: 1.5, field, box: [x0, y0, -44, x1, y1, 44] };
}

/** Helper: inflate a grid and give it a build box. `clamp` keeps it inside another field. */
function inflateBox(grid, W, r = 'auto', clamp = null, zMax = null) {
  const inf = inflate(grid, W, r);
  const z = (zMax ?? (typeof W === 'number' ? W : 60)) + 4;
  const [x0, y0, x1, y1] = grid.bbox;
  return {
    field: clamp ? (x, y, zz) => Math.min(inf.f(x, y, zz), clamp(x, y, zz)) : inf.f,
    box: [x0, y0, -z, x1, y1, z],
  };
}

// ---------------------------------------------------------------- build and save

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('simple');
const toMm = (pos) => {
  const out = new Float32Array(pos.length);
  for (let a = 0; a < pos.length; a += 3) {
    out[a] = (pos[a] - fmCenter[0]) / S.unitsPerMm;
    out[a + 1] = -(pos[a + 1] - fmCenter[1]) / S.unitsPerMm;
    out[a + 2] = pos[a + 2] / S.unitsPerMm;
  }
  return out;
};

/** glTF stores colors in linear light; the palette is sRGB hex. */
function srgbToLinear(hex) {
  return [1, 3, 5].map((k) => {
    const c = parseInt(hex.slice(k, k + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}

/** Checks a mesh is closed and consistently oriented: every edge shared by exactly two triangles, in opposite directions. */
function checkClosed(tris) {
  const count = new Map();
  for (let t = 0; t < tris.length; t += 3)
    for (let e = 0; e < 3; e++) {
      const a = tris[t + e], b = tris[t + ((e + 1) % 3)];
      const key = a + ',' + b;
      count.set(key, (count.get(key) ?? 0) + 1);
    }
  let open = 0, flipped = 0;
  for (const [key, n] of count) {
    const [a, b] = key.split(',');
    const back = count.get(b + ',' + a) ?? 0;
    if (n > 1) flipped += n - 1;
    if (back === 0) open++;
  }
  return { open, flipped };
}

// ---------------------------------------------------------------- 3D-printable plaques (--print)
// `node model/simple/build.mjs --print` writes public/downloads/print/*.stl instead of the web model: for Typical
// and Chiari I, a solid plaque of the midline view from the skull base to the upper neck, life size (about 150 by
// 115 mm, 12 mm thick), so they can be laid side by side. It prints as one piece on a single-color printer: on its
// face, bone stands 1.5 mm proud, spinal fluid is 2 mm deep, soft tissue 0.8 mm, brain and cord flush, and the
// McRae line is a 1 mm wide, 3.5 mm deep groove (deeper than the fluid spaces, so it shows across them too). The outlines are the figure's own (the same fields as the web model, at the midline),
// so the EVIDENCE.md positions carry over; the check at the end measures the tonsil against the McRae line.
if (process.argv.includes('--print')) {
  const byName = Object.fromEntries(structures.map((s) => [s.name, s]));
  const PRINT_OUT = new URL('../../public/downloads/print/', import.meta.url);
  mkdirSync(PRINT_OUT, { recursive: true });
  const BOX = [236, 326, 540, 562]; // figure units: x 236–540, y 326–562 (skull base to upper neck)
  const BACK = -24, RELIEF = { bone: 3, brain: 0, csf: -4, soft: -1.6, groove: -7 };
  const lineDist = (x, y) => {
    const [ax, ay] = S.mcrae.basion, [bx2, by2] = S.mcrae.opisthion;
    const dx = bx2 - ax, dy = by2 - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
  };
  for (const cond of ['typical', 'chiari']) {
    const inside = (names) => names.map((n) => byName[n].field);
    const bone = inside(['skull', 'c1', 'c2', 'c3', 'discs']);
    const brain = inside(['brainstem', 'cerebellum', 'cerebrum', 'thalamus', `tonsil-${cond}`, 'cord']);
    const csf = inside([`csf-${cond}`, 'ventricle-fourth']);
    const any = (fs, x, y) => fs.some((f) => f(x, y, 0) > 0);
    // What the midline face shows at (x, y), as a height: bone first, then brain (the tonsil fills the fluid space in
    // Chiari I), then fluid, then soft tissue.
    const height = (x, y) => {
      if (lineDist(x, y) < 1) return RELIEF.groove;
      if (any(bone, x, y)) return RELIEF.bone;
      if (any(brain, x, y)) return RELIEF.brain;
      if (any(csf, x, y)) return RELIEF.csf;
      return RELIEF.soft;
    };
    // Heights are looked up once per column, not per voxel.
    const step = 1;
    const hx = Math.ceil((BOX[2] - BOX[0]) / step) + 3, hy = Math.ceil((BOX[3] - BOX[1]) / step) + 3;
    const H = new Float32Array(hx * hy);
    for (let j = 0; j < hy; j++) for (let i = 0; i < hx; i++) H[i + hx * j] = height(BOX[0] - step + i * step, BOX[1] - step + j * step);
    const hAt = (x, y) => H[Math.round((x - BOX[0] + step) / step) + hx * Math.round((y - BOX[1] + step) / step)] ?? RELIEF.soft;
    const field = (x, y, z) =>
      Math.min(x - BOX[0], BOX[2] - x, y - BOX[1], BOX[3] - y, skinField(x, y, Math.min(z, 0)), hAt(x, y) - z, z - BACK);
    const mesh = smooth(extract(field, [BOX[0] - 2, BOX[1] - 2, BACK - 2], [BOX[2] + 2, BOX[3] + 2, 5], 0.5), 2);
    for (let t = 0; t < mesh.tris.length; t += 3) [mesh.tris[t + 1], mesh.tris[t + 2]] = [mesh.tris[t + 2], mesh.tris[t + 1]];
    const pos = toMm(mesh.pos);
    // Fewer triangles (about 1 in 8, with at most about 0.05 mm of change), so the file is a reasonable download.
    await MeshoptSimplifier.ready;
    const tris = MeshoptSimplifier.simplify(mesh.tris, pos, 3, Math.floor(mesh.tris.length / 8 / 3) * 3, 0.05 / 150, ['LockBorder'])[0];
    // Lying face up on the print bed: z (the face) up, back at 0.
    let zMin = Infinity;
    for (let i = 2; i < pos.length; i += 3) zMin = Math.min(zMin, pos[i]);
    const check = checkClosed(tris);
    // Binary STL.
    const n = tris.length / 3;
    const out = Buffer.alloc(84 + n * 50);
    out.write('Open Chiari, CC BY-SA 4.0. Midline plaque, ' + cond + '. Not medical advice.', 0, 'ascii');
    out.writeUInt32LE(n, 80);
    for (let t = 0; t < n; t++) {
      const v = [0, 1, 2].map((e) => [pos[tris[t * 3 + e] * 3], pos[tris[t * 3 + e] * 3 + 1], pos[tris[t * 3 + e] * 3 + 2] - zMin]);
      const u = [v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]], w = [v[2][0] - v[0][0], v[2][1] - v[0][1], v[2][2] - v[0][2]];
      const nx = u[1] * w[2] - u[2] * w[1], ny = u[2] * w[0] - u[0] * w[2], nz = u[0] * w[1] - u[1] * w[0];
      const len = Math.hypot(nx, ny, nz) || 1;
      const o = 84 + t * 50;
      [nx / len, ny / len, nz / len, ...v.flat()].forEach((val, k) => out.writeFloatLE(val, o + k * 4));
    }
    const file = new URL(`openchiari-midline-${cond}.stl`, PRINT_OUT).pathname;
    writeFileSync(file, out);
    // Measurement check: the tonsil's lowest point at the midline, against the McRae line (EVIDENCE.md: Typical
    // about 1 mm above, Chiari I about 12 mm below).
    let lowest = -Infinity, at = 0;
    const tonsil = byName[`tonsil-${cond}`].field;
    for (let x = 360; x <= 420; x += 0.25) for (let y = 400; y <= 500; y += 0.25) if (tonsil(x, y, 0) > 0 && y > lowest) [lowest, at] = [y, x];
    const below = (lowest - mcraeY(at)) / S.unitsPerMm;
    console.log(`${cond}: ${n} triangles, open edges ${check.open}, same-direction edges ${check.flipped}; tonsil tip ${Math.abs(below).toFixed(1)} mm ${below > 0 ? 'below' : 'above'} the McRae line; wrote ${file}`);
  }
  // One download: both plaques, the credit and license, and printing tips (public/downloads/openchiari-print.zip).
  const { execFileSync } = await import('node:child_process');
  const { copyFileSync, rmSync, mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const strings = JSON.parse(readFileSync(new URL('../../src/i18n/en.json', import.meta.url), 'utf8'));
  const f = strings.footer, x = strings.explorer;
  const work = mkdtempSync(join(tmpdir(), 'oc-print-'));
  const dir = join(work, 'openchiari-print');
  mkdirSync(dir);
  for (const cond of ['typical', 'chiari']) copyFileSync(new URL(`openchiari-midline-${cond}.stl`, PRINT_OUT).pathname, join(dir, `openchiari-midline-${cond}.stl`));
  writeFileSync(join(dir, 'README.txt'), [
    'Open Chiari: 3D-printable midline plaques',
    '',
    'Two plaques of the midline view, skull base to upper neck, life size (about 150 x 120 mm, 12 mm thick):',
    'openchiari-midline-typical.stl (typical anatomy) and openchiari-midline-chiari.stl (Chiari I). Lay them side by side.',
    'Bone stands 1.5 mm proud, spinal fluid spaces are 2 mm deep, soft tissue 0.8 mm, brain and spinal cord flush,',
    'and the McRae line (across the opening at the base of the skull) is a groove.',
    '',
    'Printing: lay each plaque flat, face up; no supports needed. 0.2 mm layers work; a light-colored filament shows the',
    'relief best. They also scale down well (for example 60%) for a smaller, cheaper print.',
    '',
    `${x.captionIllustration}. ${x.captionTonsils}. ${f.notAdvice} ${f.notAdviceRest.wide}`,
    '',
    `${f.modelBefore.replace(/^\.\s*/, '')} ${f.zAnatomy} ${f.modelAfter}`,
    'Made by model/simple/build.mjs --print, from the same shapes as the 3D Explorer. https://openchiari.org/model/',
    '',
  ].join('\n'));
  copyFileSync(new URL('../../LICENSE-MODEL.md', import.meta.url).pathname, join(dir, 'LICENSE.md'));
  const zipPath = new URL('../openchiari-print.zip', PRINT_OUT).pathname;
  rmSync(zipPath, { force: true });
  execFileSync('zip', ['-q', '-X', '-r', zipPath, 'openchiari-print'], { cwd: work });
  rmSync(work, { recursive: true, force: true });
  rmSync(PRINT_OUT.pathname, { recursive: true, force: true });
  console.log('wrote', zipPath);
  process.exit(0);
}

let totalTris = 0;
for (const s of structures) {
  const t0 = Date.now();
  const [x0, y0, z0, x1, y1, z1] = s.box;
  const mesh = smooth(extract(s.field, [x0, y0, z0], [x1, y1, z1], s.step), 8);
  // Flipping y to make "up" positive mirrors the mesh, so reverse the triangle winding.
  const tris = mesh.tris;
  for (let t = 0; t < tris.length; t += 3) [tris[t + 1], tris[t + 2]] = [tris[t + 2], tris[t + 1]];
  const position = doc.createAccessor().setType('VEC3').setArray(toMm(mesh.pos)).setBuffer(buffer);
  const indices = doc.createAccessor().setType('SCALAR').setArray(tris).setBuffer(buffer);
  const material = doc.createMaterial(s.name).setBaseColorFactor([...srgbToLinear(s.color), s.opacity ?? 1]).setRoughnessFactor(0.85).setMetallicFactor(0);
  if (s.opacity) material.setAlphaMode('BLEND');
  const prim = doc.createPrimitive().setAttribute('POSITION', position).setIndices(indices).setMaterial(material);
  const node = doc
    .createNode(s.name)
    .setMesh(doc.createMesh(s.name).addPrimitive(prim))
    .setExtras({ layer: s.layer, part: s.part, color: s.color, opacity: s.opacity ?? 1, conditions: s.conditions ?? null });
  scene.addChild(node);
  const check = checkClosed(tris);
  console.log(`${s.name.padEnd(18)} ${String(tris.length / 3).padStart(7)} triangles  ${Date.now() - t0} ms  open edges ${check.open}, same-direction edges ${check.flipped}`);
  totalTris += tris.length / 3;
}
console.log('before simplifying:', totalTris, 'triangles');

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
await doc.transform(
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.07, error: 0.0028 }),
  quantize({ quantizePosition: 12 }),
  meshopt({ encoder: MeshoptEncoder, level: 'high' }),
);
let after = 0;
for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) after += p.getIndices().getCount() / 3;
console.log('after simplifying:', after, 'triangles');

doc.getRoot().setExtras({
  generator: 'model/simple/build.mjs',
  source: 'src/lib/anatomy-shapes.json',
  units: 'mm; origin at the middle of the foramen magnum; +x toward the back of the head, +y up, +z to the side',
  credit: '3D model by Open Chiari, CC BY-SA 4.0',
});
mkdirSync(new URL('.', OUT), { recursive: true });
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(OUT.pathname, doc);
console.log('wrote', OUT.pathname);
