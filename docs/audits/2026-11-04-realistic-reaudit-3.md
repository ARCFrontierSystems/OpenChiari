# Independent re-audit 3: realistic 3D model (4 conditions)

- **Date:** 2026-11-04
- **Who:** a fresh AI agent that did not build the model or the fixes (CLAUDE.md rule 1a, check 3). This is not a medical review.
- **Scope:** the realistic model after commit `ec4d8d4` (the fixes for findings 1 to 5 of `2026-11-04-realistic-reaudit-2.md`), in Typical, Chiari I, Chiari I with syrinx and After decompression.
  - Raw builds (`/tmp/claude-0/za/view/*-raw.glb`) and the Explorer files (`model/realistic/web/realistic-desktop.glb`, `realistic-phone.glb`).
  - Build and check code (`model/realistic/extract.py`, `check.mjs`, `web.mjs`, `view-check.mjs`, README). Not edited.
  - Viewer code (`src/explorer/viewer3d.ts`: cut-face painting, draw order, depth range, Measure, labels and flow marks on the realistic model).
  - Visible text (`src/i18n/en.json`: explorer.conditions, explorer.parts, figure).
  - Compared with `docs/EVIDENCE.md` ("3D model shapes", "Syrinx", "After decompression", "Midline simplification", fluid pathway rows).
- **Sources opened:** none this time. See Limitations.
  - `pmc.ncbi.nlm.nih.gov` and `www.ninds.nih.gov` do not resolve in this session (they are outside the session's allowed network domains). I did not try to get around that.
  - To open them, those two hosts have to be allowed in the session's network settings.
  - The quotes below are taken from the earlier audit reports and from EVIDENCE.md, where earlier agents opened the pages. I mark them "(quoted in an earlier report)".
- **How:**
  - Ran `check.mjs` on all four views: all pass.
  - Ran `web.mjs`: it rewrote both web files and its own checks passed. `git status` stayed clean, so the files are byte for byte the same as the committed ones.
  - Ran `view-check.mjs` against a local preview build: all 24 flow-mark points show the fluid's blue.
  - Measured the geometry with my own scripts, not the checks' logic:
    - a 0.5 mm grid of inside/outside for each structure, from rays in two directions (only points both agree on);
    - midline maps of what fills each 0.5 mm point;
    - fluid thickness around the cord in 24 directions at 13 heights;
    - what fills the canal behind the cord at the opening;
    - the back rim of the opening, the bone window, the C1 gap and the patch;
    - rays from behind, to see whether any brain lies outside the last bone surface;
    - "folded-over" faces on the tonsil surface (neighbouring faces turned more than 120° against each other);
    - what each label point and flow-mark point sits in, in the desktop file.
  - Took my own screenshots of the real Explorer: a local preview build served on port 4331, desktop width, never deployed.
    - Views: Side at the midline cut (default layers, then zoomed in on the opening), Back and Below (default, then without skin), and Back with skin, bone and fluid off.
    - Also Labels, Fluid flow and Measure on, in all four views.
  - Afterwards I stopped my server, ran a normal `npm run build` (it has no realistic files) and deleted my scratch folder.
- **Limitations:**
  - No source pages were re-opened (see above). I compared the model with quotes that earlier agents recorded.
  - The atlas skull surfaces are not closed. So my inside/outside counts against the "skull" group (cerebellum, tonsils, fluid) are not reliable, and I don't report them. Counts against the occipital bone, C1, C2, C3 to C5 and the discs are reliable.
  - I did not rebuild the model from the atlas.
  - No new MRI comparison was made.
  - I took no phone-size screenshots. I checked the phone file by numbers only.
  - A zoomed screenshot with Fluid flow on would not finish (the page kept animating), so I judged the flow marks from full-size screenshots and by numbers.
  - Likely causes I name come from reading the code, not from proof.
  - How a patient will read a picture is my judgment, not a measurement.

## Findings

| # | Severity | Finding, with my numbers | Source and quote | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | Medium | **New: the tonsil surface is crumpled where the tonsils meet the McRae line.** I counted faces that are folded back on their neighbours (more than 120°). Chiari I: 635 of 4,247 faces (15%) from 2 mm below to 2 mm above the line. After decompression: 627 of 4,085 (15%). Typical: 47 of 177 (27%) in that band, plus 257 of 4,778 (5%) from 2 to 6 mm above. Above 12 mm there are none. On screen: from the Back camera with skin, bone and fluid turned off, a torn, crumpled band runs across the top of the tonsils. In Chiari I it spans their whole width, right above the peg. In Typical it shows as small jagged bits. In the midline cut from the Side camera, the same place shows thin hatched slivers where the tonsils meet the cerebellum, in all four views. With default layers the bone hides the Back view. Likely cause: the lower ends are slid toward the midline in a narrow band (2 to 5 mm above the line), then pushed out of bone, cord, brainstem and the fourth ventricle, without a final clean-up of the surface. | EVIDENCE.md tonsil shape: Typical "Rounded"; Chiari I "Often pointed or peg-shaped". PMC11371388 (quoted in EVIDENCE.md): "Cerebellar peg-like rather than rounded tonsils ... are more common in patients with TH > 5 mm". A crumpled surface is neither, and the tonsils are the structure the site is about. | Clean up the tonsil surface after the slide and push steps: rebuild it (remesh), or smooth only that band and then push it out once more. Add a check that counts folded faces on the tonsils (for example, under 1%). Look at the Back view with bone off again. |
| 2 | Low | **Still open (earlier finding 7): in Typical, the canal behind the cord at the opening is mostly empty.** On the midline, from 2 to 14 mm below the line, between the back of the cord and the back edge of the canal: Typical is 35% fluid and 65% empty. Before the last fixes it was 43% fluid. After decompression is 49% fluid, 37% tonsil and 14% empty. Chiari I is 4% fluid, 46% tonsil and 50% empty. The fluid reaches about 5 mm behind the cord, but the back edge is 7 to 20 mm behind it. On screen the empty part shows as the skin's beige inside, so it reads as tissue. Typical therefore shows a thinner fluid band behind the cord at the opening than After decompression. | en.json typical note: "spinal fluid moves freely around them". EVIDENCE.md canal row: "roomier at C1 and the foramen magnum". | Let the fluid in Typical (and After decompression) reach the back edge of the canal from the opening down to C1. |
| 3 | Low | **New: in Typical, the fourth ventricle's outlet still doesn't quite meet the fluid in the midline cut.** The tonsils no longer overlap the fourth ventricle (0 mm³ in every view). But in Typical, 0.5 mm off the midline, the ventricle's lowest part ends about 7 mm behind the cord's front line, and the fluid behind the cerebellum starts at about 12 mm: a gap of 3 to 5 mm. It is 1 to 4 mm in Chiari I and 1 mm After decompression. On screen, Chiari I and After decompression look joined. Typical shows a thin pink strip between them. So the "open" view looks slightly less connected than the others. `check.mjs` measures this gap in 3D, anywhere within 3 mm of the midline (2.8 mm in Typical), so it passes. | EVIDENCE.md fluid pathway, Typical: "from the fourth ventricle outlet into the cisterna magna". Fourth ventricle card: "where spinal fluid passes through". | Let the fluid reach the outlet on the midline in Typical, as it already does After decompression. Measure the gap in the cut plane itself. |
| 4 | Low | **New: in Typical, the "Cerebellar tonsil" label points at cerebellum tissue.** The label point is (10, 15) mm. In the midline cut there, the cerebellum (vermis) fills the first 1.5 mm behind the cut, and the tonsil starts 1.6 mm behind it. In Typical the midline cut crosses the tonsil only as a sliver about 2.5 by 4 mm, 1 to 3 mm above the line. Both are the same colour, so a visitor won't notice. But `web.mjs` reports that every label points at its own structure. In Chiari I, With syrinx and After decompression, the tonsil label sits in the tonsil. | en.json tonsil card: "the model shows them at their lowest point, where MRI measures them". | Point the Typical tonsil label at the tonsil sliver near its tip, or accept it (same colour). Make the label check look at the cut face, not only the first surface. |
| 5 | Low | **Blind spots in the checks.** (a) `view-check.mjs` reads one pixel at each of 5 to 7 flow-mark spots per view. It cannot see findings 2 and 3. (b) Nothing checks the tonsil surface for folds (finding 1). (c) Chiari I still only checks that fluid is gone behind the cord, not what fills the space. (d) The outlet test measures in 3D, not in the cut plane (finding 3). (e) "Fluid inside bone or discs" still reports 35 to 56 points up to 2.4 mm deep. My two-direction test finds 1.8 mm³ in C3 to C5 and nothing else, so that number is noise. | (method) | Add the tests named in findings 1 and 3. Sample more screen pixels (for example, a short line behind the cord at the opening). |

## Status of the 9 earlier findings

1. **Explorer hid the fluid behind the cord in Typical: fixed.**
   - The skin is now drawn first among the see-through parts (`renderOrder` 999).
   - In my zoomed Side screenshot of Typical, a continuous blue band runs from the fluid behind the cerebellum, through the opening and down behind the cord.
   - `view-check.mjs` passes at all 24 points.
2. **Typical neck fluid collapsed onto the cord: fixed.**
   - Typical fluid, measured in 24 directions: at least 2.5 mm all round from 2 to 20 mm below the line.
   - From 30 to 90 mm below: 2.0 mm in front, 3.0 mm behind, 2.6 to 3.1 mm at the sides.
   - It is now the same as Chiari I and After decompression below C1.
   - Column 13.7 to 13.8 mm front to back from C2 down (PMC2899662, quoted in an earlier report: "13.73 ± 1.37 mm").
3. **Cerebellum showing through the back of the skull: fixed.**
   - The cerebellum and the occipital bone overlap by 0 mm³ (0.5 mm grid).
   - I traced rays from behind: no cerebellum or tonsil lies behind the last bone surface in Typical.
   - In Chiari I and After decompression, the only brain seen from behind is below the opening (between skull and C1) or in the bone window, as it should be.
   - The Back screenshots (default layers, and without skin) show no pink on the skull.
4. **After decompression, back rim of the opening left: fixed.**
   - Behind the opening, within 12 mm of the midline, from 12 mm below to 3 mm above the line, no bone is left. Typical has 565 to 1,750 bone points in each 2 mm strip there.
   - Bone resumes 12 to 14 mm from the midline, so about 24 to 25 mm of rim is gone (PMC11912941, quoted in an earlier report: "approximately 2.5 cm of the posterior margin of the foramen magnum was excised").
5. **Fourth ventricle sealed off on the midline: mostly fixed.**
   - The tonsils and the fourth ventricle overlap by 0 mm³ in every view.
   - The ventricle's lowest point is 6.9 mm above the line (check: 6.6 mm), the same in all views.
   - On screen the outlet meets the fluid in Chiari I and After decompression. In Typical a gap of 3 to 5 mm is left (new finding 3).
6. **The two tonsils read as one: not changed.**
   - From behind, the Chiari I tonsils are a single wedge on the midline.
   - The tonsil card discloses it ("They really sit just to either side of the midline").
   - New finding 1 is in the same place.
7. **Canal behind the cord half empty in Typical: not fixed, slightly worse.** 35% fluid now (was 43%). See finding 2.
8. **Patch edge problems: not changed.** The patch passes into the cerebellum by 16 mm³, as before. Fluid and patch overlap by 3.6 mm³. Neither shows clearly on screen.
9. **Check blind spots: partly fixed.**
   - Fixed: fluid all round the cord, an on-screen colour check, brain outside the skull, rim removal, and the tonsils against the fourth ventricle.
   - Still open: Chiari I fill, and the noisy bone measure. New gaps are in finding 5.

## Checked and OK

- **Automatic checks:** all four pass. `web.mjs` passes and reproduces the committed web files exactly. `view-check.mjs` passes.
- **Foramen magnum (McRae line):** 38.4 mm, basion (−19.0, 2.5) to opisthion (19.0, −2.8), in every view and in both web files. PMC9834072 controls (quoted in an earlier report): "36.23 ± 3.26 (30.2-46.5)".
- **Typical tonsils:** lowest point 1.2 mm above the line (phone file 1.3 mm), 0.4 to 1.0 mm from the midline. Rounded: 12.9 mm wide 3 mm above the tip. EVIDENCE.md: about 1 mm above.
- **Chiari I tonsils:**
  - 12.5 mm below the line, 0.1 mm from the midline, in both web files.
  - Peg-shaped: 7.2 mm wide 3 mm above the tip (56% of Typical).
  - PMC9834072 (quoted in an earlier report): "TH, mean ± SD (range) 0 12.4 ± 3.7 (5.0-25.4)".
- **After decompression, tonsils:**
  - 10.5 mm below the line, risen 2.0 mm.
  - PMC10549945 (quoted in an earlier report): "The cerebellar tonsillar position inferior to the McRae line decreased 2 mm 3–6 months after surgery".
- **No passing into each other** (0.5 mm grid, two ray directions):
  - The tonsils have 0 mm³ in the cord, the fourth ventricle, the occipital bone, C1 or C2, and at most 9 mm³ in the brainstem.
  - The fluid around the cerebellum has 0 mm³ in the cord, tonsils, brainstem or fourth ventricle.
  - The fluid around the cord has 0 mm³ in the tonsils, and 1.8 mm³ in C3 to C5.
  - Left as in the atlas, same colour, not visible in the cut: the tops of the tonsils inside the cerebellum (560 to 850 mm³), the cerebellum against the brainstem (1.0 ml), and the fourth ventricle against the cerebellum and brainstem (72 and 22 mm³). These are the same in every view.
- **Fluid pathway:**
  - Typical is open behind the cord through the opening (with finding 2).
  - Chiari I is plugged behind the cord from 2 to 14 mm below the line. There the fluid behind the cord is only 0.4 mm, and the midline space is 46% tonsil and 4% fluid. The front stays open (3.1 to 4.0 mm).
  - After decompression it is open again behind the cord (49% fluid).
- **Bone removed and patch:**
  - Window 30.0 mm across and 24.8 mm up from the opisthion.
  - C1 back arch gap 25.0 mm (from 12.5 mm on one side of the midline to 12.5 mm on the other).
  - Patch 34 mm across, from 19.6 mm below to 8.7 mm above the opening's centre.
  - PMC11912941 (quoted in an earlier report): "Approximately 2.5 cm of the middle part of the posterior arch of the atlas was removed, and the occipital bone was removed to form a 2.5× 3 cm bone window"; "The dura mater was sutured with an artificial dural patch."
- **Spinal cord:**
  - 8.7 to 8.8 mm front to back and 13.1 to 14.0 mm side to side from C3 down; 8.8 mm at C2 (check).
  - PMC8334714 (quoted in EVIDENCE.md): "from 8.8 mm x 12.4 mm at C2 to 8.7 mm x 14 mm at C4".
- **Syrinx:**
  - Runs from 46 to 98 mm below the opening, in the neck part, beaded.
  - Up to 4.5 by 6.5 mm.
  - It stays inside the cord: 2.1 to 3.1 mm of cord in front and behind, 3.5 to 4.8 mm at the sides.
  - Clearly visible in the cut (dark blue in the cream cord).
  - en.json and NINDS (quoted in an earlier report): fluid "builds up within the tissue of the spinal cord".
- **Measure tool:** in the screenshots, the dashed McRae line's end dots sit on the basion and opisthion. The bracket ends at the tonsil tip in Chiari I, With syrinx and After decompression.
- **Flow marks:** every flow mark in all four views sits inside fluid in the desktop file (my own test). Red "blocked" marks show at the opening only in Chiari I and With syrinx.
- **Labels:** every label point sits in its own structure, except the Typical tonsil (finding 4). The leader lines are long and cross the head, but each ends on its structure.
- **Explorer files:** each part is tagged with the right views. Desktop and phone agree within 0.1 mm on the tonsil tips.
- **Captions and privacy:** "Illustration, not a medical image · Fluid flow simplified" shows under the realistic view. The page made no requests to other sites during my screenshots. The normal build contains no realistic files.
- **Visible text:** the condition notes, part cards and screen-reader descriptions match what the model shows. The only exceptions are findings 2 and 3 for "spinal fluid moves freely around them".

## Overall verdict

I see **no High problems** this time. The three blockers from the last audit are fixed:
- the hidden fluid in Typical;
- the collapsed neck fluid;
- the brain showing through the skull.

Every number I measured matches EVIDENCE.md. That includes the tonsil heights (+1.2, −12.5, −10.5 mm), the 38.4 mm opening, the 30 by 25 mm window, the 25 mm C1 gap, and the cord and syrinx sizes.

One thing I would still fix before the realistic model goes public: **finding 1, the crumpled tonsil surface.**
- It is not a wrong measurement, but it is a drawing error on the one structure the site is about.
- It shows as hatching at the opening in the normal cut view, and as a torn band when the bone layer is off.
- The captions don't cover it, because it isn't a simplification.
- If it is fixed, or Matthew knowingly accepts it, I see nothing else that should block showing the model as a patient illustration.

Findings 2 to 5 are minor.

One more caveat: I could not re-open the sources this time (network settings). Matthew may want a source re-check once `pmc.ncbi.nlm.nih.gov` and `www.ninds.nih.gov` are allowed. Nothing in the model has changed in a way that depends on new wording from them.
