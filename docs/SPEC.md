# Open Chiari: product spec

Last updated: November 3, 2026. Mirrors the "Plan" tab of the planning doc.

## Goal and audience

A free website that explains Chiari malformation type I with a detailed, realistic 3D model, built as a patient-friendly alternative to paid anatomy tools.

- **Newly diagnosed patients and families:** understand the diagnosis, prepare for appointments, explain it to others, and find research to join.
- **General public:** learn that Chiari exists and is often invisible.
- **Educators, nurses and foundations:** use the openly licensed 3D model on their own sites.
- **Personal project:** no organization branding; built so it can be offered to a Chiari foundation later.

**Quality bar:** paid tools (for example VOKA) are made by teams of medical artists for clinicians. This site won't match them on surgical detail. It should beat them for patients: free, plain-language, phone-first, built for people with Chiari symptoms, and open for anyone to reuse.

**Success for v1:** someone with no medical background can open the site on their phone and explain Chiari to a friend after five minutes.

## Pages

Eleven pages, 22 mockup screens across desktop, phone and print. A Calm mode switch and a language switch (English / Español) sit in the header on every page. The footer on every page has the medical disclaimer, sources and model credits.

| # | Page | Mockups | What it does |
| --- | --- | --- | --- |
| 1 | Home | `Main`, `HomePhone`, `HomeCalm`, `HomeES` | Intro, still figure of Chiari I, what Chiari is, what it can feel like, common misunderstandings, links to every tool |
| 2 | 3D Explorer | `Explorer`, `ExplorerPhone`, `Compare`, `TourPhone` | The anatomy viewer (below) |
| 3 | Explain It | `ExplainShare` (create), `ExplainView` (recipient) | Share a chosen 3D view plus a short note in a link |
| 4 | Research studies | `Studies`, `StudiesPhone` | Recruiting Chiari and syringomyelia studies from ClinicalTrials.gov, refreshed daily |
| 5 | Doctor visit prep | `Prep`, `PrepPhone`, `PrepSheet` | Tick questions, add your own, print a one-page sheet; nothing stored |
| 6 | Open model | `OpenModel` | Download or embed the 3D model, with license and credit |
| 7 | Support | `Support`, `SupportPhone` | Three Chiari nonprofits with links to their own donate pages |
| 8 | Awareness kit | `Kit` | Free graphics and printables for Chiari Awareness Month (September) |
| 9 | Impact | `Impact` | Visitor totals, quality report, open-source details |
| 10 | About | `About` | What the site is, how content is made and checked, principles, contact email |
| 11 | Privacy | `Privacy` | Plain-language policy |

## 3D Explorer

The main model is realistic (from Z-Anatomy); a light Simple model is the fallback for older phones and the Phase 1 build.

**Conditions** (switch at the top of the viewer):

| View | What the model shows |
| --- | --- |
| Typical anatomy | Rounded tonsils at or about 1 mm above the McRae line (a few millimeters below can still be normal); fluid moves freely |
| Chiari I | Pointed tonsils about 12 mm below the line (the average in published surgical series; it varies widely), crowding the fluid space behind the brainstem; in many people fluid slows or is blocked there |
| Chiari I with syrinx | Adds a long, beaded fluid cavity in the center of the neck part of the spinal cord |
| After decompression | Bone at the back of the foramen magnum and usually the back arch of C1 removed, often with a dural patch; fluid space re-forms; tonsils often rise only partly |
| Side by side | Any two of the above in a split view, rotating together |

**Viewer tools:**

- **Layers:** skin, skull and spine, brain, spinal fluid, nerves, blood vessels; each with an on/off control and an opacity slider.
- **Cut-away:** slider from whole model to midline to far side; the midline cut matches the figures in `design/figures/`.
- **Structure list:** searchable list of the 10 labeled structures; tapping one (in the list or the model) highlights it and shows its info card (text in COPY.md).
- **Fluid flow:** a pulsing animation timed to a heartbeat; restricted-flow marks in Chiari views. Labeled "simplified."
- **Measure:** shows the McRae line (basion to opisthion) and a bracket from the line to the lowest tonsil tip.
- **Guided tour:** five steps for first-time visitors; moves the camera and turns layers on.
- **Camera presets:** side, back, below, front, reset.
- **Model switch:** Realistic or Simple.
- **Evidence notes:** a link from each view to its rows in EVIDENCE.md (published as a page).
- **Controls:** drag to rotate, pinch or scroll to zoom, two fingers or Shift-drag to move; full keyboard control; text description of every view.

## Features in detail

| Feature | Behavior |
| --- | --- |
| Calm mode | Turns off motion and auto-rotation, base text 19 px, softer palette. Saved in `localStorage`. Turned on automatically by `prefers-reduced-motion: reduce` |
| Explain It | "Who is it for?" (Family, School, Work, Other) picks a starter note and explanation; note up to 280 characters; option to let the recipient explore. The view (condition, camera, layers, flags) and note are encoded after `#` in the link. Share by copy, text message, email or QR code |
| Research studies | Filters: condition (Chiari, syringomyelia), who can join (any age, adults, children), near (sorted on device only), can take part from home. Each study shows status, type, ages, location, title, plain summary, what you'd do, sponsor, and link to the official listing. Shows "Updated daily" and the processed date |
| Doctor visit prep | Grouped questions (diagnosis, symptoms, tests and monitoring, treatment, daily life and research), add your own, notes field, print or save as PDF, optional small diagram. Everything stays in the browser |
| Open model | Embed builder (starting view, show condition switch, show labels, start in Calm mode) producing an iframe snippet; downloads (glTF web model, Blender source, labeled figure set) |
| Support | Bobby Jones Chiari & Syringomyelia Foundation, Conquer Chiari, ASAP: description and a link to each one's own donate page. Open Chiari never handles money |
| Awareness kit | Square social post, quote card, Explain It wallet card with QR code, event poster and handout with logo space. Hashtag `#ChiariAwarenessMonth` |
| Impact | Totals since launch (visits, models explored, Explain It links made, study listings opened, sites embedding the model), quality report (accessibility and speed scores, WCAG result, last medical review), open-source details |

## Tech approach

- Static site (Astro), no server and no database. The only moving part is the daily studies refresh.
- 3D in Three.js; realistic models as compressed glTF in two detail levels.
- Model building in Blender via scripts, so every anatomy change is repeatable.
- Explain It state in the URL fragment; no server storage.
- Cookieless analytics plus simple counters (counts only, never the contents of a link).
- Self-hosted fonts and assets; no third-party requests from visitors' browsers.
- All text in translation files (English and Spanish).
- Accessibility and speed tests run automatically on every update.
- Hosting on Cloudflare Pages.

## Realistic model pipeline (Phase 2)

1. Extract head and upper neck from Z-Anatomy: skull, upper spine, brain, brainstem, cerebellum, spinal cord, fluid spaces, key nerves and vessels.
2. **Typical:** the extracted model, with tonsils checked against EVIDENCE.md.
3. **Chiari I:** script reshapes the tonsils into a pointed shape, lowers their tips about 12 mm below the McRae line, crowds the fluid space behind them, slightly shortens the clivus and steepens the tentorium.
4. **Syrinx:** long, beaded cavity in the center of the neck cord.
5. **After decompression:** bone a few centimeters across removed at the back of the foramen magnum, back arch of C1 removed, dural patch added, fluid space re-formed, tonsils partly risen.
6. Compress to web files in desktop and phone detail levels.
7. Medical reviewer checks each view before it's public.

## Risks

| Risk | Mitigation |
| --- | --- |
| Reshaping anatomy by script is hard and can look wrong | Build Chiari I alone first and get it reviewed; budget for a freelance medical 3D artist if needed |
| Medically wrong shapes or text | EVIDENCE.md and COPY.md are the only sources; medical review of the 3D views; keep the illustration captions |
| Large scope | Build in phase order; each phase usable on its own |
| Slow on phones | Phone-sized model files, load on demand, Simple fallback, pause when off screen |
| Studies list goes stale or breaks | Daily refresh, processed date shown, fallback link to ClinicalTrials.gov search |
| Surgery view reads like advice | Results-vary wording from COPY.md |
| Machine-quality Spanish | Spanish stays marked pending until a medical translator signs off |
| Wrong details about partner organizations | Confirm each entry and donate link with the organization before launch |

## Deliberately not included

A doctor directory, a symptom tracker, MRI-report interpretation, donation handling, and a patient registry (a possible separate project later, using the foundation's Chiari Common Data Elements and sample data only).
