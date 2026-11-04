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
function distanceGrid(shape, { band = 0, unsigned = false, margin = 12, step = 1 } = {}) {
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
  return { sample, bbox: [x0, y0, x1, y1], dMax };
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
  ' L334 440 C304 420 292 390 290 356 L282 354 L278 330 C272 340 255 338 252 322 C220 310 170 305 128 300 Z';
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
const baseLine = distanceGrid('M128 300 C170 305 220 310 252 322 C255 338 272 340 278 330 L282 354 L290 356 C292 390 304 420 334 440 L404 449', { unsigned: true, margin: 40 });
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
// (about 31 mm along the skull from the opisthion), about 30 mm across (EVIDENCE.md: about 3x3 to
// 3x4 cm in published series). And the middle of the C1 back arch, about 30 mm across.
const removedSkullLine = distanceGrid(S.boneRemovedSkull.d, { unsigned: true, margin: 30 });
// Only between the two ends of the figure's red dashed line (opisthion end to the far end), no further.
const [rx0, ry0, rx1, ry1] = [398, 448, 454, 420];
const removedLength = Math.hypot(rx1 - rx0, ry1 - ry0);
const alongRemoved = (x, y) => ((x - rx0) * (rx1 - rx0) + (y - ry0) * (ry1 - ry0)) / removedLength;
const skullRemoval = (x, y, z) => {
  const t = alongRemoved(x, y);
  return Math.min((S.boneRemovedSkull.halfWidth + 6) - removedSkullLine.sample(x, y), 30 - Math.abs(z), t + 2, removedLength - t);
};
const c1Removal = (x, y, z) => Math.min(x - 394, 30 - Math.abs(z));
const skullAfterSurgery = (x, y, z) => Math.min(skullField(x, y, z), -skullRemoval(x, y, z));
const skullRemovedPiece = (x, y, z) => Math.min(skullField(x, y, z), skullRemoval(x, y, z));

// ---------------------------------------------------------------- the head (sculpted)
// The head and face are sculpted in 3D from simple rounded forms blended together (like clay).
// The skin's midline outline used by the 2D figure is then taken from this sculpt, so the
// figure and the 3D head always match. Units here are millimetres: X toward the back of the
// head, Y up, Z to the side, origin at the middle of the foramen magnum.

const len3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
/** Signed distance to an ellipsoid (approximate; negative inside). */
function sdEllipsoid(x, y, z, rx, ry, rz) {
  const k0 = len3(x / rx, y / ry, z / rz);
  const k1 = len3(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
/** Signed distance to a capsule from a to b whose radius goes from ra to rb. */
function sdCone(px, py, pz, [ax, ay, az], [bx, by, bz], ra, rb) {
  const bax = bx - ax, bay = by - ay, baz = bz - az;
  const pax = px - ax, pay = py - ay, paz = pz - az;
  const t = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  return len3(pax - bax * t, pay - bay * t, paz - baz * t) - lerp(ra, rb, t);
}
/** Smooth union and smooth subtraction of distances (blend width k, mm). */
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * k) / 4;
};
const ssub = (a, b, k) => -smin(-a, b, k);
/** Smooth union of "inside is positive" fields (used for the vertebrae and skull). */
const smoothMax = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + (h * h * k) / 4;
};

/** Distance to the head and neck surface in mm (negative inside). Inputs in figure units. */
function headSdf(x, y, z) {
  const X = (x - fmCenter[0]) / S.unitsPerMm, Y = -(y - fmCenter[1]) / S.unitsPerMm, Z = z / S.unitsPerMm;
  const az = Math.abs(Z);
  // Cranium: one smooth oval (about 152 mm wide), pushed out wherever the skull would come
  // closer than about 4 mm to the surface (bone 4 mm + scalp 4 mm beyond the skull's midline curve).
  let d = sdEllipsoid(X + 29.5, Y - 90, Z, 110, 95, 77);
  d = smin(d, -cavityOffset(x, y, z, 16) / S.unitsPerMm, 8);
  // Sides of the head: full and rounded from the temples down to the ears.
  d = smin(d, sdEllipsoid(X + 22, Y - 56, Z, 94, 72, 72), 40);
  // Neck: an oval column (about 120 mm front to back, 105 mm across) rising well into the head,
  // plus the muscles at the back of the neck that fill up to the skull.
  const nx = X + 8, k0 = Math.hypot(nx / 62, Z / 53), k1 = Math.hypot(nx / (62 * 62), Z / (53 * 53));
  const neck = Math.max(k1 === 0 ? -53 : (k0 * (k0 - 1)) / k1, Y - 70);
  d = smin(d, neck, 34);
  d = smin(d, sdEllipsoid(X - 38, Y - 4, Z, 30, 42, 48), 30);
  // Face: one oval mass from the brow down, about 135 mm across the cheekbones,
  // blended widely into the skull at the temples and brow.
  d = smin(d, sdEllipsoid(X + 100, Y - 30, Z, 44, 54, 66), 48);
  // Lower jaw: a U from the chin back to the angles of the jaw (about 100 mm apart).
  // Left and right halves are blended across the middle so there's no crease at the centerline.
  const both = (f, k) => smin(f(Z), f(-Z), k);
  d = smin(d, both((zz) => sdCone(X, Y, zz, [-120, -8, 6], [-74, -8, 42], 16, 12), 20), 26);
  d = smin(d, sdEllipsoid(X + 128, Y + 8, Z, 13, 12, 26), 18);
  // Cheekbones and brow.
  d = smin(d, sdEllipsoid(X + 110, Y - 48, az - 42, 16, 10, 15), 16);
  d = smin(d, both((zz) => sdCone(X, Y, zz, [-134, 74, 0], [-125, 76, 34], 7.5, 6.5), 10), 10);
  // Eyes: closed lids, a gentle curve under the brow (no hollows).
  d = smin(d, sdEllipsoid(X + 128, Y - 60, az - 31, 6, 7, 12), 8);
  // Nose: a clear bridge and tip, with the nostril wings.
  d = smin(d, sdCone(X, Y, Z, [-134, 68, 0], [-151, 43, 0], 6, 9), 6);
  d = smin(d, both((zz) => sdEllipsoid(X + 138, Y - 38, zz - 10, 8, 6.5, 7), 6), 6);
  // Lips: soft and closed.
  d = smin(d, sdEllipsoid(X + 139, Y - 21, Z, 6, 5, 22), 7);
  d = smin(d, sdEllipsoid(X + 138, Y - 11, Z, 6, 5.5, 20), 7);
  d = ssub(d, sdEllipsoid(X + 145, Y - 16, Z, 5, 0.8, 19), 2.5);
  // Ears.
  d = smin(d, sdEllipsoid(X + 4, Y - 52, az - 79, 12, 29, 7), 6);
  const bottom = -(640 - fmCenter[1]) / S.unitsPerMm; // the figure's bottom edge
  return Math.max(d, bottom - Y);
}
/** Head and neck, as an "inside is positive" field in figure units. */
const skinField = (x, y, z) => -headSdf(x, y, z) * S.unitsPerMm;

/** The head's midline outline (z = 0), traced with marching squares, as an SVG path. */
function midlineOutline(f, [x0, y0, x1, y1], step = 0.5) {
  const nx = Math.ceil((x1 - x0) / step) + 1, ny = Math.ceil((y1 - y0) / step) + 1;
  const v = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[i + nx * j] = f(x0 + i * step, y0 + j * step, 0);
  // Collect boundary segments, then chain them into the longest loop.
  const segs = [];
  const at = (i, j) => v[i + nx * j];
  const cross = (i0, j0, i1, j1) => {
    const a = at(i0, j0), b = at(i1, j1), t = a / (a - b);
    return [x0 + (i0 + t * (i1 - i0)) * step, y0 + (j0 + t * (j1 - j0)) * step];
  };
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const pts = [];
      if (at(i, j) > 0 !== at(i + 1, j) > 0) pts.push(cross(i, j, i + 1, j));
      if (at(i + 1, j) > 0 !== at(i + 1, j + 1) > 0) pts.push(cross(i + 1, j, i + 1, j + 1));
      if (at(i, j + 1) > 0 !== at(i + 1, j + 1) > 0) pts.push(cross(i, j + 1, i + 1, j + 1));
      if (at(i, j) > 0 !== at(i, j + 1) > 0) pts.push(cross(i, j, i, j + 1));
      if (pts.length === 2) segs.push(pts);
      if (pts.length === 4) segs.push([pts[0], pts[1]], [pts[2], pts[3]]);
    }
  const key = (p) => p[0].toFixed(3) + ',' + p[1].toFixed(3);
  const ends = new Map();
  segs.forEach((sg, n) => sg.forEach((p) => ends.set(key(p), [...(ends.get(key(p)) ?? []), n])));
  const used = new Set();
  let best = [];
  for (let n0 = 0; n0 < segs.length; n0++) {
    if (used.has(n0)) continue;
    const loop = [segs[n0][0], segs[n0][1]];
    used.add(n0);
    for (;;) {
      const next = (ends.get(key(loop[loop.length - 1])) ?? []).find((m) => !used.has(m));
      if (next === undefined) break;
      used.add(next);
      const [a, b] = segs[next];
      loop.push(key(a) === key(loop[loop.length - 1]) ? b : a);
    }
    if (loop.length > best.length) best = loop;
  }
  // Simplify (Douglas-Peucker, 0.2 units) and write as a path.
  const simplifyLine = (pts, tol) => {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]];
    let far = 0, idx = 0;
    for (let k = 1; k < pts.length - 1; k++) {
      const dd = distToSegs(pts[k][0], pts[k][1], [[a[0], a[1], b[0], b[1]]]);
      if (dd > far) { far = dd; idx = k; }
    }
    if (far <= tol) return [a, b];
    return [...simplifyLine(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplifyLine(pts.slice(idx), tol)];
  };
  const simple = simplifyLine(best, 0.2);
  return 'M' + simple.map(([px, py]) => `${+px.toFixed(1)} ${+py.toFixed(1)}`).join(' L') + ' Z';
}

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
  for (let xx = 90; xx <= 550; xx += 4)
    for (let yy = 60; yy <= 480; yy += 4)
      for (let zz = -150; zz <= 150; zz += 4) if (skullField(xx, yy, zz) > 0 && skinField(xx, yy, zz) < 2) exposed++;
  if (exposed) console.warn(`WARNING: the skull comes within 1 mm of the skin surface at ${exposed} sample points.`);
  else console.log('Skin covers the skull everywhere.');
}
const skinOutline = midlineOutline(skinField, [20, 50, 580, 650]);
if (skinOutline !== S.skin) {
  S.skin = skinOutline;
  writeFileSync(new URL('../../src/lib/anatomy-shapes.json', import.meta.url), JSON.stringify(S, null, 2) + '\n');
  console.log('Updated the head outline in src/lib/anatomy-shapes.json (the 2D figure uses it).');
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
  { name: 'skin', layer: 'skin', part: null, color: '#EFE3D8', step: 3, field: skinField, box: [20, 50, -195, 580, 660, 195] },
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
    name: 'bone-removed', layer: 'bone', part: null, conditions: ['surgery'], color: '#9A3412', opacity: 0.45, step: 1, box: [370, 400, -45, 470, 495, 45],
    field: (x, y, z) => Math.max(skullRemovedPiece(x, y, z), Math.min(c1Field(x, y, z), c1Removal(x, y, z))),
  },
  {
    name: 'c2', layer: 'bone', part: 'c2', color: '#E7DFCF', step: 1, box: [280, 430, -60, 470, 535, 60],
    field: union(
      inflate(distanceGrid(S.dens), 9, 6).f,
      inflate(distanceGrid(S.c2Body), 18, 6).f,
      inflate(distanceGrid(S.spinous2), 8, 4).f,
      ring({ xc: 361, yc: 506, tilt: 0.05, a: 33, b: 34, tube: 6, tubeSide: 8, tall: 7 }),
    ),
  },
  {
    name: 'c3', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [280, 515, -60, 470, 585, 60],
    field: union(inflate(distanceGrid(S.c3Body), 18, 6).f, inflate(distanceGrid(S.spinous3), 8, 4).f, ring({ xc: 361, yc: 556, tilt: 0.05, a: 35, b: 34, tube: 6, tubeSide: 8, tall: 7 })),
  },
  {
    name: 'c4', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [280, 560, -60, 470, 630, 60],
    field: union(inflate(distanceGrid(S.c4Body), 18, 6).f, inflate(distanceGrid(S.spinous4), 8, 4).f, ring({ xc: 360, yc: 600, tilt: 0.05, a: 38, b: 34, tube: 6, tubeSide: 8, tall: 7 })),
  },
  { name: 'discs', layer: 'bone', part: null, color: '#D9C3A4', step: 1, box: [280, 510, -25, 335, 625, 25], field: union(inflate(distanceGrid(S.disc23), 17, 3).f, inflate(distanceGrid(S.disc34), 17, 3).f, inflate(distanceGrid(S.disc45), 17, 3).f) },

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
  { name: 'syrinx', layer: 'brain', part: null, conditions: ['syrinx'], color: '#7FB3D3', step: 0.75, ...inflateBox(distanceGrid(S.syrinx, { step: 0.5 }), 5) },

  // Spinal fluid
  { name: 'csf-spinal', layer: 'csf', part: 'csf', color: '#9CC3DA', opacity: 0.75, step: 1.5, ...inflateBox(distanceGrid('M326 446 L386 450 C388 510 390 580 392 640 L330 640 Z'), 26) },
  { name: 'cisterna', layer: 'csf', part: 'csf', conditions: ['typical'], color: '#9CC3DA', opacity: 0.75, step: 1, ...inflateBox(distanceGrid(S.cisterna), 40, 4, insideSkull) },
  // After decompression: the re-formed fluid space behind the cerebellum, and the dural patch.
  { name: 'csf-surgery', layer: 'csf', part: 'csf', conditions: ['surgery'], color: '#9CC3DA', opacity: 0.75, step: 1, ...inflateBox(distanceGrid(S.surgeryCsf), 30) },
  { name: 'dural-patch', layer: 'csf', part: null, conditions: ['surgery'], color: '#7D6F58', opacity: 0.55, step: 1, ...inflateBox(distanceGrid(S.surgeryPatch, { band: 1.5 }), 32, 1.5) },
  { name: 'ventricle-lateral', layer: 'csf', part: null, color: '#A9CBE0', step: 1, ...inflateBox(distanceGrid(S.lateralVentricle), 22, 4) },
  { name: 'ventricle-fourth', layer: 'csf', part: 'ventricle', color: '#A9CBE0', step: 1, ...inflateBox(distanceGrid(S.fourthVentricle), 14, 6) },
];

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
