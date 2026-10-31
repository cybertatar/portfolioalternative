/*
  Shoots the five screens of the PSB fan from the live prototype itself (sketches/live/psb), so
  the fan on the cover and in the head of the case shows the very same status bar, island and tab
  bar as the clickable phone they fold into. Earlier the fan used Figma exports with an older tab
  bar and another status bar, and the header jumped when the app faded in over them.

  Each screen is the app's viewport as the live phone shows it (.live-ph .screen in pause.html:
  410×882 of the 450×920 body, the app drawn 402pt wide, so 864.8pt tall), at 2x.

  Usage: node tools/psb-screens.js
  Writes sketches/img/psb-fan-{account,cb-off,main,cb-connect,cb-on}.webp (needs python3 with
  Pillow for WebP). Then re-render the cover: node tools/render-covers.js <Portfolio>/tools/case-covers
*/
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const live = 'file://' + path.join(root, 'sketches/live/psb/');
const W = 402;
const H = (882 * 402) / 410; // the live screen's height in the app's points
const SCREENS = [
  { id: 'account', route: '/account' },
  { id: 'cb-off', route: '/cashback' },
  { id: 'main', route: '/' },
  { id: 'cb-connect', route: '/cashback/categories' },
  { id: 'cb-on', route: '/cashback', connected: true },
];

// The same variables the live phone gives the app (.live-ph .app in pause.html), at scale 1
const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin: 0; background: #0e1116; }
  .app { position: relative; width: ${W}px; height: ${H}px; overflow: hidden;
    font-family: 'Onest Variable', Onest, system-ui, sans-serif; font-size: 16px;
    --prototype-scale: 1; --prototype-height: ${H}px;
    --prototype-island-top: 18.14px; --prototype-island-width: 121.6px;
    --prototype-island-height: 34.8px; --prototype-radius: 62.75px; }
</style>
${SCREENS.map((s) => `<div class="app" id="${s.id}" data-psb-live-route="${s.route}"${s.connected ? ' data-psb-cashback="connected"' : ''}></div>`).join('\n')}
<script charset="utf-8" src="${live}style-data.js"></script>
<script charset="utf-8" src="${live}app.js"></script>`;

(async () => {
  const page = path.join(os.tmpdir(), 'psb-screens.html');
  fs.writeFileSync(page, html);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + page);
  await p.waitForFunction((n) => document.querySelectorAll('.app[data-psb-ready]').length === n, SCREENS.length, {
    timeout: 20000,
  });
  await p.evaluate(() => document.fonts.ready);
  // Images inside the shadow roots, and the app's own entrance animations, settle
  await p.waitForTimeout(1500);
  if (errors.length) throw new Error(errors.join('\n'));
  for (const s of SCREENS) {
    const png = path.join(os.tmpdir(), `psb-${s.id}.png`);
    await p.locator('#' + s.id).screenshot({ path: png });
    const webp = path.join(root, `sketches/img/psb-fan-${s.id}.webp`);
    execFileSync('python3', [
      '-c',
      'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],quality=84,method=6)',
      png,
      webp,
    ]);
    console.log(webp, Math.round(fs.statSync(webp).size / 1024) + ' KB');
  }
  await browser.close();
})();
