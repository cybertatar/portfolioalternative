// Favicon: the swordsman's head from the party sprites (tools/case-psb/mascots.js), happy face,
// on a lavender tile like the team avatars (img/tools/team-*.svg). Writes to sketches/img:
//   favicon.svg, favicon-32.png — 16×16 sprite pixels edge to edge, crisp at 16 and 32 px;
//   apple-touch-icon.png — 180 px for the iOS home screen, on a 20×20 tile with air (9 px a pixel).
// Run: node tools/favicon/render.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { palette, sprites } = require('../case-psb/mascots.js');

const OUT = path.join(__dirname, '../../sketches/img');
const TILE = '#d8cfe8';
const SKIP = new Set(['s', 'S', 'l', 'L']); // the sword behind his shoulder
const TAB = { crop: { x: 4, y: 1, w: 16, h: 16 }, size: 16, radius: 3 }; // less the hair's right shade column
const HOME = { crop: { x: 4, y: 1, w: 17, h: 16 }, size: 20, radius: 0 }; // iOS rounds it itself, clear corners turn black

function pixelAt(face, body, x, y) {
  const ch = face[y][x] !== '.' ? face[y][x] : body[y][x];
  return ch === '.' || SKIP.has(ch) ? null : palette[ch];
}

function svg({ crop, size, radius }) {
  const body = sprites.swordsman;
  const face = sprites['swordsman-happy'];
  const dx = Math.floor((size - crop.w) / 2);
  const dy = size - crop.h; // the head sits on the bottom edge, as a bust
  const rects = [];
  for (let y = 0; y < crop.h; y++) {
    for (let x = 0; x < crop.w; x++) {
      const fill = pixelAt(face, body, crop.x + x, crop.y + y);
      if (fill) rects.push(`<rect x="${dx + x}" y="${dy + y}" width="1" height="1" fill="${fill}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`
    + `<rect width="${size}" height="${size}" rx="${radius}" fill="${TILE}"/>${rects.join('')}</svg>\n`;
}

async function png(page, markup, file, px) {
  const src = `data:image/svg+xml;base64,${Buffer.from(markup).toString('base64')}`;
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${px}px;height:${px}px;image-rendering:pixelated}</style><img src="${src}">`);
  await page.screenshot({ path: path.join(OUT, file), omitBackground: true });
}

(async () => {
  const tab = svg(TAB);
  fs.writeFileSync(path.join(OUT, 'favicon.svg'), tab);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await png(page, tab, 'favicon-32.png', 32);
  await png(page, svg(HOME), 'apple-touch-icon.png', 180);
  await browser.close();
  process.stdout.write('sketches/img: favicon.svg, favicon-32.png, apple-touch-icon.png\n');
})().catch((err) => {
  process.stderr.write(`${err.stack}\n`);
  process.exit(1);
});
