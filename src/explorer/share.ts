/**
 * Explain It links: a view of the model written after the # in the address. Browsers never send that part to a
 * server, so nothing here is stored or seen by Open Chiari (CLAUDE.md rule 2).
 *
 * The note is not in the link: it travels in the sender's own message, with the link under it.
 *
 *   c1.custom.f.m.l.r.x.o-5,11,100.c35.hskin+bone
 *   condition, camera, then any of:
 *     f  fluid flow    m  measure    l  labels    r  realistic model    x  the recipient may rotate and explore
 *     o  camera turned by hand: azimuth, elevation (degrees) and zoom in percent (100 = whole head)
 *     c  cut-away (0 to 100; left out when it's the midline, 50)
 *     h  layers turned off, joined by +
 *
 * Links made before November 5, 2026 used  v=c1.side.flow.m&o=..&c=..&h=..&x=1&a=fam&n=note  and still open,
 * with their note.
 */
import type { Condition } from '../lib/anatomy-figure';
import { initialState, LAYERS, type CameraView, type LayerId, type ViewState } from './state';

export const NOTE_MAX = 280;

const CONDITION_CODES: Record<Condition, string> = { typical: 'typ', chiari: 'c1', syrinx: 'syr', surgery: 'dec' };
const CODE_CONDITIONS = Object.fromEntries(Object.entries(CONDITION_CODES).map(([k, v]) => [v, k])) as Record<string, Condition>;
const CAMERAS: CameraView[] = ['side', 'back', 'below', 'front', 'close', 'custom'];

/** Camera as azimuth and elevation (degrees) and zoom (1 = the whole head fits). */
export interface Orbit {
  az: number;
  el: number;
  zoom: number;
}

export interface SharedView {
  state: ViewState;
  orbit: Orbit | null;
  explore: boolean;
  /** Only in links made before November 5, 2026, which carried the note; null otherwise. */
  note: string | null;
}

const round = (n: number, d = 0) => Number(n.toFixed(d));

export function encodeView(view: { state: ViewState; orbit: Orbit | null; explore: boolean }): string {
  const st = view.state;
  const parts = [CONDITION_CODES[st.condition], st.camera];
  if (st.flow) parts.push('f');
  if (st.measure) parts.push('m');
  if (st.labels) parts.push('l');
  if (st.model === 'realistic') parts.push('r');
  if (view.explore) parts.push('x');
  if (st.camera === 'custom' && view.orbit) parts.push('o' + [round(view.orbit.az), round(view.orbit.el), round(view.orbit.zoom * 100)].join(','));
  if (st.cut !== 50) parts.push('c' + st.cut);
  const hidden = LAYERS.filter((id) => !st.layers[id].on && initialState.layers[id].on);
  if (hidden.length) parts.push('h' + hidden.join('+'));
  // The selected structure, and whether it's shown alone or hidden (3D roadmap step 2).
  if (st.part !== initialState.part) parts.push('p' + st.part);
  if (st.focus !== 'all') parts.push('i' + (st.focus === 'only' ? 'o' : 'h'));
  // The cut direction (Nov 5): kc = front to back (coronal), ka = across (axial); side to side is the default.
  if (st.plane !== 'sagittal') parts.push('k' + (st.plane === 'coronal' ? 'c' : 'a'));
  return parts.join('.');
}

function finish(state: ViewState, camera: string, o: number[], cut: string | null, hidden: string): Omit<SharedView, 'explore' | 'note'> {
  state.camera = CAMERAS.includes(camera as CameraView) ? (camera as CameraView) : 'side';
  const c = Number(cut);
  if (cut !== null && cut !== '' && Number.isFinite(c)) state.cut = Math.min(100, Math.max(0, Math.round(c / 5) * 5));
  for (const id of hidden.split(/[.+]/)) if ((LAYERS as string[]).includes(id)) state.layers[id as LayerId].on = false;
  let orbit: Orbit | null = null;
  if (state.camera === 'custom' && o.length === 3 && o.every(Number.isFinite)) {
    orbit = { az: o[0], el: Math.max(-89, Math.min(89, o[1])), zoom: Math.max(0.3, Math.min(4, o[2])) };
  } else if (state.camera === 'custom') state.camera = 'side';
  return { state, orbit };
}

/** Reads a view from the part after the #. Anything missing or unknown falls back to the Explorer's starting view. */
export function decodeView(hash: string): SharedView | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  const state: ViewState = structuredClone(initialState);

  // Links made before November 5, 2026
  if (raw.includes('=')) {
    const params = new URLSearchParams(raw);
    const v = params.get('v');
    if (!v) return null;
    const [code, camera, ...flags] = v.split('.');
    state.condition = CODE_CONDITIONS[code] ?? initialState.condition;
    state.flow = flags.includes('flow');
    state.measure = flags.includes('m');
    state.labels = flags.includes('lab');
    state.model = flags.includes('real') ? 'realistic' : 'simple';
    const view = finish(state, camera, (params.get('o') ?? '').split(',').map(Number), params.get('c'), params.get('h') ?? '');
    return {
      ...view,
      explore: params.get('x') === '1',
      note: params.has('n') ? (params.get('n') ?? '').slice(0, NOTE_MAX) : null,
    };
  }

  const [code, camera, ...tokens] = decodeURIComponent(raw).split('.');
  if (!(code in CODE_CONDITIONS)) return null;
  state.condition = CODE_CONDITIONS[code];
  state.flow = tokens.includes('f');
  state.measure = tokens.includes('m');
  state.labels = tokens.includes('l');
  state.model = tokens.includes('r') ? 'realistic' : 'simple';
  const value = (key: string) => tokens.find((t) => t.length > 1 && t.startsWith(key))?.slice(1) ?? null;
  const o = (value('o') ?? '').split(',').map(Number);
  if (o.length === 3) o[2] /= 100;
  const part = value('p');
  if (part && /^[a-z0-9]+$/.test(part)) state.part = part;
  const k = value('k');
  // Front and across cuts are shown on the realistic model only.
  if (k === 'c' || k === 'a') Object.assign(state, { plane: k === 'c' ? 'coronal' : 'axial', model: 'realistic', flow: false, measure: false, labels: false });
  const focus = value('i');
  if (focus === 'o' || focus === 'h') state.focus = focus === 'o' ? 'only' : 'hide';
  const view = finish(state, camera, o, value('c'), value('h') ?? '');
  return { ...view, explore: tokens.includes('x'), note: null };
}
