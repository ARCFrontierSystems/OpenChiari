# Progress log

Claude Code: add an entry after each working session (date, what was done, what's next, open questions). Newest first.
Matthew's preference: when a step is done, lay out what the next step will cover.

## 2026-11-04: Phase 3, step 2: Open model page, downloads and embed

- **Open model page:** the license box with Fig. 2 (Chiari I with syrinx), the embed builder, the downloads table and "How to credit it". All text word for word from COPY.md, with the "Accuracy checks" row (no reviewer).
- **Embed:** a new page, /embed/, for other sites to show in a frame.
  - It shows the 3D viewer with an optional condition switch and labels, and can start in Calm mode for that view only (the visitor's own setting isn't changed).
  - Its settings are after the # in the link, so they're never sent to a server.
  - It always shows the captions, "Not medical advice", the model credit and a link to the full Explorer ("Explore the full 3D model", from the approved Explain It text).
  - Without 3D support it shows the 2D figure.
  - The builder writes the code, for example `<iframe src="https://openchiari.org/embed/#v=c1&switch=1&labels=1" width="100%" height="640" ...>`. The mockup had height 560; 640 leaves room for the labels at full tap size.
- **Downloads** (made by `scripts/make-downloads.mjs`). Each is a zip with CREDIT.txt (the approved credit line) and LICENSE.md:
  - the web model (glTF, all four views, 1.1 MB);
  - the same model in Blender, one collection per view (8.0 MB);
  - the labeled figure set: 4 PNG images and a 4-page PDF, each page with the condition name, captions, credit and disclaimer (1.7 MB).
  - The full-detail builds (about 42 MB per view) are too big to offer; Cloudflare Pages allows 25 MB per file.
- **Small additions:**
  - a "Copied" message after "Copy embed code" (interface wording, not medical);
  - label rows in the 3D view are now spaced at least 46 px, so the 44 px label buttons no longer overlap (in the Explorer too).
- **Checks:** new tests cover the embed builder's code, the three downloads, and the embed following its settings while always showing the captions, credit and disclaimer and never saving Calm mode. Accessibility scans pass on both pages. 81 tests pass.
- **Next (step 3):** Explain It, the create page and the recipient view.

## 2026-11-04: Phase 3, step 1: About, Privacy and Support pages

- **Built:** About, Privacy and Support, for desktop and phone (Support uses the phone mockup's shorter wording). All text is word for word from COPY.md, laid out from the mockups. Each page has the shared header and the footer with the disclaimer and model credit.
- **Support** links go only to each organization's own pages (donate, registry, learn more), using the addresses in the mockup. A new test checks that every outside link on the page goes to one of the three organizations and that the page has no form.
- **About** uses the accuracy-checks wording ("They have not been reviewed by a medical professional"); the test checks it's there.
- **Placeholders kept, as COPY.md has them (for Matthew):**
  - About: "Last check: [date]".
  - Privacy: "Last updated [date]", "[analytics service]", "[host]" and "[Confirm this list against the chosen analytics service before launch.]".
  - Support: "[Before launch: confirm with each organization.]".
- **Links that don't go anywhere useful yet:**
  - "See the code" goes to the Impact page's open-source section, as in the mockup; Impact is still a stand-in until step 5.
  - hello@openchiari.org won't work until the domain exists.
- **Checks:** build and type check clean; accessibility scans pass on all three pages at both sizes, Calm mode off and on.
- **Next (step 2):** Open model page: downloads and the embed builder.

## 2026-11-04: Realistic model made public on the site (Matthew approved)

- **Matthew approved the realistic model for the public site** (CLAUDE.md rule 1a: opened sources, automatic measurements, three independent audits, MRI comparison, Matthew's approval).
- Every build now includes its two files (desktop 1.5 MB, phone 0.6 MB). The Explorer's Realistic button is on and loads them only when picked; the view falls back to Simple if loading fails.
- The site test now checks that the button works and the model loads, with its own labels and flow marks. The on-screen colour check passes on the normal build. 74 tests pass.
- **Not deployed:** publishing the live site needs Matthew's separate go-ahead.
- **Next:** Matthew's go-ahead to deploy, or the next build step (Phase 3: sharing and research).

## 2026-11-04: Realistic model: minor items and third audit (Matthew approved)

- **Third independent audit** (`docs/audits/2026-11-04-realistic-reaudit-3.md`): no High findings. Second-audit findings 1 to 4 fixed and 5 mostly fixed. One new Medium finding (crumpled tonsil surface) and a few Low ones. Verdict: nothing else blocks going public once the Medium one is fixed or accepted. The auditor could not open the source websites from this session (blocked by the network settings) and relied on earlier quotes.
- **Crumpled tonsil surface (Medium):** folded faces near the McRae line drop from about 15% (audit) to 0.1 to 0.3%.
  - The surface is rebuilt cleanly at the end and smoothed without shrinking.
  - Points are pushed out only when a ray count confirms they're inside: the brainstem's open lower edge had been fooling the surface-direction test.
  - New fold check.
- **Tonsils read as one (Low):** a shallow groove down the back of the joined tips (0.4 to 0.7 mm); new check.
- **Canal behind the cord at the opening (Low):** in Typical the fluid now reaches 96% of the way to the canal's back edge from the opening to the top of C1, without passing bone. It was 35 to 43%. New check.
- **Patch edges (Low):** the patch stays out of the cerebellum, and its lower end covers the whole gap in C1's arch. New checks.
- **Fourth ventricle outlet in the cut (Low):**
  - A 4 mm channel between the tonsils under the ventricle.
  - Found and fixed an older bug: the fluid space was never counted exactly on the midline, because one test ray slipped between the brain's halves.
  - The outlet is now 1.3 to 1.4 mm from the fluid in the midline cut, in every view. The check now measures in the cut.
- **Labels (Low):** every label point, and at least 3 of the 4 points around it, must show its own structure in the files the Explorer loads.
- **Next:** Matthew decides whether the realistic model goes public. Deploying needs a separate go-ahead.

## 2026-11-04: Realistic model: fixes from the second re-audit (findings 1 to 5, Matthew approved)

- **Second independent re-audit** (`docs/audits/2026-11-04-realistic-reaudit-2.md`): 5 of the 8 earlier findings fixed, 2 partly, 1 not; 2 new High and 3 new Medium findings; verdict "not yet public".
- **1. Fluid hidden on screen (High):** the see-through skin's solid inside was drawn over the fluid wherever no bone or brain lay behind. The skin is now drawn first. A new check (`model/realistic/view-check.mjs`) reads the actual screen colour wherever the model has fluid. Before the fix it found fluid covered in all four views; now all of it shows.
- **2. Typical neck fluid collapsed onto the cord (High):** the tube's clearance from the tonsils now uses distance only. The fluid is now at least 1.1 mm all the way round the cord in every view, and 13.8 mm front to back at C3. A new check measures it all the way round at every height, not only on the midline.
- **3. Cerebellum showing outside the skull (Medium):** points inside the bone now move inward, never outward. New check: none outside (0 points).
- **4. After surgery, back rim of the opening (Medium):** now removed across 25 mm, as in PMC11912941. New check: 0 rim points left, 32 in Typical.
- **5. Fourth ventricle sealed (Medium):** only the tonsils' lower ends slide to the midline. Higher up they keep their gap under the fourth ventricle, and the tonsils are kept out of it. Its outlet now opens into the fluid behind the cerebellum, 1.5 to 2.8 mm away. New checks for both.
- **Not changed (Low, from the audit):** the two tonsils read as one near the tip (covered by the tonsil card); some empty canal behind the cord at the opening (shows as tissue colour); small patch-edge overlaps.
- **Results:** all four views pass every check; web files and the on-screen check pass.
- **Next:** another fresh independent audit; then Matthew decides whether the realistic model goes public.

## 2026-11-04: Realistic model: labels and fluid flow (Matthew approved)

- **Labels** on the realistic model now point at its own structures (before, they used the drawn figure's positions). For each view, the build maps what the midline cut shows and points each label at the middle of its structure.
- **Fluid flow** now works on the realistic model:
  - arrows in the fluid in front of and behind the cord, and behind the cerebellum;
  - in Chiari I (and with syrinx) the arrows behind the cord barely move, and red marks show the passage plugged at the opening, as in the Simple model;
  - still in Calm mode and with reduced motion; arrow lines stay a steady thickness so the narrow ones are visible.
- **Checks:** the web-file check now also confirms that every label points at its own structure and every flow mark sits in the fluid, in the simplified files the Explorer loads.
- **Next:** the independent audit's report; then Matthew decides whether the realistic model goes public.

## 2026-11-04: Realistic model: re-audit fixes (all 8, Matthew approved)

- **Cord no longer looks painted blue (1):** the fluid around the cord is now a tube with the cord inside it, and the fluid around the cerebellum is kept 1 mm clear of the brain, so the cut view shows the cord, then fluid in front of and behind it.
- **Fluid column (2):** the tube is fitted to the vertebrae by rays: 14.0 mm front to back at C3 (EVIDENCE.md 13 to 15 mm), with almost no fluid inside the bone.
- **Chiari I pockets (3):** no stray fluid pockets below the line; the space behind the cord at the opening is plugged by the tonsils (0 points), and open in Typical and after surgery.
- **Tonsils on the midline (4):** each tonsil is slid (not squashed) so its lowest point is on the midline, then the two are joined into one surface. Tip 0.1 to 0.4 mm from the midline in every view, at the right heights (Typical 1.2 mm above, Chiari I 12.5 mm below, after surgery 10.5 mm below).
- **Fluid behind the patch (5):** none. The patch's outline is now a rounded rectangle that covers the whole bone window; before, its narrow top left a small uncovered gap.
- **Cord top (6):** tapers smoothly into the brainstem.
- **Overlaps (8):** tonsils kept out of the cord and brainstem (a last step moves any leftover point straight back); cerebellum kept 1.2 mm clear of bone.
- **New checks (7), so these can't slip through again:**
  - cord inside the fluid at 16 levels;
  - fluid kept out of the cord, tonsils and brainstem, and tonsils kept out of the fluid (counted by rays, which don't depend on the atlas's surface directions);
  - the patch covers the whole bone window;
  - the finished Explorer files: every view complete, tonsil tips match, and the fluid is never drawn over the tonsils on the midline.
- **Viewer:** the camera's depth range now hugs the model, so surfaces about 1 mm apart draw correctly even on phones with coarse depth buffers.
- **Results:** all four views pass every check; Explorer files rebuilt (desktop 1.5 MB, phone 0.6 MB); 74 site tests pass; type check clean.
- **Next:** one more fresh independent audit (`docs/audits/2026-11-04-realistic-reaudit-2.md`); then Matthew decides whether the realistic model goes public.

## 2026-11-04: Realistic model: audit fixes (Matthew approved)

- **Fluid through the opening** (High): the fluid around the neck cord is now built as one space with the fluid behind the brain, replacing the atlas's thin spinal covering.
  - About 14 mm front to back below C1 (EVIDENCE.md 13 to 15 mm), roomier just below the opening.
  - A thin layer wraps the cord all round, so the cord sits inside the fluid at every level checked.
  - Typical is now open all the way down.
- **Chiari I crowding:** the fluid space behind the cerebellum stays, narrowed by the tonsils, instead of leaving an empty hole. At the opening, the fluid behind the cord is blocked where the tonsils plug it; the space in front stays open.
- **Measure tool:** on the realistic model it uses that model's own McRae line (38.4 mm) and tonsil tips, saved in its file.
- **After surgery:** the re-formed fluid stays in front of the patch's real curved, oval shape.
- **Tonsils (Matthew chose option A):** their lower ends are drawn to the midline in every view, so the midline cut shows them at their lowest point, as the site says.
- **Clivus (Matthew chose option B):** EVIDENCE.md now says Chiari I's shorter clivus is not shown in either model.
- **Smaller fixes:**
  - the cerebellum pushed out of the occipital bone;
  - the fluid kept clear of the bone's inner surface;
  - the README's patch description corrected.
- **Checks tightened** (`check.mjs`):
  - tonsil tip on the midline;
  - tip shape measured around the tip;
  - fluid from behind the cerebellum down the neck;
  - the space behind the cerebellum not left empty;
  - passage behind the cord open (Typical, after surgery) or plugged (Chiari I);
  - cord inside the fluid at 16 levels;
  - fluid column 12 to 18 mm;
  - bone window measured along the bone;
  - the whole C1 gap.
- **Results:** all four views pass. Explorer files rebuilt (desktop 1.4 MB, phone 0.5 MB). 74 tests pass.
- **Next:** a fresh independent re-audit; then Matthew decides whether the realistic model can go public.

## 2026-11-04: Phase 2, step 5: realistic model in the Explorer (preview only)

- **Slimmed:** `model/realistic/web.mjs` turns the four realistic views into one file per detail level (desktop about 410,000 triangles, 1.4 MB; phone about 135,000, 0.5 MB).
- **In the Explorer:** the Realistic button loads the model on request into the same 3D view.
  - Phones get the lighter file. If loading fails, the view stays Simple.
  - Cut faces are each structure's inside painted flat in its color, so the midline view looks like the figure: head outline, skull, brain, tonsils, fluid, syrinx, removed bone.
  - Two fixes along the way: a color-conversion step (cut faces were too dark) and a single-pass setting (the see-through skin's inside wasn't painted).
- **Not public:** the files and the button are only in a preview build (`PUBLIC_REALISTIC_PREVIEW=1`). The normal build leaves both out, and a new test checks that. 74 tests pass.
- **Not yet on the realistic model:** flow arrows; labels point to the Simple figure's positions (close, since the Simple figure now follows the same atlas). Selecting a structure highlights it but doesn't outline it on the cut face.
- **Next:** the accuracy checks for the realistic views (CLAUDE.md rule 1a): an independent audit and the MRI comparison, then Matthew's approval before it can be public.

## 2026-11-04: Phase 2: realistic Chiari I with syrinx; all four views done

- **Built:** `extract.py ... syrinx`.
  - Chiari I, plus a syrinx: a beaded, spindle-shaped cavity in the centre of the neck cord.
  - Position: from about C3 (46 mm below the opening) to the bottom of the view.
  - Size: at most 54% of the cord's width, inside the cord all the way. Same position and size as the Simple model.
- **Cord smoothed:** its centre line used to zigzag (it followed the uneven points of the atlas's spinal covering). It now uses the middle of the covering's outline, smoothed. Cord at C2: 8.5 mm.
- **Automatic checks:** `check.mjs --condition syrinx` covers position, staying inside the cord and size. All four realistic views (Typical, Chiari I, with syrinx, after decompression) rebuilt and passing.
- **Known, for step 5:**
  - The piece of medulla cut off at the opening looks boxy where it joins the cord.
  - Cut faces look hollow in a plain viewer.
  - The fluid surface is a little lumpy.
  - Each view is about 1 million triangles.
- **Not public:** stays hidden until the independent audit, the MRI comparison and Matthew's approval.
- **Next (step 5):** slim each view for desktop and phones, show the realistic model in the Explorer behind the Realistic switch (loading on demand, falling back to Simple), with filled cut faces. Then the accuracy checks for Matthew's approval.

## 2026-11-04: Phase 2: realistic After decompression

- **Built:** `extract.py ... surgery`.
  - **Tonsils:** the Chiari I tonsils, risen 2.0 mm (EVIDENCE.md: about 2 mm on average), still 10.4 mm below the line.
  - **Bone:** the bone is cut exactly along a window about 30 mm across and 25 mm up the back of the skull (EVIDENCE.md: about 3 x 2.5 cm), and the middle 25 mm of C1's back arch is removed. Both are shown as a faint red outline.
  - **Dural patch:** a thin curved oval membrane, bulging slightly into where the bone was (PMC10549945: "The dura expanded posteriorly into the craniectomy").
  - **Fluid:** the re-formed space behind the cerebellum, joined to the fluid behind the cord.
- **Automatic checks** (`check.mjs --condition surgery`), all passing:
  - tonsils still below the line, risen 2.0 mm from Chiari I;
  - removed bone about 30 by 30 mm, measured including its thickness;
  - C1 arch middle gone;
  - patch present;
  - fluid one piece, reaching 19.8 mm below the line behind the cord.
- **Not public:** stays hidden until the accuracy checks and Matthew's approval.
- **Next:** the syrinx (Chiari I with a fluid-filled cavity in the neck part of the cord), then step 5 (slimming for phones and showing the model in the Explorer behind the Realistic switch).

## 2026-11-04: Phase 2, step 4: realistic Chiari I

- **Built:** `extract.py ... chiari` makes the Chiari I model from the same atlas.
  - The lower part of each tonsil is stretched down to about 12 mm below the McRae line (EVIDENCE.md: the model uses about 12 mm, the average in a study of 160 people) and narrowed into a peg with a blunt tip.
  - The tonsils are drawn toward the midline so they pass through the opening. Where they would touch bone or the cord they are pushed back out, so they look slightly squeezed, as in Chiari I.
  - The fluid space behind them at the opening is crowded out (EVIDENCE.md: often crowded or narrowed), as in the Simple model.
- **Automatic checks** (`model/realistic/check.mjs`) now cover both conditions. Results:
  - Chiari I tonsil tip 12.4 mm below the line (10 to 14).
  - Tip 7.2 mm wide 3 mm above its lowest point, against 14.0 mm in Typical: pointed, but not a spike.
  - Tonsils clear of bone and the spinal cord.
  - No fluid behind the brainstem near the opening.
  - Typical still open there; everything else unchanged. Both pass.
- **Unchanged from Typical:** skull, brainstem, fourth ventricle (EVIDENCE.md: normal position in Chiari I). The smaller posterior fossa, shorter clivus and steeper tentorium are not shown (EVIDENCE.md notes the tentorium claim needs a Chiari I source first).
- **Not public:** stays hidden until the independent audit, MRI comparison and Matthew's approval (CLAUDE.md rule 1a).
- **Next:** Matthew reviews Chiari I. Then After decompression (bone removed, C1 arch, dural patch, re-formed fluid space, tonsils risen about 2 mm), the syrinx, and step 5 (slimming for phones and showing it in the Explorer behind the Realistic switch).

## 2026-11-04: Phase 2, step 3: realistic Typical model checked against EVIDENCE.md

- **Automatic measurements** for the realistic model (`npm run model:check:realistic -- <file>`, in `model/realistic/check.mjs`). All pass:
  - Opening at the base of the skull (McRae line): 38.4 mm, measured from the bone's own edge. That's the atlas's value: within normal variation (36.2 ± 3.3 mm in controls) though above the 33 to 36 mm typical range. Recorded in EVIDENCE.md and left as is.
  - Tonsil tip: 0.9 mm above the line (EVIDENCE.md: about 1 mm). Matthew agreed to the recommendation to match the Simple model; the lower ends of the atlas tonsils were stretched down 1.8 mm.
  - Clivus: 43.6 mm (39 to 47).
  - Spinal cord at C2: 8.3 mm (about 9; now reaches the measured size within 6 mm of the medulla).
  - Dens: tip 10 mm below the line, in front of the cord.
  - Fourth ventricle: 6.6 mm above the line.
  - Fluid behind and around the cerebellum: one connected space.
- **Fluid spots fixed:** the fluid is now computed around the brain treated as one solid mass (the gaps between the atlas's separate cerebellum pieces no longer count), below the tentorium, and only the connected space is kept. It reaches from in front of the brainstem, around the cerebellum, to the opening.
- **Known, for later steps:** cut faces look hollow in a plain viewer (filled by the Explorer's viewer work, step 5); the fluid surface is a little lumpy; the model is still about 1 million triangles (slimmed in step 5).
- **Not public:** the Realistic switch stays off. Before it can be shown, the views need the independent audit and MRI comparison (CLAUDE.md rule 1a) and Matthew's approval.
- **Next (step 4):** Chiari I: tonsils lowered to about 12 mm below the line and made pointed, fluid behind them crowded, checked automatically; then stop for review.

## 2026-11-04: Text re-audit items applied (Matthew approved)

- Printed visit-prep sheet: the figure caption now carries the required tonsil note ("Chiari I. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image."); added to COPY.md.
- "Usually the back of the first vertebra" changed to "often" (After decompression note and the Bone removed card).
- Symptom list: "Trouble swallowing or speaking" (was "voice changes").
- How it's found: "A doctor looks at the scan together with your symptoms."
- The four screen-reader descriptions of the figure are now in COPY.md; the Chiari I one says "often crowd".
- EVIDENCE.md: corrected the MedlinePlus citation (it is the syringomyelia page) and added opened sources for the tonsil shape, the midline simplification and the heartbeat pulse.
- The Explorer's part 11 cards were missing from COPY.md; now added.
- Spanish Home note updated to list "How it's found" among the lines to translate. 73 tests pass.

## 2026-11-04: Real head for the Simple figure and 3D model

- **Matthew's feedback:** the smooth head looked like it was wearing a helmet. He asked for it to be based on a real model.
- **Cause:** the Simple skull and brain were drawn about 3 cm too tall above the base of the skull (top of skull 177 mm vs 146 mm in a real head), with no face bones. No real head could fit around it.
- **Done (Matthew approved):** the head, skull, skull base, clivus, brain, corpus callosum, ventricles, thalamus, brainstem and tentorium are now traced from midline cross-sections of the Z-Anatomy atlas, the open model already credited. The 3D skin is Z-Anatomy's real head surface (`model/simple/reference/head-skin.glb`), shown see-through in the Explorer.
- **Unchanged:** the McRae line, tonsils, cord, canal, fluid in the neck and vertebrae. Every `model:check` measurement passes, plus a new clivus check: 43.7 mm, within the published 39 to 47 mm. This fixes the re-audit's skull-height and clivus findings.
- **Figure frame:** now 704 by 512 units (was 720 by 578), with labels and the Explorer cut face updated. All 73 tests pass.
- **Next:** Matthew reviews the new head; then his decisions on the re-audit text items, and Phase 2 step 3.

## 2026-11-04: Smooth, plain 3D skin (option 1)

- **Matthew's question:** why does the 3D face still have bumps, and do we need the skin? The bumps came from building the face out of about twenty blended rounded shapes; their joins show as lumps when turned. Without skin, the Simple model's skull (braincase only, no face bones) looks like a bare dome, so the skin stays.
- **Done (Matthew chose option 1):** the 3D skin is now built from the approved 2D head outline, rounded off to the sides. Near the middle of the face it follows the exact profile, so the side view matches the figure. Toward the sides it follows a smoothed face outline, so the nose, lips and chin stay narrow. The surface has no lumps, ridges or creases when turned. It is a plain face with no modelled cheeks, eyes or ears.
- **In the Explorer the skin's surface is always see-through** (35%), and it can still be switched off. Its midline cut face stays solid, like the figure.
- The 2D figure is unchanged. `model:check` passes; 73 tests pass.
- A natural face comes with the realistic model (Z-Anatomy's own skin), in Phase 2.

## 2026-11-04: More natural head (2D and Simple 3D); re-audit results

- **Matthew's request:** the head still looked a little off; make it a more natural head shape.
- **Done:** re-sculpted the face, jaw and neck (`model/simple/build.mjs`) against standard adult profile proportions. The 2D outline is traced from the same sculpt, so both match. Changes:
  - forehead more upright, with a soft brow and a dip at the bridge of the nose;
  - a longer nose with a defined tip and base;
  - lips with a natural fold below them, and a defined chin;
  - a jawline without the round knob;
  - a soft slope from chin to throat instead of a right angle;
  - a smoother back of the neck;
  - ears tilted back slightly.
  The palate line moved down with the mouth (it had ended up at nose height). Inner anatomy is unchanged: `model:check` passes, and the skin covers the skull everywhere. `HEAD_ONLY=1 node model/simple/build.mjs` gives a 5-second preview of the outline.
- **Fixes:**
  - The 3D Measure bracket after surgery still used the old tonsil tip (an audit finding); fixed.
  - Both brackets now start exactly on the dashed line.
  - Turning off fluid flow now stops the animation at once (this fixed an intermittent test). 73 tests pass.
- **Re-audits** (`docs/audits/2026-11-04-text-reaudit.md`, `docs/audits/2026-11-04-3d-reaudit.md`): no High findings. The findings that change medical text or figure shapes wait for Matthew.
- **Next:** Matthew's decisions on the re-audit findings; then Phase 2 step 3.

## 2026-11-04: Audit fixes applied (Matthew approved all)

- **Sources opened:** NINDS, Cleveland Clinic (Chiari page and six anatomy pages), MedlinePlus and nine PubMed Central articles were opened and read. EVIDENCE.md marks each one "opened". Still blocked here: StatPearls, Mayo Clinic, Radiopaedia, PubMed abstracts, Frontiers, AJNR, QxMD. Nothing on the site rests on those alone.
- **Text (13 items):**
  - Phone surgery note keeps all its caveats.
  - Phone and Calm captions carry the midline note and "Illustration, not a medical image".
  - Chiari I note now cites one opened study: 160 people, average about 12 mm, range 5 to 25 mm.
  - Measurement myth: "How far the tonsils extend doesn't always match how someone feels."
  - Symptoms: "Blurry or double vision" moved into the main list; scoliosis added.
  - Also updated: the Explain It line, the Calm intro, the phone Chiari note, two visit-prep questions and the footer.
  - The Spanish Home is marked as needing a matching translation.
- **3D model and figures (11 items):**
  - The fluid path is continuous in Typical and after surgery; in Chiari I the tonsil fills it.
  - Cord is 9.2 mm and the canal 14.8 mm, with the back of each vertebra closing the canal.
  - Vertebral bodies are 15 mm tall; C5 added.
  - Tonsils rise 1.9 mm after surgery (was 3.8).
  - Bone removed is about 30 by 25 mm, and 25 mm of the C1 arch.
  - Part 11 (Syrinx, Bone removed) added to the Explorer.
  - A note that the dashed line shows where the opening's edges were.
  - The realistic model's cord is now 8.8 by 12.4 mm.
- **Checks:** `model:check` adds cord, canal and fluid-continuity checks; all pass. 73 tests pass.
- **Not fixed (needs Matthew):** the clivus. The Simple figure's skull base and brainstem are drawn taller than real, so the clivus can't be shortened without redrawing that whole region. Marked "not to scale in the Simple model".
- **Next:** re-run both independent audits with the sources open. Then Phase 2 step 3.

## 2026-11-04: No medical reviewer; accuracy checks instead

- **Matthew's decision:** the site will not use a medical reviewer. Updated throughout: CLAUDE.md (new rule 1a "Accuracy checks", Phase 2 description, the "Don't" list, open items), SPEC.md (pipeline, risks, Impact), EVIDENCE.md (open items), COPY.md (honest wording for About, Open model and Impact: "not reviewed by a medical professional"; old wording kept in comments), `model/realistic/README.md`, code comments. Earlier progress entries are left as history.
- **Accuracy checks (rule 1a):** opened sources; automatic measurements; independent audit by a fresh agent; MRI comparison; Matthew approves. Reports go in `docs/audits/`.
- **Done so far:**
  - Text audit: 82 medical sentences, 13 flagged (`docs/audits/2026-11-04-text-audit.md`). **Waiting for Matthew's decisions;** nothing changed.
  - 3D audit: running.
  - New automatic checks: tonsil tip shape, dens position, fourth ventricle position, size of removed bone. The removed bone was 44 mm long (too big); fixed to 34 by 30 mm (EVIDENCE.md: about 3x3 to 3x4 cm).
- **Blocked:** NINDS, StatPearls/PubMed Central, Mayo Clinic, Cleveland Clinic, MedlinePlus and Radiopaedia can't be opened from this environment (network settings). Matthew can allow them under the environment's Allowed domains.
- **MRI comparison:** OpenNeuro's public scans (download server) and the MNI152 average head are reachable here; no public Chiari MRI collection is known. Plan in the next entry.

## 2026-11-04: Phase 2, step 2: extraction (Typical anatomy, first version)

- **Script:** `model/realistic/extract.py` (about 2 minutes per run). It picks structures by the atlas's own family tree (e.g. everything under "Cerebellum"), groups them into the site's structures and layers with the DESIGN.md palette, and saves glTF in the same model space as the Simple model (mm, origin at the middle of the foramen magnum).
- **Groups:** skin, skull, occipital bone, C1, C2, C3 to C5, discs, tentorium, cerebrum, corpus callosum, diencephalon, brainstem, cerebellum, tonsils, spinal cord, spinal dura (fluid), ventricles, fourth ventricle, and the fluid space in the posterior fossa.
- **Built where the atlas has nothing:**
  - Spinal cord: follows the middle of the spinal dura, starting at the size of the medulla's lower end (13.7 by 15.1 mm), narrowing slightly down the neck.
  - Fluid space around the brain in the posterior fossa: computed as the space inside the skull that isn't brain or bone (about 28 ml). Because it is computed, lowering the tonsils for Chiari I will shrink it automatically.
  - Skin: the atlas's 66 face, head and neck surface pieces joined and smoothed; the eye and mouth openings closed with gently rounded fills (calm, closed-eye look).
- **Brainstem cut at the McRae line:** the atlas's medulla runs about 19 mm into the spinal canal. The approved text says the foramen magnum is "where the brainstem becomes the spinal cord", so the part below the line is now spinal cord.
- **Measured (unchanged from the atlas):** tonsil tip 2.8 mm above the McRae line; McRae line 38.5 mm (rough method, refined in step 3).
- **Not done yet, known:**
  - A few blue spots remain at the centre of the cerebellum (gaps between the atlas's vermis pieces); to clean up in step 3, since it is the region that matters most for Chiari.
  - The model is about 1.1 million triangles (35 MB); slimming to desktop and phone sizes is step 5.
  - Several surfaces are not fully closed (cerebrum, skull, brainstem), which matters for how cut faces are filled in the Explorer; handled with the viewer work in step 5.
- **Not used by the site yet**, and not shown to visitors (the "Realistic" switch stays off until medical review).

**Next: step 3, Typical anatomy checked against EVIDENCE.md.**
- Refine the foramen magnum measurement (basion and opisthion found on the bone's edge, not the rough midline gap) and add the realistic model to the automatic measurement check.
- Clean up the fluid spots at the centre of the cerebellum.
- Matthew decides: keep the atlas's tonsils at 2.8 mm above the line (within the normal range in EVIDENCE.md) or move them to about 1 mm above.
- Then stop for review, before Chiari I.

## 2026-11-04: Phase 2, step 1: feasibility check of the Z-Anatomy atlas

Matthew said "Proceed" after the Phase 1 review page; taken as the go-ahead for Phase 2. The five open Phase 1 decisions stay open (nothing changed for them).

- **Tools work here:** Blender 5.2.3 runs as a Python package (`bpy`); the Z-Anatomy atlas downloads from GitHub. (blender.org and the BodyParts3D site are blocked by this environment's network settings, but aren't needed.)
- **License confirmed:** CC BY-SA 4.0, attributing Z-Anatomy and BodyParts3D, matching LICENSE-MODEL.md and the site credit.
- **Safety:** the atlas contains a script; it's always opened with scripts turned off, and Blender confirms it skipped it.
- **What the atlas has:** every skull bone, the cerebellum in lobules with **both cerebellar tonsils as separate surfaces**, brainstem, C1 to C4 and discs, spinal dura, ventricles, tentorium, falx. **Missing:** a whole spinal cord, the fluid spaces around the brain, and a usable head skin.
- **Measured as it comes:** tonsil tip 2.8 mm above the McRae line (EVIDENCE.md: typical about 1 mm above; normal roughly 8 mm above to 5 mm below). Foramen magnum about 38 mm (EVIDENCE.md: 33 to 36 mm) by a rough method, to refine.
- **First look:** head and upper neck exported and viewed in Three.js (screenshots sent to Matthew). Scripts and notes in `model/realistic/`.
- **Size:** the first-look export is 8.8 MB uncompressed (249 surfaces); the web versions will need heavy slimming, especially for phones.

**Phase 2 plan (each step ends with screenshots and a stop):**
1. Feasibility check. *Done (this entry).*
2. **Extraction pipeline:** a script that picks the head and upper neck structures, groups them into the site's 10 structures and layers (for example, the cerebellar lobules into "Cerebellum"), builds the missing spinal cord inside the atlas's spinal dura, builds the fluid spaces (spinal fluid around the cord, cisterna magna behind the cerebellum), and colours everything with the DESIGN.md anatomy palette. Decide the skin: the atlas's coarse surface regions, or the plain head from Phase 1 fitted around the real skull.
3. **Typical anatomy checked against EVIDENCE.md:** refine the foramen magnum measurement; Matthew decides whether to keep the atlas's tonsil position (2.8 mm above, within the normal range) or move it to about 1 mm above.
4. **Chiari I alone:** a script reshapes the tonsils (pointed, peg-like) and lowers their tips about 12 mm below the McRae line, crowds the cisterna magna, shortens the clivus a few millimetres and steepens the tentorium (EVIDENCE.md ranges). The automatic measurement check covers it. Render the views a medical reviewer needs (midline, three-quarter, below). **Stop for Matthew and the medical reviewer.** If scripted reshaping doesn't look convincing, say so: a freelance medical 3D artist may be needed.
5. After review: Typical, Chiari I with syrinx, After decompression; desktop and phone versions; built into the Explorer behind the "Realistic" switch, which stays off for visitors until the medical review is done.

## 2026-11-04: Phase 1, step 10: wrap-up — Phase 1 complete, awaiting Matthew's review

- **All checks pass**, from a clean install and on GitHub: type check, 3D model vs EVIDENCE.md, build (13 pages), 72 automated tests (including accessibility on every page at desktop and phone width with Calm mode on and off), and Lighthouse (Home 100/100/100/100; Explorer accessibility, best practices and SEO 100, speed 67 for the reason explained in step 8).
- **Review page** with screenshots of everything in Phase 1, the check results and the open decisions: https://claude.ai/artifact/2ETBYn57vnFUfoRQLmM3oW (private to Matthew).
- **Phase 1 contains:** Home (desktop, phone, Calm mode); 3D Explorer with the Simple model in all four conditions and all viewer tools (condition switch, layers, cut-away, structure list and info cards, tap to identify, labels, fluid flow, Measure, camera presets, keyboard control, screen reader descriptions); Doctor visit prep with the one-page printed sheet.
- **Nothing deployed.**

**Open decisions for Matthew** (also on the review page):
1. Show the measured distance next to the bracket? Proposed: "In this model, the tonsil tip sits about 12 mm below the line." (Typical: "about 1 mm above the line"; After decompression: "about 9 mm below the line, about 4 mm higher than before surgery".)
2. Add the mockup's example text in the notes box ("For example: when your symptoms started, what makes them worse")? Not in COPY.md.
3. Record the Simple model's side-to-side widths in EVIDENCE.md, with sources, for approval?
4. Publish a private preview on Cloudflare Pages to test on real phones (iPhone and Android)?
5. Open a pull request to merge Phase 1 into the main branch?

**Next: Phase 2 (realistic model from Z-Anatomy)**, once Phase 1 is reviewed: extract the head and upper neck, build Chiari I alone first to the EVIDENCE.md numbers, render its views for medical review, and stop. A medical reviewer should also look at the Simple model's four views before then.

## 2026-11-04: Phase 1, step 9: Doctor visit prep

- **Page** `/prep/` (`src/pages/prep.astro`), from the `Prep`, `PrepPhone` and `PrepSheet` mockups. All 37 text items checked word for word against COPY.md.
  - Desktop: the five question groups with checkboxes (same 6 ticked to start as in the mockup), "Add your own question" (Add button or Enter), "Things I want to mention", and a live "Your sheet" preview with the count, Print sheet, Save as PDF, and "Include a small diagram of Chiari".
  - Phone: the shorter question wording from PrepPhone; the first two groups open and the rest collapsed with their counts ("Tests and monitoring · 2"); a bar fixed to the bottom of the screen with "[N] questions selected", Preview and print, and Save as PDF. The phone also gets the notes field and diagram option (the phone mockup didn't show them).
- **Printed sheet:** title, "Chiari malformation · Date · Doctor" line, the small diagram (Chiari I, with the "Illustration, not a medical image" caption), numbered questions with answer space, your notes plus two lines, and "Made with Open Chiari · openchiari.org · Not medical advice". The answer space shrinks as the list grows, so it stays on one page: checked with all 13 questions on both Letter and A4.
- **Print and Save as PDF** both open the browser's print window, which shows a preview and offers "Save as PDF" (no extra service or library).
- **Privacy:** nothing is stored and nothing is sent. No storage, no cookies, no network requests, no form submission (checked by a test that types and ticks things). The visitor's own text is always treated as plain text.
- **New wording (non-medical, grammar only):** singular forms "Your sheet · 1 question" and "1 question selected".
- **Left out, needs Matthew:** the mockup's example text inside the notes box, "For example: when your symptoms started, what makes them worse". It isn't in COPY.md. Add it?
- **Checks:** 72 tests pass (accessibility on the real prep page at both sizes and both Calm settings, sheet updates, one-page printing, privacy).

**Next: step 10, Phase 1 wrap-up.**
- Run every check (type check, model check, 72+ tests, Lighthouse) and confirm GitHub is green.
- Full set of screenshots of everything in Phase 1 (Home, Calm mode, Explorer in all four conditions and its tools, Doctor visit prep and the printed sheet) on desktop and phone, in one review page.
- Tidy the open questions into one list for Matthew (measurement wording, notes example text, Simple model widths for EVIDENCE.md, real-phone testing).
- Nothing is deployed: a preview link needs Matthew's go-ahead.

## 2026-11-04: Phase 1, step 8: phone check

Measured on a simulated mid-range phone (Chrome with a 4x slower processor; "slow 4G" for load times). This machine has no graphics chip, so real frame rates can't be measured here; the workload per frame is reported instead.

| | Before | After |
| --- | --- | --- |
| 3D model download (compressed) | 628 KB | 414 KB |
| 3D code download (compressed) | 166 KB | 166 KB |
| Triangles drawn per frame | 166,000 | 117,000 |
| Draw calls per frame | 49 | 49 |
| 3D view ready on slow 4G | 7.7 s | 6.3 s |
| Flat figure on screen (Lighthouse, mobile) | 0.9 s | 0.9 s |

- **Model slimmed** (`model/simple/build.mjs`): simplified further and stored more compactly. Close-up views checked; all EVIDENCE.md numbers unchanged (`npm run model:check`).
- **Smoother loading:** the model is unpacked on a background thread, its parts are set up a few at a time, and graphics programs are prepared in the background where the phone supports it, so the page stays responsive while 3D loads. The flat figure shows first (0.9 s) and the 3D view replaces it when ready.
- **Measure marks no longer show through a solid, uncut head** (they did after step 7). They show when the midline is exposed or the skin is faded or off.
- **Cosmetic:** the skull's thickness change is now gradual (softer shading line at the back of the skull). Labels for hidden layers no longer leave gaps.
- **Touch:** new automated test for pinch to zoom and two-finger move on a phone; tap to identify, the Layers panel and the parts list were already tested.
- **Lighthouse (mobile) now runs on every update** (`npm run lighthouse`, also on GitHub):

| Page | Speed | Accessibility | Best practices | SEO | Largest paint |
| --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 100 | 0.9 s |
| 3D Explorer | 67 | 100 | 100 | 100 | 0.9 s |

  Home must stay at 90+ for speed. The Explorer's speed score is reported but not enforced: on machines without a graphics chip, preparing the 3D graphics takes about 1.6 s of processor time (measured), which Lighthouse counts as "blocking". On a phone with a graphics chip this is a small fraction of that. Everything visitors read and tap (figure, text, controls) is on screen at 0.9 s.

- **Still to verify by a person:** open the Explorer on a real mid-range phone (Android and iPhone) once the preview is deployed, to confirm smoothness while turning and with fluid flow. If it stutters, the next lever is a lighter phone version of the model (fewer triangles for skin and skull).

**Next: step 9, Doctor visit prep.**
- Desktop page (`Prep` mockup): the grouped questions from COPY.md with checkboxes, "Add your own question", a notes field ("Things I want to mention"), the live sheet preview with its question count, Print sheet and Save as PDF, and "Include a small diagram of Chiari".
- Phone page (`PrepPhone`): collapsible groups with counts, a sticky bar with "[N] questions selected", Preview and print, Save as PDF.
- Printed sheet (`PrepSheet`): one page, space for answers under each question, date and doctor lines, the optional small diagram, and "Made with Open Chiari · openchiari.org · Not medical advice".
- Nothing is stored or sent: everything stays in the page (checked by a test).
- Stop for Matthew's review.

## 2026-11-04: Phase 1, step 7: fluid flow and Measure in 3D

- **Fluid flow** is now part of the 3D scene: blue chevrons in the spinal fluid spaces, at the figure's positions, pulse down and back with each heartbeat (about 72 beats a minute), fading slightly with the pulse.
  - Typical and After decompression: flow moves freely, including in the fluid space behind the cerebellum.
  - Chiari I and with syrinx: the column behind the tonsils barely moves, and the red restricted-flow marks sit at the skull opening, as in the figure. The on-screen text keeps the EVIDENCE.md wording ("in many people").
  - No motion in Calm mode or when the system asks for reduced motion: the chevrons stay still. The animation only runs while Fluid flow is on, the spinal fluid layer is on, and the view is on screen; capped at about 30 frames a second to save battery.
  - "Fluid flow simplified" stays on screen.
- **Measure** is now part of the 3D scene too: the dashed McRae line with its end dots (basion and opisthion) and the blue bracket down to the lowest tonsil tip (Chiari views and after decompression). It's drawn on top of the model, so it stays visible when the model is turned. Nothing changed in the numbers (`npm run model:check` still passes).
- The midline cut face no longer paints its own flow and measure marks (the 3D ones replace them); the 2D fallback figure still has them.
- **Checks:** 69 tests pass, including flow animating by default and stopping in Calm mode, with reduced motion, and when turned off.

**Open question for Matthew:** a number next to the bracket would need new medical text. Proposed wording, for approval: "In this model, the tonsil tip sits about 12 mm below the line" (Chiari I), "about 1 mm above the line" (Typical) and "about 9 mm below the line, about 4 mm higher than before surgery" (After decompression). Each matches `npm run model:check` and EVIDENCE.md. Not added until approved.

**Next: step 8, phone check.**
- Measure how the Explorer runs on a mid-range phone profile: load time, download size (about 810 KB compressed for the 3D view now), frame rate while turning and with fluid flow, and memory.
- Slim the model if needed (stronger simplification, especially the two skull versions) and keep the 2D figure fallback fast.
- Check touch: pinch to zoom, two-finger move, tap to identify, the Layers panel and parts list; smooth the small cosmetic items noted earlier (skull shading line, temple line) if time allows.
- Add Lighthouse to the automatic checks for the Home and Explorer pages.
- Stop for Matthew's review.

## 2026-11-04: Phase 1, step 6: viewer tools

- **Camera buttons:** Side, Back, Below, Front and Reset (top right of the view on desktop; in the Layers panel on phones). The camera glides to each view, or jumps in Calm mode. The current view is shown as pressed; turning the model yourself switches to "Turned view".
- **Tap to identify:** tapping or clicking a structure in the model selects it, both on the outside of the model and on a cut face. It picks the innermost structure (e.g. the tonsil, not the cerebellum around it), and looks through the faded skin. On phones it opens the parts list so the info card shows. Clicking the skull only selects "Foramen magnum" near the opening.
- **Highlight:** the selected structure glows in 3D and gets a blue outline on the midline cut face; its label is highlighted too.
- **Labels in 3D:** a numbered column beside the model with lines to each structure, like the figure. They follow the model as it turns; clicking a label selects that structure. Labels hide with their layer. When labels are on, the model shifts and zooms slightly so the column doesn't cover it. Desktop only, as in the mockups.
- **Keyboard:** the 3D view can be focused (visible outline). Arrow keys turn, Shift+arrows move, + and - zoom, 1 to 4 pick Side, Back, Below, Front, 0 resets. Screen readers get these instructions, and a description of the current view (condition, direction, cut), read out after changes.
- **New text (non-medical UI only):** "Reset camera", view names ("Side view", "Back view", "View from below", "Front view", "Turned view"), cut names ("Whole model", "Cut at the midline", ...), and the keyboard instructions. Camera button names are from COPY.md.
- **Checks:** 67 tests pass, including labels, tapping the brainstem on the cut face, camera buttons and keyboard.

**Next: step 7, fluid flow and Measure in 3D.**
- Fluid flow: a gentle pulse along the spinal fluid spaces, timed to a heartbeat (about once a second), with the restricted-flow marks in Chiari views. Labeled "Fluid flow simplified" (already on screen). No motion in Calm mode or with reduced motion: static arrows instead.
- Measure in 3D: the McRae line from basion to opisthion and the bracket from the line to the lowest tonsil tip, drawn in the model (not only on the midline cut face), with the measured distance from the model.
- Both stay accurate to EVIDENCE.md (flow wording "in many people, not all"; numbers from the model check).
- Stop for Matthew's review.

## 2026-11-04: Phase 1, step 5: Simple model, Chiari I with syrinx and After decompression

- **Chiari I with syrinx:** the beaded fluid cavity from the figure, in the center of the neck cord (5 mm wide inside the 12 mm cord), below the skull opening. It runs past the bottom of the view (50 mm visible), consistent with EVIDENCE.md's "about 5 vertebrae long on average". It's inside the cord, so it shows in the cut-away.
- **After decompression** (all shapes from the figure):
  - Skull with bone removed at the back of the foramen magnum: about 31 mm along the skull from the opisthion and 30 mm across (EVIDENCE.md: about 3x3 to 3x4 cm; exact size not stated on the site).
  - C1 with the middle 30 mm of its back arch removed.
  - The removed bone shown as a faint red "ghost", like the figure's red dashed outline.
  - The re-formed fluid space behind the cerebellum, and the dural patch (semi-transparent, like a membrane).
  - Tonsils partly risen.
- **Measured in the 3D file** (`npm run model:check`, on GitHub too):
  - After decompression: tonsil tip 8.6 mm below the McRae line, risen 3.8 mm from Chiari I (EVIDENCE.md: rise only partly, about 4 mm on average; may stay below).
  - Syrinx inside the cord and below the skull opening.
  - Earlier numbers unchanged: foramen magnum 35.3 mm; typical 0.9 mm above; Chiari I 12.4 mm below.
- **Size:** the model file is now about 645 KB compressed (was 444 KB), mainly because the skull has a second, after-surgery version. To check on phones in step 8.
- **Checks:** 66 tests pass, including the new conditions in 3D.
- **Small known item:** a faint rectangular shading line on the back of the skull, where the bone thickness changes. Cosmetic; can be smoothed in step 8.

**Next: step 6, viewer tools.**
- Camera buttons: Side, Back, Below, Front and Reset (desktop toolbar and phone Layers panel).
- Tapping a part in the model selects it in the structure list and shows its info card; the selected part is highlighted in the model. Selecting in the list highlights it in the model too.
- Labels in 3D: numbered labels for the 10 structures that follow the model as it turns (the Labels button comes back).
- Full keyboard control of the 3D view (turn, zoom, move, presets) with visible focus, and a text description of the current view (condition, camera direction, cut-away) for screen readers.
- Stop for Matthew's review.

## 2026-11-04: Step 4 follow-up: a plain, natural head (Matthew chose option 1)

- **Feedback:** the face looked weird, then creepy. Building a realistic face from simple shapes lands in the "almost human" zone, so Matthew chose a deliberately plain head for now, with a real head surface from Z-Anatomy planned for the Phase 2 realistic model.
- **The head** (`model/simple/build.mjs`, "the head (sculpted)") is now sculpted in 3D from smooth blended forms: an oval cranium about 152 mm wide that always covers the skull (checked automatically), a face mass, jaw, chin, brow, closed-lid curve, a soft nose, soft closed lips, ears and neck. No eyes or eye hollows.
- **Figure outline follows the 3D head:** the head outline in the 2D figures (Home page, Explorer, `design/figures/`) is traced from the 3D head's midline, so they match exactly. The figure frame without labels was widened slightly so the back of the head isn't clipped. Nothing inside the head changed; `npm run model:check` still passes (35.3 mm; 0.9 mm above; 12.4 mm below).
- **Skin fades when the model is turned:** solid in the side view (so the cut face matches the figures), fading to about 30% once turned more than about 15 degrees, so the anatomy inside shows. The layer's own opacity slider still applies.
- **Other fixes:** removed a crease down the middle of the face and neck; cut faces are drawn only where the cut passes through a structure; the "Whole" cut-away no longer clips the ears; the Explorer hint and caption no longer overlap.
- **Known simplification:** the skull seen through the faded skin is smooth and egg-shaped from the front, with a small ledge at its base. A boxier attempt with a flat base produced streaks and was reverted.

## 2026-11-04: Phase 1, step 4: Simple 3D model, Typical and Chiari I

- **How the model is made** (`model/simple/build.mjs`, run with `npm run model:simple`): each structure starts from its midline shape in the figure (`src/lib/anatomy-shapes.json`, extracted from the figure code) and is given rounded width to either side. The skull is a shell around the cranial cavity with the foramen magnum open; C1 to C4 have rings (arches) around the spinal canal. Output: `public/models/simple.glb` (about 595 KB, 163,000 triangles, compressed).
- **Exact match at the midline:** because every 3D structure's midline slice is its figure shape, the midline cut face is painted with the figure itself. At other cut depths the cut faces are filled with each structure's palette color.
- **Numbers checked in the 3D file** (`npm run model:check`, also runs on GitHub on every update and fails if they drift):
  - Foramen magnum, basion to opisthion: 35.3 mm (EVIDENCE.md: about 33 to 36 mm)
  - Typical tonsil tip: 0.9 mm above the McRae line (EVIDENCE.md: about 1 mm above)
  - Chiari I tonsil tip: 12.4 mm below the McRae line (EVIDENCE.md: about 12 mm below)
- **Explorer:** the 3D view replaces the 2D figure once loaded (the figure stays if the device can't show 3D). Drag to rotate, scroll or pinch to zoom, Shift-drag or two fingers to move. Condition switch, layers with opacity, and the cut-away slider all act on the model. It draws only when something changes, so nothing runs while idle, off screen or in a background tab. Screen readers get the figure's description of the current condition.
- **Default view changed from the mockup:** skin starts on at full opacity so the starting view matches the figures; the mockup had skin off.
- **Download size on the Explorer page:** about 610 KB compressed (3D code plus model). Other pages are unaffected.
- **Checks:** 65 tests pass, including the 3D view loading and updating, and a guard that every 3D source shape is drawn identically in the figure.

**Not in this step (coming next):**
- Nerves and Blood vessels: shown but switched off. They aren't in the figure or EVIDENCE.md, so the Simple model doesn't have them.
- Labels in 3D, tapping a part in the model, camera presets and keyboard control: step 6. (The Labels button is hidden while the 3D view is showing.)
- Fluid flow and Measure currently show on the midline cut face only; animated flow and a 3D measure come in step 7.
- The face is a smooth, mannequin-like simplification; a realistic face comes with the Phase 2 model.

**Open question for Matthew:** the side-to-side widths are my approximations of typical adult sizes (not in EVIDENCE.md yet): head about 152 mm wide; cranial cavity about 132 mm; skull about 8 mm thick (from the figure); cerebellum about 100 mm; cord about 12 mm; spinal fluid space about 26 mm; foramen magnum about 30 mm across; the pair of tonsils about 22 mm. Should I add a "Simple model widths" section to EVIDENCE.md with sources, for your approval?

**Next: step 5, the Simple model's Chiari I with syrinx and After decompression.**
- Syrinx: the long, beaded fluid cavity in the center of the neck cord, from the figure (EVIDENCE.md: neck cord, about 5 vertebrae long on average, shown only as "often").
- After decompression: bone removed at the back of the foramen magnum and the C1 back arch (shown with the red dashed outline), the dural patch, the re-formed fluid space behind the cerebellum, and tonsils only partly risen (about 8.7 mm below the line in the figure, about 4 mm higher than Chiari I, matching EVIDENCE.md).
- Extend the automatic measurement check to cover both, then stop for Matthew to compare all four views with `design/figures/`.

## 2026-11-04: Phase 1, step 3: Explorer page (layout and controls, no 3D yet)

- **CI fix first:** the first GitHub run of step 2 failed at the type check (it also checks the test files: missing Node types, and two copies of Playwright). Fixed; GitHub checks now pass.
- **Explorer page** (`src/pages/explorer.astro`), dark workspace matching `Explorer` (desktop) and `ExplorerPhone`:
  - Desktop: left panel (Condition, Layers with on/off and opacity, Cut-away, Model), center view with Fluid flow / Labels / Measure, right panel (searchable Structures list and info card with the condition note).
  - Phone: condition 2x2 switch with the short notes, Flow / Measure / Layers buttons on the view, a Layers panel (layers, cut-away, model), and an expandable parts list with the info card.
  - Header: Calm mode switch and Español on every page, as SPEC requires (the Explorer mockups didn't show them). "Explain It" opens its "Not built yet" page. "Guided tour" and "Side by side" are left out until Phase 4, when they exist.
  - Footer with the disclaimer and full model credit; captions "Illustration, not a medical image" and "Fluid flow simplified"; "Evidence notes for this view" links to a "Not built yet" page for now.
- **The view shows the 2D anatomy figure for now** (as the mockup does). Condition, Fluid flow, Labels and Measure already change it. Layers, Cut-away and Model are real controls saved in the view state, but have nothing to act on until the 3D model arrives. Camera presets (Side, Back, Below, Front, Reset) come with the 3D model in step 6.
- **Realistic model button is shown but switched off:** the realistic model is Phase 2 and stays hidden until its medical review.
- **One drawing source:** the figure is now drawn by `src/lib/anatomy-figure.ts`, used by both Home and the Explorer (Home output checked identical). The dashed McRae line is now always dark ink; on the dark Explorer it was nearly invisible.
- **View state** (`src/explorer/state.ts`): one place holding condition, tools, layers, cut-away, model and selected part. The 3D model will read from it.
- **Text:** all 60 Explorer strings checked word for word against COPY.md.
- **Checks:** 62 tests passing (accessibility on every page at both sizes and both Calm settings, plus Explorer behavior). Fixed one contrast problem the scan found (the number on the selected part).

**Next: step 4, the Simple 3D model, Typical and Chiari I.**
- Add Three.js and replace the 2D figure in the Explorer with a 3D model built from simple shapes: skull and upper spine, brain, cerebellum and tonsils, brainstem, spinal cord, spinal fluid space, C1 and C2.
- Typical: rounded tonsils about 1 mm above the McRae line, open fluid space behind them. Chiari I: pointed tonsils about 12 mm below the line, crowded fluid space (numbers from EVIDENCE.md).
- Anatomy palette colors from DESIGN.md; drag to rotate, pinch or scroll to zoom; no auto-rotation in Calm mode; pauses when off screen or the tab is hidden.
- The midline cut-away view set up to match the figures, so you can compare them side by side.
- A text description of each view for screen readers.
- **Stop for Matthew** to compare the 3D Typical and Chiari I against `design/figures/` before syringomyelia and surgery are built (step 5).

## 2026-11-04: Phase 1, step 2: Calm mode and automatic checks

- **Calm mode works.** The header switch turns it on and off. The choice is saved in the visitor's own browser only (`localStorage`, key `openchiari-calm`). With no saved choice it turns on automatically when the system asks for reduced motion. A visitor who turns it off keeps it off. It's decided before the page draws, so there's no flash. Logic: `src/lib/calm.ts`, plus a tiny inline script in `src/layouts/Base.astro`.
- **What it changes:** softer colors and base text 19 px (DESIGN.md Calm tokens), larger small text (captions, footer, lists), buttons at least 56 px tall, and all animation and transitions turned off. Animation is also always off when the system asks for reduced motion, even with Calm mode off. The Explorer will use `isCalm()` and `onCalmChange()` to stop auto-rotation.
- **Home in Calm mode** (HomeCalm mockup): "Calm mode is on" note; on phones a filled "Calm on" button, no eyebrow line, the shorter intro and "Still image" caption from COPY.md; the tour button is replaced by "In Calm mode, the model only moves when you move it." The HomeCalm mockup stops after "What is Chiari malformation?"; the rest of the page stays the same, just with Calm styling. No medical text was hidden.
- **Automatic checks:** `npm test` (Playwright + axe) runs an accessibility scan of every page at desktop and phone width, with Calm mode off and on (48 scans); checks that the browser never contacts another site; and tests the Calm switch, remembering, reduced motion, the phone "Calm on" button and the phone menu. 53 tests, all passing. A GitHub workflow (`.github/workflows/checks.yml`) runs the type check, build and tests on every push. Lighthouse is added when the Explorer exists, so it measures the real 3D page.
- **Open questions:** none.

## 2026-11-04: Step 1 follow-up: realistic head outline in Fig. 1

- **Matthew's feedback:** the head in the figure looked off; it should look like a real head. The mockups are reference ideas, not exact designs.
- **Done:** redrew only the outer skin outline in `src/components/AnatomyFigure.astro`. The top and back of the head now follow the skull with an even scalp. The face is a realistic adult profile (upright forehead, brow, bridge of the nose, nose, lips, chin, jaw line, neck).
- **Unchanged:** every inner structure (skull, brain, tonsils, McRae line, descent bracket, spine, cord, spinal fluid), so nothing in EVIDENCE.md is affected.
- **Reference figures updated** (Matthew approved): all four `design/figures/` SVGs and PNGs now use the new head outline. PNGs re-rendered with the site fonts (the old renders used a fallback serif font). `design/mockups/Anatomy.dc.html` still has the old outline; the site component and `design/figures/` are now the reference.

## 2026-11-04: Phase 1, step 1: project setup and Home page

- **Done:** Astro project (static site, TypeScript, built-in i18n set up for English and Spanish). All DESIGN.md tokens in `src/styles/tokens.css`, including the Calm mode and anatomy colors. The three fonts (Source Serif 4, IBM Plex Sans, IBM Plex Mono) are bundled with the site; the browser makes no requests to Google or anyone else (checked).
- **Home page** (`src/pages/index.astro`) for desktop, tablet and phone, matching `Main` and `HomePhone`. All text is in `src/i18n/en.json`, word for word from COPY.md; where the phone mockup has shorter wording, the phone shows that version.
- **Fig. 1** is the anatomy figure ported shape for shape from `Anatomy.dc.html` (`src/components/AnatomyFigure.astro`). It can draw all four conditions, so later pages can reuse it.
- **Shared header and footer** on every page. On phones and narrow screens the nav moves into a Menu button. The footer carries the disclaimer, NINDS credit and the full model credit.
- **Stand-in pages:** links to pages from later steps open a plain "Not built yet" page. "Take the 2-minute tour" opens the 3D Explorer until the tour exists (Phase 4). Both approved by Matthew.
- **Checks:** type check clean, build clean, axe accessibility scan 0 issues at 1440, 820 and 390 px wide, no sideways scrolling on phones.
- **Small additions not in the mockups:** a "Skip to content" link for keyboard users, and a "Menu" label for the phone menu button (no medical text). The phone footer shows the full link list (incl. Privacy, About) instead of the mockup's three links, so those pages are reachable on phones.
- **Not yet:** the Calm mode switch is visible but does nothing until step 2.
- **Next (step 2):** make Calm mode work (switch, saved on the device, automatic with reduced motion), the Home Calm layout, and automatic build, type and accessibility checks in CI.
- **Open questions:** none.

## 2026-11-03: Planning complete

- Plan, mockups (22 screens), evidence research (two independent passes plus a fact check) and Spanish review finished.
- Handoff package created: CLAUDE.md, SPEC, EVIDENCE, COPY, DESIGN, mockups, figures.
- **Next:** Phase 1. Set up the Astro project, design tokens and self-hosted fonts, then the Home page, Calm mode, the 3D Explorer with the Simple model, and Doctor visit prep.
- **Open (Matthew):** buy openchiari.org; find a medical reviewer and a medical translator; confirm the Bobby Jones CSF registry status.
