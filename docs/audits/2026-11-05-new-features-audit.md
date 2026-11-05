# Independent audit: three new features (November 5, 2026)

**What was audited:** `docs/drafts/2026-11-05-new-features.md`. It covers (1) "How do you say it?" pronunciations, (2) "Real-world sizes" next to the Explorer's measurement, and (3) "Why does coughing set it off?", an animation plus three sentences. I also audited the EVIDENCE.md rows the draft proposes.
**Auditor:** a fresh agent that did not write the draft (CLAUDE.md rule 1a, check 3). I changed no site files and no drafts.
**How:** I read every saved copy in `docs/audits/sources/2026-11-05-new-features/` in full where it mattered. I also reopened the live pages that the network allows (Merriam-Webster, Mayfield Clinic, KidsHealth, MedlinePlus en español, PMC). Then I compared each proposed sentence and respelling with the source's own words.

## Plain-language summary

| Feature | Verdict |
| --- | --- |
| 1. How do you say it? | **PASS WITH CHANGES** |
| 2. Real-world sizes | **PASS WITH CHANGES for Option C (centimeters).** Options A and B can't be checked yet: the U.S. Mint page is still blocked |
| 3. Why does coughing set it off? | **FAIL as drafted.** The three sentences can pass after small wording changes. The animation needs to be redesigned |

**1. Pronunciations.** "Key-AR-ee", "mal-fore-MAY-shun" and "SEER-inks" match their sources exactly. Two changes are needed:
- **"Suh-RING-go-my-EE-lee-uh" puts two syllables in capitals.** The site's own key says capitals mark the loudest part, but the dictionary marks "EE" as the loudest and "ring" as only medium. Lower-case "ring".
- **There are three published versions of "syringomyelia", not two.** The draft missed that the Mayfield Clinic page it opened also gives one: "sir-RING-o-my-elia".

The Hans Chiari sentence also says "named after", which the source doesn't say. A version that sticks to the source is in the table below.

**2. Sizes.** All three options are neutral: none suggests that bigger means worse, and the arithmetic is right. The options don't say what 5 mm and 12 mm are, though. The Explorer's measurement bracket also shows in views where the tonsils are not at 12 mm (Typical, and After decompression). So name each number, and show the line only in the views where 12 mm is true. Options A and B still need a person to open the U.S. Mint page in a browser. I got the same bot challenge the drafter did and didn't try to get past it.

**3. Cough explainer.** The basic idea is well supported: a cough pushes some spinal fluid up into the head. The problems are in what comes after:
- **The animation shows something no source describes.** It has the tonsils dipping while the fluid flows normally. In the papers, the tonsils are pushed down *because* the fluid can't get back down past them. The newer preprint disputes that blockage. So the animation would match neither side, and it would also contradict sentence 2 of the site's own text.
- **The draft says the reworded text "states nothing about flow after a cough".** That isn't right. Sentence 2 ("the low tonsils get in the way as the fluid flows back") is exactly the idea that the preprint's title says it disproves. Calling it "one explanation" helps, but the text should also say plainly that researchers don't agree.
- **"Straight back down" is too strong.** One of the opened peer-reviewed papers reports that a real-time MRI study saw no clear downward return after a cough.
- **"In Chiari I" sounds like everyone with Chiari I.** The MRI studies looked only at people who had symptoms (8 and 13 people), and the effect varied with how severe their symptoms were.

Suggested replacement wording for all of this is in the table. Each suggestion comes from a source I opened.

**What I could not open:** the 2025 medRxiv preprint (Cloudflare "Attention Required!" block), the U.S. Mint page ("Just a moment..." bot challenge), and Europe PMC and the bioRxiv/medRxiv API (not allowed by this network). I didn't try to get around any of these. I also searched PMC for a peer-reviewed version of the preprint and found none.

## Findings

Severity: **High** = would put something unsupported or contradicted on the site; **Medium** = stronger or weaker than the source, or could be misread; **Low** = citation, record-keeping or polish.

| # | Severity | Feature | Sentence or element | Problem | Source checked (opened?) | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **High** | 3 Cough | Animation step 3: "The tonsils move down a short way into the opening … The fluid keeps moving at its usual pace" | **No source describes this combination.** In the explanation the draft relies on, the tonsils are pushed down *because* the fluid doesn't return (Bezuidenhout: CSF "returns to the spinal canal immediately postcoughing in a healthy subject but not in a patient with CMI, provided there is sufficient foramen magnum obstruction"). The tonsil movement itself was never measured in these MRI studies; it is inferred from the drop in flow: "This finding suggests that there is increased pressure dissociation … due to further downward descent of cerebellar tonsils". The preprint disputes that drop. So the animation keeps the inferred movement and drops the finding it was inferred from. It also contradicts the draft's own sentence 2 ("get in the way as the fluid flows back"). This is a moving picture of the brain dropping with every press, so it carries more weight than a hedged sentence | Bezuidenhout 2018, PMC7655446 (opened: saved copy); Bhadelia 2016, PMC7960326 (opened: saved copy); preprint 10.1101/2025.05.01.25326708 (**not opened**: medRxiv block) | **Don't animate the tonsil movement.** Animate only what sentence 1 says, the same way in both views: during the cough, fluid moves up through the opening into the head, then the view eases back to the usual heartbeat pulse. Sentence 2 stays as text, labeled as one explanation. Reconsider the tonsil movement only after a person has read the preprint |
| 2 | **High** | 3 Cough | The draft's reasoning: "It states nothing about flow after a cough"; sentence 3 as the only signal of disagreement | **Sentence 2 is a claim about flow after a cough.** It is the same hypothesis the preprint sets out to test ("the cerebellar tonsils obstruct the caudal return of fluid post cough", as quoted in the draft from search results). The preprint's title rejects it. The current sentence 3, "still studying how this works", doesn't tell the reader that researchers disagree. So the disagreement isn't fairly shown | Bhadelia 2011, PMC7965870 (opened): "there is a difference of opinion as to the exact mechanism responsible for CAH"; Vandenbulcke 2024, PMC11148133 (opened): "the underlying mechanisms are not well understood" | Sentence 3: "Researchers don't all agree on how this works, or whether it's why coughing can bring on the classic headache. Not everyone with Chiari gets these headaches." Keep "One explanation is that…" in sentence 2 |
| 3 | Medium | 3 Cough | Sentence 1: "Normally it flows straight back down." Typical view: "The fluid moves up into the head and straight back down." Animation: "straight back down" | **"Straight back" is stronger than the sources.** Vandenbulcke says only that the fluid moves into the head "and back (in healthy subjects)". It also reports that a real-time MRI study (Lloyd et al. 2020) "did not detect a caudal peak flow, suggesting that it may take some time for the veins and consequently the CSF domain to return to the original size". Bezuidenhout's "immediately" comes from older pressure studies. The opened sources disagree on how quickly the fluid returns, and the draft missed this | Vandenbulcke 2024, PMC11148133 (opened: saved copy); Bezuidenhout 2018 (opened). Lloyd 2020 (J Physiol) is not in PMC; known only through Vandenbulcke | Sentence 1: "…into the head. Normally it then flows back down." Typical view: "The fluid moves up into the head and then back down." Animate the return as unhurried, not a snap back |
| 4 | Medium | 3 Cough | Sentence 2: "in Chiari I, the low tonsils get in the way…" (also row 19 and the screen-reader line) | **Reads as true of everyone with Chiari I.** Both MRI studies included only people with symptoms (Bhadelia 2016: "Eight symptomatic patients"; Bezuidenhout: "Thirteen symptomatic patients"). The change after coughing varied with how severe their symptoms were. Bezuidenhout makes it conditional: "provided there is sufficient foramen magnum obstruction" | Bhadelia 2016 and Bezuidenhout 2018 (both opened) | "One explanation is that, in some people with Chiari I, the low tonsils get in the way as the fluid flows back, so just after a cough they are pushed further down into the opening." |
| 5 | Medium | 3 Cough | Sentence 2 and row 19: "for a few seconds"; row 19 quotes Bezuidenhout's "transient, lasting only a few seconds" | **The "few seconds" in Bezuidenhout describes the drop in flow, the disputed finding, not the tonsils.** The full sentence is "a decrease in CSF flow after coughing was transient, lasting only a few seconds…". Row 19 uses it to support the tonsil movement, so the quote is accurate but supports the wrong claim | Bezuidenhout 2018 (opened) | Use "just after a cough" (Bhadelia 2016: "immediately after coughing … dissociation develops") as in fix 4. In row 19, quote Bhadelia 2016's sentence instead |
| 6 | Medium | 3 Cough | Animation step 2: "A soft pressure band travels up the fluid space around the spinal cord" | **The sources describe no travelling wave.** They say the chest pressure swells the veins around the cord, which pushes fluid up. A travelling band looks like the "shock like mechanism" that Vandenbulcke reports two modelling studies "agreed … would be unlikely to occur in patients" | Vandenbulcke 2024 (opened); Bezuidenhout 2018 (opened) | Drop the band. Show only the fluid particles moving up through the opening during the cough |
| 7 | Medium | 3 Cough | Feature name: "Why does coughing set it off?" | **The title could mislead.** "It" could be read as the malformation. The question form promises a settled answer that the text then says doesn't exist, and "set it off" suggests every case | Alhosani (Cureus review), PMC12888059 (opened): headache "often triggered or worsened by coughing"; COPY.md: "The classic sign is a headache at the back of the head that comes on after coughing…" | "Why can coughing bring on a headache?" |
| 8 | Low | 3 Cough | Caption: "Animation simplified. It shows one explanation that researchers are still studying. The size of the movement is drawn to be easy to see, not measured." | **The caption is fine as written.** It is accurate and doesn't overclaim. If fix 1 is taken (no tonsil movement), the last two sentences no longer describe anything on screen | n/a | With fix 1: "Animation simplified." plus the usual "Illustration, not a medical image", "Fluid flow simplified" and the tonsil note. If the tonsil movement comes back later, keep the full caption |
| 9 | Low | 3 Cough | Draft's analysis of sentence 1: "The preprint's own framing says CSF 'flows freely into the cranium during a cough'" | **That framing is a hypothesis the preprint tests, not its finding** ("it is hypothesised that…"), and it was seen only in search results. Sentence 1 doesn't need it: Bezuidenhout, Vandenbulcke, and Lloyd's "cranial flow peak" (cited in Vandenbulcke) all support it | As above | Don't list the preprint as support for sentence 1 |
| 10 | Low | 3 Cough | Proposed rows 18 to 20 | **Verdict and wording fixes.** Row 19's "Partly supported" requires the qualifier to be on the site: add "in some people" (fix 4). Row 20 is stated directly by Bhadelia 2011 and Vandenbulcke, so it could be "Verified". Row 18's "Simplified" requires the simplification to be named on the site; the "Animation simplified" and "Fluid flow simplified" captions cover that, so keep them. Update the "Site wording" cells to match the final text | EVIDENCE.md verdict definitions | As described |
| 11 | Medium | 1 Say it | "Syringomyelia: suh-RING-go-my-EE-lee-uh" with "Capital letters show the part you say loudest." | **Two syllables in capitals, but the site's key promises one loudest part.** Merriam-Webster gives "sə-ˌriŋ-gō-mī-ˈē-lē-ə". Its guide: high mark = "primary (strongest) stress", low mark = "secondary (medium) stress". Only "ē" carries the strongest stress | Merriam-Webster syringomyelia (opened: saved copy and live); M-W Guide to Pronunciation PDF (opened: saved copy) | "suh-ring-go-my-EE-lee-uh" |
| 12 | Medium | 1 Say it | "Syringomyelia has two published versions" (Variants, proposed EVIDENCE row) | **There is a third.** The draft's own Mayfield source (saved copy and live page) says: "This condition, called syringomyelia (pronounced sir-RING-o-my-elia)", stressed on "RING". The three versions put the stress on three different syllables. Matthew should see all three before choosing | Mayfield Clinic pe-chiari (opened: saved copy and live); KidsHealth (opened); Merriam-Webster (opened) | List Mayfield in the Variants and in the EVIDENCE row. The Merriam-Webster version (fix 11) is still a sound choice, since it is the dictionary |
| 13 | Low | 1 Say it | "Chiari is named after Hans Chiari, who first described these malformations at the end of the 1800s." | **"Named after" is not in the source.** The source says only: "Hans Chiari first described the spectrum of Chiari malformations during the end of the 19th century". None of the opened Merriam-Webster pages has a biographical note | Bezuidenhout 2018, PMC7655446 (opened) | "Hans Chiari first described Chiari malformations at the end of the 1800s." |
| 14 | Low | 1 Say it | EVIDENCE row and source table: Merriam-Webster link `…/medical/Chiari`; "Same" for "mal-fore-MAY-shun" | **Citation fixes.** The saved file `merriam-webster-medical-Chiari.html` is the *Arnold-Chiari malformation* entry (its canonical link). The quote "Chi·ari malformation kē-ˈär-ē-" is in `merriam-webster-Chiari-malformation.html` (canonical `…/medical/Chiari%20malformation`). Merriam-Webster gives only the "Chiari" part; "mal-fore-MAY-shun" rests on KidsHealth alone | Both saved Merriam-Webster copies; live page (opened) | Cite `https://www.merriam-webster.com/medical/Chiari%20malformation`. Say that Merriam-Webster supports "key-AR-ee" only |
| 15 | Low | 1 Say it | "MedlinePlus en español gives none either." | **There is no saved copy.** The folder's MedlinePlus file is the English page. I opened the live Spanish page (medlineplus.gov/spanish/chiarimalformation.html): it gives no pronunciation, so the claim holds | MedlinePlus en español (opened live) | Save a copy of the Spanish page |
| 16 | Low | 1 Say it | The respellings as displayed | **Screen readers may read the capitals oddly.** Some read short capitalized chunks letter by letter (for example "A R"). This is an accessibility check (rule 4), not a wording problem | n/a | Test with VoiceOver and NVDA before launch |
| 17 | Medium | 2 Sizes | All options ("5 mm is half a centimeter. 12 mm is a little over 1 centimeter…") placed "next to the Explorer's measurement" | **The text doesn't say what either number is.** The measurement bracket also appears in views where the tonsils aren't at 12 mm: Typical (about 1 mm above the line), and After decompression (about 2 mm higher than Chiari I, per EVIDENCE). There the line would contradict the picture, or read as a scale from normal to bad | EVIDENCE.md rows 7 and 15 and the model table ("model uses about 12 mm"); src/explorer/viewer3d.ts (bracket is drawn for each condition) | Show it only in views where the tonsils are at the 12 mm position, and name both numbers: "The usual cutoff, about 5 mm, is half a centimeter. The model shows about 12 mm, a little over 1 centimeter. How far the tonsils extend doesn't always match how someone feels." |
| 18 | Low | 2 Sizes | Ground rule: "Use only the two numbers already on the site … Don't add 25 mm" | **25 mm is already on the site**, in the tonsil info card from row 15 ("ranged from 5 to 25 mm"). Keeping it out of this line is still right; the stated reason is just inaccurate | COPY.md (tonsil card); EVIDENCE row 15 | Reword the rule: "Don't repeat 25 mm in this line" |
| 19 | Low | 2 Sizes | Options A and B, and the coin row | **Can't be checked yet.** I got the same bot challenge from www.usmint.gov ("Just a moment...") and didn't try to get past it. My arithmetic check agrees with the draft: 3 × 1.75 = 5.25 mm, 7 × 1.75 = 12.25 mm, 24.26 ÷ 5 = 4.85 mm, 24.26 ÷ 2 = 12.13 mm | U.S. Mint Coin Specifications (**not opened**: blocked) | Before A or B ships, a person opens the page and confirms that the quarter is 24.26 mm across (Option B) and 1.75 mm thick (Option A). The coin row's "Not yet verified" verdict is honest; keep it until then |

## What was fine

**Pronunciations**
- "key-AR-ee" is word for word in Mayfield ("Chiari (pronounced key-AR-ee) malformation is a condition in which…"), checked on the saved copy and the live page. It agrees with Merriam-Webster's "kē-ˈär-ē", where ē is the "easy" vowel and är is the vowel in "car".
- "key-AR-ee mal-fore-MAY-shun" is word for word in KidsHealth ("Chiari I malformation (key-AR-ee mal-fore-MAY-shun)"), on the saved copy and the live page.
- "SEER-inks" fits Merriam-Webster's "ˈsir-iŋ(k)s". The guide says "\ir\ … as in near, deer, mere, pier, souvenir", and \ŋ\ is the sound in "sing" and "ink". The medical sense 2 quote ("a pathological cavity in the brain or spinal cord especially in syringomyelia") is exact.
- The KidsHealth variant "ser-in-go-my-ILL-ee-uh" is quoted exactly.
- The reasoning for not listing "kee-AH-ree" quotes the guide correctly ("will usually insert an \r\ after \är\ when it precedes a vowel").
- Not writing a Spanish respelling, and leaving it to the medical translator, is right. KidsHealth en español and MedlinePlus en español give none.

**Sizes**
- None of the options says or suggests that bigger means worse.
- Each ends with the approved sentence, word for word from COPY.md (Home, from row 7).
- The rules against color scales, loaded words and "actual size" are sound.
- Option C needs no outside source.
- The coin row's "Not yet verified" verdict is honest.

**Cough explainer**
- **Sentence 1's main claim is well supported:** a cough raises chest pressure, which pushes some spinal fluid up into the head. Bezuidenhout, Vandenbulcke and Lloyd's real-time MRI "cranial flow peak" (as cited in Vandenbulcke) all support it. Leaving out the veins is a fair, labeled simplification.
- "Not everyone with Chiari gets these headaches" is supported:
  - Vandenbulcke: "about one-third", second-hand; the draft is right not to quote the number.
  - Bhadelia 2016 describes patients without cough headache.
  - KidsHealth: "Some people with Chiari I malformation never have any symptoms".
  - EVIDENCE row 6.
- The rules for the animation are good:
  - no numbers or distances, and the heartbeat tonsil figures are kept out of the cough;
  - the measurement bracket is hidden during the cough;
  - no slowed or stopped flow;
  - no pain signs;
  - nothing about avoiding coughing or straining;
  - no syrinx or After decompression version;
  - one press per cough, with Calm-mode still frames and live screen-reader announcements.
- "Things ease back to how they were." works as a description of the animation. Bezuidenhout also reports the flow change "returning to the resting levels".
- **The quotes in the draft's source table are exact.** I checked each against the saved copies:
  - Bezuidenhout 2018, three quotes;
  - Vandenbulcke 2024;
  - Bhadelia 2016, two quotes;
  - Bhadelia 2011, including the Sansur summary;
  - Alhosani;
  - Mayfield, the "hallmark sign" and "water hammer" lines. The "water hammer" passage does describe the heartbeat flow ("As the heart beats, CSF flows into the brain"), so leaving it out was right;
  - Lawrence 2018, Table 5: 0.30 ± 0.10 mm and 0.79 ± 0.45 mm.
- The draft is open about what it couldn't open, and its decision to drop "the flow there slows" was right.
- **Medical advice:** none of the proposed sentences reads as medical advice.

## Sources opened for this audit

All saved copies are in `docs/audits/sources/2026-11-05-new-features/`.

**Saved copies read:**
- Bhadelia 2016 (PMC7960326)
- Bezuidenhout 2018 (PMC7655446)
- Bhadelia 2011 (PMC7965870)
- Vandenbulcke 2024 (PMC11148133)
- Lawrence 2018 (PMC6063776)
- Alhosani (PMC12888059)
- Mayfield Clinic pe-chiari
- KidsHealth, English and Spanish
- MedlinePlus, English
- Merriam-Webster: Chiari malformation, Arnold-Chiari malformation, syringomyelia, syrinx, and the Guide to Pronunciation PDF

**Live pages opened Nov 5:**
- merriam-webster.com: medical/Chiari malformation, medical/syringomyelia, medical/syrinx (same pronunciations as the saved copies)
- mayfieldclinic.com/pe-chiari.htm
- kidshealth.org/en/parents/chiari.html
- medlineplus.gov/spanish/chiarimalformation.html
- a PMC search for any published version of the preprint (none found)

**Blocked, with no attempt to get around them:**
- www.medrxiv.org (Cloudflare "Attention Required!")
- www.usmint.gov (Cloudflare "Just a moment...")
- Europe PMC and api.biorxiv.org (not allowed by this network)
