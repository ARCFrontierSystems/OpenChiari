# MRI comparison: first look (feasibility)

- **Date:** 2026-11-04
- **Data:**
  - MNI152 2009c average adult head, 1 mm (TemplateFlow; an average of many healthy adult scans).
  - One healthy volunteer's T1 scan from OpenNeuro dataset ds000030 (UCLA Consortium for Neuropsychiatric Phenomics LA5c; license CC0; DOI 10.18112/openneuro.ds000030.v1.0.0; face removed by the dataset).
  - Scans are used only for comparison; no scan images are published on the site.
- **Method:** midline slice, zoomed on the posterior fossa with a 1 mm grid, read by eye.

## Findings

- **Spinal cord at the top of the neck: about 8 to 9 mm front to back** (MNI152). Supports the 3D audit (item 4): the Simple model's cord (11 mm) and the realistic model's built cord (13.7 mm) are too thick.
- **Fluid space behind the medulla and cerebellum: about 15 mm deep, continuous with the space behind the cord** (MNI152). Supports the 3D audit (item 1): the Typical view should show an open, continuous fluid pathway.
- **Limits:** on standard T1 brain MRI, bone and fluid both look dark, so the basion, opisthion and clivus edges are hard to place by eye; the MNI152 average is blurred; this volunteer's scan is too grainy around the skull base for millimetre measurements.

## What a full MRI comparison can and can't do

- **Can:** check Typical anatomy proportions (cord, brainstem, cerebellum, fluid spaces, tonsil position) against an average of many people and a set of healthy volunteers, by overlaying the model's midline on the scans at the same scale.
- **Can't:** check Chiari I, syrinx or after-surgery shapes against real scans: no public Chiari MRI collection is reachable from this environment. Those stay checked against published MRI measurements (EVIDENCE.md).
