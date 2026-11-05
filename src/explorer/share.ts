/**
 * Explain It links: a view of the model (and, for a shared link, a note) written after the # in the address.
 * Browsers never send that part to a server, so nothing here is stored or seen by Open Chiari (CLAUDE.md rule 2).
 *
 *   v=c1.side.flow.m.lab.real   condition, camera, then flags: fluid flow, measure, labels, realistic model
 *   o=30,-10,1.2                camera when turned by hand: azimuth, elevation (degrees) and zoom (1 = whole head)
 *   c=35                        cut-away (0 to 100; left out when it's the midline, 50)
 *   h=skin.bone                 layers turned off
 *   x=1                         the recipient may rotate and explore
 *   a=fam | sch | work | oth    who it's for
 *   n=...                       the note (up to 280 characters); its presence marks a link made to be shared
 */
import type { Condition } from '../lib/anatomy-figure';
import { initialState, LAYERS, type CameraView, type LayerId, type ViewState } from './state';

export const NOTE_MAX = 280;
export type Audience = 'fam' | 'sch' | 'work' | 'oth';
export const AUDIENCES: Audience[] = ['fam', 'sch', 'work', 'oth'];

const CONDITION_CODES: Record<Condition, string> = { typical: 'typ', chiari: 'c1', syrinx: 'syr', surgery: 'dec' };
const CODE_CONDITIONS = Object.fromEntries(Object.entries(CONDITION_CODES).map(([k, v]) => [v, k])) as Record<string, Condition>;
const CAMERAS: CameraView[] = ['side', 'back', 'below', 'front', 'custom'];

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
  audience: Audience;
  /** null when the link carries no note (a view passed from the Explorer, not yet shared). */
  note: string | null;
}

const round = (n: number, d = 0) => Number(n.toFixed(d));

export function encodeView(view: Omit<SharedView, 'note'> & { note?: string | null }): string {
  const st = view.state;
  const flags = [CONDITION_CODES[st.condition], st.camera];
  if (st.flow) flags.push('flow');
  if (st.measure) flags.push('m');
  if (st.labels) flags.push('lab');
  if (st.model === 'realistic') flags.push('real');
  const params = new URLSearchParams();
  params.set('v', flags.join('.'));
  if (st.camera === 'custom' && view.orbit) params.set('o', [round(view.orbit.az), round(view.orbit.el), round(view.orbit.zoom, 2)].join(','));
  if (st.cut !== 50) params.set('c', String(st.cut));
  const hidden = LAYERS.filter((id) => !st.layers[id].on && initialState.layers[id].on);
  if (hidden.length) params.set('h', hidden.join('.'));
  if (view.explore) params.set('x', '1');
  params.set('a', view.audience);
  if (view.note !== undefined && view.note !== null) params.set('n', view.note.slice(0, NOTE_MAX));
  return params.toString();
}

/** Reads a view from the part after the #. Anything missing or unknown falls back to the Explorer's starting view. */
export function decodeView(hash: string): SharedView | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const v = params.get('v');
  if (!v) return null;
  const [code, camera, ...flags] = v.split('.');
  const condition = CODE_CONDITIONS[code] ?? initialState.condition;
  const state: ViewState = structuredClone(initialState);
  state.condition = condition;
  state.camera = CAMERAS.includes(camera as CameraView) ? (camera as CameraView) : 'side';
  state.flow = flags.includes('flow');
  state.measure = flags.includes('m');
  state.labels = flags.includes('lab');
  state.model = flags.includes('real') ? 'realistic' : 'simple';
  const cut = Number(params.get('c'));
  if (params.has('c') && Number.isFinite(cut)) state.cut = Math.min(100, Math.max(0, Math.round(cut / 5) * 5));
  for (const id of (params.get('h') ?? '').split('.')) if ((LAYERS as string[]).includes(id)) state.layers[id as LayerId].on = false;
  let orbit: Orbit | null = null;
  const o = (params.get('o') ?? '').split(',').map(Number);
  if (state.camera === 'custom' && o.length === 3 && o.every(Number.isFinite)) {
    orbit = { az: o[0], el: Math.max(-89, Math.min(89, o[1])), zoom: Math.max(0.3, Math.min(4, o[2])) };
  } else if (state.camera === 'custom') state.camera = 'side';
  const a = params.get('a') as Audience;
  return {
    state,
    orbit,
    explore: params.get('x') === '1',
    audience: AUDIENCES.includes(a) ? a : 'fam',
    note: params.has('n') ? (params.get('n') ?? '').slice(0, NOTE_MAX) : null,
  };
}
