"""Lists every object in the Z-Anatomy atlas (name, type, point count, collections, size) as JSON.
The atlas file is opened with its embedded scripts turned off.

Run: model/realistic/.venv/bin/python -I model/realistic/inventory.py model/source/Z-Anatomy/Startup.blend inventory.json
"""
import sys, json, re
import bpy
blend = sys.argv[1]
bpy.ops.wm.open_mainfile(filepath=blend, load_ui=False, use_scripts=False)
objs = []
for o in bpy.data.objects:
    n = o.data and getattr(o.data, 'vertices', None)
    objs.append({
        'name': o.name, 'type': o.type,
        'verts': len(o.data.vertices) if o.type == 'MESH' else 0,
        'cols': [c.name for c in o.users_collection],
        'parent': o.parent.name if o.parent else None,
        'dims': [round(d, 4) for d in o.dimensions],
    })
json.dump(objs, open(sys.argv[2], 'w'))
print('objects', len(objs), 'meshes', sum(1 for o in objs if o['type'] == 'MESH'), 'total verts', sum(o['verts'] for o in objs))
print('scene unit scale', bpy.context.scene.unit_settings.scale_length, bpy.context.scene.unit_settings.system)
print('top collections', [c.name for c in bpy.context.scene.collection.children])
