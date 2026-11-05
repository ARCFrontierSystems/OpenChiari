# 3D Explorer: "How close is this to real anatomy?" (accuracy panel), wording for Matthew's approval (November 5, 2026)

**Status: approved by Matthew on Nov 5 ("Accuracy wording approved"); recorded in COPY.md.** 3D roadmap step 4, from the plan Matthew approved on Nov 5.

**What it is:** a folded section in the Explorer, next to the part card. It shows, for the condition on screen, the model's checked numbers beside the published ranges.

**Source of the wording:** every number already appears in EVIDENCE.md ("3D model shapes", "Syrinx", "After decompression"), and the model checks (`npm run model:check`, `model/realistic/check.mjs`) enforce them on every change. There are **no new medical claims**; the wording that presents the numbers is new.

Spanish: translated with the glossary terms; pending a back-translation check and medical-translator review.

**How close is this to real anatomy?**

> Each measurement is checked automatically against published studies whenever the model changes. Real people vary; this is one representative example.

### typical

| Feature | This model | Published studies |
| --- | --- | --- |
| Tonsil tip | About 1 mm above the dashed line | Average about 1 mm above; normal range about 7 mm above to 5 mm below |
| Skull opening, front to back | About 35 mm (Simple), 38 mm (Realistic) | About 33 to 36 mm; 36 ± 3 mm in one study of healthy adults |
| Spinal canal in the neck | About 14.5 mm (Simple) | 13 to 15 mm in adults |

### chiari

| Feature | This model | Published studies |
| --- | --- | --- |
| Tonsil tip | About 12 mm below the dashed line | At least about 5 mm below by definition; about 12 mm on average (5 to 25 mm) in a study of 160 people with Chiari I |
| Tonsil shape | Pointed | Often pointed (peg-like) rather than rounded |

### syrinx

| Feature | This model | Published studies |
| --- | --- | --- |
| Tonsil tip | About 12 mm below the dashed line | At least about 5 mm below by definition; about 12 mm on average (5 to 25 mm) in a study of 160 people with Chiari I |
| Syrinx | In the neck part of the cord, beaded | Most often in the neck part; long, spindle-shaped or beaded, about 5 vertebrae long on average |

### surgery

| Feature | This model | Published studies |
| --- | --- | --- |
| Tonsil tip | About 10 mm below the line, risen about 2 mm | Often rise only partly: about 2 mm on average in one study |
| Bone removed | About 30 × 25 mm at the back of the skull opening, and the middle 25 mm of the first neck bone's back arch | A few centimeters, sized to each patient (for example 2.5 × 3 cm); about 2.5 cm of the first neck bone's arch |

Link at the bottom: Sources in the evidence notes (to the matching section of the evidence notes).
