/**
 * Prints the CV to PDF, one A4 page with real text:
 *
 *   node tools/cv/render.mjs [preview.png]
 *
 * Opens ./cv.html, waits for the fonts, refuses to print if the page runs past A4 or breaks the
 * site's rules (type scale, strokes, interpuncts, overflow, contrast), and writes
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

  // The site's rules, checked on the page: sizes from the scale, no strokes, no interpuncts,
  // nothing past its column, text at 4.5:1 on whatever surface it sits on
  const broken = await page.evaluate(() => {
    const SCALE = [12, 14, 18, 32];
    const out = [];
    const rgb = (c) => c.match(/[\d.]+/g).map(Number);
    const lum = ([r, g, b]) =>
      [r, g, b]
        .map((v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const surface = (el) => {
      for (; el; el = el.parentElement) {
        const c = rgb(getComputedStyle(el).backgroundColor);
        if (c.length === 3 || c[3] === 1) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    for (const el of document.querySelectorAll('main *, aside *')) {
      const cs = getComputedStyle(el);
      const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className : '');
      if (parseFloat(cs.borderTopWidth) || parseFloat(cs.borderLeftWidth) || cs.boxShadow !== 'none') out.push(name + ': stroke');
      const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
      if (!text) continue;
      if (!SCALE.includes(parseFloat(cs.fontSize))) out.push(name + ': font ' + cs.fontSize);
      if (/·/.test(el.textContent)) out.push(name + ': interpunct');
      const a = lum(rgb(cs.color)), b = lum(surface(el));
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < 4.5) out.push(name + ': contrast ' + ratio.toFixed(2));
      const col = el.closest('main, aside');
      const lim = col.getBoundingClientRect().right - parseFloat(getComputedStyle(col).paddingRight);
      if (el.getBoundingClientRect().right > lim + 0.5) out.push(name + ': past its column');
    }
    return [...new Set(out)];
  });
  if (broken.length) throw new Error('The CV breaks the rules:\n  ' + broken.join('\n  '));

  mkdirSync(outDir, { recursive: true });
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  if (preview) await page.screenshot({ path: preview });
  console.log('wrote', out);
} finally {
  await browser.close();
}
