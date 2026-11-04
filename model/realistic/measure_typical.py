"""Measures the Z-Anatomy atlas as it comes (typical anatomy): the foramen magnum along the midline
(basion to opisthion, the McRae line) and the lowest cerebellar tonsil point relative to that line.
Compare with docs/EVIDENCE.md. The atlas file is opened with its embedded scripts turned off.

Run: model/realistic/.venv/bin/python -I model/realistic/measure_typical.py model/source/Z-Anatomy/Startup.blend
"""
import sys, math
import bpy, bmesh
from mathutils import Vector

blend = sys.argv[1]
bpy.ops.wm.open_mainfile(filepath=blend, load_ui=False, use_scripts=False)

def mesh_world_verts(o):
    m = o.matrix_world
    return [m @ v.co for v in o.data.vertices]

occ = bpy.data.objects['Occipital bone']
ov = mesh_world_verts(occ)
xs = [v.x for v in ov]; ys = [v.y for v in ov]; zs = [v.z for v in ov]
print('occipital bounds x %.3f..%.3f y %.3f..%.3f z %.3f..%.3f' % (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)))
mid_x = (min(xs) + max(xs)) / 2
print('midline x ~ %.4f' % mid_x)

# Midline slice of the occipital bone: vertices within 1.5 mm of the midline.
sl = [v for v in ov if abs(v.x - mid_x) < 0.0015]
# Foramen magnum: in the midline the bone has a gap between the basilar part (front) and the squama (back).
# Look at the lowest points: sort midline points by y (front-back) and find the biggest gap along the inferior edge.
sl.sort(key=lambda v: v.y)
best = (0, None, None)
for a, b in zip(sl, sl[1:]):
    gap = b.y - a.y
    if gap > best[0]:
        best = (gap, a, b)
gap, a, b = best
print('largest midline gap in occipital: %.1f mm between y=%.4f and y=%.4f (z %.4f, %.4f)' % (gap * 1000, a.y, b.y, a.z, b.z))

# Tonsils: lowest point
tl = bpy.data.objects['Tonsil of cerebellum.l']; tr = bpy.data.objects['Tonsil of cerebellum.r']
tv = mesh_world_verts(tl) + mesh_world_verts(tr)
low = min(tv, key=lambda v: v.z)
print('tonsil lowest point x %.4f y %.4f z %.4f' % (low.x, low.y, low.z))

# Which end is front? The face (frontal bone) tells us.
fb = mesh_world_verts(bpy.data.objects['Frontal bone'])
front_y = sum(v.y for v in fb) / len(fb)
print('frontal bone mean y %.4f (front is %s y)' % (front_y, '-' if front_y < a.y else '+'))
basion, opisthion = (a, b) if (front_y < a.y) else (b, a)
# Perpendicular distance from the tonsil tip to the McRae line, in the midline plane (y, z).
d = Vector((0, opisthion.y - basion.y, opisthion.z - basion.z)).normalized()
n = Vector((0, -d.z, d.y))
if n.z < 0: n = -n
rel = Vector((0, low.y - basion.y, low.z - basion.z))
print('McRae line length %.1f mm' % ((opisthion - basion).length * 1000))
print('tonsil tip is %.1f mm %s the McRae line' % (abs(rel.dot(n)) * 1000, 'above' if rel.dot(n) > 0 else 'below'))

