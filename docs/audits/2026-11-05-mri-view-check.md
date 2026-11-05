# Independent check: "What a side-view MRI looks like" (Reading your MRI report), November 5, 2026

Scope: the new section in `src/pages/mri.astro` (text `mri.view` in `src/i18n/en.json` and `src/i18n/es.json`, plus
`explorer.mriLink`), the image `public/mri/sagittal-t2.png`, the marker file `src/lib/mri-markers.json` and the build script
`model/realistic/mri/teaching_slice.py`. Checked against the NIfTI and the researchers' labels in `/tmp/claude-0/mri/ds4507/`
(MD5 of the T2 file matches the script: `2c4ba936bb9ea5bee4dab01cc2922439`). No site files were changed.

**Verdict:** safe to publish. Every marker sits on the structure it names; the disc-label reading behind marker 10 is right.
No required fixes. Recommended: two Spanish fixes (an unclear pronoun and a gendered word), one note that fluid looks dark
on other MRI images, and a small move of markers 04 and 05 so the fourth-ventricle badge sits on the ventricle's widest part
and doesn't crowd 05.

Coordinates below are (column, row) in the displayed slice, as the script defines them: slice X = 32 of 64, rows top
(superior) to bottom, columns front (anterior) to back. Percent = ((col − 90) / 260 × 100, row / 320 × 100).

## 1. Markers

How I checked: rendered gridded, zoomed crops of slice 32 from the NIfTI (nearest-neighbour, 4–5× zoom), printed an
intensity map around the fourth ventricle, measured mean signal in a 5 × 5 box at each marker, and drew each badge at its
real size. In the narrow layout the image shows at about 373 px wide, so a 26 px badge covers about 18 slice pixels (≈ 11 mm).

| # | Name | Current (col,row) | On target? | Evidence | Change |
| --- | --- | --- | --- | --- | --- |
| 01 | Cerebrum | (300, 22) | Yes | Large gyri with bright sulci, above the tentorium. The tentorium runs from about (245, 35) to (290, 85), so at column 300 it is near row 95; the marker is well above it, in the occipital lobe. | None |
| 03 | Cerebellum | (262, 80) | Yes | Middle of the vermis, on the folia ("tree"). The centre pixel lies on a fissure (box mean 2125, partly fluid), but the badge covers the folia around it. | None |
| 04 | Fourth ventricle | (222, 75) | Yes, at the edge | Bright CSF band between the back of the brainstem (dorsal surface at column 216–217) and the vermis. At row 75 the band is only columns 217–226 wide, so the marker is in the narrow upper part and its badge also covers the brainstem edge. The ventricle is widest at rows 82–88, where it reaches column ~238 (the fastigium, the tent-shaped point aimed into the vermis). Box mean 1917 at (222, 75), 2253 at (227, 84); brainstem 665. | Recommended: **(227, 84)** → x 52.69, y 26.25 |
| 05 | Brainstem | (209, 92) | Yes | Dark medulla, just above and behind the researchers' pontomedullary-junction point (200, 102). Box mean 665. | Recommended only if 04 moves (the two badges would then touch in the narrow layout): **(200, 60)**, on the pons in front of the upper fourth ventricle (box mean 742) → x 42.31, y 18.75 |
| 08 | Spinal cord | (207.49, 200) | Yes | Mean of the researchers' manual cord outline at row 200 (columns 202–213). That row is at C3, between the C2/C3 (row 193) and C3/C4 (row 225) disc points. Cord mean signal 888. | None |
| 09 | Spinal fluid (CSF) | (258, 118) | Yes | Bright fluid space behind and below the vermis (cisterna magna). Box mean 4086, the brightest of all markers. | None |
| 10 | C2 vertebra | (174, 181) | Yes | Inside the C2 body. On this slice C2 is the tall bone from row ~128 (tip of the dens) to the C2/C3 disc at row ~195, with the dark line of the old dens–body junction at row ~172. At row 181 the body spans columns ~167–190 (back edge at the disc points, 189–192), so 174 is in its front third. | Optional, to centre it: **(178, 184)** → x 33.85, y 57.5 |

**What the disc labels mean.** The Spinal Cord Toolbox (SCT) disc convention puts each label "on the posterior tip of each
disc" (SCT `documentation/source/overview/concepts/labeling-conventions.rst`, commit c89c1d16). SCT tutorials: "The
convention for label values is C2/C3-->3, C3/C4-->4, etc." (`alternative-1-sct_label_vertebrae.rst`) and "Label 3: C2/C3,
Label 4: C3/C4" (`alternative-3-...-manual-labeling-all-labels.rst`). The SCT conventions figure
(`doc-figures/vertebral-labeling/vertebral-labeling-conventions.png`) shows label 1 at the top of C1 and label 2 between C1
and C2. In this scan the labels are: 1 at row 137, 2 (C1/C2) at row 169, 3 (C2/C3) at row 193, 4 (C3/C4) at row 225 (4 is
on slice 36). So the script's "between the researchers' C1-C2 and C2-C3 disc points (rows 169, 193)" is correct.

Other notes:
- Slice 32 is the midline at the skull base: disc labels 1–3 are on slice 32 and the PMJ point on 33. The labels lower
  down drift to slice 48 (the neck is tilted or turned a little), but every marker is at C3 or above, so this doesn't matter.
- If 04 and 05 move, update the script comments ("just behind the researchers' pontomedullary-junction point" would no
  longer fit 05; say "on the pons, in front of the upper fourth ventricle"), re-run the script, and update the marker
  description in `docs/EVIDENCE.md` row 31 if it names positions. The test checks only marker count, so it still passes.
- Proposed `MARKERS` lines (if the recommendations are taken):
  ```python
  ('ventricle', '04', (227, 84)),      # the fourth ventricle at its widest (the tent-shaped fastigium points back into the vermis)
  ('brainstem', '05', (200, 60)),      # the pons, in front of the upper fourth ventricle
  ('c2', '10', (178, 184)),            # C2 body, between the researchers' C1-C2 and C2-C3 disc points (rows 169, 193)
  ```
- My check images: `/tmp/claude-0/-workspace/913aa686-fc2f-5b5e-a5e1-c086ad3c1edb/scratchpad/chk/pf.png`
  (posterior fossa), `.../chk/v4.png` (fourth ventricle), `.../chk/ccj.png` and `.../chk/c2.png` (C2),
  `.../chk/occ.png` (cerebrum, cerebellum, cisterna), `.../chk/cord.png`, `.../chk/proposed.png` (current markers in red,
  proposed in green, at the narrow-layout badge size).

## 2. Text

**"On this kind of scan, called T2, spinal fluid looks bright and the brain and spinal cord look darker."** Correct.
Sources:
- Spinal Cord Toolbox (from the lab that released this dataset), `spinalcordtoolbox/scripts/sct_label_vertebrae.py` line
  132 (commit c89c1d16): "Type of image contrast. 't2': cord dark / CSF bright. 't1': cord bright / CSF dark". Same in
  `sct_propseg.py` line 190: "t2 (cord dark / CSF bright)".
- SCT docs, `overview/concepts/contrasts.rst`: "fMRI images have bright cerebrospinal fluid (CSF) regions and dark spinal
  cord regions, so the T2 contrast option would be an appropriate choice."
- PMC4584091 (Neurosurg Clin N Am 2015;26(4):543–553, doi:10.1016/j.nec.2015.06.009; already saved at
  `docs/audits/sources/2026-11-05-mri/PMC4584091.txt`): "We defined a syrinx as a contiguous fluid collection (hypointense on
  T1-weighted images with corresponding T2 hyperintensity)". That is, fluid is bright on T2 and dark on T1.
- Measured on this image (arbitrary units, 5 × 5 boxes): CSF in the cisterna magna 4086, CSF in front of the cord 3677;
  spinal cord 888, brainstem 665.
- Not reachable from this session: radiopaedia.org (not on the network allowlist), and PMC's live pages (reCAPTCHA). If
  you want a Radiopaedia quote ("T2-weighted image"), allow radiopaedia.org and re-check.

Recommended addition (low priority, but helps readers comparing with their own images): most MRI exams include several
image types, and on some (T1, FLAIR) fluid looks dark. Someone who opens their own T1 images could think something is
wrong. Suggested EN, at the end of that sentence:
> On this kind of image, called T2, spinal fluid looks bright and the brain and spinal cord look darker. On other kinds, such as T1, fluid looks dark.

Source for the T1 part: the SCT line above ("'t1': cord bright / CSF dark") and PMC4584091 ("hypointense on T1-weighted
images"). Also note "kind of scan" → "kind of image": T2 is one image type within an MRI exam, not the whole scan.

Optional: fat under the skin of the scalp and the back of the neck also looks bright on this image. If you want to head
that off: "Fat can look bright too."

**Caption** ("MRI of a healthy adult volunteer, side view at the midline (T2). Not a Chiari scan, and not yours: everyone's
scan looks a little different. The researchers removed the face before sharing it.")
- "healthy adult volunteer": supported. Dataset README: "MRI from 10 healthy participants"; `participants.tsv` gives
  sub-002's age as 22.
- "Not a Chiari scan": acceptable, but it is a little stronger than the source. The dataset says the volunteers were
  healthy; it doesn't say anyone checked them for Chiari, and I did not judge (and should not judge) the tonsils on this
  scan. Optional, closer to the source: "From a study of healthy volunteers, not a Chiari study, and not your scan:
  everyone's scan looks a little different."
- "The researchers removed the face before sharing it": correct. The full slice has a black block where the face was.
- No sentence interprets anyone's scan or states this person's tonsil position. "Not marked" note: fine. Optional:
  "the tonsils" → "the cerebellar tonsils", to match the page's terms. Keep the words "aren't marked", which the test
  checks.
- Alt text: correct, and it lists the same seven structures.
- "The numbers match the labels in the 3D model": correct. The explorer's numbers are 01 cerebrum, 03 cerebellum,
  04 fourth ventricle, 05 brainstem, 08 spinal cord, 09 spinal fluid (CSF), 10 C2 vertebra.

## 3. License, credit, privacy

- **License:** `dataset_description.json` fetched live from OpenNeuro's S3
  (`https://s3.amazonaws.com/openneuro.org/ds004507/dataset_description.json`): `"Name": "Spinal Cord Head Positions"`,
  `"Authors": ["S. Bédard", "J. Cohen-Adad"]`, `"DatasetDOI": "doi:10.18112/openneuro.ds004507.v1.1.2"`, `"License": "CC0"`.
  CHANGES lists 1.1.2 as the latest version. openneuro.org itself was not reachable (proxy refused).
- **Credit line:** correct (authors, dataset name, accession, CC0). CC0 needs no credit, but OpenNeuro asks users to cite
  the DOI. Optional: "…OpenNeuro ds004507, doi:10.18112/openneuro.ds004507.v1.1.2 (public domain, CC0)", linking to
  https://openneuro.org/datasets/ds004507.
- **Face:** none visible in `public/mri/sagittal-t2.png` (I looked at it directly). The crop starts at column 90; columns
  90–97 are the edge of the researchers' black face mask, and to the front it shows only the inside of the skull base, the
  throat and the palate area. The midline cut doesn't pass through the eyes. You can see the outline of the back of the
  head and neck, but nothing that identifies the person.
- **Metadata:** the PNG has no text chunks (Pillow `info` is empty). The NIfTI header (`TE=1.2e+02;Time=123420.973`) and
  the sidecar JSON (institution address, acquisition time) are not published. Keep it that way, and don't publish
  participants.tsv details. Sex, age and height are in that file, and the Spanish fix below avoids hinting at sex.

## 4. Spanish (`es.json` `mri.view`, `explorer.mriLink`)

| Key | Spanish | Back-translation | Issue / fix |
| --- | --- | --- | --- |
| title | Cómo se ve una resonancia de lado | How an MRI looks from the side | OK. |
| intro | Esta es una resonancia real de un adulto sano voluntario, de una colección pública de investigación, cortada por la mitad como el modelo 3D. En este tipo de estudio, llamado T2, el líquido cefalorraquídeo se ve claro y el cerebro y la médula espinal se ven más oscuros. Los números coinciden con las etiquetas del modelo 3D. | This is a real MRI of a healthy volunteer adult [masc.], from a public research collection, cut in half like the 3D model. In this kind of study, called T2, the cerebrospinal fluid looks light and the brain and spinal cord look darker. The numbers match the labels of the 3D model. | (a) "un adulto sano voluntario": masculine and odd word order. Use the neutral "una persona adulta sana que participó como voluntaria". (b) "cortada por la mitad" reads as "cut in half"; better "vista en un corte por la línea media, como el modelo 3D". (c) "tipo de estudio" → "tipo de imagen" (T2 is an image type, not a whole exam), matching the EN fix. (d) "se ve claro" is fine; "se ve blanco" is plainer. Glossary terms are correct: líquido cefalorraquídeo, médula espinal. |
| alt | Resonancia de lado de la cabeza y el cuello de un adulto sano, con marcadores numerados en el cerebro, el cerebelo, el cuarto ventrículo, el tronco encefálico, la médula espinal, el líquido cefalorraquídeo y la vértebra C2. | Side MRI of a healthy adult's head and neck, with numbered markers on the brain, cerebellum, fourth ventricle, brainstem, spinal cord, CSF and the C2 vertebra. | OK. Optional: "de un adulto sano" → "de una persona adulta sana". "tronco encefálico" matches the glossary. |
| caption | Resonancia de un adulto sano voluntario, vista de lado en la línea media (T2). No es un estudio de Chiari ni el suyo: el estudio de cada persona se ve un poco distinto. Los investigadores quitaron la cara antes de compartirla. | MRI of a healthy volunteer adult, side view at the midline (T2). It's not a Chiari study nor yours: each person's study looks a little different. The researchers removed the face before sharing it. | **"compartirla" is ambiguous:** "la" can point to "la cara" (the nearest noun), giving "removed the face before sharing *the face*". Fix: "antes de compartir las imágenes". Same gender fix as the intro. |
| notMarked | El punto más bajo de las amígdalas cerebelosas y los bordes de la abertura del cráneo no están marcados: ubicarlos con precisión es tarea de un radiólogo. | The lowest point of the cerebellar tonsils and the edges of the skull opening are not marked: placing them precisely is a radiologist's job. | OK. Uses the full "amígdalas cerebelosas" as the glossary requires. "abertura del cráneo" matches the explorer's Spanish; the glossary's full form is "la abertura en la base del cráneo" (optional). |
| credit | Resonancia: Bédard S, Cohen-Adad J. Spinal Cord Head Positions, OpenNeuro ds004507 (dominio público, CC0). | MRI: … (public domain, CC0). | OK (the dataset name stays in English). |
| seeIt | Verlo en 3D | See it in 3D | OK. |
| explorer.mriLink | Comparar con una resonancia real | Compare with a real MRI | OK. |

"resonancia" without "magnética (RM)": the glossary entry is "resonancia magnética (RM)", but the site already uses the
short "resonancia" throughout this page (title "Cómo leer el informe de su resonancia"). It is consistent, so no change.

**Suggested es.json text:**
- intro: "Esta es una resonancia real de una persona adulta sana que participó como voluntaria, de una colección pública de investigación, vista en un corte por la línea media, como el modelo 3D. En este tipo de imagen, llamada T2, el líquido cefalorraquídeo se ve blanco y el cerebro y la médula espinal se ven más oscuros. En otros tipos, como T1, el líquido se ve oscuro. Los números coinciden con las etiquetas del modelo 3D."
- caption: "Resonancia de una persona adulta sana que participó como voluntaria, vista de lado en la línea media (T2). No es un estudio de Chiari ni es el suyo: el estudio de cada persona se ve un poco distinto. Los investigadores quitaron la cara antes de compartir las imágenes."
- alt (optional): "…de la cabeza y el cuello de una persona adulta sana, con marcadores numerados…"

**Matching EN text (if the T1 note is taken):**
- intro: "This is a real MRI of a healthy adult volunteer, from a public research collection, cut down the middle like the 3D model. On this kind of image, called T2, spinal fluid looks bright and the brain and spinal cord look darker. On other kinds, such as T1, fluid looks dark. The numbers match the labels in the 3D model."

## Summary of changes

| Priority | Where | Change |
| --- | --- | --- |
| Recommended | es.json `mri.view.caption` | "antes de compartirla" → "antes de compartir las imágenes" (unclear pronoun) |
| Recommended | es.json `mri.view.intro`, `.caption` | "un adulto sano voluntario" → "una persona adulta sana que participó como voluntaria"; "cortada por la mitad" → "vista en un corte por la línea media"; "tipo de estudio, llamado" → "tipo de imagen, llamada" |
| Recommended | en.json + es.json `mri.view.intro` | "kind of scan" → "kind of image"; add "On other kinds, such as T1, fluid looks dark." / "En otros tipos, como T1, el líquido se ve oscuro." |
| Recommended | teaching_slice.py → mri-markers.json | 04 → (227, 84) [52.69 %, 26.25 %]; 05 → (200, 60) [42.31 %, 18.75 %] (move both or neither) |
| Optional | teaching_slice.py → mri-markers.json | 10 → (178, 184) [33.85 %, 57.5 %] to centre on the C2 body |
| Optional | en.json caption | "Not a Chiari scan, and not yours" → "From a study of healthy volunteers, not a Chiari study, and not your scan" |
| Optional | en.json `notMarked` | "the tonsils" → "the cerebellar tonsils" (keep "aren't marked") |
| Optional | credit (both) | add "doi:10.18112/openneuro.ds004507.v1.1.2" and a link to the OpenNeuro page |
