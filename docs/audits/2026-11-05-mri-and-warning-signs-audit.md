# Audit: "Reading your MRI report" and "When to call after surgery" (November 5, 2026)

Independent medical-accuracy check of `docs/drafts/2026-11-05-mri-report-and-warning-signs.md`. The checker had no part in writing the draft. Every sentence marked *new*, every Part 2 list item, and every approved sentence reused in the draft was checked against sources opened during this audit. Approved wording was compared character for character with `src/i18n/en.json`.

**Overall verdict: not ready to publish as drafted.** Two sentences fail on safety:

- **Item 3:** "'herniation' usually means this too, not an emergency" is reassurance that sounds like triage. MedlinePlus lists "Tonsillar herniation" as another name for brain herniation, calls brain herniation "a medical emergency", and names Arnold-Chiari malformation as one cause.
- **Item 10:** "These words all describe it" is not accurate for *hydromyelia*.

Part 2 needs changes for four reasons:
- Five list items have qualifiers that narrow when to call: "much worse", "keeps growing", "that doesn't stop", "together with a fever" and "new".
- Three symptoms (warmth at the incision, numbness, trouble swallowing), and the headache that gets worse when sitting up or standing, are not in any discharge source I could open.
- Several items that both opened discharge sources list are missing: vision changes, confusion or unusual sleepiness, and calf swelling.
- The 911 line is supported, but only by general MedlinePlus emergency pages, not by a Chiari discharge sheet.

With the replacement wording below, every item is supported.

---

## 1. Sources

### Opened and read (this audit, Nov 5, 2026)

| Short name | Source | Used for |
| --- | --- | --- |
| MP-DISCHARGE | MedlinePlus, "Brain surgery - discharge", https://medlineplus.gov/ency/patientinstructions/000124.htm (review date 7/15/2024; the live "When to Call the Doctor" list matches the saved copy `docs/audits/sources/2026-11-05-surgery-and-children/medlineplus-brain-surgery-discharge.txt` word for word). Lists Chiari among the reasons for the surgery: "Create more space for the brain because of swelling or Chiari syndrome." Its alternative names include "Craniectomy - discharge" | Part 2 |
| MAYFIELD | Mayfield Clinic, "Chiari decompression surgery", https://mayfieldclinic.com/pe-chiari-surgery.htm (updated 1.2021, reviewed by Ringer and Bohinski). Chiari-specific discharge section "When to Call Your Doctor" (the same text as the saved copy `docs/audits/sources/2026-11-05-surgery-steps/mayfield-chiari-surgery.txt`) | Part 2; surgery terms; pseudomeningocele |
| MP-EMERG | MedlinePlus, "Recognizing medical emergencies" (citing the American College of Emergency Physicians), https://medlineplus.gov/ency/article/001927.htm | Part 2 emergency line |
| MP-SEIZ | MedlinePlus, "Seizures", https://medlineplus.gov/ency/article/003200.htm | Emergency line |
| MP-ALERT | MedlinePlus, "Decreased alertness", https://medlineplus.gov/ency/article/003202.htm | Emergency line |
| MP-BREATH | MedlinePlus, "Breathing difficulty", https://medlineplus.gov/ency/article/003075.htm | Emergency line |
| MP-HERN | MedlinePlus, "Brain herniation", https://medlineplus.gov/ency/article/001421.htm | Item 3 (safety) |
| MP-SYR | MedlinePlus, "Syringomyelia", https://medlineplus.gov/ency/article/001398.htm | Item 10 |
| MP-HYDRO | MedlinePlus, "Hydrocephalus" health topic, https://medlineplus.gov/hydrocephalus.html | Item 12 |
| MP-PF | MedlinePlus, "Posterior fossa tumor", https://medlineplus.gov/ency/article/001404.htm | Item 11 |
| CC-CHIARI | Cleveland Clinic, "Chiari malformation", https://my.clevelandclinic.org/health/diseases/6008-chiari-malformation | Items 9, 11, 12 |
| CC-HYDROMYELIA | Cleveland Clinic, "Hydromyelia", https://my.clevelandclinic.org/health/diseases/22732-hydromyelia | Item 10 |
| KH | KidsHealth (Nemours), "Chiari I malformation" (parents), https://kidshealth.org/en/parents/chiari.html | Item 12 |
| HIREMATH | Hiremath SB et al., "The Perplexity Surrounding Chiari Malformations – Are We Any Wiser Now?", AJNR 2020;41(11):1975–1981, https://pmc.ncbi.nlm.nih.gov/articles/PMC7658834/ | Items 6, 9, 10, 12 |
| PMC2780387 | "Tonsillar ectopia in idiopathic scoliosis…", Scoliosis 2009;4:25, https://pmc.ncbi.nlm.nih.gov/articles/PMC2780387/ | Items 3, 5 |
| PMC4340236 | "Effect of upright posture on tonsillar level in adolescent idiopathic scoliosis", Eur Radiol 2015, https://pmc.ncbi.nlm.nih.gov/articles/PMC4340236/ | Item 5 (BO line) |
| PMC11371388 | "Evaluation and Treatment of Patients with Small Posterior Cranial Fossa and Chiari Malformation, Types 0 and 1", https://pmc.ncbi.nlm.nih.gov/articles/PMC11371388/ | Items 3, 5, 6, 11 |
| PMC9834072 | Polish J Radiol, posterior fossa morphometry in 160 Chiari I patients, https://pmc.ncbi.nlm.nih.gov/articles/PMC9834072/ | Items 3, 5 |
| PMC12888059 | CM-I review (live page opened; also saved in `docs/audits/sources/2026-11-05-new-features/`) | Items 3, 9, 12 |
| BHADELIA-2011 | Bhadelia 2011, PMC7965870 (saved copy, `docs/audits/sources/2026-11-05-new-features/`) | Item 9 |
| BHADELIA-2016 | Bhadelia 2016, PMC7960326 (saved copy) | Item 9 (how cine phase-contrast images are built) |
| PMC12479577 | "Beyond resection: imaging findings of expected and complicated postoperative changes in lung cancer", https://pmc.ncbi.nlm.nih.gov/articles/PMC12479577/ | Item 13 (general radiology meaning of "postoperative changes"; not Chiari) |
| ASAP-BENZEL | American Syringomyelia & Chiari Alliance Project, Q&A with neurosurgeon Edward Benzel, https://asap.org/q-a-benzel/ (patient organization; lowest tier) | Part 2 positional headache |
| MW | Merriam-Webster, "effacement" (medical sense), https://www.merriam-webster.com/dictionary/effacement | Item 7 |
| Stanford Children's | https://www.stanfordchildrens.org/en/services/chiari-malformation/treatment (saved copy) | Item 13 |

### Blocked or not reachable (not bypassed)

| Source | What happened |
| --- | --- |
| NINDS Chiari, syringomyelia and hydrocephalus pages, and the NINDS Chiari PDF | 403 Forbidden |
| StatPearls (ncbi.nlm.nih.gov/books/NBK554609) | reCAPTCHA "Checking your browser" page |
| Radiopaedia (chiari-1-malformation, syringohydromyelia, hydromyelia, McRae line, peg-like tonsil, and others) | 406 to automated requests. A retry with different request headers was refused as bot-check circumvention and was not attempted again. Radiopaedia wording seen only in search snippets is not quoted as evidence |
| Boston Children's, "Chiari malformation type 1 surgery" PDF | Incapsula block page |
| PMC8331977 (AJNR, pointed or "peglike" tonsils in people with and without symptoms) | PMC began returning a "Checking your browser" page late in the audit; not opened |
| UW Medicine/Harborview, "After Your Chiari Decompression" (healthonline.washington.edu); Drugs.com Chiari discharge care; Merck Manuals; Oxford (OUH) foramen magnum decompression leaflet; UNC handout; BMC Scoliosis; Europe PMC; Atlantic Health; Acibadem | Not reachable from this session's network (proxy refusal or DNS failure). **UW Medicine's Chiari-specific handout is the most important missing source:** search snippets suggest it lists swallowing problems and a 911 list (sudden severe headache, sudden severe nausea and vomiting, confusion, sudden weakness, stroke symptoms). Someone with normal web access should open it before publication. Until then, nothing in this audit relies on it |

Text copies of the pages opened today are in the auditor's scratchpad, not in the repo, because this audit was told to edit only this report. If Matthew wants them kept, save copies to `docs/audits/sources/2026-11-05-mri-and-warning-signs/` the way earlier audits did.

---

## 2. Part 1, "Reading your MRI report": sentence by sentence

| # | Draft text | Verdict | Source and exact quote | Suggested wording |
| --- | --- | --- | --- | --- |
| Intro | "This page can't tell you what your scan means." *(new)* | Supported (a disclaimer, not a medical claim) | n/a | Keep |
| Intro | "A doctor looks at the scan together with your symptoms." *(approved, row 3)* | Supported. Quoted exactly (en.json, `howFound.wide`) and fits | EVIDENCE row 3; PMC12888059: "clinical decision-making must integrate both imaging and patient-reported symptoms" | Keep |
| Note | "Reports are written for doctors, and different radiologists use different words for the same thing." *(new)* | Supported | HIREMATH: "Because the distinction between these entities is often not possible on imaging, the term syringohydromyelia is used." PMC2780387 uses "tonsillar ectopia" only for descent under 5 mm, while PMC11371388 uses it for descent of 5 mm or more (see item 3) | Keep, or soften to "Reports are mainly written for doctors…" |
| 1 | "The lowest part of the back of the brain extends below the opening at the base of the skull." *(approved)* | Supported. Quoted exactly (en.json kit answer, "What is Chiari malformation?") | EVIDENCE row 1 | Keep. See the "Arnold-Chiari" note in section 5 for a synonym the list leaves out |
| 2 | "The lowest part of the cerebellum, at the bottom of the back of the brain. The cerebellum helps control balance and coordination." | Supported with change. The second sentence matches tour step 1 exactly. The first is a fresh paraphrase: the approved structure card says "The two lowest parts of the cerebellum" | en.json structure card: "The two lowest parts of the cerebellum." MAYFIELD: "On the underside of the cerebellum are two tonsils." | "The two lowest parts of the cerebellum, at the bottom of the back of the brain (not the tonsils in your throat). The cerebellum helps control balance and coordination." |
| 3a | "Different ways of saying the tonsils sit lower than usual." *(new)* | Supported with change. The words do describe the same direction of finding, but they are **not always used for the same amount** (see section 3) | PMC2780387: "Chiari I malformation is characterized by tonsillar herniation, which is defined as descent of cerebellar tonsils ≥5 mm… Herniation of cerebellar tonsils of <5 mm… is regarded as tonsillar ectopia." In contrast, PMC11371388: "a finding of ≥5 mm tonsillar ectopia inferior to the McRae line is considered diagnostic of Chiari I malformation", and "asymptomatic individuals with low-lying tonsils (TH > 1.5 ± 1.1 mm)" | "Different ways of saying the tonsils sit lower than usual. Some reports use 'ectopia' or 'low-lying' for a small drop that isn't called Chiari, and others use the words the same way. The number in millimeters says more than the word." |
| 3b | "On a Chiari report, 'herniation' usually means this too, not an emergency." *(new, flagged by the author)* | **Not supported. Safety fail.** The first half is accurate. "Not an emergency" is reassurance that reads as triage. MedlinePlus uses "tonsillar herniation" as a name for an emergency and names Chiari as a possible cause, so a patient who searches the word finds the opposite message. This page cannot know whether a reader's symptoms are changing | Accurate part: PMC12888059: CM-I "is characterized by the herniation of the cerebellar tonsils through the foramen magnum"; PMC9834072 reports "tonsillar herniation 12.4 ± 3.7 mm" as the routine measurement. Conflict: MP-HERN: "Brain herniation is a medical emergency"; its causes include "Defect in brain structure, such as a condition called Arnold-Chiari malformation"; alternative names include "Tonsillar herniation" | "On a Chiari report, 'herniation' usually describes this same finding: how far the tonsils sit below the opening. Ask your doctor what your report means for you." (Delete "not an emergency." Do not add a sentence contrasting it with emergency herniation, because MedlinePlus lists Chiari as one cause.) |
| 4 | "The opening at the base of the skull where the brainstem becomes the spinal cord." *(approved)* | Supported. Quoted exactly (tour step 1 and structure card) | EVIDENCE, tour | Keep |
| 5a | "How far the tips of the tonsils reach below a line drawn across the skull opening." *(new phrasing of row 7)* | Supported | PMC9834072: "CTH (the perpendicular distance between the McRae line and the most inferior margin of the cerebellar tonsils)". PMC2780387: "The reference lines (BO-lines) connect the basion (B) and opisthion (O)… descent of cerebellar tonsils 4 mm below the BO-line" | Keep |
| 5b | "About 5 mm is the usual cutoff; a few millimeters below can still be normal." *(approved)* | Supported, and the paraphrase is faithful (Chiari note: "at least about 5 mm by the usual definition"; typical note: "(a few millimeters below can still be normal)"). **Safety caveat in this new context:** someone whose report says "3 mm" and who has symptoms may read "normal" as "nothing to see". The approved Home text already balances this, so reuse it | PMC11371388: "Symptomatic patients with borderline CM1 receive (false) negative diagnoses"; "Patients with TH of ≥5 mm may be asymptomatic". PMC2780387: the cutoff is "≥6 mm in patients younger than 10 years" in one definition | Keep, then add the approved Home sentences (en.json line 176): "Some people with a clear descent have no symptoms, and some with less than 5 mm do. Doctors also look at the shape of the tonsils, spinal fluid flow, and whether a syrinx is present." |
| 5c | "How far the tonsils extend doesn't always match how someone feels, and the number alone doesn't decide who needs surgery." *(approved)* | Supported. Both halves are quoted exactly (sizeNote and Chiari note) and joined with "and". Fits | EVIDENCE rows 7 and 15 | Keep. If 5b gains the Home sentences, drop the first half here so it isn't said twice: "The number alone doesn't decide who needs surgery." |
| 5 synonyms | "below the McRae line", "basion–opisthion line" | Supported: the same line (see section 3) | PMC2780387 and PMC4340236 ("a reference plane connecting the basion to the opisthion (BO line)"); EVIDENCE McRae line definition (Barkovich 1986, Radiopaedia) | Keep. Optionally add "(the basion and opisthion are the front and back edges of the opening)" |
| 6 | "The tonsils are pointed rather than rounded, which is common in Chiari I." | Supported for "peg-like" and "pointed". **"Wedge-shaped" was not found in any opened source** | HIREMATH: "asymmetrical tonsillar herniation with a peglike configuration". PMC11371388: "Cerebellar peg-like rather than rounded tonsils are molded into that shape in the FM and are more common in patients with TH > 5 mm" | Heading: "Peg-like or pointed tonsils" (drop "wedge-shaped" unless a source is found). Text: "The tonsils are pointed rather than rounded, which is common in Chiari I." |
| 7a | "The space around the tonsils where spinal fluid flows is squeezed, so there's less room for fluid to pass." | Supported (it defines the report phrase; the approved note "often crowded" covers the general claim) | EVIDENCE cisterna magna row (Milhorat 1999, "obliteration of the retrocerebellar cerebrospinal fluid spaces"); row 17 (Baisden) | Keep |
| 7b | "'Effacement' means the space is pressed flat or hard to see." *(new)* | Supported with change. "Pressed flat" is close. "Hard to see" describes how it looks on the scan, not what the word means | MW (medical): effacement is "the thinning or obliteration of tissue or narrowing of an internal anatomical space" | "'Effacement' means the space is narrowed or squeezed shut, so little or no fluid shows there on the scan." |
| 8 | CSF definition *(approved, row 9)* | Supported. Matches the tour text | EVIDENCE row 9 | Keep |
| 9a | "A special MRI that shows spinal fluid moving with each heartbeat." *(new)* | Supported with change. A cine phase-contrast scan averages the flow over many heartbeats to show the back-and-forth pattern of one heartbeat. It does not film every beat | BHADELIA-2011: "Cine-PC MR imaging can noninvasively demonstrate biphasic CSF flow between the head and spine that occurs due to craniospinal pressure variations during a cardiac cycle." BHADELIA-2016: cine phase contrast "produces images that are weighted averages of the phasic behavior over many cardiac cycles." CC-CHIARI: "Cine MRI (to see the flow pattern of cerebrospinal fluid)" | "A special MRI that shows how spinal fluid moves back and forth with the heartbeat." |
| 9b | "Some doctors use it to see whether flow is slowed or blocked at the skull opening." | Supported. "Some doctors" is the right hedge | HIREMATH: "The evaluation of CSF flow by phase-contrast MR imaging in the presurgical period may serve as a guide for surgical planning… The salient findings on CSF flow studies include obstruction of CSF flow at the level of the foramen magnum." PMC12888059: cine MRI "allows the visualization of CSF flow around the base of the skull and helps identify flow obstruction" | Keep. Optionally add "Not everyone needs one." |
| 10a | Syrinx definition and location *(approved)* | Supported. Quoted exactly (Explorer syrinx note and tour step 5) | EVIDENCE Syrinx table; MP-SYR: "The fluid-filled cyst is called a syrinx"; "usually begins in the spinal cord near the level of the neck area" | Keep |
| 10b | "These words all describe it." *(new)* | **Not supported as written.** Syrinx, syringomyelia and syringohydromyelia: yes. Hydromyelia: technically a different thing, a widened central canal (see section 3) | HIREMATH: "Syringomyelia is a fluid-filled cavity formed by CSF dissecting the spinal cord, as opposed to hydromyelia, which represents dilation of the ependymal-lined central canal. Because the distinction between these entities is often not possible on imaging, the term syringohydromyelia is used." CC-HYDROMYELIA: "Hydromyelia is similar to syringomyelia, but they're distinct conditions with different causes and treatments." | "Syringomyelia means having a syrinx. Hydromyelia technically means the spinal cord's thin central fluid channel has widened. The two are often hard to tell apart on MRI, so reports may say 'syringohydromyelia'. Ask your doctor which one your report means." |
| 11a | "The space at the back and bottom of the skull that holds the cerebellum and brainstem." *(new)* | Supported | MP-PF: "Posterior fossa tumor is a type of brain tumor located in or near the bottom of the skull. The posterior fossa is a small space in the skull, found near the brainstem and cerebellum." MAYFIELD (saved Chiari page): "The cerebellum is the lower part of the brain located in the posterior fossa"; "If too small, the effects can be crowding of the brainstem and cerebellum." CC-CHIARI: "removes a part of the back of your skull (posterior fossa)" | Keep |
| 11b | "In Chiari I it is often smaller or differently shaped than usual, which crowds the brain." *(approved meaning, row 1)* | Supported. "Often" matters: it is not small in everyone | HIREMATH: "a small posterior fossa is not necessarily seen in all patients with CM-1." PMC11371388: "other studies report similar PCF volumes in CM1 patients and controls" | Keep, including "often" |
| 12a | "Too much fluid in the brain's fluid spaces (the ventricles)." *(new)* | Supported with change (make clear it is spinal fluid, and that it builds up) | MP-HYDRO: "Hydrocephalus is the buildup of too much cerebrospinal fluid in the brain." KH: "a buildup of spinal fluid in the spaces deep within the brain." MAYFIELD: "Excess CSF can collect and enlarge either the ventricles in the brain (hydrocephalus)…" | "A buildup of too much spinal fluid in the fluid-filled spaces deep in the brain (the ventricles)." |
| 12b | "It is less common with Chiari I than with other types of Chiari." *(new: needs a source)* | Supported with change. The sources support a comparison with **Chiari II** (and III). "Other types" also takes in Chiari 0 and 1.5, which no source covers | HIREMATH: CM-1 "is associated with anterior flattening of the midbrain, pons, and medulla, and rarely hydrocephalus"; its CM-2 figure shows "hydrocephalus (asterisk)". PMC12888059: CM-II "is mainly associated with hydrocephalus, myelomeningocele, syringomyelia…". CC-CHIARI: "Chiari type 2 and 3… A common complication of these types is hydrocephalus." | "It is much less common with Chiari I than with Chiari II." (Avoid "rare": one Chiari I series reported a higher rate in a search snippet; not opened.) |
| 13a | "Suboccipital craniectomy: the piece of bone removed at the back of the skull opening." | Supported with change. A craniectomy is the removal, not the piece of bone | MAYFIELD: "The surgeon removes a small section of skull at the back of your head (suboccipital craniectomy)." Stanford Children's: "removal of a portion of the skull bone (craniectomy) on the lower part of the back of the skull" | "Suboccipital craniectomy: removing a small piece of bone at the back of the skull, next to the opening." |
| 13b | "C1 laminectomy: the back of the first neck bone removed." | Supported with change (same grammar issue) | MAYFIELD: "In some cases the bony arch of the C1 vertebra may be removed (laminectomy)." EVIDENCE C1 row | "C1 laminectomy: removing the back part of the first neck bone." |
| 13c | "Duraplasty: the brain's covering (the dura) opened and patched." | Supported with change | MAYFIELD: "opening the dura and sewing a patch (duraplasty)"; glossary: "dural patch: (also called a dural graft, dural substitute, duraplasty) a piece of tissue used to close or extend the dura mater" | "Duraplasty: opening the brain's covering (the dura) and sewing in a patch to make more room." (Matches the approved surgery step "sews in a patch… to make more room".) |
| 13d | "'Postoperative changes' means the scan shows the surgery that was done." *(new)* | Supported with change. In general radiology use, "postoperative changes" means the expected marks of surgery. Radiologists list complications separately, so the phrase alone does not say how healing is going. Only a general (lung-surgery) source was found; no Chiari source | PMC12479577: "distinguishing normal postoperative changes from complications on imaging can be challenging" | "'Postoperative changes' means the scan shows changes from the surgery, such as where bone was removed. Your surgeon can explain anything else the report mentions." |
| Bottom | Visit prep link | Not medical | n/a | Keep |

---

## 3. Synonym check

| Group | Same finding? | Nuance a patient needs |
| --- | --- | --- |
| Tonsillar ectopia, tonsillar descent, low-lying tonsils, tonsillar herniation | **Same direction, not always the same amount.** Some authors keep "tonsillar ectopia" for descent under 5 mm and "herniation" for 5 mm or more (PMC2780387). Others use "ectopia" for any amount, including 5 mm or more (PMC11371388). "Low-lying tonsils" is used for small, often symptom-free descent (PMC11371388: "asymptomatic individuals with low-lying tonsils (TH > 1.5 ± 1.1 mm)") | So "ectopia" or "low-lying" on a report may mean the radiologist does **not** call it Chiari. "Herniation" also names an unrelated acute emergency in general medicine (MP-HERN). The millimeter number is more informative than the word |
| "Below the foramen magnum", "below the McRae line", "basion–opisthion (BO) line" | **Yes.** The McRae line runs from the basion to the opisthion (EVIDENCE: Barkovich 1986, Radiopaedia), and the BO line is defined the same way (PMC2780387, PMC4340236). "Below the foramen magnum" on a report means below this line | Measurements can differ by a few millimeters between images and readers. PMC11371388: "One group recommended using coronal rather than sagittal images to measure right and left TH." Not essential for the page |
| CSF flow study, cine MRI, phase-contrast MRI | **Effectively yes, as reports use them.** The flow test for Chiari is cine phase-contrast MRI (HIREMATH: "Phase-contrast MR imaging: CSF flow study"). Strictly, "cine" means a movie-like series of images, and cine MRI can also show tissue motion: HIREMATH: "cine MR imaging demonstrates a slight inferior motion of the cerebellar tonsils" | Fine to group for patients. The site already uses "fluid-flow MRI (cine MRI)" (Visit prep) |
| Syrinx, syringomyelia, syringohydromyelia, hydromyelia | **Not all the same.** A syrinx is the cavity, and syringomyelia is the condition of having one (MP-SYR). Hydromyelia is a widened central canal, which is technically different (HIREMATH; CC-HYDROMYELIA: "distinct conditions with different causes and treatments"). Syringohydromyelia is used because MRI often can't tell them apart (HIREMATH) | A slightly widened canal "up to 2–3 mm is termed prominent central canal and >3 mm as syringomyelia" (HIREMATH). Reports may say "prominent central canal"; consider adding that phrase (section 5). Cleveland Clinic's hydromyelia page is about children and links it mainly to Chiari II, so don't link to it as a general syrinx page |

---

## 4. Part 2, "When to call after surgery": item by item

Opened discharge sources: **MP-DISCHARGE** (craniectomy surgery, with Chiari named as one reason) and **MAYFIELD** (Chiari decompression). The UW Medicine Chiari handout and Boston Children's could not be opened (section 1).

| Draft text | Verdict | Source and exact quote | Suggested wording |
| --- | --- | --- | --- |
| "Your surgical team will tell you what to watch for and who to call, day or night. Follow their instructions first." | Supported with change. "Will tell you" promises something that may not happen; the Visit prep question "Who do I call… at night and on weekends?" exists because it sometimes doesn't | MP-DISCHARGE: "After you go home, follow your surgeon's instructions on how to care for yourself. Use the information below as a reminder." | "Before you go home, your surgical team should tell you what to watch for and who to call, day or night. Follow their instructions first." |
| "Hospitals' discharge instructions after Chiari surgery commonly list these as reasons to call the surgical team right away:" | Supported with change. Only two discharge sources were opened, and one is a general brain-surgery sheet, so "commonly" is stronger than this audit can show | MAYFIELD "When to Call Your Doctor"; MP-DISCHARGE "Contact your surgeon if you have" | "Discharge instructions after Chiari surgery often list these as reasons to call the surgical team right away:" |
| "a fever (ask what temperature counts);" | Supported with change (add chills). The two sources give different cutoffs, so "ask what temperature counts" is right | MP-DISCHARGE: "Fever of 101°F (38.3°C) or higher, or chills". MAYFIELD: "Fever over 101.5º (unrelieved by Tylenol)." | "a fever or chills (ask what temperature counts);" |
| "redness, swelling or warmth at the incision, or pus or other drainage from it;" | Supported with change. **"Warmth" is in neither opened source** (it is a common infection sign but has no source here). "Pus" is a fair plain word for "colored drainage". Missing: bleeding, more pain, the incision opening | MP-DISCHARGE: "Redness, swelling, discharge, pain, or bleeding from the incision or if the incision comes open". MAYFIELD: "Signs of incision infection, such as spreading redness, separation, or colored drainage." | "redness, swelling, bleeding or more pain at the incision, any fluid or pus coming from it, or the incision coming open;" |
| "clear fluid leaking from the incision, or a soft swelling under it that keeps growing;" | Supported with change. **"That keeps growing" narrows it:** Mayfield treats any soft, squishy swelling as a possible spinal fluid leak to report. Missing: clear fluid from the nose or ear, or dripping into the throat | MAYFIELD: "A visible swelling that is soft and squishy may be a sign of cerebrospinal fluid (CSF) leakage. A clear sticky fluid may leak from the incision. Call the surgeon should any drainage occur"; "Swelling at the incision with leaking of clear fluid from your ear or nose"; pseudomeningocele "may resolve on it's own; however notify your surgeon if this occurs." MP-DISCHARGE: "Fluid or blood dripping into your throat"; "Swelling around your wound or underneath your scalp that does not go away within 2 weeks or is getting worse" | "clear fluid leaking from the incision, from the nose or ear, or dripping down the throat, or a soft, squishy swelling under the incision;" |
| "a headache that is much worse than before, or that gets worse when sitting up or standing;" | Supported with change. **"Much worse" narrows it:** the sources say "increased headaches" and a headache the medicine doesn't relieve. **The sitting-up or standing part is not in either opened discharge source.** Its only opened support is a patient organization quoting a neurosurgeon (ASAP-BENZEL: "People with such leaks may complain of headache, particularly while upright"), so it fails this box's rule | MAYFIELD: "Increased drowsiness, weakness of arms / legs, increased headaches, vomiting…". MP-DISCHARGE: "Headache that does not go away and is not relieved by medicines the surgeon gave you" | "a headache that is getting worse, or that the medicine you were given doesn't help;" (Add back "or that is worse when sitting up or standing" only if Matthew accepts ASAP as the source, or once the UW handout or another discharge sheet is opened) |
| "a stiff neck together with a fever;" | Supported with change. **"Together with a fever" narrows it.** Mayfield lists severe neck pain or stiffness on its own (fever is already its own item). Some neck pain is expected, so the line needs the "chin to chest" test to be specific | MAYFIELD: "severe neck pain that prevents lowering your chin to chest"; "you can expect headache and neck pain from the incision that may last several weeks." MP-EMERG lists, for children, "Fever followed by a change in mental status, stiffness in the neck or back" as an emergency warning sign | "severe neck pain or stiffness that stops you from bending your chin down to your chest;" |
| "vomiting that doesn't stop;" | Supported with change. **"That doesn't stop" narrows it:** Mayfield lists vomiting with no qualifier | MAYFIELD: "…increased headaches, vomiting, or severe neck pain…" | "vomiting (throwing up);" |
| "new weakness, numbness, or trouble walking, talking or swallowing." | Supported with change. **"New" alone narrows it:** a symptom that was there before surgery and gets worse also counts ("new or worsening"). **"Numbness" and "swallowing" are in neither opened discharge source.** Both are plausible (search snippets say the blocked UW handout lists "problems swallowing") but unconfirmed. Missing from this line: balance | MP-DISCHARGE: "Weakness in your arms or legs that you did not have before"; "New problems walking or keeping your balance"; "New or worsening problem speaking". MAYFIELD: "weakness of arms / legs"; "New or worsening vision, speech or confusion." | "new or worse weakness in the arms or legs, or trouble walking, keeping your balance or speaking;" (Add "numbness" and "swallowing" back once a discharge source that lists them is opened) |
| **Emergency line:** "Call 911 or your local emergency number for trouble breathing, a seizure, or if the person is very hard to wake up." | Supported, from **general** MedlinePlus emergency pages, not a Chiari discharge sheet. Both discharge sources list seizure, "A hard time waking up" and shortness of breath only as reasons to contact the surgeon, so moving them up to 911 is a cautious step and safe | MP-EMERG (American College of Emergency Physicians warning signs): "Breathing problems (difficulty breathing, shortness of breath)"; "Change in mental status (such as unusual behavior, confusion, difficulty arousing)"; children: "Seizure", "Unconsciousness". MP-SEIZ: "Call 911 or the local emergency number if: This is the first time the person has had a seizure; A seizure lasts more than 2 to 5 minutes; The person does not awaken…". MP-ALERT: "Call 911 or the local emergency number if normal alertness does not return quickly." MP-BREATH: call 911 if "Breathing difficulty comes on suddenly or seriously interferes with your breathing and even talking" | "**Call 911 or your local emergency number** for trouble breathing, chest pain, a seizure, sudden confusion, or if the person is very hard to wake up. If you think it's an emergency, don't wait." (Chest pain: MP-DISCHARGE lists "Shortness of breath, chest pain"; MP-EMERG: "Chest pain or discomfort lasting for two minutes or more". "Don't wait": MP-EMERG: "DO NOT delay.") |
| Design note: "says when to call, never when it's safe not to" | The draft breaks its own rule through the narrowing qualifiers above ("much worse", "keeps growing", "doesn't stop", "together with a fever", "new"). The replacement wording removes all of them | n/a | Add a last line to the box: "Call them about anything else that worries you, too." |

### Missing from Part 2 (in both opened discharge sources, or in one with clear clinical weight)

1. **Vision changes:** MP-DISCHARGE "Vision changes (double vision, blind spots in your vision)"; MAYFIELD "New or worsening vision". Suggested: "new problems seeing, such as double vision;"
2. **Confusion or unusual sleepiness:** MP-DISCHARGE "Problems thinking straight, confusion, or more sleepiness than usual"; MAYFIELD "Increased drowsiness"; "confusion". Suggested: "confusion, or being much sleepier than usual;" (Being very hard to wake stays on the 911 line)
3. **Swelling and tenderness in one calf (possible blood clot):** MAYFIELD "Swelling and tenderness in the calf of one leg." Suggested: "a swollen, sore calf in one leg;"
4. **Medicine side effects:** MP-DISCHARGE "Side effects from a medicine (do not stop taking a medicine without talking to your surgeon first)"; MAYFIELD names anti-seizure medicine side effects. Suggested: "side effects from a medicine (don't stop it without asking first)."
5. **Chest pain and shortness of breath:** MP-DISCHARGE. Covered by the suggested 911 line.
6. **Children:** no children's-hospital Chiari discharge sheet could be opened (Boston Children's blocked). The general emergency list (MP-EMERG) adds "Increased sleepiness", "Difficulty in eating or feeding" and "Unable to stand or walk" for children. Consider a child line after a pediatric discharge source is opened.

---

## 5. Approved sentences: quoting and fit

| Draft cites | Matches en.json? | Fits new context? |
| --- | --- | --- |
| Row 3, "A doctor looks at the scan together with your symptoms." | Exact (`howFound.wide`) | Yes |
| Item 1, kit answer | Exact (kit "What is Chiari malformation?") | Yes |
| Item 2, tour/structure card | Second sentence exact. The first is a paraphrase ("The lowest part" vs approved "The two lowest parts") | Use the approved "two lowest parts" |
| Item 4, tour step 1 | Exact | Yes |
| Item 5, "About 5 mm is the usual cutoff; a few millimeters below can still be normal." | Paraphrase of the Chiari note ("at least about 5 mm by the usual definition") and the typical note (exact in-parenthesis wording) | Yes, but on a report-reading page it needs the approved Home balance sentence (section 2, row 5b) |
| Item 5, "doesn't always match… number alone doesn't decide…" | Both halves exact (sizeNote and Chiari note) | Yes |
| Item 6, "They are often pointed rather than rounded." | Exact in the citation; the draft's own sentence says "common in Chiari I", same meaning | Yes |
| Item 7, "The fluid space behind them is often crowded" | Exact in the citation | Yes |
| Item 8, row 9 | Exact (tour step 4) | Yes |
| Item 9, "slows or is blocked" | Exact in the Chiari note | Yes |
| Item 10, syrinx note | Exact | Yes |
| Item 11, row 1 meaning | Paraphrase of the Home "What is Chiari" text | Yes |
| Item 13, surgery steps | Definitions agree with the approved steps ("often" for C1 and the patch is in the Explorer; the glossary defines terms, so "often" is not needed) | Yes, after the grammar fixes |

### Terms worth adding to Part 1 (optional, each needs its own source row)

- **"Arnold-Chiari malformation":** often used loosely for any type, but MAYFIELD says the name properly belongs to type II: "This type is correctly called Arnold-Chiari malformation." A patient whose type I report says "Arnold-Chiari" may otherwise think they have type II.
- **"Prominent central canal":** HIREMATH: dilation "up to 2–3 mm is termed prominent central canal and >3 mm as syringomyelia."
- **"Pseudomeningocele"** (after surgery): MAYFIELD: "an abnormal collection of cerebrospinal fluid (CSF) under the tissues of the neck. The collection may resolve on it's own; however notify your surgeon if this occurs." It often appears on post-surgery reports. Word it carefully so it is not read as reassurance.
- **"Cisterna magna"**, **"craniocervical junction"**, **"Chiari 0 / Chiari 1.5 / borderline Chiari"** (HIREMATH and PMC11371388), and **"basilar invagination"** (MAYFIELD: bony abnormalities "affect about 25% of patients").

---

## 6. Summary

- **Part 1:** 2 sentences are not supported (3b "not an emergency" and 10b "These words all describe it"). 9 are supported with change: items 2, 3a, 6 ("wedge-shaped"), 7b, 9a, 12a, 12b and 13 (four definitions). Item 5b needs a balancing sentence in this new context. Everything else is supported and correctly quoted.
- **Part 2:** every list item needs a change. Five carry narrowing qualifiers, which break the box's own rule. Three symptoms (warmth, numbness, swallowing) and the positional headache lack an opened discharge source. Vision changes, confusion or sleepiness, and calf swelling are missing. The 911 line is supported by general MedlinePlus emergency guidance and should add chest pain, sudden confusion and "If you think it's an emergency, don't wait."
- **Before publication:** open the UW Medicine "After Your Chiari Decompression" handout and a children's-hospital Chiari discharge sheet from an unrestricted network, to confirm or restore "numbness", "swallowing" and the positional headache, and to check the emergency list. Add EVIDENCE rows for every new sentence. Keep copies of the sources.

### Recommended final wording (items that change)

**Part 1**

- **2. Cerebellar tonsils:** The two lowest parts of the cerebellum, at the bottom of the back of the brain (not the tonsils in your throat). The cerebellum helps control balance and coordination.
- **3. Tonsillar ectopia, tonsillar descent, low-lying tonsils, tonsillar herniation:** Different ways of saying the tonsils sit lower than usual. Some reports use "ectopia" or "low-lying" for a small drop that isn't called Chiari, and others use the words the same way. The number in millimeters says more than the word. On a Chiari report, "herniation" usually describes this same finding: how far the tonsils sit below the opening. Ask your doctor what your report means for you.
- **5. Measurement** (add after the cutoff sentence): Some people with a clear descent have no symptoms, and some with less than 5 mm do. Doctors also look at the shape of the tonsils, spinal fluid flow, and whether a syrinx is present. The number alone doesn't decide who needs surgery.
- **6. Heading:** Peg-like or pointed tonsils (drop "wedge-shaped" unless sourced).
- **7. Effacement:** "Effacement" means the space is narrowed or squeezed shut, so little or no fluid shows there on the scan.
- **9. Flow study:** A special MRI that shows how spinal fluid moves back and forth with the heartbeat. Some doctors use it to see whether flow is slowed or blocked at the skull opening.
- **10. Syrinx terms** (replace "These words all describe it."): Syringomyelia means having a syrinx. Hydromyelia technically means the spinal cord's thin central fluid channel has widened. The two are often hard to tell apart on MRI, so reports may say "syringohydromyelia". Ask your doctor which one your report means.
- **12. Hydrocephalus:** A buildup of too much spinal fluid in the fluid-filled spaces deep in the brain (the ventricles). It is much less common with Chiari I than with Chiari II.
- **13. After surgery:** Suboccipital craniectomy: removing a small piece of bone at the back of the skull, next to the opening. C1 laminectomy: removing the back part of the first neck bone. Duraplasty: opening the brain's covering (the dura) and sewing in a patch to make more room. "Postoperative changes" means the scan shows changes from the surgery, such as where bone was removed. Your surgeon can explain anything else the report mentions.

**Part 2, "When to call after surgery"**

> Before you go home, your surgical team should tell you what to watch for and who to call, day or night. Follow their instructions first.
>
> Discharge instructions after Chiari surgery often list these as reasons to **call the surgical team right away**:
> - a fever or chills (ask what temperature counts);
> - redness, swelling, bleeding or more pain at the incision, any fluid or pus coming from it, or the incision coming open;
> - clear fluid leaking from the incision, from the nose or ear, or dripping down the throat, or a soft, squishy swelling under the incision;
> - a headache that is getting worse, or that the medicine you were given doesn't help;
> - severe neck pain or stiffness that stops you from bending your chin down to your chest;
> - vomiting (throwing up);
> - new or worse weakness in the arms or legs, or trouble walking, keeping your balance or speaking;
> - new problems seeing, such as double vision;
> - confusion, or being much sleepier than usual;
> - a swollen, sore calf in one leg;
> - side effects from a medicine (don't stop it without asking first).
>
> Call them about anything else that worries you, too.
>
> **Call 911 or your local emergency number** for trouble breathing, chest pain, a seizure, sudden confusion, or if the person is very hard to wake up. If you think it's an emergency, don't wait.
