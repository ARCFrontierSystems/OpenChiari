/**
 * Calm mode: no motion or auto-rotation, larger text (base 19 px), softer colors.
 *
 * - Shown by `data-calm="on"` on the <html> element; CSS in tokens.css and global.css does the rest.
 * - The visitor's choice is saved in localStorage on their own device only (never sent anywhere).
 * - With no saved choice, Calm mode follows the system setting `prefers-reduced-motion: reduce`.
 * - The first decision is made by a tiny inline script in Base.astro before the page draws,
 *   so there's no flash. Keep CALM_KEY in sync with that script.
 * - 3D code (Explorer) should check isCalm() and listen with onCalmChange() to stop motion.
 */

export const CALM_KEY = 'openchiari-calm';
export const CALM_EVENT = 'openchiari:calmchange';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)');

function readChoice(): 'on' | 'off' | null {
  try {
    const value = localStorage.getItem(CALM_KEY);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(value: 'on' | 'off'): void {
  try {
    localStorage.setItem(CALM_KEY, value);
  } catch {
    // Storage blocked (private window etc.): Calm mode still works for this page view.
  }
}

export function isCalm(): boolean {
  return document.documentElement.dataset.calm === 'on';
}

function apply(on: boolean): void {
  if (on === isCalm()) return;
  if (on) document.documentElement.dataset.calm = 'on';
  else delete document.documentElement.dataset.calm;
  document.dispatchEvent(new CustomEvent(CALM_EVENT, { detail: { on } }));
}

/** Turn Calm mode on or off because the visitor chose it; the choice is remembered. */
export function setCalm(on: boolean): void {
  saveChoice(on ? 'on' : 'off');
  apply(on);
}

export function onCalmChange(callback: (on: boolean) => void): void {
  document.addEventListener(CALM_EVENT, (event) => callback((event as CustomEvent<{ on: boolean }>).detail.on));
}

/** If the visitor hasn't chosen, keep following the system setting while the page is open. */
export function followSystemSetting(): void {
  reducedMotion().addEventListener('change', (event) => {
    if (readChoice() === null) apply(event.matches);
  });
}

/** Wire up every Calm mode switch on the page (`<input data-calm-switch>`). */
export function bindCalmSwitches(): void {
  const switches = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-calm-switch]'));
  if (!switches.length) return;
  const sync = () => switches.forEach((s) => (s.checked = isCalm()));
  sync();
  switches.forEach((s) => s.addEventListener('change', () => setCalm(s.checked)));
  onCalmChange(sync);
  followSystemSetting();
}
