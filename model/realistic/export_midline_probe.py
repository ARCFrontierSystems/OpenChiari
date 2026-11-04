"""First-look export: the head and upper neck from the Z-Anatomy atlas, cut at the midline (left half kept),
as a glTF file for viewing in Three.js. Also prints the McRae line and tonsil measurements.
The atlas file is opened with its embedded scripts turned off. Probe only, not the production pipeline.

Run: model/realistic/.venv/bin/python -I model/realistic/export_midline_probe.py model/source/Z-Anatomy/Startup.blend out.glb
"""
import sys, math
import bpy, bmesh
from mathutils import Vector

blend, out_glb = sys.argv[1], sys.argv[2]
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

# ---- Render: keep the left half (x >= midline) of head-and-neck objects; look at the cut from the right.
zmin = min(zs) - 0.09  # down to about C4
keep_cols = ('1: Skeletal system', '7: Nervous system & Sense organs', '3: Joints')
scene = bpy.context.scene
for o in list(scene.objects):
    o.hide_render = True
chosen = []
for o in bpy.data.objects:
    if o.type != 'MESH' or len(o.data.vertices) < 60: continue
    if not any(c.name in keep_cols for c in o.users_collection): continue
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    if max(v.z for v in bb) < zmin or min(v.z for v in bb) < zmin - 0.05: continue
    if min(v.y for v in bb) > max(ys) + 0.03 or max(v.x for v in bb) < mid_x - 0.001: continue
    if any(k in o.name.lower() for k in ('nerve', 'artery', 'vein', 'falx', 'sinus')): continue
    chosen.append(o)
print('exporting', len(chosen), 'objects')
for o in chosen:
    bm = bmesh.new(); bm.from_mesh(o.data)
    bm.transform(o.matrix_world)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(mid_x, 0, 0), plane_no=(1, 0, 0), clear_inner=True)
    bm.transform(o.matrix_world.inverted())
    bm.to_mesh(o.data); bm.free()
    o.hide_render = False
    mat = bpy.data.materials.new(o.name + '_probe')
    name = o.name.lower()
    col = (0.91, 0.87, 0.81, 1)
    if any(k in name for k in ('tonsil',)): col = (0.82, 0.55, 0.50, 1)
    elif any(k in name for k in ('lobule', 'vermis', 'flocc', 'cerebell')): col = (0.87, 0.74, 0.70, 1)
    elif any(k in name for k in ('medulla', 'pons', 'midbrain')): col = (0.89, 0.76, 0.71, 1)
    elif any(k in name for k in ('gyrus', 'lobe', 'cortex', 'pole', 'callosum', 'thalam')): col = (0.91, 0.81, 0.78, 1)
    elif any(k in name for k in ('ventric', 'dura', 'tentor', 'falx')): col = (0.66, 0.79, 0.88, 1)
    mat.diffuse_color = col
    mat.use_nodes = True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = col
    o.data.materials.clear(); o.data.materials.append(mat)


for o in bpy.data.objects:
    o.select_set(False)
for o in chosen:
    o.select_set(True)
    o.data.materials[0]['probe_color'] = list(o.data.materials[0].diffuse_color)
bpy.context.view_layer.objects.active = chosen[0]
bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', use_selection=True, export_apply=False,
                          export_materials='EXPORT', export_extras=False, export_animations=False, export_skins=False,
                          export_morph=False, export_cameras=False, export_lights=False, export_yup=True)
print('wrote', out_glb)
