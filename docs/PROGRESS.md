# Progress log

Claude Code: add an entry after each working session (date, what was done, what's next, open questions). Newest first.

## 2026-11-04: Phase 1, step 2: Calm mode and automatic checks

- **Calm mode works.** The header switch turns it on and off. The choice is saved in the visitor's own browser only (`localStorage`, key `openchiari-calm`). With no saved choice it turns on automatically when the system asks for reduced motion. A visitor who turns it off keeps it off. It's decided before the page draws, so there's no flash. Logic: `src/lib/calm.ts`, plus a tiny inline script in `src/layouts/Base.astro`.
- **What it changes:** softer colors and base text 19 px (DESIGN.md Calm tokens), larger small text (captions, footer, lists), buttons at least 56 px tall, and all animation and transitions turned off. Animation is also always off when the system asks for reduced motion, even with Calm mode off. The Explorer will use `isCalm()` and `onCalmChange()` to stop auto-rotation.
- **Home in Calm mode** (HomeCalm mockup): "Calm mode is on" note; on phones a filled "Calm on" button, no eyebrow line, the shorter intro and "Still image" caption from COPY.md; the tour button is replaced by "In Calm mode, the model only moves when you move it." The HomeCalm mockup stops after "What is Chiari malformation?"; the rest of the page stays the same, just with Calm styling. No medical text was hidden.
- **Automatic checks:** `npm test` (Playwright + axe) runs an accessibility scan of every page at desktop and phone width, with Calm mode off and on (48 scans); checks that the browser never contacts another site; and tests the Calm switch, remembering, reduced motion, the phone "Calm on" button and the phone menu. 53 tests, all passing. A GitHub workflow (`.github/workflows/checks.yml`) runs the type check, build and tests on every push. Lighthouse is added when the Explorer exists, so it measures the real 3D page.
- **Next (step 3):** the Explorer page without 3D: the dark workspace on desktop and phone, condition switch, layer controls, cut-away slider, structure list with info cards, captions and credits.
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
