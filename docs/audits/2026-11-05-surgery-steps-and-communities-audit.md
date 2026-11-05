# Independent audit: "What happens in surgery" play-through and "Connect with others" (November 5, 2026)

**What was checked:** `docs/drafts/2026-11-05-surgery-steps-and-communities.md`, the built text in `src/i18n/en.json`, the drawing code in `src/lib/anatomy-figure.ts`, and the built Explorer and Support pages (`dist/`, current with commit a6513ad).

**Compared against:** the saved copies in `docs/audits/sources/2026-11-05-surgery-steps/` and `docs/audits/sources/2026-11-05-communities/`; `docs/EVIDENCE.md` row 1, row 17 and the "After decompression" table; the approved After decompression wording in `docs/COPY.md`. I also re-opened the live community pages with plain `curl`, with no fake browser identity.

**How the drawing was checked:** I drew all five stages with `anatomyFigureSvg` (condition `surgery`, stages 0 to 4) and took screenshots with Playwright. I also stepped through the real Explorer page in a headless browser and took a screenshot at each step. I measured the incision line from the shape data (2 figure units = 1 mm).

The auditor did not write or build any of this.

---

## Overall verdict

**Both parts: PASS WITH CHANGES. Not ready to publish yet.**

- **Part 1 (surgery steps):** the medical sentences match the sources and the approved wording. Each step shows what its caption says. The incision line sits where the opened sources put it. The changes needed are small: say the incision length varies, balance one sentence in the intro, and fix two display glitches (what screen readers hear, and the parts list).
- **Part 2 (communities):** the four descriptions mostly match the pages that were opened. One sentence repeats a privacy promise that Open Chiari couldn't check ("You choose how anonymous you are"). One phrase ("a list of local groups") isn't on the page that was opened. The privacy warning is weaker than what Chiari Support says about itself.
- **Before either part ships:** the new sentences need rows in `docs/EVIDENCE.md` and entries in `docs/COPY.md`, and Matthew's approval (CLAUDE.md rules 1 and 1a). The draft's sources table is a good start for those rows.

Nothing in either part reads as medical advice. Nothing promises a result or a timeline.

---

## Findings (most important first)

### 1. Inspire community: a privacy promise we couldn't check, and a page we couldn't open. PASS WITH CHANGES

**The link itself is fine.** Bobby Jones CSF's live home page links to exactly `https://www.inspire.com/groups/chiari-syringomyelia/`, the address the draft uses. I checked the page's code today. The Inspire group page itself still returns "403 Forbidden" to plain curl, so no one has read the community page.

**The problem is the sentence "You choose how anonymous you are."** It repeats Bobby Jones CSF's promise as if Open Chiari had confirmed it. Inspire's own privacy statement did open (`https://www.inspire.com/about/privacy/`), and it says more than that:

- Bobby Jones CSF (saved copy): "You control your level of anonymity at all times."
- Inspire privacy statement (opened Nov 5): "when you post information on the Site, such as by creating or replying to journal entries, discussions, or messages, that information is considered to now be publicly disclosed by you"
- Same page: "We may share your profile information, including personal information contained therein, with our partner organizations, for example, non-profit organizations who sponsor Inspire communities"
- Same page: "we partner with pharmaceutical companies who occasionally sponsor clinical trials, and we may invite you to participate in an upcoming clinical trial"

Open Chiari is built around collecting nothing personal, so it shouldn't vouch for another site's privacy.

**Smallest fix:**
- Delete "You choose how anonymous you are." If Matthew wants to keep it, credit it to the source instead: "Bobby Jones CSF says you control how anonymous you are."
- Matthew opens the Inspire link once in his own normal browser and confirms that the group exists and what it's called. The testimonial on Bobby Jones CSF's page mentions "Chiari and Syringomyelia Unite", which may be the group's name on Inspire.
- Save a copy of the Inspire privacy page in the sources folder.

With those changes, linking to Inspire is acceptable: the address comes from the organization that runs the community.

### 2. The incision line: where it sits is supported; "approximate" should also say the length varies. PASS WITH CHANGES

**Measured on the drawing:**
- **Top:** the skin at y 382. That's the level where the model's tentorium meets the back of the skull, used as a stand-in for the inion.
- **Bottom:** the skin at y 522, the lower edge of the C2 spinous process (C2's spinous shape runs from y 498 to y 524).
- **Height:** 140 units, which is **7.0 cm** top to bottom.
- **Length along the curved skin line:** 160 units, which is **about 8.0 cm**.

**What the sources say:**
- PMC4821417: "A midline incision is made from the inion to the spinous process of C2". Both ends match.
- Mayfield: "The skin incision is about 3 inches long", about 7.6 cm. The model's 8.0 cm is close.
- But PMC4821417 describes **one surgeon's technique** in a group with an average age of 10 ("The mean age of the cohort was 10.0 years (range 18 months – 43 years)").
- Mayfield says lengths vary: "Minimally invasive can mean different things: shorter skin and muscle incision, no dura opening, no shrinkage of the tonsils…"

So the drawing shows one common incision correctly. A patient could still read it as "my scar will run from here to here."

**Two smaller points:**
- No opened source says the inion sits level with the point where the tentorium meets the skull. It is a reasonable stand-in, and the line is labeled approximate, so this is acceptable as a drawing choice.
- The draft and the code comment say the line is "about 7 cm". That is its height. Along the skin it is about 8 cm.

**Smallest fix:**
- Caption: "Animation simplified. The incision line is approximate; its length varies." (source: Mayfield, quoted above).
- In the draft and in the comment in `anatomy-figure.ts`, change "about 7 cm" to "about 8 cm along the skin (7 cm top to bottom)".

### 3. Intro: "Some remove bone only, and some also shrink the tonsils." PASS WITH CHANGES

**Each half is supported:**
- EVIDENCE "After decompression" table, Dural patch row: "Often; some surgeons remove bone only."
- Mayfield: "Sometimes bone removal alone may restore normal CSF flow."
- Mayfield: "Step 5: reduce the tonsils (optional) … the stretched and damaged tonsils may be shrunk with electrocautery."
- Mayfield: "Some surgeons prefer to shrink the tonsils rather than remove the bone of C1."
- PMC4821417: "If the tonsils are enlarged or necrotic, they are carefully bipolared to retract them rostrally".

**But the sentence is lopsided.** It names the two less common options and skips the usual one, opening the covering and adding a patch. A reader may think "bone only" and "shrink the tonsils" are the two main choices. The steps below do show the patch as "Often", so this is a balance problem, not an error.

Also, the draft cites Stanford Children's ("opened Nov 5"), but there's **no saved copy** of that page in the sources folder. Mayfield and PMC4821417 are enough without it.

**Smallest fix:**
- New wording: "Surgeons don't all do the same operation. Some remove bone only, some also open the brain's covering and add a patch, and some also shrink the tonsils. Your surgeon can tell you which steps apply to you."
- Either save the Stanford page or drop it from the sources table.

### 4. Screen readers and the parts list don't always match the step on screen. PASS WITH CHANGES (code only; no wording change)

**Screen readers:**
- At every step, the model's spoken description stays the After decompression one: "Midline section of the head and neck, after decompression surgery: bone at the back of the skull opening and the back of the first vertebra are removed, opening the fluid space." This includes step 1, "Before surgery", when the drawing shows Chiari I with all bone in place.
- The spoken step text, read out by the screen reader as it changes, is correct. But the model's own description contradicts it at steps 1 to 4.

**Parts list:**
- At steps 1 and 2, "11 Bone removed" is hidden from the parts list, which is correct.
- But if the visitor then touches any other control (I tried the Back camera, Labels and the Skin layer), "11 Bone removed" comes back. The list then names removed bone while the drawing still shows it in place.

**Smallest fix:**
- While a step is showing, set the model's description to that step's text. For step 1 you can use the approved Chiari I description.
- Re-apply the "hide Bone removed before step 3" rule whenever the parts list redraws, not only when the step changes.

### 5. ASAP: "a list of local groups that meet in person" isn't on the page. PASS WITH CHANGES

**Supported:**
- "Monthly virtual support group sessions are offered by ASAP at 7:00pm EST every third Tuesday of the month. Meetings will be held over Zoom."
- "ASAP hosts monthly telephone support groups so you can share coping strategies with others affected by SM and/or CM."

**Not confirmed:**
- The find-support page says only: "Connect in person. Find a local support group near you."
- The page it links to (`asap.org/find-support/local-support-groups/`, opened Nov 5) shows no list in what I could read. Its main text is: "All support group leaders are volunteers who either have these disorders or have a family member diagnosed… please keep in mind that they may not always be available to help."
- The Zoom group is still settling in: the same page also says "Monthly virtual support group sessions will be offered by ASAP starting 2026… More details to come."

**Smallest fix:** "Monthly support groups over Zoom, monthly phone support groups, and help finding a local group that meets in person."

### 6. The privacy warning is weaker than what Chiari Support says about itself. PASS WITH CHANGES

- The draft says: "Some posts can be seen by anyone." It cites "Aside from being able to post publicly…".
- Chiari Support's own page is plainer: "Posts on the different Ben's Friends communities can be read by anyone on the internet." I checked this on the live page today.
- Inspire's privacy statement (finding 1) treats posts as "publicly disclosed".

**Smallest fix:** "Before you post, read each site's privacy settings and privacy policy. On some sites, such as Chiari Support, anyone on the internet can read posts." Also cite the direct quote in the sources table.

### 7. FEMACPA: described accurately, but link to the page that was opened. PASS WITH CHANGES (optional)

**Supported:**
- "The Spanish federation of Chiari patient associations": "FEDERACIÓN ESPAÑOLA DE MALFORMACIÓN DE CHIARI Y PATOLOGÍAS ASOCIADAS" and "la voz común de un grupo de asociaciones de enfermos afectados por MC … formada por ANAC, CHYSPA, AEMC y AGAC". In English: "the common voice of a group of associations of patients with Chiari malformation… made up of ANAC, CHYSPA, AEMC and AGAC".
- "It offers support after diagnosis": the heading "Brindamos apoyo tras el diagnóstico" ("We give support after diagnosis"). The text under it is written as a goal ("Queremos informar y asesorar…", "We want to inform and advise…"), but the heading supports the sentence.
- Peer support: "Queremos impulsar la figura del paciente experto como persona de apoyo al nuevo afectado" ("We want to promote the expert patient as a support person for the newly diagnosed").

**The link goes to the home page** (`femacpa.com/`), which was not the page that was opened. Opened today, the home page shows "Personas podrían padecerlo y no lo saben" ("People could have it and not know") next to a "test online (beta)" button. The button goes nowhere (`href="#"`). Open Chiari deliberately leaves out self-tests.

**Smallest fix:** link to `https://femacpa.com/quienes-somos/`, the page that was opened and quoted.

### 8. Showing the steps in this order (question d). PASS

- **The order matches Mayfield's own steps:** anesthesia, then incision, then bone removal, then opening the dura, then (optional) shrinking the tonsils, then the patch, then closing.
- **C1 removal:** step 3 always draws C1 removed while the caption says "often". The approved After decompression figure does the same, under the EVIDENCE C1 row: "Back arch removed … Site text says 'often' (changed Nov 4 from 'usually'; NINDS: 'and sometimes the top of the spine'; PMC12888059: 'A C1 laminectomy is commonly performed')". The caption carries the qualifier. Mayfield adds: "In some cases the bony arch of the C1 vertebra may be removed (laminectomy)."
- **The patch** works the same way: drawn every time, captioned "Often", backed by the EVIDENCE Dural patch row.
- **Tonsil shrinking** isn't drawn, but the intro says some surgeons do it.

So the order doesn't misrepresent the surgery. The drawing shows one fuller version of it.

**Optional:** add "It shows one common version of the operation." to the caption, so the drawing matches the intro.

### 9. Step 5, "Afterward" (question c). PASS

Text: "On scans after surgery, the fluid space behind the cerebellum is often larger, and the tonsils often rise only partly."

**Supported:**
- PMC10549945: "Favorable treatment outcomes follow PFD, which enlarges the retrotonsillar CSF space". Also: "Morphometric measurements demonstrated an enlargement of the CSF areas posterior to the cerebellar tonsils after the operation".
- Tonsils: "The cerebellar tonsillar position inferior to the McRae line decreased 2 mm 3–6 months after surgery … and 0.8 mm more in following years". Also: "Tonsillar ectopia decreases after PFD, almost 50% in studies by Heiss et al … but 7%, 19%, and 33%, respectively, in studies by Bond et al, Quon et al, and Eppelheimer et al".
- "Often rise only partly" is approved wording (COPY.md After decompression; EVIDENCE Tonsils row).

**"Often" is the right hedge:** PMC10549945 studied 38 adults who all had the full operation ("suboccipital craniectomy, C1 laminectomy, and autologous duraplasty").

**No timeline and no promise:** "On scans after surgery" names no time. The step makes no claim about symptoms. That matters, because the same study found "Patients with a larger posterior CSF area after PFDD had less pain relief". A bigger space on a scan doesn't mean feeling better.

**The outcome caveat is on the same page:** while the steps play, the After decompression note stays on the page, including "Results vary, and surgery isn't right for everyone." (checked in the built page).

**Keep it this way:** don't later add anything that links the bigger space to symptom relief.

### 10. Steps 1 to 4 wording. PASS (one optional change)

| Step | Text checked | Source |
| --- | --- | --- |
| 1 | "In Chiari I, the tonsils extend below the opening at the base of the skull. This can crowd the space where spinal fluid flows." | Row 1; row 17 approved wording "This can crowd the space where spinal fluid flows". Word for word. |
| 2 | "The person is asleep under anesthesia." | Mayfield: "You will lie on the operating table and be given anesthesia. Once you are asleep…" |
| 2 | "…a cut down the middle of the back of the head and upper neck, and moves the muscles aside to reach the bone." | PMC4821417: "A midline incision is made from the inion to the spinous process of C2, and the muscles are divided at the midline raphe"; Mayfield: "The skin and muscles are lifted off the bone and folded back." |
| 3 | "A small piece of bone is removed at the back of the skull opening, and often the back of the first neck bone (vertebra), to make more room." | COPY.md: "Surgeons remove a small piece of bone at the back of the skull opening and often the back of the first vertebra." Same facts, reworded. |
| 4 | "Often the surgeon also opens the brain's tough covering (the dura) and sews in a patch, like letting out a waistband, to make more room for spinal fluid." | COPY.md: "Often they also open and patch the brain's covering to make more room for spinal fluid"; Mayfield: "a patch is sewn to expand the space, similar to letting out the waistband on a pair of pants" |
| 4 | "Then the muscles and skin are closed." | Mayfield: "The strong neck muscles and skin are sutured together." |

**Optional:** "tough" isn't in any opened source. Mayfield says "the protective covering of the brain and spinal cord called the dura". Use "protective covering" or the approved "the brain's covering".

**What each stage shows (from the screenshots):**

| Stage | Caption says | Drawing shows | Match |
| --- | --- | --- | --- |
| 0 Before surgery | Low tonsils, crowded fluid space | Exactly the Chiari I figure; the only difference in the drawing data is the spoken description (finding 4) | Yes |
| 1 The incision | Midline cut, back of head and upper neck | Chiari I plus a dark red line on the back skin from the inion level to the bottom of C2's spinous process | Yes |
| 2 Bone removed | Skull edge, and often C1, removed | Dashed outlines where the skull edge and the C1 back arch were; tonsils still low | Yes |
| 3 The patch | Dura opened, patch sewn; then muscles and skin closed | The dashed patch line appears; incision line still shown | Yes (a closed incision is still a line) |
| 4 Afterward | Bigger fluid space; tonsils partly risen | Identical to the approved After decompression figure | Yes |

### 11. Endorsement and medical advice (question f). PASS WITH CHANGES (small)

**Nothing reads as medical advice:**
- "Your surgeon can tell you which steps apply to you" points the reader to their own doctor.
- The community intro says plainly: "What members share there is their own experience, not medical advice, and Open Chiari doesn't check it."
- ASAP's phone-group page says the same thing itself: "Participants are not medical doctors and cannot give medical advice."

**Two gaps:**
- **No line says that being listed is not a recommendation.** The page's line "Open Chiari is not affiliated with these organizations and receives nothing from donations" sits at the bottom of the page, after "Other ways to help", and reads as if it is about the donation organizations above.
- **The communities' own pages also carry medical information,** not only what members post. For example, Chiari Support's page says: "Chiari malformation, is usually present at birth…". The disclaimer covers only what members share.

**Smallest fix:**
- Add "Being listed here isn't a recommendation."
- Change the disclaimer to "What you read there, including what members share, isn't checked by Open Chiari and isn't medical advice."

These are non-medical wording changes, but they still need Matthew's approval.

### 12. Chiari Support (Ben's Friends) description. PASS

- "A support forum for patients, families and friends": forum page, "Chiari Support is an online support group for patients, friends and families affected by Chiari Malformations."
- "part of Ben's Friends, a network of patient communities for rare diseases": "powered by BensFriends.org, a network of patient support communities for rare diseases."
- "Members can be as young as 12": "a safe place for patients and family members as young as age 12". Still on the live page today.

### 13. The incision line still shows when the Skin layer is turned off. PASS WITH CHANGES (code only)

The incision is added outside the layer system. With the Skin layer off, the red line still draws, floating in the air with no skin under it. I confirmed this by drawing stage 1 with the skin layer at 0.

**Smallest fix:** add the incision through the same `add(…, 'skin')` helper the skin outline uses.

### 14. Paperwork before publishing. PASS WITH CHANGES

- `docs/EVIDENCE.md` has no rows yet for the new sentences or the incision drawing. The code comment points to an EVIDENCE section "Surgery, step by step" that doesn't exist yet.
- `docs/COPY.md` doesn't have the new text yet.
- The Spanish file currently holds the English text, which the draft expects until Matthew approves the English.

**Smallest fix:**
- Turn the draft's two sources tables into EVIDENCE rows: a "Surgery, step by step" section and a "Connect with others" section. Include the incision measurements above.
- Add the approved text to COPY.md.
- Then do the usual Spanish translation and back-translation check.

### 15. What was left out. PASS

- **ChySPA** was rightly left out. Its saved page shows unrelated casino content, and FEMACPA's own ChySPA page links only inside femacpa.com.
- **Leaving out Facebook and Reddit groups** (run by individuals) and **Conquer Chiari** (already on the page) is sensible.
- **Brain & Spine Foundation:** its page was never opened, so leaving it out is right.

---

## Files used

- Draft: `docs/drafts/2026-11-05-surgery-steps-and-communities.md`
- Sources: `docs/audits/sources/2026-11-05-surgery-steps/` (Mayfield, PMC4821417, PMC10549945) and `docs/audits/sources/2026-11-05-communities/` (Bobby Jones CSF, Chiari Support home and forum, ASAP find-support, FEMACPA quienes-somos, ChySPA)
- Re-opened live Nov 5 with plain curl: bobbyjonescsf.org (200; Inspire link confirmed), inspire.com group page (403, not opened), inspire.com/about/privacy/ (200, opened), chiarisupport.org (200), asap.org/find-support/ (200) and its local-support-groups and telephone-support-groups pages (200), femacpa.com (200). These live copies were not added to the sources folder; save copies of the Inspire privacy page and the ASAP sub-pages if the fixes above rely on them.
- Drawing: `src/lib/anatomy-figure.ts`, shapes from `src/lib/anatomy-shapes.json`; Explorer behaviour from `src/pages/explorer.astro` and `src/explorer/viewer3d.ts`
