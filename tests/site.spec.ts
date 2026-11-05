import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

// Every page that exists so far. Add new pages here as they're built.
const pages = ['/', '/explorer/', '/evidence/', '/explain/', '/v/#c1.side.f.m.x', '/explain/#v=c1.side.flow.m&x=1&a=fam&n=Hello', '/studies/', '/prep/', '/model/', '/embed/', '/support/', '/kit/', '/impact/', '/about/', '/privacy/', '/es/'];
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
  const outside: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://localhost:4322') outside.push(request.url());
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
    await page.locator('label', { hasText: 'After decompression' }).first().click();
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
    await page.locator('.x-cond-list label', { hasText: 'After decompression' }).click();
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
    await expect.poll(animating).toBe(false);
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

    // Tick everything, then check the printed sheet is still one page on Letter and A4.
    for (const box of await page.locator('[data-prep-form] input[type="checkbox"]').all()) await box.check();
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
  for (const host of outside) expect(['bobbyjonescsf.org', 'conquerchiari.org', 'www.conquerchiari.org', 'asap.org']).toContain(host);
  await expect(page.locator('main form')).toHaveCount(0);
  await page.goto('/about/');
  await expect(page.getByText('They have not been reviewed by a medical professional.', { exact: false })).toBeVisible();
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
  await expect(page.locator('[data-caption]')).toHaveText('Typical anatomy, back view. Illustration, not a medical image. Fluid flow simplified.');
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
  }
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
  expect(await width()).toBe(Math.round(box.width));
  await page.mouse.up();
  await expect.poll(width).toBe(Math.round(box.width * 2));
  await ctx.close();
});
