# Open Chiari: instructions for Claude Code

Open Chiari (openchiari.org) is a free, independent website that helps people see and understand Chiari malformation type I. Its centerpiece is an interactive 3D anatomy explorer. It's built for patients and families first, works on phones first, collects no personal data, and is open source.

**Owner:** Matthew Borgfeld. Matthew has no technical background and builds with Claude Code. Explain what you're doing in plain language, keep changes small and reviewable, and show results (screenshots, preview links) rather than describing code. Ask before any step that is hard to undo.

## Read these first, in this order

| File | What it is | Authority |
| --- | --- | --- |
| `docs/EVIDENCE.md` | Every medical claim and every 3D shape, with its verified source | **Highest.** Medical facts and model numbers come only from here |
| `docs/COPY.md` | Approved text for every screen, extracted from the final mockups | Use word for word |
| `docs/SPEC.md` | Pages, features, phases, tech approach, risks | What to build and in what order |
| `docs/DESIGN.md` | Colors, type, spacing, components, anatomy palette | How it looks |
| `design/mockups/*.dc.html` | 23 mockup files (22 screens plus the anatomy figure component) | Layout reference; not production code |
| `design/figures/` | The anatomy figure rendered in all four conditions | Visual reference for the 3D views |

The mockups are also viewable as a live canvas (ask Matthew for the link). The `.dc.html` files use a design-tool format; read them for structure, spacing, and copy, then build real components.

## Non-negotiable rules

### 1. Medical accuracy
- **Never write new medical text.** Every sentence that states or implies a medical fact must come from `docs/COPY.md`, word for word.
- If a screen needs medical text that isn't in COPY.md, **stop**. Draft it, find an authoritative source and actually open it (NINDS, MedlinePlus, StatPearls, a major medical center, or peer-reviewed research), add a row to `docs/EVIDENCE.md` with the source URL, and ask Matthew to approve it before it ships.
- Never change a measurement, percentage, or anatomical position away from what EVIDENCE.md states.
- Keep every required caption: "Illustration, not a medical image", "Fluid flow simplified", and the midline-simplification note on the tonsils.

### 1a. Accuracy checks (instead of a medical reviewer)
On 2026-11-04 Matthew decided the site will **not** use a medical reviewer. Instead, every medical sentence and every 3D view must pass all of these before it's public:
1. **Source check:** a row in `docs/EVIDENCE.md` whose source was actually opened and supports the wording.
2. **Automatic measurements:** every number in EVIDENCE.md that can be measured on a model is checked by `npm run model:check` (and the realistic model's equivalent), on every change.
3. **Independent audit:** a fresh agent that did not build or write the thing compares it against the opened sources and reports problems. Reports are kept in `docs/audits/`. Fixes to medical text still need Matthew's approval.
4. **MRI comparison:** the 3D views are compared with public MRI scans (OpenNeuro, MNI152 template) wherever available; results are kept in `docs/audits/`.
5. **Matthew approves** the result.

The site must say this honestly: it never claims a medical professional reviewed it. Use the "Accuracy checks" wording in COPY.md (About, Open model, Impact).
- Nothing on the site may read as medical advice. Keep "Not medical advice. Talk to your doctor about your own care." in every footer.
- Never invent placeholder data that looks real (studies, counts, scores, names). Leave `[placeholder]` text until real data exists.

### 2. Privacy (the site collects nothing personal)
- No accounts, sign-ins, contact forms, tracking cookies, or health data. Ever.
- **Explain It:** the view and the note live after the `#` in the link (the URL fragment). Never move them into the path or query string, never send them to a server, never log them.
- **Analytics:** cookieless only (planned: Cloudflare Web Analytics). Configure it so it does not record the URL fragment. Before Explain It launches, verify in the browser network tab that no analytics request contains the note. Turn off single-page-app tracking unless that test passes.
- **No third-party requests from visitors' browsers:** self-host all fonts and 3D files. No Google Fonts link in production (mockups use it only for preview). The studies list is fetched by a scheduled job, not by visitors' browsers.
- Calm mode and language choice may use `localStorage` on the visitor's device only.

### 3. Licensing and credits
- Code: MIT License (see `LICENSE`).
- 3D model and model-derived graphics: CC BY-SA 4.0 (see `LICENSE-MODEL.md`).
- Wherever the model or a render of it appears, show this credit exactly:
  > 3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP).
- Research studies data: credit ClinicalTrials.gov, show the date the data were processed, and note "Summaries simplified by Open Chiari."
- Facts adapted from NINDS: credit "Facts adapted from the NINDS fact sheet."

### 4. Accessibility
- Target WCAG 2.2 AA (which also covers WCAG 2.1 AA, the level in U.S. ADA rules).
- Every interactive element is a real `button`, `a`, or form control, reachable by keyboard, with visible focus.
- Touch targets at least 44 by 44 px. Text contrast at least 4.5:1.
- Every 3D view has a text description for screen readers (the `ariaLabel` strings in the anatomy component are the model for these).
- Calm mode: no motion or auto-rotation, larger text (base 19 px), softer colors. Also turn it on automatically when the visitor's system has `prefers-reduced-motion: reduce`.

### 5. Performance (most visitors are on phones)
- The Simple 3D model must run smoothly on a mid-range phone. The realistic model loads on demand, in a phone-sized version, and falls back to Simple.
- Pause 3D rendering when the viewer is off screen or the tab is hidden.

## Tech stack

- **Site:** [Astro](https://astro.build) (static output, file-based pages, built-in i18n for English and Spanish), TypeScript, plain CSS with custom properties from `docs/DESIGN.md`.
- **3D:** Three.js, written as a client-side island inside the Explorer pages. Realistic models are glTF with Draco or Meshopt compression, in two detail levels.
- **Model building (Phase 2):** Blender driven by Python scripts in `model/scripts/`, so every anatomy change is repeatable and reviewable. Source data: Z-Anatomy.
- **Translations:** all UI text in `src/i18n/en.json` and `src/i18n/es.json`. Spanish copy comes from COPY.md ("Home, Spanish") and must stay marked as pending medical-translator review until Matthew says otherwise.
- **Studies:** a GitHub Action runs daily, calls the ClinicalTrials.gov API v2 (`https://clinicaltrials.gov/api/v2/studies`) for recruiting Chiari and syringomyelia studies, and writes `src/data/studies.json` with the processed date.
- **Hosting:** Cloudflare Pages (free, static). Do not deploy anything without Matthew's go-ahead.
- **Quality checks in CI:** build, type check, axe accessibility tests, and Lighthouse on the main pages. The Impact page's quality report shows these results.

If you think a different tool fits better, explain the trade-off in plain language and ask before switching.

## Build phases

Build in this order. Each phase ends with something live and usable. Don't start a phase until the previous one is reviewed.

1. **Phase 1: Home and Explorer foundation.** Home (desktop, phone, Calm mode), the 3D Explorer with the **Simple** model and all viewer tools (condition switch, layers, cut-away, structure list and info cards, fluid flow, measure, camera presets, keyboard controls), and Doctor visit prep including the printed sheet. Proves the viewer works on phones.
2. **Phase 2: Realistic model.** Extract head and upper neck from Z-Anatomy; build Typical and Chiari I to the numbers in EVIDENCE.md; render the views and run the accuracy checks (rule 1a) for Matthew's approval; then add After decompression. Build Chiari I alone first and stop for review. If scripted mesh edits don't look convincing, say so; a freelance medical 3D artist may be needed.
3. **Phase 3: Sharing and research.** Explain It (create and recipient pages), Research studies with the daily job, Open model (download and embed), Support, visitor counts, and the Impact page. About and Privacy pages.
4. **Phase 4: Syrinx and polish.** Syrinx view, side-by-side compare, guided tour, full Spanish site, Awareness kit.

### The Simple model (Phase 1)
Build it as 3D geometry in Three.js that matches the midline figure in `design/figures/` and the measurements in EVIDENCE.md: rounded tonsils about 1 mm above the McRae line for Typical; pointed tonsils about 12 mm below for Chiari I; a beaded central cavity in the neck cord for the syrinx; and for surgery, bone removed at the back of the foramen magnum and the C1 back arch, a dural patch, a re-formed fluid space, and tonsils only partly risen. The cut-away should show exactly the midline view in the figures. Ask Matthew to compare it against the figures before moving on.

## How to work

- Start each session by reading this file and the relevant section of SPEC.md.
- Work in small steps; commit after each working piece with a clear message.
- After each step, show Matthew the result: a screenshot or preview link and one or two plain sentences on what changed.
- Keep a short `docs/PROGRESS.md` log: date, what was done, what's next, any open questions.
- **Ask Matthew before:** adding a paid service or anything that tracks visitors; changing any medical text, number, or figure; changing the design system; deploying or publishing; making the repository public.

## Don't

- Don't add a doctor or specialist directory, a symptom tracker, or anything that interprets MRI reports. These were deliberately left out.
- Don't add donation handling. The Support page only links to each organization's own donate page.
- Don't show the realistic model publicly until its views pass the accuracy checks (rule 1a) and Matthew approves them.
- Don't use stock icons, emoji, gradients, or rounded "pill" button styling. See DESIGN.md.

## Open items Matthew is handling

- Buying the openchiari.org domain (use it in copy; it isn't live yet).
- A medical translator to sign off on the Spanish.
- Confirming the Bobby Jones Chiari & Syringomyelia Foundation registry status (currently "enrollment paused").
