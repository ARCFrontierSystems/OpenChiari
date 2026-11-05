/**
 * Links that leave openchiari.org open in a new tab (Matthew, Nov 5), so visitors don't lose their place.
 * - rel="noopener noreferrer": the other site can't control this tab, and isn't told which page the visitor came from.
 * - Screen readers hear "(opens in a new tab)" as the link's description (aria-describedby, WCAG technique G201).
 *   It is one hidden note on the page, not text inside each link, so the links' own words (the model credit, copied
 *   text, Read aloud) stay exactly as written. No icon (DESIGN.md: no stock icons).
 * Covers links added later too (study lists, share buttons). Leaves alone: links on this site, email and phone links,
 * downloads, and links that already say where to open.
 */
const NOTE: Record<string, string> = { en: '(opens in a new tab)', es: '(se abre en una pestaña nueva)' };
const NOTE_ID = 'new-tab-note';

function mark(link: HTMLAnchorElement) {
  if (link.dataset.external || link.hasAttribute('download') || link.target) return;
  let url: URL;
  try {
    url = new URL(link.href, location.href);
  } catch {
    return;
  }
  if (!/^https?:$/.test(url.protocol) || url.hostname === location.hostname) return;
  link.dataset.external = '1';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const described = link.getAttribute('aria-describedby');
  link.setAttribute('aria-describedby', described ? `${described} ${NOTE_ID}` : NOTE_ID);
}

export function openExternalLinksInNewTabs(): void {
  if (!document.getElementById(NOTE_ID)) {
    const note = document.createElement('span');
    note.id = NOTE_ID;
    note.hidden = true;
    note.textContent = NOTE[document.documentElement.lang] ?? NOTE.en;
    document.body.append(note);
  }
  const scan = (root: ParentNode) => root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(mark);
  scan(document);
  new MutationObserver((changes) => {
    for (const change of changes) {
      for (const node of change.addedNodes) {
        if (node instanceof HTMLAnchorElement && node.href) mark(node);
        else if (node instanceof Element) scan(node);
      }
      if (change.type === 'attributes' && change.target instanceof HTMLAnchorElement) mark(change.target);
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
}
