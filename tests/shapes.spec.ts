import { test, expect } from '@playwright/test';
import shapes from '../src/lib/anatomy-shapes.json' with { type: 'json' };
import strings from '../src/i18n/en.json' with { type: 'json' };
import { anatomyFigureSvg, CONDITIONS } from '../src/lib/anatomy-figure';

type ShapeItem = string | { d: string } | { ellipse: number[] } | { rect: number[] };

// The 3D model is built from src/lib/anatomy-shapes.json. These checks make sure every shape there
// is drawn identically in the 2D figure, so the 3D model and the figures can never drift apart.
test('every 3D source shape is drawn exactly in the figure', () => {
  const svgs = CONDITIONS.map((condition) => anatomyFigureSvg({ condition, labels: false }, strings.figure)).join('');
  const missing: string[] = [];
  for (const [name, value] of Object.entries(shapes)) {
    if (name.startsWith('_') || name === 'unitsPerMm' || name === 'mcrae') continue;
    // Shapes that differ by condition (tonsil, fluid behind the cord) are a map of condition to path.
    const byCondition = typeof value === 'object' && !('d' in value) && !('ellipse' in value) && !('rect' in value);
    const items: ShapeItem[] = byCondition ? Object.values(value as Record<string, string>) : [value as ShapeItem];
    for (const item of items) {
      let needle: string;
      if (typeof item === 'string') needle = `d="${item}"`;
      else if ('d' in item) needle = `d="${item.d}"`;
      else if ('ellipse' in item) {
        const [cx, cy, rx, ry] = item.ellipse;
        needle = `cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`;
      } else {
        const [x, y, w, h, r] = item.rect;
        needle = `x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
      }
      if (!svgs.includes(needle)) missing.push(name);
    }
  }
  expect(missing).toEqual([]);
});

test('the McRae line in the shapes matches the figure', () => {
  const svg = anatomyFigureSvg({ condition: 'chiari', labels: false, measure: true }, strings.figure);
  const [bx, by] = shapes.mcrae.basion, [ox, oy] = shapes.mcrae.opisthion;
  expect(svg).toContain(`<line x1="${bx}" y1="${by}" x2="${ox}" y2="${oy}"`);
});
