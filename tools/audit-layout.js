// Audits the rendered menu: concentric corners and inside ≤ outside per axis, on every tab, desktop and
// phone. Run: node tools/audit-layout.js "$PWD/sketches/pause.html" — prints "ok" or what breaks.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of [['desk', 1440, 900], ['mob', 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(400);
    for (const t of ['char', 'quests', 'side']) {
      await p.click('#tab-' + t); await p.waitForTimeout(300);
      const out = await p.evaluate(() => {
        const issues = [];
        const name = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '');
        const R = (e) => parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0;
        const visible = (e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0;
        const surf = [...document.querySelectorAll('.menu *')].filter((e) => visible(e) && R(e) > 0 && !e.matches('.key, .dot, .sq img, .more img, .phone, canvas'));
        // 1. Concentric corners: a rounded surface close to a rounded ancestor's corner
        for (const e of surf) {
          let a = e.parentElement;
          while (a && !(R(a) > 0 && getComputedStyle(a).backgroundColor !== 'rgba(0, 0, 0, 0)')) a = a.parentElement;
          if (!a || !a.closest('.menu')) continue;
          const er = e.getBoundingClientRect(), ar = a.getBoundingClientRect();
          const inset = Math.min(er.left - ar.left, er.top - ar.top);
          const insetR = Math.min(ar.right - er.right, ar.bottom - er.bottom);
          const near = Math.min(inset, insetR);
          if (near < R(a)) {
            const want = Math.max(R(a) - near, 0);
            if (Math.abs(R(e) - want) > 1) issues.push(`radius ${name(e)} r=${R(e)} in ${name(a)} r=${R(a)} inset=${near.toFixed(0)} → want ${want}`);
          }
        }
        // 2. Inside ≤ outside: siblings with a fill, gap between them vs their padding
        const filled = (e) => getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)' || e.classList.contains('pane');
        const seen = new Set();
        for (const e of surf.filter(filled)) {
          const par = e.parentElement; if (seen.has(par)) continue; seen.add(par);
          const kids = [...par.children].filter((k) => visible(k) && filled(k));
          if (kids.length < 2) continue;
          // Stacked surfaces: the gap against their top and bottom padding (a card whose text sits
          // 16px from its bottom edge needs 16px to the next card). Side by side: against the
          // smaller of top and left padding, the box's inset; a button's wider side padding is
          // room for its text, not its edge
          const cs = (k) => getComputedStyle(k);
          const P = (k, stacked) => stacked
            ? Math.max(parseFloat(cs(k).paddingTop), parseFloat(cs(k).paddingBottom))
            : Math.min(parseFloat(cs(k).paddingTop), parseFloat(cs(k).paddingLeft));
          for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
            const A = kids[i].getBoundingClientRect(), B = kids[j].getBoundingClientRect();
            const dx = Math.max(B.left - A.right, A.left - B.right), dy = Math.max(B.top - A.bottom, A.top - B.bottom);
            const stacked = dy > dx, sides = stacked ? ['Top', 'Bottom'] : ['Left', 'Right'];
            const g = Math.max(dx, dy), pad = Math.max(P(kids[i], stacked), P(kids[j], stacked));
            if (g >= 0 && g < pad - 0.5) {
              issues.push(`inside>outside in ${name(par)}: gap ${g.toFixed(0)} < padding ${pad} (${sides.join('/')})`);
              i = kids.length;
              break;
            }
          }
        }
        return issues;
      });
      console.log(n, t, out.length ? out : 'ok');
    }
    await p.close();
  }
  await b.close();
})();
