# Independent audit: medical text (Phase 1 pages)

- **Date:** 2026-11-04
- **Who:** a fresh AI agent that did not write the text (CLAUDE.md rule 1a, check 3). This is not a medical review.
- **Scope:** the medical sentences in COPY.md for Home (desktop, phone, Calm), 3D Explorer (desktop and phone: condition notes and structure cards), Doctor visit prep, and the anatomy figure labels.
- **Result:** about 82 medical sentences checked. 69 OK, 13 flagged: 1 High, 5 Medium, 7 Low.
- **Limitation:** NINDS, StatPearls (NCBI), Mayo Clinic, Cleveland Clinic and Radiopaedia could not be opened directly; they are blocked by this environment's network settings. The agent checked them through web search summaries, so its quotes are close to the source wording but not exact page text. Items marked "confirm" need the source opened by hand.
- **Status:** none of these changes has been made. Every one changes approved medical text and needs Matthew's decision.

## Flagged

| # | Severity | Where | Sentence now | Problem | Suggested wording |
| --- | --- | --- | --- | --- | --- |
| 1 | High | Explorer (phone), After decompression | "Bone is removed at the back of the opening to make room. Most people improve or stabilize; results vary." | Drops the caveats the desktop note has: damage may not fully reverse, some need more than one operation, surgery isn't right for everyone. Reads closer to a promise. | "Bone is removed at the back of the opening to make room. Most people improve or stabilize, but results vary, some need another operation, and surgery isn't right for everyone." |
| 2 | Medium | Home (phone) Fig. 1 caption; Home Calm caption | "Chiari I. The tonsil extends below the dashed line. Illustration." / "Still image. Chiari I: the tonsil extends below the dashed line." | Leaves out the midline note on the tonsils and shortens "Illustration, not a medical image" (both required by CLAUDE.md rule 1). | "Chiari I. The tonsil extends below the dashed line. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image." |
| 3 | Medium | Explorer (desktop), Chiari I note | "In people who need surgery it's often around 10 to 12 mm, but it varies widely." | No claim row in EVIDENCE.md; published surgical series vary (one averaged 19.9 mm, range 12 to 30, with no link to symptom severity); "in people who need surgery" implies the number decides surgery. | "In published surgical studies the average is often 10 mm or more, but it varies widely, and the number alone doesn't decide who needs surgery." Add a claim row. |
| 4 | Medium | Home (desktop and phone), "The measurement tells the whole story." | "Lower tonsils make symptoms somewhat more likely, but ..." | Evidence is mixed: one study found tonsils more than 12 mm below "invariably symptomatic"; a study of 428 people found symptom severity "does not correlate directly" with descent. | "Very low tonsils are more often linked to symptoms, but studies disagree, and the measurement alone doesn't reliably predict how someone will feel." |
| 5 | Medium (confirm) | Home symptom list | "Less often: blurry or shaky vision" | Mayo Clinic (as the auditor recalls it) lists vision problems such as blurred or double vision in its main list and ringing in the ears among the less common ones; the site does the reverse, and leaves out double vision. Could not open Mayo to confirm. | Move vision into the main list as "Blurry or double vision, or shaky vision" once Mayo is confirmed. |
| 6 | Medium | Home and Explorer tool line | "Send family, teachers or your employer a link that shows exactly what you have." | The link shows a general illustration, not the person's own scan. | "Send family, teachers or your employer a link to the view that matches your diagnosis." |
| 7 | Low (confirm) | Home symptom list | (missing) | Mayo lists curvature of the spine (scoliosis), especially with a syrinx and in children. | Add "A curve in the spine (scoliosis), especially in children", once confirmed. |
| 8 | Low | Home, Calm mode hero | "The lowest part of the cerebellum sits below the opening where the brain meets the spinal cord." | Without the "Chiari malformation, Type I" line above it (hidden in Calm mode), it reads as normal anatomy. | "In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord." |
| 9 | Low | Explorer (phone), Chiari I note | "Tonsils extend below the opening and crowd the fluid space; in many people flow slows there." | Drops "often" (desktop says "often crowded"). | "Tonsils extend below the opening and often crowd the fluid space; in many people flow slows there." |
| 10 | Low | Visit prep (phone) | "Which of my symptoms come from Chiari?" | Assumes some do; desktop and printed sheet say "do you think". | "Which of my symptoms do you think come from Chiari?" |
| 11 | Low | Visit prep | "What are my options besides surgery?" | Assumes surgery is the starting point; people without symptoms are usually monitored (EVIDENCE.md row 11). | "What are my treatment options, including monitoring?" |
| 12 | Low | Explorer structure cards | Cerebrum, Corpus callosum, Fourth ventricle, Foramen magnum, Spinal cord, C2 vertebra | Accurate, but no row in EVIDENCE.md. | Add rows with opened sources; no text change. |
| 13 | Low | Home footer (desktop) | "Not medical advice. This site is for education. Talk to your doctor about your own diagnosis and care." | Not the exact footer line CLAUDE.md requires ("Not medical advice. Talk to your doctor about your own care."); meaning is the same. | Either is fine; Matthew to choose. |

## Checked and OK (summary)

Definition and causes; "most people are born with"; how it's found; the classic headache; many people have no symptoms; the 5 mm cutoff and "some under 5 mm do"; typical "a few millimeters below can still be normal"; peg-shaped tonsils; flow reduced "in many people"; the syrinx definition and "often / neck"; the desktop After decompression note; the Brainstem, Cerebellar tonsil, Spinal fluid and C2 cards; the figure labels; the other visit-prep questions.

## Sources the auditor could not open directly

NINDS web page and 2025 fact sheet PDF; StatPearls NBK554609; Mayo Clinic symptoms page; Cleveland Clinic; Radiopaedia; Milhorat 1999 full text.
