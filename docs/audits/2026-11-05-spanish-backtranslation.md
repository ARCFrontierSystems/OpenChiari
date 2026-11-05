# Spanish translation check by back-translation (2026-11-05)

**Checked:** `src/i18n/es.json` (all site text) and the `es` fields in `src/data/study-summaries.json` (two study
summaries), against `src/i18n/en.json`, the English study summaries, and `docs/SPANISH-GLOSSARY.md`.
**Checker:** a fresh agent that did not write the translation.
**Method:** every Spanish string was first translated back into plain, literal English *before* the English
originals were opened (saved as `docs/audits/sources/2026-11-05-spanish/back-translation.json`). Each
back-translation was then compared with its English original, key by key. Automatic checks were also run for
placeholders, glossary terms and informal "tú" forms.

## Summary in plain language

The Spanish translation is careful and faithful. I found **no high-severity problems**: no medical fact, number,
body part, privacy promise or licensing statement changes meaning in Spanish. Every required caption and the
"not medical advice" footer are there, and the site never claims in Spanish that a medical professional reviewed it.

I found **4 medium problems**, places where the Spanish is a little stronger than the English or could be misread:

1. **Explain It starter note:** the English says symptoms "*can* come and go"; the Spanish says they "come and go",
   as a fact. The rest of the note keeps the meaning, and it fits the limit (277 of 280 characters).
2. **"What it is" on Home:** the English says the condition is "*often* linked" to a smaller skull; the Spanish says
   "*usually*". It is also not clear what "it" refers to in that Spanish sentence.
3. **Side-by-side note and guided tour step 4:** "where flow is *often* restricted" became "*usually* restricted".
4. **Awareness kit quote card:** "Chiari symptoms often don't show" became words that can also mean "often aren't
   noticed", which could suggest the symptoms are mild rather than invisible to other people.

There are also **11 low-severity items**, mostly style and naturalness, plus one glossary slip (the syrinx label says
bare "médula" instead of "médula espinal"). All fixes below are suggestions. Changes to medical wording need
Matthew's approval (CLAUDE.md rules 1 and 1a), and the Spanish as a whole is still waiting for the medical
translator.

## Findings

Severity: **high** = changes a medical meaning or a privacy or safety statement; **medium** = noticeably stronger or
weaker, or confusing; **low** = style, naturalness or consistency. Long strings are quoted only in the part that
matters.

| # | Severity | Key | Spanish text | Back-translation | English original | Problem | Suggested Spanish fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | medium | `explain.starterNote` | "…y reduce el espacio por donde circula el líquido cefalorraquídeo. Puede causar dolor de cabeza y otros síntomas que van y vienen, a menudo con pocas señales visibles." | "…and reduces the space through which the cerebrospinal fluid circulates. It can cause headache and other symptoms that come and go, often with few visible signs." | "…That crowds the space where spinal fluid normally flows, which can cause headaches and other symptoms. Symptoms can come and go, often with few outward signs." | "Can come and go" became "come and go", stated as fact. It can also be read as Chiari causing only symptoms that come and go. Smaller point: "normally" is dropped. Everything else matches, and the opening ("abertura en la base del cráneo" for "the opening where the brain meets the spinal cord") names the same place in approved site wording. Length is 277 characters (the limit, `NOTE_MAX`, counts characters in the browser, so it fits). | "En la malformación de Chiari, la parte más baja del cerebelo queda bajo la abertura en la base del cráneo y reduce el espacio por donde circula el líquido cefalorraquídeo. Puede causar dolor de cabeza y otros síntomas que pueden ir y venir, a menudo con pocas señales visibles." (277 characters; adding "normalmente" makes it 285, over the limit) |
| 2 | medium | `home.whatIs.whatItIs.wide` and `.narrow` | "Suele estar relacionada con que la parte posterior e inferior del cráneo es más pequeña o tiene otra forma…" | "It is usually related to the back and lower part of the skull being smaller or having another shape…" | "It's often linked to a lower back part of the skull that is smaller or shaped differently than usual…" | "Often" became "usually" (*suele*), which is stronger. Also, "relacionada" (feminine singular) has no nearby noun it fits: the sentence before is about "el cerebelo" (wide) or "las amígdalas cerebelosas" (narrow), so a reader can't tell what "it" is. | "A menudo, la malformación está relacionada con que la parte posterior e inferior del cráneo es más pequeña o tiene otra forma, lo que deja poco espacio al cerebro." |
| 3 | medium | `compare.notes.chiari`, `tour.steps[3].text` (last sentence) | "Las marcas rojas muestran dónde el flujo suele estar restringido." | "The red marks show where the flow is usually restricted." | "Red marks show where flow is often restricted." | "Often" became "usually", which is stronger. | "Las marcas rojas muestran dónde el flujo a menudo está restringido." |
| 4 | medium | `kit.quote` | "Los síntomas de Chiari a menudo no se notan. Pregunte cómo puede ayudar." | "Chiari symptoms often are not noticed (not noticeable). Ask how you can help." | "Chiari symptoms often don't show. Ask how you can help." | "No se notan" can mean the person doesn't notice or feel them, which suggests mild symptoms. The English means other people can't see them (an invisible illness). This is a shareable graphic, so the misreading would spread. | "Los síntomas de Chiari a menudo no se ven. Pregunte cómo puede ayudar." |
| 5 | low | `figure.labels.syrinxNote` | "cavidad de líquido en la médula" | "fluid cavity in the cord [bare *médula*]" | "fluid cavity in the cord" | Glossary slip: bare "médula" can mean bone marrow. This is the only place it appears; "médula espinal" is used everywhere else. | "cavidad de líquido en la médula espinal" |
| 6 | low | `explorer.layerNames.brain` vs `explorer.parts[0].name`, `figure.labels.cerebrum` | "Cerebro" (layer) and "Cerebro" (part) | "Brain" and "Cerebrum": the same word | "Brain" (layer) and "Cerebrum" (part) | In the Explorer, the same word names the whole-brain layer and the cerebrum part. The glossary allows "cerebro" for both, but here they appear side by side. The part texts use "encéfalo" for "brain", so the wording isn't consistent either. | For the translator to decide. One option: layer "Encéfalo", or part "Cerebro (hemisferios cerebrales)". |
| 7 | low | `about.how.checks` (last sentence) | "No han sido revisados por un profesional médico. Última revisión: 4 de noviembre de 2026." | "They have not been reviewed by a medical professional. Last review: November 4, 2026." | "…Last check: November 4, 2026." | "Revisión" repeats the word "revisados" from the sentence just before it. A reader could take it to mean some review did happen. The English deliberately says "check", matching "Comprobaciones de exactitud" elsewhere. | "Última comprobación: 4 de noviembre de 2026." |
| 8 | low | `tour.steps[0].text` | "Esta vista corta la cabeza y el cuello por la mitad." | "This view cuts the head and neck in half." | "This view is cut down the middle of the head and neck." | "Por la mitad" doesn't say which direction (it could be across). The English means a midline cut, top to bottom. | "Esta vista muestra la cabeza y el cuello cortados por la mitad, a lo largo de la línea media." |
| 9 | low | `prep.groups[3].questions[1].text` | "¿Soy candidato para la cirugía de descompresión? ¿Por qué sí o por qué no?" | "Am I a candidate [masculine] for decompression surgery? Why or why not?" | "Am I a candidate for decompression surgery? Why or why not?" | The masculine form is printed on a sheet the patient hands to their doctor, and many readers are women. | "¿La cirugía de descompresión es una opción para mí? ¿Por qué sí o por qué no?" |
| 10 | low | `support.donate` | "Donar en su sitio web" | "Donate on their / your website" | "Donate on their site" | "Su" can also mean "your", so it could read as "donate on your website". | "Donar en el sitio web de la organización" |
| 11 | low | `explorer.hint` | "Desplácese para acercar" | "Scroll to zoom in" | "Scroll to zoom" | Scrolling zooms both ways, but "acercar" only says "zoom in". | "Desplácese para acercar o alejar" |
| 12 | low | `calm.on` | "Tranquilo: sí" | "Calm: yes" | "Calm on" | Sounds unnatural as a status label. | "Modo tranquilo activado" (or "Tranquilo: activado" if space is tight) |
| 13 | low | `impact.openText` | "Cualquier organización puede tener su propia copia…" | "Any organization can have its own copy…" | "Any organization can run its own copy…" | Weaker: "have" is not "run". The point is that someone else could host the site. | "Cualquier organización puede poner en marcha su propia copia, cambiarla o hacerse cargo de ella…" |
| 14 | low | `studySummaries.NCT06724029.whatYoudDo` | "Para adultos que se operan de neurocirugía en uno de los hospitales de Italia que todavía aceptan personas nuevas" | "For adults who have neurosurgery at one of the hospitals in Italy that still accept new people" | "For adults having neurosurgery at one of the hospitals in Italy that are still taking new people" | The meaning is the same, but "operarse de neurocirugía" is unnatural Spanish (you have an operation *for* a condition, not *of* a specialty). | "Para adultos a quienes se les hará una neurocirugía en uno de los hospitales de Italia que todavía aceptan participantes nuevos (la ficha oficial muestra cuáles)." |
| 15 | low | `about.how.factsAfter` | "y de investigaciones revisadas por expertos" | "and expert-reviewed research" | "and peer-reviewed research" | Understandable, but the standard term is "revisadas por pares". | "y de investigaciones revisadas por pares, que se indican en cada página." |
| 16 | low (optional) | `figure.labels.foramenNoteSurgery`, figure captions, Explorer and tour notes ("línea punteada", 9 places) | "línea punteada" | "dotted line" | "dashed line" | Strictly, "punteada" means dotted and "discontinua" means dashed. In U.S. Latin American usage "punteada" is widely used for both and is clearer to patients. It is used consistently, so leaving it is fine. | No change needed. If the translator prefers it: "línea discontinua" everywhere. |

### Intentional differences (listed as asked; no change suggested)

| Key | Spanish | Back-translation | English | Note |
| --- | --- | --- | --- | --- |
| `translation.notice` | "Traducción pendiente de revisión por un traductor médico. Se hizo con ayuda de herramientas de inteligencia artificial, y la versión en inglés es la de referencia." | "Translation pending review by a medical translator. It was made with the help of artificial intelligence tools, and the English version is the reference version." | "…It was made with the help of AI tools, and the English version is the reference." | intentional; faithful |
| `studies.officialLabel`, `studies.listingLink`, `studies.unavailable` | "…(en inglés)" | "…(in English)" | no "(in English)" | intentional: the content stays in English |
| `model.downloads[2].file` | "Juego de figuras con nombres (en inglés)" | "Set of labeled figures (in English)" | "Figure set, labeled" | intentional |
| `support.notAffiliated` | "…Sus sitios web pueden estar solo en inglés." | "…Their websites may be in English only." | (no such sentence) | intentional |
| `home.tools.items[1].title`, `explain.title` | "Explain It (Explíquelo)" | "Explain It (Explain it)" | "Explain It" | intentional (glossary: Explíquelo added where the tool is introduced) |
| `header.espanol` | "English" | "English" | "Español" | intentional: the language switch names the other language |
| `explain.starterNote` (overall) | Re-written in fewer words to fit 280 characters | (see row 1) | Built from three approved COPY.md sentences | intentional. The meaning is preserved apart from row 1. Because it no longer reuses approved sentences word for word, Matthew should approve it as new wording. |
| `_note` fields (`privacy._note`, `explain._note`, etc.) | Translator notes | | Approval notes | Internal notes, not shown to visitors; their content differs on purpose |

### Other observations (not translation errors)

- `privacy.counted.after`: "No guarda su dirección…" means "your address". Spanish readers will first think of a
  street address. The English "address" is just as vague. If it means the IP address, both languages could say
  "dirección IP", but that changes the approved English privacy text and needs Matthew's approval.
- The glossary leaves "siringe" or "siringa" for the translator to choose. The site uses "siringe" consistently
  (17 places), and never "quiste".

## What was fine

- **Numbers and measurements:** all match, including about 5 mm, about 12 mm, 160 people, 5 to 25 mm, ages 18 to 50,
  30 days, 1080 × 1080 and 8 per page.
- **Placeholders:** `{n}`, `{date}`, `{title}`, `{total}`, `{nct}` and `{result}` are all present in the matching
  keys, and so is the `[Before launch: …]` placeholder in `support.checked`. Dates are formatted for Spanish
  (`es-US`) on the Studies and Impact pages, so "procesados el {date}" reads correctly.
- **Required captions:** present everywhere: "Ilustración, no es una imagen médica", "Flujo del líquido
  simplificado", and the midline note ("se muestran en su punto más bajo, donde se miden en la resonancia
  magnética"; the long version also says they really sit to each side of the midline).
- **Not medical advice:** the footer uses the glossary wording exactly ("No es consejo médico. Hable con su médico
  sobre su propia atención médica."). The printed sheet, Studies, Model and Impact pages keep their own
  not-advice lines.
- **Honesty about review:** "not reviewed by a medical professional" is kept on About, Open model and Impact.
- **Privacy statements match the English:** the note is not in the link; the view goes after the #, which browsers
  don't send; Open Chiari's own counter uses no cookies, builds no profile and receives only the action name; the
  visit prep sheet and the "Near" box stay on the device; calm mode and language are stored only in the browser;
  fonts and 3D files are self-hosted; studies are fetched by the site, not the visitor's browser.
- **Licensing and credits:** complete and correct in the footer, Open model (`basedOnRest`, `creditLine`,
  `creditIntro` share-alike), Impact (MIT and CC BY-SA 4.0) and the kit license. NINDS and ClinicalTrials.gov
  credits are present, and so is "Resúmenes simplificados por Open Chiari."
- **Medical notes faithful:** the Explorer condition notes and short notes (Typical, Chiari I, syrinx, after
  decompression), all 12 structure cards, figure screen-reader descriptions, Home "Who has it", "How it's found",
  symptoms list, both myths, Explain It "What you're looking at" and "How you can help", and tour steps 2, 3 and 5.
- **Glossary:** "amígdalas cerebelosas" is always the full term (29 places, none bare); "médula espinal" is used
  everywhere except row 5; "líquido cefalorraquídeo (LCR)", "agujero magno", "tronco encefálico" and "resonancia
  magnética de flujo (cine-RM)" follow the list.
- **Formal "usted":** used throughout. No "tú" forms were found (checked automatically and by reading).
- **Study summaries:** both are faithful, including the eligibility limits, "ask the study team what counts", the
  Amiens hospital, "the study doesn't change anyone's treatment", and "the listing doesn't say".
- **Grammar and agreement:** no other errors were found. The text reads naturally for U.S. Spanish speakers apart
  from rows 12 and 14.
