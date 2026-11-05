# Spanish word list (glossary)

Every Spanish page uses these terms, always the same way, so a medical translator can check one list instead of
every sentence. **Status: pending medical-translator review** (CLAUDE.md "Translations"). Matthew approved
publishing the Spanish site with a visible notice on 2026-11-05, before that review.

How the terms were chosen, in order:
1. **Opened official Spanish sources**, saved in `docs/audits/sources/2026-11-05-spanish/`:
   - MedlinePlus en español, "Malformaciones de Chiari" (https://medlineplus.gov/spanish/chiarimalformation.html)
   - MedlinePlus enciclopedia médica, "Siringomielia" (https://medlineplus.gov/spanish/ency/article/001398.htm)
2. **The Spanish Home text in `docs/COPY.md`** ("Home, Spanish"), from the planning-stage Spanish review.
3. **Standard Spanish anatomical terms** where no opened source used the word. These are marked
   "translator: please confirm".

The NINDS Spanish fact sheet, Mayo Clinic en español and KidsHealth en español could not be opened from the
build environment (blocked for automated visitors); they were not used.

Style: **usted** (formal "you") everywhere, neutral Latin American Spanish for readers in the United States, plain
language. Numbers keep the English style (12 mm, 5 a 25 mm). Brand and page names: "Open Chiari" and "Explain It"
stay in English; "Explain It" is followed by "(Explíquelo)" where it is introduced.

| English | Spanish | Source |
| --- | --- | --- |
| Chiari malformation, Type I | malformación de Chiari tipo I | MedlinePlus ("Malformaciones de Chiari"); COPY.md |
| Chiari I | Chiari I | as in English (a name) |
| cerebellum | cerebelo | MedlinePlus |
| cerebellar tonsils, tonsils | amígdalas cerebelosas (always the full term; *amígdalas* alone means the throat tonsils) | COPY.md |
| cerebrum | cerebro | standard; translator: please confirm |
| brain | cerebro / encéfalo (cerebro in plain text) | MedlinePlus ("tejido cerebral") |
| brainstem | tronco encefálico | standard; translator: please confirm |
| corpus callosum | cuerpo calloso | standard; translator: please confirm |
| fourth ventricle | cuarto ventrículo | standard; translator: please confirm |
| foramen magnum | agujero magno | standard; translator: please confirm |
| the opening at the base of the skull | la abertura en la base del cráneo | MedlinePlus ("base del cráneo"); COPY.md |
| skull | cráneo | MedlinePlus |
| spinal cord | médula espinal | MedlinePlus |
| spinal canal | canal espinal | MedlinePlus |
| spinal fluid, cerebrospinal fluid (CSF) | líquido cefalorraquídeo (LCR) | MedlinePlus |
| syringomyelia | siringomielia | MedlinePlus |
| syrinx | siringe (cavidad llena de líquido dentro de la médula espinal). MedlinePlus calls the cyst *siringa*; *siringe* is the more common medical term. Translator: please choose one | MedlinePlus ("siringa"); standard |
| MRI | resonancia magnética (RM) | MedlinePlus ("RM"); COPY.md |
| cine MRI (flow MRI) | resonancia magnética de flujo (cine-RM) | standard; translator: please confirm |
| decompression surgery | cirugía de descompresión | standard; translator: please confirm |
| dura, dural patch | duramadre, parche de duramadre | standard; translator: please confirm |
| C1, C2 vertebra | vértebra C1 (atlas), vértebra C2 | standard |
| dens (the peg of C2) | apófisis odontoides | standard; translator: please confirm |
| monitoring (watch and wait) | vigilancia con controles periódicos | standard; translator: please confirm |
| McRae line | línea de McRae | name |
| headache | dolor de cabeza | MedlinePlus, COPY.md |
| neck pain | dolor de cuello | MedlinePlus, COPY.md |
| dizziness | mareos | MedlinePlus ("Mareo"), COPY.md |
| numbness or tingling | entumecimiento u hormigueo | MedlinePlus ("Entumecimiento"), COPY.md |
| scoliosis | escoliosis | MedlinePlus |
| sleep apnea | apnea del sueño | standard |
| symptoms | síntomas | MedlinePlus |
| neurosurgeon | neurocirujano | standard |
| clinical trial / observational study | ensayo clínico / estudio observacional | standard (ClinicalTrials.gov Spanish usage) |
| Not medical advice. Talk to your doctor about your own care. | No es consejo médico. Hable con su médico sobre su propia atención médica. | COPY.md |
| Illustration, not a medical image | Ilustración, no es una imagen médica | COPY.md ("Ilustración") |
| Fluid flow simplified | Flujo del líquido simplificado | new |
| Calm mode | Modo tranquilo | COPY.md |
| incision | incisión | standard |
| anesthesia (asleep under anesthesia) | anestesia (dormida con anestesia) | standard |
| child life specialist | especialista en vida infantil (child life) | standard; translator: please confirm |
| intensive care | cuidados intensivos | standard |
| hearing aids / headphones | aparatos auditivos / audífonos (*audífonos* alone can mean either; the packing list keeps them apart) | back-translation check 3 |
| 3D Explorer | Explorador 3D | COPY.md |
| Research studies | Estudios de investigación | COPY.md |
| Doctor visit prep | Prepare su cita médica | COPY.md |
| Open model | Modelo abierto | COPY.md |
| Awareness kit | Kit de concientización | COPY.md |
| Chiari Awareness | Concientización sobre Chiari | Make your own label (Nov 5) |
| sagittal / coronal / axial (MRI and cut directions) | sagital / coronal / axial; plain labels: de lado / frontal / transversal | Back-translation check 7 |
| skull opening (short form of foramen magnum) | abertura del cráneo | es.json usage |
| Chiari Awareness Month | Mes de Concientización sobre Chiari | Kit eyebrow |
| Poster | Póster (plural pósteres) | Kit; not "cartel" (back-translation check 5) |
| Sticker | Calcomanía | Kit |
| Logo | Logotipo | Kit |
| Graphic (a post, story or poster) | Gráfico | Kit; "imagen" is kept for the picture of Chiari |

Words that sound alike but must not be used: *amígdalas* alone (throat tonsils); *médula* alone (could mean bone
marrow); *quiste* for syrinx (the site doesn't call it a cyst).

Sticker phrases (Awareness kit) speak to the reader with "tú", like the children's story, and avoid masculine-only words where a neutral one exists (for example "Súper valiente" for "Brave kid"). Back-translation check 4.

"Malformación de Chiari" takes "la" when it is the subject or follows "de" ("La malformación de Chiari es…", "el síntoma clásico de la malformación de Chiari"), and no article after "tengo" or "con" ("Tengo malformación de Chiari", "personas con malformación de Chiari"). Make-your-own audit, Nov 5.
