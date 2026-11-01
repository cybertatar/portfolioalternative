// Audits the rendered page on every tab and in the PSB case, desktop and phone. Run:
//   node tools/audit-layout.js "$PWD/sketches/pause.html"
// prints "ok" per view or what breaks. The rules are in README («Что решено»):
//   1. corners are concentric: a rounded surface near a rounded ancestor's corner has r = R − inset;
//   2. inside ≤ outside: the gap between filled siblings is not smaller than their padding;
//   3. proximity: a caption over a group (.label, .kick) sits 12 from it; a heading sits closer to
//      what follows than to what precedes it (an eyebrow above it, like «Решение 1 из 4», is part
//      of the heading);
//   4. font sizes come from the scale (--fs-* tokens and the two noted exceptions);
//   5. no strokes: no borders, no outline-like box-shadows;
//   6. no interpuncts (·) in the text.
// Pictures drawn to their own scale are left out: phones and their screens, the prototype, the
// pixel scenes (their type follows the scene's width) and SVG.
const { chromium } = require('playwright');

const VIEWS = [['char', ''], ['quests', '#quests'], ['side', '#side'], ['case', '#psb']];
const SIZES = [['desk', 1440, 900], ['mob', 390, 844]];

function audit() {
  const issues = [];
  const caseOpen = document.body.classList.contains('playing');
  const root = caseOpen ? document.querySelector('.play') : document.querySelector('.menu');
  const DRAWN = '.ph, .ph *, .live-ph, .live-ph *, .fan, .fan *, .toon, .toon *, svg, svg *, canvas';
  const name = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '');
  const cs = (e) => getComputedStyle(e);
  // The menu is zoomed on big screens (--z, like a game's UI scale): distances on screen are
  // divided back, so they compare with the tokens
  const z = caseOpen ? 1 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1;
  const rect = (e) => { const r = e.getBoundingClientRect(); return { left: r.left / z, right: r.right / z, top: r.top / z, bottom: r.bottom / z }; };
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && cs(e).visibility !== 'hidden'; };
  const all = [...root.querySelectorAll('*')].filter((e) => visible(e) && !e.matches(DRAWN));
  const once = (msg) => { if (!issues.includes(msg)) issues.push(msg); };

  // 1. Concentric corners
  const R = (e) => parseFloat(cs(e).borderTopLeftRadius) || 0;
  const filled = (e) => cs(e).backgroundColor !== 'rgba(0, 0, 0, 0)' || e.classList.contains('pane');
  const surf = all.filter((e) => R(e) > 0 && !e.matches('.key, .dot, .sq img, .more img'));
  for (const e of surf) {
    let a = e.parentElement;
    while (a && !(R(a) > 0 && filled(a))) a = a.parentElement;
    if (!a || !root.contains(a)) continue;
    // Only a surface in a corner (close to it both ways) follows the corner's curve
    const er = rect(e), ar = rect(a);
    const near = Math.max(Math.min(er.left - ar.left, ar.right - er.right), Math.min(er.top - ar.top, ar.bottom - er.bottom));
    if (near < R(a) - 0.5) {
      const want = Math.max(R(a) - near, 0);
      if (Math.abs(R(e) - want) > 1) once(`radius ${name(e)} r=${R(e)} in ${name(a)} r=${R(a)} inset=${near.toFixed(0)} → want ${want}`);
    }
  }

  // 2. Inside ≤ outside. Stacked surfaces: the gap against their top and bottom padding; side by
  // side: against the smaller of top and left padding (a button's wider sides are room for text)
  const seen = new Set();
  for (const e of surf.filter(filled)) {
    const par = e.parentElement; if (seen.has(par)) continue; seen.add(par);
    const kids = [...par.children].filter((k) => visible(k) && filled(k) && !k.matches(DRAWN));
    const P = (k, stacked) => stacked
      ? Math.max(parseFloat(cs(k).paddingTop), parseFloat(cs(k).paddingBottom))
      : Math.min(parseFloat(cs(k).paddingTop), parseFloat(cs(k).paddingLeft));
    outer: for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const A = rect(kids[i]), B = rect(kids[j]);
      const dx = Math.max(B.left - A.right, A.left - B.right), dy = Math.max(B.top - A.bottom, A.top - B.bottom);
      const stacked = dy > dx, g = Math.max(dx, dy), pad = Math.max(P(kids[i], stacked), P(kids[j], stacked));
      if (g >= 0 && g < pad - 0.5) { once(`inside>outside in ${name(par)}: gap ${g.toFixed(0)} < padding ${pad} (${stacked ? 'Top/Bottom' : 'Left/Right'})`); break outer; }
    }
  }

  // 3. Proximity
  const flow = (e, dir) => { let s = e[dir]; while (s && (!visible(s) || ['absolute', 'fixed'].includes(cs(s).position))) s = s[dir]; return s; };
  // To what shows: a picture's top is its highest visible part (a stopwatch's crown over its face)
  const topOf = (e) => Math.min(rect(e).top, ...[...e.querySelectorAll('*')].filter(visible).map((d) => rect(d).top));
  const below = (a, b) => topOf(b) - rect(a).bottom;
  const HEAD = 'h1, h2, h3, h4';
  for (const c of all.filter((e) => e.matches('.label, .kick'))) {
    const nx = flow(c, 'nextElementSibling');
    if (!nx || nx.matches(HEAD) || rect(nx).top < rect(c).bottom - 1) continue; // an eyebrow, or side by side
    const g = below(c, nx);
    if (Math.abs(g - 12) > 1) once(`caption ${name(c)} «${c.textContent.trim().slice(0, 24)}» is ${g.toFixed(0)} from its group, not 12`);
  }
  for (const h of all.filter((e) => e.matches(HEAD))) {
    const nx = flow(h, 'nextElementSibling'); if (!nx) continue;
    let top = h; const ey = flow(h, 'previousElementSibling');
    if (ey && ey.matches('.kick, .region, .n, .qn')) top = ey;
    const pv = flow(top, 'previousElementSibling'); if (!pv) continue;
    const before = below(pv, top), after = below(h, nx);
    if (before >= 0 && after >= 0 && after >= before) once(`heading ${name(h)} «${h.textContent.trim().slice(0, 24)}»: ${after.toFixed(0)} to what follows ≥ ${before.toFixed(0)} to what precedes`);
  }

  // 4. Type scale: 13, 15, 18, the three heading clamps, pixel 18 and 22; 12 and 14 are the two
  // exceptions that make things fit on phones
  const FIXED = [12, 13, 14, 15, 18, 22];
  const tok = (v) => { const d = document.createElement('div'); d.style.fontSize = `var(${v})`; root.appendChild(d); const f = parseFloat(cs(d).fontSize); d.remove(); return f; };
  const scale = [...FIXED, tok('--fs-h3'), tok('--fs-h2'), tok('--fs-h1')];
  for (const e of all) {
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const f = parseFloat(cs(e).fontSize);
    if (!scale.some((s) => Math.abs(s - f) < 0.5)) once(`font ${f}px off the scale: ${name(e)} «${e.textContent.trim().slice(0, 24)}»`);
    if (e.textContent.includes('·')) once(`interpunct in ${name(e)}`);
  }

  // 5. Strokes
  for (const e of all) {
    const s = cs(e);
    if (['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(s['border' + k + 'Width']) > 0 && s['border' + k + 'Style'] !== 'none')) once(`border on ${name(e)}`);
    if (/inset|0px 0px 0px [1-9]/.test(s.boxShadow)) once(`stroke-like shadow on ${name(e)}`);
  }
  return issues;
}

(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of SIZES) {
    for (const [v, hash] of VIEWS) {
      const p = await b.newPage({ viewport: { width: w, height: h }, locale: 'ru-RU' });
      await p.goto('file://' + process.argv[2] + hash);
      await p.waitForTimeout(v === 'case' ? 3500 : 600); // the case flies in first
      const out = await p.evaluate(audit);
      console.log(n, v, out.length ? out : 'ok');
      await p.close();
    }
  }
  await b.close();
})();
