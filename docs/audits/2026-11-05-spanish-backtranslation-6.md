# Spanish translation: back-translation check of the Explorer accuracy panel and tool buttons (sixth pass)

**Date:** 2026-11-05
**Checker:** a fresh agent that did not write the Spanish (CLAUDE.md rule 1a, step 3)
**What was checked:** in `src/i18n/es.json` compared with `src/i18n/en.json`: `explorer.accuracy` (all strings and
every row), `explorer.switcher`, `explorer.partActions`, `explorer.cameraViews.close` and `explorer.viewNames.close`.
**Method:** I translated each Spanish string literally back into English and compared it with the English. I looked
hardest at numbers, ranges, "at least", "on average" and "by definition". I checked register (usted), the terms in
`docs/SPANISH-GLOSSARY.md`, the rest of `es.json` (same words for the same things), and how `src/pages/explorer.astro`
uses the strings (the switcher fills `{name}` with `explorer.conditions.*.short`; the accuracy rows show next to the
model labels `explorer.simple` / `explorer.realistic`). Both files have the same keys and the same number of rows.

## Overall verdict

**Safe to publish after one fix. No number, range or qualifier is wrong.** Every number, "at least", "on average",
"by definition", "±", "×" and range matches the English. Glossary terms are used correctly: *amígdalas cerebelosas*
(always the full term), *canal espinal*, *siringe*. No *tú* forms; buttons use infinitives, like the rest of the
Explorer.

**Skull opening.** *Abertura del cráneo* matches the site: it is used 13 other times in `es.json` wherever the English
says "skull opening" (figure text, condition notes, surgery steps, `viewNames.close`, MRI glossary). *Agujero magno* is
kept for the labelled term "foramen magnum", as the glossary says. No change needed. Optional: add
"skull opening → abertura del cráneo" to the glossary, since the site uses it as a set term.

**Decimals.** The only decimals in `es.json` are in this panel (14,5 mm; 2,5 × 3 cm; 2,5 cm), and all use a decimal
comma, so the panel is consistent with itself and the site. Note for the medical translator: the glossary says
"Numbers keep the English style", and Spanish in Mexico and the United States usually writes a decimal point (14.5).
Neither is wrong; the translator may want to choose one and write it in the glossary.

### Recommended changes

1. **Medium: model name "(Simple)" does not match the button.** The Spanish model switch says **Sencillo**
   (`explorer.simple`), but two accuracy rows say "(Simple)". A reader can't match the row to the button.
   - `accuracy.rows.typical[1].model`: **"Unos 35 mm (Sencillo), 38 mm (Realista)"**
   - `accuracy.rows.typical[2].model`: **"Unos 14,5 mm (Sencillo)"**
2. **Low: "unos 1 mm" is ungrammatical.** *Unos* is plural and can't go with 1. Use *alrededor de*.
   - `accuracy.rows.typical[0].model`: **"Alrededor de 1 mm por encima de la línea punteada"**
   - `accuracy.rows.typical[0].published`: **"En promedio, alrededor de 1 mm por encima; rango normal de unos 7 mm
     por encima a 5 mm por debajo"**
3. **Low: "Mostrar típica" has no noun.** The feminine adjective hangs alone ("Show typical [fem.]"). The condition is
   called *Anatomía típica* elsewhere. `switcher.toTypical`: **"Mostrar anatomía típica"**

### Optional

- `accuracy.rows.syrinx[1].model`: "con forma de cuentas" while the next cell says "en forma de cuentas". For the same
  wording and a clearer phrase: **"En la parte de la médula espinal que está en el cuello, en forma de cuentas"**.
- `accuracy.rows.surgery[1].published`: "según cada paciente" reads as "depending on each patient"; the English
  "sized to each patient" is closer to **"adaptado a cada paciente"**.
- `partActions.zoom`: "Acercar a esta parte" is understood, but **"Acercar la vista a esta parte"** says plainly that
  the view moves.
- `switcher.toCondition` ("Mostrar {name}") gets a capitalized short name: "Mostrar Con siringe", "Mostrar Después de
  la cirugía". English has the same thing ("Show With syrinx"). This is a code matter (lower-case the first letter, or
  use a separate label) and not a translation error.
- *Línea punteada* literally means "dotted line"; the English says "dashed". It is used the same way 12 times on the
  site and is common for a dashed line in Latin American Spanish. No change.

## Table

| Key | Spanish | Back-translation | English | Verdict | Fix |
| --- | --- | --- | --- | --- | --- |
| accuracy.title | ¿Qué tan cerca está de la anatomía real? | How close is it to real anatomy? | How close is this to real anatomy? | OK | — |
| accuracy.intro | Cada medida se compara automáticamente con estudios publicados cada vez que cambia el modelo. Las personas reales varían; este es un ejemplo representativo. | Each measurement is compared automatically with published studies every time the model changes. Real people vary; this is a representative example. | Each measurement is checked automatically against published studies whenever the model changes. Real people vary; this is one representative example. | OK | — |
| accuracy.feature | Característica | Feature | Feature | OK | — |
| accuracy.model | Este modelo | This model | This model | OK | — |
| accuracy.published | Estudios publicados | Published studies | Published studies | OK | — |
| accuracy.more | Fuentes en las notas de evidencia | Sources in the evidence notes | Sources in the evidence notes | OK (*notas de evidencia* used 6 times on the site) | — |
| rows.typical[0].feature | Punta de las amígdalas cerebelosas | Tip of the cerebellar tonsils | Tonsil tip | OK (glossary full term) | — |
| rows.typical[0].model | Unos 1 mm por encima de la línea punteada | About 1 mm above the dotted line | About 1 mm above the dashed line | Meaning OK; grammar error (*unos* + 1) | Alrededor de 1 mm por encima de la línea punteada |
| rows.typical[0].published | Promedio de unos 1 mm por encima; rango normal de unos 7 mm por encima a 5 mm por debajo | Average of about 1 mm above; normal range of about 7 mm above to 5 mm below | Average about 1 mm above; normal range about 7 mm above to 5 mm below | Numbers OK; same grammar error | En promedio, alrededor de 1 mm por encima; rango normal de unos 7 mm por encima a 5 mm por debajo |
| rows.typical[1].feature | Abertura del cráneo, de adelante hacia atrás | Skull opening, from front to back | Skull opening, front to back | OK (matches 13 other uses) | — |
| rows.typical[1].model | Unos 35 mm (Simple), 38 mm (Realista) | About 35 mm (Simple), 38 mm (Realistic) | About 35 mm (Simple), 38 mm (Realistic) | Fix: the button is *Sencillo* | Unos 35 mm (Sencillo), 38 mm (Realista) |
| rows.typical[1].published | Unos 33 a 36 mm; 36 ± 3 mm en un estudio de adultos sanos | About 33 to 36 mm; 36 ± 3 mm in a study of healthy adults | About 33 to 36 mm; 36 ± 3 mm in one study of healthy adults | OK | — |
| rows.typical[2].feature | Canal espinal en el cuello | Spinal canal in the neck | Spinal canal in the neck | OK (glossary) | — |
| rows.typical[2].model | Unos 14,5 mm (Simple) | About 14.5 mm (Simple) | About 14.5 mm (Simple) | Fix: the button is *Sencillo*; decimal comma consistent | Unos 14,5 mm (Sencillo) |
| rows.typical[2].published | 13 a 15 mm en adultos | 13 to 15 mm in adults | 13 to 15 mm in adults | OK | — |
| rows.chiari[0].feature | Punta de las amígdalas cerebelosas | Tip of the cerebellar tonsils | Tonsil tip | OK | — |
| rows.chiari[0].model | Unos 12 mm por debajo de la línea punteada | About 12 mm below the dotted line | About 12 mm below the dashed line | OK | — |
| rows.chiari[0].published | Al menos unos 5 mm por debajo, por definición; unos 12 mm en promedio (de 5 a 25 mm) en un estudio de 160 personas con Chiari I | At least about 5 mm below, by definition; about 12 mm on average (from 5 to 25 mm) in a study of 160 people with Chiari I | At least about 5 mm below by definition; about 12 mm on average (5 to 25 mm) in a study of 160 people with Chiari I | OK ("at least", "by definition", "on average", range and 160 all kept) | — |
| rows.chiari[1].feature | Forma de las amígdalas cerebelosas | Shape of the cerebellar tonsils | Tonsil shape | OK | — |
| rows.chiari[1].model | Puntiaguda | Pointed (agrees with *forma*) | Pointed | OK | — |
| rows.chiari[1].published | A menudo puntiagudas (en forma de clavija) en lugar de redondeadas | Often pointed (peg-shaped) instead of rounded | Often pointed (peg-like) rather than rounded | OK (*clavija* used the same way elsewhere) | — |
| rows.syrinx[0].feature | Punta de las amígdalas cerebelosas | Tip of the cerebellar tonsils | Tonsil tip | OK | — |
| rows.syrinx[0].model | Unos 12 mm por debajo de la línea punteada | About 12 mm below the dotted line | About 12 mm below the dashed line | OK | — |
| rows.syrinx[0].published | (same as rows.chiari[0].published) | (same) | (same) | OK | — |
| rows.syrinx[1].feature | Siringe | Syrinx | Syrinx | OK (glossary) | — |
| rows.syrinx[1].model | En la parte de la médula espinal del cuello, con forma de cuentas | In the part of the spinal cord of the neck, bead-shaped | In the neck part of the cord, beaded | OK; slightly awkward, and *con forma* vs *en forma* in the next cell | Optional: En la parte de la médula espinal que está en el cuello, en forma de cuentas |
| rows.syrinx[1].published | Sobre todo en la parte del cuello; larga, en forma de huso o de cuentas, de unas 5 vértebras de largo en promedio | Mostly in the neck part; long, spindle-shaped or bead-shaped, about 5 vertebrae long on average | Most often in the neck part; long, spindle-shaped or beaded, about 5 vertebrae long on average | OK ("on average" kept) | — |
| rows.surgery[0].feature | Punta de las amígdalas cerebelosas | Tip of the cerebellar tonsils | Tonsil tip | OK | — |
| rows.surgery[0].model | Unos 10 mm por debajo de la línea; subió unos 2 mm | About 10 mm below the line; it rose about 2 mm | About 10 mm below the line, risen about 2 mm | OK | — |
| rows.surgery[0].published | A menudo suben solo en parte: unos 2 mm en promedio en un estudio | They often rise only partly: about 2 mm on average in one study | Often rise only partly: about 2 mm on average in one study | OK | — |
| rows.surgery[1].feature | Hueso retirado | Bone removed | Bone removed | OK (same as surgery labels) | — |
| rows.surgery[1].model | Unos 30 × 25 mm en la parte de atrás de la abertura del cráneo, y los 25 mm del medio del arco de atrás del primer hueso del cuello | About 30 × 25 mm at the back of the skull opening, and the middle 25 mm of the back arch of the first bone of the neck | About 30 × 25 mm at the back of the skull opening, and the middle 25 mm of the first neck bone's back arch | OK | — |
| rows.surgery[1].published | Unos pocos centímetros, según cada paciente (por ejemplo, 2,5 × 3 cm); unos 2,5 cm del arco del primer hueso del cuello | A few centimeters, depending on each patient (for example, 2.5 × 3 cm); about 2.5 cm of the arch of the first bone of the neck | A few centimeters, sized to each patient (for example 2.5 × 3 cm); about 2.5 cm of the first neck bone's arch | OK; small nuance | Optional: …, adaptado a cada paciente (por ejemplo, 2,5 × 3 cm); … |
| switcher.toTypical | Mostrar típica | Show typical [fem., no noun] | Show typical | Low: adjective with no noun | Mostrar anatomía típica |
| switcher.toCondition | Mostrar {name} | Show {name} | Show {name} | OK (capitalized `{name}` mid-phrase is a code matter, same in English) | — |
| switcher.pause | Pausar el flujo | Pause the flow | Pause flow | OK | — |
| switcher.slow | Lento | Slow | Slow | OK | — |
| partActions.partTools | Esta parte | This part | This part | OK | — |
| partActions.zoom | Acercar a esta parte | Bring closer to this part / zoom in to this part | Zoom to this part | OK | Optional: Acercar la vista a esta parte |
| partActions.only | Mostrar solo esta parte | Show only this part | Show only this part | OK | — |
| partActions.hide | Ocultar esta parte | Hide this part | Hide this part | OK | — |
| partActions.all | Mostrar todas las partes | Show all parts | Show all parts | OK | — |
| cameraViews.close | De cerca | Up close | Close-up | OK | — |
| viewNames.close | Vista de cerca de la abertura del cráneo | Close-up view of the skull opening | Close-up of the skull opening | OK (also read in lower case by `explain.astro`; still fine) | — |
