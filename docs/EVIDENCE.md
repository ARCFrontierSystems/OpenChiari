# Evidence

Checked November 3, 2026. Mirrors the "Evidence" tab of the planning doc.

Every medical sentence on the site and every shape in the 3D model is listed here with the source it rests on. **Nothing medical ships without a row in this file.** The exact site wording lives in `docs/COPY.md`.

| Verdict | Meaning |
| --- | --- |
| Verified | An authoritative source states it directly |
| Partly supported | True with a qualifier; the site wording carries that qualifier |
| Simplified | Accurate in substance but drawn or worded simply for patients; the simplification is named on the site |
| Removed | Not supported; taken off the site |

Preferred sources, in order: NIH/NINDS and NLM, peer-reviewed research, major medical centers, then patient organizations for their own details.

## Medical claims

| # | Topic | Site wording (summary) | Verdict | Sources |
| --- | --- | --- | --- | --- |
| 1 | What Chiari is | The lowest part of the cerebellum (the tonsils) extends below the foramen magnum. The cerebellum helps control balance and coordination. Often linked to a smaller or differently shaped lower back of the skull, which crowds the brain; less often it develops later in life | Verified | [NINDS fact sheet PDF](https://www.ninds.nih.gov/sites/default/files/2025-05/chiari-malformation.pdf), [StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK554609/), [Radiopaedia](https://radiopaedia.org/articles/chiari-1-malformation), [Cleveland Clinic](https://my.clevelandclinic.org/health/diseases/6008-chiari-malformation) |
| 2 | Who has it | Most people are born with the skull differences that lead to it; some never have symptoms, others first notice them as teens or adults | Verified | NINDS, Mayo Clinic, Cleveland Clinic |
| 3 | How it's found | Usually an MRI plus a doctor's exam; sometimes by chance | Verified | NINDS, Mayo Clinic, Cleveland Clinic |
| 4 | Classic headache | Back of the head, after coughing, sneezing or straining | Verified | NINDS, Mayo Clinic, StatPearls |
| 5 | Other symptoms | Neck pain; dizziness and balance trouble; numbness or tingling in hands and feet; weakness or trouble with fine hand movements; trouble swallowing or voice changes; breathing or sleep problems such as sleep apnea; ringing in the ears; less often, blurry or shaky vision | Verified | NINDS, [Mayo Clinic (care-network copy)](https://www.amerikanhastanesi.org/mayo-clinic-care-network/mayo-clinic-health-information-library/diseases-conditions/chiari-malformation), Cleveland Clinic, StatPearls |
| 6 | No symptoms | Many people with Type I have no symptoms at all | Verified | NINDS, Mayo Clinic, StatPearls |
| 7 | The 5 mm measurement | About 5 mm is the traditional cutoff. Lower tonsils make symptoms somewhat more likely, but the measurement alone doesn't reliably predict how someone will feel; some with clear descent have no symptoms and some under 5 mm do. Doctors also look at tonsil shape, fluid flow and whether a syrinx is present | Verified | [Massimi et al. 2022](https://link.springer.com/10.1007/s10072-021-05317-9), [Sekula et al. 2005](https://link.springer.com/doi/10.1186/1743-8454-2-11), Radiopaedia, StatPearls |
| 8 | Brainstem | Connects the brain to the spinal cord; runs automatic functions such as breathing, heart rate and swallowing | Verified | [Cleveland Clinic](https://my.clevelandclinic.org/health/body/21598-brainstem) |
| 9 | Spinal fluid | Cushions the brain and spinal cord; with each heartbeat it pulses back and forth between the skull and the spinal canal | Verified (simplified) | [Cleveland Clinic](https://my.clevelandclinic.org/health/body/csf-cerebrospinal-fluid), [Takizawa et al. 2017](https://fluidsbarrierscns.biomedcentral.com/track/pdf/10.1186/s12987-017-0074-1) |
| 10 | Fluid flow in Chiari | In many people, not all, flow is reduced or blocked at the foramen magnum; a cine MRI can show it | Verified | NINDS, [surgical series, PMID 16823310](https://www.qxmd.com/r/16823310) (81% abnormal flow), [Radsource](https://radsource.us/chiari-i-malformation/) |
| 11 | Treatment | No symptoms: usually monitored. Symptoms: surgery often recommended; it improves or stabilizes symptoms in most people, damage already done may not fully reverse, some need more than one operation; a syrinx can be a reason for surgery even without symptoms | Verified | NINDS, StatPearls, Mayo Clinic, [pediatric consensus](https://link.springer.com/10.1007/s10072-021-05317-9) |
| 12 | Awareness Month | September, widely recognized through state and city proclamations (not federal) | Verified | [Michigan 2026](https://www.michigan.gov/whitmer/news/proclamations/2026/09/01/september-2026-chiari-malformation-awareness-month), [Virginia](https://www.governor.virginia.gov/newsroom/proclamations/proclamation-list/chiari-malformation-awareness-month.html), [Bobby Jones CSF](https://bobbyjonescsf.org/?p=15038) |
| 13 | How common | Not on the site. If ever used: roughly 1% to 4% of people having brain MRIs, depending on age; not a general-population figure | Not used | [Strahle et al. 2011](https://profiles.wustl.edu/en/publications/chiari-malformation-type-i-and-syrinx-in-children-undergoing-magn/), Meadows et al. 2000 |
| 14 | Cine MRI | A fluid-flow MRI (used in the visit-prep question) | Verified | [Cleveland Clinic](https://my.clevelandclinic.org/health/diseases/6008-chiari-malformation) |

**Avoid:** the "300,000 Americans" figure in some proclamations; it isn't from peer-reviewed research.

## 3D model shapes

**McRae line:** from the front edge of the foramen magnum (basion) to the back edge (opisthion). Tonsillar descent is the perpendicular distance from that line to the lowest tonsil tip, measured on the midline MRI image or the adjacent one where the tonsils sit lowest ([Barkovich 1986](https://www.ajnr.org/content/ajnr/7/5/795.full-text.pdf), [Radiopaedia](https://radiopaedia.org/articles/chiari-1-malformation)).

| Feature | Typical | Chiari I | Sources |
| --- | --- | --- | --- |
| Tonsil tip | About 1 mm above the line (meta-analysis mean +1.13 mm; normal range roughly 8 mm above to 5 mm below; lower in children, rises with age) | At least about 5 mm below by definition; model uses about 12 mm, typical of surgical series; real cases range about 3 to 29 mm; often reaches the C1 back arch | [Meta-analysis, 3,940 people](https://impressions.manipal.edu/open-access-archive/14262), Barkovich 1986, [Polish J Radiol](https://pmc.ncbi.nlm.nih.gov/articles/PMC9834072), [SNI review](https://surgicalneurologyint.com/api/articles/by-slug/definitions-and-treatments-for-chiari-1-malformations-and-its-variants-focused-review) |
| Tonsil shape | Rounded | Often pointed or peg-shaped | Radsource, [Radiopaedia: peg-like tonsil](https://radiopaedia.org/articles/peg-like-tonsil) |
| Fluid space behind the cerebellum (cisterna magna) | Open | Often crowded or narrowed | [Milhorat 1999](https://read.qxmd.com/read/10232534/chiari-i-malformation-redefined-clinical-and-radiographic-findings-for-364-symptomatic-patients), Radsource |
| Posterior fossa | Normal | Smaller and crowded; brain size normal | Milhorat 1999 |
| Clivus | About 39 to 47 mm, depending on the study | Several millimeters shorter (2 to 9 mm across studies) | Polish J Radiol, [Can J Neurol Sci](https://cambridge.org/core/services/aop-cambridge-core/content/view/B15FD039F4C520A76507606E2456FAB4/S0317167100011860a.pdf/posterior-fossa-measurements-in-patients-with-and-without-chiari-i-malformation.pdf), [Acta Neurochir](https://link.springer.com/content/pdf/10.1007/s00701-010-0636-3.pdf) |
| Tentorium | Normal angle | Steeper | [Sekula et al. 2005](https://link.springer.com/article/10.1186/1743-8454-2-11/fulltext.html) |
| Brainstem, fourth ventricle | Normal | Normal position (fourth ventricle may be elongated). A low brainstem is a different category, "Chiari 1.5," not shown | Radsource, [Radiologica](https://radiologica.org/knowledge-base/chiari-1-malformation/), [Radiopaedia: Chiari 1.5](https://radiopaedia.org/articles/chiari-15-malformation?lang=us) |
| Foramen magnum, front to back | About 33 to 36 mm | Same | Polish J Radiol, [JNRP morphometry](https://ruralneuropractice.com/morphometric-analysis-of-posterior-fossa-and-foramen-magnum/) |
| Dens of C2 | Upright, tip below the basion, in front of the cord | Same in the basic view; tilted dens and basilar invagination are related variants, not shown | Polish J Radiol, Milhorat 1999 |

**Midline simplification (Simplified):** the tonsils sit just to either side of the midline and often descend unevenly. The model shows them at their lowest point on the midline view, as MRI measures them. The figure caption and the tonsil info card say so ([Tubbs, via springermedizin](https://www.springermedizin.de/sagittal-mri-often-overestimates-the-degree-of-cerebellar-tonsil/10121926)).

**Mockup figure vs built model:** the mockup figure is illustrative, not to scale. The built model takes its proportions from Z-Anatomy and applies the numbers above.

## Syrinx

| Feature | What the model shows | Sources |
| --- | --- | --- |
| How often | Shown only as "often." Studies range from about 20% to 85% depending on who was studied | [StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK554609/), [AJNR 2016](https://www.ajnr.org/content/37/4/755), Strahle 2011 |
| Location | Most often in the neck part of the cord; one study found the top end most often around C6, though it can start as high as C1 | AJNR 2016, [NINDS: syringomyelia](https://www.ninds.nih.gov/node/811), Radsource |
| Shape | Long, spindle-shaped or beaded cavity near the center of the cord; about 5 vertebrae long on average | AJNR 2016, [Merck Manual](https://www.merckmanuals.com/professional/neurologic-disorders/spinal-cord-disorders/syrinx-of-the-spinal-cord-or-brain-stem) |
| Definition | "A fluid-filled cavity inside the spinal cord. It often develops alongside Chiari." | NINDS, Merck, [Mayo Clinic](https://www.mayoclinic.org/diseases-conditions/syringomyelia/symptoms-causes/syc-20354771) |

## After decompression

| Feature | What the model shows | Sources |
| --- | --- | --- |
| Skull bone removed | A piece a few centimeters across at the back of the foramen magnum, sized to each patient (about 3×3 to 3×4 cm in published series; exact size not stated on the site) | [Hu et al. 2023](https://www.frontiersin.org/articles/10.3389/fneur.2023.1274971/pdf), [Germanò 2019](https://surgicalneurologyint.com/?p=9344), [PMC4584091](https://pmc.ncbi.nlm.nih.gov/articles/PMC4584091) |
| C1 | Back arch removed (in some techniques only partly) | PMC4584091, [Balasa et al. 2022](https://www.frontiersin.org/articles/10.3389/fsurg.2022.895444/full) |
| Dural patch | Often; some surgeons remove bone only | Balasa 2022, [Khalsa 2017](https://mlins-site.s3.amazonaws.com/pdf/papers/khalsa2017comparison.pdf) |
| Fluid space | Re-formed behind the cerebellum | Balasa 2022, Khalsa 2017 |
| Tonsils | Often rise only partly (about 4 mm on average in one series) and may stay below the line | Balasa 2022, Khalsa 2017 |
| Syrinx after surgery | Smaller in most people, rarely gone; symptoms can improve even when it doesn't shrink | StatPearls, NINDS |
| Outcomes | "Results vary, and surgery isn't right for everyone." Reported improvement ranges widely across studies | [MedlinePlus](https://medlineplus.gov/ency/article/001398.htm), StatPearls, NINDS, [Park-Reeves consortium](https://profiles.wustl.edu/en/publications/complications-and-outcomes-of-posterior-fossa-decompression-with-/) |

## Organizations (Support page)

| Organization | Site wording | Donate link |
| --- | --- | --- |
| Bobby Jones Chiari & Syringomyelia Foundation | Maintains an international patient registry (new enrollment currently paused), hosts a yearly research colloquium, and funds Chiari research grants and fellowships | [bobbyjonescsf.org/donate-online](https://bobbyjonescsf.org/donate-online/) |
| Conquer Chiari | Funds Chiari research, publishes patient education materials, and supported the Chiari1000 patient registry (now closed) | [conquerchiari.org/donate](https://conquerchiari.org/donate) |
| ASAP: American Syringomyelia & Chiari Alliance Project | Supports patients and families, publishes a newsletter, and has helped fund research into the genetics of Chiari | [asap.org/donate](https://asap.org/donate/) |

The Washington University study "Redefining Chiari Malformations Type I" is NIH-funded and enrolling ([study page](https://chiari.wustl.edu/research/current-projects/)).

## Non-medical claims

| Claim | Verdict | Sources |
| --- | --- | --- |
| Browsers don't send the part of a link after `#` to the server | Verified (scripts on the page can still read it, so analytics must be configured not to record it) | RFC 3986 §3.5 |
| Cloudflare Web Analytics uses no cookies and doesn't build a profile; collects page, referrer, country, browser and device, page-load timing | Verified; re-check cookies in the browser before launch | [Cloudflare FAQ](https://developers.cloudflare.com/web-analytics/faq), [Cloudflare blog](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/) |
| ClinicalTrials.gov is the U.S. government's registry, run by the National Library of Medicine | Verified; terms ask for source credit, processed date and a note that summaries are changed | [Terms](https://classic.clinicaltrials.gov/ct2/about-site/terms-conditions) |
| Z-Anatomy is CC BY-SA 4.0; BodyParts3D is CC BY-SA 2.1 Japan | Verified | [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), [BodyParts3D license](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html) |
| WCAG 2.2 AA is the current W3C standard; U.S. ADA Title II rules cite WCAG 2.1 AA | Verified | [Section508.gov](https://www.section508.gov/develop/applicability-conformance/) |

## Review history

1. **First research pass:** four parallel research tracks (basics and symptoms, imaging and anatomy, syrinx and surgery, organizations). 14 corrections.
2. **Independent fact check:** 16 final statements re-checked from scratch. 9 passed, 7 tightened, none wrong.
3. **Second pass, four fresh reviewers:** about 115 English sentences on all screens (6 tightened); the anatomy figure (8 drawing fixes, re-rendered and checked); the Spanish page (16 fixes, missing sections added); non-medical claims (9 fixes, including the BodyParts3D credit and accessibility wording).

## Still open (only people can close these)

- [ ] A person with medical training looks at each finished 3D view once.
- [ ] A medical translator signs off on the Spanish.
- [ ] Confirm the Bobby Jones CSF registry status with them (their page says paused, last updated 2024).
- [ ] Before Explain It launches: confirm in the browser network tab that analytics requests don't contain the note.
- [ ] Open mayoclinic.org by hand once to confirm the care-network copy matches.

## Sources not opened

The NINDS Chiari imaging standards file (Word format) and two PubMed Central articles could not be opened. Nothing on the site rests on them alone.
