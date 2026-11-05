# Open Chiari

A free, independent website that helps people see and understand Chiari malformation type I, with an interactive 3D anatomy explorer, plain-language explanations, tools for doctor visits and for explaining the condition to others, and a live list of research studies.

**Status:** Phase 1 built (Home, 3D Explorer with the Simple model, Doctor visit prep), awaiting review. See `docs/PROGRESS.md`.

## What's in this repository

| Path | Contents |
| --- | --- |
| `CLAUDE.md` | Instructions for Claude Code: rules, stack, phases |
| `docs/SPEC.md` | What to build |
| `docs/EVIDENCE.md` | Every medical claim and 3D shape with its source |
| `docs/COPY.md` | Approved text for every screen |
| `docs/DESIGN.md` | Colors, type and components |
| `design/mockups/` | Mockups of all 22 screens |
| `design/figures/` | The anatomy figure in four conditions |

## Running it locally

Needs Node.js 22 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321. `npm run build` makes the static site in `dist/`; `npm run check` runs the type check; `npm test` runs the accessibility and behavior tests on the built site (run `npx playwright install chromium` once first). `npm run model:simple` rebuilds the Simple 3D model and `npm run model:check` checks it against EVIDENCE.md.

## Cite the model

Borgfeld M. Open Chiari: an open 3D anatomy model of Chiari malformation type I. Zenodo. doi:[10.5281/zenodo.23983232](https://doi.org/10.5281/zenodo.23983232) (all versions).

## Not medical advice

Open Chiari is for education only. Talk to your doctor about your own diagnosis and care.

## License

- Code: MIT License (`LICENSE`).
- 3D model and figures: CC BY-SA 4.0 (`LICENSE-MODEL.md`). 3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP).

A personal project by Matthew Borgfeld.
