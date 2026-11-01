/**
 * Renders the link preview (og:image) the messengers show for the site:
 *
 *   node tools/og/render.mjs
 *
 * Serves sketches/ the way the deploy does, opens the menu in Russian at 1200×630 on the
 * «Персонаж» world, lays ./og.css and the card below over it (photo and the latest quest's cover
 * taken from the page itself) and writes sketches/img/og.png. Needs Playwright.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const site = join(root, 'sketches');
const out = join(site, 'img/og.png');
const TYPES = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.json': 'application/json' };

const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    // As the deploy does it: the sketch gets its doctype and charset
    return res.end('<!doctype html>\n<html lang="ru">\n<meta charset="utf-8" />\n' + readFileSync(join(site, 'pause.html'), 'utf8'));
  }
  const file = normalize(join(site, path));
  if (!file.startsWith(site) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const { port } = server.address();

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${port}/?lang=ru`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
await page.addStyleTag({ content: readFileSync(join(here, 'og.css'), 'utf8') });
await page.evaluate(() => {
  const name = document.querySelector('.hero h2').textContent.trim();
  const role = document.querySelector('.hero .cls').textContent.trim();
  // «веб-сервисы» never breaks at its hyphen
  const bio = document.querySelector('.sheet .bio').textContent.trim().replace(/\s+/g, ' ').replace('веб-', 'веб\u2011');
  const cover = document.querySelector('#last .lq-cover').cloneNode(true);
  // The quest's Russian name as the list of quests gives it, and its headline result
  const quest = 'Редизайн приложения ПСБ';
  const [num, what] = ['В 4 раза', 'быстрее подключить<br>кешбэк'];
  const og = document.createElement('div');
  og.className = 'og';
  og.innerHTML =
    `<div class="pane face"><img src="img/portrait.webp" alt=""></div>` +
    `<div class="pane card" style="--tone: rgba(110, 125, 140, 0.42)">` +
    `<p class="kicker">${role}<span class="on">Открыт к предложениям</span></p>` +
    `<h1>${name}</h1><p class="bio">${bio}</p>` +
    `<div class="quest"><div class="thumb"></div><div><small>Последний квест</small>` +
    `<b>${quest}</b></div><p class="win"><b>${num}</b>${what}</p></div></div>`;
  og.querySelector('.thumb').append(cover);
  document.body.append(og);
});
await page.waitForTimeout(800);
await page.screenshot({ path: out });
await browser.close();
server.close();
console.log('wrote', out);
