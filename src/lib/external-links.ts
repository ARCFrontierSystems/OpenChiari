/**
 * Links that leave openchiari.org open in a new tab (Matthew, Nov 5), so visitors don't lose their place.
 * - rel="noopener noreferrer": the other site can't control this tab, and isn't told which page the visitor came from.
 * - A hidden "(opens in a new tab)" for screen readers (WCAG technique G201). No icon (DESIGN.md: no stock icons).
 * Covers links added later too (study lists, share buttons). Leaves alone: links on this site, email and phone links,
 * downloads, and links that already say where to open.
 */
const NOTE: Record<string, string> = { en: '(opens in a new tab)', es: '(se abre en una pestaña nueva)' };

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
  const note = document.createElement('span');
  note.className = 'visually-hidden';
  note.textContent = ` ${NOTE[document.documentElement.lang] ?? NOTE.en}`;
  link.append(note);
}

export function openExternalLinksInNewTabs(): void {
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
