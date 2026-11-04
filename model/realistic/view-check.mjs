// Checks what the Explorer actually draws for the realistic model (a preview build served locally, never deployed):
// on the midline cut, from the side, with flow marks and labels off, every place where a flow mark would sit must
// show the fluid's blue. This catches drawing problems the geometry checks can't see, such as another structure's
// cut face painted over the fluid.
// Run: PUBLIC_REALISTIC_PREVIEW=1 npm run build && npx astro preview --port 4330 &  then  node model/realistic/view-check.mjs [url]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4330/explorer/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(url);
await page.waitForSelector('.x-view.has-3d', { timeout: 30000 });
await page.locator('[data-model="realistic"]:visible').first().click();
await page.waitForFunction(() => document.querySelector('[data-model="realistic"]')?.getAttribute('aria-busy') === 'false', null, { timeout: 60000 });
for (const name of ['Labels', 'Fluid flow', 'Measure']) {
  const b = page.locator('.x-toolbar').getByRole('button', { name });
  if ((await b.getAttribute('aria-pressed')) === 'true') await b.click();
}
const problems = [];
for (const c of ['typical', 'chiari', 'syrinx', 'surgery']) {
  await page.locator(`input[name="condition-wide"][value="${c}"]`).evaluate((r) => r.click());
  await page.locator('[data-cut]').first().evaluate((r) => { r.value = '50'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-camera="side"]:visible').first().click();
  await page.waitForTimeout(1500);
  const box = await page.locator('[data-viewer]').first().boundingBox();
  const shot = await page.screenshot({ clip: box });
  const { marks, px } = await page.evaluate(async ([c, png]) => {
    const v = document.querySelector('[data-viewer]').viewer;
    const marks = v.realisticLandmarks.flow[c].chevrons.map(([x, y]) => [x, y, v.project(x, y, 0)]);
    const img = new Image();
    img.src = 'data:image/png;base64,' + png;
    await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d');
    g.drawImage(img, 0, 0);
    const k = img.width / document.querySelector('[data-viewer]').clientWidth;
    const px = marks.map(([, , p]) => Array.from(g.getImageData(Math.round(p.x * k), Math.round(p.y * k), 1, 1).data.slice(0, 3)));
    return { marks, px };
  }, [c, shot.toString('base64')]);
  marks.forEach(([x, y], i) => {
    const [r, g, b] = px[i];
    const blue = b - r >= 20; // the fluid's blue (about 145, 180, 200) against beige, pink, cream or bone
    console.log(`${c.padEnd(8)} fluid at (${x}, ${y}) mm shows rgb(${r}, ${g}, ${b}) ${blue ? 'fluid' : 'NOT FLUID'}`);
    if (!blue) problems.push(`${c}: the fluid at (${x}, ${y}) mm is covered on screen (rgb ${r}, ${g}, ${b})`);
  });
}
await browser.close();
if (problems.length) {
  console.error('\nFAILED: the Explorer does not show the realistic model\'s fluid where it is:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('\nThe Explorer shows the fluid wherever the model has it (at every flow-mark place, in all four views).');
