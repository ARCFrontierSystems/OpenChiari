# Independent re-audit 2: realistic 3D model (4 conditions)

- **Date:** 2026-11-04
- **Who:** a fresh AI agent that did not build the model or the fixes (CLAUDE.md rule 1a, check 3). This is not a medical review.
- **Scope:** the realistic model after commits `58e66c2` and `27beb61` (the fixes for `2026-11-04-realistic-reaudit.md`), in Typical, Chiari I, Chiari I with syrinx and After decompression.
  - Raw builds (`/tmp/claude-0/za/view/*-raw.glb`) and the Explorer files (`model/realistic/web/realistic-desktop.glb`, `realistic-phone.glb`).
  - Build and check code (`model/realistic/extract.py`, `check.mjs`, `web.mjs`, README). Not edited.
  - Viewer code (`src/explorer/viewer3d.ts`: cut-face painting, depth range, see-through skin, Measure).
  - Visible text (`src/i18n/en.json`: explorer.conditions, explorer.parts, figure).
  - Compared with `docs/EVIDENCE.md` ("3D model shapes", "Syrinx", "After decompression", "Midline simplification", fluid pathway rows).
- **Sources opened (text read this time):**
  - PMC9834072 (posterior fossa morphometry, full text).
  - PMC8334714 (cord size; the page has the abstract, the full text is a PDF).
  - PMC2899662 (neck canal and fluid column, full text).
  - PMC10549945 (changes after decompression, full text).
  - PMC11912941 (bone window, C1, patch; full text).
  - **Not opened:** the NINDS syringomyelia page. ninds.nih.gov answered "403 Forbidden" to this environment. I did not try to get around that. The syrinx checks below rest on EVIDENCE.md and the quotes in the earlier reports.
- **How:**
  - Ran `check.mjs` on all four views (all pass) and `web.mjs` (it rewrote both web files byte for byte the same as the committed ones; git stayed clean).
  - Measured the geometry with my own scripts, not the check's logic:
    - a 0.5 mm grid of inside/outside for every structure, from rays along two directions (only voxels both agree on);
    - overlap volumes and depths;
    - midline sections;
    - fluid thickness around the cord in 12 directions at each height;
    - what fills the canal behind the cord;
    - bone window, C1 gap and patch coverage;
    - syrinx position.
  - Emulated the midline cut (rays from the cut plane toward −z), and traced the same rays through the Explorer file.
  - Took screenshots of the real Explorer (local preview build, desktop width; never deployed). Default layers, then with the skin layer off, from the Side and Back cameras. Afterwards I ran a normal `npm run build`.
  - Scratch scripts and images were deleted afterwards.
- **Limitations:**
  - The atlas cerebellum, skull and tentorium surfaces are not fully closed, so their overlap numbers are approximate.
  - I did not rebuild the model from the atlas.
  - No new MRI comparison was made.
  - I took no phone-size screenshots. I checked the phone file by numbers only.
  - The likely causes I name are from reading the code, not proven.
  - How a patient will read a picture is my judgment, not a measurement.

## Findings

| # | Severity | Finding, with my numbers | Source and quote | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | High | **The Explorer hides the spinal fluid behind the cord at the opening in Typical.** In the model, Typical has 4 to 5 mm of fluid behind the cord from 2 to 12 mm below the McRae line. Tracing the view ray through the desktop file at (3, −6) mm: the first surface is the fluid's far wall (6 mm behind the cut), and the next is the skin (58 mm). Yet in a real Explorer screenshot (default layers, Side, midline) that area is beige from about 3 mm below the line down to C1. With the skin layer turned off, the blue band appears. Likely cause in `viewer3d.ts`: the skin is see-through (35%), so it is drawn in the see-through pass. But its cut face is painted fully solid (`capAlpha` = 1). When it is drawn after the fluid, it covers the fluid wherever no bone or brain lies behind it. Between the skull and C1 there is none. After decompression still shows fluid there (a different fluid mesh that is drawn later), so on screen Typical now looks less open than After surgery. | en.json typical note: "spinal fluid moves freely around them". EVIDENCE.md fluid pathway, Typical: "Continuous: from the fourth ventricle outlet into the cisterna magna, around the tonsils, through the foramen magnum and down behind the cord". | Draw the skin's solid cut face before every see-through structure (for example, a lower `renderOrder` for the skin), or draw the skin's inside in the opaque pass. Add a browser test that reads pixel colors behind the cord at the opening in Typical. |
| 2 | High | **Typical: the fluid around the neck cord has collapsed onto the cord.** Fluid around the cord (cross-section, outside the cord): Typical 20 to 70 mm² from 20 to 95 mm below the line; Chiari I and After decompression 105 to 120 mm². At C3 (58 mm below the line) the Typical fluid is 0.2 to 0.3 mm thick at the back and both sides. Chiari I has 2.9 to 3.1 mm there. In front of the cord, from the line to 12 mm below it, Typical has 0 to 1 mm against about 3 mm in Chiari I. The desktop and phone files are the same (for example, 30 mm below the line: one side 0.2 mm in Typical, 3.1 mm in Chiari I). `check.mjs` measures the column only on the midline at 50 mm below the line, where it is 14.0 mm, so it passes. Likely cause: the tonsil-clearance loop in `extract.py` (`find_nearest` plus a facing test on the joined tonsil surface) shrinks the tube to "cord + 0.3 mm" even far from the tonsils. Only Typical is affected. Together with finding 1, the Typical view shows no fluid around the cord from about 3 mm below the line to C1. | PMC2899662: "the average canal diameter was 13.73 ± 1.37 mm", measured as "the sagittal diameter of the cervical CSF column". EVIDENCE.md: canal "About 13 to 15 mm below C2". | Make the tonsil clearance depend only on distance near the tonsils (or on rays), not on the facing of the nearest face. Add a check of fluid thickness all around the cord at every height. Also check that Typical is never thinner than Chiari I below C1. |
| 3 | Medium | **The cerebellum shows through the back of the skull.** 138 cerebellum surface points sit 1.2 mm outside the outer surface of the occipital bone. They are on both sides, 15 to 28 mm from the midline and 8 to 20 mm above the line, in all four views. In the Back camera they show as two pink patches on the skull (screenshots of Typical and After decompression). The cerebellum still overlaps the bone by about 0.9 ml (up to 1.8 mm deep). Likely cause: the new step that pushes the cerebellum "out of bone by 1.2 mm" moves points to the nearest bone surface, which is sometimes the outer one. This was introduced by the fix for earlier finding 8. | (geometry) A brain showing outside the skull is plainly wrong in a patient illustration. | Push cerebellum points toward the inside of the skull (toward the brain's centre or the bone's inner surface). Add a check that no brain lies outside the skull. |
| 4 | Medium | **After decompression: most of the back edge of the opening is left.** The window is right (30 mm across, 24.8 mm up from the opisthion). But the rim of the foramen magnum is fully removed only within 4.5 mm of the midline (about 9 mm). A thin lip stays from 4.5 to 7 mm, and from 7.5 mm outward the rim is exactly as in Typical. On the midline the cut starts at the opisthion. Off the midline the rim curves down and forward, below where the cut starts (it starts 2 mm below the opisthion along the window's direction, and the rim lies 2.5 to 8 mm below it). | PMC11912941: "approximately 2.5 cm of the posterior margin of the foramen magnum was excised". | Extend the cut down to include the rim across about 25 mm. Add a check of how much of the rim is removed. |
| 5 | Medium | **The fourth ventricle is sealed off on the midline.** The tonsils now meet on the midline (fix for earlier finding 4). There they sit right under the fourth ventricle and overlap it by up to 0.9 mm (28 to 34 mm³, 7 to 11 mm above the line) in all views. On the midline the nearest fluid around the cerebellum is 10.7 mm away, in front of the brainstem. So the cut shows the ventricle closed at the bottom by tonsil tissue, with no outlet into the fluid space behind the cerebellum. Before the fix this strip was empty (also no visible outlet), so this is partly an older gap. | EVIDENCE.md fluid pathway, Typical: "from the fourth ventricle outlet into the cisterna magna". Fourth ventricle card: "where spinal fluid passes through". PMC11912941: "the Magendie foramen was fully exposed to ensure the flow of cerebrospinal fluid". | Move only the lower ends of the tonsils to the midline. Leave the gap between their upper parts open, below the fourth ventricle, and fill it with fluid. Add a check that the tonsils stay out of the fourth ventricle. |
| 6 | Low | **The two tonsils now read as one.** Seen from behind (skin and bone hidden), the Chiari I tonsils form a single wedge on the midline. The joined surface also has inner folds: up to 8 separate pieces along one line through it. Same color as the cerebellum, so the folds don't show. The tonsil card does say they "really sit just to either side of the midline", so the simplification is disclosed. | en.json tonsil card: "The two lowest parts of the cerebellum ... the model shows them at their lowest point, where MRI measures them". | Keep a small notch between the two tonsils above the tip. Otherwise accept it as covered by the card (Matthew's call). |
| 7 | Low | **The canal behind the cord at the opening is half empty in Typical.** On the midline, between the cord and the canal's back edge (opisthion to the C1 arch), Typical is 43% fluid and 57% empty. The fluid reaches only 4 to 5 mm behind the cord; the back edge is 9 to 19 mm behind it. Chiari I is 45% tonsil, 10% fluid, 44% empty. In the Explorer the empty part shows as the beige skin cut face, so it reads as tissue, not a hole. | EVIDENCE.md canal row: "roomier at C1 and the foramen magnum". | Let the fluid reach the canal's back edge from the opening to C1 in Typical and After decompression. |
| 8 | Low | **After decompression: small patch edge problems.** The patch's curved side edges pass into the cerebellar hemispheres (16 mm³, 16 to 17 mm from the midline, 3 to 9 mm above the line). At the patch's lower edge (C1 level, 10 to 11 mm from the midline), 32 fluid points have neither patch nor bone behind them. Neither shows clearly on screen. | PMC10549945: "The dura expanded posteriorly into the craniectomy". | Optional tidy-up. |
| 9 | Low | **Blind spots in the checks.** (a) Fluid around the cord is measured only on the midline, so finding 2 passes. (b) Nothing tests what the Explorer actually draws, so finding 1 passes. (c) No test for brain outside the skull (finding 3). (d) No test of how much of the foramen rim is removed (finding 4). (e) No test of the tonsils against the fourth ventricle or cerebellum (finding 5). (f) Chiari I still only checks that fluid is gone, not what fills the space. (g) "Fluid inside bone or discs" reports 15 to 95 points up to 2.5 mm deep. My two-direction inside test finds none, so that measure is noisy. | (method) | Add the tests named in findings 1 to 5. |

## Status of the 8 earlier findings

1. **Cord looks like fluid, syrinx hard to see: fixed.**
   - No fluid around the cerebellum lies inside the cord (0 voxels).
   - The spinal fluid contains the cord by design, and the cord draws in its own cream color in every screenshot.
   - The syrinx shows as a clear blue streak inside the cord.
2. **Neck fluid column too wide and inside the vertebrae: fixed on the midline.**
   - 13.7 to 14.0 mm front to back from C2 to C5 in Chiari I and After decompression.
   - 1 voxel (0.05 mm) inside C3 to C5, none in the discs.
   - But in Typical the column has collapsed around the sides (new finding 2).
3. **Chiari I, empty space below the line: not fixed.**
   - Behind the cord, 0 to 14 mm below the line: 44% empty on the midline, 51% within 10 mm of it.
   - In the Explorer it shows as beige, so the effect on screen is small.
4. **Midline cut misses the tonsils: fixed.**
   - The lowest point is 0.4 mm (Typical) and 0.1 mm (Chiari I, After decompression) from the midline.
   - The midline cut reaches the true tip within 0.02 mm.
   - Side effects: findings 5 and 6.
5. **Fluid outside the patch at its side edges: fixed.**
   - At most 0.5 mm, within the patch's own thickness (670 of 49,176 points).
   - No spinal fluid behind it.
   - A small leftover is in finding 8.
6. **Boxy cord top: fixed.**
   - The cord tapers smoothly: 11.5 mm front to back at the line, 9.8 mm at 6 mm below, 8.8 mm from 12 mm below.
   - Side to side: 14.0 down to 12.4 mm.
   - No brainstem sliver below the line.
7. **Check blind spots: partly fixed.**
   - Fixed: the midline-section test for the tonsils, the fluid-behind-patch test, the window measured from the opisthion (24.8 mm), and checks on the web files (`web.mjs`).
   - Still open: the column is tested only on the midline, and Chiari I fill is not tested.
   - New gaps are in finding 9.
8. **Small leftover overlaps: partly fixed.**
   - Fixed: fluid into the tonsils is now 0.
   - Still there: tonsils into the cerebellum, up to 1.7 mm (now on the midline, same color). Cerebellum into the occipital bone: about 0.9 ml, up to 1.8 mm.
   - The push-out step created finding 3.

## Checked and OK

- **Automatic checks:** all four pass. `web.mjs` reproduces the committed web files exactly.
- **Foramen magnum (McRae line):** 38.40 mm, basion (−19.0, 2.5) to opisthion (19.0, −2.8), in every view. PMC9834072 controls: "36.23 ± 3.26 (30.2-46.5)".
- **Typical tonsils:** tip 1.2 mm above the line (EVIDENCE.md: about 1 mm above). Rounded: 13.3 mm wide 3 mm above the tip.
- **Chiari I tonsils:**
  - Tip 12.5 mm below the line. PMC9834072: "TH, mean ± SD (range) 0 12.4 ± 3.7 (5.0-25.4)".
  - Peg-shaped: 7.2 mm 3 mm above the tip (54% of Typical).
  - The tip is about level with the top of the C1 back arch, 1 mm above it (PMC9834072 grade 2: "the tonsils had reached the C1 arch").
- **After decompression, tonsils:** tip 10.5 mm below the line, risen 2.0 mm. PMC10549945: "The cerebellar tonsillar position inferior to the McRae line decreased 2 mm 3–6 months after surgery".
- **No passing into each other:**
  - Tonsils: 0 voxels inside bone or the cord; at most 0.5 mm into the brainstem.
  - Fluid around the cerebellum: 0 voxels inside the cord, brainstem, cerebellum, tonsils, fourth ventricle or bone, in all views.
- **Spinal cord:**
  - 8.8 mm front to back and 12.4 to 12.7 mm side to side at C2; 8.7 by 13.1 to 13.9 mm lower down.
  - PMC8334714: "from 8.8 mm x 12.4 mm at C2 to 8.7 mm x 14 mm at C4".
- **Syrinx:**
  - Fully inside the cord (0 voxels outside) and centred: the same 2.2 to 2.6 mm of cord in front and behind.
  - 40 to 50% of the cord front to back; 4.9 to 6.5 mm side to side in a 13 to 14 mm cord.
  - Beaded. Runs from 46 mm below the line (top of C3) to the bottom of the view.
- **Bone removed:**
  - Window 30.0 mm across and 24.8 mm up from the opisthion. The nearest bone left on the midline is 24.9 mm from the old opisthion.
  - C1 back arch gap 25.0 mm.
  - PMC11912941: "Approximately 2.5 cm of the middle part of the posterior arch of the atlas was removed, and the occipital bone was removed to form a 2.5× 3 cm bone window".
  - Exception: the rim at the sides (finding 4).
- **Patch and re-formed fluid:**
  - The patch is 34 mm across, and the tonsils stay 6.8 mm clear of it.
  - Behind the cord at the opening the space is 46% fluid on the midline (Chiari I: 10%).
  - PMC10549945: "The dura expanded posteriorly into the craniectomy"; "their retrotonsillar CSF space enlarged". PMC11912941: "The dura mater was sutured with an artificial dural patch."
- **Clivus:** 43.6 mm. **Fourth ventricle:** lowest point 6.6 mm above the line. **Dens:** tip 10.0 mm below the line. All the same in every view.
- **Measure tool:** both web files carry the realistic McRae line and tips. In screenshots the line's end dots sit on the basion and opisthion, and the bracket ends at the tonsil tip.
- **Explorer files:** each part is tagged with the right views (tonsils, fluid, occipital, C1, syrinx, removed bone, patch).
- **Captions:** "Illustration, not a medical image · Fluid flow simplified" shows under the realistic view. The page made no requests to other sites during my screenshots.
- **Visible text:** the condition notes, part cards and screen-reader descriptions match the model, except where findings 1, 2, 5 and 6 apply.

## Overall verdict

Yes, I see things that should block showing the realistic model publicly for now:
- **Findings 1 and 2:** in the Explorer as visitors will see it, the Typical view shows no fluid around the cord from just below the opening down to C1. That contradicts "spinal fluid moves freely around them" and weakens the main Typical vs Chiari I comparison. Both look like contained fixes (draw order in the viewer, and one clearance test in the build).
- **Finding 3:** the cerebellum shows through the back of the skull in the Back camera.

Findings 4 and 5 should also be fixed, or Matthew should knowingly accept them. Everything else is minor. The captions do not cover these problems, because they are drawing errors, not simplifications.
