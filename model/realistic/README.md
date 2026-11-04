# Realistic model (Phase 2)

Built from the Z-Anatomy atlas (CC BY-SA 4.0), which is derived from BodyParts3D
(© The Database Center for Life Science, CC BY-SA 2.1 JP). Every change is a script here, so it can be re-run and reviewed.
The realistic model passed the accuracy checks (CLAUDE.md rule 1a; three independent audits in `docs/audits/`, all automatic checks) and **Matthew approved it for the public site on 2026-11-04**. There is no medical reviewer (Matthew's decision, 2026-11-04). Any change to it must pass `check.mjs` (all four views), `web.mjs`'s own checks and `view-check.mjs` before it ships.

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
- **Bone:** the bone is cut exactly along the edges of a window 30 mm across and 25 mm up the back of the skull from the opisthion, plus the back rim of the opening itself across 25 mm (it curves down and forward off the midline; PMC11912941: "approximately 2.5 cm of the posterior margin of the foramen magnum was excised"). The middle 25 mm of C1's back arch is cut away too. Both removed pieces are kept as a faint red outline ("bone-removed").
- **Dural patch:** a thin curved membrane across the opening, within the thickness of the removed bone. Its outline is a rounded rectangle a little wider than the bone window; its lower end stays wider than the gap in C1's arch. A check confirms there is bone or patch behind all the fluid there. Where its curved side edges would pass into the cerebellum, they are moved back.
- **Fluid:** the fluid space behind the cerebellum is re-formed in front of the patch, joined to the space behind the cord; none of it sits behind the patch.
- **McRae line:** its back end (the opisthion) is removed with the bone, so the check takes the line from the typical model; it shows where the opening was.

How Chiari I is made: the lower part of each atlas tonsil is stretched down (the top, where it joins the
cerebellum, stays), narrowed toward a blunt tip, and slid sideways (not squashed) until its lowest point is on the
midline, so the midline cut shows the tonsils at their lowest point (in every view). Only the lower ends are slid
(fully below 2 mm above the McRae line, none above 5 mm), so higher up the tonsils keep their natural gap under the
fourth ventricle, and its outlet opens into the fluid behind the cerebellum. The lower ends are joined into one
closed surface. Anything that would pass into bone, the spinal cord, the brainstem or the fourth ventricle is pushed
back out, leaving the tonsils slightly squeezed where the space is tight. Where the lower ends are joined, a shallow
groove runs down the middle of their back (from 3 mm above the tip), so from behind they still read as two. Under the
fourth ventricle a channel 4 mm wide is kept open between the tonsils, so its outlet opens into the fluid behind the
cerebellum. Finally the tonsil surface is rebuilt cleanly (voxel remesh, 0.4 mm) and smoothed with a method that
doesn't shrink thin parts. Points are moved out of bone, cord, brainstem or ventricle only when a ray count confirms
they are inside, because near the open edges of the atlas's surfaces the surface direction can't be trusted. This
keeps the surface free of folds (checked: at most 1% of faces folded). Where the atlas's cerebellum reaches into
the occipital bone, it is moved inward (toward its own centre), never through to the outside of the skull.

The fluid comes in two parts:
- **Around the cerebellum** (`csf-cranial`): computed on a 1 mm grid as the space between the brain and the skull,
  kept 1 mm clear of the brain. As the tonsils go lower (Chiari I), this space shrinks automatically.
- **Around the cord** (`csf-spinal`): a tube around the cord, fitted to the bone by rays (about 14 mm front to back
  at C3; EVIDENCE.md 13 to 15 mm). The cord sits inside it, which draws correctly in the cut view. In Typical, from
the opening down to C1, it reaches back to the canal's back edge (the line from the opisthion to C1's arch, never past
bone). The tube stops in
  front of the tonsils wherever they reach down behind the cord. In Chiari I, from 2 to 14 mm below the line, its
  back is pulled in to the cord, where the tonsils plug the space.

Also checked: the fluid is at least about 1 mm thick all the way round the neck cord at every height (not only on
the midline), no cerebellum shows outside the skull, the tonsils stay out of the fourth ventricle and its outlet
meets the fluid, and after surgery the back rim of the opening is gone across 25 mm.

Rules for the cut view (each one is checked): the fluid never sits inside the cord, tonsils or brainstem, and the
tonsils never sit inside the fluid. Otherwise the fluid would be drawn over them.

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
- **Sizes:** each structure is simplified to a triangle budget. Desktop is about 410,000 triangles (1.5 MB); phone about a third of that (0.6 MB).
- **Checked after writing:** in each view every structure appears once, the needed parts are there, the tonsils' lowest point matches the measured one within 1 mm, and on the midline the fluid is never drawn over the tonsils (simplification can move surfaces). The script fails if any of these is wrong.

```bash
node model/realistic/web.mjs <folder with typical-raw.glb, chiari-raw.glb, syrinx-raw.glb, surgery-raw.glb>
```

**What the Explorer draws** (`view-check.mjs`): with a preview build served locally, it opens the Explorer, shows the
realistic model cut at the midline in each view, and reads the screen colour wherever the model has fluid (the
flow-mark places, with the marks turned off). Each must show the fluid's blue. This catches drawing problems that
the geometry checks can't see; it found the see-through skin's solid inside covering the fluid, now fixed by drawing
the skin first.

```bash
npm run build
npx astro preview --port 4330 &
node model/realistic/view-check.mjs
```

**On the site:** every build copies these two files into `dist/models/realistic/` (see `astro.config.mjs`), and the Explorer's Realistic button loads them on request. A site test checks that the button works and the model loads.

In the Explorer:
- the realistic model loads only when picked (phones and small screens get the lighter file), and falls back to Simple if it can't load;
- cut faces are each structure's inside painted flat in its color, so small gaps in the atlas surfaces don't show.
- **Labels and flow marks** come from the realistic model itself. `web.mjs` maps what the midline cut shows (looking from the side, the first surface at each 1 mm point). Each label then points at the middle of where its structure shows. The flow marks sit in the fluid in front of and behind the cord and behind the cerebellum. In Chiari I they move only slightly behind the cord, and red marks show the plugged passage at the opening. These are saved in the file, and the web check confirms that every label points at its own structure and every flow mark sits in fluid.
- The figure painted on the midline cut face stays Simple-only; the realistic model shows its own cut structures there.
