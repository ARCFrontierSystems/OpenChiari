# Spanish translation: independent back-translation check (second pass)

**Date:** 2026-11-05
**Checker:** a fresh agent that did not write the translation (CLAUDE.md rule 1a, step 3)
**What was checked:** the frozen copy of all Spanish site text
(`docs/audits/sources/2026-11-05-spanish/back-translation-source-es.json`, identical to the live `src/i18n/es.json`
at the time of the check) and the two Spanish study summaries
(`docs/audits/sources/2026-11-05-spanish/back-translation-source-studies.json`, identical to the `es` fields in
`src/data/study-summaries.json`).
**Method:** first, every Spanish string was translated back into plain English *without* looking at the English
(saved as `docs/audits/sources/2026-11-05-spanish/back-translation.json`). No earlier back-translation, audit,
COPY.md or SPANISH-REVIEW.md was opened. Then that back-translation was compared key by key with `src/i18n/en.json`
and the English study summaries, and the Spanish was checked against `docs/SPANISH-GLOSSARY.md`.

## In plain language

The Spanish says the same thing as the English. **No high or medium problems were found.** No medical fact is
stronger or weaker than in the English, no number has changed, no body part has been swapped, nothing reads as
medical advice, and the privacy and licensing statements match. Every placeholder (the slots the site fills in, such
as the date or a count) is still in place. Spanish dates also come out in Spanish ("5 de noviembre de 2026").

The glossary is followed: "amígdalas cerebelosas" every time (never "amígdalas" alone), "médula espinal" every time
(never "médula" alone), and "siringe" as the only word for syrinx. Every sentence uses formal "usted". The Explain It
starter note is 273 characters, under the 280 limit.

There are **10 small (low) items**. Most are wording polish for a Spanish-speaking patient. The one closest to
meaning: the advice to ask the study team "cuánto le costará" ("how much it will cost you") sounds as if every study
costs money. The English is more neutral ("what it costs you"). None of the 10 blocks publishing. Three of them touch
medical sentences (rows 1, 3 and 4), so changing those needs Matthew's approval and should go to the medical translator.

The known open question remains: "Cerebro" is used both for the cerebrum and for the brain as a whole, and two
structure cards use "encéfalo" for the brain instead. The medical translator should settle this.

## Findings

Severity: **high** = changes a medical meaning or a privacy/licensing promise; **medium** = could mislead or confuse;
**low** = wording, naturalness or consistency; **intentional** = a planned difference, listed for completeness.

| # | Severity | Key | Spanish | Back-translation | English | Problem | Suggested Spanish fix |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | low | `studies.before.wide` | "…en qué consiste, cuánto le costará y cómo se usan sus datos." | "…what it involves, how much it will cost you and how your data are used." | "…what's involved, what it costs you, and how your data is used." | "Cuánto le costará" assumes there is a cost. Many studies cost participants nothing. The English is neutral. | "…en qué consiste, si tiene algún costo para usted y cómo se usan sus datos." |
| 2 | low | `explorer.parts[9].text` (C2) | "Su saliente hacia arriba, la apófisis odontoides, está justo delante de la médula espinal." | "Its upward projection, the odontoid process, is just in front of the spinal cord." | "Its upward peg, the dens, sits just in front of the spinal cord." | Meaning matches, but "apófisis odontoides" is a technical term that isn't in the glossary, so the translator won't see it on the word list. | Keep the wording. Add a glossary row: dens = "apófisis odontoides" ("standard; translator: please confirm"). |
| 3 | low | `prep.groups[3].questions[0].text` | "¿Cuáles son mis opciones de tratamiento, incluido el seguimiento?" | "What are my treatment options, including follow-up?" | "What are my treatment options, including monitoring?" | "Monitoring" here means watching the condition without surgery. "Seguimiento" is more often read as follow-up *after* treatment. | "¿Cuáles son mis opciones de tratamiento, incluida la vigilancia con controles periódicos?" |
| 4 | low | `home.whatIs.whatItIs.wide` and `.narrow` | "…relacionada con que la parte posterior e inferior del cráneo es más pequeña o tiene otra forma, lo que deja poco espacio al cerebro." | "…related to the back and lower part of the skull being smaller or having another shape, which leaves little room for the brain." | "…linked to a lower back part of the skull that is smaller or shaped differently than usual, which crowds the brain." | "Than usual" is dropped ("smaller" than what?). After "relacionada con que", the subjunctive reads more naturally. Same meaning otherwise. | "…relacionada con que la parte posterior e inferior del cráneo sea más pequeña de lo habitual o tenga otra forma, lo que deja poco espacio al cerebro." |
| 5 | low | `home.whatIs.howFound.wide` | "El médico revisa las imágenes junto con sus síntomas." | "The doctor reviews the images together with your [or: his/her] symptoms." | "A doctor looks at the scan together with your symptoms." | "Sus" can also be read as "the doctor's symptoms". Context makes the meaning clear, but it's avoidable. | "El médico revisa las imágenes junto con los síntomas que usted tiene." |
| 6 | low | `home.tools.items[1].wide` | "Envíe a su familia, a sus maestros o a su empleador…" | "Send your family, your teachers or your employer…" | "Send family, teachers or your employer…" | "Sus maestros" means "your (own) teachers". The English also covers a parent writing to a child's teachers. | "Envíe a su familia, a los maestros o a su empleador…" |
| 7 | low | `support.other[1].title` | "Difunda información en septiembre" | "Spread information in September" | "Spread awareness in September" | Loses "awareness", which ties the line to Chiari Awareness Month. | "Ayude a crear conciencia en septiembre" |
| 8 | low | `footer.links.about` | "Acerca de y contacto" | "About and contact" | "About and contact" | Literal. In Spanish "Acerca de" without an object sounds unfinished. | "Acerca del sitio y contacto" (or "Quiénes somos y contacto") |
| 9 | low | `explorer.hint` | "Arrastre para girar · Desplácese para acercar o alejar · Mayús y arrastrar para mover" | "Drag to rotate · Scroll to zoom in or out · Shift and drag to move" | "Drag to rotate · Scroll to zoom · Shift-drag to move" | The third item switches from "usted" commands to an infinitive ("arrastrar"). | "Arrastre para girar · Desplácese para acercar o alejar · Mantenga Mayús y arrastre para mover" |
| 10 | low | `explain._note` (not shown to visitors) | "…esta versión dice lo mismo en menos palabras (277 caracteres)." | "…(277 characters)." | n/a | The starter note is actually 273 characters. The internal note is out of date. | Change "277" to "273". |
| 11 | intentional | `translation.notice`, `translation.noticeShort`, `translation.link` | "Traducción pendiente de revisión por un traductor médico. Se hizo con ayuda de herramientas de inteligencia artificial, y la versión en inglés es la de referencia." | "Translation pending review by a medical translator. It was made with the help of artificial intelligence tools, and the English version is the reference version." | (same notice) | Matches the English notice. Shown only on Spanish pages. | None |
| 12 | intentional | `studies.officialLabel`, `studies.listingLink`, `studies.unavailable` | "De la ficha oficial (en inglés)"; "{nct} en ClinicalTrials.gov (en inglés)"; "…en ClinicalTrials.gov (en inglés)." | "…(in English)" | No "(in English)" | Planned label: these listings are in English. | None |
| 13 | intentional | `model.downloads[2].file` | "Juego de figuras con nombres (en inglés)" | "Set of figures with names (in English)" | "Figure set, labeled" | Planned label: the figure labels are in English. | None |
| 14 | intentional | `support.notAffiliated` | "…y no recibe nada de las donaciones. Sus sitios web pueden estar solo en inglés." | "…receives nothing from the donations. Their websites may be in English only." | "…receives nothing from donations." | Planned extra sentence. | None |
| 15 | intentional | `home.tools.items[1].title`, `explain.title` | "Explain It (Explíquelo)" | "Explain It (Explain it)" | "Explain It" | Glossary rule: the brand name stays in English, with a Spanish gloss where it's introduced. | None |
| 16 | intentional | `header.espanol` | "English" | "English" | "Español" | The language switch names the *other* language. | None |
| 17 | intentional | `explain.starterNote` | "En la malformación de Chiari, la parte más baja del cerebelo queda bajo la abertura en la base del cráneo y puede reducir el espacio del líquido cefalorraquídeo. Esto puede causar dolor de cabeza y otros síntomas, que pueden ir y venir, a menudo con pocas señales visibles." (273 characters) | "In Chiari malformation, the lowest part of the cerebellum sits below the opening at the base of the skull and can reduce the cerebrospinal fluid space. This can cause headache and other symptoms, which can come and go, often with few visible signs." | "In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. This can crowd the space where spinal fluid flows, which can cause headaches and other symptoms. Symptoms can come and go, often with few outward signs." | Shortened to fit 280 characters. Meaning is the same: "the base of the skull" is the same opening, and the hedges "can" and "often" are kept. | None |
| 18 | open question (for the translator) | `figure.labels.cerebrum`, `explorer.parts[0].name`, `explorer.layerNames.brain`; also `explorer.parts[0].text` and `explorer.parts[2].text` | "Cerebro" (cerebrum label) and "Cerebro" (Brain layer). Cards: "La parte más grande del encéfalo…", "La parte de atrás del encéfalo…" | "Brain" for both cerebrum and brain; "encéfalo" = brain (technical) | "Cerebrum" / "Brain"; "The largest part of the brain…"; "The back part of the brain…" | Already known: one Spanish word for two English words. The two cards also use "encéfalo" for "brain", while the glossary says "cerebro in plain text". This avoids "Cerebro: the largest part of the cerebro", but it's a second word for the same thing. | Translator to decide. For example: "Cerebro" for cerebrum and "encéfalo (cerebro)" for the whole brain once per page, or keep as is. Then update the glossary to match. |

## What was fine

- **Medical meaning, all of it.** Every condition note, structure card, tour step, side-by-side note, Home section,
  myth, symptom, figure caption and screen-reader description says the same as the English. The hedging words are
  kept: "puede" = can, "a menudo" = often, "suelen" = usually, "la mayoría" = most, "algunas" = some. Nothing that is
  "can" in English became "does", or the other way round. "Sobre todo" for "most often" (syrinx in the neck part of
  the spinal cord) has the same meaning.
- **Numbers.** About 5 mm cutoff; a study of 160 people; average about 12 mm; range 5 to 25 mm; ages 18 to 50; 30
  days; 1080 × 1080; 8 per page; 2-minute tour. All match.
- **Surgery wording.** "Mejora o estabiliza los síntomas en la mayoría de las personas… puede no revertirse por
  completo… algunas personas necesitan más de una operación… la cirugía no es adecuada para todos" carries every
  limit in the English. The tonsils "a menudo suben solo en parte" (often rise only partly) is kept.
- **Not medical advice.** "No es consejo médico" plus "Hable con su médico sobre su propia atención médica" appear
  in the footer, and "No es consejo médico" also appears on the printed sheet, the studies credit, the Open model
  footnote, the Impact footer and the About principles. The doctor questions on Visit prep stay as questions to ask
  a doctor.
- **Required captions.** "Ilustración, no es una imagen médica", "Flujo del líquido simplificado" and the midline
  note ("se muestran en su punto más bajo, donde se miden en la resonancia magnética"; "en realidad, están justo a
  cada lado de la línea media") are all present.
- **Accuracy-checks honesty.** About, Open model and Impact all say the content has *not* been reviewed by a medical
  professional ("No han sido revisados por un profesional médico" / "no revisado(s) por un profesional médico").
- **Privacy.** Same promises as the English. The note goes in the message, not the link. The link holds only the
  view, after the "#", which browsers don't send. The counter never receives it. No cookies and no profile. Only the
  action name is sent. The "Cerca de" (Near) box stays on the device. Calm mode and language stay in the browser.
  Fonts and 3D files are self-hosted. Studies are fetched by the site, not the visitor's browser.
- **Licensing and credits.** The 3D model credit (Open Chiari, CC BY-SA 4.0, Z-Anatomy CC BY-SA 4.0, BodyParts3D
  © The Database Center for Life Science CC BY-SA 2.1 JP) is complete in the footer, on Open model and in the credit
  line. "Comparta cualquier versión modificada con la misma licencia" keeps the share-alike condition. MIT for the
  code. The NINDS credit and the ClinicalTrials.gov credit (with processed date and "Resúmenes simplificados por Open
  Chiari") are present.
- **Placeholders.** `{n}`, `{date}`, `{title}`, `{total}`, `{nct}` and `{result}` are all kept, and every key in
  en.json exists in the Spanish with the same structure. Dates are formatted in Spanish (es-US) by the pages, so
  "procesados el {date}" reads "procesados el 5 de noviembre de 2026".
- **Glossary.** "Amígdala(s) cerebelosa(s)" every time; "médula espinal" every time; "siringe" only (no "siringa"
  or "quiste"); "líquido cefalorraquídeo (LCR)"; "agujero magno"; "tronco encefálico"; "resonancia magnética
  (cine-RM)"; "cirugía de descompresión"; "Modo tranquilo", "Explorador 3D", "Estudios de investigación", "Prepare su
  cita médica", "Modelo abierto" and "Kit de concientización" as listed.
- **Formal "usted".** Used throughout (e.g. "Envíe", "Marque", "Escanee", "Úselos", "Hable con su médico"). No
  "tú" or "vosotros" forms were found.
- **Study summaries.** Both Spanish summaries match the approved English: eligibility (18 to 50, no past brain or
  spine surgery, not for people who can't have an MRI, are pregnant or breastfeeding), Amiens, Italy, "the listing
  doesn't say", and "the study doesn't change anyone's treatment". "Cirugía del cerebro o la columna" correctly
  renders "brain and spine surgery" as the field.
- **Starter note length.** 273 characters (limit 280).
- **Naturalness.** Apart from the low items above, the Spanish reads as plain, neutral Latin American Spanish
  suitable for U.S. readers ("sala de emergencias", "código postal", "computadora").
