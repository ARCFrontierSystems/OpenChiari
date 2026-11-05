# Independent audit: research study summaries (draft)

- **Date:** 2026-11-05
- **Who:** a fresh AI agent that did not write the summaries (CLAUDE.md rule 1a, check 3). This is a check against the official listings, not a medical review.
- **What was checked:** `docs/drafts/2026-11-05-study-summaries.md`: every claim in the "Plain summary" and "What you'd do" columns for the four drafted studies; the recommendation to leave out NCT06375759; the "not confirmed in over 2 years" note for NCT06308367 and NCT06268093; and the note that no study allows taking part from home.
- **How:** each claim was compared with the saved ClinicalTrials.gov API v2 listing (protocolSection: descriptionModule, designModule, armsInterventionsModule, eligibilityModule, outcomesModule, statusModule, contactsLocationsModule, conditionsModule). The thalidomide listing's status block was also re-fetched live from the API on 2026-11-05 to confirm the verified date. The ClinicalTrials.gov glossary was opened (its text is inside the site's script file) to check the "unknown" status rule.
- **Result:** 46 rows checked (draft claims plus facts the draft leaves out). 27 OK or needing only a small wording note, 19 flagged: 0 High, 7 Medium, 12 Low. Nothing is phrased as medical advice, and no summary promises a benefit.

## Sources

| Study | Saved listing | Official page |
| --- | --- | --- |
| NCT06502431 | `docs/audits/sources/2026-11-05-studies/NCT06502431.json` | https://clinicaltrials.gov/study/NCT06502431 |
| NCT06724029 | `docs/audits/sources/2026-11-05-studies/NCT06724029.json` | https://clinicaltrials.gov/study/NCT06724029 |
| NCT06308367 | `docs/audits/sources/2026-11-05-studies/NCT06308367.json` | https://clinicaltrials.gov/study/NCT06308367 |
| NCT06268093 | `docs/audits/sources/2026-11-05-studies/NCT06268093.json` | https://clinicaltrials.gov/study/NCT06268093 |
| NCT06375759 | `docs/audits/sources/2026-11-05-studies/NCT06375759.json` | https://clinicaltrials.gov/study/NCT06375759 |
| Glossary ("Last verified", "Unknown") | opened 2026-11-05 | https://clinicaltrials.gov/study-basics/glossary |

All saved listings carry `versionHolder: 2026-11-04`.

## NCT06502431: Neurofluid dynamics in Chiari I (Amiens, France)

| Claim | Supported? | Listing quote | Problem | Suggested fix |
| --- | --- | --- | --- | --- |
| Researchers want to understand how spinal fluid and blood move in the head and neck in Chiari I | Yes | "A global analysis of craniospinal hemodynamics and hydrodynamics is necessary to better understand the pathophysiology of Chiari malformations" | None | Keep |
| They use a special MRI that measures flow | Yes | "This analysis will be made possible by PCMRI acquisitions"; outcomes "CSF Flow", "Blood Flow" | None | Keep |
| Comparing adults with and without symptoms to people without Chiari | Yes | Arms: "Symptomatic CMI group", "Non-Symptomatic CMI group", "Control group"; "Craniospinal hemohydrodynamics in a control population will also be analyzed"; `healthyVolunteers: true` | None. (Note: people without Chiari can join, but the "What you'd do" column reads as if only people with Chiari can.) | See last row |
| Extra flow scans added to an MRI | Yes | "phase contrast sequences complementary to the morphological MRI performed as part of the patient management" | None. Do not copy the listing's phrase "patients will benefit from", which could read as a promise. | Keep |
| On one day | Partly | Outcomes time frame: "day 1" | The listing only gives "day 1" as the time of measurement. It does not say there are no other visits. | "The scans are done on one day." is a fair reading; or "Measurements are taken on day 1." |
| Adults 18 to 50 | Yes | "aged 18 to 50 years"; `minimumAge: 18 Years`, `maximumAge: 50 Years` | None | Keep |
| No past brain or spine surgery and no neurological or heart conditions | Yes | "no previous neurosurgical, neurological, or cardiological history" | Matches the listing. But a person with symptomatic Chiari may wonder whether Chiari itself counts as a "neurological condition". The listing doesn't say. | "...no past brain or spine surgery, and no other nerve or heart conditions in your history (ask the study team what counts)." |
| (Missing) other limits | Not stated in draft | Exclusion: "MRI contraindication"; "pregnant, breast-feeding and parturient women"; "CMI invalidated by our radiological review" | **Medium.** Three limits a patient needs are missing: you must be able to have an MRI, you can't be pregnant or breastfeeding, and the study team re-checks your scans to confirm Chiari I. | Add: "Not for people who can't have an MRI, or who are pregnant or breastfeeding. The study team re-checks your scans to confirm Chiari I. People without Chiari can also join, for comparison." |
| (Missing) how people are invited | Not stated in draft | "After neurosurgical consultation, patients with Chiari malformation will be assigned ... They will be offered to participate"; one site: "CHU Amiens Picardie" | **Low.** People with Chiari are invited after a visit with the neurosurgery team at this one hospital. A reader elsewhere may think they can simply sign up. | Add: "People with Chiari are invited after a neurosurgery visit at the hospital in Amiens." |
| (Data check) still recruiting | Listing conflicts with itself | `overallStatus: RECRUITING`, but `primaryCompletionDateStruct: 2025-04-01, ACTUAL` | **Low.** The main data collection is marked as finished (April 2025), yet the study still says "Recruiting" (verified July 2026). It may not really be taking new people. | No change to wording. Consider a note to Matthew, or show it only with the standard "check with the study team" line. |

## NCT06724029: Neurosurgical Outcome Network (Italy)

| Claim | Supported? | Listing quote | Problem | Suggested fix |
| --- | --- | --- | --- | --- |
| Researchers want to learn what predicts how people do after brain and spine surgery | Yes | "This study aims to assess outcomes and their predictors"; secondary objective "Identify outcome predictors" | None | Keep |
| Across many conditions including Chiari I | Yes | Conditions list 23 conditions including "Chiari Malformation Type 1"; inclusion "Malformative pathology: Chiari malformation type 1" | None | Keep |
| Hospitals record each person's health, memory and thinking, and mood | **Overstated for Chiari** | "For cognitive and psychological assessment: age 18 years or older; adequate understanding of Italian language; diagnosis of glioma, meningioma, vascular pathology, spinal pathology" | **Medium.** Memory, thinking and mood tests are only for some diagnoses (certain brain tumors, blood vessel problems, spine problems), and need good Italian. Chiari I is not on that list. A person with Chiari may only have their general health recorded. | "Hospitals record each person's health before and after surgery. Some people, mostly those with certain brain tumors, blood vessel problems or spine problems, also have memory, thinking and mood tests." |
| Before surgery and afterwards | Yes | "collection of clinical, cognitive, and psychological data before the intervention and during follow-up after the intervention" | None | Keep |
| Checks and questionnaires before surgery and at follow-up visits | Partly | "during follow-up after the intervention (timing varies depending on the neurosurgical pathology)" | **Low.** "Questionnaires" and "visits" are not stated for Chiari. The listing says only "follow-up". | "Health information is collected before surgery and during follow-up afterward." |
| For up to 5 years | **Not supported as written** | Outcomes time frame: "5 years"; `completionDateStruct: 2027-06, ESTIMATED`; "timing varies depending on the neurosurgical pathology" | **Medium.** "5 years" is the time frame for the study's data collection as a whole, not how long each person is followed. The study is planned to end in June 2027, so someone joining now would not be followed for 5 years. | "How often and for how long depends on the condition. The listing doesn't say." |
| (Missing) it doesn't change your care | Not stated in draft | `studyType: OBSERVATIONAL`; "Patient enrollment from Neurosurgery Departments" | **Low.** A patient may think the study decides their surgery. It is an observational study: it records information about surgery people are already having. | Add: "The study doesn't change your treatment. It only collects information." |
| For adults | Yes | `minimumAge: 18 Years`; "Patients older than 18 years old, with neurosurgical pathology" | None | Keep |
| Having neurosurgery at a participating hospital in Italy | Partly | 27 hospitals listed; 11 are "RECRUITING" (Catania, Florence, Frosinone, Livorno, Milan x2, Monza, Palermo, Rome x2, Udine); 16 are "ACTIVE_NOT_RECRUITING" | **Low.** Most listed hospitals are no longer taking new people. | "...at one of the hospitals in Italy that is still taking new people (the official listing shows which)." |

## NCT06308367: Betaine for syringomyelia (Beijing, China)

| Claim | Supported? | Listing quote | Problem | Suggested fix |
| --- | --- | --- | --- | --- |
| Whether betaine helps syringomyelia and what side effects it has | Yes | "evaluate the indications, therapeutic effects and side effects of betaine in refractory syringomyelia" | Phrased as a question, not a promise. Good. | Keep |
| A medicine taken by mouth | Yes | Arm: "oral betaine" | None | Keep |
| Syringomyelia that surgery hasn't helped | Partly | Inclusion: "Contraindication to duraplasty and shunting treatment ..."; "non-effective response to duraplasty and shunting treatment in 12 months prior to study entry" | The summary column leaves out people who can't have surgery (the "What you'd do" column has it). | "...helps syringomyelia when surgery hasn't helped or isn't an option..." |
| Some take betaine and others take a placebo (a dummy treatment) | Yes | Arms "betaine" and "placebo: rice-flour as a placebo"; `allocation: RANDOMIZED` | **Medium.** Missing that the group is chosen by chance and that no one knows who gets which. A patient needs to know they can't choose and won't know. | "Who gets which is decided by chance. You and your doctors won't know which one you're taking." |
| Take the medicine or placebo by mouth for 12 weeks | Yes | Intervention: "50mg/kg for 12 weeks" | None | Keep |
| With check-ups before and after | Partly (understated) | Time frames: "1 day before and 3 days, 3 months, after drug treatment"; outcomes include syrinx size "on T2 images" (MRI), "electromyography and evoked potential", pain score, spinal cord function scores | **Medium.** Doesn't say how many check-ups or what they involve. There are 3: the day before, about 3 days after starting, and about 3 months. They include MRI scans and nerve tests. ("After drug treatment" is unclear in the listing; the main result is measured "at week 12", so "after starting" is the likely meaning.) | "Check-ups the day before you start, and about 3 days and 3 months after you start. These include spine MRI scans, nerve tests, and questions about pain and strength." |
| Adults 18 to 80 | Yes | `minimumAge: 18 Years`, `maximumAge: 80 Years` | None | Keep |
| Whose surgery for the syrinx didn't work, or who can't have that surgery | Mostly | Same inclusion quotes as above | **Low.** Leaves out the time limit ("in 12 months prior to study entry") and the kind of surgery. Also, in this listing the two conditions are separate bullets without "or". The sister thalidomide listing says "or", so "either one" is the likely meaning, but this listing doesn't say so. | "...whose surgery for the syrinx (a dura patch or a shunt) hasn't helped in the past year, or who can't safely have that surgery." |
| (Missing) main health limits | Not stated in draft | Exclusions include "cardiometabolic disease for which they take prescribed medications"; "History of psychiatric diseases"; "History of seizures"; "Pregnancy, lactation, or fertility program in the following 12 months"; "Abnormal in liver and renal function"; "History or current diagnosis of peripheral nerve disease"; "Participation in other experimental studies"; inclusion "Must be able to swallow tablets" | **Medium.** The draft makes the study sound open to most adults whose surgery failed. The list of exclusions is long. The heart or metabolic condition rule (if you take prescription medicine for it) will rule out many adults. | Add: "There are many health limits. For example, you can't join if you take prescription medicine for a heart or metabolic condition, have had seizures, have liver or kidney problems, or are pregnant, breastfeeding or planning a pregnancy in the next year. See the full list on the official listing." |
| (Missing) whether a syrinx from Chiari counts | Not stated in listing | "The investigators supposed that betaine might play a key role ... especially post-traumatic syringomyelia(PTS)"; conditions: "Syringomyelia" only | **Low.** The study is about syrinx in general, with a focus on syrinx after spinal injury. It doesn't say whether a syrinx caused by Chiari counts. | Add: "The listing doesn't say whether a syrinx caused by Chiari counts. Ask the study team." |

Also noted (no wording change): the betaine listing's syrinx outcome says "as compared with that before thalidomide usage", a copy-and-paste slip from the thalidomide listing. It supports the case that these two listings are not well kept.

## NCT06268093: Thalidomide for syringomyelia (Beijing, China)

| Claim | Supported? | Listing quote | Problem | Suggested fix |
| --- | --- | --- | --- | --- |
| Whether thalidomide helps syringomyelia and what side effects it has | Yes | "evaluate the indications, therapeutic effects and side effects of thalidomide in refractory syringomyelia" | Phrased as a question, not a promise. Good. | Keep |
| A medicine taken by mouth | Yes | Arm: "Oral Thalidomide" | None | Keep |
| Syringomyelia that surgery hasn't helped | Partly | Inclusion: "Contraindication to duraplasty and shunting ..., or non-effective response to duraplasty and shunting treatment in 12 months prior to study entry" | Same as betaine: the summary leaves out people who can't have surgery. | "...when surgery hasn't helped or isn't an option..." |
| Everyone in the study takes thalidomide | Yes | `interventionModel: SINGLE_GROUP`, `masking: NONE`; one arm "Thalidomide" | None | Keep |
| Take thalidomide by mouth each night | Yes | "Thalidomide 50 - 200 mg once at nightime" | **Low.** The listing doesn't say how long you'd take it. The main result is measured "at week 12". | Add: "The listing doesn't say for how long; the main check is at about 12 weeks." |
| Check-ups before and about 3 months after treatment | Partly | Time frames: "1 day before and 3 days, 3 months after drug treatment" | **Low.** Leaves out the check-up at about 3 days. "3 months after treatment" can read as 3 months after you stop. What the check-ups involve (MRI, nerve tests) is also missing. | "Check-ups the day before you start, and about 3 days and 3 months after you start. These include spine MRI scans, nerve tests, and questions about pain and strength." |
| Adults 18 to 80 | Yes | `minimumAge: 18 Years`, `maximumAge: 80 Years` | None | Keep |
| Whose surgery for the syrinx didn't work, or who can't have that surgery | Yes | Inclusion quote above (this listing does say "or") | Leaves out the "in the past year" time limit and the kind of surgery. | "...whose surgery for the syrinx (a dura patch or a shunt) hasn't helped in the past year, or who can't safely have that surgery." |
| (Missing) blood tests and health limits | Not stated in draft | Inclusion: "Routine laboratory studies: bilirubin ... creatinine ... white-cell count ... platelets ... Hb ... in a normal range"; exclusions: "History of psychiatric diseases"; "History of seizures"; "Pregnancy, lactation, or fertility program in the following 12 months"; "Abnormal in liver and renal function"; "History or current diagnosis of peripheral nerve disease"; "Participation in other experimental studies" | **Medium.** Pregnancy and pregnancy plans are excluded, and blood tests must be normal. Neither is mentioned. | Add: "You need normal blood tests. There are many health limits. For example, you can't join if you've had seizures, have liver or kidney problems, or are pregnant, breastfeeding or planning a pregnancy in the next year. See the full list on the official listing." (If Matthew wants a warning about thalidomide and pregnancy, that is a new medical fact: it needs its own EVIDENCE.md row and source first. The listing itself gives no reason for the pregnancy rule.) |
| (Missing) whether a syrinx from Chiari counts | Not stated in listing | "...especially post-traumatic syringomyelia(PTS)"; conditions: "Syringomyelia", "Thalidomide" | **Low.** Same as betaine. | Add: "The listing doesn't say whether a syrinx caused by Chiari counts. Ask the study team." |

## The draft's other statements

| Claim | Supported? | Listing quote | Problem | Suggested fix |
| --- | --- | --- | --- | --- |
| NCT06375759 lists "Chiari-malformation" in its exclusion criteria | Yes | Exclusion: "Chiari-malformation, myelomalacia, subarachnoid cyst, syringomyelia due to other spinal diseases" | None | Keep |
| NCT06375759 is for syringomyelia after a spinal injury or infection | Yes | Inclusion: "history of traumatic spinal cord injury or other infection ... MRI showing a syringomyelia due to spinal trauma or other infection" | None. (It also has "Spinal Arachnoiditis" in the title and was last verified April 2024, so the 2-year rule would hide it too.) | Keep. Optional: "for syringomyelia with scarring around the spinal cord after a spinal injury or infection" |
| So people with Chiari can't join | Yes | Same exclusion quote | None | Keep |
| NCT06308367 and NCT06268093 still say "Recruiting" | Yes | Both: `overallStatus: RECRUITING` (thalidomide confirmed live 2026-11-05) | None | Keep |
| Their status was last confirmed in February and March 2024 | **No** | NCT06308367: `statusVerifiedDate: 2024-02`; NCT06268093: `statusVerifiedDate: 2024-02` (also live) | **Low.** Both were last confirmed in **February 2024**. "March" matches the betaine listing's last *update* (posted 2024-03-13), not its verified date. | "Their status was last confirmed in February 2024." |
| Their start dates are still marked "estimated" | Yes | NCT06308367 start "2024-03", `ESTIMATED`; NCT06268093 start "2024-02", `ESTIMATED` | None | Keep |
| Not confirmed in over 2 years | Yes | February 2024 to November 2026 is about 2 years and 9 months | None | Keep |
| ClinicalTrials.gov itself calls a study's status "unknown" when it hasn't been confirmed for 2 years | Partly | Glossary, "Last verified": "If a study with a recruitment status of recruiting ... has not been confirmed within the past 2 years, the study's recruitment status is shown as unknown." Glossary, "Unknown": "...whose last known status was recruiting ... but that has passed its completion date, and the status has not been verified within the past 2 years." | **Low.** The glossary's own definition of "unknown" adds a second condition: the study's planned end date has passed. These two studies' end dates (2027 and 2028) have not passed, which is why they still show "Recruiting". As written, a reader could ask why ClinicalTrials.gov hasn't marked them "unknown" already. | "ClinicalTrials.gov uses 2 years without a check as its limit too: it marks a study's status "unknown" once it goes 2 years unchecked and its planned end date has passed." |
| None of these studies says people can take part from home | Yes | A search of all five listings for remote, home, telehealth, telemedicine, virtual, online, video and decentralized found no match (the only hit was "homeostasis"). Every study needs a hospital: MRI scans (NCT06502431), surgery at the hospital (NCT06724029), and in-person check-ups with MRI and nerve tests (NCT06308367, NCT06268093). Each lists only hospital sites. | None | Keep. Don't mark any as "Remote". |

## Overall verdict

**Not ready to publish as written; ready after the fixes above.** Nothing is phrased as medical advice, no summary promises a benefit, and the basic facts (what each study is about, ages, country, placebo or not, 12 weeks of betaine, nightly thalidomide) match the listings. The recommendation to leave out NCT06375759 is correct. The 2-year rule is well grounded, but the draft gets one date wrong (both studies were last confirmed in February 2024) and simplifies the registry's "unknown" rule.

Fix before publishing (Medium):
1. NCT06724029: memory, thinking and mood tests are not for people with Chiari I under the listed criteria.
2. NCT06724029: "for up to 5 years" is not supported; the study is planned to end in June 2027.
3. NCT06308367: say that the group is chosen by chance and that no one knows who gets placebo.
4. NCT06308367: say how many check-ups there are and that they include MRI scans and nerve tests.
5. NCT06308367 and NCT06268093 (two items): mention the main health limits, including pregnancy and pregnancy plans, and (thalidomide) normal blood tests.
6. NCT06502431: mention that you must be able to have an MRI, can't be pregnant or breastfeeding, and that the team re-checks your scans.

Low items are in the tables. One limit of this audit: one agent, one pass, checked only against the listings themselves. Listings are written by the study teams, and this audit can't confirm that they are current.
