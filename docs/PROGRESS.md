# Progress log

Claude Code: add an entry after each working session (date, what was done, what's next, open questions). Newest first.

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
