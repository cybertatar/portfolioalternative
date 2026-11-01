// Builds the PSB case into sketches/pause.html from tools/case-psb/data.js:
//   node tools/case-psb/build.js
// The page is written in Russian and English is a dictionary over its text (see i18n in the
// page), so this writes two things: the case body between <!-- case:psb --> and
// <!-- /case:psb -->, and its English entries between // case:psb and // /case:psb in the
// dictionary. Every text is one text node, so the dictionary can find it whole.
//
// The case is one column beside a sidebar of its chapters, grouped by the five parts. Each
// solution is a quest card: the obstacle, what we did, the reward; its screens open in a viewer.
// The test is a run of every participant, before and after, on the clock.
const fs = require('fs');
const path = require('path');
const D = require('./data.js');

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
// Russian plural of «шаг»
const steps = (n) => t(`${n} ${n % 10 === 1 && n % 100 !== 11 ? 'шаг' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'шага' : 'шагов'}`, `${n} ${n === 1 ? 'step' : 'steps'}`);
const nn = (i) => String(i + 1).padStart(2, '0');

// The five parts of the case: the bar at the bottom and the pills between them
const PARTS = [
  ['overview', t('Обзор', 'Overview'), ['overview', 'screens']],
  ['process', t('Исследование', 'Research'), ['process', 'interviews']],
  ['home', t('Дизайн', 'Design'), ['home', 'card-data', 'cashback', 'categories']],
  ['testing', t('Тестирование', 'Testing'), ['testing', 'review']],
  ['outcome', t('Выводы', 'Takeaways'), ['outcome']],
];
const part = (label) => `<p class="part"><span>${L(label)}</span></p>`;

const head = (id, s) =>
  `<section class="ch" id="c-${id}">
  <h2>${L(s.title)}</h2>${s.lead ? `\n  <p class="lead">${L(s.lead)}</p>` : ''}`;

const prose = (ps) => `<div class="prose">${ps.map((p) => `<p>${L(p)}</p>`).join('')}</div>`;
const kicker = (x) => `<p class="kick">${L(x)}</p>`;

// A phone: the body of an iPhone over a window cut to its display
const phone = (inner, cls = '') => `<div class="ph${cls}"><img class="body" src="img/iphone-17-pro.webp" alt="" /><div class="screen">${inner}</div></div>`;
const phoneOf = (src, alt) => phone(`<img src="${src}" alt="${L(alt)}" loading="lazy" decoding="async" />`);

/* ── Overview ── */
// The team as two designer classes, drawn by tools/team/draw.js
const CLASSES = [
  ['researcher', t('Исследователь', 'Researcher')],
  ['designer', t('Проектировщик', 'Designer')],
];
const ofSeven = (x) => t(`${x.ru} из 7`, `${x.en} of 7`);
function about(a) {
  const pill = (x) => `<span class="pill">${L(x)}</span>`;
  return `<aside class="about">
    <div>${kicker(t('Команда', 'Team'))}<p class="pills">${CLASSES.map(([icon, name]) => `<span class="pill team"><img src="img/tools/team-${icon}.svg" alt="" />${L(name)}</span>`).join('')}</p><p class="team-n">${L(a.team)}</p></div>
    <div>${kicker(t('Проект', 'Project'))}<p class="pills">${a.project.map(pill).join('')}</p></div>
    <div>${kicker(t('Инструменты', 'Tools'))}<p class="pills">${a.tools
      .map(([icon, name]) => `<span class="pill tool"><img src="img/tools/${icon}.svg" alt="" />${L(name)}</span>`)
      .join('')}</p></div>
  </aside>`;
}

function overview(o, flows) {
  // The four quests: the obstacle and what beat it, each leading to its card
  const log = o.quests
    .map(
      ([id, name, problem, solution], i) =>
        `<a class="qc" href="#c-${id}"><span class="qc-n">${L(t(`Квест ${i + 1}`, `Quest ${i + 1}`))}</span><b>${L(name)}</b><span class="qc-p">${L(problem)}</span><span class="qc-s">${L(solution)}</span></a>`,
    )
    .join('');
  const results = flows
    .map(
      (f) =>
        `<div class="sum-r"><p>${L(f.name)}</p><div><b>${f.steps[0]} → ${f.steps[1]}</b><span>${L(t('Шаги', 'Steps'))}</span></div><div><b>${L(t(`${secText(f.time[0]).ru} → ${f.time[1]}`, `${secText(f.time[0]).en} → ${f.time[1]}`))}</b><span>${L(t('Время, с', 'Time, s'))}</span></div></div>`,
    )
    .join('');
  const [, , fcs, seq] = o.stats;
  return `<section class="ch" id="c-overview">
  <div class="intro"><div>${kicker(t('Вступление', 'Intro'))}${prose(o.prose)}</div>${about(o.about)}</div>
  <div class="qlog">${kicker(t('Журнал квестов', 'Quest log'))}<div class="qlog-h" aria-hidden="true"><span></span><span>${L(t('Препятствие', 'Obstacle'))}</span><span>${L(t('Решение', 'Solution'))}</span></div>${log}</div>
  <div class="sum">${results}<div class="sum-r"><p>${L(t('Медианные показатели теста', 'Median test results'))}</p><div><b>${L(num(fcs[0]))}</b><span>${L(fcs[2])}</span></div><div><b>${L(ofSeven(num(seq[0])))}</b><span>${L(t('Оценка лёгкости, SEQ', 'Ease, SEQ'))}</span></div></div></div>
  <p class="aside">${L(o.statsNote)}</p>
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
function processSec(p) {
  const [vsrc, vposter, vlabel] = p.video;
  const c = p.criteria;
  return `${head('process', p)}
  <div class="grid two">${p.steps.map(([title, text], i) => `<div class="tile"><p class="n">[${nn(i)}]</p><h3>${L(title)}</h3><p>${L(text)}</p></div>`).join('')}</div>
  <figure class="walk"><video class="loop" src="${vsrc}" poster="${vposter}" muted loop playsinline preload="none" aria-label="${L(vlabel)}"></video><figcaption>${L(vlabel)}</figcaption></figure>
  <div class="sub-h"><h3>${L(c.title)}</h3><p>${L(c.lead)}</p></div>
  <div class="grid three">${c.items.map(([k, v]) => `<div class="tile">${kicker(k)}<p class="big">${L(v)}</p></div>`).join('')}</div>
</section>`;
}

// A film in both languages: the script swaps the source with the page's language
const video = ([name, label]) =>
  `<div class="film"><video class="talk" controls playsinline preload="none" data-src-ru="img/psb/${name}.ru.mp4" data-src-en="img/psb/${name}.en.mp4" data-poster-ru="img/psb/${name}-poster.ru.webp" data-poster-en="img/psb/${name}-poster.en.webp" src="img/psb/${name}.ru.mp4" poster="img/psb/${name}-poster.ru.webp" aria-label="${L(label)}"></video></div>`;

function interviews(s) {
  return `${head('interviews', s)}
  ${video(s.video)}
  <div class="grid three">${s.findings.map(([h, p], i) => `<div class="tile"><p class="n">[${nn(i)}]</p><h3>${L(h)}</h3><p>${L(p)}</p></div>`).join('')}</div>
  <div class="say"><img src="img/tools/team-researcher.svg" alt="" /><div>${kicker(s.say[0])}<p>${L(s.say[1])}</p></div></div>
</section>`;
}

/* ── Design: a solution as three rows ── */

// The clock of a flow: 1:45, 0:28,7 (0:28.7 in English)
const clock = (sec) => {
  const n = secs(sec);
  const tenths = Math.round((n % 1) * 10);
  const base = `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  return tenths ? t(`${base},${tenths}`, `${base}.${tenths}`) : t(base, base);
};

// "Before / after" as a race: both flows start together and run at their measured median times,
// sped up; the screens are spread evenly over the time of the flow. The bars share one scale, so
// the faster flow stops short. Without the script, or with reduced motion, it shows the finish
function race(lanes) {
  const longest = Math.max(...lanes.map((l) => secs(l[2])));
  return `<div class="race" data-race>
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
      .join('')}</div>
    <button class="btn replay" type="button" data-replay hidden>${L(t('Ещё раз', 'Replay'))}</button>
  </div>`;
}

// What changed, row by row: the old way faded, the new one in full ink. Folded under the card
function changes(rs) {
  return `<details class="changes"><summary>${L(t('Что изменилось, по пунктам', 'What changed, point by point'))}</summary><div class="changes-t"><p class="changes-h"><span></span><span>${L(t('Было', 'Before'))}</span><span>${L(t('Стало', 'After'))}</span></p>${rs
    .map(([k, a, b]) => `<p class="changes-r"><b>${L(num(k))}</b><span class="was">${L(a)}</span><span>${L(b)}</span></p>`)
    .join('')}</div></details>`;
}

/* ── Design: a solution as a quest card ── */
// The screens of a quest, in the order of the story: before, the options tried, after. Each
// opens in the quest's viewer; the race «before / after» is the viewer's last slide
function slidesOf(s) {
  const list = [{ src: s.stage[0], name: t('Было', 'Before'), where: 'obstacle' }];
  if (s.variants)
    s.variants.items.forEach(([src, name, note, chosen]) =>
      list.push({ src, name, note, tag: chosen ? t('Выбрали', 'Chosen') : t('Отказались', 'Dropped'), chosen: !!chosen, where: 'action' }),
    );
  else list.push({ src: s.stage[1], name: t('Стало', 'After'), where: 'action' });
  return list;
}

// A screen as a small card that opens the viewer on it
const shot = (x, i, id) =>
  `<button class="shot${x.chosen ? ' yes' : ''}" type="button" data-open="${id}" data-slide="${i}"><span class="shot-img"><img src="${x.src}" alt="" loading="lazy" decoding="async" /></span><span class="shot-t"><b>${L(x.name)}</b>${x.tag ? `<span class="var-tag${x.chosen ? ' yes' : ''}">${L(x.tag)}</span>` : ''}</span></button>`;

// The viewer: one big phone at a time, its caption under it, arrows and Esc
function viewer(s, slides) {
  const items = slides
    .map(
      (x, i) =>
        `<figure class="slide" data-n="${i}" hidden>${phoneOf(x.src, x.name)}<figcaption><b>${L(x.name)}</b>${x.tag ? ` <span class="var-tag${x.chosen ? ' yes' : ''}">${L(x.tag)}</span>` : ''}${x.note ? `<span>${L(x.note)}</span>` : ''}</figcaption></figure>`,
    )
    .join('');
  const race_ = s.race ? `<figure class="slide" data-n="${slides.length}" hidden>${race(s.race)}</figure>` : '';
  return `<dialog class="viewer" id="vw-${s.id}" aria-label="${L(s.title)}">
    <div class="vw-top"><p class="vw-n"><span data-vw-at>1</span> / ${slides.length + (s.race ? 1 : 0)}</p><button class="vw-x btn" type="button" data-close>${L(t('Закрыть', 'Close'))}</button></div>
    <div class="vw-body"><button class="vw-arrow prev" type="button" data-step="-1" aria-label="${L(t('Назад', 'Previous'))}"></button><div class="vw-slides">${items}${race_}</div><button class="vw-arrow next" type="button" data-step="1" aria-label="${L(t('Дальше', 'Next'))}"></button></div>
  </dialog>`;
}

function solution(s, i) {
  const paras = (ps) => ps.map((p) => `<p>${L(p)}</p>`).join('');
  const slides = slidesOf(s);
  const shots = (where) =>
    `<div class="shots">${slides.map((x, k) => (x.where === where ? shot(x, k, s.id) : '')).join('')}</div>`;
  // The reward: for a flow with a race, its time and steps before and after come first
  let head_ = '';
  if (s.race) {
    const [[, n0, t0], [, n1, t1]] = s.race;
    head_ = `<p class="rw-big"><b>${L(clock(t1))}</b><span>${L(t(`вместо ${clock(t0).ru}`, `instead of ${clock(t0).en}`))}</span></p><p class="rw-steps">${L(t(`${steps(n1).ru} вместо ${n0}`, `${steps(n1).en} instead of ${n0}`))}</p>`;
  }
  const facts = `<ul class="rw-list">${s.stats
    .map(([n, unit, what]) => {
      const v = unit ? (typeof n === 'object' ? t(`${n.ru} ${unit.ru}`, `${n.en} ${unit.en}`) : t(`${n} ${unit.ru}`, `${n} ${unit.en}`)) : num(n);
      return `<li><b>${L(v)}</b><span>${L(what)}</span></li>`;
    })
    .join('')}</ul>`;
  const raceBtn = s.race
    ? `<button class="btn rw-race" type="button" data-open="${s.id}" data-slide="${slides.length}">${L(t('Гонка «было и стало»', 'Race: before and after'))}</button>`
    : '';
  return `<section class="ch quest" id="c-${s.id}">
  <p class="q-no"><span>${L(t(`Квест ${i + 1} из ${D.solutions.length}`, `Quest ${i + 1} of ${D.solutions.length}`))}</span><span class="q-done">${L(t('Пройден', 'Cleared'))}</span></p>
  <h2>${L(s.title)}</h2>
  <p class="lead">${L(s.lead)}</p>
  <div class="qcard">
    <div class="qstep">${kicker(t('Препятствие', 'Obstacle'))}<div class="qtext">${paras(s.problem)}</div>${shots('obstacle')}</div>
    <div class="qstep">${kicker(t('Что сделали', 'What we did'))}<div class="qtext">${paras(s.solution)}</div>${s.variants ? kicker(s.variants.title) : ''}${shots('action')}</div>
    <div class="qstep reward">${kicker(t('Награда', 'Reward'))}${head_}${facts}<p class="qtext">${L(s.result)}</p>${raceBtn}</div>
  </div>
  ${changes(s.rows)}
  ${viewer(s, slides)}
</section>`;
}

/* ── Testing: a run of every participant ── */
// Each dot is a participant: 30 on the new prototype, 5 on a copy of the old screens. The medians
// are measured; the spread around them is drawn, as the page doesn't hold each person's time. All
// dots start together and move with the clock; each stops when its participant finishes, so the
// end is every finish time on the lane's own axis
const Q = (p) => {
  // The normal quantile (Acklam's approximation is more than enough for a picture)
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) return -Q(1 - p);
  const q = p - 0.5,
    r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
};
// n finish times spread around a median, the same on every build
const spread = (median, n, sigma) => Array.from({ length: n }, (_, i) => median * Math.exp(sigma * Q((i + 0.5) / n)));
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
// A tidy step for the axis: no more than five marks
const tickStep = (max) => [5, 10, 15, 30, 60].find((st) => max / st <= 5) || 60;

function testing(s) {
  const NEW = s.people,
    OLD = 5;
  const lanes = s.flows
    .map((f) => {
      const [tw, tn] = f.time;
      const was = secs(tw);
      const now = spread(tn, NEW, 0.35),
        old = spread(was, OLD, 0.3);
      const axis = Math.ceil(Math.max(...old) / tickStep(Math.max(...old))) * tickStep(Math.max(...old));
      const st = tickStep(axis);
      const ticks = Array.from({ length: Math.floor(axis / st) + 1 }, (_, k) => `<span class="tick" style="left:${pct((k * st) / axis)}">${mmss(k * st)}</span>`).join('');
      // Dots: their finish (x, a share of the axis) and a lane height; the order is shuffled so
      // the fast and the slow don't sit in bands
      const dot = (sec, k, n, cls) =>
        `<i class="pt ${cls}" data-t="${sec.toFixed(1)}" style="--x:${(sec / axis).toFixed(4)};--y:${(((k * 0.6180339) % 1) * 0.84 + 0.08).toFixed(3)}"></i>`;
      const dots = now.map((x, k) => dot(x, k, NEW, 'now')).join('') + old.map((x, k) => dot(x, k + 7, OLD, 'was')).join('');
      const [st0, st1] = f.steps;
      return `<div class="rl" data-axis="${axis}">
      <div class="rl-h"><h3>${L(f.name)}</h3><p class="rl-steps">${L(t(`${steps(st1).ru} вместо ${st0}`, `${steps(st1).en} instead of ${st0}`))}</p>
        <p class="rl-clock"><b data-clock>${mmss(tn)}</b><span>${L(t(`медиана, было ${mmss(was)}`, `median, was ${mmss(was)}`))}</span></p>
        <dl class="rl-stats"><div><dt>${L(t('Дошли', 'Finished'))}</dt><dd><span data-fin>${NEW}</span> ${L(t(`из ${NEW}`, `of ${NEW}`))}</dd></div><div><dt>${L(t('Первый клик', 'First click'))}</dt><dd>${f.fcs}%</dd></div><div><dt>${L(t('Лёгкость', 'Ease'))}</dt><dd>${L(ofSeven(f.seq[1]))}</dd></div></dl></div>
      <div class="rl-track"><div class="rl-ticks">${ticks}</div><div class="rl-field">${dots}<span class="med now" style="left:${pct(tn / axis)}"><b>${L(t(`${tn} с`, `${tn} s`))}</b></span><span class="med was" style="left:${pct(was / axis)}"><b>${L(t(`${secText(tw).ru} с`, `${secText(tw).en} s`))}</b></span></div></div>
    </div>`;
    })
    .join('');
  return `${head('testing', s)}
  <div class="run" data-run>
    <div class="run-top">${kicker(t('Забег: время на задачу', 'The run: time per task'))}<button class="btn" type="button" data-rerun hidden>${L(t('Ещё раз', 'Replay'))}</button></div>
    ${lanes}
    <p class="run-key"><span><i class="pt now"></i>${L(t(`${NEW} клиентов в новом прототипе`, `${NEW} customers on the new prototype`))}</span><span><i class="pt was"></i>${L(t(`${OLD} клиентов на копии старых экранов`, `${OLD} customers on a copy of the old screens`))}</span><span><i class="mk"></i>${L(t('медиана', 'median'))}</span></p>
  </div>
  <p class="aside">${L(t('Медианы измерены, разброс точек вокруг них условный: на сайте нет времени каждого участника. «Было» — медиана тех, кто дошёл до конца.', 'The medians are measured; the spread of the dots around them is drawn, as the site doesn’t hold each person’s time. “Before” is the median of those who finished.'))}</p>
</section>`;
}

const review = (s) => `${head('review', s)}
  ${video(s.video)}
</section>`;

const outcome = (s) => `${head('outcome', s)}
  ${prose(s.prose)}
  <div class="sub-h"><h3>${L(s.nextTitle)}</h3></div>
  <div class="grid three">${s.next.map(([h, p]) => `<div class="tile"><h3>${L(h)}</h3><p>${L(p)}</p></div>`).join('')}</div>
</section>`;

// The sidebar: the chapters grouped by the five parts, the one in view lit. On a narrow screen it
// folds into a button «Содержание» in the corner
const tocName = (id) => D.toc.find((x) => x[0] === id)[1];
const toc = () =>
  `<button class="toc-btn btn" type="button" aria-expanded="false" aria-controls="toc">${L(t('Содержание', 'Contents'))}</button><nav class="toc" id="toc" aria-label="${L(t('Содержание кейса', 'Case contents'))}">${PARTS.map(
    ([, label, ids]) => `<div class="toc-g"><p>${L(label)}</p>${ids.map((id) => `<a href="#c-${id}">${L(tocName(id))}</a>`).join('')}</div>`,
  ).join('')}</nav>`;

const body = [
  `<aside class="cside">`,
  toc(),
  `</aside>`,
  `<div class="cs">`,
  overview(D.overview, D.testing.flows),
  part(t('Финальные экраны', 'Final screens')),
  screens(D.screens),
  part(PARTS[1][1]),
  processSec(D.process),
  interviews(D.interviews),
  part(PARTS[2][1]),
  ...D.solutions.map(solution),
  part(PARTS[3][1]),
  testing(D.testing),
  review(D.review),
  part(PARTS[4][1]),
  outcome(D.outcome),
  `</div>`,
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
