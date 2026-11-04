"""Turn the real head's midline cross-sections (from slice.mjs) into clean outlines for the Simple figure.
Run: python3 model/simple/reference/outlines.py za-z0.json za-z3.json out.json
"""
import json, math, sys

z0, z3 = (json.load(open(f)) for f in sys.argv[1:3])

def area(l):
    return 0.5 * sum(l[i][0] * l[i - 1][1] - l[i - 1][0] * l[i][1] for i in range(len(l)))

def biggest(loops):
    return max(loops, key=lambda l: abs(area(l)))

def smooth(pts, passes=3, closed=True):
    for _ in range(passes):
        n = len(pts)
        out = []
        for i in range(n):
            if not closed and (i == 0 or i == n - 1):
                out.append(pts[i]); continue
            a, b, c = pts[i - 1], pts[i], pts[(i + 1) % n]
            out.append([(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4])
        pts = out
    return pts

def resample(pts, step, closed=True):
    seq = pts + ([pts[0]] if closed else [])
    out = [seq[0]]
    carry = 0.0
    for a, b in zip(seq, seq[1:]):
        L = math.dist(a, b)
        t = step - carry
        while t <= L:
            out.append([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += step
        carry = L - (t - step)
    return out[:-1] if closed and len(out) > 2 and math.dist(out[0], out[-1]) < step / 2 else out

def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    def dist(p):
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1e-9
        return abs(dy * (p[0] - a[0]) - dx * (p[1] - a[1])) / L
    i, d = max(((i, dist(p)) for i, p in enumerate(pts[1:-1], 1)), key=lambda t: t[1])
    if d <= tol: return [a, b]
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)

def path(pts, closed=True, tol=0.6):
    if closed:
        far = max(range(len(pts)), key=lambda i: math.dist(pts[0], pts[i]))
        pts = dp(pts[:far + 1], tol)[:-1] + dp(pts[far:] + [pts[0]], tol)[:-1]
    else:
        pts = dp(pts, tol)
    s = 'M' + ' L'.join(f'{round(p[0], 1):g} {round(p[1], 1):g}' for p in pts)
    return s + (' Z' if closed else '')

def clean(loop, step=3, passes=3, tol=0.6):
    return path(smooth(resample(loop, step), passes), True, tol)

out = {}
# Head outline (skin), cut at the figure's bottom edge (y = 640).
skin = biggest(z0['skin'])
skin = [[x, min(y, 640)] for x, y in skin]
out['skin'] = clean(skin, 2, 2, 0.4)
out['callosum'] = clean(biggest(z0['callosum']), 3, 3)
out['lateralVentricle'] = clean(biggest(z3['ventricles']), 3, 3)
out['thalamus'] = clean(biggest(z3['diencephalon']), 3, 3)
out['brainstem'] = clean(biggest(z3['brainstem']), 3, 3)
out['fourthVentricle'] = clean(biggest(z3['ventricle-fourth']), 3, 3)
tent = biggest(z0['tentorium'])
out['tentoriumPts'] = max(((a, b) for a in tent for b in tent), key=lambda ab: math.dist(*ab))

# Skull vault: centre line between the inner and outer surface, by rays from a point inside the head.
cx, cy = 330, 330
segs = [(l[i], l[(i + 1) % len(l)]) for l in z0['skull'] for i in range(len(l))]
def hits(angle):
    dx, dy = math.cos(angle), math.sin(angle)
    ts = []
    for (ax, ay), (bx, by) in segs:
        ex, ey = bx - ax, by - ay
        den = dx * ey - dy * ex
        if abs(den) < 1e-9: continue
        t = ((ax - cx) * ey - (ay - cy) * ex) / den
        u = ((ax - cx) * dy - (ay - cy) * dx) / den
        if t > 0 and 0 <= u <= 1: ts.append(t)
    return sorted(ts)
vault = []
for k in range(0, 421):
    ang = math.radians(170 + k * 0.6)  # from the forehead, over the top, down the back
    ts = hits(ang)
    if len(ts) >= 2:
        r = (ts[-2] + ts[-1]) / 2
        vault.append([cx + r * math.cos(ang), cy + r * math.sin(ang), ts[-1] - ts[-2]])
out['vaultRaw'] = vault
json.dump(out, open(sys.argv[3], 'w'), indent=1)
for k, v in out.items():
    print(k, (v[:160] + '...') if isinstance(v, str) else (str(v[:3]) + ' ... ' + str(v[-3:]) if k == 'vaultRaw' else v))
