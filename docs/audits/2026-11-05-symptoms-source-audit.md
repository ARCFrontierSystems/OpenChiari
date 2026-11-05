# Source audit: "Symptoms can come and go and are often invisible"

**Date:** 2026-11-05
**Auditor:** independent agent (did not write the text or choose the source)
**Evidence row checked:** `docs/EVIDENCE.md` row 16, "Symptoms vary and are often not visible" (verdict in row: Simplified)

## What was checked

The sentence in `docs/COPY.md`:

> Symptoms can come and go and are often invisible. Believing them, and making room for rest, helps more than you might think.

Where it appears (checked in `docs/COPY.md`, `src/i18n/en.json` and `design/mockups/`):

- **Explain It, recipient view**, "How you can help" (COPY.md line 412; `explain.help` in `en.json`; `ExplainView.dc.html`). Both sentences.
- **Explain It, create a link**, starter note (COPY.md line 384; `explain.starterNote`). First sentence only.
- Related but different wording: **Awareness kit**, "Chiari is often invisible. Ask how you can help." (COPY.md line 725; `Kit.dc.html`).

It does **not** appear on the Home page (none of the four Home sections in COPY.md, and no Home mockup, contain it). Row 16 says "(Home, Explain It.)", which is inaccurate.

## Source

- Baisden J. "Controversies in Chiari I malformations." *Surgical Neurology International* 2012;3(Suppl 3):S232–S237. doi:10.4103/2152-7806.98580. PMID 22905329. PMCID PMC3422094.
- URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC3422094/
- Saved copy read for this audit: `docs/audits/sources/2026-11-05-symptoms/PMC3422094.html` (the page's citation metadata matches the URL, title, DOI and PMID above).
- Author: Department of Neurosurgery, Medical College of Wisconsin. Open access, CC BY.

## Quotes from the source

Section "SYMPTOMS TYPICAL OF CHIARI I MALFORMATIONS I" (full paragraph):

> Clinical suspicion that CMI exists is key, since patients' clinical complaints vary and fluctuate, and are often accompanied by a paucity of physical findings. CMI patients often present as young adults with a multiplicity of often vague complaints: headache, neck pain, generalized discomfort with nausea, vomiting, dizziness, fluctuating hearing loss, visual disturbances, paresthesias, weakness, fatigue, and gait difficulties. The physical examination may change from office visit to office visit, revealing on some occasions no focal abnormalities, to at other times, demonstrating nystagmus, cerebellar signs, or frank myelopathy.

Introduction, first paragraph (supports the same point):

> The clinical presentation of Chiari I malformation (CMI) patients is often highly variable. They often present with a multitude of seemingly unrelated complaints, and frequently have normal neurological examinations. Chiari I malformation is being diagnosed more frequently as an incidental finding on cervical MRIs performed for neck pain, or cranial MRIs obtained in the course of a workup for headache.

Article notes:

> Received 2012 May 23; Accepted 2012 May 23; Collection date 2012.

## Findings

### 1. Is the quote in the article, word for word?

**Yes.** The row's quote "patients' clinical complaints vary and fluctuate, and are often accompanied by a paucity of physical findings" matches the article exactly. The only difference is that the article uses a curly apostrophe (patients’), which does not matter. The quote is the second half of a sentence that begins "Clinical suspicion that CMI exists is key, since..."; cutting it there does not change its meaning.

### 2. Does it support "Symptoms can come and go"?

**Yes, fairly.** "Fluctuate" means to rise and fall or change over time. "Come and go" is the usual plain-language version and is a fair simplification. Two small points:

- "Come and go" can suggest that symptoms disappear completely at times. "Fluctuate" covers that but also covers getting better and worse without fully going away. For patients this difference is small, and "can" keeps it from being absolute.
- The same paragraph gives more support: it lists "fluctuating hearing loss" and says the exam "may change from office visit to office visit." So the idea of symptoms that change over time is clearly in the source, not only the single word "fluctuate."

"Vary" in the source also means symptoms differ between people. The site's sentence drops that meaning, which is fine because it does not claim it.

### 3. Does it support "often invisible"?

**Mostly, but it is a stretch in two ways. Fair in spirit, slightly overstated in wording.**

What the source says: complaints "are often accompanied by a paucity of physical findings," and patients "frequently have normal neurological examinations." Both describe what a **doctor finds on examination** (signs such as abnormal reflexes, eye movements or gait). The source says nothing about whether family, friends, teachers or employers can see the symptoms.

How the site uses it: on Explain It, under "How you can help," the sentence speaks to a family member or friend. In everyday speech "invisible" means "other people can't see it," as in "invisible illness."

Is the step from one to the other fair?

- **The direction of the inference is sound.** If trained examiners often find few signs, lay observers will usually see even less. And the main complaints the article lists (headache, neck pain, nausea, dizziness, fatigue, tingling) are things only the patient feels. So "others often can't see them" follows reasonably from the source. The row's own explanation ("few outward signs, which others can't see") states this step openly, which is good.
- **"Invisible" is stronger than "paucity."** "Paucity" means *few*, not *none*. The same paragraph says that at some visits the exam shows nystagmus, cerebellar signs or myelopathy, and the list of complaints includes weakness and gait difficulties, which others can sometimes see. "Often invisible" softens this with "often," but "invisible" still reads as "nothing shows," which goes a little past "few physical findings."
- **Possible misreading.** A patient could read "invisible" as "won't show up on tests." That would be wrong: the malformation itself shows on MRI, and the site says so elsewhere. In context ("Believing them...") the intended meaning is "others can't see them," so the risk is low, but it is there.
- **Not misleading about the source's purpose.** The article makes this point to tell clinicians to keep Chiari in mind even when the exam is normal. Using it to tell family members that symptoms may not show is consistent with that. The article's wider theme (Chiari is often found by chance, and some surgeons operate too readily) does not conflict with the sentence.

**Is the row's "Simplified" verdict right?** Yes. "Verified" would be wrong because the wording is not in the source, and "Unsupported" would be too harsh because the meaning follows from it. "Simplified" is the right category, as long as Matthew knows that "invisible" is an interpretation of "few physical findings," not a paraphrase of it.

**Suggested wording that sticks closer to the source** (about 8th-grade level; these need Matthew's approval before any change):

- Option A (recommended): **"Symptoms can come and go, and there are often few outward signs."**
  "Few" matches "paucity," "outward signs" matches "physical findings," and it still tells the reader that they may not be able to see what the person feels.
- Option B (keeps the "others can't see" idea but softens "invisible"): **"Symptoms can come and go, and others often can't see them."**
  This is still an inference (as in the current wording), but it avoids suggesting that tests or scans show nothing.
- Keeping the current wording is defensible. If Matthew keeps it, row 16 should keep "Simplified" and its explanation of the step from "few physical findings" to "invisible."

Shared note: the Awareness kit line **"Chiari is often invisible"** says the *condition* is invisible, not the *symptoms*. That goes one step further: the malformation is visible on MRI. Row 16 does not cover this line as written. Suggest either adding it to row 16's scope with a note that it means "symptoms are often not visible to others," or rewording it (for example, "Chiari symptoms often don't show. Ask how you can help."). Matthew needs to approve either option.

### 4. Medical advice or promises?

- **"Symptoms can come and go and are often invisible."** A description. It is not advice and promises nothing.
- **"Believing them, and making room for rest, helps more than you might think."** It speaks to the person receiving the link (a family member or friend), not to the patient, and it tells them how to *support* someone, not how to treat anything. It is not medical advice in the usual sense.
  **One caution:** "making room for rest ... helps more than you might think" can be read as a claim that rest improves Chiari symptoms. Neither row 16 nor this source supports that (Baisden says nothing about rest), and "more than you might think" sounds like a promise of benefit. The risk is low because of the "How you can help" context and because "helps" most naturally means "helps the person cope." If Matthew wants no doubt at all, a softer version avoids the implied health benefit: **"Believing them, and making room for rest, can mean a lot."** This is optional and is not a medical text change that the evidence requires.
- The page footer keeps "Not medical advice." (recipient view, COPY.md line 415). Confirmed.

### 5. Is the source appropriate?

**Acceptable, but it is weak evidence for a factual claim. A second, stronger source would help.**

In its favor:
- Published in *Surgical Neurology International*, a peer-reviewed journal indexed in PubMed and archived in PMC. The author is from an academic neurosurgery department.
- It is specifically about Chiari I in adults and children, and the quoted passage is in its "Symptoms typical of Chiari I" section.
- The point being made (symptoms vary and fluctuate, and the exam often finds little) is a long-standing clinical observation that is unlikely to have changed since 2012. Being 14 years old matters much less for this kind of description than it would for treatment or outcome numbers.

Against it:
- It is a **single-author narrative review** (expert opinion), not a study. The quoted sentence has **no citation**, so it is the author's clinical view, not a measured finding.
- **Received and accepted on the same day** (2012 May 23), in a **supplement** issue. That suggests an invited or editor-handled piece, so the depth of peer review is unclear.
- Editing quality is uneven ("Chiari I malformations I," "Crentzfeldt–Jakob," "the majority of spine surgeon operate"). This does not change the meaning of the quoted passage, but it suggests light editing.
- Age: 2012. Fine for this claim, as noted, but not for anything else in the article (for example, its surgical recommendations or its "65–80%" syringomyelia figure) without newer sources.

Recommendation: keep Baisden as the source, and when someone can open them by hand, add a corroborating patient-facing or reference source (the NINDS Chiari fact sheet, StatPearls, or a major medical center page) that describes symptoms that vary or change over time. Row 16 notes that NINDS and StatPearls blocked automated readers. This audit did not open them, so it makes no claim about what they say.

## Other issues found

1. **Row 16 location is wrong.** It says "(Home, Explain It.)" but the sentence appears on Explain It (create-page starter note and recipient view), not on Home. The task brief for this audit also said Home. Suggest changing the row to "(Explain It: starter note and recipient view.)", and adding the Awareness kit line if it is meant to be covered.
2. **Awareness kit "Chiari is often invisible"** has no row that clearly covers it (see finding 3).

## Verdict

- **Quote:** accurate, word for word.
- **"Come and go":** supported (fair simplification of "vary and fluctuate").
- **"Often invisible":** supported in spirit but **slightly overstated**: the source says *few physical findings on a doctor's exam*, not *invisible to others*. The inference is reasonable and the row states it openly. **"Simplified" is the correct verdict.** Tighter optional wording: "Symptoms can come and go, and there are often few outward signs."
- **Advice or promise:** none in the first sentence. The second sentence is supportive guidance, not medical advice. "Helps more than you might think" leans toward an unsourced benefit claim for rest; optional softer wording: "can mean a lot."
- **Source:** peer-reviewed and on topic, but a single-author narrative review with same-day acceptance and an uncited sentence. Adequate for this low-stakes descriptive claim; a second, stronger source is recommended.
- **Overall: PASS WITH NOTES.** The sentence can stay as written under rule 1a if Matthew accepts the "invisible" simplification. Any wording change, and the row 16 location fix, need Matthew's approval.
