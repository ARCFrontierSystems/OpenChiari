# Builds the "Editable source" download: the realistic model's four views at web detail, in one Blender file, one
# collection per view (a structure shared by several views is linked into each of them). Model axes as in the glTF
# file after Blender's usual import (Z up), in millimetres.
# Run: model/realistic/.venv/bin/python -I model/realistic/make_blend.py <unpacked .glb> <out .blend>
import sys
import bpy

src, out = sys.argv[1], sys.argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
VIEWS = [('typical', 'Typical'), ('chiari', 'Chiari I'), ('syrinx', 'Chiari I with syrinx'), ('surgery', 'After decompression')]
scene = bpy.context.scene
cols = {}
for key, name in VIEWS:
    col = bpy.data.collections.new(name)
    scene.collection.children.link(col)
    cols[key] = col
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
for o in meshes:
    conds = o.get('conditions') or (o.parent.get('conditions') if o.parent else None) or [k for k, _ in VIEWS]
    for c in list(conds):
        if c in cols:
            cols[c].objects.link(o)
    for c in list(o.users_collection):
        if c not in cols.values():
            c.objects.unlink(o)
# Only the first view is shown when the file opens.
for key, col in cols.items():
    lc = bpy.context.view_layer.layer_collection.children[col.name]
    lc.hide_viewport = key != 'typical'
note = bpy.data.texts.new('README')
note.write(open(sys.argv[3]).read() if len(sys.argv) > 3 else '')
bpy.ops.wm.save_as_mainfile(filepath=out, compress=True)
print('saved', out, len(meshes), 'objects')
