/**
 * Dim mode: dark, low-light colors for headache days (Matthew, 2026-11-05: its own switch, next to Calm mode,
 * and on by itself when the phone or computer is set to dark mode).
 *
 * - Shown by `data-dim="on"` on the <html> element; the colors are in tokens.css (the 3D Explorer's dark palette).
 * - The visitor's choice is saved in localStorage on their own device only (never sent anywhere).
 * - With no saved choice, Dim mode follows the system setting `prefers-color-scheme: dark`.
 * - The first decision is made by a tiny inline script in Head.astro before the page draws, so there's no flash.
 *   Keep DIM_KEY in sync with that script.
 */

export const DIM_KEY = 'openchiari-dim';

const darkScheme = () => window.matchMedia('(prefers-color-scheme: dark)');

function readChoice(): 'on' | 'off' | null {
  try {
    const value = localStorage.getItem(DIM_KEY);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    return null;
  }
}

export function isDim(): boolean {
  return document.documentElement.dataset.dim === 'on';
}

function apply(on: boolean): void {
  if (on) document.documentElement.dataset.dim = 'on';
  else delete document.documentElement.dataset.dim;
  document.querySelectorAll<HTMLInputElement>('input[data-dim-switch]').forEach((s) => (s.checked = on));
}

/** Wire up every Dim mode switch on the page (`<input data-dim-switch>`). */
export function bindDimSwitches(): void {
  const switches = Array.from(document.querySelectorAll<HTMLInputElement>('input[data-dim-switch]'));
  switches.forEach((s) => {
    s.checked = isDim();
    s.addEventListener('change', () => {
      try {
        localStorage.setItem(DIM_KEY, s.checked ? 'on' : 'off');
      } catch {
        // Storage blocked: Dim mode still works for this page view.
      }
      apply(s.checked);
    });
  });
  // With no saved choice, keep following the system setting while the page is open.
  darkScheme().addEventListener('change', (event) => {
    if (readChoice() === null) apply(event.matches);
  });
}
