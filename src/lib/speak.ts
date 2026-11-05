/**
 * Read aloud: the device's own built-in voice reads a part of the page (Web Speech API, speechSynthesis).
 * Nothing is sent anywhere by the site; the voice is the phone's or computer's own. Only text already on the page
 * (approved in docs/COPY.md) is read.
 *
 * Buttons: <button data-listen="CSS selector of what to read">; without a selector, the button's own <section>.
 * The button is shown only where the browser can speak. One reading at a time; another button or leaving the page
 * stops it.
 */

const READABLE = 'h1, h2, h3, p, li, dt, dd, blockquote, figcaption';

/** The visible text of an area, block by block (each block is read as its own sentence group). */
function blocks(area: Element): string[] {
  const all = Array.from(area.querySelectorAll<HTMLElement>(READABLE)).filter(
    (el) => !el.closest('[data-listen-skip], [hidden], [aria-hidden="true"]') && (el.checkVisibility?.() ?? el.offsetParent !== null),
  );
  // Only the innermost readable blocks, so nested ones aren't read twice.
  const leaves = all.filter((el) => !all.some((other) => other !== el && el.contains(other)));
  return leaves
    .map((el) => {
      // Of the desktop and phone versions inside a block, read only the one on show.
      const clone = el.cloneNode(true) as HTMLElement;
      el.querySelectorAll<HTMLElement>('.only-wide, .only-narrow').forEach((part, i) => {
        if (!(part.checkVisibility?.() ?? part.offsetParent !== null)) clone.querySelectorAll('.only-wide, .only-narrow')[i]?.remove();
      });
      return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
    })
    .filter(Boolean);
}

let current: HTMLButtonElement | null = null;

function setPlaying(button: HTMLButtonElement, on: boolean): void {
  button.setAttribute('aria-pressed', String(on));
  const label = button.querySelector('[data-listen-label]');
  if (label) label.textContent = on ? button.dataset.stopText! : button.dataset.listenText!;
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
  if (current) setPlaying(current, false);
  current = null;
}

function speak(button: HTMLButtonElement, area: Element): void {
  stopSpeaking();
  const lang = document.documentElement.lang === 'es' ? 'es-US' : 'en-US';
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)));
  const parts = blocks(area);
  if (!parts.length) return;
  current = button;
  setPlaying(button, true);
  parts.forEach((text, i) => {
    // One utterance per block: long single utterances are cut off by some browsers.
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = document.documentElement.dataset.calm === 'on' ? 0.9 : 1;
    if (i === parts.length - 1) u.onend = () => current === button && stopSpeaking();
    window.speechSynthesis.speak(u);
  });
}

export function bindListenButtons(root: ParentNode = document): void {
  if (!('speechSynthesis' in window)) return;
  root.querySelectorAll<HTMLButtonElement>('button[data-listen]').forEach((button) => {
    if (button.dataset.listenBound) return;
    button.dataset.listenBound = '1';
    button.hidden = false;
    button.addEventListener('click', () => {
      if (current === button) return stopSpeaking();
      const area = button.dataset.listen ? document.querySelector(button.dataset.listen) : button.closest('section');
      if (area) speak(button, area);
    });
  });
  window.addEventListener('pagehide', stopSpeaking);
}
