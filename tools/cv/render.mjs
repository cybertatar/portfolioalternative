/**
 * Prints the CV to PDF, one A4 page with real text:
 *
 *   node tools/cv/render.mjs [preview.png]
 *
 * Opens ./cv.html, waits for the fonts, refuses to print if the page runs past A4, and writes
 * sketches/cv/Tyncherov_Daniil_Product_Designer_RU.pdf. With a path, also saves a picture of the
 * page there to look at. Needs Playwright.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '../../sketches/cv');
const out = join(outDir, 'Tyncherov_Daniil_Product_Designer_RU.pdf');
const preview = process.argv[2];

// A4 at 96 dpi
const A4 = { width: 794, height: 1123 };

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: A4, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(join(here, 'cv.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const font = await page.evaluate(() => document.fonts.check('500 13px "Golos Text"'));
  if (!font) throw new Error('Golos Text did not load: the PDF would fall back to a system font');

  // Every column must end inside the sheet, above its own bottom padding
  const over = await page.evaluate((h) =>
    [...document.querySelectorAll('main, aside')]
      .map((el) => ({
        tag: el.tagName,
        bottom: Math.max(...[...el.children].map((c) => c.getBoundingClientRect().bottom)),
        limit: h - parseFloat(getComputedStyle(el).paddingBottom),
      }))
      .filter((c) => c.bottom > c.limit),
  A4.height);
  if (over.length) throw new Error('The CV runs past A4: ' + JSON.stringify(over));

  mkdirSync(outDir, { recursive: true });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  if (preview) await page.screenshot({ path: preview });
  console.log('wrote', out);
} finally {
  await browser.close();
}
