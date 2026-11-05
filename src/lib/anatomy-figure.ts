/**
 * Midline anatomy figure (head and upper neck) as an SVG string, in four conditions.
 * One source for the Home page (rendered at build time) and the Explorer (updated in the browser).
 *
 * All shapes come from src/lib/anatomy-shapes.json (shared with the 3D model). Since 2026-11-04 the head,
 * skull, skull base and brain above the foramen magnum are traced from the Z-Anatomy atlas
 * (model/simple/reference/); the McRae line, tonsils, cord, canal and vertebrae follow docs/EVIDENCE.md.
 * Do not change any inner shape or position without updating docs/EVIDENCE.md and getting Matthew's OK.
 * Colors are the anatomy palette in docs/DESIGN.md.
 */

import shapes from './anatomy-shapes.json' with { type: 'json' };

export type Condition = 'typical' | 'chiari' | 'syrinx' | 'surgery';
export const CONDITIONS: Condition[] = ['typical', 'chiari', 'syrinx', 'surgery'];

export interface FigureOptions {
  condition?: Condition;
  flow?: boolean;
  labels?: boolean;
  measure?: boolean;
  dark?: boolean;
  className?: string;
  /** Opacity of each layer, 0 to 1 (0 hides it). Leave out for the full figure. Used by the 3D cut face. */
  layers?: Partial<Record<FigureLayer, number>>;
}

export type FigureLayer = 'skin' | 'bone' | 'brain' | 'csf';

export interface FigureStrings {
  ariaPrefix: string;
  aria: Record<Condition, string>;
  labels: {
    cerebrum: string; callosum: string; cerebellum: string; fourthVentricle: string; brainstem: string;
    tonsil: string; foramen: string; foramenNote: string; cord: string; csf: string; c2: string;
    syrinx: string; syrinxNote: string; boneRemoved: string; boneRemovedNote: string; foramenNoteSurgery: string;
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The head outline comes from the sculpted 3D head (model/simple/build.mjs writes it).
const SKIN = shapes.skin;

const TONSIL = { typical: shapes.tonsil.typical, low: shapes.tonsil.chiari, surgery: shapes.tonsil.surgery };

type Rect = { rect: number[] };
/** A shape from anatomy-shapes.json as an SVG element: a path string, { d }, or { ellipse: [cx, cy, rx, ry] }. */
const shapeEl = (item: unknown, attrs: string) => {
  if (typeof item === 'string') return `<path d="${item}" ${attrs}/>`;
  const o = item as { d?: string; ellipse?: number[] };
  if (o.ellipse) {
    const [cx, cy, rx, ry] = o.ellipse;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrs}/>`;
  }
  return `<path d="${o.d}" ${attrs}/>`;
};
const rect = ({ rect: [x, y, w, h, r] }: Rect, fill: string, stroke = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ''}/>`;
const bonePath = (d: string) => `<path d="${d}" fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5" stroke-linejoin="round"/>`;
const CSF = (d: string) => `<path d="${d}" fill="#9CC3DA" fill-opacity="0.75"/>`;
const chevron = (x: number, y: number, w = 5) => `M${x - w} ${y - 3} L${x} ${y + 3} L${x + w} ${y - 3}`;

/** Flow chevrons (figure units): in front of the cord, and behind it ([x, y, half-width]). Shared with the 3D view. */
export const FLOW = {
  front: [[330.5, 478], [328.1, 528], [326, 578]] as [number, number][],
  backOpen: [[374, 478, 5], [351.6, 528, 2.5], [349.5, 578, 2.5], [416, 425, 5], [361, 410, 2.5]] as [number, number, number][],
  backBlocked: [[350.9, 551, 2.5]] as [number, number, number][],
};

export function anatomyFigureSvg(options: FigureOptions, t: FigureStrings): string {
  const { condition: c = 'chiari', flow = true, labels = true, measure = true, dark = false, className = '', layers = {} } = options;
  const L = t.labels;
  const low = c === 'chiari' || c === 'syrinx';
  const surgery = c === 'surgery';
  // Without labels the frame is just the head and neck (widened 2026-11-04 so the back of the head isn't clipped).
  const viewBox = labels ? '56 128 704 512' : '60 128 488 512';
  const tonsilPath = low ? TONSIL.low : surgery ? TONSIL.surgery : TONSIL.typical;
  const tonsilTip = low ? 471 : 467;
  const tonsilMid = low ? 448 : surgery ? 446 : 430;
  const tonsilFill = low ? '#D2A79B' : '#DDBDB3';
  const tonsilStroke = low ? '#1F5F8B' : '#B38D82';
  const tonsilWidth = low ? 2.25 : 1.5;
  const ink = dark ? '#ECEAE4' : '#1C1D21';
  const muted = dark ? '#A3A1A9' : '#5E5F66';
  const leader = dark ? '#6E6C74' : '#9E9DA4';
  const sp = '&#160;&#160;';
  const lbl = (y: number, num: string, text: string, bold = false, x = 556) =>
    `<text x="${x}" y="${y}"${bold ? ' font-weight="600"' : ''}><tspan class="fig-mono" fill="${muted}"${bold ? ' font-weight="400"' : ''}>${num}${sp}</tspan>${esc(text)}</text>`;
  const note = (y: number, text: string) => `<text x="580" y="${y}" font-size="11" fill="${muted}">${esc(text)}</text>`;

  const parts: string[] = [];
  const add = (cond: boolean, s: string, layer?: FigureLayer) => {
    if (!cond) return;
    const opacity = layer ? (layers[layer] ?? 1) : 1;
    if (opacity <= 0) return;
    parts.push(opacity < 1 ? `<g opacity="${opacity}">${s}</g>` : s);
  };

  add(true, `<path class="fig-skin" d="${SKIN}" fill="#EFE3D8" stroke="#C9B2A2" stroke-width="1.5"/>`, 'skin');
  add(true, `<path d="${shapes.palate.d}" fill="none" stroke="#D2BBAA" stroke-width="5" stroke-linecap="round"/>`, 'skin');
  add(true, `<path d="${shapes.pharynx.d}" fill="none" stroke="#E2CFC2" stroke-width="16" stroke-linecap="round"/>`, 'skin');
  // Spinal fluid: in front of the cord, and behind it. In Typical and after surgery the space behind is one
  // continuous path from the fourth ventricle outlet to the neck; in Chiari I the tonsil fills it.
  add(true, CSF(shapes.csfFront), 'csf');
  add(true, CSF(shapes.csfBack[low ? 'chiari' : surgery ? 'surgery' : 'typical']), 'csf');
  add(surgery, `<path d="${shapes.surgeryPatch}" fill="none" stroke="#7D6F58" stroke-width="1.5" stroke-dasharray="5 4"/>`, 'csf');
  const skull = shapes.skull.d;
  add(true, `<path d="${skull}" fill="none" stroke="#A69B85" stroke-width="16" stroke-linecap="round"/><path d="${skull}" fill="none" stroke="#E7DFCF" stroke-width="12" stroke-linecap="round"/><path d="${skull}" fill="none" stroke="#D3C8B2" stroke-width="2" stroke-dasharray="2 5"/>`, 'bone');
  const removed = shapes.boneRemovedSkull.d;
  add(surgery, `<path d="${removed}" fill="none" stroke="#EFE3D8" stroke-width="18" stroke-linecap="butt"/><path d="${removed}" fill="none" stroke="#9A3412" stroke-width="1.75" stroke-dasharray="5 4"/>`, 'bone');
  add(true, `<path d="${shapes.skullBase.d}" fill="none" stroke="#A69B85" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`, 'bone');
  add(true, `<path d="${shapes.clivus}" fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5" stroke-linejoin="round"/>`, 'bone');
  add(true, `<path d="${shapes.cerebrum}" fill="#E9CFC6" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="${shapes.gyri}" fill="none" stroke="#CFA79B" stroke-width="1.5" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="${shapes.lateralVentricle}" fill="#A9CBE0"/>`, 'csf');
  add(true, `<path d="${shapes.callosum}" fill="#F4E6E1" stroke="#C39C90" stroke-width="1.25"/>`, 'brain');
  add(true, `${shapeEl(shapes.thalamus, 'fill="#E3BFB3" stroke="#C39C90" stroke-width="1"')}`, 'brain');
  add(true, `<path d="${shapes.tentorium.d}" fill="none" stroke="#A69B85" stroke-width="2.5" stroke-linecap="round"/>`, 'bone');
  add(true, `<path d="${shapes.brainstem}" fill="#E3C2B6" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="${shapes.fourthVentricle}" fill="#A9CBE0" stroke="#7FA6BF" stroke-width="1"/>`, 'csf');
  add(true, `<path d="${shapes.cerebellum}" fill="#DDBDB3" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="${shapes.folia}" fill="none" stroke="#C79E92" stroke-width="1" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="${shapes.arborVitae}" fill="none" stroke="#F6E9E4" stroke-width="3" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="${tonsilPath}" fill="${tonsilFill}" stroke="${tonsilStroke}" stroke-width="${tonsilWidth}" stroke-linejoin="round"/>`, 'brain');
  add(true, `<path d="${shapes.cord}" fill="#EAD9B9" stroke="#B59E73" stroke-width="1.5"/>`, 'brain');
  add(c === 'syrinx', `<path d="${shapes.syrinx}" fill="#7FB3D3" stroke="#3F6F90" stroke-width="1.25"/>`, 'brain');
  const BONE = '#E7DFCF', BONE_EDGE = '#A69B85', DISC = '#D9C3A4';
  add(true, `${shapeEl(shapes.c1Anterior, 'fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5"')}${bonePath(shapes.dens)}${rect(shapes.c2Body, BONE, BONE_EDGE)}${rect(shapes.disc23, DISC)}${rect(shapes.c3Body, BONE, BONE_EDGE)}${rect(shapes.disc34, DISC)}${rect(shapes.c4Body, BONE, BONE_EDGE)}${rect(shapes.disc45, DISC)}${rect(shapes.c5Body, BONE, BONE_EDGE)}`, 'bone');
  add(!surgery, shapeEl(shapes.c1Posterior, 'fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5"'), 'bone');
  add(surgery, shapeEl(shapes.c1Posterior, 'fill="none" stroke="#9A3412" stroke-width="1.75" stroke-dasharray="4 3"'), 'bone');
  // Back of each vertebra (lamina and spinous process), closing the spinal canal.
  add(true, [shapes.spinous2, shapes.spinous3, shapes.spinous4, shapes.spinous5].map(bonePath).join(''), 'bone');
  // Flow marks sit in the fluid: the neck canal is narrow (about 2 mm in front of the cord, 3 mm behind).
  const front = FLOW.front.map(([x, y]) => chevron(x, y, 2.5));
  const flowPath = (marks: string[]) => `<path d="${marks.join(' ')}" fill="none" stroke="#1F5F8B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  add(flow && !low, flowPath([...front, ...FLOW.backOpen.map(([x, y, w]) => chevron(x, y, w))]));
  add(flow && low, `${flowPath([...front, ...FLOW.backBlocked.map(([x, y, w]) => chevron(x, y, w))])}<path d="M390 440 L398 434 M390 448 L398 442 M390 456 L398 450" fill="none" stroke="#9A3412" stroke-width="2" stroke-linecap="round"/>`);
  if (measure) {
    // The McRae line sits on the anatomy, not the page background, so it is always dark ink
    // (on the dark Explorer a light line nearly disappeared against the light anatomy).
    parts.push(`<line x1="334" y1="440" x2="404" y2="449" stroke="#1C1D21" stroke-width="1.25" stroke-dasharray="4 3"/><circle cx="334" cy="440" r="2.5" fill="#1C1D21"/><circle cx="404" cy="449" r="2.5" fill="#1C1D21"/>`);
    add(low || surgery, `<line x1="368" y1="444.4" x2="368" y2="${tonsilTip}" stroke="#1F5F8B" stroke-width="1.5"/><line x1="362" y1="${tonsilTip}" x2="374" y2="${tonsilTip}" stroke="#1F5F8B" stroke-width="1.5"/>`);
  }
  if (labels) {
    // Each leader runs from a point on its structure to its label (label rows every 40 units from y 168).
    const leaders = ['M262 262 L548 164', 'M300 265 L548 204', 'M440 390 L548 244', 'M360 394 L548 284', 'M326 370 L548 324', `M386 ${tonsilMid} L548 364`, 'M372 445 L548 404', 'M342 480 L548 444', 'M351 620 L548 484', 'M318 500 L548 524'];
    parts.push(`<g class="fig-labels" font-size="12.5" fill="${ink}" aria-hidden="true"><g stroke="${leader}" stroke-width="0.75" fill="none">${leaders.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    parts.push(lbl(168, '01', L.cerebrum), lbl(208, '02', L.callosum), lbl(248, '03', L.cerebellum), lbl(288, '04', L.fourthVentricle), lbl(328, '05', L.brainstem), lbl(368, '06', L.tonsil, true), lbl(408, '07', L.foramen), note(424, surgery ? L.foramenNoteSurgery : L.foramenNote), lbl(448, '08', L.cord), lbl(488, '09', L.csf), lbl(528, '10', L.c2));
    add(c === 'syrinx', `<path d="M337 585 L548 564" stroke="${leader}" stroke-width="0.75" fill="none"/>${lbl(568, '11', L.syrinx, true)}${note(584, L.syrinxNote)}`);
    add(surgery, `<path d="M420 440 L548 564" stroke="${leader}" stroke-width="0.75" fill="none"/><text x="556" y="568" font-weight="600" fill="#9A3412"><tspan class="fig-mono" font-weight="400">11${sp}</tspan>${esc(L.boneRemoved)}</text>${note(584, L.boneRemovedNote)}`);
    parts.push('</g>');
  }
  const aria = esc(t.ariaPrefix + t.aria[c]);
  // A figure drawn for a light page gets "fig-on-light", so Dim mode can recolor its labels (global.css).
  return `<svg class="anatomy-figure${dark ? '' : ' fig-on-light'}${className ? ' ' + esc(className) : ''}" viewBox="${viewBox}" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
