# Realistic model (Phase 2)

Built from the Z-Anatomy atlas (CC BY-SA 4.0), which is derived from BodyParts3D
(© The Database Center for Life Science, CC BY-SA 2.1 JP). Every change is a script here, so it can be re-run and reviewed.
The realistic model is **not shown publicly until its views pass the accuracy checks and Matthew approves them** (CLAUDE.md rule 1a). There is no medical reviewer (Matthew's decision, 2026-11-04).

## Setup (once per machine)

```bash
python3 -m venv model/realistic/.venv
model/realistic/.venv/bin/pip install bpy==5.2.3
```

`bpy` is Blender 5.2.3 as a Python package (needs Python 3.13). Rendering inside Blender also needs the
system package `libegl1`; the pipeline views models in Three.js instead, so it is optional.

## Source data (not stored in this repository)

```bash
git clone --filter=blob:none --no-checkout https://github.com/Z-Anatomy/Models-of-human-anatomy /tmp/za
git -C /tmp/za checkout HEAD -- Z-Anatomy.zip License.txt
mkdir -p model/source && cd model/source && unzip /tmp/za/Z-Anatomy.zip Z-Anatomy/Startup.blend
```

`model/source/` is ignored by git (the atlas is about 300 MB). The atlas is a Blender template that contains
a Python script; every script here opens it with scripts **turned off** (`use_scripts=False`), and Blender
confirms "scripts disabled ... skipping".

## Scripts

| Script | What it does |
| --- | --- |
| `inventory.py` | Lists all 7,184 objects in the atlas (4,569 surfaces) as JSON |
| `measure_typical.py` | Foramen magnum along the midline and the tonsil tip vs the McRae line, as the atlas comes |
| `export_midline_probe.py` | First-look export of the head and upper neck, cut at the midline, as glTF |
| `extract.py` | Builds the realistic model for one condition: `typical` (tonsils about 1 mm above the McRae line), `chiari` (about 12 mm below, peg-shaped, fluid behind them crowded out), `syrinx` (Chiari I with a syrinx in the neck cord) or `surgery` (after decompression) |
| `check.mjs` | Automatic measurements against EVIDENCE.md (`npm run model:check:realistic -- <file> [--condition chiari --typical <typical file>]`) |

```bash
model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend typical-raw.glb typical
model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend chiari-raw.glb chiari
node model/realistic/check.mjs typical-raw.glb
node model/realistic/check.mjs chiari-raw.glb --condition chiari --typical typical-raw.glb
model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend syrinx-raw.glb syrinx
node model/realistic/check.mjs syrinx-raw.glb --condition syrinx --typical typical-raw.glb
model/realistic/.venv/bin/python -I model/realistic/extract.py model/source/Z-Anatomy/Startup.blend surgery-raw.glb surgery
node model/realistic/check.mjs surgery-raw.glb --condition surgery --typical typical-raw.glb --chiari chiari-raw.glb
```

How After decompression is made: the Chiari I tonsils, risen about 2 mm (to about 10.4 mm below the McRae line).
- **Bone:** the bone is cut exactly along the edges of a window 30 mm across and 25 mm up the back of the skull from the opisthion. The middle 25 mm of C1's back arch is cut away too. Both removed pieces are kept as a faint red outline ("bone-removed").
- **Dural patch:** a thin curved oval membrane, a few mm outside where the bone was.
- **Fluid:** the fluid space behind the cerebellum is re-formed in front of the patch, joined to the space behind the cord.
- **McRae line:** its back end (the opisthion) is removed with the bone, so the check takes the line from the typical model; it shows where the opening was.

How Chiari I is made: the lower part of each atlas tonsil is stretched down (the top, where it joins the
cerebellum, stays), narrowed toward a blunt tip and drawn toward the midline so it passes through the opening;
anything that would pass into bone or the spinal cord is pushed back out, leaving the tonsils slightly squeezed
where the space is tight. The fluid around the cerebellum is computed around the brain, and in Chiari I the space
behind the brainstem up to 12 mm above the McRae line is left out (filled by the tonsils), as in the Simple model.

## First findings (2026-11-04)

- The atlas is a whole standing body in metres (head around 1.55 m up), Blender's Z up, face toward -Y.
- Present as separate surfaces: every skull bone; cerebellar lobules, vermis and **both cerebellar tonsils**;
  medulla, pons, midbrain (left and right halves); C1 to C4 and discs; spinal dura; ventricles; tentorium; falx.
- Missing: a whole spinal cord (only small cross-section pieces), the fluid spaces around the brain
  (cisterna magna, subarachnoid space), and a usable skin surface for the head (only coarse body-surface regions).
- As the atlas comes: tonsil tip **2.8 mm above** the McRae line (EVIDENCE.md: typical about 1 mm above,
  normal range roughly 8 mm above to 5 mm below). Foramen magnum about **38 mm** front to back by a rough method
  (EVIDENCE.md: about 33 to 36 mm); to be refined.

How the syrinx is made: Chiari I, plus a cavity along the cord's own centre line from about C3 (49 mm below the
McRae line) to the bottom of the view. It measures about 45% of the cord front to back and 42% side to side, with
beads every 10 mm and a tapered top. The cord's centre line is the middle of the atlas's spinal dura at each height,
smoothed.

## For the Explorer (step 5)

`web.mjs` turns the four builds into one file per detail level, in `model/realistic/web/`:
- **What goes in:** structures shared by all views appear once. Structures that differ (tonsils, fluid around the cerebellum, occipital bone, C1, syrinx, removed bone, dural patch) carry the views they belong to, as in the Simple model.
- **Sizes:** each structure is simplified to a triangle budget. Desktop is about 410,000 triangles (1.4 MB); phone about a third of that (0.5 MB).

```bash
node model/realistic/web.mjs <folder with typical-raw.glb, chiari-raw.glb, syrinx-raw.glb, surgery-raw.glb>
```

These files are **not public**:
- the normal site build leaves them out, and the Realistic button stays off (a test checks both);
- a preview build includes them and turns the button on: `PUBLIC_REALISTIC_PREVIEW=1 npm run build` (or `npm run dev`). Never deploy a preview build.

In the Explorer:
- the realistic model loads only when picked (phones and small screens get the lighter file), and falls back to Simple if it can't load;
- cut faces are each structure's inside painted flat in its color, so small gaps in the atlas surfaces don't show.
- Not yet on the realistic model: the flow arrows, and the figure on the midline cut face (both follow the Simple figure).
