"""Write the real-head outlines into src/lib/anatomy-shapes.json (Simple figure and model).
Inputs: outlines JSON from outlines.py. Structures at and below the foramen magnum (McRae line, tonsils,
cord, canal, fluid in the neck, vertebrae) are not touched.
Run: python3 model/simple/reference/apply_real.py outlines.json
"""
import json, math, re, sys
O = json.load(open(sys.argv[1]))
P = 'src/lib/anatomy-shapes.json'
S = json.load(open(P))
f = lambda v: f'{round(v, 1):g}'
poly = lambda pts, closed=False: 'M' + ' L'.join(f'{f(x)} {f(y)}' for x, y in pts) + (' Z' if closed else '')

def smooth(pts, passes):
    for _ in range(passes):
        pts = [pts[0]] + [[(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4] for a, b, c in zip(pts, pts[1:], pts[2:])] + [pts[-1]]
    return pts

S['skin'] = O['skin']
S['callosum'] = O['callosum']
S['lateralVentricle'] = O['lateralVentricle']
S['thalamus'] = O['thalamus']
S['fourthVentricle'] = O['fourthVentricle']

# Skull vault centre line: the real vault (front and top), then the back of the skull down to the opisthion.
vault = [[x, y] for x, y, t in O['vaultRaw'] if t > 3 and y < 352 and not (x > 470 and y > 250)]
vault = [p for p in vault if p[0] < 497 or p[1] < 255]
vault = [[150, 352], [148, 336]] + [p for p in vault if p[1] < 318] + [[506, 280], [512, 316], [506, 360], [490, 392], [466, 418], [438, 436], [404, 449]]
vault = smooth(vault, 10)
vault[0], vault[-1] = [150, 352], [404, 449]
# Keep a point every ~18 units and draw a smooth curve through them (Catmull-Rom as cubic Bezier).
thin = [vault[0]]
for p in vault[1:-1]:
    if math.dist(p, thin[-1]) >= 26: thin.append(p)
thin.append(vault[-1])
def bezier(pts):
    d = f'M{f(pts[0][0])} {f(pts[0][1])}'
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, len(pts) - 1)]
        c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
        c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
        d += f' C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}'
    return d
S['skull']['d'] = bezier(thin)
# Brain surface: 13 units (6.5 mm) inside the skull centre line (4 mm of bone, then the fluid space).
dome = []
for i in range(1, len(vault) - 1):
    (ax, ay), (bx, by) = vault[i - 1], vault[i + 1]
    nx, ny = -(by - ay), bx - ax
    L = math.hypot(nx, ny) or 1
    x, y = vault[i][0] + 13 * nx / L, vault[i][1] + 13 * ny / L
    if 300 >= y or x > 330: dome.append([x, y])
# Skull base: anterior cranial fossa floor, the sella and the dorsum (real positions), meeting the clivus.
S['skullBase']['d'] = 'M150 352 C185 356 222 350 252 351 C261 352 265 356 266 362 C268 378 284 381 290 368 L297 360'
# Clivus: dorsum sellae to the basion (about 44 mm; EVIDENCE.md 39 to 47 mm).
S['clivus'] = 'M287 364 L299 360 C304 382 318 414 334 440 L328 446 C306 434 290 408 287 364 Z'
# Brainstem: midbrain, pons and medulla (real height), meeting the spinal cord at the foramen magnum as before.
S['brainstem'] = ('M300 328 L351 331 C355 340 353 352 349 362 L347 376 C349 390 355 405 360 416 '
                  'C362 425 359 438 358 446 L336 446 C333 437 329 424 325 412 C318 398 312 388 309 378 '
                  'C304 368 302 356 302 346 C302 338 301 333 300 328 Z')
# Tentorium: sloping down toward the back, as in the real head.
S['tentorium']['d'] = 'M364 338 L486 382'
# Cerebellum under the tentorium; the lower part, where the tonsils attach, is unchanged.
S['cerebellum'] = ('M360 352 C366 344 380 342 400 350 C430 360 456 370 472 380 C481 386 480 398 470 404 '
                   'C462 412 436 420 404 426 C388 430 376 424 372 414 C366 410 362 404 362 398 C362 392 368 387 377 384 C368 372 360 362 360 352 Z')
S['folia'] = 'M378 356 C400 352 430 360 458 373 M472 390 C474 394 472 398 466 402 M446 413 C430 418 416 421 404 423'
S['arborVitae'] = 'M380 386 C400 380 424 378 452 378 M402 380 C412 372 424 366 436 364 M380 388 C404 392 430 396 462 396 M410 392 C426 404 442 412 458 416 M394 390 C404 404 412 416 420 426'
# Cerebrum: the real outline (top, front and back), resting on the skull base in front and the tentorium behind.
front = [p for p in dome if p[0] <= 330 and p[1] <= 300]
back = [p for p in dome if p[0] > 330 and p[1] <= 368]
top = front + back
cer = [top[0]]
for p in top[1:]:
    if math.dist(p, cer[-1]) >= 18: cer.append(p)
cer.append(top[-1])
lower = [[480, 374], [450, 364], [410, 349], [368, 333], [340, 322], [318, 320], [300, 330], [282, 342], [250, 346], [200, 348], [172, 345]]
S['cerebrum'] = bezier(cer + lower + [cer[0]]) + ' Z'
# Gyri: the same decorative lines, moved into the new outline.
def remap(d):
    def fx(m):
        x, y = float(m.group(1)), float(m.group(2))
        return f'{f(160 + (x - 140) * 340 / 354)} {f(172 + (y - 118) * 170 / 227)}'
    return re.sub(r'(-?[\d.]+) (-?[\d.]+)', fx, d)
S['gyri'] = remap(S['gyri'])
# Roof of the mouth and the back of the throat (real height).
S['palate']['d'] = 'M138 458 L232 462'
S['pharynx']['d'] = 'M240 468 C258 480 270 505 274 535 L282 640'
json.dump(S, open(P, 'w'), indent=2)
open(P, 'a').write('\n')
print('skull', S['skull']['d'][:200])
