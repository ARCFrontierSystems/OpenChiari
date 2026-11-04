# Real-head reference for the Simple model

Since 2026-11-04 the Simple figure and 3D model take the head, skull, skull base and brain above the
foramen magnum from the Z-Anatomy atlas (CC BY-SA 4.0), so their proportions are real. Everything
measured for Chiari stays as set out in `docs/EVIDENCE.md`: the McRae line, tonsils, cord, canal,
fluid in the neck and vertebrae.

| File | What it does |
| --- | --- |
| `slice.mjs` | Cuts the realistic model's raw export along the midline (or a few mm to the side) and writes each structure's outline |
| `outlines.py` | Turns those cross-sections into clean outlines (head, corpus callosum, ventricles, thalamus, fourth ventricle, skull vault) |
| `apply_real.py` | Writes the outlines into `src/lib/anatomy-shapes.json` (skull, skull base, clivus, brain, tentorium, palate) |
| `extract-skin.mjs` | Saves the real head surface as `head-skin.glb`, which `model/simple/build.mjs` uses for the 3D skin |
| `head-skin.glb` | The head surface, simplified (about 28,000 triangles). Derived from Z-Anatomy, CC BY-SA 4.0 |

To redo it, run the realistic extraction (`model/realistic/README.md`) to get `typical-raw.glb`, then:

```bash
node model/simple/reference/slice.mjs typical-raw.glb z0.json 0
node model/simple/reference/slice.mjs typical-raw.glb z3.json 3
python3 model/simple/reference/outlines.py z0.json z3.json outlines.json
python3 model/simple/reference/apply_real.py outlines.json
node model/simple/reference/extract-skin.mjs typical-raw.glb
npm run model:simple && npm run model:check
node --experimental-strip-types scripts/render-figures.mjs
```

`apply_real.py` also sets a few hand-placed shapes read from the cross-sections (skull base, clivus,
brainstem, cerebellum top, tentorium), so review the figure after rerunning it.
