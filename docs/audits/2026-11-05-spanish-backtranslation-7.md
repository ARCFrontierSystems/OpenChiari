# Spanish translation: back-translation check of the Explorer cut directions and MRI link (seventh pass)

**Date:** 2026-11-05
**Checker:** a fresh agent that did not write the Spanish (CLAUDE.md rule 1a, step 3)
**What was checked:** in `src/i18n/es.json` compared with `src/i18n/en.json`: `explorer.cutPlanes` (all strings,
including `ends` and `describe`) and `explorer.mriLink`.
**Method:** I translated each Spanish string literally back into English and compared the meaning. I checked the
radiology terms, register, `docs/SPANISH-GLOSSARY.md`, the rest of `es.json`, and how `src/pages/explorer.astro`
uses the strings. Context that matters: the three cut buttons sit in the "Corte" section; picking a cut also turns
the camera (`PLANE_CAMERA`: sagittal → side, **coronal → back**, axial → below); `ends` replace the three slider labels;
`describe` is read out in the screen-reader description after `viewNames` (for coronal: "Vista desde atrás. Corte de
adelante hacia atrás (coronal), visto desde atrás.").

## Overall verdict

**Accurate. No meaning is lost or added. One low-priority wording change suggested ("De frente").** Keys and array
lengths match English. No *tú* forms; no string speaks to the reader directly, and the link uses an infinitive like
the other Explorer buttons, so usted is not needed here.

| Key | Spanish | Literal back-translation | English | Verdict |
| --- | --- | --- | --- | --- |
| `cutPlanes.label` | Dirección del corte | Direction of the cut | Cut direction | OK |
| `cutPlanes.sagittal` | De lado | From the side / sideways | Side | OK. Matches `viewNames.side` "Vista de lado"; the camera also turns to the side |
| `cutPlanes.coronal` | De frente | From the front / facing (head-on) | Front | Accurate, but see note 1 |
| `cutPlanes.axial` | Transversal | Transverse / crosswise | Across | OK, see note 2 |
| `cutPlanes.hint` | La resonancia usa las mismas tres direcciones: sagital (de lado), coronal (de frente) y axial (transversal). | MRI uses the same three directions: sagittal (from the side), coronal (from the front) and axial (transverse). | MRI uses the same three directions: sagittal (side), coronal (front) and axial (across). | OK. *Sagital*, *coronal*, *axial* are the standard Spanish radiology spellings |
| `cutPlanes.ends.coronal` | Adelante / Abertura del cráneo / Atrás | Forward (in front) / Skull opening / Back (behind) | Front / Skull opening / Back | OK |
| `cutPlanes.ends.axial` | Más abajo / Abertura del cráneo / Más arriba | Further down / Skull opening / Further up | Lower / Skull opening / Higher | OK |
| `cutPlanes.describe.coronal` | Corte de adelante hacia atrás (coronal), visto desde atrás | Cut from front to back (coronal), seen from behind | Cut front to back (coronal), seen from behind | OK |
| `cutPlanes.describe.axial` | Corte transversal (axial), visto desde abajo | Transverse cut (axial), seen from below | Cut across (axial), seen from below | OK |
| `mriLink` | Comparar con una resonancia real | Compare with a real MRI | Compare with a real MRI | OK. "resonancia" alone matches the rest of the site ("una resonancia real" in the MRI page intro, "informe de su resonancia") |

## Notes

1. **"De frente" (low).** In Spanish, *de frente* most naturally means "seen from the front / facing". It sits next to
   the camera buttons (*Lado, Atrás, Abajo, Frente*), and pressing it turns the camera to **the back**, so the reader
   picks "from the front" and sees the model from behind. *De lado* does not have this problem (the camera does go to
   the side). Spanish anatomy names the coronal plane *plano frontal (coronal)*, so **"Frontal"** names the slice
   itself, not where you look from, and is still plain language. English "Front" has a milder form of the same
   ambiguity; no English change is needed.
2. **"Transversal" for "Across" (keep).** Good plain label. *Corte transversal* is everyday Spanish for "cross-section",
   and *plano transversal* is the standard anatomical synonym for the axial plane, so it is both plain and exact.
   It is a little more precise than "Across", which is fine. ("Horizontal" would also work but is not needed.)
3. **"Abertura del cráneo" (keep).** Same term used about 13 other times in `es.json` wherever English says "skull
   opening" (including `viewNames.close` and the accuracy panel); *agujero magno* stays for the labelled term, as the
   glossary says. Capitalised here only because it is a stand-alone slider label.
4. **Glossary (optional).** The glossary has no entries for the cut directions or for "skull opening". Suggested rows:
   - sagittal / coronal / axial (MRI planes) → sagital / coronal / axial; plain labels *de lado* / *frontal* (or the
     current *de frente*) / *transversal*. Source: standard; translator: please confirm.
   - skull opening (short form) → abertura del cráneo. Source: used across `es.json` (back-translation check 6).

## Recommended change (low; optional)

- `explorer.cutPlanes.coronal`: **"Frontal"**
- `explorer.cutPlanes.hint`: **"La resonancia usa las mismas tres direcciones: sagital (de lado), coronal (frontal) y axial (transversal)."**

`describe.coronal` can stay as is; it already says the cut is seen from behind.
