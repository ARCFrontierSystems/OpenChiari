# Independent re-audit: realistic 3D model (4 conditions)

- **Date:** 2026-11-04
- **Who:** a fresh AI agent that did not build the model or the fixes (CLAUDE.md rule 1a, check 3). This is not a medical review.
- **Scope:** the realistic model after the fixes in commit `1a005ac`, in Typical, Chiari I, Chiari I with syrinx and After decompression.
  - Raw builds (`/tmp/claude-0/za/view/*-raw.glb`) and the Explorer files (`model/realistic/web/*.glb`, desktop and phone).
  - The build script and automatic checks (`model/realistic/extract.py`, `check.mjs`, `web.mjs`, README).
  - The visible text (`src/i18n/en.json`: explorer.conditions, explorer.parts, figure).
  - Compared with `docs/EVIDENCE.md` ("3D model shapes", "Syrinx", "After decompression", "Midline simplification").
- **Sources opened (text read):** PMC9834072 (posterior fossa morphometry), PMC8334714 (cord size), PMC2899662 (neck canal and fluid column), PMC10549945 (changes after decompression), PMC11912941 (bone window, C1), NINDS syringomyelia page, and the earlier reports `2026-11-04-realistic-audit.md` and `2026-11-04-mri-first-look.md`.
- **How:**
  - Ran `check.mjs` on all four views (all pass).
  - Measured the geometry myself: a 1 mm grid marking which structure each point is inside, exact overlap depths, midline and off-midline sections, and the fluid behind and in front of the cord at each height.
  - Rendered close-up midline cuts with the Explorer's own cut-face painting, and took screenshots of the real Explorer (preview build, local only).
  - Scratch scripts were deleted afterwards.
- **Limitations:**
  - Atlas surfaces are not all closed, so small overlap counts (under about 1 mm) are approximate.
  - I did not rebuild the model from the atlas.
  - No new MRI comparison was made.
  - What a patient will understand from a picture is my judgment, not a measurement.

## Findings

| # | Severity | Finding, with my numbers | Source and quote | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | High | **In the cut view the spinal cord looks like fluid, and the syrinx is hard to see.** The new fluid layer around the cord reaches up to 0.6 mm *inside* the cord along its whole length (14,606 fluid surface points inside the cord). The Explorer draws that inner fluid wall over the cord's cut face, so from about 20 mm below the McRae line (C1) down, the cord shows in the fluid's blue in all four views. Confirmed in a real Explorer screenshot; with the fluid hidden, the cord is its proper cream colour. In the syrinx view the cavity is only a slightly brighter blue streak inside a blue cord. Cause in `extract.py`: fluid points are kept 0.6 mm from the cord, then each one is grown by 1.2 mm (`POINT_RADIUS`). | en.json syrinx: "A fluid-filled cavity inside the spinal cord". NINDS: fluid "builds up within the tissue of the spinal cord". | Keep the fluid's inner surface at least about 0.3 mm outside the cord: raise the clearance above the growth radius, or cut the cord out of the fluid surface. Add a check that no fluid lies inside the cord, and look at the syrinx view again. |
| 2 | Medium | **The neck fluid column runs into the vertebrae and is wider than planned.** It is 16.6 mm front to back at C3 (16.3 to 17.0 mm from C1 to C5), not the "about 14 mm" stated in PROGRESS.md. It is also shifted forward: it passes up to 2.0 mm into the backs of the C3 to C5 vertebral bodies (1.8 mm at the midline) and up to 1.0 mm into the discs, while about 2 mm is left empty in front of the laminae. Cause: `extract.py` leaves C3 to C5 and the discs out of its bone test. The check accepts anything from 12 to 18 mm. | PMC2899662: the canal (measured as "the sagittal diameter of the cervical CSF column") averaged "13.73 ± 1.37 mm"; EVIDENCE.md: "About 13 to 15 mm below C2". | Add C3 to C5 and the discs to the bone test. Centre the column in the bony canal, and allow for the 1.2 mm growth so it measures about 14 mm. Tighten the check to about 13 to 15.5 mm, with no fluid inside any vertebra. |
| 3 | Low | **Chiari I: below the line, cleared space is left empty rather than crowded.** Behind the cord from 0 to 14 mm below the line (leaving out the midline strip, finding 4), the space that holds fluid or brain in Typical is, in Chiari I: 37% tonsil, 20% brain, 5% fluid and **38% empty**. These are side pockets where the fluid was removed but the tonsils don't reach. Above the line it is now 11 to 13% empty (was 57% in the first audit), so finding 2 of the first audit is mostly fixed. In the cut the pockets look like the black background, so the effect on screen is small. | EVIDENCE.md fluid pathway, Chiari I: "Tonsils plug the pathway at the foramen magnum"; cisterna magna "Often crowded or narrowed". | Remove fluid only where the tonsils are (plus a small margin), or keep a thin squeezed layer in the side pockets. |
| 4 | Low | **The midline cut never passes through the tonsils.** The tonsils come no closer than 1.2 mm (Typical) and 1.6 mm (Chiari I, After surgery) to the midline; the tips are 2.5 to 2.9 mm to each side. The cut therefore shows the far tonsil's inner surface through a 2.4 to 3.2 mm empty strip, not a cut face. In renders this still reads as the tonsil, with its tip at the right height, so the Measure bracket is right. The check allows the tip to be up to 3.5 mm off the midline. | en.json tonsil card: "the model shows them at their lowest point, where MRI measures them". | Draw the lower tonsils to about 0.5 mm from the midline, so the cut crosses them near the tip. Make the check require the midline section to reach within about 1 mm of the tip. |
| 5 | Low | **After surgery, some fluid sits outside the patch near its side edges.** At the midline the fluid stays inside the patch at every height (for example at 7 mm below the line: fluid 22.3 mm back, patch 21.8 to 23.0 mm). But near its side edges (about 12 mm from the midline, 0 to 10 mm above the line) the patch curves inward, and fluid lies up to 4.0 mm behind it (1,883 surface points). Better than the first audit (2 to 5 mm, also lower down). Hard to see from the Back view. | PMC10549945: "The dura expanded posteriorly into the craniectomy". | Apply the patch limit to all fluid, not only to the re-formed part, or let the patch edges reach the bone edges. Add a check for fluid outside the patch. |
| 6 | Low | **The top of the cord is a thick, boxy block down to C1.** Below the McRae line the cord is the atlas's medulla, cut flat at the line. It is 12 to 15 mm front to back down to about 20 mm below the line (13.3 mm at 20 mm below). It then narrows to 8.8 mm within 4 to 6 mm, so in the cut it looks like a rectangular block with a step. There is also a thin separate sliver of brainstem tissue about 1 mm behind it. | MRI first look: "Spinal cord at the top of the neck: about 8 to 9 mm front to back" and "the realistic model's built cord (13.7 mm) ... too thick"; PMC8334714: "8.8 mm x 12.4 mm at C2". | Taper the medulla smoothly from the McRae line to about 9 to 10 mm by C1. |
| 7 | Low | **Blind spots in `check.mjs`.** (a) "Re-formed fluid reaches 96.9 mm below the line" now just finds the neck fluid, which is the same surface, so it can't fail. (b) Fluid column 12 to 18 mm, and no test of fluid inside C3 to C5, the discs or the cord (findings 1 and 2). (c) The 3.5 mm midline test lets the cut miss the tonsils (finding 4). (d) Chiari I only checks that fluid is gone, not what fills the space (finding 3). (e) There is no test for fluid outside the patch (finding 5). (f) "About 30 mm up the skull" includes about 5 mm of the bone's rim; the window itself runs 24.8 mm from the opisthion. (g) The tonsil overlap test only counts points within 2 mm of a face centre, and only against bone and cord. (h) Nothing runs on the Explorer files. | (method) | Add the tests named in findings 1 to 5. Measure the window from the opisthion. Use a full inside test. Run the key measurements on the web files. |
| 8 | Low | **Small leftover overlaps.** Occipital bone pokes up to 2.4 mm into the cerebellum at 17 mm from the midline, 8 mm above the line (13 points; the cerebellum's own points are now all clear of bone). The top of each tonsil sits up to 1.6 mm inside the cerebellum where they join (atlas). After surgery, fluid reaches up to 0.7 mm into the tonsils. None of these show in the midline cut. | (geometry) | Optional tidy-up. |

## Checked and OK

- **All four automatic checks pass**, and their main numbers match my own measurements.
- **Foramen magnum (McRae line):** 38.4 mm, basion (−19.0, 2.5) to opisthion (19.0, −2.8), the same in every view. PMC9834072 controls "36.23 ± 3.26 (30.2-46.5)".
- **Typical tonsils:** tip 1.0 mm above the line (EVIDENCE: about 1 mm). Rounded: 12.7 to 13.5 mm front to back 3 mm above the tip.
- **Chiari I tonsils:** tip 12.4 mm below the line (PMC9834072: "12.4 ± 3.7 (5.0-25.4)"). Peg-shaped: 7.0 mm 3 mm above the tip, 55% of Typical.
- **After decompression:** tonsils 10.4 mm below the line, risen 2.0 mm (PMC10549945: "decreased 2 mm 3–6 months after surgery"). Bone window 30 mm across and 24.8 mm up from the opisthion; the nearest bone left on the midline is 24.9 mm from the old opisthion (PMC11912941: "a 2.5× 3 cm bone window"). C1 gap 25.0 mm ("Approximately 2.5 cm of the middle part of the posterior arch of the atlas was removed"). The patch is 32 mm across, and the tonsils stay 7.3 mm clear of it.
- **No tonsil passes into anything:** 0 tonsil points inside the occipital bone, C1, C2, the cord or the brainstem in any view. The left and right tonsils don't touch.
- **Fluid pathway:**
  - The fluid is one piece in every view.
  - Typical is open behind the cord at every height from the opening to C3 (at least 53 mm² of fluid in cross-section; 63 mm² at C1).
  - Chiari I is blocked behind the cord from 2 to 14 mm below the line (0 to 6 mm²) and open in front (112 to 140 mm²).
  - After decompression it is open again behind the cord (165 to 442 mm²).
  - Above the line, Chiari I keeps a narrowed space behind the cerebellum: 35% fluid vs 58% in Typical.
  - Phone and desktop files agree (column about 16 mm in both).
- **Spinal cord:** 8.8 mm front to back at C2, 8.3 to 8.8 mm down to C5, 12.4 to 13.8 mm side to side (PMC8334714: "8.8 mm x 12.4 mm at C2 to 8.7 mm x 14 mm at C4").
- **Syrinx:**
  - Inside the cord and centred in it (offset 0.0 mm).
  - Size 3.5 to 4.4 mm front to back and 4.8 to 6.4 mm side to side, in a cord 8.7 to 8.8 by 13 to 13.8 mm, leaving 2.2 to 2.6 mm of cord around it.
  - Beaded, and runs from 46 mm below the line (C3) to the bottom of the view, in the neck part, as EVIDENCE says.
- **Clivus** 43.6 mm (controls "38.99 ± 2.67"). One skull for all views, as EVIDENCE now says (Matthew's decision).
- **Fourth ventricle:** lowest point 6.6 mm above the line in all views.
- **Dens:** tip 10.0 mm below the line, 7.8 mm in front of the cord.
- **Measure tool (first audit, finding 5): fixed.**
  - Both Explorer files carry the realistic model's own McRae line and tonsil tips (desktop: +1.0, −12.4, −10.4 mm; phone: +1.3, −12.1, −10.2 mm; line 38.4 and 38.3 mm).
  - In a real Explorer screenshot the line's end dots sit on the basion and opisthion, and the bracket ends at the tonsil tip.
- **Explorer files:** each part is tagged with the right views (tonsils, fluid, occipital, C1, syrinx, removed bone, patch).
- **Visible text:** the condition notes, part cards and screen-reader descriptions match what the model shows, except as noted in findings 1 and 4.
