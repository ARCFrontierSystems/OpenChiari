# Independent audit: "Make your own" message rework (November 5, 2026)

**What was audited:** `docs/drafts/2026-11-05-make-your-own.md`, sections 1 and 2 (English messages and the new label) and section 4 (Spanish). Compared with the approved originals in `src/i18n/en.json` at `HEAD` (`kit.explain.lines` and `kit.builder.messages`), `docs/EVIDENCE.md` rows 1, 2, 4, 6 and 16, and `docs/SPANISH-GLOSSARY.md`.
**Auditor:** a fresh agent that did not write the draft (CLAUDE.md rule 1a, check 3). I changed no site files and no drafts; this report is the only file I wrote.
**Note on the working tree:** `src/i18n/en.json` and `src/i18n/es.json` already have uncommitted changes. `kit.builder.messages` and `kit.builder.label` there match the draft's sections 1, 2 and 4 word for word. The approved originals below were read from `git show HEAD:src/i18n/en.json` / `es.json`.

## Sources opened today

| Source | Result |
| --- | --- |
| NINDS web page (`/health-information/disorders/chiari-malformation`) | **Opened** (HTTP 200), read in full |
| NINDS fact sheet PDF (2025-05, the URL in EVIDENCE row 1) | **Opened**, read in full |
| Cleveland Clinic 6008 (page says "Last updated on 06/08/2026") | **Opened**, read in full |
| Baisden 2012, PMC3422094 | **Opened** live, and checked against the saved copy `docs/audits/sources/2026-11-05-symptoms/PMC3422094.html` |
| StatPearls NBK554609 | **Not opened.** The server returned a Google reCAPTCHA challenge page. I did not try to get past it |
| Mayo Clinic (main site) | **Not opened.** "Access Denied" (HTTP 403). The care-network copy (amerikanhastanesi.org) was refused by this environment's proxy. Not bypassed |
| PMC12888059 (review; already an opened source in EVIDENCE rows 3, 5, 7) | Used from the saved copy `docs/audits/sources/2026-11-05-new-features/PMC12888059.html` as extra support only |

So every English line below rests on NINDS, Cleveland Clinic and Baisden (opened today), plus the saved PMC12888059. **None of today's verdicts relies on StatPearls or Mayo Clinic.**

## Summary

| # | Line | Meaning same as approved? | Supported? | Stands alone? | Verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | What is Chiari malformation? + answer | Yes (identical to `kit.explain` headline + line 1) | Yes | Yes | **OK** |
| 2 | I have Chiari malformation. | Yes (unchanged) | n/a (not medical) | Yes | **OK** |
| 3 | Chiari symptoms often have few outward signs… | Yes (unchanged) | Simplified, as EVIDENCE row 16 says | Yes | **OK** (one note) |
| 4 | Chiari malformation looks different for everyone… | Yes | Yes | Yes | **OK** |
| 5 | Most people with Chiari malformation are born with… | Yes; this is what row 2 always meant | Yes (Cleveland Clinic; NINDS) | Yes | **OK** (source-list fix suggested) |
| 6 | The classic sign of Chiari malformation is… | Yes, wording-wise | Yes ("hallmark sign", NINDS) | Yes, but it loses its neighbouring caveat | **OK, with an optional change** |
| Label | Chiari Awareness | n/a | n/a | Yes | **OK** |
| ES 1–6, label | see table below | 5 of 7 match exactly in meaning; 2 small, pre-existing differences | — | Yes | **OK**; two notes for the medical translator; one glossary addition |

**No change is required before approval.** All six English lines say what the approved originals said. The only edit to each is its subject, and none of them changes meaning, scope or certainty. The recommendations are small:

1. **Line 6 (optional, needs Matthew's approval because it adds a sentence):** when it is shown on its own, the "classic sign" line loses the "Some never have symptoms" context it had in the square post. Consider adding the approved row-20 sentence "Not everyone with Chiari gets these headaches." Or keep the line as is: it doesn't say everyone has the headache, and NINDS uses the same framing.
2. **EVIDENCE.md source lists (rows 2, 4, 6):** each lists Mayo Clinic and/or StatPearls, and neither could be opened from this environment today. The location detail in row 4 ("back of the head") is **not** in either NINDS text. Add the opened sources that do say it: Cleveland Clinic and PMC12888059 for row 4, and Cleveland Clinic for row 6. Quotes are below.
3. **Draft wording (not medical):** the draft says "every message now names Chiari malformation itself". Line 3 says "Chiari symptoms", not "Chiari malformation". It still stands alone, so only the draft's sentence is inexact.
4. **Spanish glossary:** add "Chiari Awareness → Concientización sobre Chiari" and "Chiari Awareness Month → Mes de Concientización sobre Chiari". Add a one-line rule for the article as well: "la malformación de Chiari" as a subject or after "de"; "malformación de Chiari" with no article after "tengo" or "personas con". The site already follows this rule, but the glossary doesn't state it.
5. **For the medical translator (pre-existing, not introduced by this draft):** "síntoma clásico" vs English "classic sign", and "hacer un esfuerzo" vs "straining". Details in the Spanish table.

## Section 1: English messages, line by line

### Line 1: "What is Chiari malformation?" + "The lowest part of the back of the brain extends below the opening at the base of the skull."

| Check | Finding |
| --- | --- |
| Same as approved? | Yes. It is the same pairing as `kit.explain.headline` + `kit.explain.lines[0]` at HEAD, character for character. |
| Supported? | EVIDENCE row 1. NINDS PDF: "When part of the cerebellum extends below the foramen magnum and into the upper spinal canal, it is called a Chiari malformation (CM)." NINDS web: "In CM, the lower part of the brain that controls balance—called the cerebellum—pushes downward into the spinal canal." Cleveland Clinic: "A Chiari malformation (CM) happens when brain tissue in the lower back of your skull goes into your spinal canal." |
| Stands alone? | Yes, as long as the answer is always shown with the question (the draft says it is). Showing the question alone would raise a question and give no answer, so it is right that the draft removed that option. |
| Plain language | Good. "Back of the brain" for cerebellum is a fair simplification. |
| Note (no change) | The answer describes Type I (the common type). Cleveland Clinic says Type 3 goes "through an abnormal opening in the back of your skull (not the foramen magnum)". This answer is the same as the approved square post, so I am not asking for a change. |
| **Verdict** | **OK** |

### Line 2: "I have Chiari malformation."

| Check | Finding |
| --- | --- |
| Same as approved? | Yes, unchanged. Not a medical claim. |
| Stands alone? | Yes. |
| **Verdict** | **OK** |

### Line 3: "Chiari symptoms often have few outward signs. Ask how you can help."

| Check | Finding |
| --- | --- |
| Same as approved? | Yes, unchanged (`kit.explain.lines[3]`, `kit.builder.messages[1]`). |
| Supported? | EVIDENCE row 16 (marked Simplified). Baisden 2012 (opened today; same as the saved copy): "patients' clinical complaints vary and fluctuate, and are often accompanied by a paucity of physical findings." |
| Skeptical note (no change) | Baisden's "physical findings" means what a doctor finds on examination. A reader takes "outward signs" to mean what other people can see. Those are close but not the same. Baisden also says "The physical examination may change from office visit to office visit, revealing on some occasions no focal abnormalities, to at other times, demonstrating nystagmus, cerebellar signs, or frank myelopathy." So "often few", not "none", is the right strength, and the line has it. Row 16 already names this as a simplification and Matthew approved it. Not reopened here. |
| Stands alone? | Yes: "Chiari symptoms" names the subject. |
| **Verdict** | **OK** |

### Line 4: "Chiari malformation looks different for everyone, and many people with Type I have no symptoms at all."

| Check | Finding |
| --- | --- |
| Was | "Chiari looks different for everyone, and many people with Type I have no symptoms at all." (also `home.feel.intro`) |
| Same as approved? | Yes. Only "Chiari" → "Chiari malformation". Nothing changes in scope or certainty: "many", "Type I" and "at all" are all kept. |
| Supported? | EVIDENCE row 6. "Looks different for everyone": Cleveland Clinic: "Due to the different types and range of severity, it affects each person differently." NINDS PDF: "Other symptoms may vary among individuals." "Many people with Type I have no symptoms": Cleveland Clinic (Type 1 section): "Many people don't have symptoms." NINDS PDF: "Type 1—which may not cause symptoms—is the most common form of CM" and "Many people with Chiari malformations have no symptoms". NINDS web: "Some people with a CM Type I don't have any symptoms". PMC12888059 (saved): "Approximately 30% of these patients may be asymptomatic." |
| Stands alone? | Yes. "Type I" is clearly a type of the Chiari malformation named earlier in the same sentence. |
| Plain language | "Type I" is jargon, but the site uses it everywhere and readers who choose this line will know it. Taken out of context, "looks different" could just possibly be read as "looks different on a scan". It is a common idiom, and the Spanish ("es diferente") avoids that reading. No change. |
| **Verdict** | **OK** |

### Line 5: "Most people with Chiari malformation are born with the skull differences that lead to it. Some never have symptoms; others first notice them as teens or adults."

| Check | Finding |
| --- | --- |
| Was | "Most people are born with the skull differences that lead to it. …" |
| Same as approved? | **Yes; the change makes the line say what it was approved to mean.** The original sits under "Who has it" (home) and after "What is Chiari malformation?" (square post), so "most people" meant "most people who have it". On its own, the old line could even be read as "most people (everyone) are born with skull differences", so the new subject removes a possible misreading. The scope is "people with Chiari malformation" (all types). That is no broader than before: the original had no type limit, and Types II–IV are present at birth anyway. "Most" is kept. It does not become "all" or "nearly all". |
| Supported? | EVIDENCE row 2. **Born with / skull differences:** Cleveland Clinic: "A structural problem with your skull typically causes it. Nearly all CM cases are present at birth (congenital). But you might not know you have it until later in life." and "Differences in skull structure often cause Chiari malformations. These differences typically happen during fetal development". NINDS PDF: "Chiari malformations may develop when part of the skull is smaller than normal or misshapen" and "Primary Chiari malformation is much more common than secondary Chiari malformation." **Never / teens or adults:** NINDS web: "Some people with a CM Type I don't have any symptoms or they don't develop symptoms until they are teenagers or adults." NINDS PDF: "some children who are born with this condition may never develop symptoms or show symptoms only in adolescence or adulthood." Cleveland Clinic: "You may not know you have CM type 1 until adolescence or adulthood." |
| Skeptical notes | (a) NINDS describes congenital CM as coming from "structural defects in the brain and spinal cord that occur during fetal development" (PDF), and the web page says "the brain and spinal cord don't develop properly before birth". So for "**skull** differences", Cleveland Clinic is the direct support, and NINDS supports it only through its "part of the skull is smaller than normal or misshapen" sentence. That is enough, and the wording is unchanged from approved. (b) Row 2 also lists Mayo Clinic. It could not be opened today, so I could not check it. From memory, and **not verified**, Mayo's page says Type 1 "develops as the skull and brain are growing", which would not directly support "born with". Whoever next opens Mayo should check this. Until then, row 2 should rely on Cleveland Clinic and NINDS. (c) "Some never…; others… as teens or adults" leaves out people with symptoms in childhood. "Some/others" doesn't claim to cover everyone, and this is the approved wording. |
| Stands alone? | Yes. "It" now points to "Chiari malformation" in the same sentence. "Some"/"others" point to people with Chiari malformation in the sentence before. |
| Plain language | Good. "Skull differences" is gentle and doesn't blame anyone. |
| **Verdict** | **OK.** Suggest putting Cleveland Clinic first in row 2's source list and marking Mayo "not opened". |

### Line 6: "The classic sign of Chiari malformation is a headache at the back of the head after coughing, sneezing or straining."

| Check | Finding |
| --- | --- |
| Was | "The classic sign is a headache at the back of the head after coughing, sneezing or straining." |
| Same as approved? | Yes in wording. "Of Chiari malformation" is what "the classic sign" meant in both approved places. "Classic" means characteristic. It does not mean universal or required, and the line doesn't say "everyone" or "always". |
| Supported? | EVIDENCE row 4. **NINDS PDF: "Headache is the hallmark sign of Chiari malformation, especially after sudden coughing, sneezing, or straining."** This directly supports "classic sign" and the three triggers. NINDS web: "Headache that gets worse with coughing, sneezing, or straining". **Neither NINDS text says "back of the head".** That detail comes from Cleveland Clinic ("Headaches or intense pain in the back of your head or neck that get worse after coughing or sneezing"; Type 1: "headaches at the base of your skull (most common)") and PMC12888059 (saved: "The most characteristic symptom is headache, typically located at the back of the head and often triggered or worsened by coughing, sneezing, straining, or bending forward"). Row 4 lists NINDS, Mayo, StatPearls. Mayo and StatPearls could not be opened today, so the "back of the head" part currently rests on sources the row doesn't list. **Add Cleveland Clinic and PMC12888059 to row 4.** |
| Does it overstate? | Not in what it says. In context it loses something, though. In the square post this line came straight after "Some never have symptoms". On the home page it sits under "many people with Type I have no symptoms at all". Shown alone on a graphic, it could suggest to some readers that everyone with Chiari gets this headache, or that a cough headache means Chiari. The sources show the headache is common but not universal. PMC12888059 says it is "the most characteristic symptom" but also "Approximately 30% of these patients may be asymptomatic". EVIDENCE row 20 already approves "Not everyone with Chiari gets these headaches." The fixed footer ("Not medical advice. Talk to your doctor about your own care.") helps. |
| Stands alone? | Yes. |
| Plain language | Good. "Straining" is plain enough. |
| **Verdict** | **OK.** Optional, for Matthew: add the approved row-20 sentence "Not everyone with Chiari gets these headaches." Also check that it fits the graphic. |

## Section 2: label

| Line | Finding | Verdict |
| --- | --- | --- |
| "Chiari Awareness" (with the ribbon) | Not a medical claim. It matches the kit's existing "Chiari Awareness Month" and "#ChiariAwareness". On every graphic it gives the "Chiari" context for the message lines (that helps line 3 too). | **OK** |

## Section 4: Spanish back-translation

Literal back-translations are mine. "Approved" means identical to the Spanish at `HEAD` (`kit.explain` / `kit.builder.messages`).

| # | Spanish (draft) | Literal back-translation | English (draft) | Difference | Verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | ¿Qué es la malformación de Chiari? + "La parte más baja de la parte de atrás del cerebro se extiende por debajo de la abertura en la base del cráneo." | What is (the) Chiari malformation? + "The lowest part of the back part of the brain extends below the opening at the base of the skull." | What is Chiari malformation? + "The lowest part of the back of the brain extends below the opening at the base of the skull." | None. Identical to approved Spanish. "la abertura en la base del cráneo" matches the glossary. | **OK** |
| 2 | Tengo malformación de Chiari. | I have Chiari malformation. | I have Chiari malformation. | None. Unchanged. No article after "tengo", which is natural and matches the rest of the site. | **OK** |
| 3 | Los síntomas de Chiari a menudo dan pocas señales visibles. Pregunte cómo puede ayudar. | The symptoms of Chiari often give few visible signs. Ask how you can help. | Chiari symptoms often have few outward signs. Ask how you can help. | "Visibles" (visible) for "outward". Very close; approved before. Usted form matches the glossary style. | **OK** |
| 4 | La malformación de Chiari es diferente en cada persona, y muchas personas con el tipo I no tienen ningún síntoma. | (The) Chiari malformation is different in each person, and many people with type I do not have any symptom. | Chiari malformation looks different for everyone, and many people with Type I have no symptoms at all. | "Es diferente" (is different) vs "looks different". This was already in the approved "Chiari es diferente…". The meaning is the same for a lay reader, and the Spanish is if anything less ambiguous. "No tienen ningún síntoma" = "no symptoms at all" ✓. "Tipo I" is lower case, as in the glossary ✓. The article "la" is needed because the noun is the subject ✓. | **OK** |
| 5 | La mayoría de las personas con malformación de Chiari nacen con las diferencias del cráneo que la causan. Algunas nunca tienen síntomas; otras los notan por primera vez en la adolescencia o en la edad adulta. | Most of the people with Chiari malformation are born with the differences of the skull that cause it. Some never have symptoms; others notice them for the first time in adolescence or in adulthood. | Most people with Chiari malformation are born with the skull differences that lead to it. Some never have symptoms; others first notice them as teens or adults. | (a) "Que la causan" = "that cause it". That is a little more direct than "lead to it". It is unchanged from the approved Spanish and the sources support "cause" (Cleveland Clinic: "Differences in skull structure often cause Chiari malformations"), so no change. (b) "La" now clearly refers to "malformación" (feminine singular). It can't refer to "diferencias" (plural) or "cráneo" (masculine), so the old dangling pronoun is fixed. (c) No article after "personas con", which is consistent with "Tengo malformación de Chiari" and "viven con malformación de Chiari" elsewhere in `es.json`. Lines 4 and 6 use "la" because there the noun is a subject or comes after "de". That is correct Spanish, not an inconsistency, but the glossary should state the rule. | **OK** |
| 6 | El síntoma clásico de la malformación de Chiari es un dolor de cabeza en la parte de atrás de la cabeza después de toser, estornudar o hacer un esfuerzo. | The classic **symptom** of (the) Chiari malformation is a headache in the back part of the head after coughing, sneezing or **making an effort**. | The classic **sign** of Chiari malformation is a headache at the back of the head after coughing, sneezing or straining. | Both differences were already in the approved Spanish (`kit.explain.lines[2]`, `home.feel.classic.narrow`), so this draft doesn't introduce them. (a) "Síntoma" vs "sign": for patients the meaning is the same. Strictly, a headache is a symptom, and PMC12888059 says "most characteristic symptom" while NINDS says "hallmark sign", so the Spanish is fine. (b) "Hacer un esfuerzo" (exertion) is a little broader than "straining" (bearing down). For the medical translator: "hacer fuerza" or "pujar" may be closer. "Dolor de cabeza" is the glossary term ✓. | **OK** (2 translator notes) |
| Label | Concientización sobre Chiari | Awareness about Chiari | Chiari Awareness | None. It matches "Mes de Concientización sobre Chiari" (`kit.eyebrow`, `kit.quoteFooter`) and "Kit de concientización" (glossary). The capital "C" is right because the word starts the label. The glossary has no entry for this label or for the Awareness Month name, so add both. | **OK** (glossary addition) |

**Glossary checks:** "malformación de Chiari" uses the article where Spanish grammar needs it and drops it after "tengo" or "con". That is the same pattern as the rest of `es.json` ✓. "Tipo I" is lower case ✓. "Síntomas", "dolor de cabeza" and "cráneo" match the glossary ✓. "Concientización" matches the existing kit terms ✓. The draft introduces no words from the glossary's "must not be used" list.

Status: the Spanish remains **pending medical-translator review**, as the draft says (CLAUDE.md "Translations").

## Limitations

- StatPearls (reCAPTCHA) and Mayo Clinic (403, and the care-network copy is blocked by the proxy) could not be opened. I did not try to get past either block. No verdict depends on them, but EVIDENCE rows 2, 4 and 6 still list them.
- My statement about what Mayo says (line 5, note b) is from memory and not verified.
- One agent, one pass. The Spanish back-translation is mine, not a medical translator's.
