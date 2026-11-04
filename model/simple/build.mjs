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
import { readFileSync, mkdirSync } from 'node:fs';
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
  if (r === 'auto') r = grid.dMax;
  const Wf = typeof W === 'function' ? W : () => W;
  return {
    bbox: grid.bbox,
    zMax: typeof W === 'function' ? null : W,
    f: (x, y, z) => roundedHalfWidth(grid.sample(x, y), Wf(x, y), r) - Math.abs(z),
  };
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
const cavity = distanceGrid(CAVITY_PATH, { margin: 40, step: 1 });
const CAV_W = 132; // half-width of the cranial cavity at its widest: 66 mm
const CAV_R = cavity.dMax;
const cavityLateral = (x, y) => roundedHalfWidth(cavity.sample(x, y), CAV_W, CAV_R);
/** The cranial cavity grown (offset > 0) or shrunk (offset < 0) by `offset` units, as a field. */
const cavityOffset = (x, y, z, offset) =>
  roundedHalfWidth(cavity.sample(x, y) + offset, CAV_W + offset, CAV_R + offset) - Math.abs(z);
/** Keeps brain structures inside the skull's inner surface (8 units of bone plus 1 of margin). */
const insideSkull = (x, y, z) => cavityOffset(x, y, z, -9);

// Skull thickness follows the figure: 8 units (4 mm) for the vault, thinner along the base.
const vaultLine = distanceGrid(S.skull.d, { unsigned: true, margin: 40 });
const baseLine = distanceGrid('M128 300 C170 305 220 310 252 322 C255 338 272 340 278 330 L282 354 L290 356 C292 390 304 420 334 440 L404 449', { unsigned: true, margin: 40 });
function skullHalfThickness(x, y) {
  const dv = vaultLine.sample(x, y), db = baseLine.sample(x, y);
  return lerp(8, 3.5, smoothstep(14, -14, db - dv));
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

// Head and neck outline: wide over the cranium, narrower at the face and the neck.
const skinGrid = distanceGrid(S.skin, { margin: 20, step: 1.5 });
/** Smooth union: like max, but blends the two shapes over about k units instead of leaving a crease. */
const smoothMax = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + (h * h * k) / 4;
};
// The head is built in two parts that meet in a smooth blend:
// - the head itself, wide and rounded, whose front surface sits about where the cheeks are;
// - the facial features in front of the cheeks (nose, lips, chin), each with a realistic width.
// Together their midline outline is exactly the figure's head outline.
// Where the cheeks are, at each height: a smooth curve behind the profile (figure units).
// Cheeks about 28 mm behind the nose tip, mouth corners about 8 mm behind the lips, chin about 6 mm proud.
const CHEEK_POINTS = [[280, 60], [298, 92], [312, 106], [340, 117], [370, 114], [392, 102], [412, 97], [432, 98], [458, 101], [482, 106], [500, 116], [516, 60]];
const cheekX = (() => {
  const raw = (y) => {
    if (y <= CHEEK_POINTS[0][0] || y >= CHEEK_POINTS[CHEEK_POINTS.length - 1][0]) return 60;
    for (let k = 0; k < CHEEK_POINTS.length - 1; k++) {
      const [y0, x0] = CHEEK_POINTS[k], [y1, x1] = CHEEK_POINTS[k + 1];
      if (y <= y1) return lerp(x0, x1, smoothstep(y0, y1, y));
    }
    return 60;
  };
  const table = new Map();
  for (let y = 250; y <= 540; y++) {
    let sum = 0;
    for (let k = -6; k <= 6; k++) sum += raw(y + k);
    table.set(y, sum / 13);
  }
  return (y) => table.get(Math.round(y)) ?? 60;
})();
const featureHalfWidth = (y) => {
  // nose about 30 mm wide, mouth about 50 mm, chin about 40 mm (half-widths in figure units)
  const nose = 30, mouth = 42, chin = 38;
  if (y < 372) return nose;
  if (y < 392) return lerp(nose, mouth, smoothstep(372, 392, y));
  if (y < 440) return mouth;
  return lerp(mouth, chin, smoothstep(440, 470, y));
};
const headW = (x, y) => lerp(152, 112, smoothstep(470, 560, y) * smoothstep(180, 280, x));
// Front-most point of the face outline at each height (figure units).
const profileFront = (() => {
  const front = new Map();
  for (let y = 60; y <= 660; y++) {
    let best = Infinity;
    for (let x = 30; x < 300; x += 0.5) if (skinGrid.sample(x, y) > 0) { best = x; break; }
    front.set(y, best);
  }
  return (y) => front.get(Math.round(Math.min(660, Math.max(60, y)))) ?? Infinity;
})();
/** The head itself: wide and rounded; its front curves back toward the sides like cheeks. */
const headBase = (x, y, z) => {
  const w = headW(x, y);
  const h = Math.min(
    roundedHalfWidth(skinGrid.sample(x, y), w, skinGrid.dMax),
    roundedHalfWidth(x - cheekX(y) + 8, w, 95),
  );
  return h - Math.abs(z);
};
/** Facial features in front of the cheeks, with rounded cross-sections that blend into the cheeks. */
const faceFeatures = (x, y, z) => {
  const front = profileFront(y), cheek = cheekX(y);
  if (!(front < cheek)) return -100;
  const q = Math.max(0, (cheek + 8 - x) / (cheek + 8 - front)); // 0 at the cheeks, 1 at the tip
  const h = featureHalfWidth(y) * Math.sqrt(Math.max(0, 1 - q));
  return Math.min(skinGrid.sample(x, y) * 4, h - Math.abs(z));
};
const skinInflated = { f: (x, y, z) => smoothMax(headBase(x, y, z), faceFeatures(x, y, z), 10) };

const skinField = (x, y, z) => smoothMax(skinInflated.f(x, y, z), cavityOffset(x, y, z, 13), 24);

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

const brainstemW = (x, y) => lerp(34, 16, smoothstep(330, 446, y));

/** All structures. part = id used by the structure list; layer = layer switch it belongs to. */
const structures = [
  // Skin and soft tissue
  { name: 'skin', layer: 'skin', part: null, color: '#EFE3D8', step: 3, field: skinField, box: [30, 60, -165, 560, 660, 165] },
  { name: 'palate', layer: 'skin', part: null, color: '#D2BBAA', step: 1, ...inflateBox(distanceGrid(S.palate.d, { band: S.palate.halfWidth }), 30, 2.5) },
  { name: 'pharynx', layer: 'skin', part: null, color: '#E2CFC2', step: 1.5, ...inflateBox(distanceGrid(S.pharynx.d, { band: S.pharynx.halfWidth }), 26, 8) },

  // Skull and spine
  { name: 'skull', layer: 'bone', part: 'foramen', color: '#E7DFCF', step: 2, field: skullField, box: [90, 65, -150, 550, 480, 150] },
  { name: 'tentorium', layer: 'bone', part: null, color: '#A69B85', step: 1, ...inflateBox(distanceGrid(S.tentorium.d, { band: S.tentorium.halfWidth }), 80, 1.25, insideSkull) },
  {
    name: 'c1', layer: 'bone', part: null, color: '#E7DFCF', step: 1, box: [270, 440, -80, 440, 495, 80],
    field: union(
      inflate(distanceGrid(S.c1Anterior), 10, 6).f,
      inflate(distanceGrid(S.c1Posterior), 10, 7).f,
      ring({ xc: 356, yc: 466, tilt: 8 / 116, a: 58, b: 46, tube: 7.5, tubeSide: 15, tall: 7, tallSide: 13 }),
    ),
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
  { name: 'cord', layer: 'brain', part: 'cord', color: '#EAD9B9', step: 1, ...inflateBox(distanceGrid(S.cord), 12) },

  // Spinal fluid
  { name: 'csf-spinal', layer: 'csf', part: 'csf', color: '#9CC3DA', opacity: 0.75, step: 1.5, ...inflateBox(distanceGrid('M326 446 L386 450 C388 510 390 580 392 640 L330 640 Z'), 26) },
  { name: 'cisterna', layer: 'csf', part: 'csf', conditions: ['typical'], color: '#9CC3DA', opacity: 0.75, step: 1, ...inflateBox(distanceGrid(S.cisterna), 40, 4, insideSkull) },
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
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.1, error: 0.002 }),
  quantize({ quantizePosition: 14 }),
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
