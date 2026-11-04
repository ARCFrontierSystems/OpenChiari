"""MRI comparison (CLAUDE.md rule 1a, check 4): the realistic Typical model's midline against the MNI152 2009c
average adult head (1 mm). Lines the model up with the scan by four landmarks seen on both (rotation, shift and one
overall scale; matching outlines automatically let the model tip), then reports how well the head and brain line up
and measures the scan where the model has numbers.
No scan images are published on the site; the pictures are for the audit report only.

Run: python compare.py mni_t1.nii.gz model-z0.json model-z3.json out_dir
"""
import json, math, sys
import numpy as np
import nibabel as nib
from scipy import ndimage
from PIL import Image, ImageDraw

mni_file, z0f, z3f, out = sys.argv[1:5]
img = nib.load(mni_file)
vol = img.get_fdata()
A = img.affine
i0 = int(round(-A[0, 3]))                 # voxel column of MNI x = 0 (the midline)
sl = vol[i0 - 1:i0 + 2].mean(axis=0)      # (y, z), 1 mm; average of 3 slices for less noise
ny, nz = sl.shape
yy = np.arange(ny) + A[1, 3]              # MNI y (front +)
zz = np.arange(nz) + A[2, 3]              # MNI z (up +)

# Scan masks on the midline: the head (anything brighter than air), and brain tissue (grey and white matter).
head = ndimage.binary_fill_holes(ndimage.binary_closing(sl > 1200, iterations=3))
# Brain tissue: bright, and well inside the head (scalp fat is just as bright on T1, so leave out the outer 14 mm).
brain = (sl > 5200) & ndimage.binary_erosion(head, iterations=14)

# Model outlines (figure units) -> model mm (X back, Y up).
def loops(f, name):
    L = json.load(open(f)).get(name, [])
    return [[((x - 369) / 2, (444.5 - y) / 2) for x, y in l] for l in L]
Z0, Z3 = json.load(open(z0f)), json.load(open(z3f))
def mm(L):
    return [[((x - 369) / 2, (444.5 - y) / 2) for x, y in l] for l in L]
skin = max(mm(Z0['skin']), key=len)

def raster(polys, T, fill=True):
    """Draw model polygons (mm) into the scan's (y, z) grid with transform T (model mm -> MNI y, z)."""
    im = Image.new('L', (ny, nz), 0)
    dr = ImageDraw.Draw(im)
    for p in polys:
        pts = [T(x, y) for x, y in p]
        pts = [(py - yy[0], pz - zz[0]) for py, pz in pts]
        if len(pts) > 2:
            dr.polygon(pts, fill=255 if fill else 0, outline=255)
    return (np.array(im).T > 0)  # -> (y, z)

def make_T(theta, s, ty, tz):
    c, si = math.cos(theta), math.sin(theta)
    # model X (back) -> MNI -y ; model Y (up) -> MNI z ; then rotate (head pitch), scale, shift
    def T(x, y):
        u, v = -x, y
        return (s * (c * u - si * v) + ty, s * (si * u + c * v) + tz)
    return T

# Compare only above the lowest row both cover.
valid = np.zeros_like(head); valid[:, zz > zz[0] + 2] = True
def dice(a, b):
    a, b = a & valid, b & valid
    return 2 * (a & b).sum() / max(1, a.sum() + b.sum())

# Alignment by landmarks visible on both (read from the scan's midline on a 1 mm grid; MNI y forward, z up):
# front and back ends of the corpus callosum, the fastigium (peak of the fourth ventricle), and the front of the pons.
MNI_LANDMARKS = {'genu': (35.5, 4.0), 'splenium': (-42.5, 12.0), 'fastigium': (-51.0, -30.0), 'pons': (-15.0, -36.0)}
cc = max(mm(Z0['callosum']), key=len)
v4 = [p for L in mm(Z3['ventricle-fourth']) for p in L]
bs = [p for L in mm(Z3['brainstem']) for p in L]
model_lm = {
    'genu': min(cc, key=lambda p: p[0]),              # front-most (model x is toward the back)
    'splenium': max(cc, key=lambda p: p[0]),          # back-most
    'fastigium': max((p for p in v4 if p[1] > 22), key=lambda p: p[0]),  # peak of the fourth ventricle (its upper part)
}
# Front of the pons: the brainstem's front edge level with the fastigium (as on the scan).
model_lm['pons'] = min((p for p in bs if abs(p[1] - model_lm['fastigium'][1]) < 2), key=lambda p: p[0])
# Best similarity transform (rotation, one scale, shift) from model (u = -x, v = y) to MNI (y, z), least squares.
P = np.array([(-model_lm[k][0], model_lm[k][1]) for k in MNI_LANDMARKS]); Q = np.array(list(MNI_LANDMARKS.values()))
Pc, Qc = P - P.mean(0), Q - Q.mean(0)
U, S_, Vt = np.linalg.svd(Pc.T @ Qc)
R = (U @ Vt).T
if np.linalg.det(R) < 0:
    Vt[-1] *= -1; R = (U @ Vt).T
s = S_.sum() / (Pc ** 2).sum()
th = math.atan2(R[1, 0], R[0, 0])
ty, tz = Q.mean(0) - s * (R @ P.mean(0))
T = make_T(th, s, ty, tz)
resid = [math.dist(T(*model_lm[k]), MNI_LANDMARKS[k]) for k in MNI_LANDMARKS]
print(f'alignment by landmarks: rotation {math.degrees(th):.1f} deg, scale {s:.3f}, landmark misfit ' + ', '.join(f'{k} {r:.1f} mm' for k, r in zip(MNI_LANDMARKS, resid)))
brain_model = ndimage.binary_closing(raster(mm(Z3['cerebrum']) + mm(Z3['cerebellum']) + mm(Z3['brainstem']) + mm(Z3.get('diencephalon', [])), T), iterations=2)
print(f'head outline overlap (Dice): {dice(raster([skin], T), head):.3f}; brain tissue overlap on the midline (Dice): {dice(brain_model, brain):.3f}')
best = (None, None)

# Landmarks: the model's McRae line (from check.mjs: basion (-19.0, 2.5), opisthion (19.0, -2.8) in model mm).
bas, opi = T(-19.0, 2.5), T(19.0, -2.8)
def to_px(p):
    return (p[0] - yy[0], p[1] - zz[0])
json.dump({'theta_deg': math.degrees(th), 'scale': s, 'shift': [ty, tz], 'landmark_misfit_mm': resid, 'basion': bas, 'opisthion': opi}, open(f'{out}/alignment.json', 'w'), indent=1)

# Picture: the scan slice (posterior fossa zoom and whole head) with the model outlines drawn over it.
def picture(fname, box, scale_px):
    g = sl.T[::-1]  # rows = z from top
    g = np.clip(g / 9000 * 255, 0, 255).astype(np.uint8)
    im = Image.fromarray(g).convert('RGB')
    dr = ImageDraw.Draw(im)
    col = {'skin': (255, 80, 80), 'cerebrum': (230, 120, 230), 'cerebellum': (255, 160, 40), 'brainstem': (60, 220, 60),
           'tonsil': (255, 255, 0), 'cord': (60, 220, 60), 'ventricle-fourth': (80, 160, 255), 'occipital': (255, 255, 255),
           'c2': (200, 200, 200), 'c1': (200, 200, 200), 'csf-cranial': (80, 200, 255)}
    for name, src in (('skin', Z0), ('occipital', Z0), ('c1', Z0), ('c2', Z0), ('cerebrum', Z3), ('cerebellum', Z3), ('brainstem', Z3), ('tonsil', None), ('cord', Z3), ('ventricle-fourth', Z3), ('csf-cranial', Z0)):
        L = mm(json.load(open(z0f.replace('z0', 'z6')))['tonsil']) if name == 'tonsil' else mm(src.get(name, []))
        for p in L:
            pts = [to_px(T(x, y)) for x, y in p]
            pts = [(a, nz - 1 - b) for a, b in pts]
            dr.line(pts + [pts[0]], fill=col[name], width=1)
    b1, b2 = to_px(bas), to_px(opi)
    dr.line([(b1[0], nz - 1 - b1[1]), (b2[0], nz - 1 - b2[1])], fill=(255, 255, 255), width=1)
    x0, z0_, x1, z1 = box
    crop = im.crop((x0, nz - 1 - z1, x1, nz - 1 - z0_))
    crop = crop.resize((crop.width * scale_px, crop.height * scale_px), Image.NEAREST)
    crop.save(f'{out}/{fname}')
picture('overlay-head.png', (0, 0, ny, nz), 3)
cy, cz = to_px(((bas[0] + opi[0]) / 2, (bas[1] + opi[1]) / 2))
picture('overlay-fossa.png', (int(cy - 45), int(cz - 45), int(cy + 45), int(cz + 55)), 7)
print('pictures written')

# ---- Measurements on the scan, using the alignment ----
inv_c, inv_s = math.cos(-th), math.sin(-th)
def to_model(py, pz):
    """MNI (y, z) -> model mm (x back, y up)."""
    a, b = (py - ty) / s, (pz - tz) / s
    u, v = inv_c * a - inv_s * b, inv_s * a + inv_c * b
    return (-u, v)
bm_, om_ = (-19.0, 2.5), (19.0, -2.8)
d_ = (om_[0] - bm_[0], om_[1] - bm_[1]); L_ = math.hypot(*d_); n_ = (-d_[1] / L_, d_[0] / L_)
if n_[1] < 0: n_ = (-n_[0], -n_[1])
above = lambda p: (p[0] - bm_[0]) * n_[0] + (p[1] - bm_[1]) * n_[1]
print(f'scan field of view ends {-above(to_model(0, zz[0])):.0f} mm below the McRae line (in the middle)')

# Lowest point of the cerebellum (tonsils) on the scan, 4 to 8 mm either side of the midline, where the tonsils sit.
lows = []
for dx in (-8, -6, -4, 4, 6, 8):
    sl2 = vol[i0 + dx]
    tissue = (sl2 > 4800) & ndimage.binary_erosion(ndimage.binary_fill_holes(ndimage.binary_closing(sl2 > 1200, iterations=3)), iterations=14)
    lab, n = ndimage.label(tissue)
    seed = (int(round(-55 - yy[0])), int(round(-35 - zz[0])))  # inside the cerebellum (MNI y -55, z -35)
    k = lab[seed]
    if k == 0:
        continue
    pts = np.argwhere(lab == k)
    # the cerebellum part: behind the brainstem (MNI y < -38)
    pts = [p for p in pts if yy[p[0]] < -38]
    lowp = min(pts, key=lambda p: above(to_model(yy[p[0]], zz[p[1]])))
    lows.append(above(to_model(yy[lowp[0]], zz[lowp[1]])))
Z6 = json.load(open(z0f.replace('z0', 'z6')))
model_tip = min(above(p) for L in mm(Z6['tonsil']) for p in L)
if lows:
    print(f'lowest cerebellar tissue on the scan (4 to 8 mm from the midline): {np.median(lows):+.1f} mm from the McRae line '
          f'(range {min(lows):+.1f} to {max(lows):+.1f}); model tonsil tip {model_tip:+.1f} mm (EVIDENCE.md: about +1)')
print('landmark misfits after alignment (mm): ' + ', '.join(f'{k} {r:.1f}' for k, r in zip(MNI_LANDMARKS, resid)))
