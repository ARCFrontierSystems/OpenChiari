# Progress log

Claude Code: add an entry after each working session (date, what was done, what's next, open questions). Newest first.
Matthew's preference: when a step is done, lay out what the next step will cover.

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
