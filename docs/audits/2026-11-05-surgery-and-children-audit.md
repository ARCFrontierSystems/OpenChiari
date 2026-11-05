# Independent audit: surgery questions, packing list and "Helping your child through Chiari surgery" (November 5, 2026)

**What was checked:** the draft `docs/drafts/2026-11-05-surgery-and-children.md`, Part 2 (surgery question groups and packing list for Visit prep) and Part 3 (parent tips, six-page picture story, coloring page, school sheet).

**How:** every sentence that states or implies a medical fact was compared with the saved source copies in `docs/audits/sources/2026-11-05-surgery-and-children/`, with EVIDENCE.md (rows 1, 9, 11 and the "After decompression" table) and with approved wording in COPY.md. Four live pages were re-opened today with plain curl and still say the same thing as the saved copies: Stanford ("three to four days in the hospital"), SickKids "How to talk to your child about surgery" (the "special sleep" wording, and the Do's and Don'ts table, whose two columns were confirmed from the page's own table), KidsHealth Chiari ("Doctors don't know exactly what causes…") and MedlinePlus ("Create more space for the brain because of swelling or Chiari syndrome"). The SickKids packing PDF was read directly, and it matches the saved text.

The auditor did not write or build any of this text.

## Overall verdict: PASS WITH CHANGES (not ready to publish as written)

Most of the draft is careful and well sourced. Two sentences in the picture story have to change before it can go live: one makes a promise about how long the hospital stay will be, and one ("It is nobody's fault") goes further than any source. The required tonsil caption is missing from the Chiari I drawings, and the school sheet has no model credit. Three questions need a small wording change so that they don't suggest something that isn't true for everyone. The packing list doesn't contradict anything.

## Findings, most important first

1. **FAIL: picture story, page 5, "You'll stay in the hospital for a few days."** This is a promise to a child about a timeline. Stanford gives a typical stay, but it also says it "varies from child to child"; MedlinePlus says patients "may have spent some time in the intensive care unit". SickKids tells parents not to "Make promises that you may not be able to keep" and to tell the child "how long the hospital stay will be", meaning the stay their own care team gives them. The draft already avoids numbers on page 6 and on the school sheet, so this sentence is out of step with the rest. **Fix:** "You'll stay in the hospital until your doctors say you're ready to go home. Your grown-up will tell you about how long."

2. **FAIL as worded, and the fallback PASSES: page 3, "It is nobody's fault."** No opened source says this. What KidsHealth supports is: "Doctors don't know exactly what causes Chiari I malformation. A baby can be born with Chiari I malformation or it can develop in the first few years of life. Less often, the malformation can happen later in life from trauma, infection, or other medical problems." It also says "Chiari I malformation can run in families." Since the cause isn't known and some cases follow an injury or illness, the site can't truthfully say that nobody could ever have played any part. The fallback, **"You didn't do anything to cause it."**, makes a narrower claim about the child, and the sources support it: Chiari I is either present at birth or develops in early childhood for reasons doctors don't know, and nothing a child does is named as a cause. It also speaks directly to the worry a child is most likely to have. **Fix:** use the fallback.

3. **PASS WITH CHANGES: required captions and credit are missing on some drawings.** (CLAUDE.md rules 1 and 3)
   - Every other place on the site that shows the Chiari I figure also carries the midline-simplification note: "Tonsils shown at their lowest point, where MRI measures them." The draft gives only "Illustration, not a medical image." for the story (page 3), the coloring page ("Before surgery" drawing) and the school sheet. **Fix:** add the tonsil note to each figure that shows the tonsils, as the existing printed Visit prep sheet does ("Chiari I. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image.").
   - The school sheet prints a drawing of the model but doesn't mention the model credit. The printed story and the coloring page do include it. **Fix:** print the credit in small type on the school sheet, as `prep.astro` already does for its sheet.
   - On screen, the site footer already carries the credit, so the web page itself is covered. "Fluid flow simplified" isn't needed, because none of these drawings is animated.

4. **PASS WITH CHANGES: school sheet, "the lowest part of the back of the brain sits lower than usual, in the opening at the base of the skull."** EVIDENCE row 1 and the approved wording say the tonsils extend **below** the opening. KidsHealth says the cerebellum "pushes down through the hole in the bottom of the skull". "Sits … in the opening" makes it sound smaller and more static than it is, and this is the one sentence a teacher will read as the definition. **Fix:** "In Chiari I, the lowest part of the back of the brain extends below the opening at the base of the skull." The next sentence, "The surgery makes more room there.", PASSES (KidsHealth: "This surgery makes more space for the cerebellum").

5. **PASS WITH CHANGES: three questions suggest something that isn't true for everyone.**
   - "Do I need more scans to check the fluid space or a syrinx?" This reads as if every reader has a syrinx. **Fix:** "Do I need more scans to check the fluid space, or my syrinx if I have one?"
   - "Which of my symptoms should get better…?" "Should" sounds like an expectation. Row 11 says surgery "improves or stabilizes symptoms in most people, though damage that has already happened may not fully reverse." **Fix:** "Which of my symptoms are likely to get better, and how long might that take?"
   - "Will you remove bone only, or also open the covering of the brain and add a patch?" This sounds like the only two choices. Stanford also describes removing part of C1 and that "Sometimes the surgeon will then round out the cerebellar tonsils"; Mayfield describes fusion for some patients. **Fix:** start the second sentence with "For example,".

6. **PASS WITH CHANGES: parent tip, "Many children's hospitals have one [a child life specialist]".** No source gives how common they are. KidsHealth says "**If** the hospital has a child life specialist…". **Fix:** "**Ask if the hospital has a child life specialist,** someone trained to help children understand and cope."

7. **Gaps a parent would reasonably need (suggestions, not errors).** None of these is required for accuracy. Each is either a question (so it states no fact) or already in an opened source.
   - **Parent tips, already sourced:** "Let your child know it's OK to feel scared and even mad" and "tell your child you will be with them before and after the surgery" (KidsHealth); "Surgery may sometimes be delayed or canceled because of emergencies" (SickKids, "Be prepared to wait or for the possibility of cancellation"); talking to "a psychologist, social worker, or counselor" for the parent's own feelings (KidsHealth).
   - **A note above the story:** "Every surgery is a little different. Change any words to match what your child's care team tells you." Some children have extra steps, and some have no patch.
   - **Questions a parent of a child would want, for a child-focused group or the "Before surgery" group:** "When does my child need to stop eating and drinking before surgery?"; "Can I stay with my child, including overnight and when they wake up?"; "Will my child spend time in intensive care after surgery?" (MedlinePlus mentions the ICU); "Can my child's comfort item go into the operating room with them?" (hospitals differ: SickKids says yes, while KidsHealth says the parent keeps it "during surgery"); "What will my child see and feel when they wake up, so I can tell them ahead of time?"
   - **School sheet:** an optional box, "Call me right away if: [from the care team]", so the school knows what to watch for without the site giving any medical list.

8. **PASS, with an optional change: page 4's description of the surgery.** "Doctors can make more room … The surgeon takes away a small piece of bone at the back, and often adds a patch to make more space." This is accurate at a child's level. The approved After decompression wording says "Surgeons remove a small piece of bone at the back of the skull opening … Often they also open and patch the brain's covering"; the evidence table says the dural patch is used "Often; some surgeons remove bone only"; Mayfield says "sews a dura patch to expand the space". "Often adds a patch" is correct. **Optional:** the drawing shown on that page also has the C1 arch removed, so the words could match it: "takes away a small piece of bone at the back of the head, and often a little from the top of the neck" (approved: "and often the back of the first vertebra").

9. **PASS: "won't see, hear or feel anything" (page 4 and the parent tips).** SickKids recommends exactly this wording: "With this medicine, you cannot see, hear or feel anything. When the surgery is finished, the health-care providers will wake you up from your special sleep." It applies only to the time during surgery, and page 5 honestly adds that the head and neck "may feel sore" afterward. So this is not a "no pain" promise.

10. **PASS WITH CHANGES (minor): page 2, "Your brain is inside your skull, which keeps it safe."** This is true and harmless, but none of the opened sources says it and there is no EVIDENCE row for it. **Fix:** either open a source (for example a MedlinePlus or Cleveland Clinic page on the skull) and add a row, or shorten it to "Your brain is inside your skull."

11. **PASS: the packing list.** It contradicts nothing. The medicines line ("Your medicines, or a list of them (ask the hospital which to bring)") is the right hedge, because SickKids asks for "All current, labelled medications your child is taking", and "Your hospital may send its own list. Follow theirs first." keeps the hospital in charge. "Photo ID" isn't in the SickKids list, but it's an ordinary practical item and not medical. **Optional addition from the same PDF:** "Custody papers, if they apply" (SickKids: "Legal custody documents", under "if applicable").

12. **Paperwork before approval.** Each new medical sentence (story pages 2 to 6, the school-sheet definition, and the parent tips that rest on sources) needs a row in EVIDENCE.md before it ships. Two source notes in the draft should be corrected when those rows are written:
    - The KidsHealth passage about "follow-up MRIs" is about children who are **not** having surgery ("For kids without symptoms or who have mild symptoms…"). For the after-surgery scan questions, cite Stanford ("Syrinx may also reform") instead.
    - The MedlinePlus blood-thinner sentence is about restarting medicines **after** surgery, not stopping them before. For "Should I stop or change any of my medicines before surgery?", the closer MedlinePlus line is "Aspirin, ibuprofen … may cause bleeding". The question itself is fine as a question.

## Item-by-item results

### Part 2: question groups

| Question | Verdict | Source quote | Fix |
| --- | --- | --- | --- |
| Why do you recommend surgery, and what are the benefits and risks for me? | PASS | CT: "If surgery is recommended, ask why it's necessary and what the benefits and risks are." | None |
| Which steps will my surgery include? Will you remove bone only, or also … add a patch? | PASS WITH CHANGES | Evidence table: "Often; some surgeons remove bone only"; STAN: removes C1, "Sometimes the surgeon will then round out the cerebellar tonsils" | "For example, will you remove bone only…" (finding 5) |
| How long will the surgery take, and how long will I stay in the hospital? | PASS | CT: "Ask how long the surgery takes, what to expect in the hospital" | None |
| How will my pain be managed after surgery? | PASS | CT: "Ask about pain management" | None |
| Should I stop or change any of my medicines before surgery? | PASS (fix the source note) | MLP: "Aspirin, ibuprofen (Advil, Motrin), and some other medicines … may cause bleeding." The blood-thinner quote in the draft is about after surgery | Change the source note only (finding 12) |
| How soon can I go back to school, work or my usual activities? | PASS | CT: "how soon your child can go back to school or activities" | None |
| Could I need another surgery later? | PASS | STAN: "some children require subsequent surgical procedures"; row 11: "some need more than one operation" | None |
| What should make me call you or come back to the hospital? | PASS | MLP "When to Call the Doctor"; CT: "what to watch for during recovery" | None |
| How do I care for my incision, and when can I shower? | PASS | MLP: "Wear a shower cap when you shower or bathe until your surgeon takes out any stitches or staples." A question only | None |
| Which medicines should I take at home, and for how long? | PASS | MLP: "Ask your surgeon how long you should expect to take these medicines." | None |
| What should I avoid, and for how long? When can I lift things, drive or play sports? | PASS | MLP: "Do not lift more than 20 pounds…", "Ask your surgeon when you can begin driving"; CT: "how long your child may need to limit physical activity" | None |
| Who do I call with questions, including at night and on weekends? | PASS | Not medical; CT: "on call 24/7" | None |
| When is my follow-up visit, and will I need another MRI? | PASS (fix the source note) | STAN: "Syrinx may also reform". The KidsHealth MRI quote is about children not having surgery | Change the source note only (finding 12) |
| Is my recovery going as expected? | PASS | CT 7 | None |
| Which of my symptoms should get better, and how long might that take? | PASS WITH CHANGES | Row 11: "improves or stabilizes symptoms in most people, though damage … may not fully reverse" | "are likely to get better" (finding 5) |
| Do I need more scans to check the fluid space or a syrinx? | PASS WITH CHANGES | STAN: "Syrinx may also reform" (only for people who have one) | "…or my syrinx if I have one?" (finding 5) |
| Can I go back to all my usual activities now? | PASS | STAN: "return to all normal activities"; KH-CHIARI: "Some doctors recommend … avoid certain activities". A question only | None |
| Would physical therapy or another specialist help me? | PASS | CT: "physical therapist"; "Ask about physical therapy" | None |
| Getting a child ready for surgery? See Helping your child. | PASS | Not medical | None |

### Part 2: packing list

| Item | Verdict | Source quote | Fix |
| --- | --- | --- | --- |
| "Your hospital may send its own list. Follow theirs first." | PASS | Not medical; a sensible safeguard | None |
| Health insurance card and photo ID | PASS | SK-PACK: "health (OHIP) card", "Health insurance information". Photo ID is not in the source but is not medical | None |
| Your medicines, or a list of them (ask the hospital which to bring) | PASS | SK-PACK: "All current, labelled medications…". The hedge avoids contradicting hospitals that ask otherwise | None |
| Glasses, hearing aids, a CPAP machine or other equipment | PASS | SK-PACK: "hearing aids, CPAP machine", "Eyeglasses" | None |
| Toothbrush and other toiletries; comfortable clothes for going home; non-slip slippers; phone and chargers; books, tablet, games, headphones; favorite blanket or stuffed animal | PASS | SK-PACK, word for word or close | None |
| For the parent: snacks and a water bottle | PASS | SK-AGE: "Bring water and/or snacks for yourself" | None |
| Your questions sheet from this page | PASS | Not medical | Optional: add custody papers (finding 11) |
| Sheet footer | PASS | Matches the existing approved printed-sheet footer | None |

### Part 3a: for parents

| Sentence | Verdict | Source quote | Fix |
| --- | --- | --- | --- |
| Intro, including "Nothing you type here is saved or sent." | PASS | Not medical; it must stay true when the page is built | None |
| Be honest, in words your child knows | PASS | SK-TALK: "Being honest builds trust"; "Try to use language your child will understand" | None |
| Younger children usually need fewer details than older kids | PASS | KH-READY, word for word | None |
| Teens may want to know more and to help make decisions | PASS | SK-AGE: "share as much or as little information as your child wants to know"; "Understand if your teen would like to be a part of the decision-making" | None |
| The surgery is to help a part of their body do its job | PASS | SK-TALK: "help a part of your body do its job" | None |
| Special sleep; won't see, hear or feel anything; care team wakes them; avoid "put to sleep" | PASS | SK-TALK: "you cannot see, hear or feel anything … will wake you up from your special sleep"; "many children have heard about a pet being 'put to sleep' and never waking up again" | None |
| Don't promise "no pain" or "no needles"; medicine and ways to help | PASS | SK-TALK Don'ts column (confirmed from the live page's table): "Promise your child that they will have no pain"; "Promise your child that there will be no needles"; "there are ways to make it easier to have a needle" | None |
| It's fine to say "I don't know"; write it down; ask together | PASS | SK-TALK: "tell them that you do not know but will find out. You can write down the questions"; KH-READY: "ask if they want to find out together" | None |
| Bring something from home | PASS | SK-TALK; KH-READY | Optional: "ask if it can go into the operating room" (hospitals differ) |
| Play and draw it | PASS | SK-TALK: "will let you know how your child is feeling"; "ask your child to draw a picture" | None |
| Ask for a child life specialist. Many children's hospitals have one… | PASS WITH CHANGES | KH-READY: "If the hospital has a child life specialist" | Finding 6 |
| Look after yourself; children pick up on how you feel; accept help | PASS | SK-AGE: "Children can also pick up on their parents'/caregivers' emotions"; KH-READY: "Be willing to accept help from family and friends" | None |

### Part 3b: picture story

| Page and sentence | Verdict | Source quote | Fix |
| --- | --- | --- | --- |
| 1. A picture of the inside of a head and neck, from the side | PASS | Not medical (describes the figure) | None |
| 2. Your brain is inside your skull, which keeps it safe | PASS WITH CHANGES | No opened source or row | Finding 10 |
| 2. Near the back is the cerebellum. It helps you balance and move smoothly | PASS | Row 1: "helps control balance and coordination"; KH-CHIARI: "controls coordination and muscle movement"; MAY: "coordinates body movement. It maintains muscle tone and balance" | None |
| 2. Brain and spinal cord are cushioned by a clear liquid | PASS | Row 9; MAY: "a clear, watery-like liquid … to help cushion it from injury" | None |
| 3. The bottom of the cerebellum reaches down a little too low, into the opening where the skull meets the neck | PASS | KH-CHIARI: "pushes down through the hole in the bottom of the skull"; row 1 | Optional: "through the opening", to match the school-sheet fix |
| 3. There isn't quite enough room there | PASS | KH-CHIARI: "the space for the cerebellum is smaller than normal or has an unusual shape" | None |
| 3. It is nobody's fault | FAIL; the fallback PASSES | KH-CHIARI: "Doctors don't know exactly what causes…"; "born with … or it can develop in the first few years of life"; "Less often … from trauma, infection, or other medical problems"; "can run in families" | "You didn't do anything to cause it." (finding 2) |
| 4. Doctors can make more room | PASS | KH-CHIARI: "This surgery makes more space for the cerebellum" | None |
| 4. Special sleep; won't see, hear or feel anything | PASS | SK-TALK (quoted above) | None |
| 4. Small piece of bone at the back; often adds a patch to make more space | PASS | Approved After decompression wording; evidence table ("Often; some surgeons remove bone only"); MAY: "sews a dura patch to expand the space" | Optional: mention the neck bone to match the drawing (finding 8) |
| 5. Back of head and neck may feel sore | PASS | STAN: "post-surgical neck pain during recovery"; MLP: "pain … along your skin incision" | None |
| 5. Nurses and doctors have medicine to help | PASS | SK-TALK: "health-care providers will give them medicine to help with any pain or discomfort" | None |
| 5. You'll stay in the hospital for a few days | FAIL | STAN: "varies from child to child, but most patients will typically spend three to four days"; SK-TALK: don't "Make promises that you may not be able to keep" | Finding 1 |
| 5. Your grown-up will be with you as much as they can | PASS | SK-TALK: "you will be able to stay as long as the health-care providers allow" | None |
| 5. You can bring your favorite blanket or stuffed animal | PASS | SK-TALK; KH-READY | None |
| 6. Rest at home for a while before going back to school | PASS | STAN: "two to three weeks at home before returning to school" (no number shown, correctly) | None |
| 6. You can ask questions anytime. Every question is a good one. | PASS | Not medical; SK-TALK, KH-READY encourage questions | None |
| Captions | PASS WITH CHANGES | CLAUDE.md rule 1 | Add the tonsil note to the Chiari I figure (finding 3) |

### Part 3c: coloring page

| Item | Verdict | Note | Fix |
| --- | --- | --- | --- |
| Key: bone, brain, spinal cord, the clear liquid | PASS | Plain names for parts already labeled; no new claim. (The draft says these are "the existing figure label words"; "bone", "brain" and "the clear liquid" are plain versions of the labels, not the label words themselves. That doesn't matter for accuracy.) | None |
| Caption and credit | PASS WITH CHANGES | "Before surgery" shows Chiari I tonsils | Add the tonsil note (finding 3) |

### Part 3d: school sheet

| Item | Verdict | Source quote | Fix |
| --- | --- | --- | --- |
| "…sits lower than usual, in the opening at the base of the skull." | PASS WITH CHANGES | Row 1: "extends below the foramen magnum"; KH-CHIARI: "pushes down through the hole" | Finding 4 |
| "The surgery makes more room there." | PASS | KH-CHIARI: "This surgery makes more space for the cerebellum" | None |
| Time away and limits left blank for the care team | PASS | CT 6 and 7; MLP. No numbers on the site, which is correct | None |
| Ticklist of school supports | PASS | Not medical; offered as options | Optional: "Call me right away if: [from the care team]" (finding 7) |
| Figure, caption, credit, footer | PASS WITH CHANGES | CLAUDE.md rules 1 and 3 | Add the tonsil note and the model credit (finding 3) |

## Answers to the specific questions asked

- **(a) Medical advice or promises:** one real promise, "a few days" (finding 1). "Won't see, hear or feel anything" is what SickKids itself recommends and applies only to the time during surgery (finding 9). Page 6 deliberately gives no number. No question gives advice.
- **(b) "It is nobody's fault":** not supported; use the fallback "You didn't do anything to cause it." (finding 2).
- **(c) Child-level description of Chiari and surgery:** accurate. "Often adds a patch" matches the evidence table, and "small piece of bone at the back" matches the approved wording. Optional: mention the neck bone to match the drawing (finding 8). The school sheet's "in the opening" needs "below" (finding 4).
- **(d) Packing list and medicines:** no contradiction. The "ask the hospital which to bring" hedge is right (finding 11).
- **(e) School-sheet sentence:** the second half passes; the first half should say "extends below the opening" (finding 4).
- **(f) Missing or frightening:** nothing reads as frightening beyond honest facts. Useful additions are listed in finding 7: fasting, staying overnight, intensive care, what the child will see on waking, possible delays, the "OK to feel scared or mad" tip, a note that each surgery differs, and support for the parent.
- **(g) Questions that imply facts:** three small wording changes (finding 5).

Fixes to medical text need Matthew's approval (CLAUDE.md rule 1a).
