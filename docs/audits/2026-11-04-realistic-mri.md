# MRI comparison: realistic Typical model

- **Date:** 2026-11-04
- **What:** CLAUDE.md rule 1a, check 4. The realistic Typical model's midline compared with the MNI152 2009c template, an average of 152 healthy adult heads (1 mm; TemplateFlow).
- **Method** (`model/realistic/mri/compare.py`):
  - The model was lined up with the scan by four landmarks visible on both: the front and back ends of the corpus callosum, the peak of the fourth ventricle (fastigium), and the front of the pons at the same height.
  - The fit allowed rotation, shifting and one overall scale.
  - Then the model's outlines were drawn over the scan and the scan was measured.
  - The scan pictures are kept out of the site and this repository.

## Results

| Check | Result | Verdict |
| --- | --- | --- |
| Overall size | The best fit needs a scale of 1.01, so the model is the same size as the average adult brain | OK |
| Head pose | The model is tilted 12° relative to the template. The atlas stands in an ordinary upright pose; the template is oriented by a line through two small brain landmarks. Pose only, not shape | OK |
| Landmarks after alignment | Within 3 to 6 mm (genu 4.9, splenium 6.1, fastigium 3.0, pons 5.1). That is typical of comparing one atlas with an average of 152 people | OK |
| Head outline | 90% overlap (Dice 0.90) | OK |
| Brain, by eye | Cerebrum, corpus callosum, cerebellum and brainstem sit on the scan's own structures. The brainstem is within about 5 mm | OK |
| Tonsil height | On the scan, the lowest cerebellar tissue 4 to 8 mm either side of the midline (where the tonsils sit) is 2.3 mm below the model's McRae line (range −2.4 to −2.2). The model's tonsil tip is 1.4 mm above it at the same distance from the midline. The 3.7 mm difference is within the alignment's uncertainty, and both lie in the normal range in EVIDENCE.md (about 7 mm above to 5 mm below) | OK |
| Spinal cord | The template's field of view ends 14 mm below the McRae line, so C2 can't be measured on it. The first look (`2026-11-04-mri-first-look.md`) found 8 to 9 mm at the top of the neck; the model has 8.5 mm at C2 | OK |

## Limits

- **Bone:** on this kind of MRI (T1), bone and fluid both look dark. The basion, opisthion and clivus can't be placed on the scan, so the McRae line on the scan is the model's own line carried across by the alignment. Tonsil height is therefore compared within about ±5 mm.
- **An average:** the template is blurred where people differ. It checks typical proportions, not one person.
- **Chiari I, syrinx and after surgery:** no public Chiari MRI collection is reachable from this environment. These views stay checked against published MRI measurements (EVIDENCE.md) and the automatic checks (`model/realistic/check.mjs`).
