# Open Chiari: design system

The site should feel like a trustworthy reference atlas, not a template: serif headings, numbered figures with captions, hairline rules, square-ish corners, and a single restrained accent. The 3D Explorer is a dark, neutral workspace like professional anatomy apps.

All values below are taken from the final mockups in `design/mockups/`. Define them as CSS custom properties and use only these.

## Type

| Role | Font | Weight | Sizes |
| --- | --- | --- | --- |
| Headings, figure titles, pull quotes | Source Serif 4 | 600 | Page title 42–54 px desktop, 30–36 px phone; section 36 px desktop, 26 px phone; card title 19–26 px |
| Body and UI | IBM Plex Sans | 400, 500, 600 | Body 16–17 px (Calm mode 19 px); small 13–15 px; line height 1.55–1.6 |
| Labels, numbers, measurements, metadata | IBM Plex Mono | 400, 500 | 11–13 px |

Self-host all three (they're under the SIL Open Font License). No Google Fonts requests in production.

## Color: site (light)

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F5F5F3` | Page background |
| `--surface` | `#FFFFFF` | Header, cards, alternating sections, figures |
| `--ink` | `#1C1D21` | Main text, strong rules |
| `--ink-2` | `#3B3C42` | Body copy |
| `--muted` | `#5E5F66` | Captions, metadata |
| `--rule` | `#DCDBD6` | Hairline borders and dividers |
| `--input-border` | `#A9A8A2` | Form fields |
| `--accent` | `#1F5F8B` | Primary buttons, links, highlights |
| `--accent-hover` | `#123E5C` | Link hover |
| `--awareness` | `#5B027E` | Brand purple, from the logo (changed 2026-11-04, Matthew: keep blue for buttons and links, purple for brand only) |
| `--status-good` | `#1D6B3A` | "Recruiting" |
| `--status-warn-text` | `#8A3B12` | Restricted-flow text |

## Color: 3D Explorer (dark)

| Token | Value | Use |
| --- | --- | --- |
| `--x-bg` | `#111215` | Page background |
| `--x-panel` | `#17181C` | Header, side panels, toolbars |
| `--x-viewport` | `#1A1C20` | 3D viewport |
| `--x-border` | `#2A2C31` | Panel borders, selected row background |
| `--x-control-border` | `#3A3C42` | Buttons and inputs |
| `--x-text` | `#ECEAE4` | Main text |
| `--x-text-2` | `#D2D0CA` | Body text |
| `--x-muted` | `#A3A1A9` | Labels |
| `--x-faint` | `#8A8890` | Hints and captions |
| `--x-accent` | `#7FB3D3` | Active tool border, sliders, checkboxes |
| `--x-accent-tint` | `#1F3A4D` | Active tool background |
| `--x-brand-mark` | `#CB98E1` | Brand purple on dark, from the logo's light version |
| Primary button on dark | `#E8E6E0` background, `#111215` text | "Explain It" |

## Color: Calm mode

| Token | Value |
| --- | --- |
| `--paper` | `#EEEDE9` |
| `--surface` | `#F7F6F2` |
| `--ink` | `#141518` |
| `--rule` | `#C9C8C2` |
| `--accent` | `#174A6D` |
| Base font size | 19 px; buttons at least 56 px tall |

## Anatomy palette

Muted, realistic tones. Use the same colors for the Simple model's materials and the 2D figures.

| Structure | Fill | Outline |
| --- | --- | --- |
| Skin and soft tissue | `#EFE3D8` | `#C9B2A2` |
| Bone (skull, vertebrae) | `#E7DFCF` | `#A69B85` |
| Intervertebral discs | `#D9C3A4` | none |
| Cerebrum | `#E9CFC6` | `#B38D82` (gyri lines `#CFA79B`) |
| Corpus callosum | `#F4E6E1` | `#C39C90` |
| Thalamus | `#E3BFB3` | `#C39C90` |
| Brainstem | `#E3C2B6` | `#B38D82` |
| Cerebellum | `#DDBDB3` | `#B38D82` (white-matter branches `#F6E9E4`, folia `#C79E92`) |
| Tonsils, typical | `#DDBDB3` | `#B38D82` |
| Tonsils, Chiari (highlighted) | `#D2A79B` | `#1F5F8B`, 2.25 px |
| Spinal cord | `#EAD9B9` | `#B59E73` |
| Spinal fluid (CSF) | `#9CC3DA` at 75% | none |
| Ventricles | `#A9CBE0` | `#7FA6BF` |
| Syrinx | `#7FB3D3` | `#3F6F90` |
| Flow arrows | `#1F5F8B` | |
| Restricted flow, removed bone | `#9A3412` | dashed |
| Dural patch | `#7D6F58` | dashed |

## Shape and spacing

- Corner radius: 4 px for buttons, inputs and cards. No pill buttons, no large rounded cards.
- Borders: 1 px hairlines (`--rule`); 2 px ink rule above major lists and tables.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 72 px.
- Content width: 1200 px max on desktop pages, 32 px side padding; 20 px on phones.
- Touch targets: at least 44 × 44 px.
- Figures: white surface, 1 px border, caption bar below with "Fig. N" in mono.

## Components (see mockups)

- **Header:** the Open Chiari logo (links home), nav, "Español" link, Calm mode switch. On the dark 3D Explorer, the logo's light version.
- **Logo** (Matthew, 2026-11-04): source `design/brand/open-chiari-logo.png`. Web versions in `public/brand/`, made by `scripts/make-brand.py`: see-through logo for light backgrounds, a light version for dark backgrounds (light outline and lettering, lighter purple), the head-and-brain mark as the browser tab and home-screen icon, and a 1200 by 630 link-preview picture. A vector (SVG) version from a designer would be sharper and can replace these.
- **Buttons:** primary (accent fill, white text), secondary (1 px ink outline), text button.
- **Numbered tool list:** mono number, accent title, one-line description, hairline rules.
- **Definition lists** for specs and principles; **pipe tables** for comparisons.
- **3D Explorer layout:** left panel (condition, layers, cut-away, model), center viewport with floating tool and camera bars, right panel (structure search, list, selected-part card).

## Avoid

Gradients, emoji, stock icon packs, drop shadows, uppercase eyebrow labels on everything, centered marketing heroes, and decorative color.
