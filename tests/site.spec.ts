import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Every page that exists so far. Add new pages here as they're built.
const pages = ['/', '/explorer/', '/evidence/', '/explain/', '/studies/', '/prep/', '/model/', '/support/', '/kit/', '/impact/', '/about/', '/privacy/', '/es/'];
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
    await page.getByRole('button', { name: 'Brainstem' }).click();
    await expect(card.getByRole('heading')).toHaveText('Brainstem');
    await expect(page.getByRole('button', { name: 'Brainstem' })).toHaveAttribute('aria-pressed', 'true');
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
    await expect(page.locator('[data-figure="wide"] svg')).toHaveAttribute('viewBox', '50 70 480 570');
  });

  test('phone: condition grid, parts list and Layers panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/explorer/');
    await page.locator('.x-cond-grid label', { hasText: 'After surgery' }).click();
    await expect(page.getByRole('radio', { name: 'After surgery' })).toBeChecked();
    await expect(page.locator('[data-cond-note-short]')).toHaveText('Bone is removed at the back of the opening to make room. Most people improve or stabilize; results vary.');

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
    const viewer = page.getByRole('img', { name: /Midline section of the head and neck, Chiari I/ });
    await expect(viewer).toBeVisible();
    await expect(page.locator('[data-figure="wide"]')).toBeHidden();
    await expect(page.getByText('Drag to rotate · Scroll to zoom · Shift-drag to move')).toBeVisible();
    await page.locator('.x-cond-list label', { hasText: 'Typical anatomy' }).click();
    await expect(page.getByRole('img', { name: /typical anatomy: the cerebellar tonsils sit above/ })).toBeVisible();
  });

  test('required captions and credits are on the page', async ({ page }) => {
    await page.goto('/explorer/');
    await expect(page.getByText('Illustration, not a medical image').first()).toBeVisible();
    await expect(page.getByText('Fluid flow simplified').first()).toBeVisible();
    await expect(page.getByText('Not medical advice.')).toBeVisible();
    await expect(page.locator('footer')).toContainText('3D model by Open Chiari, CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP).');
  });
});
