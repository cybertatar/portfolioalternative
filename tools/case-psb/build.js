// Builds the PSB case into sketches/pause.html from tools/case-psb/data.js:
//   node tools/case-psb/build.js
// The page is written in Russian and English is a dictionary over its text (see i18n in the
// page), so this writes two things: the case body between <!-- case:psb --> and
// <!-- /case:psb -->, and its English entries between // case:psb and // /case:psb in the
// dictionary. Every text is one text node, so the dictionary can find it whole.
//
// The layout is the menu's own: a heading over each chapter, what belongs together grouped on
// a card that differs from the page by fill alone (no strokes), long reading left on the page,
// and the pixel scenes of the main site in «Как мы работали». Each solution is one scene: the phones with the
// changes beside them.
const fs = require('fs');
const path = require('path');
const D = require('./data.js');
const S = require('./scenes.js');

const PAGE = path.join(__dirname, '../../sketches/pause.html');
const en = new Map();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// A text in Russian for the page, its English kept for the dictionary
function L(x) {
  if (x == null) return '';
  if (typeof x !== 'object') return esc(x);
  const k = x.ru.replace(/\s+/g, ' ').trim();
  if (en.has(k) && en.get(k) !== x.en) throw new Error(`Two translations for «${k}»`);
  en.set(k, x.en);
  return esc(x.ru);
}
const t = (ru, en) => ({ ru, en });
const num = (x) => (typeof x === 'object' ? x : t(String(x), String(x)));
const pct = (x) => `${(x * 100).toFixed(1)}%`;
// Seconds as a number, from 23, [28.7, t('28,7', …)] or t('28,7', '28.7')
const secs = (x) => (Array.isArray(x) ? x[0] : typeof x === 'object' ? Number(x.en) : x);
// The same as text in both languages
const secText = (x) => (Array.isArray(x) ? x[1] : typeof x === 'object' ? x : t(String(x), String(x)));
const nn = (i) => String(i + 1).padStart(2, '0');

// A chapter opens with its title on the left and the lead (gold pixel eyebrows over chapters
// were turned down by the owner, the centred part chips were the co-author's)
const head = (id, s) =>
  `<section class="ch" id="c-${id}">
  <h2>${L(s.title)}</h2>${s.lead ? `\n  <p class="lead">${L(s.lead)}</p>` : ''}`;

const prose = (ps) => `<div class="prose">${ps.map((p) => `<p>${L(p)}</p>`).join('')}</div>`;
const kicker = (x) => `<p class="kick">${L(x)}</p>`;

// A phone: the body of an iPhone over a window cut to its display
const phone = (inner, cls = '') => `<div class="ph${cls}"><img class="body" src="img/iphone-17-pro.webp" alt="" /><div class="screen">${inner}</div></div>`;
const phoneOf = (src, alt) => phone(`<img src="${src}" alt="${L(alt)}" loading="lazy" decoding="async" />`);

/* ── Overview ── */
// Who, what kind of project and with what: a card beside the intro, a row each
function about(a) {
  return `<aside class="box about">
    <div>${kicker(t('Отряд', 'Party'))}<p class="team"><span class="ava"><img src="img/tools/team-swordsman.svg" alt="" /><img src="img/tools/team-mage.svg" alt="" /></span>${L(a.team)}</p></div>
    <div>${kicker(t('Проект', 'Project'))}<p>${a.project.map((x) => L(x)).join(', ')}</p></div>
    <div>${kicker(t('Инструменты', 'Tools'))}<p class="tools">${a.tools
      .map(([icon, name]) => `<span><img src="img/tools/${icon}.svg" alt="" />${L(name)}</span>`)
      .join('')}</p></div>
  </aside>`;
}

// A big number that grows from zero once in view ([data-count-from] in a [data-play] block):
// the figure in its own node, a sign after it (89%) stays put
function grow(n) {
  const split = (s) => /^([\d.,]+)(.*)$/.exec(s);
  const [, ru, rest] = split(n.ru);
  return `<span data-count-from="0">${L(t(ru, split(n.en)[1]))}</span>${esc(rest)}`;
}

// The overview: the result in four big numbers first (a reviewer skims for the outcome), then
// the intro with who, what and with what beside it, then each problem and what we did about it,
// one line per solution, leading to it
function overview(o) {
  const nums = o.stats
    .map(([n, unit, what, detail]) => `<div class="box"><b>${grow(num(n))}${unit ? `<small> ${L(unit)}</small>` : ''}</b><p>${L(what)}</p><span>${L(detail)}</span></div>`)
    .join('');
  const quests = o.quests
    .map(
      ([id, name, problem, fix], i) =>
        `<li><a class="box qc" href="#c-${id}"><span class="qn">${L(t(`Решение ${i + 1}`, `Solution ${i + 1}`))}</span><b>${L(name)}</b><span class="was">${L(problem)}</span><span class="now">${L(fix)}</span></a></li>`,
    )
    .join('');
  return `<section class="ch" id="c-overview">
  <div class="kpi" data-play>${nums}</div>
  <p class="aside">${L(o.statsNote)}</p>
  <div class="intro"><div>${kicker(t('Вступление', 'Intro'))}${prose(o.prose)}</div>${about(o.about)}</div>
  <div class="qs"><h3 class="sub">${L(t('Проблемы и решения', 'Problems and solutions'))}</h3><ol>${quests}</ol></div>
</section>`;
}

function screens(s) {
  return `${head('screens', s)}
  <div class="stage wide">${s.phones.map(([src, cap]) => `<figure>${phoneOf(src, cap)}<figcaption>${L(cap)}</figcaption></figure>`).join('')}</div>
  <div class="kit"><p>${L(s.kit)}</p><div class="kit-links">${s.links
    .map(([label, href]) => `<a class="btn" href="${href}" target="_blank" rel="noopener">${L(label)}</a>`)
    .join('')}</div></div>
</section>`;
}

/* ── Research ── */
// How we worked: a card per step, its text beside a picture of it, as on the main site: the
// pixel scenes for the pair and the senior, the banks and the test, the walkthrough film for
// the prototype
function processSec(p) {
  const [vsrc, vposter, vlabel] = p.video;
  const c = p.criteria;
  const media = [
    S.team(L),
    S.bench(L),
    `<video class="loop" src="${vsrc}" poster="${vposter}" muted loop playsinline preload="none" aria-label="${L(vlabel)}"></video>`,
    S.testing(L),
  ];
  // Told as the page scrolls: the steps run down the left as plain text, the picture of the step
  // in the middle of the screen stays put on the right and changes as the next step comes up
  return `${head('process', p)}
  <div class="story" data-story>
    <div class="story-steps">${p.steps
      .map(([title, text], i) => `<div class="story-step"${i ? '' : ' data-on'}><p class="n">${nn(i)}</p><h3>${L(title)}</h3><p>${L(text)}</p></div>`)
      .join('')}</div>
    <div class="story-media"><div class="story-stage">${media
      .map((m, i) => `<div class="story-slide"${i ? ' aria-hidden="true"' : ' data-on'}>${m}</div>`)
      .join('')}</div></div>
  </div>
  <div class="sub-h"><h3>${L(c.title)}</h3><p>${L(c.lead)}</p></div>
  <div class="grid three">${c.items.map(([k, v]) => `<div class="box tile">${kicker(k)}<p class="big">${L(v)}</p></div>`).join('')}</div>
</section>`;
}

// A film in both languages: the script swaps the source with the page's language
const video = ([name, label]) =>
  `<div class="film"><video class="talk" controls playsinline preload="none" data-src-ru="img/psb/${name}.ru.mp4" data-src-en="img/psb/${name}.en.mp4" data-poster-ru="img/psb/${name}-poster.ru.webp" data-poster-en="img/psb/${name}-poster.en.webp" src="img/psb/${name}.ru.mp4" poster="img/psb/${name}-poster.ru.webp" aria-label="${L(label)}"></video></div>`;

function interviews(s) {
  return `${head('interviews', s)}
  ${video(s.video)}
  <div class="grid three">${s.findings.map(([h, p], i) => `<div class="box tile"><p class="n">${nn(i)}</p><h3>${L(h)}</h3><p>${L(p)}</p></div>`).join('')}</div>
  <figure class="say">${S.party()}<blockquote class="bubble">${kicker(s.say[0])}<p>${L(s.say[1])}</p></blockquote></figure>
</section>`;
}

/* ── Design: a solution as one scene ── */

// The clock of a flow: 1:45, 0:28,7 (0:28.7 in English)
const clock = (sec) => {
  const n = secs(sec);
  const tenths = Math.round((n % 1) * 10);
  const base = `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  return tenths ? t(`${base},${tenths}`, `${base}.${tenths}`) : t(base, base);
};

// pixelarticons (MIT) "reload": the replay, between the phones once the race is over
const REPLAY_ICON = 'M16 2h-2v2h2v2H4v2H2v5h2V8h12v2h-2v2h2v-2h2V8h2V6h-2V4h-2V2zM6 20h2v2h2v-2H8v-2h12v-2h2v-5h-2v5H8v-2h2v-2H8v2H6v2H4v2h2v2z';

// "Before / after" as a race: both flows start together and run at their measured median times,
// sped up; the screens are spread evenly over the time of the flow. The bars share one scale, so
// the faster flow stops short. Without the script, or with reduced motion, it shows the finish
function race(lanes) {
  const longest = Math.max(...lanes.map((l) => secs(l[2])));
  return `<div class="race" data-race tabindex="-1">
    <div class="lanes">${lanes
      .map(([label, n, sec, shots], i) => {
        const s = secs(sec);
        const screens = shots
          .map(([src, cap], k) => `<img src="img/psb/${src}.webp" alt="${L(cap)}" loading="lazy" decoding="async"${k === shots.length - 1 ? ' class="on"' : ''} />`)
          .join('');
        const caps = shots.map(([, cap], k) => `<span${k === shots.length - 1 ? ' class="on"' : ''}>${L(cap)}</span>`).join('');
        return `<div class="lane${i ? ' win' : ''}" data-lane data-sec="${s}" data-steps="${n}">
        <p class="lane-h">${L(label)}</p>
        ${phone(screens)}
        <span class="rbar" aria-hidden="true"><i style="--to:${pct(s / longest)}"></i></span>
        <p class="rclock"><b data-clock>${L(clock(sec))}</b><span><span>${L(t('Шаг', 'Step'))}</span> <span data-step>${n}</span> <span>${L(t('из', 'of'))}</span> <span>${n}</span></span></p>
        <p class="rcap">${caps}</p>
      </div>`;
      })
      .join('')}
    <button class="replay" type="button" data-replay disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${REPLAY_ICON}" fill="currentColor"/></svg><span>${L(t('Ещё раз', 'Replay'))}</span></button></div>
  </div>`;
}

// Options tried, side by side under the scene: each phone with its name, the verdict and why,
// so the dropped ones read at a glance and nothing hides behind a tab
function variants(v) {
  return `<div class="vars">${kicker(v.title)}<div class="vars-row">${v.items
    .map(
      ([src, name, note, chosen]) =>
        `<figure class="box var${chosen ? ' yes' : ''}">${phoneOf(src, name)}<figcaption><b>${L(name)}</b><span class="var-tag">${L(chosen ? t('Выбрали', 'Chosen') : t('Отказались', 'Dropped'))}</span><span class="var-note">${L(note)}</span></figcaption></figure>`,
    )
    .join('')}</div></div>`;
}

// What changed, fact by fact, beside the phones (as on the main site, Changes.astro): the
// subject, what it is now, and under it, quieter, what it was. One left edge, no table zigzag
function changes(rs) {
  return `<ul class="changes" aria-label="${L(t('Было и стало', 'Before and after'))}">${rs
    .map(
      ([k, a, b]) =>
        `<li><span class="ch-k">${L(num(k))}</span><p class="ch-now">${L(b)}</p><p class="ch-was"><span>${L(t('Было:', 'Before:'))}</span> ${L(a)}</p></li>`,
    )
    .join('')}</ul>`;
}

// A solution: its name and aim; the problem and what we did side by side; one scene, the
// phones (a race, or before and after) with the changes beside them; the options dropped on
// the way; the test result in big numbers
function solution(s, i) {
  const paras = (ps) => ps.map((p) => `<p>${L(p)}</p>`).join('');
  const media = s.race
    ? race(s.race)
    : `<div class="pair">${s.pair.map(([src, label]) => `<figure>${phoneOf(src, label)}<figcaption>${L(label)}</figcaption></figure>`).join('')}</div>`;
  const stats = `<div class="nums">${s.stats
    .map(([n, unit, what]) => `<div><b>${L(num(n))}${unit ? `<small> ${L(unit)}</small>` : ''}</b><span>${L(what)}</span></div>`)
    .join('')}</div>`;
  return `<section class="ch sol" id="c-${s.id}">
  ${kicker(t(`Решение ${i + 1} из ${D.solutions.length}`, `Solution ${i + 1} of ${D.solutions.length}`))}<h2>${L(s.title)}</h2>
  <p class="lead">${L(s.lead)}</p>
  <div class="box ps"><div>${kicker(t('Проблема', 'Problem'))}<div class="prose">${paras(s.problem)}</div></div><div>${kicker(t('Решение', 'Solution'))}<div class="prose">${paras(s.solution)}</div></div></div>
  <div class="duo"><div class="duo-m">${media}</div>${changes(s.rows)}</div>
  ${s.variants ? variants(s.variants) : ''}
  <div class="box outcome">${kicker(t('Результат теста', 'Test result'))}<p>${L(s.result)}</p>${stats}</div>
</section>`;
}

/* ── Testing: a stopwatch per flow ──
   Time is a dial: one lap is LAP seconds, the same for every flow, ticks every ten seconds. The
   old median time is a grey arc; the gold one starts on it and winds back to the new time while
   the number counts down (played once in view, [data-play]). Under it, how many times faster,
   and three small dials in the same language: steps (the gold share is what is left of the old
   path), first click and ease out of 7 */
const LAP = 120;
// An arc of a dial: `share` of the circle from twelve o'clock, clockwise
const arc = (cls, share, from) =>
  `<circle class="${cls}" cx="50" cy="50" r="42" pathLength="100" style="--to:${(share * 100).toFixed(2)}${from != null ? `;--from:${(from * 100).toFixed(2)}` : ''}" />`;
const dial = (inner, arcs, cls = '') =>
  `<div class="dial${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="42" pathLength="100" />${cls ? '<circle class="ticks" cx="50" cy="50" r="49" pathLength="120" />' : ''}${arcs}</svg><div class="dial-c">${inner}</div></div>`;
// One decimal, without a trailing zero: 4,6 and 2
const fixed1 = (n) => {
  const x = String(Number(n.toFixed(1)));
  return t(x.replace('.', ','), x);
};

function stopwatch(f) {
  const [tw, tn] = f.time;
  const was = secs(tw);
  const [sw, sn] = f.steps;
  const faster = fixed1(was / tn);
  const minis = [
    [dial(`<b>${sn}</b>`, arc('was', 1) + arc('now', sn / sw)), t(`шагов, было ${sw}`, `steps, was ${sw}`)],
    [dial(`<b><span data-count-from="0">${f.fcs}</span>%</b>`, arc('now', f.fcs / 100)), t('first click', 'first click')],
    [dial(`<b>${L(f.seq[1])}</b>`, arc('now', f.seq[0] / 7)), t('лёгкость из 7', 'ease of 7')],
  ];
  return `<div class="box sw">${kicker(f.name)}
    <div class="sw-face">${dial(
      `<b><span data-count-from="${Math.round(was)}">${tn}</span><small> ${L(t('с', 's'))}</small></b><span>${L(t(`было ${secText(tw).ru} с`, `was ${secText(tw).en} s`))}</span>`,
      arc('was', was / LAP) + arc('now', tn / LAP, was / LAP),
      ' big',
    )}<span class="crown" aria-hidden="true"></span></div>
    <p class="sw-x">${L(t(`в ${faster.ru} раза быстрее`, `${faster.en}× faster`))}</p>
    <div class="sw-minis">${minis.map(([d, cap]) => `<div>${d}<span>${L(cap)}</span></div>`).join('')}</div>
  </div>`;
}

function testing(s) {
  return `${head('testing', s)}
  <div class="grid three sws" data-play>${s.flows.map(stopwatch).join('')}</div>
  <p class="aside"><span>${L(t(`Один круг циферблата — ${LAP / 60} минуты.`, `One lap of the dial is ${LAP / 60} minutes.`))}</span> ${L(s.note)}</p>
</section>`;
}

const review = (s) => `${head('review', s)}
  ${video(s.video)}
</section>`;

const outcome = (s) => `${head('outcome', s)}
  ${prose(s.prose)}
  <div class="sub-h"><h3>${L(s.nextTitle)}</h3></div>
  <div class="grid three">${s.next.map(([h, p]) => `<div class="box tile"><h3>${L(h)}</h3><p>${L(p)}</p></div>`).join('')}</div>
</section>`;

// The contents: a minimal rail of ticks at the middle of the screen's left edge, a tick per
// chapter, the one in view gold; the names show when the rail is hovered or focused. A little
// more air before each part of the case (research, solutions, testing, takeaways)
const PART_STARTS = new Set(['process', 'home', 'testing', 'outcome']);
const rail = () =>
  `<nav class="rail" aria-label="${L(t('Содержание кейса', 'Case contents'))}">${D.toc
    .map(([id, label]) => `<a href="#c-${id}"${PART_STARTS.has(id) ? ' class="part"' : ''}><i></i><span>${L(label)}</span></a>`)
    .join('')}</nav>`;

const body = [
  rail(),
  `<div class="cs">`,
  overview(D.overview),
  screens(D.screens),
  processSec(D.process),
  interviews(D.interviews),
  ...D.solutions.map(solution),
  testing(D.testing),
  review(D.review),
  outcome(D.outcome),
  `</div>`,
  // after every scene, so it holds each sprite they used
  S.symbols(),
].join('\n');

const dict = [...en]
  .filter(([ru, e]) => ru !== e)
  .map(([ru, e]) => `      ${JSON.stringify(ru)}: ${JSON.stringify(e)},`)
  .join('\n');

let page = fs.readFileSync(PAGE, 'utf8');
const swap = (open, close, inner) => {
  const a = page.indexOf(open),
    b = page.indexOf(close);
  if (a < 0 || b < a) throw new Error(`Markers ${open} … ${close} not found`);
  page = page.slice(0, a + open.length) + '\n' + inner + '\n' + page.slice(b);
};
swap('<!-- case:psb -->', '<!-- /case:psb -->', body);
swap('// case:psb', '      // /case:psb', dict);
fs.writeFileSync(PAGE, page);
process.stdout.write(`case:psb ${body.length} chars, ${en.size} texts\n`);
