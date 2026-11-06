# Spanish translation: back-translation check of the Research studies "Near" messages (eighth pass)

**Date:** 2026-11-06
**Checker:** a fresh agent that did not write the Spanish and did not see the English (CLAUDE.md rule 1a, step 3)
**What was checked:** `studies.nearFound` and `studies.nearNone` in `src/i18n/es.json`. They appear under the
"Cerca de" box on Research studies after the visitor types a place; `{place}` is what they typed.

| Key | Spanish | Literal back-translation | English | Verdict |
| --- | --- | --- | --- | --- |
| `nearFound` | Los más cercanos primero. | The closest ones first. | Closest first. | OK |
| `nearNone` | Ninguno de estos estudios tiene un centro cerca de «{place}». Cada estudio indica dónde se realiza. | None of these studies has a site/center near "{place}". Each study states where it is carried out. | None of these studies has a site near "{place}". Each study shows where it takes place. | OK. "Centro" is the usual word for a study site in Latin American clinical-trial language |

**Verdict:** accurate; plain register; no direct address, so usted is not needed. No changes. Not medical text; still
pending the medical translator's general review with the rest of the Spanish site.
