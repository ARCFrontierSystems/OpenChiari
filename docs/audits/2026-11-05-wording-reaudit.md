# Independent re-audit: the approved check-up wording (English and Spanish) and two viewer changes

- **Date:** 2026-11-05
- **Who:** a fresh AI agent that did not write any of these changes (CLAUDE.md rule 1a, check 3). This is a check against sources, not a medical review.
- **Scope:** `git diff origin/main` of `src/i18n/en.json`, `src/i18n/es.json`, `docs/EVIDENCE.md`, `docs/COPY.md`, `src/explorer/viewer3d.ts`, `src/pages/explain.astro`, `scripts/make-kit.mjs` (no change in this file), and the rebuilt kit images in `public/kit/` and `public/kit/es/`. The changes follow items 3, 4, 9, 11, 12 and 15 of `2026-11-05-checkup-accuracy-audit.md`.
- **Sources opened:** Baisden 2012, PMC3422094 (the saved copy `docs/audits/sources/2026-11-05-symptoms/PMC3422094.html`, searched in full for every passage on crowding, fluid flow, symptoms, and patients with no symptoms).
- **Could not open:** NINDS (www.ninds.nih.gov) and MedlinePlus (medlineplus.gov). This session's network settings block both. Nothing was bypassed. EVIDENCE.md rows 10 and "Cisterna magna" (NINDS, QxMD, Radsource, Milhorat) were not reopened. This audit relies on the earlier audits' records of them.
- **How it was checked:** each changed English sentence was compared with COPY.md by a script. The site was built, and the Explain It view (`/v/`) was rendered in a headless browser for these views: Chiari I side, back and below, and After decompression side, back and below, each with the Simple and the Realistic model. Each render was compared with the same view built from `origin/main`. `npm run model:check` and the realistic model's `check.mjs` were run.

## Summary in plain language

**Verdict: FAIL (narrowly).** The wording itself passes, in both languages. Two things should be fixed before this goes public. Neither one involves new medical text.

**What passes.** Every changed English sentence matches the approved text in COPY.md word for word, and every medical one is backed by a row in EVIDENCE.md:

- "This can crowd the space where spinal fluid flows, which can cause headaches and other symptoms" and "often crowd the space where fluid should pass" are supported by the Baisden article, which I opened and read. It says the tonsils' crowding reduces fluid flow and "contributes to" symptoms. It also makes clear that this is not true for everyone: many Chiari I cases are found by chance, in people without symptoms.
- The new wording says "can" and "often". That is now neither stronger nor weaker than the source.
- The Spanish says the same things. The Spanish Explain It note is 273 characters (the limit is 280).
- The kit images show the new quote and wallet-card text. The poster and social post still carry "Not medical advice. Talk to your doctor about your own care.", "Illustration, not a medical image", the tonsil note and the exact model credit.
- Nothing claims that a medical professional reviewed the site.
- The automatic measurements still pass. The viewer change does not move or reshape anything.

**Problem 1: the after-surgery back view lost the "bone removed" marking.** The new see-through skull is drawn more faintly when the model is seen from the back, front or below. That also fades the reddish "bone removed" marking to almost nothing (about 5% visible). In the After decompression back view, which shows the surgery best, you can no longer see where bone was taken away. The "Bone removed" label now points at nothing visible. This happens in both the Simple and the Realistic model. The shapes are unchanged; it is a drawing problem. The fix is to keep that one marking at its usual strength.

**Problem 2: the Spanish review sheet is out of date for the changed sentences.** The medical translator will use `docs/SPANISH-REVIEW.md`. Its "blind back-translation" column still shows the old meaning for 10 of the 12 changed sentences, for example "reduces the space" and "occupy the space", where the Spanish now says "can" and "often". The sheet also doesn't say which rows changed. Its script claims that it does, but it doesn't. The changed Spanish medical sentences also skipped the blind back-translation check that the rest of the Spanish went through.

**Smaller points (low):**

- The date "November 5, 2026 · passed" on the Impact page isn't recorded in COPY.md. It should go live only once this audit's fixes are approved.
- The About page now says the sources are "listed in the evidence notes" but doesn't link to them.
- A "turned" Explain It view can show the dashed-line text from an angle where the line is hard to see.
- On the Spanish wallet card, "3D." sits alone on a line, and the Spanish quote and wallet cards carry no translation notice.
- The new see-through look also changes the realistic model's approved back, front and below views. Matthew should see them before they go public.

## Problems found

| # | Severity | Where | Sentence or element | Problem | Source checked (opened?) | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Medium | `src/explorer/viewer3d.ts`, `boneFade()` / `drawnOpacity()`; every 3D view of After decompression seen from the back, front or below (Explorer, Explain It, tour, side by side, embed) | The `bone-removed` structure (`model/simple/build.mjs`, layer `bone`, part `removed`, drawn at 0.45 opacity) and the remaining skull and C1 | Every `bone` layer part is now multiplied by the edge-on fade (down to 0.12), including the red "bone removed" marking: 0.45 × 0.12 ≈ 0.05. In the back view the removed area can't be seen any more. In renders compared with `origin/main`, the marking is clearly visible before the change and gone after it, in both the Simple model (`dec.back`) and the Realistic model (`dec.back...r`). The remaining skull and C1 are also so faint that the gap left by the surgery can't be read. The "11 Bone removed" label still points there, and the screen-reader text still says bone "are removed". No shape, measurement or position changed (model:check passes). But a feature EVIDENCE.md requires for this view ("bone removed at the back of the foramen magnum and the C1 back arch") is no longer shown in the view that shows it best. | EVIDENCE.md After decompression rows; CLAUDE.md "The Simple model"; renders (opened) | Leave the `removed` part out of the bone fade (draw it at `p.opacity`), and consider a smaller fade for the surgery skull and C1. Re-render After decompression from the back and below and compare with the `origin/main` renders. No text change. |
| 2 | Medium | `docs/SPANISH-REVIEW.md` (made by `scripts/make-spanish-review.mjs`) | Back-translation column for `explain.starterNote`, `explain.lookingChiari.2`, `tour.steps.3.text`, `compare.notes.chiari`, `kit.quote`, `kit.cardLine2`, `home.tools.items.5.wide`, `support.intro.wide`, `about.how.factsAfter`, `about.corrections`, `about.how.checks`, `impact.accuracyValue`; plus new rows `explorer.notInModel`, `evidence.intro` | The Spanish changed, but the "blind back-translation" beside it is the old one. For example, the starter note's back-translation reads "reduces the space through which the cerebrospinal fluid circulates", stated as always true, while the Spanish now says "puede reducir". `compare` and `tour` read "occupy the space" where the Spanish now says "a menudo reducen". The two new rows are blank. The script's header says "Rows changed since then say so", but no row is marked. The translator could take a stale English reading as the meaning of the current Spanish. The changed Spanish medical sentences have not had the independent blind back-translation that the rest of the Spanish had. (This audit read them directly and found them faithful; see "Checked and fine".) | `docs/SPANISH-REVIEW.md`; `scripts/make-spanish-review.mjs` lines 4–5 (opened) | Have the script mark rows whose English or Spanish changed after the back-translation, for example "(changed Nov 5; back-translation is of the earlier Spanish)". Or run a fresh blind back-translation of the changed rows and add it to `back-translation.json`. |
| 3 | Low | `impact.accuracyValue` (`/impact/`, `/es/impact/`); `about.how.checks` | "November 5, 2026 · passed" / "Last check: November 5, 2026." | (a) COPY.md's Impact section still has "[date] · [result]", so the value on the site isn't recorded there (the About date is). (b) It says "passed". That is true only once this audit's items 1 and 2 are fixed and Matthew approves. Matthew's own note in COPY.md says changed 3D views go public only after the independent audit. | COPY.md (Impact, About); `dist/impact/index.html` | Record "November 5, 2026 · passed" in COPY.md (Impact). Publish the date change only together with the fixes for items 1 and 2, or change it to the date of the follow-up check. |
| 4 | Low | `src/pages/explain.astro` (line 186), recipient "What you're looking at" | Condition `chiari`/`syrinx` with Measure on and camera `custom` | A `custom` (turned) view can have any angle, including almost from the back or below. From there the dashed line and the bracket on the midline are seen edge-on, but the text still says "The dashed line runs across… The blue bracket shows how far." This is minor because turned views are usually close to the side view. | Page code; renders of `c1.back.m` / `c1.below.m` (correctly show the condition note) | Treat `custom` as side-like only when the stored orbit is within about 45° of the side view (azimuth and elevation). Otherwise use the condition note. |
| 5 | Low | `about.how.factsAfter` and `about.how.checks` (`/about/`, `/es/about/`) | "…and other published sources, listed in the evidence notes." | The wording is now accurate (it was "peer-reviewed research, listed on each page"). But About doesn't link to the evidence notes (`about.astro` line 25 links only to NINDS), so a reader can't follow it from there. | `src/pages/about.astro` (opened) | Make "evidence notes" a link to `/evidence/` (`/es/evidence/`). This is a layout change, not a text change. |
| 6 | Low | Spanish kit: `public/kit/es/preview-cards.png` / `wallet-cards.pdf`; `quote-card-*.png` | "Escanee para ver la malformación de Chiari en 3D." / "Los síntomas de Chiari a menudo dan pocas señales visibles." | (a) On the wallet card, "3D." wraps onto a line of its own (cosmetic). (b) The Spanish quote cards and wallet cards carry no "pending medical-translator review" notice, although the Spanish poster does. The quote card makes a medical statement and travels without the site around it. | Built images (opened) | (a) Narrow the font or widen the text column. (b) Optional: add `translation.noticeShort` to the Spanish quote cards, as on the poster. |
| 7 | Low | Realistic model, back, front and below views (`viewer3d.ts` bone fade applies to `p.model === 'realistic'` too) | Skull and spine drawn see-through when seen edge-on | Matthew approved the realistic model's views on 2026-11-04, and the model README says any change must pass `check.mjs`, `web.mjs` and `view-check.mjs`. The geometry is unchanged and `check.mjs` passes. But `view-check.mjs` looks only at the side view, so nothing automatic covers how the back, front and below views now look. In renders, the Chiari I back view now shows the tonsils through the skull, which is an improvement. The After decompression back view lost the bone-removed marking (item 1). | Renders `c1.back.m.l.r` and `dec.back.m.l.r`, before and after (opened) | Show Matthew before-and-after screenshots of the realistic back, front and below views (after the item 1 fix) and get his approval before publishing. |

## Checked and fine

**English wording (all match COPY.md word for word; script check)**
- `explain.starterNote` and `explain.lookingChiari[2]`: "This can crowd the space where spinal fluid flows, which can cause headaches and other symptoms."
  - EVIDENCE.md row 17 (new) cites Baisden 2012. Both quotes are exact in the saved copy: "In CMI as the cerebellar tonsils encroach on the brain stem at the craniocervical junction, CSF flow is decreased and diverted along alternate pathways. This change in CSF flow dynamics contributes to the various clinical complaints characteristic for CMI", and surgeons operate "when they are truly symptomatic, e.g. contributing to impaired cerebrospinal fluid (CSF) circulation by crowding the foramen magnum".
  - The same article supports the hedge "can". Chiari I "is often an incidental finding", and some surgeons "over-operated" on "asymptomatic patients".
  - Headache is first in its list of complaints.
  - "Can … can" now matches the source and does not overstate. Dropping "normally" changes no meaning.
  - In the starter note, "This" clearly refers to the previous sentence. In "What you're looking at", it refers to the tonsils sitting below the line.
  - The English note is 272 characters (limit 280).
- `tour.steps[3].text` and `compare.notes.chiari`: "often crowd the space where fluid should pass". This matches the Explorer note ("often crowded"), EVIDENCE.md "Cisterna magna" ("Often crowded or narrowed") and row 10 ("In many people, not all"). Baisden's "truly symptomatic … by crowding" passage supports "often, not always". The image (Chiari I, measure and flow on) still shows a crowded space, which is consistent.
- `kit.quote` "Chiari symptoms often have few outward signs." is closer to Baisden's "often accompanied by a paucity of physical findings" than "often don't show". EVIDENCE.md row 16 now lists it. Strictly, "physical findings" are what a doctor finds on examination, and "outward signs" is a plain-language reading of that. It was accepted in the Nov 5 symptoms audit and is fair.
- `kit.cardLine2` "Scan to see Chiari malformation in 3D." no longer implies that the picture is the cardholder's own case.
- `support.intro.wide` ("…and one keeps an international patient registry") and `home.tools.items[5].wide` ("…funding research and supporting families") now match EVIDENCE.md "Organizations": only Bobby Jones CSF keeps a registry (with new enrollment paused, as its card says). The "[Before launch…]" placeholder was removed from the page and is kept as an open item in EVIDENCE.md "Still open".
- `about.corrections` ("every change is listed in the site's public code history") is true: the GitHub repository is public (`gh api`: `"visibility": "public"`).
- `about.how.factsAfter` is accurate now (see item 5 for the missing link).
- No page claims a medical professional reviewed it. "not reviewed by a medical professional" remains in About, Impact and Open model, in English and Spanish.

**Spanish (read directly against the English)**
- Starter note (273 characters, under 280): "…queda bajo la abertura en la base del cráneo y puede reducir el espacio del líquido cefalorraquídeo. Esto puede causar dolor de cabeza y otros síntomas, que pueden ir y venir, a menudo con pocas señales visibles." It keeps the English meaning and both hedges ("puede reducir", "puede causar").
  - Making "que pueden ir y venir" refer to the symptoms just named is a fair shortening.
  - "la abertura en la base del cráneo" in place of "where the brain meets the spinal cord" is the deliberate, documented shortening (SPANISH-REVIEW.md, "Known deliberate differences").
- `lookingChiari[2]` "Esto puede reducir el espacio por donde circula el líquido cefalorraquídeo, lo que puede causar dolores de cabeza y otros síntomas." is faithful.
- `tour`/`compare` "a menudo reducen el espacio por donde debería pasar el líquido" is faithful ("crowd" becomes "reduce", with the same hedge).
- `kit.quote` "a menudo dan pocas señales visibles", `kit.cardLine2`, `support.intro.wide`, `home.tools.items[5].wide`, `about.how.factsAfter`, `about.corrections` and the dates are all faithful.
- The pending-translator notice is still in `es.json` (`translation.notice`) and shown on the Spanish pages and poster.

**Kit images (opened)**
- `public/kit/preview-quote.png` and `es/preview-quote.png` show the new quote. `preview-cards.png` and `es/preview-cards.png` show the new card line.
- `preview-social.png`, `preview-poster.png` and their Spanish versions still carry:
  - "Not medical advice. Talk to your doctor about your own care."
  - "Illustration, not a medical image"
  - the tonsil note "Tonsils shown at their lowest point, where MRI measures them"
  - the exact model credit in English: "3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP)." The Spanish files carry a Spanish translation of it.
- The quote and wallet cards show no model, so they need no model credit.

**3D viewer (`viewer3d.ts`): only transparency and cut depth changed**
- `cutDepth`: the midline (slider 50) is still exactly 0 mm, so the cut-away still shows exactly the midline view. Only the far-side end moves, from 60 to 30 mm.
- `boneFade` changes only material opacity and face culling, and lets clicks pass through faded bone. No geometry, position or measurement code changed, and the model files (`public/models/`, `model/`) are unchanged in the diff.
- From the side (the cut facing the camera), bone stays fully solid. The side renders look the same as before.
- **`npm run model:check`: "All measurements match docs/EVIDENCE.md."**
  - Foramen magnum 35.3 mm.
  - Tonsils: Typical 0.9 mm above the line, Chiari I 12.4 mm below, after surgery 10.5 mm below (risen 1.9 mm).
  - Syrinx 5.0 mm wide in a 12.0 mm cord.
  - Bone window about 26 × 30 mm.
  - Clivus 43.7 mm.
  - Spinal canal at C3 about 14.8 mm.
- **Realistic model `model/realistic/check.mjs`:** run on the raw exports in `/tmp/claude-0/za/view2/`. Those files are not in the repository; this audit assumes they are the source of the published files, which are unchanged in this diff. Today's runs of Typical, Chiari I and syrinx each gave "All measurements match docs/EVIDENCE.md." The surgery run was still going when this report was written (see "Not done"). The saved Nov 4 results in the same folder say "All measurements match docs/EVIDENCE.md." for all four conditions.

**Explain It page (`explain.astro`)**
- Rendered `/v/`:
  - `c1.side.m` shows the three "dashed line / blue bracket" lines.
  - `c1.back.m` and `c1.below.m` show the Chiari I Explorer note.
  - `dec.side.m` and `dec.back.m` show the After decompression note.
- All the notes are approved text from COPY.md. The new screen-reader label on the model uses the approved `figure.aria` text and the view name.
- The caption under the model still shows "Illustration, not a medical image" and the tonsil note.

## Not done

- NINDS and MedlinePlus could not be opened (blocked by this session's network settings). StatPearls and PubMed Central were not tried, because the earlier audit hit a robot check there.
- The realistic check for After decompression was still running when this report was written. No problems had been reported up to that point, and its Nov 4 result passed. Typical, Chiari I and syrinx passed today. The viewer change cannot affect these measurements, because they are taken from the model files, which did not change.
- Front-view renders were not compared. The same fade applies there.
