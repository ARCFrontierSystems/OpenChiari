# Spanish translation: back-translation check of the "Make your own" builder (fifth pass)

**Date:** 2026-11-05
**Checker:** a fresh agent that did not write the Spanish (CLAUDE.md rule 1a, step 3)
**What was checked:** every string in `kit.builder` in `src/i18n/es.json` (working tree, uncommitted), compared
with `kit.builder` in `src/i18n/en.json`. **Not re-checked:** `kit.builder.messages` and `kit.builder.label`,
which `docs/audits/2026-11-05-make-your-own-audit.md` already covers.
**Method:** I translated each Spanish string literally back into English, compared it with the English, and checked it
against `docs/SPANISH-GLOSSARY.md`, the rest of `kit` in `es.json` and how `src/pages/kit.astro` uses each string
(placeholders, button toggles, screen-reader description). Both files have the same set of keys under `kit.builder`
(none missing, none extra).

## Overall verdict

**Safe to publish. No high-severity problems.** None of these strings is medical. Site text uses "usted"
throughout, and no "tú" slips in except for one ambiguous verb form (B19). The counter keeps both placeholders and
reads naturally. `stickerDefault` matches the approved sticker phrase word for word.

Recommended changes (all low, about clarity and consistency):

1. **B19 `figureHint`: "Agrega…" can be read as an informal command.** *Agrega* is both "it adds" and the "tú"
   imperative "add!". In a form hint, many readers will take it as "tú", which clashes with the "usted" used everywhere
   else. Fix: **"Se agrega la imagen con su leyenda y el crédito del modelo 3D."** Adding "3D" also stops "el crédito del
   modelo" being read as credit to a person.
2. **B8 `messageHint`: "imagen" for "graphic".** The builder uses *imagen* for both the whole graphic and the picture of
   Chiari (`figure`, `describe.figure`). In the sentence "Los datos médicos solo vienen de esta lista, para que cada
   imagen sea correcta", *imagen* sounds like the picture. The kit uses *gráficos* for "graphics" (`kit.intro`,
   `kit.license`). Fix: **"…para que cada gráfico sea correcto."**
3. **B15 `starters`: "una de las nuestras" has no clear noun.** It refers back to *palabras*, so it can read as "one of
   our words". *Las nuestras* is also a set phrase for "our people / our side". Fix: **"O empiece con una de nuestras
   frases:"**
4. **Poster term outside the builder (consistency).** The builder says **Póster** (`designs.poster.label`) and so does the
   Home card (`home.tools.items[7]`: *pósteres*). The kit list still says **Cartel** (`kit.items.poster.title`: "Cartel
   y folleto para eventos"). Pick one. *Póster* has two of the three uses, so change that title to **"Póster y folleto
   para eventos"**, and add *poster → póster*, *sticker → calcomanía* and *logo → logotipo* to the glossary.

Optional:

- B11 `counter`: the code fills the placeholders by plain replacement, so at 1 letter left it shows "Quedan 1 de 120
  letras" (the singular is *Queda 1*). This is rare, since the field holds 120. Leave it, or handle the singular in code.
- B10 `ownHint`: "Camino por mi hija Emma" is fine. *Camino* can also be read as the noun "path", though, and
  **"Caminamos por mi hija Emma"** removes that and suits group walks.
- B17 `step3`: "Aspecto y descarga" ("Look and download") leaves out printing, while "Look and save" covers both. A
  reader won't be misled, so no change is needed.

## Table

Verdicts: **OK** = same meaning, right register, consistent. **Low** = small wording or consistency fix.

| # | Key | Spanish | Literal back-translation | English | Verdict | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | `title` | Haga su propio diseño | Make your own design | Make your own | OK | None. Matches `kit.orgsText`, which quotes it ("Use \"Haga su propio diseño\""). |
| B2 | `intro` | Elija un diseño y un mensaje, agregue sus propias palabras, un logotipo o una foto, y descárguelo. Todo ocurre en su dispositivo: nada de lo que agregue se envía ni se guarda. | Choose a design and a message, add your own words, a logo or a photo, and download it. Everything happens on your device: nothing that you add is sent or saved. | Choose a design and message, add your own words, a logo or photo, and download it. Everything happens on your device: nothing you add is sent or saved. | OK | None. Usted ✓. *Lo* in *descárguelo* agrees with *diseño* ✓. *Logotipo* ✓. |
| B3 | `step1` | ¿Qué quiere hacer? | What do you want to make/do? | What do you want to make? | OK | None. *Hacer* covers "make" and "do", and the design choices right below make it clear. |
| B4 | `designs.square.label` / `.hint` | Publicación cuadrada / Para Instagram y Facebook | Square post / For Instagram and Facebook | Square post / For Instagram and Facebook | OK | None. Same as `kit.items.social.title`. |
| B5 | `designs.story.label` / `.hint` | Historia / Vertical, para historias | Story / Vertical, for stories | Story / Tall, for stories | OK | None. "Vertical" is the natural word for "tall" here. *Historias* is the Spanish Instagram/Facebook term, and `kit.items.quote.format` already uses "de historia". |
| B6 | `designs.poster.label` / `.hint` | Póster / Para imprimir | Poster / To print | Poster / To print | OK (see Low note) | None in the builder. `kit.items.poster.title` says "Cartel", so change it to "Póster y folleto para eventos" to match this and the Home card's "pósteres". |
| B7 | `designs.stickers.label` / `.hint` | Calcomanías / Para imprimir | Stickers / To print | Stickers / To print | OK | None. Matches `kit.stickers.title` and the other uses of *calcomanías* in the kit. |
| B8 | `step2`, `message`, `messageHint` | Sus palabras · Mensaje · Los datos médicos solo vienen de esta lista, para que cada imagen sea correcta. | Your words · Message · The medical facts only come from this list, so that each image is correct. | Your words · Message · Medical facts come only from this list, so every graphic stays accurate. | **Low** | "…para que cada **gráfico** sea correct**o**." *Imagen* is also this builder's word for the picture of Chiari (B18), and the kit calls the graphics *gráficos*. |
| B9 | `own` | Su propia frase (opcional) | Your own phrase (optional) | Your own line (optional) | OK | None. *Frase* is the right word for a line of text. Matches `describe.own` (B25). |
| B10 | `ownHint` | Por ejemplo: Camino por mi hija Emma | For example: I walk for my daughter Emma (or: Path for my daughter Emma) | For example: Walking for my daughter Emma | OK (optional) | Optional: "Por ejemplo: **Caminamos** por mi hija Emma". This is unambiguously a verb and fits a team walk. |
| B11 | `counter` | Quedan {left} de {max} letras | {left} of {max} letters remain | {left} of {max} letters left | OK | Both placeholders kept ✓ and natural word order ✓. `kit.astro` replaces `{left}` and `{max}` by name, so the order change is safe. Optional: at 1 the text is "Quedan 1…", where the singular is *Queda 1*. Rare, because the field holds 120. *Letras* is as loose as the English "letters" (spaces count too). Keep it for plain language. |
| B12 | `yours` | Sus propias palabras aparecen en un recuadro aparte, para que quede claro que son suyas. | Your own words appear in a separate box, so that it is clear they are yours. | Your own words appear in a separate box, so it is clear they are yours. | OK | None. |
| B13 | `name` / `when` | Nombre, grupo o evento (opcional) / Fecha y lugar (opcional) | Name, group or event (optional) / Date and place (optional) | same | OK | None. |
| B14 | `stickerText` / `stickerHint` | Sus palabras para las calcomanías / Hasta 3 líneas cortas. Aparecen en las 12 calcomanías. | Your words for the stickers / Up to 3 short lines. They appear on the 12 stickers. | Your sticker words / Up to 3 short lines. Shown on all 12 stickers. | OK | None. "En las 12 calcomanías" already means all twelve. *Calcomanías* ✓. |
| B15 | `starters` | O empiece con una de las nuestras: | Or start with one of ours: | Or start from one of ours: | **Low** | "O empiece con una de nuestras **frases**:". Without a noun, *una de las nuestras* points back to *palabras* ("one of our words") and echoes the set phrase "one of us". Usted ✓. |
| B16 | `stickerDefault` | Luchando contra Chiari | Fighting against Chiari | Chiari warrior | OK | None. Identical to `kit.stickers.sheets.everyone.messages[0]`, the approved neutral version from back-translation 4 (in place of the masculine "Guerrero contra Chiari"). `kit.astro` builds the starter buttons from the sheets, so the default is also the first starter ✓. No verb, so the register question does not arise. |
| B17 | `step3` | Aspecto y descarga | Appearance and download | Look and save | OK (optional) | Optional. "Descarga" leaves out the print/PDF button, while "save" covers both. Not misleading. |
| B18 | `color`, `colors.*` | Colores · Morado · Claro · Oscuro | Colors · Purple · Light · Dark | same | OK | None. Masculine *claro/oscuro* agrees with the implied *color* ✓. |
| B19 | `figure` / `figureHint` | Mostrar la imagen de Chiari / Agrega la imagen con su leyenda y el crédito del modelo. | Show the image of Chiari / Adds (**or: add! [tú]**) the image with its caption and the model's credit. | Show the picture of Chiari / Adds the picture with its caption and model credit. | **Low** (register) | `figureHint`: "**Se agrega** la imagen con su leyenda y el crédito del modelo **3D**." *Agrega* is also the "tú" command form, and site text uses usted. "Modelo 3D" makes the credit clear and matches `kit.license` ("el modelo 3D"). `figure` is fine: *imagen* matches `kit.socialHeadline` ("explicado en 1 imagen"). |
| B20 | `image` / `imageHint` | Logotipo o foto (opcional) / Se queda en su dispositivo. | Logo or photo (optional) / It stays on your device. | Logo or photo (optional) / It stays on your device. | OK | None. *Logotipo* is the kit-wide term ✓. |
| B21 | `imageAlt` | Su logotipo o foto | Your logo or photo | Your logo or photo | OK | None. Usted possessive ✓. Fine as alt text. |
| B22 | `removeImage` | Quitar | Remove | Remove | OK | None. |
| B23 | `size`, `download`, `print`, `preview` | Tamaño del papel · Descargar imagen · Imprimir o guardar como PDF · Vista previa | Paper size · Download image · Print or save as PDF · Preview | same | OK | None. Infinitive buttons match the rest of the kit ("Descargar"). "Guardar como PDF" is the browser's own Spanish wording. |
| B24 | `enlarge` / `shrink` | Verla más grande / Verla más pequeña | See it bigger / See it smaller | See it bigger / See it smaller | OK | None. Feminine *la* agrees with *vista previa*, the label beside the button ✓. Infinitive button style ✓. |
| B25 | `describe.message` / `.own` | Mensaje / Su frase | Message / Your phrase | Message / Your line | OK | None. Matches `message` and `own`. In the screen-reader text it reads "Mensaje: …", "Su frase: …" ✓. |
| B26 | `describe.figure` / `.image` | Con la imagen de Chiari. / Con su logotipo o foto. | With the image of Chiari. / With your logo or photo. | With the picture of Chiari. / With your logo or photo. | OK | None. Same terms as `figure` and `image`. |

## Consistency checks

- **Register:** every builder string that speaks to the reader uses usted (*elija, agregue, empiece, su, sus, suyas*).
  The one ambiguity is *agrega* (B19). Sticker phrases are not builder strings. The default sticker phrase (B16) has
  no verb, so the "tú" rule for stickers neither applies nor breaks.
- **Kit terms:** *calcomanías* (7 of 7 uses in the kit ✓), *logotipo* (all uses ✓, never "logo"), *publicación
  cuadrada* ✓, *historia* ✓, *concientización* ✓. **Póster vs cartel** is the one split. It is outside
  `kit.builder` (`kit.items.poster.title`), see recommendation 4.
- **Glossary:** none of these strings uses a medical glossary term or a word from the "must not be used" list. The
  glossary has no entries for the kit's product words (poster, sticker, logo, graphic). Adding *póster*, *calcomanía*,
  *logotipo* and *gráfico* would stop the split above from happening again.
- **Placeholders:** `{left}` and `{max}` appear once each in the Spanish `counter`, spelled the same as in English ✓.

Status: the Spanish remains **pending medical-translator review** (CLAUDE.md "Translations").

## Limits

- One agent, one pass. The back-translation is mine, not a professional translator's.
- I read the strings and the code that uses them. I didn't look at the rendered Spanish builder in a browser.
