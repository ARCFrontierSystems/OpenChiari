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
  model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend out.glb [typical|chiari]
"""
import sys, math, os
import bpy, bmesh
from mathutils import Vector, Matrix

blend, out_glb = sys.argv[1], sys.argv[2]
CONDITION = sys.argv[3] if len(sys.argv) > 3 else 'typical'
assert CONDITION in ('typical', 'chiari', 'syrinx', 'surgery'), CONDITION
LOW_TONSILS = CONDITION in ('chiari', 'syrinx', 'surgery')
print('condition:', CONDITION)
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

def smoothed(bm, levels=1):
    """Catmull-Clark subdivision: rounds off the atlas's low-detail surfaces."""
    me = D.meshes.new('smooth-tmp')
    bm.to_mesh(me)
    bm.free()
    tmp = D.objects.new('smooth-tmp', me)
    bpy.context.scene.collection.objects.link(tmp)
    mod = tmp.modifiers.new('subsurf', 'SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    dg = bpy.context.evaluated_depsgraph_get()
    ev = tmp.evaluated_get(dg)
    out = bmesh.new()
    out.from_mesh(ev.to_mesh())
    ev.to_mesh_clear()
    D.objects.remove(tmp)
    return out

def finish(name, bm):
    weld = 0.3 if name == 'skin' else 0.05
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld)  # weld matching edges of neighbouring pieces (mm)
    if name == 'skin':
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        print('skin: closed', close_small_openings(bm), 'small openings (eyes, mouth)')
        bm = smoothed(bm, levels=1)
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
    print(f'{name:18} {len(members.get(name, [])):4} atlas parts  {tris:8} triangles  open edges {oe}', flush=True)
    return ob

# The brainstem becomes the spinal cord at the foramen magnum (COPY.md, Foramen magnum card; the figures).
# The atlas lets its medulla run on into the spinal canal, so cut it along the McRae line: the part below is cord.
bas0 = TO_MODEL @ basion
opi0 = TO_MODEL @ opisthion
mcrae_dir = Vector((opi0.x - bas0.x, 0, opi0.z - bas0.z)).normalized()
mcrae_n = Vector((-mcrae_dir.z, 0, mcrae_dir.x))
if mcrae_n.z < 0:
    mcrae_n = -mcrae_n

def split_at_mcrae(bm):
    """Cuts a surface along the McRae line plane. Returns the part below as a new closed surface; keeps the part above."""
    below = bm.copy()
    for target, keep_above in ((bm, True), (below, False)):
        geom = target.verts[:] + target.edges[:] + target.faces[:]
        res = bmesh.ops.bisect_plane(target, geom=geom, plane_co=bas0, plane_no=mcrae_n,
                                     clear_inner=keep_above, clear_outer=not keep_above)
        edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
        if edges:
            bmesh.ops.holes_fill(target, edges=edges, sides=0)
    return below

built = []
cord_top_piece = None
for name, objs in members.items():
    if name == 'cord' or not objs:
        continue
    bm = bm_from(objs)
    cut_bottom(bm, fill=(name in ('dura', 'skin')))
    if name == 'brainstem':
        cord_top_piece = split_at_mcrae(bm)
    built.append(finish(name, bm))

# ---------------------------------------------------------------- spinal cord (not in the atlas)
# Starts where the brainstem is cut at the McRae line, with the medulla's own size and position there, and narrows
# smoothly over 12 mm (to about C1) to the measured adult cord size, following the middle of the spinal dura
# (EVIDENCE.md "Spinal cord, upper neck": 8.8 x 12.4 mm at C2, 8.7 x 14 mm at C4; PMC8334714). The atlas's own
# medulla below the line (a thick, boxy piece down to C1) is not used.
dura = D.objects['dura']
dv = [v.co for v in dura.data.vertices]
medulla = [TO_MODEL @ (o.matrix_world @ v.co) for o in members['brainstem'] if 'Medulla' in o.name for v in o.data.vertices]
top_z = (bas0.z + opi0.z) / 2 + 1.0  # 1 mm above the McRae line's middle, overlapping the cut brainstem
ring_top = [v for v in medulla if abs(v.z - top_z) < 1.5]
rx = (max(v.x for v in ring_top) - min(v.x for v in ring_top)) / 2  # front-back half size
ry = (max(v.y for v in ring_top) - min(v.y for v in ring_top)) / 2  # side-to-side half size
# The atlas's medulla at this height includes the bulges on its front; cap the cord's starting size at about
# 11.6 by 14 mm (the medulla where it meets the cord), so it narrows evenly to the cord's size.
rx, ry = min(rx, 5.8), min(ry, 7.0)
mx = (max(v.x for v in ring_top) + min(v.x for v in ring_top)) / 2
my = (max(v.y for v in ring_top) + min(v.y for v in ring_top)) / 2
TAPER = 12.0
steps = 40
ring_n = 24
bm = bmesh.new()
rings = []
cord_axis = []  # (height, centre front-back, centre side to side, half sizes): used for the syrinx
# Centre line: the middle of the dura's outline at each height (not the average of its points, which are unevenly
# spread), then smoothed so the cord runs evenly down the canal.
centres = []
cx, cy = mx, my  # until the dura is reached
for k in range(steps + 1):
    z = top_z + (BOTTOM_MM - top_z) * k / steps
    slab = [v for v in dv if abs(v.z - z) < 3.0]
    if slab:
        cx = (min(v.x for v in slab) + max(v.x for v in slab)) / 2
        cy = (min(v.y for v in slab) + max(v.y for v in slab)) / 2
    centres.append([cx, cy])
for _ in range(6):
    centres = [centres[0]] + [[(a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4] for a, b, c in zip(centres, centres[1:], centres[2:])] + [centres[-1]]
for k in range(steps + 1):
    z = top_z + (BOTTOM_MM - top_z) * k / steps
    below = top_z - z
    t = min(1.0, below / TAPER)
    t = t * t * (3 - 2 * t)  # smooth start and finish
    cx = (1 - t) * mx + t * (centres[k][0] + 0.8)  # 0.8 mm behind the dura's middle: the vertebral bodies sit close in front
    cy = (1 - t) * my + t * centres[k][1]
    deep = min(1.0, max(0.0, (below - TAPER) / max(1.0, top_z - BOTTOM_MM - TAPER)))
    ax = (1 - t) * rx + t * (4.4 + (4.35 - 4.4) * deep)   # half of 8.8 mm, toward 8.7 mm
    ay = (1 - t) * ry + t * (6.2 + (7.0 - 6.2) * deep)    # half of 12.4 mm, toward 14 mm
    cord_axis.append((z, cx, cy, ax, ay))
    ring = [bm.verts.new((cx + ax * math.cos(2 * math.pi * j / ring_n),
                          cy + ay * math.sin(2 * math.pi * j / ring_n), z)) for j in range(ring_n)]
    rings.append(ring)
for r0, r1 in zip(rings, rings[1:]):
    for j in range(ring_n):
        bm.faces.new((r0[j], r0[(j + 1) % ring_n], r1[(j + 1) % ring_n], r1[j]))
bm.faces.new(list(reversed(rings[0])))
bm.faces.new(rings[-1])
if cord_top_piece is not None:
    cord_top_piece.free()
members['cord'] = []
print(f'cord built: {2 * rx:.1f} x {2 * ry:.1f} mm at the McRae line, 8.8 x 12.4 mm from {TAPER:.0f} mm below it')
built.append(finish('cord', bm))

# ---------------------------------------------------------------- tonsil position
# Typical (EVIDENCE.md): tip about 1 mm above the McRae line, rounded (the atlas has about 2.7 mm; the Simple
# model uses 1 mm). Chiari I: about 12 mm below the line (the average in a study of 160 people; the Simple model
# uses the same), pointed or peg-shaped. The top of each tonsil, where it joins the cerebellum, stays in place;
# the lower part is stretched down, and for Chiari I narrowed toward the tip.
# After decompression: the tonsils often rise only partly, about 2 mm on average (EVIDENCE.md, PMC10549945).
TONSIL_TIP_ABOVE = {'typical': 1.0, 'chiari': -12.4, 'syrinx': -12.4, 'surgery': -10.4}[CONDITION]  # mm
bas_m = TO_MODEL @ basion
opi_m = TO_MODEL @ opisthion
def above_mcrae(p):
    # model x (back) and z (up); positive = above the line
    d = Vector((opi_m.x - bas_m.x, opi_m.z - bas_m.z)).normalized()
    n = Vector((-d.y, d.x))
    if n.y < 0:
        n = -n
    return Vector((p.x - bas_m.x, p.z - bas_m.z)).dot(n)
ton = D.objects['tonsil'].data
tz = [v.co.z for v in ton.vertices]
z_top, z_low = max(tz), min(tz)
drop = above_mcrae(min((v.co for v in ton.vertices), key=above_mcrae)) - TONSIL_TIP_ABOVE
# Each tonsil's own centre line (left and right are separate, on either side of the midline).
def centre(side):
    vs = [v.co for v in ton.vertices if (v.co.y > 0) == side]
    return Vector((sum(v.x for v in vs) / len(vs), sum(v.y for v in vs) / len(vs), 0))
centres = {True: centre(True), False: centre(False)}
for v in ton.vertices:
    w = min(1.0, max(0.0, (z_top - v.co.z) / (z_top - z_low)))
    if LOW_TONSILS:
        # Narrow toward the tip (peg shape, with a blunt end): up to 38% narrower front to back and side to side.
        c = centres[v.co.y > 0]
        k = 1 - 0.38 * w ** 2.5
        v.co.x = c.x + (v.co.x - c.x) * k
        v.co.y = c.y + (v.co.y - c.y) * k
    # Slightly narrower side to side toward the tip, so the Chiari I tonsils pass through the opening (about 30 mm).
    v.co.y *= 1 - 0.35 * w ** 1.5
    v.co.z -= drop * w ** 1.5
# Lower ends slid toward the midline in every view until the two tonsils overlap there (joined below), so the
# midline cut shows the tonsils at their lowest point, as the site says and as MRI measures them (EVIDENCE.md
# "Midline simplification"). Sliding, not squashing, keeps each tonsil's own shape.
def tonsil_w(v):
    return min(1.0, max(0.0, (z_top - v.co.z) / (z_top - z_low)))
# Each tonsil is slid so its own lowest point lands on the midline (the inner parts overlap and are joined below).
gap = {side: abs(min((v.co for v in ton.vertices if (v.co.y > 0) == side), key=above_mcrae).y) for side in (True, False)}
for v in ton.vertices:
    side = v.co.y > 0
    v.co.y -= (1 if side else -1) * gap[side] * tonsil_w(v) ** 1.5
print(f'tonsils slid toward the midline at the tip: {gap[True]:.1f} mm and {gap[False]:.1f} mm')
ton.update()
print(f'tonsils ({CONDITION}): lowest point moved down {drop:.1f} mm, to {TONSIL_TIP_ABOVE:+.1f} mm from the McRae line')

# ---------------------------------------------------------------- fluid space around the brain in the posterior fossa
# The atlas has no fluid spaces around the brain. Compute them on a 1 mm grid: inside the skull (bone behind and to
# both sides, something above), above the McRae line, and outside the brain. The brain is first treated as one solid
# mass (gaps between the atlas's separate cerebellum and brainstem pieces, up to about 8 mm, are filled), so the
# fluid is the space between the brain and the skull, not the gaps inside the brain. Only the largest connected
# space is kept. Because it is computed, lowering the tonsils (Chiari I) shrinks this space automatically.
from mathutils.bvhtree import BVHTree
import numpy as np

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

import time
t_fluid = time.time()
bone_tree = bvh_of(['occipital', 'skull', 'c1', 'c2', 'c3-c5', 'discs'])
tent_tree = bvh_of(['tentorium'])
# The tonsils must not pass into bone (the opening and C1) or into the spinal cord.
cord_tree = bvh_of(['cord'])
stem_tree = bvh_of(['brainstem'])

above_tree = bvh_of(['cerebrum', 'diencephalon', 'callosum'])

def inside(tree, p):
    loc, nrm, _, dist = tree.find_nearest(p)
    return loc is not None and (p - loc).dot(nrm) < 0, (dist if loc is not None else 1e9)
if True:
    # Near their tips the two tonsils now meet at the midline: join them into one closed surface (voxel remesh,
    # 0.5 mm), so "inside the tonsils" is well defined for the fluid and the checks.
    tob = D.objects['tonsil']
    rm = tob.modifiers.new('join', 'REMESH')
    rm.mode = 'VOXEL'; rm.voxel_size = 0.5; rm.use_smooth_shade = True
    dg = bpy.context.evaluated_depsgraph_get()
    me_j = bpy.data.meshes.new_from_object(tob.evaluated_get(dg))
    tob.modifiers.remove(rm)
    old_me = tob.data
    tob.data = me_j
    D.meshes.remove(old_me)
    # Where the tonsils would pass into bone, the cord or the brainstem, push them back out (0.6 mm clear), then
    # smooth lightly; repeated a few times. This leaves them squeezed where the space is tight, as in Chiari I.
    tm = D.objects['tonsil'].data
    def tonsil_tip_above():
        return min(above_mcrae(v.co) for v in tm.vertices)
    for it in range(6):
        if it == 3:
            # Pushing can move the tip a little; set it back to the intended height (lower part only).
            tz2 = [v.co.z for v in tm.vertices]
            zt, zl = max(tz2), min(tz2)
            fix = tonsil_tip_above() - TONSIL_TIP_ABOVE
            for v in tm.vertices:
                w = min(1.0, max(0.0, (zt - v.co.z) / (zt - zl)))
                v.co.z -= fix * w ** 1.5
            print(f'  tonsil tip set back by {fix:+.1f} mm', flush=True)
        moved = 0
        for v in tm.vertices:
            for tree in (bone_tree, cord_tree, stem_tree):
                loc, nrm, _, dist = tree.find_nearest(v.co)
                if loc is None:
                    continue
                if (v.co - loc).dot(nrm) < 0 or dist < 0.6:
                    v.co = loc + nrm.normalized() * 0.6
                    moved += 1
        bm_t = bmesh.new(); bm_t.from_mesh(tm)
        bmesh.ops.smooth_vert(bm_t, verts=bm_t.verts, factor=0.3, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm_t.to_mesh(tm); bm_t.free()
        print(f'  tonsils pushed out of bone, cord and brainstem: {moved} points (pass {it + 1})', flush=True)
    # A last step with no smoothing after it: any tonsil point still inside the brainstem or cord (counted by rays,
    # which does not depend on the atlas's surface directions) moves straight back until it is 0.6 mm clear. The
    # tonsils sit behind the brainstem, so back is the right way out.
    def hits(tree, o, d):
        n, o = 0, o.copy()
        for _ in range(50):
            loc, _, _, _ = tree.ray_cast(o, d, 200.0)
            if loc is None:
                return n
            n += 1
            o = loc + d * 1e-3
        return n
    dirs = [Vector((1, 0, 0)), Vector((-1, 0, 0)), Vector((0, 1, 0)), Vector((0, -1, 0)), Vector((0.6, 0.48, 0.64))]
    def inside_by_rays(tree, p):
        return sum(hits(tree, p, d) % 2 for d in dirs) >= 3
    moved_back = 0
    for v in tm.vertices:
        if above_mcrae(v.co) > 15:
            continue
        for tree in (cord_tree, stem_tree):
            if inside_by_rays(tree, v.co):
                for _ in range(80):
                    v.co.x += 0.25
                    if not inside_by_rays(tree, v.co):
                        break
                v.co.x += 0.6
                moved_back += 1
    tm.update()
    print(f'  tonsil points moved back out of the brainstem or cord: {moved_back}', flush=True)
    print(f'  tonsil tip after pushing: {tonsil_tip_above():+.1f} mm from the McRae line', flush=True)
# The atlas's cerebellum reaches up to about 4 mm into the occipital bone off the midline: push it back out.
cm = D.objects['cerebellum'].data
moved = 0
for v in cm.vertices:
    loc, nrm, _, dist = bone_tree.find_nearest(v.co)
    if loc is not None and (v.co - loc).dot(nrm) < 0:
        v.co = loc + nrm.normalized() * 1.2
        moved += 1
cm.update()
print(f'cerebellum: {moved} points pushed out of bone', flush=True)
brain_tree = bvh_of(['cerebellum', 'tonsil', 'brainstem', 'ventricle-fourth', 'cord'])
tv_all = [v.co.copy() for v in D.objects['tonsil'].data.vertices]
print(f'tonsil points inside bone: {sum(1 for v in tv_all if inside(bone_tree, v)[0])}, inside the cord: {sum(1 for v in tv_all if inside(cord_tree, v)[0])} (of {len(tv_all)})', flush=True)

# ---- After decompression: the dural patch's midline curve (model x back, z up; mm). It runs from the top of the
# bone window down past the opening to behind the cord at C1, a few mm outside where the bone was, so the
# re-formed fluid space reaches into the opening (EVIDENCE.md: "The dura expanded posteriorly into the craniectomy").
O2 = (opi_m.x, opi_m.z)
WIN_DIR = (0.902, 0.432)       # up the back of the skull from the opisthion (as the Simple model's red line)
WIN_LEN, WIN_HALF = 25.0, 15.0  # mm: window about 25 mm up the skull and 30 mm across (EVIDENCE.md)
CUT_LEN, CUT_HALF = 20.0, 11.5  # mm: face centres within this; the atlas's faces are coarse, so whole faces reach the full size
PATCH = [(O2[0] + WIN_LEN * WIN_DIR[0] - 1, O2[1] + WIN_LEN * WIN_DIR[1] + 1), (O2[0] + 12, O2[1] + 4.5),
         (O2[0] + 5.5, O2[1] - 1.5), (O2[0] - 1, O2[1] - 9), (O2[0] - 7, O2[1] - 16.5)]
def patch_x(z):
    # x of the patch at height z (it runs top to bottom), or None outside its range
    for (xa, za), (xb, zb) in zip(PATCH, PATCH[1:]):
        if zb <= z <= za:
            return xa + (xb - xa) * (z - za) / (zb - za)
    return None
PATCH_N = 24
PATCH_CURVE = 0.015  # the patch bulges back in the middle; its edges meet the dura at the bone's cut edges
def patch_half(z):
    # the patch's half-width at height z: a rounded rectangle, a little wider than the bone window (30 mm across)
    # so it covers the whole opening, narrowing only near its top and bottom ends
    u = (PATCH[0][1] - z) / (PATCH[0][1] - PATCH[-1][1])
    u = (u * PATCH_N + 0.5) / (PATCH_N + 1)  # the patch's rows sit between its ends
    return 17 * max(0.35, (1 - abs(2 * u - 1) ** 6) ** (1 / 6))
def in_reformed(p):
    # below or near the opening, behind the brain, in front of the (curved, oval) patch
    px = patch_x(p.z)
    return px is not None and abs(p.y) < patch_half(p.z) - 1.0 and p.x < px - PATCH_CURVE * p.y * p.y - 1.0 and p.x > -2

STEP = 1.0
XS, YS, ZS = range(-34, 80), range(-62, 63), range(-24, 62)
NX, NY, NZ = len(XS), len(YS), len(ZS)
brain = np.zeros((NX, NY, NZ), bool)
near_brain = np.zeros((NX, NY, NZ), bool)
space = np.zeros((NX, NY, NZ), bool)   # inside the skull, above the line, not bone
for i, ix in enumerate(XS):
    if i % 20 == 0:
        print(f'  fluid scan {i}/{NX}, {time.time() - t_fluid:.0f} s', flush=True)
    for j, iy in enumerate(YS):
        for k, iz in enumerate(ZS):
            p = Vector((ix * STEP, iy * STEP, iz * STEP))
            reformed = CONDITION == 'surgery' and in_reformed(p)
            if above_mcrae(p) < -1.0 and not reformed:
                continue
            b_in, b_d = inside(brain_tree, p)
            brain[i, j, k] = b_in or b_d < 0.6
            near_brain[i, j, k] = b_in or b_d < 1.0  # fluid stays clear of brain and cord (its surface grows 0.8 mm)
            if CONDITION == 'surgery':
                # nothing behind the dural patch (its curved, oval surface), above or below the opening
                pxp = patch_x(p.z)
                if pxp is not None and abs(p.y) < patch_half(p.z) + 3 and p.x > pxp - PATCH_CURVE * p.y * p.y - 0.8:
                    continue
            if reformed:
                o_in, o_d = inside(bone_tree, p)
                if not (o_in or o_d < 1.4):
                    space[i, j, k] = True
                continue
            o_in, o_d = inside(bone_tree, p)
            if o_in or o_d < 1.4:   # clear of the bone's inner surface (the fluid surface grows about 1.2 mm)
                continue
            if bone_tree.ray_cast(p, Vector((1, 0, 0)), 150)[0] is None:
                continue
            if bone_tree.ray_cast(p, Vector((0, 1, 0)), 150)[0] is None or bone_tree.ray_cast(p, Vector((0, -1, 0)), 150)[0] is None:
                continue
            # Below the tentorium: going up, the tentorium comes before the cerebrum. In front of the brainstem
            # (no tentorium above), the fluid in front of the pons counts up to the level of the dorsum sellae.
            up = Vector((0, 0, 1))
            ht, hc = tent_tree.ray_cast(p, up, 150), above_tree.ray_cast(p, up, 150)
            dt = ht[3] if ht[0] is not None else 1e9
            dc = hc[3] if hc[0] is not None else 1e9
            if not (dt < dc or (ix < 0 and iz < 40 and dc < 1e9)):
                continue
            space[i, j, k] = True

def grow(a, n):
    for it in range(n):
        b = a.copy()
        b[1:] |= a[:-1]; b[:-1] |= a[1:]; b[:, 1:] |= a[:, :-1]; b[:, :-1] |= a[:, 1:]; b[:, :, 1:] |= a[:, :, :-1]; b[:, :, :-1] |= a[:, :, 1:]
        if it % 2:  # alternate with the 12 edge neighbours for a rounder shape
            b[1:, 1:] |= a[:-1, :-1]; b[:-1, :-1] |= a[1:, 1:]; b[1:, :-1] |= a[:-1, 1:]; b[:-1, 1:] |= a[1:, :-1]
            b[:, 1:, 1:] |= a[:, :-1, :-1]; b[:, :-1, :-1] |= a[:, 1:, 1:]; b[:, 1:, :-1] |= a[:, :-1, 1:]; b[:, :-1, 1:] |= a[:, 1:, :-1]
            b[1:, :, 1:] |= a[:-1, :, :-1]; b[:-1, :, :-1] |= a[1:, :, 1:]; b[1:, :, :-1] |= a[:-1, :, 1:]; b[:-1, :, 1:] |= a[1:, :, :-1]
        a = b
    return a
CLOSE = 4  # mm
solid = ~grow(~grow(brain, CLOSE), CLOSE)
# Gaps between brain parts are filled (treated as brain) only above the opening, where they are the small gaps
# between the atlas's cerebellum pieces; at and below the opening (tonsils, cord) they stay fluid, not empty.
for i, ix in enumerate(XS):
    for k, iz in enumerate(ZS):
        if above_mcrae(Vector((ix, 0, iz))) < 2:
            solid[i, :, k] = brain[i, :, k]
fluid_grid = space & ~solid & ~near_brain
# keep the largest connected space (6-neighbour flood fill)
labels = np.zeros(fluid_grid.shape, np.int32)
sizes = []
for seed in zip(*np.nonzero(fluid_grid)):
    if labels[seed]:
        continue
    lab = len(sizes) + 1
    stack, n = [seed], 0
    labels[seed] = lab
    while stack:
        a, b, c = stack.pop(); n += 1
        for da, db, dc in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)):
            q = (a + da, b + db, c + dc)
            if 0 <= q[0] < NX and 0 <= q[1] < NY and 0 <= q[2] < NZ and fluid_grid[q] and not labels[q]:
                labels[q] = lab; stack.append(q)
    sizes.append(n)
keep = 1 + int(np.argmax(sizes))
fluid = [Vector((XS[i] * STEP, YS[j] * STEP, ZS[k] * STEP)) for i, j, k in zip(*np.nonzero(labels == keep))]
print(f'posterior fossa fluid: {len(fluid)} points ({len(fluid) * STEP ** 3 / 1000:.1f} ml) kept of {sum(sizes)} in {len(sizes)} pieces, {time.time() - t_fluid:.0f} s', flush=True)
POINT_RADIUS = 0.8  # mm: points on a 1 mm grid merge into one surface

# Fluid points -> a smooth closed surface: geometry nodes turn points into a volume and the volume into a mesh.
me = D.meshes.new('csf-points')
me.from_pydata([tuple(p) for p in fluid], [], [])
tmp = D.objects.new('csf-points', me)
bpy.context.scene.collection.objects.link(tmp)
ng = D.node_groups.new('points-to-surface', 'GeometryNodeTree')
ng.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
gi = ng.nodes.new('NodeGroupInput')
go = ng.nodes.new('NodeGroupOutput')
m2p = ng.nodes.new('GeometryNodeMeshToPoints')
m2p.inputs['Radius'].default_value = POINT_RADIUS
p2v = ng.nodes.new('GeometryNodePointsToVolume')
p2v.inputs['Resolution Mode'].default_value = 'Size'
p2v.inputs['Voxel Size'].default_value = 0.6
p2v.inputs['Radius'].default_value = POINT_RADIUS
v2m = ng.nodes.new('GeometryNodeVolumeToMesh')
v2m.inputs['Resolution Mode'].default_value = 'Size'
v2m.inputs['Voxel Size'].default_value = 0.6
ng.links.new(gi.outputs[0], m2p.inputs['Mesh'])
ng.links.new(m2p.outputs['Points'], p2v.inputs['Points'])
ng.links.new(p2v.outputs['Volume'], v2m.inputs['Volume'])
ng.links.new(v2m.outputs['Mesh'], go.inputs[0])
gn = tmp.modifiers.new('surface', 'NODES')
gn.node_group = ng
sm = tmp.modifiers.new('smooth', 'SMOOTH')
sm.iterations = 10
sm.factor = 0.5
dg = bpy.context.evaluated_depsgraph_get()
ev = tmp.evaluated_get(dg)
bm = bmesh.new()
bm.from_mesh(ev.to_mesh())
ev.to_mesh_clear()
D.objects.remove(tmp)
# Drop tiny separate bits the surface step can leave at narrow places (under about 100 points).
seen = set()
for v0 in list(bm.verts):
    if v0 in seen:
        continue
    comp, stack = [], [v0]
    seen.add(v0)
    while stack:
        v = stack.pop(); comp.append(v)
        for e in v.link_edges:
            w = e.other_vert(v)
            if w not in seen:
                seen.add(w); stack.append(w)
    if len(comp) < 100:
        bmesh.ops.delete(bm, geom=comp, context='VERTS')
GROUPS['csf-cranial'] = dict(layer='csf', part='csf', color='#9CC3DA', opacity=0.75)
built.append(finish('csf-cranial', bm))

# ---------------------------------------------------------------- the fluid around the spinal cord
# A solid tube around the cord, from just above the opening to the bottom of the view (the cord sits inside it; in
# the cut view the cord shows in its own color, with the fluid around it). The atlas's spinal dura is a thin, uneven
# shell, so it is not used. At each height the tube's outline is an oval about 14 mm front to back (EVIDENCE.md:
# canal 13 to 15 mm; PMC2899662 fluid column 13.73 mm) and 19 mm across, a little behind the cord's centre (about 2 mm
# of fluid in front, 3 mm behind), never closer than 0.4 mm to bone (rays cast out to the vertebrae).
# Chiari I: from 2 to 14 mm below the line, where the tonsils plug the space behind the cord, the tube's back is
# pulled in to the cord (EVIDENCE.md: in many people flow slows or is blocked there); the front stays open.
GROUPS['csf-spinal'] = dict(layer='csf', part='csf', color='#9CC3DA', opacity=0.75)
tb = bmesh.new()
axis_s = sorted(cord_axis)
fm_mid_z = (bas_m.z + opi_m.z) / 2
z_top = fm_mid_z + 2.0
# rings every 0.75 mm in the top 20 mm (where the tonsils sit beside it), then every 1.5 mm
heights = [z_top - k * 0.75 for k in range(27)]
heights += [heights[-1] - k * 1.5 for k in range(1, int((heights[-1] - BOTTOM_MM) / 1.5) + 1)] + [BOTTOM_MM]
N_ANG = 32
rings_t = []
# The tube stops 0.5 mm in front of the tonsils wherever they reach down behind the cord (every view), so the
# tonsils are never inside it (a fluid surface around them would be drawn over them in the cut view).
tonsil_tree = bvh_of(['tonsil'])
def cord_at(z):
    if z >= axis_s[-1][0]:
        return axis_s[-1][1:]
    for lo, hi in zip(axis_s, axis_s[1:]):
        if lo[0] <= z <= hi[0]:
            t = (z - lo[0]) / (hi[0] - lo[0])
            return tuple(lo[i] + (hi[i] - lo[i]) * t for i in range(1, 5))
    return axis_s[0][1:]
for z in heights:
    cx, cy, ax, ay = cord_at(z)
    depth = fm_mid_z - z
    roomy = 1 - min(1.0, max(0.0, (depth - 4) / 22))     # roomier just below the opening
    blocked = CONDITION in ('chiari', 'syrinx') and 2 <= depth <= 14
    ring = []
    for j in range(N_ANG):
        th = 2 * math.pi * j / N_ANG
        d = Vector((math.cos(th), math.sin(th), 0))
        # wanted outline: front of the cord + 2 mm, back + 3 mm (+2 more each just below the opening), sides 9.5 mm
        front, back, side = ax + 2.0 + 2 * roomy, ax + 3.0 + 2 * roomy, 9.5
        if blocked and d.x > 0.3:
            back = ax + 0.4
        rx_ = back if d.x > 0 else front
        r = 1 / math.sqrt((d.x / rx_) ** 2 + (d.y / side) ** 2)
        hit = bone_tree.ray_cast(Vector((cx, cy, z)), d, r + 2)
        if hit[0] is not None:
            r = min(r, max(0.5, hit[3] - 0.4))
        hit_t = tonsil_tree.ray_cast(Vector((cx, cy, z)), d, r + 1)
        if hit_t[0] is not None:
            r = min(r, hit_t[3] - 0.5)
        # never inside the cord itself
        rc = 1 / math.sqrt((d.x / ax) ** 2 + (d.y / ay) ** 2)
        r = max(r, rc + 0.3)
        # and at least 0.8 mm from the tonsils, so they cannot poke in between the tube's points
        while r > rc + 0.3:
            q = Vector((cx + d.x * r, cy + d.y * r, z))
            loc, nrm, _, dist = tonsil_tree.find_nearest(q)
            if loc is None or (dist >= 0.8 and (q - loc).dot(nrm) > 0):
                break
            r -= 0.2
        ring.append(tb.verts.new((cx + d.x * r, cy + d.y * r, z)))
    rings_t.append(ring)
for r0, r1 in zip(rings_t, rings_t[1:]):
    for j in range(N_ANG):
        tb.faces.new((r0[j], r1[j], r1[(j + 1) % N_ANG], r0[(j + 1) % N_ANG]))
tb.faces.new(rings_t[0])
tb.faces.new(rings_t[-1][::-1])
bmesh.ops.recalc_face_normals(tb, faces=tb.faces)
built.append(finish('csf-spinal', tb))
print(f'fluid surface done, {time.time() - t_fluid:.0f} s', flush=True)

# ---------------------------------------------------------------- syrinx (Chiari I with a syrinx)
# EVIDENCE.md: a fluid-filled cavity near the centre of the cord, most often in the neck part, long and spindle-shaped
# or beaded. As in the Simple model: from about C3 (49 mm below the McRae line) to the bottom of the view, about
# 4 mm across in the 9 mm cord, with beads every 10 mm and a tapered top.
if CONDITION == 'syrinx':
    GROUPS['syrinx'] = dict(layer='brain', part='syrinx', color='#7FB3D3')
    top_z = bas_m.z - 49.0
    sb = bmesh.new()
    rings_s = []
    ring_n = 20
    axis = sorted(cord_axis)  # by height, bottom first
    def at_height(z):
        for (za, xa, ya, axa, aya), (zb, xb, yb, axb, ayb) in zip(axis, axis[1:]):
            if za <= z <= zb:
                t = (z - za) / (zb - za)
                return xa + (xb - xa) * t, ya + (yb - ya) * t, axa + (axb - axa) * t, aya + (ayb - aya) * t
        return None
    z = top_z
    while z > BOTTOM_MM - 0.5:
        c = at_height(max(z, BOTTOM_MM + 0.01))
        below = top_z - z
        bead = 1 + 0.18 * math.sin(2 * math.pi * below / 10.0)
        taper = min(1.0, below / 6.0) ** 0.6
        rx = 0.45 * c[2] * bead * taper + 0.05   # front to back: about 45% of the cord
        ry = 0.42 * c[3] * bead * taper + 0.05   # side to side
        rings_s.append([sb.verts.new((c[0] + rx * math.cos(2 * math.pi * j / ring_n), c[1] + ry * math.sin(2 * math.pi * j / ring_n), max(z, BOTTOM_MM))) for j in range(ring_n)])
        z -= 1.0
    for r0, r1 in zip(rings_s, rings_s[1:]):
        for j in range(ring_n):
            sb.faces.new((r0[j], r1[j], r1[(j + 1) % ring_n], r0[(j + 1) % ring_n]))
    sb.faces.new(rings_s[0][::-1])
    sb.faces.new(rings_s[-1])
    built.append(finish('syrinx', sb))

# ---------------------------------------------------------------- after decompression: bone removed, dural patch
if CONDITION == 'surgery':
    GROUPS['bone-removed'] = dict(layer='bone', part='removed', color='#9A3412', opacity=0.45)
    GROUPS['dural-patch'] = dict(layer='csf', part=None, color='#7D6F58', opacity=0.55)
    removed = bmesh.new()
    def cut(name, test, planes):
        # Split the surface exactly along the window's edges (planes: point, normal), then move the faces whose
        # centre passes `test` into the removed-bone outline.
        me = D.objects[name].data
        bm = bmesh.new(); bm.from_mesh(me)
        for co, no in planes:
            geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
            bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        gone = [f for f in bm.faces if test(f.calc_center_median())]
        tmp = D.meshes.new('tmp')
        part = bmesh.new()
        vmap = {}
        for f in gone:
            vs = []
            for v in f.verts:
                if v not in vmap:
                    vmap[v] = part.verts.new(v.co)
                vs.append(vmap[v])
            part.faces.new(vs)
        part.to_mesh(tmp); part.free(); removed.from_mesh(tmp); D.meshes.remove(tmp)
        bmesh.ops.delete(bm, geom=gone, context='FACES')
        bm.to_mesh(me); bm.free(); me.update()
        print(f'{name}: {len(gone)} faces removed', flush=True)
    def skull_window(c):
        rx, rz = c.x - O2[0], c.z - O2[1]
        t = rx * WIN_DIR[0] + rz * WIN_DIR[1]
        s_ = -rx * WIN_DIR[1] + rz * WIN_DIR[0]
        return abs(c.y) < WIN_HALF and -2 <= t <= WIN_LEN and abs(s_) < 9
    top = Vector((O2[0] + WIN_LEN * WIN_DIR[0], 0, O2[1] + WIN_LEN * WIN_DIR[1]))
    win_planes = [(Vector((0, WIN_HALF, 0)), Vector((0, 1, 0))), (Vector((0, -WIN_HALF, 0)), Vector((0, 1, 0))),
                  (top, Vector((WIN_DIR[0], 0, WIN_DIR[1])))]
    cut('occipital', skull_window, win_planes)
    cut('skull', skull_window, win_planes)
    # C1: the middle of its back arch, about 25 mm across (EVIDENCE.md), behind the cord.
    cut('c1', lambda c: abs(c.y) < 12.5 and c.x > 3, [(Vector((0, 12.5, 0)), Vector((0, 1, 0))), (Vector((0, -12.5, 0)), Vector((0, 1, 0)))])
    built.append(finish('bone-removed', removed))
    # Dural patch: a thin curved sheet along PATCH, 32 mm across, its side edges tucked in a little.
    pb = bmesh.new()
    N, M, T = 24, 13, 0.4
    pts = []
    for a in range(N + 1):
        z = PATCH[0][1] + (PATCH[-1][1] - PATCH[0][1]) * a / N
        pts.append((patch_x(z), z))
    grid = {}
    for side, off in ((0, -T), (1, T)):
        for a, (px, pz) in enumerate(pts):
            # Rounded ends: narrower at the top and bottom, like a sewn-in oval patch.
            half = patch_half(pz)
            for b in range(M + 1):
                y = -half + 2 * half * b / M
                # Curved like a membrane: the middle bulges back, the edges curve in toward the bone's cut edges.
                grid[side, a, b] = pb.verts.new((px - PATCH_CURVE * y * y + off, y, pz))
    for side in (0, 1):
        for a in range(N):
            for b in range(M):
                q = [grid[side, a, b], grid[side, a + 1, b], grid[side, a + 1, b + 1], grid[side, a, b + 1]]
                pb.faces.new(q if side else q[::-1])
    for a in range(N):
        for b in (0, M):
            pb.faces.new([grid[0, a, b], grid[0, a + 1, b], grid[1, a + 1, b], grid[1, a, b]])
    for b in range(M):
        for a in (0, N):
            pb.faces.new([grid[0, a, b], grid[0, a, b + 1], grid[1, a, b + 1], grid[1, a, b]])
    built.append(finish('dural-patch', pb))

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

# The atlas's spinal dura was used only to place the cord; the fluid column above replaces it.
built = [o for o in built if o.name != 'dura']

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
