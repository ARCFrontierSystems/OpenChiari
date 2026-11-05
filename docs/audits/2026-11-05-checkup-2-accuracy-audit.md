# Independent accuracy audit, check-up 2 (November 5, 2026)

**What was audited:** everything published today in releases 1 to 3 (PR #8 and PR #9), then a lighter sweep of the rest of the site's medical text.
- Release 3 medical text: "How do you say it?", the stacked-quarters size line, and "Why can coughing bring on a headache?".
- Wording around the non-medical features: Listen, Dim, the offline copy, the Explain It picture, "See it in your room", the 3D-printable plaques, and the Privacy page's new wording.
- Required captions and credits in every place the model or a picture of it appears.
- What the site says about how it is checked.
- All other medical sentences in `src/i18n/en.json` and `src/i18n/es.json`.

**Auditor:** a fresh agent that built and wrote none of this (CLAUDE.md rule 1a, check 3). The only file I changed is this report.

**How:**
- I read EVIDENCE.md, COPY.md, both translation files, today's diffs (`git diff 1747454~1 HEAD`), the code behind each feature, and the earlier audits.
- I checked every release 3 sentence and respelling against the saved sources in `docs/audits/sources/2026-11-05-new-features/`.
- I fetched the live pages from openchiari.org (English and Spanish) and counted the captions and credits on each one.
- I ran `npm run model:check`.
- I unpacked `openchiari-print.zip` and measured both STL files myself, by rasterizing their top surfaces at 0.5 mm.

## Plain-language summary

**Verdict: PASS WITH CHANGES.** I found nothing High. The English release 3 text is accurate, matches its sources, and is word for word from COPY.md. Every medical sentence in `en.json` is in COPY.md word for word. The changes needed are:

1. **The Spanish cough text drops a hedge (Medium).** English says "Researchers don't **all** agree". The Spanish says "Los investigadores no están de acuerdo", which means "researchers disagree", as if as a group. That is a different and stronger statement. This sentence also changed after the blind back-translation, so it was never checked.
2. **"Listen" may not stay on the device (Medium).** The code takes the first voice for the language and never checks whether it is a local voice. Browsers can also offer remote voices, which send the text to a speech service. On an old Explain It link, the text read aloud includes the sender's personal note. The button's tooltip says "your device reads this part aloud".
3. **"See it in your room" shows the model without its credit (Medium).** Apple's banner and the Android overlay carry the name and the captions, but not the model credit that rule 3 requires, and not "Not medical advice".
4. **The typical plaque can't show the key comparison (Medium).** The McRae line groove is cut exactly as deep as the fluid spaces (2 mm). Behind the cord, where the typical tonsil sits above the line, the groove disappears into the fluid. Someone holding the two plaques side by side can't see the typical tonsil sitting above the line.
5. **"Checked … before they're published" wasn't true today (Medium).** The About page says this, and the Impact page shows "passed". But the room view and the plaques (new 3D views) went live without an independent audit. The stacked-quarters wording also went live before anyone independently checked its final form. This report closes that gap once its fixes are made.
6. **Smaller items (Low):**
   - The Privacy page says your language choice is remembered in your browser, but the code doesn't save it.
   - The offline copy also installs itself when the model is embedded on another organization's website.
   - The plaques' measurement check never fails, doesn't run in CI, and measures the shapes rather than the STL files.
   - The cough button can announce movement when nothing is moving.
   - Missing Spanish notices on the Explain It picture and the Spanish social post.
   - Record-keeping fixes.

**Nothing claims a medical professional reviewed the site.** About, Open model and Impact all say plainly that it was not reviewed by one.

## Findings

Severity: **High** = something unsupported or contradicted is on the site; **Medium** = stronger or weaker than the source, a required caption or credit missing, or a privacy statement that may not be true; **Low** = polish, record-keeping or a smaller gap.

| # | Severity | Where (key or file, page) | Sentence or element | Problem | Source checked (opened?) | Suggested fix |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Medium** | `es.json` `explorer.cough.text[2]`; `/es/explorer/` | "Los investigadores no están de acuerdo en cómo funciona esto, ni en si es la razón…" | **The hedge "all" is missing.** English: "Researchers **don't all agree**…" (COPY.md, approved). The Spanish says that researchers disagree, as if as a group, which is a different and stronger statement. `docs/SPANISH-REVIEW.md` marks the row "changed since the back-translation; it reads the earlier Spanish", so no blind check covered this version. | Bhadelia 2011, PMC7965870 (opened, saved copy): "there is a difference of opinion as to the exact mechanism responsible for CAH" | "**No todos los investigadores están de acuerdo** en cómo funciona esto, ni en si es la razón por la que toser puede provocar el dolor de cabeza clásico. No todas las personas con Chiari tienen estos dolores de cabeza." Mark it for the translator |
| 2 | Low | `es.json` `explorer.cough.text[1]`; `/es/explorer/` | "…estorban el paso del líquido cuando vuelve a bajar, **y** justo después de toser son empujadas más hacia abajo…" | **The cause-and-effect link is lost.** English "so" says the tonsils are pushed down *because* they get in the way. Spanish "y" (and) makes these two separate events. | Bhadelia 2016, PMC7960326 (opened, saved copy): "a higher intracranial pressure compared with intraspinal pressure pushes the already herniated tonsils downward" | "…cuando vuelve a bajar, **por lo que** justo después de toser son empujadas más hacia abajo, dentro de la abertura." |
| 3 | **Medium** | `src/lib/speak.ts`, `ListenButton.astro`; Home, Explorer, tour, Explain It recipient (`/v/`) | "Listen" (tooltip: "Listen: your device reads this part aloud") | **The voice may not be on the device.** `speak()` takes the first voice whose language matches and never checks `localService`. When the voice list hasn't loaded yet, no voice is set at all and the browser picks one. Some browsers list remote voices, which send the text to the browser maker's speech service. On `/v/` the reading area (`[data-recipient]`) includes the blockquote that shows an **old link's personal note** (links made before Nov 5 carried the note). That would break CLAUDE.md rule 2 ("No third-party requests from visitors' browsers") and contradict the tooltip. | TypeScript `lib.dom.d.ts` (MDN text, opened locally): `localService` "indicating whether the voice is supplied by a local speech synthesizer service (true), or a remote speech synthesizer service (false.)". MDN and the W3C spec: **not opened** (not allowed by this network) | Use only voices with `localService === true`, always set `u.voice`, and hide the button when there is none. Add `data-listen-skip` to `[data-shared-note]`. With that, the tooltip stays true and no wording change is needed |
| 4 | **Medium** | `src/explorer/ar.ts`, `src/pages/explorer.astro`; "See it in your room" (Apple banner and Android overlay) | Title + "Illustration, not a medical image. Tonsils shown at their lowest point, where MRI measures them." | **No model credit and no "Not medical advice".** Rule 3: "Wherever the model or a render of it appears, show this credit exactly." The room view is the model itself, shown at life size. The Explain It picture, the plaques' README and the kit all carry the credit; this view doesn't. The USDZ file made on the phone carries no credit either. | CLAUDE.md rules 1 and 3 | Android overlay: add "Not medical advice." and the exact credit: "3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP)." Apple's banner has little room, so show the credit and the advice line next to the button before the viewer opens, and ask Matthew whether that counts as "where it appears" |
| 5 | Low | `src/explorer/ar.ts` | Android: `optionalFeatures: ['dom-overlay']`; Apple: `callToAction: "Close"` | **The required captions may not show.** On Android, the overlay with the captions and Close is optional. If the browser doesn't grant it, the camera view shows the model with no caption. On iPhone, the banner button in AR Quick Look only sends a message to the page. It doesn't close the viewer, and nothing listens for it, so the "Close" label probably does nothing. Apple may also cut off a long subtitle. Not tested on a device. | Code read | Make `dom-overlay` required, or don't start without it. Drop `callToAction`, or label it with something that really happens. Check on a real iPhone that the whole caption shows |
| 6 | **Medium** | `about.how.checks` (`/about/`); `impact.accuracyValue` (`/impact/`) | "Text and every 3D view are checked against the published sources … by automatic measurements and independent audits, before they're published." / "November 5, 2026 · passed" | **The claim was not met for today's releases.** The room view and the plaques are new 3D views, published in PR #8 without an independent audit. The new-features audit covered only the release 3 drafts. The stacked-quarters line went live after Matthew opened the Mint page, but before an independent check of its final wording: the earlier audit (item 19) said options A and B "can't be checked yet". The plaques' measurement isn't part of `model:check` or CI (item 8). The "passed" on Impact refers to the earlier wording re-audit. | CLAUDE.md rule 1a; `docs/audits/2026-11-05-new-features-audit.md`; `git log` | Keep the wording: it describes the rule. Follow the rule: make the fixes in this report, then update the Impact value and the About "Last check" date. From now on, audit new 3D outputs (room view, plaques) before publishing |
| 7 | **Medium** | `model/simple/build.mjs --print`; `openchiari-midline-typical.stl` (Open model downloads) | Typical plaque: "the McRae line … is a groove" (README) | **The groove vanishes exactly where it matters.** The groove (`RELIEF.groove = -4`) is cut exactly as deep as the fluid (`RELIEF.csf = -4`), both 2 mm. I measured the STL: from about 5 mm in front of the opening's centre to about 12 mm behind it, the surface across the line is flat at fluid depth. Behind the cord, under the typical tonsil, the line can't be seen or felt. On the Chiari I plaque the groove crosses the tonsil and is visible. So the side-by-side comparison the README asks for ("Lay them side by side") doesn't work for Typical. | EVIDENCE.md "McRae line" (basion to opisthion); my raster of both STL files | Make the groove deeper than the fluid (for example 3 mm), or a raised ridge. Rebuild, and check on the STL that the line runs unbroken from basion to opisthion on both plaques |
| 8 | Low | `model/simple/build.mjs --print`; CI | "tonsil tip 1.1 mm above / 12.6 mm below the McRae line" | **The check isn't a real check yet.** It measures the shapes the plaque is cut from, not the exported STL (which is smoothed and then simplified). It only prints its result and never fails, and it doesn't run in CI. Rule 1a check 2 asks for checks "on every change". My own measurement of the STL agrees: Chiari I tip about 12 mm below, Typical about 1 to 2 mm above, at 0.5 mm resolution. So nothing is wrong today. | CLAUDE.md rule 1a.2; `.github/workflows/checks.yml` | Measure the STL files in `model:check` (or in a check of its own) and fail when the numbers drift from EVIDENCE.md |
| 9 | Low | The printed plaques themselves | (no text on the object) | **Separated from the README, a plaque carries no caption and no credit.** It is a physical model that gets handed around. | CLAUDE.md rules 1 and 3 | Ask Matthew: emboss "openchiari.org · Illustration, not a medical image" on the back or edge |
| 10 | Low | `privacy.saved` (en and es); `/privacy/` | "Calm mode, Dim mode and your language choice are remembered in your own browser…" | **The language choice isn't saved.** The code saves only `openchiari-calm` and `openchiari-dim` (`Head.astro`, `calm.ts`, `dim.ts`). The language is the page's own address (`/es/…`). The sentence says more is saved than really is. No privacy harm, but it is untrue. | Code (grep for all storage use) | "Calm mode and Dim mode are remembered in your own browser so they stay on next time." Keep the rest. Needs Matthew's approval (Privacy text) |
| 11 | Low | `src/components/Head.astro` (used by `/embed/`) | Offline helper registration | **The offline copy installs itself inside embeds.** The registration checks only `location.hostname === 'openchiari.org'`, and that is also true inside an iframe on someone else's site. Visitors to an organization's page that embeds the model get Open Chiari's 79 offline files (about 0.8 MB) downloaded and stored, without ever visiting Open Chiari. The live `/embed/` page loads the script that registers it (checked). | Live `/embed/` and `/sw.js` | Don't register inside a frame (`window.top === window`) or on `/embed/` |
| 12 | Low | `privacy.never` "Your camera" (en and es) | "…uses your phone's camera on the phone itself. The picture never leaves your device, and the site never sees it." | **True of the site's own code; one part depends on Apple and Google.** The WebXR session doesn't ask for camera access, so the page never gets camera frames, and Quick Look gets only a model file made on the phone. But the camera picture is handled by the phone's AR component (on Android, Google's ARCore), and the site can't vouch for what that does. The code comment "nothing goes to Google" can't be checked from here. | Code read; Google's ARCore privacy requirements page: **not opened** (not allowed by this network) | A person opens Google's ARCore privacy page once. If it says processing stays on the device, keep the sentence. Otherwise: "The site never receives the camera picture; your phone's own AR feature handles it." |
| 13 | Low | `index.astro` "How do you say it?" with Listen | Respellings read aloud | **Listen can mispronounce the pronunciation guide.** The section's Listen button reads the respellings too. On Spanish pages a Spanish voice reads "key-AR-ee" by Spanish rules, and an English voice may spell "AR" out as letters. The terms (`dt`) on the Spanish page aren't marked `lang="en"`. | Code read | Add `data-listen-skip` to the respellings (or the whole box), and add `lang="en"` to the terms |
| 14 | Low | `explorer.astro` / `viewer3d.ts` `cough()` | Screen-reader lines "During the cough: some spinal fluid moves up…" | **The screen-reader lines can describe movement that isn't on screen.** With the Spinal fluid layer off, the flow marks are hidden (`flowGroup.visible` needs `layers.csf.on`). The cough turns on flow but not the layer, so nothing moves while screen readers hear movement. With no 3D, the button silently does nothing. | Code read | Turn the fluid layer on along with flow, or disable the button (and explain why) while the layer is off or 3D is missing |
| 15 | Low | `explain.astro` picture (Spanish); `make-kit.mjs` social post (Spanish) | Spanish picture and Spanish square social post | **No "pending review" notice.** Both carry Spanish captions with no translation notice. The Spanish quote cards, wallet cards and poster have one. | CLAUDE.md "Translations" | Add `translation.noticeShort` under the captions on Spanish pictures and on the Spanish social post |
| 16 | Low | `docs/audits/sources/2026-11-05-new-features/usmint-quarter-specifications-screenshot.png` | Quarter: 24.26 mm across, 1.75 mm thick | **The screenshot doesn't name the coin.** It is cropped to the table: composition, 5.67 g, 24.26 mm, 1.75 mm. These numbers fit the quarter, but the file alone doesn't show the coin's name, the page address or the date. The arithmetic is right: 3 × 1.75 = 5.25 mm (about 5); 7 × 1.75 = 12.25 mm (about 12; model 12.4 mm Simple, 12.5 mm Realistic). | Screenshot (opened); U.S. Mint page **not opened** (blocks automated readers, per EVIDENCE.md) | Save a screenshot that includes the "Quarter" heading and the address bar, or add "quarter column" to the EVIDENCE.md row |
| 17 | Low | `docs/COPY.md`, `docs/PROGRESS.md` | Records | **The records lag behind the site.** COPY.md still heads releases 1 and 2 "wording pending Matthew's approval" (only a line at the end says approved). Its Privacy section still shows "Last updated November 4, 2026" and the old "Saved on your device" text; the site shows Nov 5 and the new text. PROGRESS.md says the coin comparison "waits for the U.S. Mint page", but it is live. | Files | Update the headings, the Privacy section and the progress entry |
| 18 | Low | `public/downloads/openchiari-figures.zip`; `LICENSE-MODEL.md`; `model.creditLine` | Still open from earlier audits | **Two older gaps are still open.** The figure set's CREDIT.txt still lacks the tonsil note ("still to do" since the first check-up). The license file shipped in every ZIP, including the new plaque ZIP, words the credit "3D model by Open Chiari (openchiari.org)…", and Open model says "Chiari model by Open Chiari (openchiari.org)…". COPY.md approves these for people reusing the model, but they differ from rule 3's "exactly" wording. | CLAUDE.md rule 3; `docs/audits/2026-11-05-checkup-accuracy-audit.md` item 1 | Rebuild the figure set with the tonsil note. Ask Matthew whether the reuser credit should match rule 3 word for word |

## What was fine

**Release 3, English (checked against the saved sources)**
- **Pronunciations match their sources:**
  - "key-AR-ee" is word for word in Mayfield ("pronounced key-AR-ee").
  - "key-AR-ee mal-fore-MAY-shun" is word for word in KidsHealth.
  - "suh-ring-go-my-EE-lee-uh" follows Merriam-Webster "sə-ˌriŋ-gō-mī-ˈē-lē-ə", with one main stress as the site's key promises.
  - "SEER-inks" follows Merriam-Webster "ˈsir-iŋ(k)s".
  - The other published versions (KidsHealth "ser-in-go-my-ILL-ee-uh", Mayfield "sir-RING-o-my-elia") are recorded in EVIDENCE.md.
- **"Hans Chiari first described Chiari malformations at the end of the 1800s."** Bezuidenhout 2018 says "Hans Chiari first described the spectrum of Chiari malformations during the end of the 19th century". "Named after" is gone, as the earlier audit asked.
- **The size line** is the approved wording.
  - The numbers are right: 5 mm is half a centimeter; 12 mm is a little over 1 centimeter; 3 and 7 quarters at 1.75 mm.
  - The model agrees: `npm run model:check` gives 12.4 mm (Simple), and the realistic re-audit gives 12.5 mm.
  - It shows only in the Chiari I and syrinx views with Measure on (both use the Chiari I tonsil), and it ends with the approved "doesn't always match how someone feels".
  - Nothing suggests that bigger means worse.
- **The cough explainer** matches EVIDENCE.md rows 18 to 21, and each hedge is in the sources:
  - "briefly raises the pressure in your chest… Normally it then flows back down": Bezuidenhout ("intrathoracic pressure … moving CSF to the head"); Vandenbulcke ("did not detect a caudal peak flow"), which is why "normally" replaces "straight back".
  - "One explanation… in some people…": Bhadelia 2016 ("pushes the already herniated tonsils downward", "immediately after coughing"); Bezuidenhout ("provided there is sufficient foramen magnum obstruction").
  - "Researchers don't all agree…": Bhadelia 2011 ("difference of opinion").
- **The animation does only what row 21 allows:**
  - only the fluid marks move, up 6 mm, the same in every view, then they ease back;
  - the tonsils don't move, there is no pressure wave and there are no numbers;
  - the measure bracket is hidden during the cough;
  - Calm mode and reduced motion show still frames.
- **The caption** reads "Animation simplified. Illustration, not a medical image · Fluid flow simplified", and pressing Cough turns flow on, so the flow caption is true. The panel shows only in Typical and Chiari I.
- **The screen-reader lines** describe the animation. "Then it flows back down" leaves out "normally", but it describes what is drawn in both views, which is what row 21 approved.

**Release 3, Spanish**
- The size line keeps the same numbers and the same last sentence as the Home myth (word for word).
- The cough sentence 1 and the screen-reader lines say the same as the English.
- The pronunciations are marked "(en inglés)", and the Hans Chiari line ("a finales del siglo XIX") is faithful.

**Text around the non-medical features**
- Dim ("dark colors, less light"), Listen, Picture, the offline copy and the room-view hint make no medical claim and give no advice.
- **The Explain It picture** (`view-picture.ts`, `explain.astro`) carries:
  - the view's name;
  - "Illustration, not a medical image.";
  - "Fluid flow simplified." when flow is on;
  - the tonsil note;
  - "Not medical advice. Talk to your doctor about your own care.";
  - the exact rule 3 credit.

  It is made on the device, and the sender's note is never on it.
- **The plaques' README** has both captions, "Not medical advice. Talk to your doctor about your own care." and the exact rule 3 credit. The STL header also says "Not medical advice."
- **The offline copy** (`sw-template.js`):
  - pages come from the network first, so medical text is current when online;
  - `/api/` is never saved or answered from the device;
  - copies are saved by path only, so the part after `#` is never in them;
  - nothing typed is in the copy.

  The Privacy sentence about this is true, apart from item 10.

**Captions and credits on the live site** (fetched today). The model credit, "Not medical advice" and "Talk to your doctor about your own care." are on every page I fetched. Pages that show the model also carry "Illustration, not a medical image", "Fluid flow simplified" and the tonsil note:
- English: Explorer, side by side, tour, embed, Explain It and `/v/`, Open model;
- Spanish: Explorer, side by side, tour, embed, `/es/v/`, Open model.

Home and visit prep carry the illustration and tonsil notes; they show no flow. The kit page's pictures carry the captions inside the images (`make-kit.mjs`).

**No claim of medical review**
- About: "They have not been reviewed by a medical professional."
- Open model: "not reviewed by a medical professional".
- Impact: "not reviewed by a medical professional".
- Spanish: the same in all three places.
- No page or download says a medical professional reviewed anything.

**The sweep**
- Every sentence in `en.json` longer than a few words is in COPY.md word for word. The exceptions are only interface text: the translation notice, keyboard help, cut names, and dates and counts.
- The Spanish medical sentences I re-read keep their hedges: Home, condition notes, structure cards, Explain It, tour, side by side, kit, captions, accuracy wording.
- `npm run model:check`: "All measurements match docs/EVIDENCE.md".

## Sources opened for this audit

**Saved copies read** (`docs/audits/sources/2026-11-05-new-features/`):
- Bezuidenhout 2018 (PMC7655446)
- Bhadelia 2016 (PMC7960326)
- Bhadelia 2011 (PMC7965870)
- Vandenbulcke 2024 (PMC11148133)
- Mayfield Clinic
- KidsHealth (English)
- Merriam-Webster: Chiari malformation, syringomyelia, syrinx
- the U.S. Mint screenshot

**Live pages:**
- openchiari.org: Home, Explorer, side by side, tour, embed, Explain It, `/v/`, Open model, kit, studies, visit prep, evidence, About, Impact, Privacy, `/sw.js`
- the Spanish versions of most of these

**Local:** both STL files from `openchiari-print.zip`, measured; TypeScript `lib.dom.d.ts` (MDN text on `localService`).

**Not opened** (not allowed by this network; I made no attempt to get around it):
- developers.google.com (ARCore privacy requirements)
- webaudio.github.io (Web Speech API spec)
- developer.mozilla.org

The U.S. Mint page and medRxiv block automated readers (EVIDENCE.md), so I didn't try them.
