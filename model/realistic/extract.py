"""
Extracts the head and upper neck from the Z-Anatomy atlas into the Open Chiari realistic model (Typical anatomy).

What it does, in plain terms:
- Opens the atlas with its embedded script turned off.
- Picks structures by their place in the atlas's own family tree (for example everything under "Cerebellum"),
  and groups them into the site's structures and layers (docs/DESIGN.md anatomy palette).
- Builds what the atlas lacks: a spinal cord inside the atlas's spinal dura, continuing from the medulla.
- Moves everything into the site's model space: millimetres, origin at the middle of the foramen magnum,
  +x toward the back of the head, +y up, +z to the side (same as the Simple model).
- Cuts everything off at the bottom of the figure (about 98 mm below the foramen magnum), joins each group into
  one surface, and saves a glTF file. Prints the McRae line and tonsil measurements and how closed each surface is.

Run:
  model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend out.glb
"""
import sys, math
import bpy, bmesh
from mathutils import Vector, Matrix

blend, out_glb = sys.argv[1], sys.argv[2]
bpy.ops.wm.open_mainfile(filepath=blend, load_ui=False, use_scripts=False)
D = bpy.data

# ---------------------------------------------------------------- family tree helpers
def ancestors(o):
    out = []
    p = o.parent
    while p:
        out.append(p.name)
        p = p.parent
    return out

def is_real_mesh(o):
    # Labels and leader lines in the atlas are tiny meshes (2 or 3 points); skip them.
    return o.type == 'MESH' and len(o.data.vertices) >= 40

# ---------------------------------------------------------------- landmarks: the McRae line
def world_verts(o):
    m = o.matrix_world
    return [m @ v.co for v in o.data.vertices]

occ = D.objects['Occipital bone']
ov = world_verts(occ)
mid_x = (min(v.x for v in ov) + max(v.x for v in ov)) / 2
# In the midline, the occipital bone has a gap: the foramen magnum. Its front edge is the basion,
# its back edge the opisthion. Use the lowest midline points on each side of the largest gap.
sl = sorted([v for v in ov if abs(v.x - mid_x) < 0.0015], key=lambda v: v.y)
gap, a, b = max(((q.y - p.y, p, q) for p, q in zip(sl, sl[1:])), key=lambda t: t[0])
front_back = sorted([a, b], key=lambda v: v.y)  # the face is toward -y
basion, opisthion = front_back[0], front_back[1]
fm_mid = (basion + opisthion) / 2

# Atlas (metres, z up, face toward -y) -> model (mm, origin at the foramen magnum middle).
# Written so that after glTF's y-up conversion: glTF x = back, y = up, z = side.
S = 1000.0
TO_MODEL = Matrix((
    (0, S, 0, -S * fm_mid.y),
    (-S, 0, 0, S * mid_x),
    (0, 0, S, -S * fm_mid.z),
    (0, 0, 0, 1),
))
BOTTOM_MM = -98.0  # bottom edge of the figure (y = 640 figure units), in model mm (up is +)

# ---------------------------------------------------------------- choosing and grouping structures
EXCLUDE_WORDS = ('nerve', 'artery', 'arteries', 'vein', 'sinus', 'nucleus', 'nuclei', 'tract', 'fasciculus',
                 'lemniscus', 'falx', 'hairs', 'tooth socket')

def group_of(o):
    """Returns (group name) for an atlas surface, or None to leave it out."""
    n = o.name
    low = n.lower()
    anc = ancestors(o)
    if any(w in low for w in EXCLUDE_WORDS):
        return None
    if 'Tonsil of cerebellum' in n:
        return 'tonsil'
    if n == 'Fourth ventricle':
        return 'ventricle-fourth'
    if 'ventricle' in low or 'Aqueduct' in n:
        return 'ventricles'
    if 'Corpus callosum' in n:
        return 'callosum'
    if 'Cerebellum.g' in anc:
        return 'cerebellum'
    if 'Brainstem.g' in anc:
        return 'brainstem'
    if 'Diencephalon.g' in anc:
        return 'diencephalon'
    if 'Cerebrum.g' in anc:
        return 'cerebrum'
    if n == 'Spinal dura':
        return 'dura'
    if 'Tentorium cerebelli' in n:
        return 'tentorium'
    if n == 'Atlas (C1)':
        return 'c1'
    if n == 'Axis (C2)':
        return 'c2'
    if n in ('Vertebra C3', 'Vertebra C4', 'Vertebra C5'):
        return 'c3-c5'
    if n.startswith('Intervertebral disc C') or n.startswith('Nucleus pulposus C'):
        return 'discs'
    if n == 'Occipital bone':
        return 'occipital'
    if any(g in anc for g in ('Bones of cranium.g', 'Facial bones.g', 'Viscerocranium.g', 'Neurocranium.g', 'Cranium.g')) \
            or n in ('Mandible', 'Hyoid bone'):
        return 'skull'
    if 'Teeth.g' in anc or 'tooth' in low or 'molar' in low or 'incisor' in low or 'canine' in low:
        return 'skull'
    if any(g in anc for g in ('Regions of head.g', 'Regions of neck.g')):
        return 'skin'
    return None

# Site palette (docs/DESIGN.md) and which layer and structure-list part each group belongs to.
GROUPS = {
    'skin':             dict(layer='skin',  part=None,         color='#EFE3D8'),
    'skull':            dict(layer='bone',  part=None,         color='#E7DFCF'),
    'occipital':        dict(layer='bone',  part='foramen',    color='#E7DFCF'),
    'c1':               dict(layer='bone',  part=None,         color='#E7DFCF'),
    'c2':               dict(layer='bone',  part='c2',         color='#E7DFCF'),
    'c3-c5':            dict(layer='bone',  part=None,         color='#E7DFCF'),
    'discs':            dict(layer='bone',  part=None,         color='#D9C3A4'),
    'tentorium':        dict(layer='bone',  part=None,         color='#A69B85'),
    'cerebrum':         dict(layer='brain', part='cerebrum',   color='#E9CFC6'),
    'callosum':         dict(layer='brain', part='callosum',   color='#F4E6E1'),
    'diencephalon':     dict(layer='brain', part=None,         color='#E3BFB3'),
    'brainstem':        dict(layer='brain', part='brainstem',  color='#E3C2B6'),
    'cerebellum':       dict(layer='brain', part='cerebellum', color='#DDBDB3'),
    'tonsil':           dict(layer='brain', part='tonsil',     color='#DDBDB3'),
    'cord':             dict(layer='brain', part='cord',       color='#EAD9B9'),
    'dura':             dict(layer='csf',   part='csf',        color='#9CC3DA', opacity=0.75),
    'ventricles':       dict(layer='csf',   part=None,         color='#A9CBE0'),
    'ventricle-fourth': dict(layer='csf',   part='ventricle',  color='#A9CBE0'),
}

# Region to keep: head and neck down to just below the figure's bottom edge.
def in_region(o):
    bb = [TO_MODEL @ (o.matrix_world @ Vector(c)) for c in o.bound_box]
    top = max(v.z for v in bb)  # model "up" is Blender z after TO_MODEL
    return top > BOTTOM_MM - 5

members = {g: [] for g in GROUPS}
for o in D.objects:
    if not is_real_mesh(o):
        continue
    g = group_of(o)
    if g and in_region(o):
        members[g].append(o)

# ---------------------------------------------------------------- build each group as one closed-as-possible surface
out_col = D.collections.new('openchiari')
bpy.context.scene.collection.children.link(out_col)

def bm_from(objs):
    bm = bmesh.new()
    for o in objs:
        tmp = bmesh.new()
        tmp.from_mesh(o.data)
        tmp.transform(TO_MODEL @ o.matrix_world)
        m = D.meshes.new('tmp')
        tmp.to_mesh(m)
        tmp.free()
        bm.from_mesh(m)
        D.meshes.remove(m)
    return bm

def cut_bottom(bm, fill=True):
    """Cut everything below the figure's bottom edge, and close the cut so the surface stays closed."""
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    res = bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, BOTTOM_MM), plane_no=(0, 0, 1), clear_inner=True)
    if fill:
        edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
        if edges:
            bmesh.ops.holes_fill(bm, edges=edges, sides=0)

def open_edges(bm):
    return sum(1 for e in bm.edges if not e.is_manifold)

def srgb_to_linear(h):
    out = []
    for k in (1, 3, 5):
        c = int(h[k:k + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return out

def close_small_openings(bm, max_edges=120, lift=1.5):
    """Close small openings (eyes, mouth) with a gently rounded fill: a calm closed-eye, closed-mouth look."""
    boundary = [e for e in bm.edges if e.is_boundary]
    res = bmesh.ops.holes_fill(bm, edges=boundary, sides=max_edges)
    faces = res['faces']
    if not faces:
        return 0
    poked = bmesh.ops.poke(bm, faces=faces)
    for v in poked['verts']:
        n = Vector()
        for f in v.link_faces:
            n += f.normal
        if n.length:
            v.co += n.normalized() * lift
    bmesh.ops.smooth_vert(bm, verts=list({v for f in poked['faces'] for v in f.verts}), factor=0.5,
                          use_axis_x=True, use_axis_y=True, use_axis_z=True)
    return len(faces)

def finish(name, bm):
    weld = 0.3 if name == 'skin' else 0.05
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld)  # weld matching edges of neighbouring pieces (mm)
    if name == 'skin':
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        print('skin: closed', close_small_openings(bm), 'small openings (eyes, mouth)')
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    info = GROUPS[name]
    me = D.meshes.new(name)
    bm.to_mesh(me)
    tris = sum(len(f.verts) - 2 for f in bm.faces)
    oe = open_edges(bm)
    bm.free()
    ob = D.objects.new(name, me)
    out_col.objects.link(ob)
    mat = D.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*srgb_to_linear(info['color']), 1)
    bsdf.inputs['Roughness'].default_value = 0.85
    if info.get('opacity'):
        bsdf.inputs['Alpha'].default_value = info['opacity']
    me.materials.append(mat)
    ob['layer'] = info['layer']
    ob['part'] = info['part'] or ''
    ob['color'] = info['color']
    ob['opacity'] = info.get('opacity', 1)
    print(f'{name:18} {len(members.get(name, [])):4} atlas parts  {tris:8} triangles  open edges {oe}')
    return ob

built = []
for name, objs in members.items():
    if name == 'cord' or not objs:
        continue
    bm = bm_from(objs)
    cut_bottom(bm, fill=(name in ('dura', 'skin')))
    built.append(finish(name, bm))

# ---------------------------------------------------------------- spinal cord (not in the atlas)
# Follow the middle of the spinal dura downward from the bottom of the medulla, with the medulla's own
# bottom cross-section size, narrowing slightly toward the neck.
dura = D.objects['dura']
dv = [v.co for v in dura.data.vertices]
medulla = [TO_MODEL @ (o.matrix_world @ v.co) for o in members['brainstem'] if 'Medulla' in o.name for v in o.data.vertices]
med_bottom = min(v.z for v in medulla)
ring_low = [v for v in medulla if v.z < med_bottom + 3]
rx = (max(v.x for v in ring_low) - min(v.x for v in ring_low)) / 2  # front-back half size
ry = (max(v.y for v in ring_low) - min(v.y for v in ring_low)) / 2  # side-to-side half size
top_z = med_bottom + 2
steps = 40
ring_n = 24
bm = bmesh.new()
rings = []
for k in range(steps + 1):
    z = top_z + (BOTTOM_MM - top_z) * k / steps
    slab = [v for v in dv if abs(v.z - z) < 2.0]
    if slab:
        cx = sum(v.x for v in slab) / len(slab)
        cy = sum(v.y for v in slab) / len(slab)
    shrink = 1 - 0.12 * (k / steps)
    ring = [bm.verts.new((cx + rx * shrink * math.cos(2 * math.pi * j / ring_n),
                          cy + ry * shrink * math.sin(2 * math.pi * j / ring_n), z)) for j in range(ring_n)]
    rings.append(ring)
for r0, r1 in zip(rings, rings[1:]):
    for j in range(ring_n):
        bm.faces.new((r0[j], r0[(j + 1) % ring_n], r1[(j + 1) % ring_n], r1[j]))
bm.faces.new(list(reversed(rings[0])))
bm.faces.new(rings[-1])
members['cord'] = []
print(f'cord built: {2 * rx:.1f} mm front to back, {2 * ry:.1f} mm across at the top')
built.append(finish('cord', bm))

# ---------------------------------------------------------------- fluid space around the brain in the posterior fossa
# The atlas has no fluid spaces around the brain. Compute them: a point counts as spinal fluid if it lies inside
# the skull (bone behind it and to both sides), above the McRae line, below the tentorium, and is not brain or bone.
# Because it is computed, lowering the tonsils (Chiari I) shrinks this space automatically.
from mathutils.bvhtree import BVHTree

def bvh_of(names):
    bm = bmesh.new()
    for nme in names:
        o = D.objects.get(nme)
        if o:
            bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    t = BVHTree.FromBMesh(bm)
    bm.free()
    return t

brain_tree = bvh_of(['cerebellum', 'tonsil', 'brainstem', 'ventricle-fourth', 'cord', 'cerebrum', 'diencephalon'])
bone_tree = bvh_of(['occipital', 'skull', 'c1', 'c2'])
roof_tree = bvh_of(['tentorium', 'cerebrum', 'cerebellum'])

bas_m = TO_MODEL @ basion
opi_m = TO_MODEL @ opisthion
def above_mcrae(p):
    # model x (back) and z (up); positive = above the line
    d = Vector((opi_m.x - bas_m.x, opi_m.z - bas_m.z)).normalized()
    n = Vector((-d.y, d.x))
    if n.y < 0:
        n = -n
    return Vector((p.x - bas_m.x, p.z - bas_m.z)).dot(n)

def inside(tree, p):
    loc, nrm, _, dist = tree.find_nearest(p)
    return loc is not None and (p - loc).dot(nrm) < 0, (dist if loc is not None else 1e9)

STEP = 1.0
fluid = []
for ix in range(-10, 80):
    for iz in range(-6, 50):
        for iy in range(-32, 33):
            p = Vector((ix * STEP, iy * STEP, iz * STEP))
            if above_mcrae(p) < -1.0:
                continue
            b_in, b_d = inside(brain_tree, p)
            if b_in or b_d < 0.6:
                continue
            o_in, o_d = inside(bone_tree, p)
            if o_in or o_d < 0.6:
                continue
            # enclosed: bone behind, and on both sides; something (tentorium or brain) above
            if bone_tree.ray_cast(p, Vector((1, 0, 0)), 150)[0] is None:
                continue
            if bone_tree.ray_cast(p, Vector((0, 1, 0)), 150)[0] is None or bone_tree.ray_cast(p, Vector((0, -1, 0)), 150)[0] is None:
                continue
            if roof_tree.ray_cast(p, Vector((0, 0, 1)), 150)[0] is None:
                continue
            fluid.append(p)
print(f'posterior fossa fluid: {len(fluid)} cubic millimetres sampled')

bm = bmesh.new()
half = STEP * 0.55
for p in fluid:
    bmesh.ops.create_cube(bm, size=STEP * 1.1, matrix=Matrix.Translation(p))
me = D.meshes.new('csf-tmp')
bm.to_mesh(me)
bm.free()
tmp = D.objects.new('csf-tmp', me)
out_col.objects.link(tmp)
rm = tmp.modifiers.new('remesh', 'REMESH')
rm.mode = 'VOXEL'
rm.voxel_size = 0.8
rm.use_smooth_shade = True
sm = tmp.modifiers.new('smooth', 'SMOOTH')
sm.iterations = 6
sm.factor = 0.6
dg = bpy.context.evaluated_depsgraph_get()
ev = tmp.evaluated_get(dg)
bm = bmesh.new()
bm.from_mesh(ev.to_mesh())
ev.to_mesh_clear()
D.objects.remove(tmp)
GROUPS['csf-cranial'] = dict(layer='csf', part='csf', color='#9CC3DA', opacity=0.75)
built.append(finish('csf-cranial', bm))

# ---------------------------------------------------------------- measurements (model mm)
bas = TO_MODEL @ basion
opi = TO_MODEL @ opisthion
tv = [v.co for v in D.objects['tonsil'].data.vertices]
low = min(tv, key=lambda v: v.z)
d = Vector((opi.x - bas.x, opi.z - bas.z)).normalized()
n = Vector((-d.y, d.x))
if n.y < 0:
    n = -n
above = (Vector((low.x - bas.x, low.z - bas.z))).dot(n)
print(f'McRae line (basion to opisthion): {(opi - bas).length:.1f} mm')
print(f'tonsil tip: {abs(above):.1f} mm {"above" if above > 0 else "below"} the McRae line')
bs_low = min((v.co for v in D.objects['brainstem'].data.vertices), key=lambda v: v.z)
print(f'brainstem lowest point: {abs(above_mcrae(bs_low)):.1f} mm {"above" if above_mcrae(bs_low) > 0 else "below"} the McRae line')

# ---------------------------------------------------------------- export only our objects
for o in D.objects:
    o.select_set(False)
for o in built:
    o.select_set(True)
bpy.context.view_layer.objects.active = built[0]
bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB', use_selection=True, export_extras=True,
                          export_materials='EXPORT', export_animations=False, export_skins=False, export_morph=False,
                          export_cameras=False, export_lights=False, export_yup=True, export_apply=False)
print('wrote', out_glb)
