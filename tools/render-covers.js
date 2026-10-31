/*
  Renders the quest covers for sketches/pause.html (1920×1080 WebP).

  PSB, BittVPN and Mouette are the cover scenes of the main site (cybertatar/Portfolio,
  tools/case-covers/*.html) restyled for this dark site: the beige parchment becomes a calm
  graphite, the faint pixel pattern of each cover stays but barely lighter than the background,
  and the shadows are neutral instead of warm brown. WB had only a pattern there; its scene here
  (tools/covers/wb.html) adds a pixel piggy bank on the same background.
  The covers sit on a neutral background, not on the quest's world: the world is already behind
  the glass, and a second, sharp copy of it under the objects was too loud.

  Usage:
    git clone --depth 1 https://github.com/cybertatar/Portfolio /path/to/Portfolio
    node tools/render-covers.js /path/to/Portfolio/tools/case-covers
  Writes sketches/img/cover-{psb,vpn,wb,mou}.webp (needs python3 with Pillow for WebP).
*/
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const src = process.argv[2];
if (!src || !fs.existsSync(path.join(src, 'psb.html'))) {
  console.error('Usage: node tools/render-covers.js <Portfolio>/tools/case-covers');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'sketches/img');

// Background and pattern: graphite, the pattern a whisper lighter (white at low opacity keeps it
// neutral whatever colour the pattern was drawn in); the old fade towards the top stays
const BG = '#17191d';
const BASE =
  `html,body{background:${BG}!important}` +
  '.pattern,body::before{filter:brightness(0) invert(1)!important;opacity:.05!important}';
const SHADOW = 'drop-shadow(0 32px 48px rgb(0 0 0 / 0.55))';
const COVERS = [
  { id: 'psb', file: path.join(src, 'psb.html'), css: `.phone{filter:${SHADOW}!important}` },
  { id: 'vpn', file: path.join(src, 'bittvpn.html'), css: `.pass,.phone{filter:${SHADOW}!important}` },
  {
    id: 'mou',
    file: path.join(src, 'mouette.html'),
    // The hole in the tag shows the background through it
    css:
      `.shadow{filter:drop-shadow(0 2px 3px rgb(0 0 0/.3)) ${SHADOW}!important}` +
      `.hole{background:${BG}!important}`,
  },
  { id: 'wb', file: path.join(root, 'tools/covers/wb.html'), css: '' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const c of COVERS) {
    await page.goto('file://' + c.file, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: BASE + c.css });
    await page.evaluate(() => document.fonts.ready);
    const png = path.join(os.tmpdir(), `cover-${c.id}.png`);
    await page.screenshot({ path: png });
    const webp = path.join(out, `cover-${c.id}.webp`);
    execFileSync('python3', [
      '-c',
      'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],quality=86,method=6)',
      png,
      webp,
    ]);
    console.log(webp, Math.round(fs.statSync(webp).size / 1024) + ' KB');
  }
  await browser.close();
})();
