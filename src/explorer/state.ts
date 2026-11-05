/**
 * The Explorer's view state: everything the visitor has chosen.
 * Every control writes here and every view (the 2D figure now, the 3D model from step 4)
 * reads from here, so desktop and phone controls always agree.
 * Nothing here is stored or sent anywhere. (Explain It will later encode it after the # in a link.)
 */
import type { Condition } from '../lib/anatomy-figure';

// Nerves and blood vessels were planned as layers but removed on Nov 5, 2026 (Matthew): no model has them.
export type LayerId = 'skin' | 'bone' | 'brain' | 'csf';
export const LAYERS: LayerId[] = ['skin', 'bone', 'brain', 'csf'];

export interface Layer {
  on: boolean;
  /** 0 to 100 */
  opacity: number;
}

/** Named camera directions; 'custom' once the visitor turns the model themselves. */
export type CameraView = 'side' | 'back' | 'below' | 'front' | 'custom';
export const CAMERA_PRESETS: Exclude<CameraView, 'custom'>[] = ['side', 'back', 'below', 'front'];

export interface ViewState {
  condition: Condition;
  flow: boolean;
  labels: boolean;
  measure: boolean;
  layers: Record<LayerId, Layer>;
  /** 0 = whole model, 50 = midline cut, 100 = far side */
  cut: number;
  model: 'simple' | 'realistic';
  part: string;
  camera: CameraView;
}

// Starting view. Skin starts on, so the midline cut matches the figures; the mockup had it off.
export const initialState: ViewState = {
  condition: 'chiari',
  flow: true,
  labels: true,
  measure: true,
  layers: {
    skin: { on: true, opacity: 100 },
    bone: { on: true, opacity: 100 },
    brain: { on: true, opacity: 100 },
    csf: { on: true, opacity: 100 },
  },
  cut: 50,
  // The realistic model is Phase 2 and stays hidden until it passes the accuracy checks (CLAUDE.md rule 1a).
  model: 'simple',
  part: 'tonsil',
  camera: 'side',
};

type Listener = (state: ViewState) => void;

export function createStore(start: ViewState = initialState) {
  let state: ViewState = structuredClone(start);
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(change: Partial<ViewState>) {
      state = { ...state, ...change };
      listeners.forEach((listener) => listener(state));
    },
    setLayer(id: LayerId, change: Partial<Layer>) {
      state = { ...state, layers: { ...state.layers, [id]: { ...state.layers[id], ...change } } };
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
  };
}

export type Store = ReturnType<typeof createStore>;
