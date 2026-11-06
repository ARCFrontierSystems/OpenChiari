import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// Every page that exists so far. Add new pages here as they're built.
const englishPages = ['/', '/explorer/', '/explorer/compare/', '/tour/', '/evidence/', '/explain/', '/v/#c1.side.f.m.x', '/explain/#v=c1.side.flow.m&x=1&a=fam&n=Hello', '/studies/', '/prep/', '/children/', '/model/', '/embed/', '/support/', '/kit/', '/impact/', '/about/', '/privacy/'];
// The Spanish site: the same pages under /es/ (src/pages/es/), text from src/i18n/es.json.
const spanishPages = englishPages.filter((p) => !p.includes('&n=')).map((p) => `/es${p}`);
const pages = [...englishPages, ...spanishPages];
const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

/** Simulates a browser without WebGL, so the Explorer keeps the 2D figure. */
async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test override
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return type.startsWith('webgl') ? null : original.call(this, type, ...rest);
    };
  });
}

async function setCalm(page: Page, value: 'on' | 'off') {
  await page.addInitScript((v) => localStorage.setItem('openchiari-calm', v), value);
}

// Accessibility: WCAG 2.2 AA (which includes 2.1 AA), on every page, both sizes, Calm off and on.
for (const path of pages) {
  for (const size of sizes) {
    for (const calm of ['off', 'on'] as const) {
      test(`accessibility: ${path} ${size.name} calm ${calm}`, async ({ page }) => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await setCalm(page, calm);
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
      });
    }
  }
}

test('no third-party requests from the browser', async ({ page }) => {
  // Visits every page in one test, so allow about 6 seconds a page rather than 30 seconds for all of them.
  test.setTimeout(pages.length * 6000);
  const outside: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4322') outside.push(request.url());
  });
  for (const path of pages) await page.goto(path, { waitUntil: 'networkidle' });
  expect(outside).toEqual([]);
});

test('Calm mode switch turns on, is remembered, and turns off', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.getByRole('switch', { name: 'Calm mode' });
  await expect(html).not.toHaveAttribute('data-calm', 'on');
  await expect(page.getByText('Calm mode is on.')).toBeHidden();

  await toggle.check();
  await expect(html).toHaveAttribute('data-calm', 'on');
  await expect(page.getByText('Calm mode is on.')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('font-size', '19px');

  await page.reload();
  await expect(html).toHaveAttribute('data-calm', 'on');
  await expect(toggle).toBeChecked();

  await toggle.uncheck();
  await page.reload();
  await expect(html).not.toHaveAttribute('data-calm', 'on');
});

test('Calm mode turns on by itself when the system asks for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-calm', 'on');
  await expect(page.getByRole('switch', { name: 'Calm mode' })).toBeChecked();
});

test('a visitor who turned Calm mode off keeps it off, even with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await setCalm(page, 'off');
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-calm', 'on');
});

test('phone: Calm mode button reads "Calm on" and the menu opens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByText('Calm mode', { exact: true }).click();
  await expect(page.getByText('Calm on', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Take the 2-minute tour' })).toBeHidden();
  await expect(page.getByText('In Calm mode, the model only moves when you move it.')).toBeVisible();

  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Research studies' })).toBeVisible();
});

test.describe('3D Explorer controls', () => {
  test('without 3D support: condition switch updates the 2D figure and the condition text', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await withoutWebGL(page);
    await page.goto('/explorer/');
    const figure = page.locator('[data-figure="wide"] svg');
    await expect(figure).toHaveAttribute('aria-label', /Chiari I: the cerebellar tonsils extend below/);
    await page.locator('.x-cond-list label', { hasText: 'Typical anatomy' }).click();
    await expect(page.getByRole('radio', { name: 'Typical anatomy' })).toBeChecked();
    await expect(figure).toHaveAttribute('aria-label', /typical anatomy: the cerebellar tonsils sit above/);
    await expect(page.locator('[data-cond-note]')).toContainText('The tonsils usually sit at or above the dashed line');
  });

  test('desktop: picking a structure shows its info card, and search filters the list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    const card = page.locator('.x-right .x-card');
    await expect(card).toContainText('the model shows them at their lowest point, where MRI measures them');
    const list = page.locator('.x-right .x-parts');
    await list.getByRole('button', { name: 'Brainstem' }).click();
    await expect(card.getByRole('heading')).toHaveText('Brainstem');
    await expect(list.getByRole('button', { name: 'Brainstem' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('searchbox').fill('spinal');
    await expect(page.locator('.x-right .x-parts li:visible')).toHaveCount(2);
  });

  test('without 3D support: tools toggle labels on the 2D figure', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await withoutWebGL(page);
    await page.goto('/explorer/');
    const labels = page.getByRole('button', { name: 'Labels' });
    await labels.click();
    await expect(labels).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-figure="wide"] svg')).toHaveAttribute('viewBox', '60 128 488 512');
  });

  test('part 11 (syrinx, bone removed) is listed only in its own view', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    const list = page.locator('aside.x-right');
    await expect(list.getByRole('button', { name: 'Syrinx' })).toBeHidden();
    await expect(list.getByRole('button', { name: 'Bone removed' })).toBeHidden();
    await page.locator('label', { hasText: 'Chiari I with syrinx' }).first().click();
    await list.getByRole('button', { name: 'Syrinx' }).click();
    await expect(list.locator('[data-part-name]')).toHaveText('Syrinx');
    await page.locator('label', { hasText: 'After surgery' }).first().click();
    await expect(list.getByRole('button', { name: 'Syrinx' })).toBeHidden();
    await expect(list.locator('[data-part-name]')).toHaveText('Cerebellar tonsil');
    await list.getByRole('button', { name: 'Bone removed' }).click();
    await expect(list.locator('[data-part-name]')).toHaveText('Bone removed');
  });

  test('phone: condition grid, parts list and Layers panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/explorer/');
    await page.locator('.x-cond-grid label', { hasText: 'After surgery' }).click();
    await expect(page.getByRole('radio', { name: 'After surgery' })).toBeChecked();
    await expect(page.locator('[data-cond-note-short]')).toHaveText('Bone is removed at the back of the opening to make room. Most people improve or stabilize, but results vary, some need another operation, and surgery isn\'t right for everyone.');

    const parts = page.getByRole('button', { name: /Parts list/ });
    await parts.click();
    await expect(parts).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#parts-narrow').getByRole('button', { name: 'Spinal cord' }).click();
    await expect(page.locator('#parts-narrow [data-part-name]')).toHaveText('Spinal cord');

    const layers = page.getByRole('button', { name: 'Layers' });
    await layers.click();
    await expect(page.getByRole('checkbox', { name: 'Skull and spine' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('checkbox', { name: 'Skull and spine' })).toBeHidden();
    await expect(layers).toBeFocused();
  });

  test('3D model loads, replaces the figure, and describes the view for screen readers', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    const viewer = page.getByRole('application', { name: /Midline section of the head and neck, Chiari I/ });
    await expect(viewer).toBeVisible();
    await expect(page.locator('[data-figure="wide"]')).toBeHidden();
    await expect(page.getByText('Drag to rotate · Scroll to zoom · Shift-drag to move')).toBeVisible();
    await page.locator('.x-cond-list label', { hasText: 'Typical anatomy' }).click();
    await expect(page.getByRole('application', { name: /typical anatomy: the cerebellar tonsils sit above/ })).toBeVisible();
  });

  test('3D model shows the syrinx and after-decompression views', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    await page.locator('.x-cond-list label', { hasText: 'Chiari I with syrinx' }).click();
    await expect(page.getByRole('application', { name: /Chiari I with a syrinx, a fluid-filled cavity inside the spinal cord/ })).toBeVisible();
    await expect(page.locator('[data-cond-note]')).toContainText('A syrinx is a fluid-filled cavity inside the spinal cord.');
    await page.locator('.x-cond-list label', { hasText: 'After surgery' }).click();
    await expect(page.getByRole('application', { name: /after decompression surgery: bone at the back of the skull opening/ })).toBeVisible();
    await expect(page.locator('[data-cond-note]')).toContainText("Results vary, and surgery isn't right for everyone.");
  });

  test('3D tools: labels, tapping a structure, camera buttons and keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    const card = page.locator('.x-right [data-part-name]');

    // Labels select a structure
    await page.locator('.x-labels').getByRole('button', { name: /Cerebellum/ }).click();
    await expect(card).toHaveText('Cerebellum');

    // Tapping the brainstem on the cut face selects it (its label line ends on it)
    const point = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('.x-label')];
      const i = labels.findIndex((l) => (l as HTMLElement).dataset.labelPart === 'brainstem');
      const line = document.querySelectorAll('.x-label-lines line')[i];
      const box = (line as SVGLineElement).ownerSVGElement!.getBoundingClientRect();
      return { x: box.left + Number(line.getAttribute('x2')), y: box.top + Number(line.getAttribute('y2')) };
    });
    await page.mouse.click(point.x, point.y);
    await expect(card).toHaveText('Brainstem');

    // Camera buttons and the description for screen readers
    const back = page.locator('.x-view .x-camera').getByRole('button', { name: 'Back', exact: true });
    await back.click();
    await expect(back).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('application')).toHaveAccessibleName(/Back view\. Cut at the midline\./);

    // Keyboard: 3 = below, 0 = reset to the side view
    await page.getByRole('application').focus();
    await page.keyboard.press('3');
    await expect(page.locator('.x-view .x-camera').getByRole('button', { name: 'Below', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('0');
    await expect(page.locator('.x-view .x-camera').getByRole('button', { name: 'Side', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('application')).toHaveAccessibleName(/Turned view/);
  });

  test('fluid flow animates, and stays still in Calm mode, with reduced motion, or when turned off', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    const animating = () => page.evaluate(() => (document.querySelector('[data-viewer]') as HTMLElement & { viewer: { flowAnimating: boolean } }).viewer.flowAnimating);
    await expect.poll(animating).toBe(true);
    await page.locator('.x-toolbar').getByRole('button', { name: 'Fluid flow' }).click();
    await expect.poll(animating).toBe(false);
    await page.locator('.x-toolbar').getByRole('button', { name: 'Fluid flow' }).click();
    await expect.poll(animating).toBe(true);
    await page.getByRole('switch', { name: 'Calm mode' }).check();
    // GitHub's test machines draw 3D in software and can be very busy, so the page may take a while to answer;
    // the wait is longer than usual. If it ever fails, the message says what state the page was in.
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await expect
      .poll(animating, { timeout: 15000 })
      .toBe(false)
      .catch(async (e) => {
        const state = await page.evaluate(() => ({
          calm: document.documentElement.dataset.calm ?? 'off',
          switchChecked: document.querySelector<HTMLInputElement>('[data-calm-switch]')?.checked,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        }));
        throw new Error(`${e.message}\nPage state: ${JSON.stringify(state)}; page errors: ${JSON.stringify(errors)}`);
      });
  });

  test('reduced motion: fluid flow does not animate', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await setCalm(page, 'off');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    await page.waitForTimeout(500);
    const animating = await page.evaluate(() => (document.querySelector('[data-viewer]') as HTMLElement & { viewer: { flowAnimating: boolean } }).viewer.flowAnimating);
    expect(animating).toBe(false);
  });

  test('phone: pinch zooms and two fingers move the model', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('/explorer/');
    await expect(page.locator('.x-view')).toHaveClass(/has-3d/, { timeout: 30000 });
    const state = () => page.evaluate(() => (document.querySelector('[data-viewer]') as HTMLElement & { viewer: { cameraState(): { distance: number; target: number[] } } }).viewer.cameraState());
    const box = (await page.locator('.x-3d').boundingBox())!;
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const cdp = await context.newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', points: [number, number][]) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });
    const before = await state();
    // Pinch out: fingers move apart, the model gets closer.
    await touch('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
    for (let k = 1; k <= 8; k++) await touch('touchMove', [[cx - 30 - k * 12, cy], [cx + 30 + k * 12, cy]]);
    await touch('touchEnd', []);
    const zoomed = await state();
    expect(zoomed.distance).toBeLessThan(before.distance * 0.9);
    // Two fingers moving together: the model moves.
    await touch('touchStart', [[cx - 40, cy], [cx + 40, cy]]);
    for (let k = 1; k <= 8; k++) await touch('touchMove', [[cx - 40, cy + k * 10], [cx + 40, cy + k * 10]]);
    await touch('touchEnd', []);
    const moved = await state();
    expect(Math.abs(moved.target[1] - zoomed.target[1])).toBeGreaterThan(2);
    await context.close();
  });

  test('required captions and credits are on the page', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.getByText('Illustration, not a medical image').first()).toBeVisible();
    await expect(page.getByText('Fluid flow simplified').first()).toBeVisible();
    await expect(page.getByText('Not medical advice.')).toBeVisible();
    await expect(page.locator('footer')).toContainText('3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP).');
  });
});

test.describe('Doctor visit prep', () => {
  test('ticking and adding questions updates the sheet, and the printed sheet fits on one page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prep/');
    const preview = page.locator('[data-preview-list] li');
    await expect(page.locator('[data-sheet-count]')).toHaveText('Your sheet · 6 questions');
    await expect(preview).toHaveCount(6);

    await page.getByLabel('Do I have a syrinx?').check();
    await page.getByLabel('Add your own question').fill('<b>Is my headache normal?</b>');
    await page.getByLabel('Add your own question').press('Enter');
    await expect(page.locator('[data-sheet-count]')).toHaveText('Your sheet · 8 questions');
    // The visitor's text is shown as text, never as HTML.
    await expect(preview.last()).toHaveText('<b>Is my headache normal?</b>');

    await page.getByLabel('Things I want to mention').fill('Started in March.');
    await page.getByLabel('Things I want to mention').press('Enter');
    await page.getByLabel('Things I want to mention').fill('<i>Worse when I cough</i>');
    await page.locator('[data-mention-add]').click();
    await expect(page.locator('[data-mention-list] input:checked')).toHaveCount(2);
    await expect(page.getByLabel('Things I want to mention')).toHaveValue('');
    await page.getByLabel('Include a small diagram of Chiari').uncheck();

    // Tick everything in the everyday groups, then check the printed sheet is still one page on Letter and A4.
    // (The surgery groups start folded; ticking them all as well makes a longer sheet.)
    for (const box of await page.locator('[data-prep-form] details:not([data-group^="surgery"]) input[type="checkbox"], [data-own-list] input, [data-mention-list] input').all()) await box.check();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('[data-print-sheet]')).toBeVisible();
    await expect(page.locator('[data-sheet-list] li')).toHaveCount(13);
    await expect(page.locator('[data-sheet-mention] li')).toHaveText(['Started in March.', '<i>Worse when I cough</i>']);
    await expect(page.locator('[data-sheet-diagram]')).toBeHidden();
    await expect(page.locator('.prep-form')).toBeHidden();
    for (const format of ['Letter', 'A4'] as const) {
      const pdf = (await page.pdf({ format })).toString('latin1');
      expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length, `${format} pages`).toBe(1);
    }
  });

  test('surgery groups start folded and add to the sheet; the packing list prints on its own', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/prep/');
    const before = page.locator('details[data-group="surgeryBefore"]');
    await expect(before).not.toHaveAttribute('open', '');
    await before.locator('summary').click();
    await page.getByLabel('How will my pain be managed after surgery?').check();
    await expect(page.locator('[data-sheet-count]')).toHaveText('Your sheet · 7 questions');
    // The link to Helping your child sits with the packing list, not among the questions.
    await expect(page.locator('[data-pack] .child-link a')).toHaveAttribute('href', '/children/');
    await expect(page.locator('[data-prep-form] .child-link')).toHaveCount(0);

    await page.getByLabel('Non-slip slippers').uncheck();
    await page.getByLabel('Add your own item').fill('<b>Reading glasses</b>');
    await page.getByLabel('Add your own item').press('Enter');
    await expect(page.locator('[data-pack-own-list] input:checked')).toHaveCount(1);
    await page.evaluate(() => (window.print = () => {}));
    await page.locator('[data-print-pack]').click();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('[data-print-pack-sheet]')).toBeVisible();
    await expect(page.locator('[data-print-sheet]')).toBeHidden();
    await expect(page.locator('[data-pack-sheet-list] li')).toHaveCount(12);
    // The visitor's item is printed as text, never as HTML.
    await expect(page.locator('[data-pack-sheet-list] li').last()).toHaveText('<b>Reading glasses</b>');
    await expect(page.locator('[data-pack-sheet-list]')).not.toContainText('Non-slip slippers');
    const pdf = (await page.pdf({ format: 'Letter' })).toString('latin1');
    expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(1);
  });

  test('nothing is stored or sent', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const requests: string[] = [];
    await page.goto('/prep/', { waitUntil: 'networkidle' });
    page.on('request', (r) => requests.push(r.url()));
    const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));

    await page.getByLabel('Which of my symptoms do you think come from Chiari?').uncheck();
    await page.getByLabel('Add your own question').fill('A private question');
    await page.locator('[data-own-add]').click();
    await page.getByLabel('Things I want to mention').fill('Something private');
    await page.getByLabel('Things I want to mention').press('Enter');
    await page.locator('summary', { hasText: 'Treatment' }).click();

    const after = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
    expect(after).toEqual(before);
    expect(requests).toEqual([]);
    await expect(page).toHaveURL(/\/prep\/$/);
  });
});

test('the contact address is marked so Cloudflare leaves it as plain text, and the English kit page works offline', async ({ request }) => {
  for (const path of ['/about/', '/privacy/', '/es/about/', '/es/privacy/']) {
    const html = await (await request.get(path)).text();
    expect(html, path).toMatch(/<!--email_off-->[^]*?hello@openchiari\.org[^]*?<!--\/email_off-->/);
  }
  const sw = await (await request.get('/sw.js')).text();
  expect(sw).toContain('"/kit/"');
  expect(sw).not.toContain('"/kit/poster-letter.pdf"');
});

test('What happens in surgery: steps through from Chiari I to after decompression, and Show the usual view ends it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/explorer/#c1');
  await expect(page.locator('body')).toHaveClass(/has-3d/, { timeout: 30000 });
  const panel = page.locator('[data-surgery-panel]').first();
  await expect(panel).toBeVisible();
  await panel.locator('summary').click();
  await panel.locator('[data-surgery-next]').click();
  await expect(panel.locator('[data-surgery-label]')).toHaveText('Step 1 of 5 · Before surgery');
  await expect(page.locator('input[name="condition-wide"][value="surgery"]')).toBeChecked();
  await expect(page.locator('li:has(> [data-part="removed"])').first()).toBeHidden();
  await page.locator('[data-part="cerebellum"]').first().click();
  await expect(page.locator('li:has(> [data-part="removed"])').first()).toBeHidden();
  await expect(page.locator('[data-viewer]').first()).toHaveAttribute('aria-label', /Before surgery/);
  for (let i = 0; i < 4; i++) await panel.locator('[data-surgery-next]').click();
  await expect(panel.locator('[data-surgery-label]')).toHaveText('Step 5 of 5 · Afterward');
  await expect(panel.locator('[data-surgery-next]')).toBeDisabled();
  await expect(page.locator('li:has(> [data-part="removed"])').first()).toBeVisible();
  await expect(panel).toContainText('Animation simplified.');
  await expect(panel).toContainText('Tonsils shown at their lowest point');
  await panel.locator('[data-surgery-stop]').click();
  await expect(panel.locator('[data-surgery-label]')).toHaveText('');
  // Typical anatomy has no surgery panel.
  await page.locator('label:has(input[name="condition-wide"][value="typical"])').first().click();
  await expect(page.locator('[data-surgery-panel]').first()).toBeHidden();
});

test('Support: Connect with others links to outside communities, with the not-checked note', async ({ page }) => {
  await page.goto('/support/');
  const section = page.locator('#connect');
  await expect(section.locator('li')).toHaveCount(4);
  await expect(section).toContainText("isn't checked by Open Chiari");
  await expect(section).toContainText("isn't a recommendation");
  await expect(section.locator('a[href="https://chiarisupport.org/"]')).toBeVisible();
  await expect(section.locator('a[hreflang="es"]')).toHaveAttribute('href', 'https://femacpa.com/quienes-somos');
});

test('hosting rules: standard protections on every page, and only the embed may sit inside other sites', () => {
  const rules = readFileSync(new URL('../dist/_headers', import.meta.url), 'utf8');
  for (const line of ['X-Content-Type-Options: nosniff', 'Referrer-Policy: same-origin', 'X-Frame-Options: SAMEORIGIN', 'browsing-topics=()']) expect(rules).toContain(line);
  // The AR view needs the device's spatial tracking; it must not be switched off.
  expect(rules).not.toContain('xr-spatial-tracking');
  expect(rules).toMatch(/\/embed\/\*\n  ! X-Frame-Options/);
  expect(rules).toMatch(/\/es\/embed\/\*\n  ! X-Frame-Options/);
});

test('search engines: one address per page, a sitemap with both languages, and the embed and shared views kept out', async ({ page, request }) => {
  await page.goto('/kit/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://openchiari.org/kit/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  for (const path of ['/embed/', '/es/embed/', '/v/']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const loc of ['https://openchiari.org/', 'https://openchiari.org/kit/', 'https://openchiari.org/es/kit/', 'https://openchiari.org/explorer/compare/']) expect(sitemap).toContain(`<loc>${loc}</loc>`);
  expect(sitemap).not.toMatch(/<loc>[^<]*\/(embed|v)\/<\/loc>/);
  expect(sitemap).toContain('hreflang="es" href="https://openchiari.org/es/prep/"');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://openchiari.org/sitemap.xml');
});

test('About says plainly how pages are checked: AI-assisted reviews, approved by a patient, not yet by a medical professional', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('main')).toContainText('AI-assisted reviews');
  await expect(page.locator('main')).toContainText('a patient and not a doctor');
  await expect(page.locator('main')).toContainText('Nothing on the site has been reviewed by a medical professional yet.');
  await expect(page.locator('main')).not.toContainText('independent audits');
  await page.goto('/es/about/');
  await expect(page.locator('main')).toContainText('un paciente y no un médico');
});

test('Awareness kit: copy-ready image descriptions for the graphics people post, and printables tagged for screen readers', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/kit/');
  await expect(page.locator('.items [data-copy-alt]')).toHaveCount(2);
  await page.locator('.items [data-copy-alt]').first().click();
  await expect(page.locator('.items [data-alt-done]').first()).toContainText('Paste it as the image description');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('What is Chiari malformation?');
  // Make your own: the description follows what you made, and isn't offered for print designs.
  await page.locator('[data-field="own"]').fill('Walking for Emma');
  await page.locator('[data-builder-alt]').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^Chiari Awareness\. What is Chiari malformation\? .* Walking for Emma openchiari\.org$/);
  await page.locator('input[name="design"][value="poster"]').check();
  await expect(page.locator('[data-builder-alt]')).toBeHidden();
  for (const file of ['/kit/stickers-everyone-letter.pdf', '/kit/es/poster-a4.pdf']) {
    const pdf = (await (await request.get(file)).body()).toString('latin1');
    expect(pdf, file).toContain('/StructTreeRoot');
  }
});

test('the hosting rules let browsers run only the site\'s own scripts, and the 3D Explorer still works under them', async ({ browser }) => {
  const { readFileSync } = await import('node:fs');
  const rules = readFileSync(new URL('../dist/_headers', import.meta.url), 'utf8');
  const csp = rules.match(/Content-Security-Policy: (.+)/)?.[1] ?? '';
  expect(csp).toContain("script-src 'self'");
  expect(csp).not.toMatch(/https?:/);
  // Serve the pages with that rule, plus a stand-in for a script Cloudflare could add, and check only it is refused.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.route('**/*', async (route) => {
    if (!route.request().url().startsWith('http://127.0.0.1') && !route.request().url().startsWith('http://localhost')) return route.abort();
    const response = await route.fetch();
    const headers = response.headers();
    if (!(headers['content-type'] ?? '').includes('text/html')) return route.fulfill({ response });
    const body = (await response.text()).replace('</body>', '<script defer src="https://static.cloudflareinsights.com/beacon.min.js"></script></body>');
    await route.fulfill({ response, headers: { ...headers, 'content-security-policy': csp }, body });
  });
  const page = await context.newPage();
  const refused: string[] = [];
  const errors: string[] = [];
  page.on('console', (m) => m.text().includes('Content Security Policy') && refused.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/explorer/#c1');
  await expect(page.locator('body')).toHaveClass(/has-3d/, { timeout: 30000 });
  await page.goto('/prep/');
  await page.goto('/children/');
  expect(errors).toEqual([]);
  expect(refused.length).toBeGreaterThan(0);
  expect(refused.every((m) => m.includes('cloudflareinsights'))).toBe(true);
  await context.close();
});

test('Awareness kit, Make your own: messages only from the approved list, downloads a PNG, prints as text, sends and stores nothing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/kit/', { waitUntil: 'networkidle' });
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));

  // The main message can only be one of the approved lines (cards to pick from, not a text box), each standing alone.
  const messages = page.locator('input[name="message"]');
  await expect(messages).toHaveCount(6);
  await expect(page.locator('.message-text')).toHaveText([
    'What is Chiari malformation?',
    'I have Chiari malformation.',
    'Chiari symptoms often have few outward signs. Ask how you can help.',
    /^Chiari malformation looks different/,
    /^Most people with Chiari malformation are born/,
    /^The classic sign of Chiari malformation is/,
  ]);
  // "What is Chiari malformation?" always comes with its answer, and the preview says so in words.
  await expect(page.locator('[data-builder-canvas]')).toHaveAttribute('aria-label', /What is Chiari malformation\? The lowest part of the back of the brain/);
  // Paper size is only for the designs you print.
  await expect(page.getByText('Paper size')).toBeHidden();
  // The counter counts down.
  await expect(page.locator('[data-counter]')).toHaveText('120 of 120 letters left');
  await page.locator('[data-field="own"]').fill('<b>Walking for Emma</b>');
  await page.locator('[data-field="name"]').fill('Sample group');
  await expect(page.locator('[data-counter]')).toHaveText('97 of 120 letters left');
  // The picture of Chiari, when added, brings its caption and the model credit into the description.
  await page.locator('[data-field="figure"]').check();
  await expect(page.locator('[data-builder-canvas]')).toHaveAttribute('aria-label', /With the picture of Chiari\./);
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-builder-download]').click()]);
  expect(download.suggestedFilename()).toBe('open-chiari-square.png');

  await page.locator('input[name="design"][value="poster"]').check();
  await expect(page.locator('[data-out="own"]')).toHaveText('<b>Walking for Emma</b>');
  await expect(page.locator('[data-poster]')).toContainText('3D model by Open Chiari');
  await expect(page.locator('[data-poster]')).toContainText('Not medical advice.');
  await page.evaluate(() => (window.print = () => {}));
  await page.locator('[data-builder-print]').click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-poster]')).toBeVisible();
  await expect(page.locator('.builder-form')).toBeHidden();
  const pdf = (await page.pdf({ format: 'Letter', printBackground: true })).toString('latin1');
  expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(1);
  await page.emulateMedia({ media: 'screen' });

  await page.locator('input[name="design"][value="stickers"]').check();
  await expect(page.getByText('Paper size')).toBeVisible();
  // Stickers start with words, offer the approved phrases, and keep to 3 lines.
  await expect(page.locator('[data-sticker-text]').first()).toHaveText('Chiari warrior');
  await page.locator('[data-starter="Brave brain"]').click();
  await expect(page.locator('[data-sticker-text]').first()).toHaveText('Brave brain');
  await page.locator('[data-field="sticker"]').fill('Team Emma');
  await page.locator('[data-field="sticker"]').pressSequentially('\nb\nc\nd');
  expect((await page.locator('[data-field="sticker"]').inputValue()).split('\n')).toHaveLength(3);
  await page.locator('[data-field="sticker"]').fill('Team Emma');
  await expect(page.locator('[data-sticker-text]')).toHaveCount(12);
  await expect(page.locator('[data-sticker-text]').first()).toHaveText('Team Emma');

  const after = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
  expect(after).toEqual(before);
  expect(requests.filter((u) => !u.startsWith('blob:'))).toEqual([]);
});

test('Make your own: very long words wrap instead of running off the picture or the poster', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/kit/', { waitUntil: 'networkidle' });
  await page.locator('[data-field="own"]').fill('gsgausgaudgasiudgiadpfgiaoudfghpaighdfpaiusghfpuiashfpasiuhf[aioshf[oaishf[oasihf[aiosfha[siofgaf');
  await page.locator('[data-field="name"]').fill('x'.repeat(80));
  await page.locator('[data-field="when"]').fill('https://www.example.org/a-very-long-event-address-with-no-spaces-at-all');
  // The right-hand margin of the picture stays plain background, from top to bottom (square and story, with and
  // without the picture of Chiari).
  const marginClear = () =>
    page.locator('[data-builder-canvas]').evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const pad = c.height > c.width ? 104 : 84;
      const strip = ctx.getImageData(c.width - pad + 8, 0, pad - 8, c.height).data;
      const [r, g, b] = [strip[0], strip[1], strip[2]];
      for (let i = 0; i < strip.length; i += 4) if (Math.abs(strip[i] - r) + Math.abs(strip[i + 1] - g) + Math.abs(strip[i + 2] - b) > 12) return false;
      return true;
    });
  for (const design of ['square', 'story']) {
    await page.locator(`input[name="design"][value="${design}"]`).check();
    for (const figure of [false, true]) {
      await page.locator('[data-field="figure"]').setChecked(figure);
      await expect.poll(marginClear).toBe(true);
    }
  }
  await page.locator('input[name="design"][value="poster"]').check();
  const overflowing = await page.locator('[data-poster] p').evaluateAll((ps) => ps.filter((p) => p.scrollWidth > p.clientWidth + 1).length);
  expect(overflowing).toBe(0);
});

test('Make your own on a phone: no sideways scrolling, and the preview stays in view while you fill it in', async ({ page }) => {
  for (const path of ['/kit/', '/es/kit/']) {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await page.locator('[data-field="when"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-builder-canvas]')).toBeInViewport();
    const size = page.locator('[data-preview-size]');
    await size.click();
    await expect(size).toHaveAttribute('aria-pressed', 'true');
  }
});

test('Home: the tools include Helping your child, the Awareness kit and Connect with others', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tools li')).toHaveCount(10);
  for (const href of ['/children/', '/kit/', '/support/#connect']) await expect(page.locator(`.tools a[href="${href}"]`)).toHaveCount(1);
});

test('links that leave the site open in a new tab, say so to screen readers, and pass no referrer; links on the site do not', async ({ page }) => {
  for (const [path, note] of [['/support/', '(opens in a new tab)'], ['/es/support/', '(se abre en una pestaña nueva)']] as const) {
    await page.goto(path);
    const outside = page.locator('main a[href^="https://"]');
    expect(await outside.count()).toBeGreaterThan(4);
    for (const link of await outside.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toHaveAttribute('aria-describedby', /new-tab-note/);
      // The link's own words are unchanged; the note is a separate description.
      expect(await link.textContent()).not.toContain(note);
    }
    for (const link of await page.locator('a[href^="/"]').all()) await expect(link).not.toHaveAttribute('target', '_blank');
    await expect(page.locator('#new-tab-note')).toHaveText(note);
  }
});

test('header: four tools in order, and More opens the rest by mouse and keyboard, closing with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.locator('.nav-wide > a')).toHaveText(['3D Explorer', 'Explain It', 'Visit prep', 'Research studies']);
  const more = page.locator('.more-button');
  const panel = page.locator('#more-panel');
  await expect(panel).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.locator('a')).toHaveText(['Reading your MRI report', 'Helping your child', 'Awareness kit', 'Open model', 'Connect with others', 'Support Chiari organizations']);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(more).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.mouse.click(10, 600);
  await expect(panel).toBeHidden();
  // Home: the tools are back at the bottom (Nov 5); the explanation comes right after the opening picture.
  const order = await page.locator('main > section').evaluateAll((s) => s.map((el) => el.getAttribute('aria-labelledby') ?? el.className));
  expect(order.at(-1)).toBe('tools');
  expect(order.indexOf('what-is')).toBe(1);
});

test.describe('Helping your child', () => {
  test('the school sheet prints what was typed, as text only, and nothing is stored or sent', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const requests: string[] = [];
    await page.goto('/children/', { waitUntil: 'networkidle' });
    page.on('request', (r) => requests.push(r.url()));
    const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));

    await page.getByLabel("Child's first name").fill('<b>Sam</b>');
    await page.getByLabel('Surgery date').fill('December 2');
    await page.getByLabel('Rest breaks').check();
    await page.getByLabel('Other', { exact: true }).fill('A seat near the door');
    await page.evaluate(() => (window.print = () => {}));
    await page.locator('[data-print-part="school"]').click();
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('[data-print-only="school"]')).toBeVisible();
    await expect(page.locator('[data-print-only="story"]')).toBeHidden();
    await expect(page.locator('[data-school-title]')).toHaveText("About <b>Sam</b>'s Chiari surgery");
    await expect(page.locator('[data-school-helps] li')).toHaveText(['Rest breaks', 'A seat near the door']);
    await expect(page.locator('[data-print-only="school"]')).toContainText('3D model by Open Chiari');
    const pdf = (await page.pdf({ format: 'Letter' })).toString('latin1');
    expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(1);

    const after = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, cookies: document.cookie }));
    expect(after).toEqual(before);
    expect(requests).toEqual([]);
    await expect(page).toHaveURL(/\/children\/$/);
  });

  test('the story and coloring page carry the required captions, and the coloring page is line art', async ({ page }) => {
    await page.goto('/children/');
    await expect(page.locator('.story-page figcaption').first()).toHaveText('Illustration, not a medical image.');
    await expect(page.locator('.story-page figcaption').nth(2)).toContainText('Tonsils shown at their lowest point');
    const fills = await page.locator('[data-color-preview] svg [fill]').evaluateAll((els) =>
      [...new Set(els.map((e) => e.getAttribute('fill')).filter((f) => f !== 'none'))],
    );
    expect(fills).toEqual(['#FFFFFF']);
    await page.evaluate(() => (window.print = () => {}));
    await page.locator('[data-print-part="color"]').click();
    await page.emulateMedia({ media: 'print' });
    const pdf = (await page.pdf({ format: 'Letter' })).toString('latin1');
    expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(2);
  });
});

test('the realistic model is available: its button is on, its files are in the site, and it loads', async ({ page, request }) => {
  // Matthew approved it for the public site on 2026-11-04 (CLAUDE.md rule 1a; docs/audits/).
  for (const level of ['desktop', 'phone']) {
    const res = await request.get(`/models/realistic/realistic-${level}.glb`);
    expect(res.status()).toBe(200);
  }
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  const button = page.locator('[data-model="realistic"]:visible').first();
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAttribute('aria-busy', 'false', { timeout: 60000 });
  // its own labels and flow marks came with it
  const hasLandmarks = await page.evaluate(() => !!(document.querySelector('[data-viewer]') as HTMLElement & { viewer: { realisticLandmarks: unknown } }).viewer.realisticLandmarks);
  expect(hasLandmarks).toBe(true);
});

test('Support links only to the organizations themselves; About says how content is checked, honestly', async ({ page }) => {
  // CLAUDE.md: no donation handling (every button goes to the organization's own page) and no claim of a
  // medical review (rule 1a: the "Accuracy checks" wording).
  await page.goto('/support/');
  const outside = await page.locator('main a[href^="http"]').evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).hostname));
  expect(outside.length).toBeGreaterThanOrEqual(6);
  // The organizations, and (Connect with others) the communities they and others run.
  for (const host of outside) expect(['bobbyjonescsf.org', 'conquerchiari.org', 'www.conquerchiari.org', 'asap.org', 'chiarisupport.org', 'www.inspire.com', 'femacpa.com']).toContain(host);
  await expect(page.locator('main form')).toHaveCount(0);
  await page.goto('/about/');
  await expect(page.getByText('Nothing on the site has been reviewed by a medical professional yet.', { exact: false })).toBeVisible();
});

test('Open model: the embed builder writes the code, and the downloads are there', async ({ page, request }) => {
  await page.goto('/model/');
  const code = page.locator('[data-embed-code]');
  await expect(code).toContainText('embed/#v=c1&switch=1&labels=1"');
  await page.getByLabel('Starting view').selectOption('surgery');
  await page.getByLabel('Show labels').uncheck();
  await page.getByLabel('Start in Calm mode').check();
  await expect(code).toContainText('embed/#v=dec&switch=1&calm=1"');
  await expect(code).toContainText('title="Chiari malformation 3D model"');
  for (const href of await page.locator('a[download]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')))) {
    const res = await request.get(href!);
    expect(res.status(), href!).toBe(200);
    expect((await res.body()).length).toBeGreaterThan(100_000);
  }
});

test('embed: follows its settings, and always shows the captions, credit and disclaimer', async ({ page }) => {
  await page.goto('/embed/#v=syr&switch=1&calm=1');
  await expect(page.locator('html')).toHaveAttribute('data-calm', 'on');
  await expect(page.locator('[data-switch]')).toBeVisible();
  await expect(page.locator('input[name="condition"][value="syrinx"]')).toBeChecked();
  await expect(page.getByText('Illustration, not a medical image')).toBeVisible();
  await expect(page.getByText('Not medical advice.')).toBeVisible();
  await expect(page.getByText('BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP)', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the full 3D model' })).toBeVisible();
  // calm=1 is for this view only: the visitor's own saved choice isn't changed
  expect(await page.evaluate(() => localStorage.getItem('openchiari-calm'))).toBeNull();
  await page.goto('/embed/#v=typ');
  await expect(page.locator('[data-switch]')).toBeHidden();
});

test('Explain It: carries the view from the Explorer; the link is short and holds no note', async ({ page }) => {
  const NOTE = 'Private test note 7Q2';
  const sent: string[] = [];
  page.on('request', (r) => sent.push(r.url() + ' ' + (r.postData() ?? '')));
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  await page.getByRole('radio', { name: 'Typical anatomy' }).first().check({ force: true });
  await page.locator('[data-camera="back"]:visible').first().click();
  await page.locator('a.x-explain').first().click();
  await page.waitForURL(/\/explain\/#typ\.back/);
  await expect(page.locator('[data-summary]')).toHaveText(/^Typical anatomy · back view/);
  await expect(page.getByText('Who is it for?')).toHaveCount(0);
  await expect(page.getByLabel('Your note')).toHaveValue(/^In Chiari malformation, the lowest part of the cerebellum/);
  await page.getByLabel('Your note').fill(NOTE);
  await expect(page.locator('[data-count]')).toHaveText(`${NOTE.length} / 280`);
  await page.getByLabel('Let them rotate and explore on their own').uncheck();
  const link = await page.locator('[data-link]').inputValue();
  expect(link).toMatch(/\/v\/#typ\.back(\.|$)/);
  expect(link).not.toContain('7Q2');
  expect(link.split('#')[1].split('.')).not.toContain('x');
  expect(link.length).toBeLessThan(60);
  expect(new URL(link).search).toBe('');
  // The note goes in the message, with the link under it.
  const sms = await page.locator('[data-sms]').getAttribute('href');
  expect(decodeURIComponent(sms!.replace(/^sms:\?&body=/, ''))).toBe(`${NOTE}\n\n${link}`);
  const mail = await page.locator('[data-email]').getAttribute('href');
  expect(decodeURIComponent(mail!.replace(/^mailto:\?body=/, ''))).toBe(`${NOTE}\n\n${link}`);
  await page.goto(link);
  await expect(page.getByText('Someone shared this with you')).toBeVisible();
  await expect(page.locator('[data-shared-note]')).toBeHidden();
  await expect(page.locator('[data-caption]')).toHaveText('Typical anatomy, back view. Illustration, not a medical image. Fluid flow simplified. Tonsils shown at their lowest point, where MRI measures them.');
  await expect(page.getByRole('link', { name: 'Explore the full 3D model' })).toHaveAttribute('href', /\/explorer\/#typ\.back/);
  // In a page that scrolls, swiping up or down over the model scrolls the page; sideways turns it.
  await page.goto(link.replace('#typ.back', '#typ.back.x'));
  await expect(page.locator('[data-recipient] canvas')).toHaveCSS('touch-action', 'pan-y', { timeout: 30000 });
  for (const s of sent) expect(s).not.toContain('7Q2');
});

test('Explain It: the note is shown as text, the note is limited to 280 characters, and the Chiari I explanation shows', async ({ page }) => {
  const evil = '<img src=x onerror="window.__hacked=1">Hi';
  await page.goto('/explain/#v=c1.side.flow.m&x=1&a=fam&n=' + encodeURIComponent(evil));
  await expect(page.locator('[data-shared-note]')).toHaveText(evil);
  await expect(page.locator('[data-shared-note] img')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __hacked?: number }).__hacked)).toBeUndefined();
  await expect(page.getByText('The blue bracket shows how far.', { exact: false })).toBeVisible();
  await expect(page.locator('[data-caption]')).toContainText('Drag to turn the model.');
  await page.goto('/explain/#v=c1.side&a=fam&n=' + 'a'.repeat(400));
  await expect(page.locator('[data-shared-note]')).toHaveText('a'.repeat(280));
  // Measure off: the explanation that points at the bracket isn't used; the view's own note is.
  await expect(page.getByText('The tonsils extend below the opening', { exact: false })).toBeVisible();
  await page.goto('/explain/');
  await expect(page.getByLabel('Your note')).toHaveAttribute('maxlength', '280');
  // A short link with a hand-turned camera, a cut and hidden layers reads back the same.
  await page.goto('/v/#syr.custom.m.o-30,12,150.c35.hskin+bone');
  await expect(page.locator('[data-caption]')).toHaveText(/^Chiari I with syrinx, /);
  await expect(page.locator('[data-caption]')).not.toContainText('Drag to turn the model.');
  // A look-only model never takes the finger from the page, so swiping over it scrolls.
  await expect(page.locator('[data-recipient] canvas')).toHaveCSS('touch-action', 'auto', { timeout: 30000 });
  await expect(page.getByRole('link', { name: 'Explore the full 3D model' })).toHaveAttribute('href', /#syr\.custom\.m\.x\.o-30,12,150\.c35\.hskin\+bone$/);
});

test('Research studies: the list, its filters and Near sorting work on the device, and nothing is sent', async ({ page }) => {
  const data = JSON.parse(readFileSync(new URL('../src/data/studies.json', import.meta.url), 'utf8'));
  const sent: string[] = [];
  await page.goto('/studies/', { waitUntil: 'networkidle' });
  page.on('request', (r) => sent.push(r.url()));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Research studies looking for people with Chiari');
  if (!data.studies.length) {
    // No saved list: a link to the registry's own search instead.
    await expect(page.getByRole('link', { name: /search for recruiting Chiari studies on ClinicalTrials\.gov/ })).toBeVisible();
    return;
  }
  const cards = page.locator('[data-study]');
  await expect(cards).toHaveCount(data.studies.length);
  await expect(page.locator('[data-count]')).toHaveText(data.studies.length === 1 ? '1 study recruiting' : `${data.studies.length} studies recruiting`);
  await expect(page.getByText(/Study data from ClinicalTrials\.gov, processed \w+ \d+, \d{4}\. Summaries simplified by Open Chiari\./)).toBeVisible();
  // Every card links to its official listing.
  for (const s of data.studies) await expect(page.locator(`a[href="https://clinicaltrials.gov/study/${s.nct}"]`).first()).toBeAttached();

  // Who can join: Children shows only studies that take children.
  await page.getByLabel('Children', { exact: true }).check();
  const kids = data.studies.filter((s: { children: boolean }) => s.children).length;
  await expect(cards.locator('visible=true')).toHaveCount(kids);
  await page.getByLabel('Any age').check();

  // Condition: unticking both leaves nothing, with a message.
  await page.getByLabel('Chiari malformation').uncheck();
  await page.getByLabel('Syringomyelia').uncheck();
  await expect(cards.locator('visible=true')).toHaveCount(0);
  await expect(page.getByText('No studies match these filters.')).toBeVisible();
  await page.getByLabel('Chiari malformation').check();
  await page.getByLabel('Syringomyelia').check();

  // Near: a study with a site in the typed state moves to the top.
  const withState = data.studies.find((s: { sites: { state: string; country: string }[] }) => s.sites.some((x) => x.state && x.country === 'United States'));
  if (withState) {
    const state = withState.sites.find((x: { state: string; country: string }) => x.state && x.country === 'United States').state;
    await page.getByLabel('Near').fill(state);
    const firstPlaces = await cards.first().getAttribute('data-places');
    expect(firstPlaces!.toLowerCase()).toContain(`|${state.toLowerCase()}|`);
    await expect(page.locator('[data-near-result]')).toHaveText('Closest first.');
  }
  // A place with no study site nearby says so, rather than seeming to do nothing; clearing the box clears the message.
  await page.getByLabel('Near').fill('Zzyzx');
  await expect(page.locator('[data-near-result]')).toHaveText('None of these studies has a site near “Zzyzx”. Each study shows where it takes place.');
  // A US ZIP is never matched to a postal code abroad that happens to share its digits.
  const abroad = data.studies.flatMap((s: { sites: { zip: string; country: string }[] }) => s.sites).find((x: { zip: string; country: string }) => /^\d{5}$/.test(x.zip) && x.country !== 'United States');
  const hasUs = data.studies.some((s: { sites: { country: string }[] }) => s.sites.some((x) => x.country === 'United States'));
  if (abroad && !hasUs) {
    await page.getByLabel('Near').fill(abroad.zip);
    await expect(page.locator('[data-near-result]')).toHaveText(`None of these studies has a site near “${abroad.zip}”. Each study shows where it takes place.`);
  }
  await page.getByLabel('Near').fill('');
  await expect(page.locator('[data-near-result]')).toHaveText('');
  expect(sent).toEqual([]);
});

test('phones: the 3D view draws at lower resolution only while a finger turns it, then sharp again', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  const canvas = page.locator('[data-viewer] canvas');
  const box = (await canvas.boundingBox())!;
  const width = () => canvas.evaluate((el: HTMLCanvasElement) => el.width);
  expect(await width()).toBe(Math.round(box.width * 2));
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 5 });
  // At most 1 device pixel per CSS pixel while moving (the speed guard may go lower on a slow machine)...
  const moving = await width();
  expect(moving).toBeLessThanOrEqual(Math.round(box.width));
  await page.mouse.up();
  // ...and sharper again once the finger lifts (2, or 1.5 if the speed guard stepped in).
  await expect.poll(width).toBeGreaterThanOrEqual(Math.round(box.width * 1.5));
  await ctx.close();
});

test('phones: the Realistic switch is with the view tools, and loads the lighter model', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const models: string[] = [];
  page.on('request', (r) => r.url().endsWith('.glb') && models.push(r.url()));
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  const toggle = page.locator('[data-model-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveAttribute('aria-busy', 'false', { timeout: 60000 });
  expect(models.some((u) => u.endsWith('/realistic-phone.glb'))).toBe(true);
  await ctx.close();
});

test('counters: on openchiari.org only the name of an action is sent, never the note, the view or the link', async ({ playwright }) => {
  // Make the browser believe it's on openchiari.org (counts are sent only from there), pointing at the test server.
  const browser = await playwright.chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ['--host-resolver-rules=MAP openchiari.org 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  const sent: string[] = [];
  const other: string[] = [];
  await page.route('**/api/count', (route) => {
    sent.push(route.request().postData() ?? '');
    return route.fulfill({ status: 204 });
  });
  // The study link is answered with "204 No Content", so the browser stays on the page. (Blocking it instead showed an
  // error page a moment later, which could interrupt the next page the test opened.)
  await page.route('https://clinicaltrials.gov/**', (route) => route.fulfill({ status: 204 }));
  page.on('request', (r) => !r.url().startsWith('http://openchiari.org:4322/') && !r.url().startsWith('https://clinicaltrials.gov/') && other.push(r.url()));
  const site = 'http://openchiari.org:4322';

  // Arriving from outside counts one visit; making an Explain It link counts once, without the note.
  await page.goto(`${site}/explain/#c1.side.f.m`);
  await page.getByLabel('Your note').fill('Secret note 9Z');
  await page.locator('[data-copy]').click().catch(() => {});
  await page.locator('[data-qr-open]').click();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent.map((s) => JSON.parse(s))).toEqual([{ e: 'visit' }, { e: 'explain' }]);

  // Moving to another page of the site isn't a new visit; opening a study listing counts once.
  await page.goto(`${site}/studies/`, { referer: `${site}/explain/` });
  const listing = page.locator('a[href^="https://clinicaltrials.gov/study/"]').first();
  if (await listing.count()) {
    await listing.click({ noWaitAfter: true }).catch(() => {});
    await expect.poll(() => sent.length).toBe(3);
    expect(JSON.parse(sent[2])).toEqual({ e: 'study' });
  }

  // An embedded model counts the address of the site showing it, and nothing else.
  const before = sent.length;
  await page.goto(`${site}/embed/#v=c1`, { referer: 'https://www.example.org/some/page?x=1' });
  await expect.poll(() => sent.length).toBe(before + 1);
  expect(JSON.parse(sent[before])).toEqual({ e: 'embed', site: 'www.example.org' });

  for (const s of sent) expect(s).not.toMatch(/9Z|#|c1\.side|http/);
  expect(other).toEqual([]);
  await browser.close();
});

test('counters: nothing is sent from any other address (tests, previews, copies of the site)', async ({ page }) => {
  const sent: string[] = [];
  page.on('request', (r) => r.url().includes('/api/count') && sent.push(r.url()));
  await page.goto('/explain/#c1.side.f.m');
  await page.locator('[data-qr-open]').click();
  await page.goto('/embed/', { referer: 'https://www.example.org/' });
  await page.waitForTimeout(500);
  expect(sent).toEqual([]);
});

test('counter server: adds 1 only for known actions from openchiari.org, keeps only totals and embedding sites', async () => {
  const { onRequestPost } = await import('../functions/api/count.js');
  const { onRequestGet } = await import('../functions/api/totals.js');
  const counts = new Map<string, number>();
  const sites = new Set<string>();
  const env = {
    COUNTS: {
      prepare: (sql: string) => ({
        bind: (...args: string[]) => ({
          run: async () => {
            if (sql.startsWith('INSERT INTO counts')) counts.set(args[0], (counts.get(args[0]) ?? 0) + 1);
            else if (sql.startsWith('INSERT OR IGNORE INTO embed_sites')) sites.add(args[0]);
          },
        }),
        all: async () => ({ results: [...counts].map(([name, n]) => ({ name, n })) }),
        first: async () => ({ n: sites.size }),
      }),
    },
  };
  const post = (body: string, origin = 'https://openchiari.org') =>
    onRequestPost({ request: new Request('https://openchiari.org/api/count', { method: 'POST', body, headers: { Origin: origin } }), env });

  for (const r of [
    await post('{"e":"visit"}'),
    await post('{"e":"visit"}', 'https://www.openchiari.org'),
    await post('{"e":"explain"}'),
    await post('{"e":"visit"}', 'https://evil.example'), // not from the site: ignored
    await post('{"e":"note","n":"secret"}'), // unknown action: ignored
    await post('not json'),
    await post('{"e":"embed","site":"www.ConquerChiari.org"}'),
    await post('{"e":"embed","site":"conquerchiari.org"}'),
    await post('{"e":"embed","site":"openchiari.org"}'), // our own site isn't an embedding site
    await post('{"e":"embed","site":"https://bad host/"}'),
  ]) expect(r.status).toBe(204);
  expect(Object.fromEntries(counts)).toEqual({ visit: 2, explain: 1 });
  expect([...sites]).toEqual(['conquerchiari.org']);
  const totals = await (await onRequestGet({ env })).json();
  expect(totals).toEqual({ visit: 2, explore: 0, explain: 1, study: 0, embedSites: 1 });
});

test('Evidence notes: the page publishes EVIDENCE.md, and each Explorer view links to its own section', async ({ page }) => {
  await withoutWebGL(page);
  await page.goto('/explorer/');
  const link = page.locator('a[data-evidence]:visible').first();
  await expect(link).toHaveAttribute('href', /\/evidence\/#3d-model-shapes$/);
  await page.locator('input[name="condition-wide"][value="syrinx"]').evaluate((r: HTMLInputElement) => r.click());
  await expect(link).toHaveAttribute('href', /\/evidence\/#syrinx$/);
  await page.locator('input[name="condition-wide"][value="surgery"]').evaluate((r: HTMLInputElement) => r.click());
  await expect(link).toHaveAttribute('href', /\/evidence\/#after-decompression$/);
  await link.click();
  await expect(page).toHaveURL(/\/evidence\/#after-decompression$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Evidence notes');
  for (const name of ['Medical claims', '3D model shapes', 'Syrinx', 'After decompression']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
  }
  // Every row's sources are real links out, and the page has no sideways scrolling on a phone.
  await expect(page.locator('.md a[href^="https://"]').first()).toBeAttached();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('side by side: two conditions, each with its note; "Rotate together" keeps the views in step', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/explorer/');
  await page.getByRole('link', { name: 'Side by side' }).click();
  await expect(page).toHaveURL(/\/explorer\/compare\/$/);
  await expect(page.locator('.cmp-side.has-3d')).toHaveCount(2, { timeout: 30000 });
  const notes = page.locator('[data-note]');
  await expect(notes.nth(0)).toHaveText(/^Tonsils usually sit at or above the dashed line/);
  await expect(notes.nth(1)).toHaveText(/^Tonsils extend below the line \(blue bracket\)/);
  await page.getByRole('combobox', { name: 'Right view condition' }).selectOption('surgery');
  await expect(notes.nth(1)).toHaveText(/^Bone is removed at the back of the opening/);
  await expect(page.locator('.cmp-foot a').first()).toHaveAttribute('href', /#after-decompression$/);

  const orbit = (i: number) => page.locator('[data-viewer]').nth(i).evaluate((el) => (el as HTMLElement & { viewer: { orbit(): { az: number; el: number } } }).viewer.orbit());
  const drag = async (i: number) => {
    const box = (await page.locator('[data-viewer]').nth(i).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
  };
  // Together: turning the left view turns the right one the same way.
  await drag(0);
  const [a, b] = [await orbit(0), await orbit(1)];
  expect(Math.abs(a.az)).toBeGreaterThan(5);
  expect(Math.abs(a.az - b.az)).toBeLessThan(0.5);
  // Apart: only the view you turn moves.
  await page.getByLabel('Rotate together').uncheck();
  const before = await orbit(1);
  await drag(0);
  expect(Math.abs((await orbit(1)).az - before.az)).toBeLessThan(0.5);
  expect(Math.abs((await orbit(0)).az - before.az)).toBeGreaterThan(5);
  // Required captions and credit.
  await expect(page.getByText('Illustration, not a medical image', { exact: false })).toBeVisible();
  await expect(page.getByText('CC BY-SA 4.0', { exact: false })).toBeVisible();
});

test('guided tour: five steps, each sets the view; Back, Next and Finish work, and Home links to it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Take the 2-minute tour' }).first().click();
  await expect(page).toHaveURL(/\/tour\/$/);
  await expect(page.locator('body.has-3d')).toBeAttached({ timeout: 30000 });
  const bar = page.getByRole('progressbar', { name: 'Tour progress' });
  const title = page.getByRole('heading', { level: 1 });
  await expect(page.getByText('Step 1 of 6')).toBeVisible();
  await expect(title).toHaveText('Meet the model');
  await expect(page.getByRole('button', { name: 'Back' })).toBeHidden();
  await page.getByRole('button', { name: 'Next: typical anatomy' }).click();
  await page.getByRole('button', { name: 'Next: the tonsils sit too low' }).click();
  // Step 3 is the approved mockup step, word for word.
  await expect(page.getByText('Step 3 of 6')).toBeVisible();
  await expect(title).toHaveText('The tonsils sit too low');
  await expect(page.getByText('The dashed line runs across the opening at the base of the skull. In Chiari, the tonsils, the lowest part of the cerebellum, extend below it, shown by the blue bracket.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next: how fluid flows' })).toBeVisible();
  await expect(bar).toHaveAttribute('aria-valuenow', '3');
  await expect(title).toBeFocused();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(title).toHaveText('Typical anatomy');
  await page.getByRole('button', { name: 'Next: the tonsils sit too low' }).click();
  await page.getByRole('button', { name: 'Next: how fluid flows' }).click();
  await page.getByRole('button', { name: 'Next: a syrinx' }).click();
  await expect(title).toHaveText('A syrinx');
  await expect(page.locator('[data-viewer]')).toHaveAttribute('aria-label', /syrinx/i);
  // Step 6 (Nov 5): after surgery, with the Explorer's approved text.
  await page.getByRole('button', { name: 'Next: after surgery' }).click();
  await expect(title).toHaveText('After surgery');
  await expect(page.getByText('Step 6 of 6')).toBeVisible();
  await expect(page.locator('[data-viewer]')).toHaveAttribute('aria-label', /after decompression/i);
  await expect(page.getByText('Results vary, and surgery isn\'t right for everyone.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Finish tour' })).toHaveAttribute('href', '/explorer/');
  await expect(page.getByText('Illustration, not a medical image', { exact: false })).toBeVisible();
});

test('Home "Start here": four ways in, and "Surgery is coming up" opens Visit prep with the surgery questions ticked', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('navigation', { name: 'Start here' });
  await expect(start.getByRole('link')).toHaveText(['I just got my MRI report', 'Surgery is coming up', "It's my child", 'I want to explain it to someone']);
  await start.getByRole('link', { name: 'Surgery is coming up' }).click();
  await expect(page).toHaveURL(/\/prep\/#for=surgery$/);
  await expect(page.locator('[data-quick="surgery"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('details[data-group="surgeryBefore"]')).toHaveAttribute('open', '');
  await expect(page.locator('details[data-group="diagnosis"] input:checked')).toHaveCount(0);
});

test('Visit prep: quick-starts tick the right questions and say so; a blank symptom diary prints on its own', async ({ page }) => {
  await page.goto('/prep/');
  await page.locator('[data-quick="first"]').click();
  await expect(page.locator('[data-quick-done]')).toHaveText('Ticked 7 questions for: A first visit.');
  await expect(page.locator('details[data-group="surgeryBefore"] input:checked')).toHaveCount(0);
  await expect(page.locator('[data-sheet-list] li')).toHaveCount(7);
  // Your own questions stay, and ticking by hand clears the quick-start's pressed state.
  await page.locator('#own-question').fill('Can I keep playing soccer?');
  await page.locator('[data-own-add]').click();
  await page.locator('[data-quick="home"]').click();
  await expect(page.locator('[data-sheet-list]')).toContainText('Can I keep playing soccer?');
  await page.locator('details[data-group="surgeryHome"] input[data-question]').first().uncheck();
  await expect(page.locator('[data-quick][aria-pressed="true"]')).toHaveCount(0);
  // The diary: a blank table, printed sideways, without the questions sheet.
  await page.evaluate(() => (window.print = () => {}));
  await page.locator('[data-print-diary]').click();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.print-diary')).toBeVisible();
  await expect(page.locator('.print-sheet')).toBeHidden();
  await expect(page.locator('.print-diary th')).toHaveText(['Date and time', 'What happened', 'How long it lasted', 'How strong (0–10)', 'What I was doing, and what helped']);
  await expect(page.locator('.print-diary tbody tr')).toHaveCount(10);
  await page.emulateMedia({ media: 'screen' });
});

test('Visit prep: "When to call after surgery" sits in the going-home group and prints when a going-home question is ticked', async ({ page }) => {
  await page.goto('/prep/');
  const box = page.locator('details[data-group="surgeryHome"] .warning');
  await expect(box).toHaveCount(1);
  await expect(box.locator('h3')).toHaveText('When to call after surgery');
  await expect(box).toContainText('Call 911 or your local emergency number');
  await expect(page.locator('[data-sheet-warning]')).toBeHidden();
  await page.locator('[data-quick="home"]').click();
  await page.evaluate(() => (window.print = () => {}));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-sheet-warning]')).toBeVisible();
  await expect(page.locator('[data-sheet-warning]')).toContainText('call the surgical team right away');
  await page.emulateMedia({ media: 'screen' });
  await page.locator('[data-quick="first"]').click();
  await expect(page.locator('[data-sheet-warning]')).toBeHidden();
});

test('Reading your MRI report: every term has a heading and a 3D link that opens the matching view', async ({ page }) => {
  await page.goto('/mri/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reading your MRI report');
  const terms = page.locator('.term');
  expect(await terms.count()).toBeGreaterThan(8);
  await expect(page.locator('.term-index a')).toHaveCount(await terms.count());
  await page.locator('.term#syrinx .see-it').click();
  await expect(page).toHaveURL(/\/explorer\/#syr\./);
  await expect(page.locator('input[name="condition-wide"][value="syrinx"]')).toBeChecked();
});

test('Explorer: close-up view, zoom to a part, show only or hide a part, and links that keep the part', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/explorer/');
  await expect(page.locator('body')).toHaveClass(/has-3d/, { timeout: 30000 });
  await page.locator('.x-view [data-camera="close"]').first().click();
  await expect(page.locator('.x-view [data-camera="close"]').first()).toHaveAttribute('aria-pressed', 'true');
  const card = page.locator('.x-card-wide');
  await card.locator('[data-focus="only"]').click();
  await expect(card.locator('[data-focus="only"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(card.locator('[data-focus="all"]')).toBeVisible();
  await card.locator('[data-focus="all"]').click();
  await expect(card.locator('[data-focus="all"]')).toBeHidden();
  await card.locator('[data-part-zoom]').click();
  // A link keeps the selected part and "show only" (opened fresh, as someone receiving it would).
  const other = page;
  await other.goto('about:blank');
  await other.goto('/explorer/#syr.side.psyrinx.io');
  await expect(other.locator('.x-card-wide [data-part-name]')).toHaveText('Syrinx');
  await expect(other.locator('.x-card-wide [data-focus="only"]')).toHaveAttribute('aria-pressed', 'true');
  // The MRI page's terms open their structure.
  await other.goto('/mri/');
  await expect(other.locator('#foramen .see-it')).toHaveAttribute('href', '/explorer/#typ.side.l.pforamen');
});

test('Explorer: one tap between typical and the condition shown, flow pause and slow, and side by side on the realistic model', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/explorer/');
  await expect(page.locator('body')).toHaveClass(/has-3d/, { timeout: 30000 });
  const sw = page.locator('[data-switcher]');
  await expect(sw).toHaveText('Show typical');
  await sw.click();
  await expect(page.locator('input[name="condition-wide"][value="typical"]')).toBeChecked();
  await expect(sw).toHaveText('Show Chiari I');
  await sw.click();
  await expect(page.locator('input[name="condition-wide"][value="chiari"]')).toBeChecked();
  await page.locator('[data-flow-pause]').click();
  await expect(page.locator('[data-flow-pause]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.x-toolbar [data-toggle="flow"]').first().click();
  await expect(page.locator('[data-flow-pause]')).toBeHidden();
  await page.goto('/explorer/compare/');
  await expect(page.locator('[data-realistic-switch]')).toBeVisible({ timeout: 30000 });
});

test('Explorer: "How close is this to real anatomy?" shows the checked numbers for the condition on show', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/explorer/');
  const panel = page.locator('.x-right [data-accuracy]');
  await panel.locator('summary').click();
  await expect(panel.locator('.x-acc-row dt').first()).toHaveText('Tonsil tip');
  await expect(panel).toContainText('About 12 mm below the dashed line');
  await page.locator('.x-cond-list label', { hasText: 'Typical anatomy' }).click();
  await expect(panel).toContainText('About 1 mm above the dashed line');
  await expect(panel).toContainText('13 to 15 mm in adults');
});

test('Reading your MRI report: a real side-view MRI with numbered markers that match the 3D labels, credited, linked from the Explorer', async ({ page, request }) => {
  await page.goto('/mri/');
  const view = page.locator('#mri-view');
  await expect(view.getByRole('heading', { level: 2 })).toHaveText('What a side-view MRI looks like');
  await expect(view.locator('.mri-marker')).toHaveCount(7);
  await expect(view.locator('.mri-legend li')).toHaveCount(7);
  await expect(view.locator('.mri-legend li').first()).toContainText('Cerebrum');
  await expect(view.locator('.mri-legend a').first()).toHaveAttribute('href', '/explorer/#typ.side.l.pcerebrum');
  await expect(view).toContainText('OpenNeuro ds004507');
  await expect(view).toContainText("aren't marked");
  expect((await request.get('/mri/sagittal-t2.png')).status()).toBe(200);
  await page.goto('/explorer/');
  await expect(page.locator('.x-caption a', { hasText: 'Compare with a real MRI' })).toHaveAttribute('href', '/mri/#mri-view');
});

test('Explorer: the slider\'s middle label sits exactly over the midline position, in English and Spanish', async ({ page }) => {
  // Lining the slider up with a label that sat left of the middle gave a cut 10 mm to one side, which misses the syrinx.
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ['/explorer/', '/es/explorer/']) {
    await page.goto(path);
    const offset = await page.evaluate(() => {
      const s = document.querySelector('[data-cut]')!.getBoundingClientRect();
      const m = document.querySelector('[data-cut-scale] span:nth-child(2)')!.getBoundingClientRect();
      return Math.abs(m.left + m.width / 2 - (s.left + s.width / 2));
    });
    expect(offset).toBeLessThan(2);
    await expect(page.locator('[data-cut]')).toHaveAttribute('list', 'cut-midline');
  }
});

test('Explorer: cut front to back (coronal) or across (axial), on the realistic model, described, and kept in links', async ({ page }) => {
  test.setTimeout(120000); // loads the realistic model
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/explorer/');
  await expect(page.locator('body')).toHaveClass(/has-3d/, { timeout: 30000 });
  const left = page.locator('.x-left');
  await left.locator('[data-plane="coronal"]').click();
  await expect(left.locator('[data-plane="coronal"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-model="realistic"]').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.x-view [data-camera="back"]').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-viewer]')).toHaveAttribute('aria-label', /Cut front to back \(coronal\), seen from behind/);
  await expect(left.locator('[data-cut-scale] span')).toHaveText(['Front', 'Skull opening', 'Back']);
  await left.locator('[data-plane="axial"]').click();
  await expect(page.locator('.x-view [data-camera="below"]').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-viewer]')).toHaveAttribute('aria-label', /Cut across \(axial\), seen from below/);
  // Back to the Simple model means back to the side cut.
  await page.locator('[data-model="simple"]').first().click();
  await expect(left.locator('[data-plane="sagittal"]')).toHaveAttribute('aria-pressed', 'true');
  // A link keeps the direction.
  await page.goto('about:blank');
  await page.goto('/explorer/#c1.back.kc');
  await expect(page.locator('.x-left [data-plane="coronal"]')).toHaveAttribute('aria-pressed', 'true');
});

test('Awareness kit: every graphic and printable downloads, and the ZIP carries the credit', async ({ page, request }) => {
  await page.goto('/kit/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Awareness kit');
  const hrefs = await page.locator('a[download]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
  expect(hrefs).toEqual(expect.arrayContaining([
    '/kit/open-chiari-awareness-kit.zip', '/kit/social-post.png', '/kit/quote-card-square.png', '/kit/quote-card-story.png',
    '/kit/wallet-cards.pdf', '/kit/poster-letter.pdf', '/kit/poster-a4.pdf',
  ]));
  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect((await res.body()).length, href).toBeGreaterThan(1000);
  }
  // The quote card uses the wording approved after the source check, and the license line is shown.
  await expect(page.locator('img[alt^="Chiari symptoms often have few outward signs."]')).toBeVisible();
  await expect(page.getByText('Kit graphics are free to use and share, CC BY-SA 4.0.', { exact: false })).toBeVisible();
});

test('Spanish site: every page is in Spanish, says the translation is pending review, and links to the same page in English', async ({ page }) => {
  for (const path of ['/es/', '/es/explorer/', '/es/tour/', '/es/explorer/compare/', '/es/prep/', '/es/kit/']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    const notice = page.locator('.translation-notice');
    await expect(notice).toContainText('Traducción pendiente de revisión por un traductor médico.');
    await expect(notice.getByRole('link', { name: 'Ver en inglés' })).toHaveAttribute('href', path.slice(3));
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `https://openchiari.org${path.slice(3)}`);
    // Required on every page (CLAUDE.md rules 1 and 3), in Spanish.
    // (A visible copy: the kit page also has one inside its hidden print poster.)
    await expect(page.getByText('No es consejo médico.', { exact: false }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('Modelo 3D de Open Chiari, CC BY-SA 4.0, adaptado de', { exact: false }).first()).toBeAttached();
  }
  // English pages show no notice, and their language link opens the same page in Spanish.
  await page.goto('/prep/');
  await expect(page.locator('.translation-notice')).toHaveCount(0);
  await expect(page.locator('a[hreflang="es"]').first()).toHaveAttribute('href', '/es/prep/');
  // Links inside the Spanish site stay in Spanish.
  await page.goto('/es/');
  await expect(page.getByRole('link', { name: 'Abrir el explorador 3D' })).toHaveAttribute('href', '/es/explorer/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vea lo que pasa en la base del cráneo.');
});

test('Spanish site: the 3D Explorer and Explain It work in Spanish, and Explain It makes a Spanish link', async ({ page }) => {
  await page.goto('/es/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.x-toolbar').getByRole('button', { name: 'Flujo del líquido' })).toBeVisible();
  await page.goto('/es/explain/#c1.side.f.m');
  await expect(page.getByLabel('Su nota')).toHaveValue(/^En la malformación de Chiari/);
  expect((await page.getByLabel('Su nota').inputValue()).length).toBeLessThanOrEqual(280);
  expect(await page.locator('[data-link]').inputValue()).toMatch(/\/es\/v\/#c1\.side/);
  await page.goto('/es/v/#c1.side.f.m.x');
  await expect(page.locator('[data-recipient]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lo que está viendo' })).toBeVisible();
  await expect(page.locator('[data-caption]')).toContainText('Ilustración, no es una imagen médica.');
});

test('Spanish site: the kit offers the Spanish files, and the studies show Spanish summaries', async ({ page, request }) => {
  await page.goto('/es/kit/');
  const hrefs = await page.locator('a[download]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/kit\/es\//);
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
    expect((await res.body()).length, href).toBeGreaterThan(1000);
  }
  await page.goto('/es/studies/');
  const first = page.locator('[data-study]').first();
  if (await first.count()) await expect(first.locator('.summary')).toContainText(/Los investigadores|De la ficha oficial|Resumen en inglés/);
});

test('Dim mode: follows the system dark setting, has its own switch that is remembered, and passes the accessibility scan', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-dim', 'on');
  for (const path of ['/', '/studies/', '/prep/', '/about/', '/es/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${path} ${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  }
  const dim = page.getByRole('switch', { name: /^Modo oscuro/ });
  await expect(dim).toBeChecked();
  await dim.uncheck();
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-dim', 'on');
  await ctx.close();
  // Light system setting: off until switched on.
  const light = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await light.goto('/');
  await expect(light.locator('html')).not.toHaveAttribute('data-dim', 'on');
  await light.getByRole('switch', { name: /^Dim mode/ }).check();
  await light.goto('/prep/');
  await expect(light.locator('html')).toHaveAttribute('data-dim', 'on');
});

test('Read aloud: Listen buttons appear where the browser can speak, and switch to Stop while reading', async ({ page }) => {
  await page.addInitScript(() => {
    // A stand-in voice, so the test doesn't depend on the machine's speech engine.
    const spoken: string[] = [];
    (window as unknown as { spoken: string[] }).spoken = spoken;
    const voices = [{ lang: 'en-US', localService: true }, { lang: 'es-US', localService: true }];
    class Utterance {
      text: string; lang = ''; voice: unknown = null; rate = 1; onend: null | (() => void) = null;
      constructor(text: string) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance });
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: (u: Utterance) => spoken.push(u.text), cancel: () => {}, getVoices: () => voices, addEventListener: () => {} },
    });
  });
  await page.goto('/');
  const listen = page.locator('button[data-listen]').first(); // the same button while it reads "Stop"
  await expect(listen).toBeVisible();
  await expect(listen).toHaveText(/Listen/);
  await listen.click();
  await expect(listen).toHaveAttribute('aria-pressed', 'true');
  await expect(listen).toHaveText(/Stop/);
  const spoken = await page.evaluate(() => (window as unknown as { spoken: string[] }).spoken);
  expect(spoken[0]).toBe('What is Chiari malformation?');
  expect(spoken.join(' ')).toContain('The cerebellum helps control balance and coordination.');
  // Desktop wording only, not both versions.
  expect(spoken.filter((s) => s.startsWith('The lowest part of the cerebellum')).length).toBe(1);
  await listen.click();
  await expect(listen).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/es/tour/');
  await expect(page.getByRole('button', { name: 'Escuchar' })).toBeVisible();
});

test('Explain It picture: makes a picture of the view with its captions, without the note', async ({ page }) => {
  await page.goto('/explain/#c1.side.f.m');
  await page.getByLabel('Your note').fill('Private note 4K');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Picture' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('open-chiari-chiari.png');
  const buf = readFileSync((await file.path())!);
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  expect(buf.length).toBeGreaterThan(20000);
  await expect(page.locator('[data-status]')).toHaveText('The picture was saved to your downloads.');
});

test('offline: the offline helper saves the site and opens pages without a connection', async ({ browser }) => {
  // On openchiari.org the site starts the helper itself (Head.astro); here the test starts it, on the test server's
  // own address (which browsers treat as secure, as service workers need).
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).some((k) => k.startsWith('openchiari-'))), { timeout: 20000 }).toBe(true);
  // Every page is saved up front; the visitor counter never is.
  const saved = await page.evaluate(async () => {
    const cache = await caches.open((await caches.keys()).find((k) => k.startsWith('openchiari-'))!);
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(saved).toEqual(expect.arrayContaining(['/', '/prep/', '/explorer/', '/es/', '/es/tour/']));
  expect(saved.some((p) => p.startsWith('/api/'))).toBe(false);
  await ctx.setOffline(true);
  await page.goto('/prep/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepare for your next appointment');
  await page.goto('/es/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vea lo que pasa en la base del cráneo.');
  await ctx.close();
});

test('See it in your room: shown only where the device supports it; the model is cut at the midline and becomes an AR file', async ({ page }) => {
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('[data-ar]').first()).toBeHidden(); // no AR on this test browser
  // The model for the room view: the half that stays at the midline cut, in millimetres.
  const model = await page.evaluate(async () => {
    const host = document.querySelector('[data-viewer]') as HTMLElement & { viewer: { arModel(): Promise<{ children: { geometry: { attributes: { position: { array: Float32Array } } } }[] }> } };
    const group = await host.viewer.arModel();
    let maxZ = -Infinity, n = 0;
    for (const child of group.children) {
      const a = child.geometry.attributes.position.array;
      for (let i = 2; i < a.length; i += 3) maxZ = Math.max(maxZ, a[i]);
      n++;
    }
    return { n, maxZ };
  });
  expect(model.n).toBeGreaterThan(10);
  expect(model.maxZ).toBeLessThan(0.1);

  // On an iPhone (pretended here), the button makes a USDZ file for Apple's viewer.
  await page.addInitScript(() => {
    const supports = DOMTokenList.prototype.supports;
    DOMTokenList.prototype.supports = function (token: string) {
      return token === 'ar' || supports.call(this, token);
    };
    HTMLAnchorElement.prototype.click = function () {
      if (this.rel === 'ar') (window as unknown as { arLink: string }).arLink = this.href;
    };
  });
  await page.reload();
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  const button = page.locator('.x-toolbar [data-ar]');
  await expect(button).toBeVisible();
  await expect(button).toHaveText('See it in your room');
  await button.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { arLink?: string }).arLink ?? ''), { timeout: 30000 }).toMatch(/^blob:/);
  const file = await page.evaluate(async () => {
    const link = (window as unknown as { arLink: string }).arLink;
    const buf = new Uint8Array(await (await fetch(link.split('#')[0])).arrayBuffer());
    return { size: buf.length, zip: buf[0] === 0x50 && buf[1] === 0x4b, banner: decodeURIComponent(link.split('#')[1]) };
  });
  expect(file.zip).toBe(true);
  expect(file.size).toBeGreaterThan(100000);
  expect(file.banner).toContain('Illustration, not a medical image');
});

test('3D-printable plaques: offered on the Open model page, with credit, license and both plaques', async ({ page, request }) => {
  await page.goto('/model/');
  const link = page.locator('a[href="/downloads/openchiari-print.zip"]');
  await expect(link).toBeVisible();
  const res = await request.get('/downloads/openchiari-print.zip');
  expect(res.status()).toBe(200);
  const body = await res.body();
  for (const name of ['openchiari-midline-typical.stl', 'openchiari-midline-chiari.stl', 'README.txt', 'LICENSE.md']) expect(body.includes(Buffer.from(name))).toBe(true);
});

test('How do you say it: the pronunciations are on Home, in both languages', async ({ page }) => {
  await page.goto('/');
  const say = page.locator('.say');
  await expect(say.getByRole('heading', { name: 'How do you say it?' })).toBeVisible();
  for (const s of ['key-AR-ee', 'key-AR-ee mal-fore-MAY-shun', 'suh-ring-go-my-EE-lee-uh', 'SEER-inks']) await expect(say.getByText(s, { exact: true })).toBeVisible();
  await expect(say).toContainText('Hans Chiari first described Chiari malformations at the end of the 1800s.');
  await page.goto('/es/');
  await expect(page.locator('.say')).toContainText('(en inglés)');
});

test('Explorer: the size line shows with the 12 mm views, and the cough plays and is announced', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/explorer/');
  await expect(page.locator('.x-view.has-3d')).toBeVisible({ timeout: 30000 });
  const size = page.locator('.x-card-wide [data-size-note]');
  await expect(size).toBeVisible(); // Chiari I, Measure on
  await expect(size).toHaveText(/^The usual cutoff, about 5 mm, is half a centimeter, about the height of 3 stacked quarters\./);
  await page.getByRole('radio', { name: 'Typical anatomy' }).first().check({ force: true });
  await expect(size).toBeHidden();
  const panel = page.locator('.x-cough-wide');
  await expect(panel).toBeVisible();
  await panel.locator('summary').click();
  await expect(panel).toContainText("Researchers don't all agree on how this works");
  await expect(panel).toContainText('Animation simplified.');
  const button = panel.getByRole('button', { name: 'Cough' });
  // The first message shows for under a second, so record every message as it is set (polling can miss it on a slow
  // machine) and check both were announced, in order.
  await panel.locator('[data-cough-status]').evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { coughSeen: string[] }).coughSeen = seen;
    new MutationObserver(() => seen.push(el.textContent ?? '')).observe(el, { childList: true, characterData: true, subtree: true });
  });
  await button.click();
  await expect(panel.locator('[data-cough-status]')).toHaveText('Then it flows back down.', { timeout: 10000 });
  await expect(button).toBeEnabled({ timeout: 10000 });
  expect(await page.evaluate(() => (window as unknown as { coughSeen: string[] }).coughSeen)).toEqual([
    'During the cough: some spinal fluid moves up from the spine into the head.',
    'Then it flows back down.',
  ]);
  // Not offered for the syrinx and after-surgery views.
  await page.getByRole('radio', { name: 'Chiari I with syrinx' }).first().check({ force: true });
  await expect(panel).toBeHidden();
  await expect(size).toBeVisible();
});
