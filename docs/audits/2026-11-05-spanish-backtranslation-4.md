# Spanish translation: back-translation check of the awareness kit stickers and builder (fourth pass)

**Date:** 2026-11-05
**Checker:** a fresh agent that did not write the Spanish (CLAUDE.md rule 1a, step 3)
**What was checked:** the new Spanish in `src/i18n/es.json`: `kit.explain`, `kit.stickers` (both sheets),
`kit.builder`, `kit.items.social`, `kit.items.stickersEveryone`, `kit.items.stickersSurgery`, `kit.orgsText`,
`children.stickers`, and `home.tools.items[6]`, `[7]` and `[8]`.
**Method (same as the first three passes):** I first translated every Spanish string back into plain, literal English
*without* opening the English. Only then did I open `src/i18n/en.json` (the approved reference) and compare key by key.
I also checked the Spanish against `docs/SPANISH-GLOSSARY.md`, confirmed that the medical sentences are copied from
Spanish already on the site, and looked at the Spanish sticker previews (`public/kit/es/preview-stickers-*.png`) to see
how each phrase fits on a 2.25-inch round sticker. The blind back-translation was kept as a working note and was not
added to the repo.

## Overall verdict

**Safe to publish. No high-severity problems.** Every medical sentence matches Spanish already approved on the site
(listed below), and no sticker phrase makes a medical claim or a promise. All 18 sticker phrases fit inside the circle.

Things worth fixing, all about how the words read to a Spanish speaker, not about medical facts:

1. **"Club del cierre" (medium).** In Spanish, *cierre* means "zipper" in some countries, but it also means "closing",
   and in a surgery setting "cierre" is the word for closing the wound. Most readers will see "the closing club" and
   miss the zipper-scar joke. Smallest fix: **"Club del zíper"** (*zíper* is the everyday word for zipper in Mexico,
   Central America, the Caribbean and among US Spanish speakers).
2. **Stickers that only fit boys (medium).** A sticker is worn by one real person, so a masculine word reads as "boy"
   or "man", not as "anyone". This matters most for "Niño valiente" (a girl would be wearing "brave boy") and
   "Guerrero contra Chiari" (Chiari I is diagnosed more often in women than in men). "Brave kid" and "Chiari warrior"
   have no gender in English. Neutral fixes are in the table (S1, S7, S14, S17).
3. **"Orgullo de mi cicatriz" (low).** Grammatical but stiff ("pride of my scar"). "Mi cicatriz, mi orgullo" is the
   natural Spanish way to say it and has no gender.
4. **"Haga el suyo" as a section title (low).** On its own, "el suyo" has nothing to point to: "make yours... your
   what?" It can also be read as "make his / hers / theirs". Smallest fix: **"Haga su propio diseño"**, which also matches
   the "Diseño" picker right below it. `kit.orgsText` quotes the title, so it must change too.

**Informal "tú" on stickers.** The glossary says "usted" for site text. The stickers use "tú" ("Pregúntame sobre
Chiari", "No estás solo"). I think that is right: a sticker or badge speaks person to person, and "Pregúnteme sobre
Chiari" would sound stiff on a badge. All the site text around the stickers (instructions, builder) uses "usted"
correctly. Suggest adding one line to the glossary saying sticker phrases use "tú", like the children's story.

## Answers to the four points I was asked to look at

| # | Point | Answer |
| --- | --- | --- |
| 1 | Sticker phrases: natural, encouraging, same tone | **Mostly yes.** "Cerebro valiente", "Un día a la vez", "Sigo siendo yo", "Hice algo difícil", "Sanar toma tiempo", "Modo recuperación" and "Cada cicatriz cuenta una historia" are natural, warm and keep the English tone. "Club del cierre": change (see above). "No estás solo": acceptable, since Spanish uses the masculine for "anyone", but a neutral phrase exists: "Estamos contigo" ("we are with you"), which is common and warm in Spanish support messages. "Guerrero contra Chiari": the tone works (fighting spirit), but it is masculine; "Luchando contra Chiari" keeps the tone with no gender. "Invisible, no imaginario": understood and keeps the punch of the English; fine to keep. A more everyday Spanish version is "No se ve, pero es real" if a reviewer prefers. |
| 2 | Medical claims or promises | **None.** "Sanar toma tiempo" says healing takes time, not that it will be complete. "Descansar también es fuerza" is encouragement, not advice. "Cerebro valiente", "Modo recuperación" and "Héroe del hospital" claim nothing. The builder hint "para que cada imagen sea correcta" is the same claim the English makes. |
| 3 | "Haga el suyo" as a title | **Change (low).** See point 4 above. "Haga su propio diseño". In `home.tools.items[7]`, "o haga los suyos" is fine, because "posts, posters and stickers" come just before it. |
| 4 | Phrases too long for a 2.25-inch sticker | **None too long.** The only phrase over 30 characters is "Cada cicatriz cuenta una historia" (33). In the preview it sits on three lines at the small size and still has space around it. "Modo recuperación" is the tightest single word line but fits. Small layout note (not a translation issue): a few phrases leave one short word alone on the second line ("Un día a la / vez", "Sigo siendo / yo"); a non-breaking space would keep them balanced. |

## Medical sentences: copied from approved Spanish

| Key | Same Spanish already used at | Result |
| --- | --- | --- |
| `kit.explain.headline`, `kit.builder.messages[0]` | `home.whatIs.title`, `kit.posterTitle` | Match |
| `kit.explain.lines[0]` | `children` school sheet (`school.explain`, checked in pass 3, row C30) | Match |
| `kit.explain.lines[1]`, `kit.builder.messages[4]` | `home.whatIs.whoHasIt` | Match |
| `kit.explain.lines[2]`, `kit.builder.messages[5]` | `home.feel.classic.narrow` | Match |
| `kit.explain.lines[3]`, `kit.builder.messages[1]` | `kit.quote` | Match |
| `kit.builder.messages[2]` | `kit.cardLine1` | Match |
| `kit.builder.messages[3]` | `home.feel.intro` | Match |

## Findings table

Verdicts: **OK** = same meaning, reads well; **CHANGE** = should be fixed (smallest fix given); **CHECK** = optional,
or for Matthew or the translator to decide. Character counts are for the sticker phrases.

### Sticker phrases (`kit.stickers.sheets`)

| # | Key | Spanish | Back-translation | English reference | Verdict and smallest fix |
| --- | --- | --- | --- | --- | --- |
| S1 | `everyone.messages[0]` | "Guerrero contra Chiari" (22) | "Warrior (male) against Chiari" | "Chiari warrior" | CHECK (medium). Tone is right, but it is masculine and most people with Chiari I are women. Fix: "Luchando contra Chiari" (22). |
| S2 | `everyone[1]`, `surgery[8]` | "Cerebro valiente" (16) | "Brave brain" | "Brave brain" | OK |
| S3 | `everyone[2]` | "Un día a la vez" (15) | "One day at a time" | same | OK. Common, natural phrase. |
| S4 | `everyone[3]` | "Descansar también es fuerza" (27) | "Resting is strength too" | "Rest is strength" | OK. "También" (too) softens it a little and reads naturally. Shorter option if wanted: "Descansar es fuerza". |
| S5 | `everyone[4]` | "Sigo siendo yo" (14) | "I'm still me" | "Still me" | OK |
| S6 | `everyone[5]` | "Pregúntame sobre Chiari" (23) | "Ask me about Chiari" | same | OK. "Tú" form, right for a badge (see note above). |
| S7 | `everyone[6]` | "No estás solo" (13) | "You are not alone (male form)" | "You are not alone" | CHECK (low). Acceptable as the general form. Neutral option: "Estamos contigo" (15). |
| S8 | `everyone[7]` | "Morado por Chiari" (17) | "Purple for Chiari" | same | OK. Optional: "De morado por Chiari" ("wearing purple for Chiari") is the usual campaign wording and avoids reading *morado* as "bruised". |
| S9 | `everyone[8]` | "Invisible, no imaginario" (24) | "Invisible, not imaginary" | same | OK. Optional alternative: "No se ve, pero es real". |
| S10 | `surgery[0]` | "Club del cierre" (15) | "The closing club" (or "zipper club" in some countries) | "Zipper club" | CHANGE (medium). Fix: "Club del zíper" (14). If a reviewer prefers to drop the joke: "Club de la cicatriz". |
| S11 | `surgery[1]` | "Orgullo de mi cicatriz" (22) | "Pride of my scar" | "Proud of my scar" | CHANGE (low). Stiff. Fix: "Mi cicatriz, mi orgullo" (23). |
| S12 | `surgery[2]` | "Cada cicatriz cuenta una historia" (33) | "Every scar tells a story" | same | OK. Natural. Longest phrase, but fits on three lines. |
| S13 | `surgery[3]` | "Hice algo difícil" (17) | "I did something hard" | "I did a hard thing" | OK |
| S14 | `surgery[4]` | "Niño valiente" (13) | "Brave boy" | "Brave kid" | CHANGE (medium). A girl would be wearing "brave boy". Fix: "Súper valiente" (14). ("Valiente" has no gender.) |
| S15 | `surgery[5]` | "Sanar toma tiempo" (17) | "Healing takes time" | same | OK. No promise. ("Sanar lleva tiempo" is slightly more standard; either is fine.) |
| S16 | `surgery[6]` | "Modo recuperación" (17) | "Recovery mode" | same | OK |
| S17 | `surgery[7]` | "Héroe del hospital" (18) | "Hospital hero (male)" | "Hospital hero" | CHECK (low). "Héroe" leans male; the female form "heroína" also means the drug, so don't use it. Neutral option: "Estrella del hospital" (21). |
| S18 | `sheets.everyone.title`, `items.stickersEveryone.title` | "Calcomanías para todos" | "Stickers for everyone" | same | OK |
| S19 | `sheets.surgery.title`, `items.stickersSurgery.title` | "Calcomanías para después de la cirugía" | "Stickers for after surgery" | same | OK |

### Other sticker text, builder and links

| # | Key | Spanish | Back-translation | English reference | Verdict and smallest fix |
| --- | --- | --- | --- | --- | --- |
| K1 | `kit.explain.footer` | "Véalo en 3D en openchiari.org · #ChiariAwareness" | "See it in 3D at openchiari.org · #ChiariAwareness" | same | OK. Hashtag kept in English, as on the rest of the kit. |
| K2 | `kit.stickers.title`, `.format`, `items.*.format` | "Calcomanías"; "Carta y A4 · PDF, para papel adhesivo de hoja completa" | "Stickers"; "Letter and A4 · PDF, for full-sheet adhesive paper" | "Stickers"; "…full-sheet sticker paper" | OK |
| K3 | `kit.stickers.how` | "Imprima en papel adhesivo de hoja completa al 100 % del tamaño y luego recorte por los círculos punteados." | "Print on full-sheet adhesive paper at 100% size, then cut along the dotted circles." | "…cut along the dashed circles." | OK. "Punteado" is the usual word for a dashed cut line, and the site already uses "línea punteada". |
| K4 | `kit.stickers.blank` | "Escriba lo suyo" | "Write your own" | same | OK |
| K5 | `kit.builder.title` | "Haga el suyo" | "Make yours (yours what? / his / hers)" | "Make your own" | CHANGE (low). Fix: "Haga su propio diseño". |
| K6 | `kit.orgsText` | "¿Quiere su propia versión? Use "Haga el suyo" más abajo para agregar sus palabras, su logotipo y sus colores. Nada de lo que agregue se envía a ningún lugar." | "Do you want your own version? Use "Make yours" below to add your words, your logo and your colors. Nothing you add is sent anywhere." | same | OK, but the quoted title must follow K5: "Use "Haga su propio diseño" más abajo…". |
| K7 | `kit.builder.intro` | "Elija un diseño y un mensaje, agregue sus propias palabras, un logotipo o una foto, y descárguelo. Todo ocurre en su dispositivo: nada de lo que agregue se envía ni se guarda." | "Choose a design and a message, add your own words, a logo or a photo, and download it. Everything happens on your device: nothing you add is sent or saved." | same | OK. Privacy promise kept exactly. |
| K8 | `kit.builder.design`, `.designs` | "Diseño"; "Publicación cuadrada", "Historia", "Póster", "Hoja de calcomanías" | "Design"; "Square post", "Story", "Poster", "Sticker sheet" | same | OK |
| K9 | `kit.builder.message`, `.messageHint` | "Mensaje"; "Los datos médicos solo vienen de esta lista, para que cada imagen sea correcta." | "Message"; "Medical facts only come from this list, so that each image is correct." | "…so every graphic stays accurate." | OK |
| K10 | `kit.builder.own`, `.ownHint` | "Su propia frase (opcional)"; "Por ejemplo: Camino por mi hija Emma" | "Your own phrase (optional)"; "For example: I walk for my daughter Emma" | "Your own line…"; "Walking for my daughter Emma" | OK |
| K11 | `kit.builder.name`, `.when` | "Nombre, grupo o evento (opcional)"; "Fecha y lugar (opcional)" | "Name, group or event (optional)"; "Date and place (optional)" | same | OK |
| K12 | `kit.builder.stickerText`, `.stickerHint` | "Sus palabras para las calcomanías"; "Hasta 3 líneas cortas. Aparecen en las 12 calcomanías." | "Your words for the stickers"; "Up to 3 short lines. They appear on the 12 stickers." | "Your sticker words"; "…Shown on all 12 stickers." | OK |
| K13 | `kit.builder.image`, `.imageHint`, `.removeImage` | "Logotipo o foto (opcional)"; "Se queda en su dispositivo."; "Quitar" | "Logo or photo (optional)"; "It stays on your device."; "Remove" | same | OK |
| K14 | `kit.builder.color`, `.colors`, `.size`, `.download`, `.print`, `.preview` | "Colores"; "Morado", "Claro", "Oscuro"; "Tamaño del papel"; "Descargar imagen"; "Imprimir o guardar como PDF"; "Vista previa" | "Colors"; "Purple", "Light", "Dark"; "Paper size"; "Download image"; "Print or save as PDF"; "Preview" | same | OK |
| K15 | `kit.builder.yours` | "Sus propias palabras aparecen en un recuadro aparte, para que quede claro que son suyas." | "Your own words appear in a separate box, so it is clear they are yours." | same | OK |
| K16 | `kit.items.social` | "Publicación cuadrada: qué es Chiari"; "1080 × 1080 · PNG" | "Square post: what Chiari is" | "Square social post: what Chiari is" | OK. "Social" dropped; "publicación" already means a social media post. |
| K17 | `children.stickers` | "Para después de la cirugía, también hay calcomanías para imprimir:" + "calcomanías para después de la cirugía" + "." | "For after surgery, there are also stickers to print: stickers for after surgery." | same | OK |
| K18 | `home.tools.items[6]` | "Cómo ayudar a su hijo"; "Cómo preparar a un niño para la cirugía de Chiari: consejos, un cuento con dibujos, páginas para colorear y una hoja para la escuela."; "Consejos, un cuento con dibujos y una hoja para la escuela." | "How to help your child"; "How to prepare a child for Chiari surgery: tips, a picture story, coloring pages and a sheet for school."; "Tips, a picture story and a sheet for school." | "Helping your child"; "Getting a child ready for Chiari surgery: tips, a picture story, coloring pages and a sheet for school." | OK. Title matches the page's nav label. |
| K19 | `home.tools.items[7]` | "Kit de concientización"; "Publicaciones, pósteres y calcomanías gratis para compartir, o haga los suyos con sus palabras y su logotipo."; "Publicaciones, pósteres y calcomanías gratis para compartir." | "Awareness kit"; "Free posts, posters and stickers to share, or make your own with your words and your logo." | same | OK. Glossary term "Kit de concientización" used. |
| K20 | `home.tools.items[8]` | "Conectar con otras personas"; "Foros y grupos de apoyo para personas con Chiari y sus familias."; "Foros y grupos de apoyo." | "Connect with other people"; "Forums and support groups for people with Chiari and their families."; "Forums and support groups." | "Connect with others"; same | OK. Title matches the page title. |

## List of fixes

| Priority | Key | Now | Suggested |
| --- | --- | --- | --- |
| Medium | `kit.stickers.sheets.surgery.messages[0]` | Club del cierre | Club del zíper |
| Medium | `kit.stickers.sheets.surgery.messages[4]` | Niño valiente | Súper valiente |
| Medium (check) | `kit.stickers.sheets.everyone.messages[0]` | Guerrero contra Chiari | Luchando contra Chiari |
| Low | `kit.stickers.sheets.surgery.messages[1]` | Orgullo de mi cicatriz | Mi cicatriz, mi orgullo |
| Low | `kit.builder.title` | Haga el suyo | Haga su propio diseño |
| Low | `kit.orgsText` | …Use "Haga el suyo" más abajo… | …Use "Haga su propio diseño" más abajo… |
| Low (check) | `kit.stickers.sheets.everyone.messages[6]` | No estás solo | Estamos contigo |
| Low (check) | `kit.stickers.sheets.surgery.messages[7]` | Héroe del hospital | Estrella del hospital |
| Optional | `kit.stickers.sheets.everyone.messages[7]` | Morado por Chiari | De morado por Chiari |
| Glossary note | `docs/SPANISH-GLOSSARY.md` | (none) | Add: sticker phrases use "tú", like the children's story; avoid masculine-only words on stickers. |

After any sticker change, the Spanish kit files (`public/kit/es/`) need to be generated again with
`scripts/make-kit.mjs`. None of these are medical sentences, but the Spanish as a whole is still waiting for the medical
translator (CLAUDE.md "Translations").
