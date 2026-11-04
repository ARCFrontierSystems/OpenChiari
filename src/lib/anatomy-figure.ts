/**
 * Midline anatomy figure (head and upper neck) as an SVG string, in four conditions.
 * One source for the Home page (rendered at build time) and the Explorer (updated in the browser).
 *
 * Inner structures (skull, brain, tonsils, McRae line, spine, cord, CSF) are ported shape for
 * shape from design/mockups/Anatomy.dc.html and match design/figures/. The outer skin outline
 * was redrawn on 2026-11-04 at Matthew's request for a natural head shape (not a measured structure).
 * It is the source for the 3D skin: model/simple/build.mjs builds a smooth, plain head from it, so the
 * figure and the 3D model match.
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
  const viewBox = labels ? '40 62 720 578' : '36 62 522 578';
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
  const skull = 'M120 300 C112 230 130 170 170 135 C230 95 330 92 400 115 C470 140 515 200 518 275 C520 330 505 380 470 412 C450 430 425 442 398 448';
  add(true, `<path d="${skull}" fill="none" stroke="#A69B85" stroke-width="16" stroke-linecap="round"/><path d="${skull}" fill="none" stroke="#E7DFCF" stroke-width="12" stroke-linecap="round"/><path d="${skull}" fill="none" stroke="#D3C8B2" stroke-width="2" stroke-dasharray="2 5"/>`, 'bone');
  const removed = shapes.boneRemovedSkull.d;
  add(surgery, `<path d="${removed}" fill="none" stroke="#EFE3D8" stroke-width="18" stroke-linecap="butt"/><path d="${removed}" fill="none" stroke="#9A3412" stroke-width="1.75" stroke-dasharray="5 4"/>`, 'bone');
  add(true, `<path d="M128 300 C170 305 220 310 252 322 C255 338 272 340 278 330 L282 354" fill="none" stroke="#A69B85" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`, 'bone');
  add(true, `<path d="M276 354 L290 356 C292 390 304 420 334 440 L328 446 C298 432 278 400 276 354 Z" fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5" stroke-linejoin="round"/>`, 'bone');
  add(true, `<path d="M140 292 C134 232 150 185 188 156 C240 120 330 118 392 138 C452 160 490 210 492 272 C494 305 488 330 476 345 C440 340 400 338 360 338 C340 336 322 332 305 322 C295 318 285 312 272 312 C240 306 190 300 140 292 Z" fill="#E9CFC6" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="M160 200 C180 185 200 205 225 185 M250 150 C270 170 290 150 310 165 M330 150 C350 175 375 160 395 180 M420 175 C430 200 455 200 465 225 M165 262 C185 247 200 272 222 264 M440 262 C455 282 470 277 482 302 M150 236 C170 229 175 246 195 241 M398 268 C412 286 436 280 452 300 M182 282 C202 272 222 286 244 280" fill="none" stroke="#CFA79B" stroke-width="1.5" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="M236 254 C260 236 330 236 352 250 C332 246 262 246 240 262 Z" fill="#A9CBE0"/>`, 'csf');
  add(true, `<path d="M205 230 C230 200 330 195 370 225 C382 236 378 252 362 250 C335 228 250 225 228 250 C215 262 196 248 205 230 Z" fill="#F4E6E1" stroke="#C39C90" stroke-width="1.25"/>`, 'brain');
  add(true, `<ellipse cx="300" cy="282" rx="34" ry="20" fill="#E3BFB3" stroke="#C39C90" stroke-width="1"/>`, 'brain');
  add(true, `<path d="M352 337 L498 347" fill="none" stroke="#A69B85" stroke-width="2.5" stroke-linecap="round"/>`, 'bone');
  add(true, `<path d="M296 300 C310 296 326 304 332 318 C340 334 348 346 348 362 L348 404 C350 420 356 434 358 446 L336 446 C330 430 320 414 316 402 C304 390 300 376 304 362 C306 346 300 330 294 318 C290 310 290 302 296 300 Z" fill="#E3C2B6" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="M348 362 L374 384 L348 404 Z" fill="#A9CBE0" stroke="#7FA6BF" stroke-width="1"/>`, 'csf');
  add(true, `<path d="M360 352 C392 340 452 342 474 356 C486 366 484 386 468 398 C456 410 430 420 404 426 C388 430 376 424 372 414 C382 404 384 392 374 384 C368 372 360 362 360 352 Z" fill="#DDBDB3" stroke="#B38D82" stroke-width="1.5"/>`, 'brain');
  add(true, `<path d="M374 360 C402 352 442 352 468 362 M474 372 C478 380 477 388 470 394 M446 412 C430 418 416 420 404 422" fill="none" stroke="#C79E92" stroke-width="1" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="M378 386 C400 378 422 370 452 364 M402 378 C412 366 426 360 442 356 M378 388 C404 392 430 396 464 396 M410 392 C426 404 442 412 458 418 M394 390 C404 404 412 416 420 428" fill="none" stroke="#F6E9E4" stroke-width="3" stroke-linecap="round"/>`, 'brain');
  add(true, `<path d="${tonsilPath}" fill="${tonsilFill}" stroke="${tonsilStroke}" stroke-width="${tonsilWidth}" stroke-linejoin="round"/>`, 'brain');
  add(true, `<path d="${shapes.cord}" fill="#EAD9B9" stroke="#B59E73" stroke-width="1.5"/>`, 'brain');
  add(c === 'syrinx', `<path d="${shapes.syrinx}" fill="#7FB3D3" stroke="#3F6F90" stroke-width="1.25"/>`, 'brain');
  const BONE = '#E7DFCF', BONE_EDGE = '#A69B85', DISC = '#D9C3A4';
  add(true, `<ellipse cx="298" cy="462" rx="9" ry="7" fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5"/>${bonePath(shapes.dens)}${rect(shapes.c2Body, BONE, BONE_EDGE)}${rect(shapes.disc23, DISC)}${rect(shapes.c3Body, BONE, BONE_EDGE)}${rect(shapes.disc34, DISC)}${rect(shapes.c4Body, BONE, BONE_EDGE)}${rect(shapes.disc45, DISC)}${rect(shapes.c5Body, BONE, BONE_EDGE)}`, 'bone');
  add(!surgery, `<ellipse cx="414" cy="470" rx="12" ry="8" fill="#E7DFCF" stroke="#A69B85" stroke-width="1.5"/>`, 'bone');
  add(surgery, `<ellipse cx="414" cy="470" rx="12" ry="8" fill="none" stroke="#9A3412" stroke-width="1.75" stroke-dasharray="4 3"/>`, 'bone');
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
    const leaders = ['M250 170 L548 116', 'M300 214 L548 156', 'M452 372 L548 196', 'M364 384 L548 236', 'M318 372 L548 276', `M386 ${tonsilMid} L548 316`, 'M372 445 L548 356', 'M342 480 L548 396', 'M351 620 L548 436', 'M318 500 L548 476'];
    parts.push(`<g font-size="12.5" fill="${ink}" aria-hidden="true"><g stroke="${leader}" stroke-width="0.75" fill="none">${leaders.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    parts.push(lbl(120, '01', L.cerebrum), lbl(160, '02', L.callosum), lbl(200, '03', L.cerebellum), lbl(240, '04', L.fourthVentricle), lbl(280, '05', L.brainstem), lbl(320, '06', L.tonsil, true), lbl(360, '07', L.foramen), note(376, surgery ? L.foramenNoteSurgery : L.foramenNote), lbl(400, '08', L.cord), lbl(440, '09', L.csf), lbl(480, '10', L.c2));
    add(c === 'syrinx', `<path d="M337 585 L548 516" stroke="${leader}" stroke-width="0.75" fill="none"/>${lbl(520, '11', L.syrinx, true)}${note(536, L.syrinxNote)}`);
    add(surgery, `<path d="M420 440 L548 516" stroke="${leader}" stroke-width="0.75" fill="none"/><text x="556" y="520" font-weight="600" fill="#9A3412"><tspan class="fig-mono" font-weight="400">11${sp}</tspan>${esc(L.boneRemoved)}</text>${note(536, L.boneRemovedNote)}`);
    parts.push('</g>');
  }
  const aria = esc(t.ariaPrefix + t.aria[c]);
  return `<svg class="anatomy-figure${className ? ' ' + esc(className) : ''}" viewBox="${viewBox}" role="img" aria-label="${aria}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}
