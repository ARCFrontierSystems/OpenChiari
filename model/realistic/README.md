# Realistic model (Phase 2)

Built from the Z-Anatomy atlas (CC BY-SA 4.0), which is derived from BodyParts3D
(© The Database Center for Life Science, CC BY-SA 2.1 JP). Every change is a script here, so it can be re-run and reviewed.
The realistic model is **not shown publicly until its views have had a medical review** (CLAUDE.md).

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

## First findings (2026-11-04)

- The atlas is a whole standing body in metres (head around 1.55 m up), Blender's Z up, face toward -Y.
- Present as separate surfaces: every skull bone; cerebellar lobules, vermis and **both cerebellar tonsils**;
  medulla, pons, midbrain (left and right halves); C1 to C4 and discs; spinal dura; ventricles; tentorium; falx.
- Missing: a whole spinal cord (only small cross-section pieces), the fluid spaces around the brain
  (cisterna magna, subarachnoid space), and a usable skin surface for the head (only coarse body-surface regions).
- As the atlas comes: tonsil tip **2.8 mm above** the McRae line (EVIDENCE.md: typical about 1 mm above,
  normal range roughly 8 mm above to 5 mm below). Foramen magnum about **38 mm** front to back by a rough method
  (EVIDENCE.md: about 33 to 36 mm); to be refined.
