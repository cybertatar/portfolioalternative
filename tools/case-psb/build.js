// Builds the PSB case into sketches/pause.html from tools/case-psb/data.js:
//   node tools/case-psb/build.js
// The page is written in Russian and English is a dictionary over its text (see i18n in the
// page), so this writes two things: the case body between <!-- case:psb --> and
// <!-- /case:psb -->, and its English entries between // case:psb and // /case:psb in the
// dictionary. Every text is one text node, so the dictionary can find it whole.
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
// Russian plural of «шаг»
const steps = (n) => t(`${n} ${n % 10 === 1 && n % 100 !== 11 ? 'шаг' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'шага' : 'шагов'}`, `${n} ${n === 1 ? 'step' : 'steps'}`);

const head = (id, s, n) =>
  `<section class="ch" id="c-${id}"${n ? ` data-n="${n}"` : ''}>
  <p class="eyebrow">${L(s.eyebrow)}</p>
  <h2>${L(s.title)}</h2>${s.lead ? `\n  <p class="lead">${L(s.lead)}</p>` : ''}`;

const prose = (ps) => `<div class="prose">${ps.map((p) => `<p>${L(p)}</p>`).join('')}</div>`;

// A phone screen: the picture, its corners from the tokens, and what it shows under it
const shot = (src, cap, cls = '') =>
  `<figure class="shot${cls}"><img src="${src}" alt="${L(cap)}" loading="lazy" decoding="async" /><figcaption>${L(cap)}</figcaption></figure>`;

const stat = ([n, unit, what]) =>
  `<div class="st"><p class="st-n"><b>${L(num(n))}</b>${unit ? `<span>${L(unit)}</span>` : ''}</p><p class="st-what">${L(what)}</p></div>`;

const pct = (x) => `${(x * 100).toFixed(1)}%`;

// Team, project and tools beside the intro, as chips
function about(a) {
  const pill = (x) => `<span class="pill">${L(x)}</span>`;
  return `<aside class="about">
    <div><p class="about-k">${L(t('Команда', 'Team'))}</p><p class="pills"><span class="pill team"><span class="ava"><img src="img/tools/team-swordsman.svg" alt="" /><img src="img/tools/team-mage.svg" alt="" /></span>${L(a.team)}</span></p></div>
    <div><p class="about-k">${L(t('Проект', 'Project'))}</p><p class="pills">${a.project.map(pill).join('')}</p></div>
    <div><p class="about-k">${L(t('Инструменты', 'Tools'))}</p><p class="pills">${a.tools
      .map(([icon, name]) => `<span class="pill tool"><img src="img/tools/${icon}.svg" alt="" />${L(name)}</span>`)
      .join('')}</p></div>
  </aside>`;
}

function overview(o) {
  const quests = o.quests
    .map(
      ([id, title, problem, solution], i) =>
        `<a class="qc" href="#c-${id}"><span class="qc-n">${i + 1}</span><b>${L(title)}</b>` +
        `<span class="qc-k">${L(t('Проблема', 'Problem'))}</span><span class="qc-t">${L(problem)}</span>` +
        `<span class="qc-k">${L(t('Решение', 'Solution'))}</span><span class="qc-t">${L(solution)}</span></a>`,
    )
    .join('');
  const stats = o.stats
    .map(([n, unit, what, more, g]) => {
      // Time shrinks from the old length to the new one, a share fills from empty
      const gauge = Array.isArray(g)
        ? `<span class="g"><i style="width:100%"></i><i class="now time" style="--to:${pct(g[1] / g[0])}"></i></span>`
        : `<span class="g"><i class="now" style="--to:${pct(g)}"></i></span>`;
      return `<div class="st big"><p class="st-what">${L(what)}</p><p class="st-n"><b>${L(num(n))}</b>${unit ? `<span>${L(unit)}</span>` : ''}</p>${gauge}<p class="st-more">${L(more)}</p></div>`;
    })
    .join('');
  return `${head('overview', o)}
  <div class="intro">${prose(o.prose)}${about(o.about)}</div>
  <h3>${L(t('Проблемы и решения', 'Problems and solutions'))}</h3>
  <div class="qcs">${quests}</div>
  <h3>${L(t('Результаты', 'Results'))}</h3>
  <div class="sts four" data-play>${stats}</div>
  <p class="aside">${L(o.statsNote)}</p>
</section>`;
}

function screens(s) {
  return `${head('screens', s)}
  <div class="phones">${s.phones.map(([src, cap]) => shot(src, cap)).join('')}</div>
  <div class="kit"><p>${L(s.kit)}</p><div class="kit-links">${s.links
    .map(([label, href]) => `<a class="btn" href="${href}" target="_blank" rel="noopener">${L(label)}</a>`)
    .join('')}</div></div>
</section>`;
}

function processSec(p) {
  const [vsrc, vposter, vlabel] = p.video;
  const steps = p.steps
    .map(
      ([title, text], i) =>
        `<div class="step"><span class="step-n">${i + 1}</span><h4>${L(title)}</h4><p>${L(text)}</p></div>`,
    )
    .join('');
  const c = p.criteria;
  return `${head('process', p)}
  <div class="steps">${steps}</div>
  <figure class="walk"><video class="loop" src="${vsrc}" poster="${vposter}" muted loop playsinline preload="none" aria-label="${L(vlabel)}"></video><figcaption>${L(vlabel)}</figcaption></figure>
  <h3>${L(c.title)}</h3>
  <p class="lead">${L(c.lead)}</p>
  <div class="crit">${c.items.map(([k, v]) => `<div><b>${L(k)}</b><p>${L(v)}</p></div>`).join('')}</div>
</section>`;
}

// A video in both languages: the script swaps the source with the page's language
const video = ([name, label]) =>
  `<div class="film"><video class="talk" controls playsinline preload="none" data-src-ru="img/psb/${name}.ru.mp4" data-src-en="img/psb/${name}.en.mp4" data-poster-ru="img/psb/${name}-poster.ru.webp" data-poster-en="img/psb/${name}-poster.en.webp" src="img/psb/${name}.ru.mp4" poster="img/psb/${name}-poster.ru.webp" aria-label="${L(label)}"></video></div>`;

function interviews(s) {
  return `${head('interviews', s)}
  ${video(s.video)}
  <ol class="finds">${s.findings.map(([h, p], i) => `<li><span class="step-n">${i + 1}</span><h4>${L(h)}</h4><p>${L(p)}</p></li>`).join('')}</ol>
  <blockquote class="say"><span class="say-who">${L(s.say[0])}</span><p>${L(s.say[1])}</p></blockquote>
</section>`;
}

// The clock of a flow: 1:45, 0:28,7 (0:28.7 in English)
const clock = (sec) => {
  const n = secs(sec);
  const tenths = Math.round((n % 1) * 10);
  const base = `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  return tenths ? t(`${base},${tenths}`, `${base}.${tenths}`) : t(base, base);
};
const secs = (x) => (Array.isArray(x) ? x[0] : typeof x === "object" ? Number(x.en) : x);

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
        <div class="rph"><img class="body" src="img/iphone-17-pro.webp" alt="" /><div class="screen">${screens}</div></div>
        <span class="rbar" aria-hidden="true"><i style="--to:${pct(s / longest)}"></i></span>
        <p class="rclock"><b data-clock>${L(clock(sec))}</b><span class="rend">${L(i ? t('Готово', 'Done') : t('Дошли до конца', 'Got there'))}</span></p>
        <p class="rstep"><span>${L(t('Шаг', 'Step'))}</span> <b data-step>${n}</b> <span>${L(t('из', 'of'))}</span> <span>${n}</span></p>
        <p class="rcap">${caps}</p>
      </div>`;
      })
      .join('')}</div>
    <button class="btn replay" type="button" data-replay hidden>${L(t('Ещё раз', 'Replay'))}</button>
  </div>`;
}

function variants(v, id) {
  const pick = v.items.findIndex((x) => x[3]);
  return `<div class="vars" data-vars>
    <h4>${L(v.title)}</h4>
    <div class="vars-grid">
      <div class="vars-list" role="tablist" aria-label="${L(v.title)}">${v.items
        .map(
          ([, name, note, chosen], i) =>
            `<button role="tab" id="v-${id}-${i}" aria-controls="vp-${id}-${i}" aria-selected="${i === pick}" tabindex="${i === pick ? 0 : -1}"><b>${L(name)}</b><span class="var-tag${chosen ? ' yes' : ''}">${L(chosen ? t('Выбрали', 'Chosen') : t('Отказались', 'Dropped'))}</span><span class="var-note">${L(note)}</span></button>`,
        )
        .join('')}</div>
      <div class="vars-view">${v.items
        .map(([src, name], i) => `<img role="tabpanel" id="vp-${id}-${i}" aria-labelledby="v-${id}-${i}" src="${src}" alt="${L(name)}" loading="lazy" decoding="async"${i === pick ? '' : ' hidden'} />`)
        .join('')}</div>
    </div>
  </div>`;
}

function rows(rs) {
  return `<div class="rows"><p class="rows-h"><span></span><span>${L(t('Было', 'Before'))}</span><span>${L(t('Стало', 'After'))}</span></p>${rs
    .map(([k, a, b]) => `<div class="rows-r"><b>${L(num(k))}</b><span class="was">${L(a)}</span><span class="now">${L(b)}</span></div>`)
    .join('')}</div>`;
}

function solution(s, i, all) {
  const visual = s.pair
    ? `<div class="pair">${s.pair.map(([src, label], k) => shot(src, label, k ? ' win' : '')).join('')}</div>`
    : race(s.race);
  return `${head(s.id, { eyebrow: t(`Решение ${i + 1} из ${all}`, `Solution ${i + 1} of ${all}`), title: s.title, lead: s.lead })}
  <div class="psr">
    <div><p class="psr-k">${L(t('Проблема', 'Problem'))}</p>${s.problem.map((p) => `<p>${L(p)}</p>`).join('')}</div>
    <div><p class="psr-k">${L(t('Решение', 'Solution'))}</p>${s.solution.map((p) => `<p>${L(p)}</p>`).join('')}</div>
  </div>
  ${visual}
  ${s.variants ? variants(s.variants, s.id) : ''}
  ${rows(s.rows)}
  <div class="result"><p class="psr-k">${L(t('Результат', 'Result'))}</p><p>${L(s.result)}</p><div class="sts">${s.stats.map(stat).join('')}</div></div>
</section>`;
}

// A pixel heart, 9×8, Zelda's container: edge, fill, shine; part of the last one filled
const HEART = ['.RR...RR.', 'RrrR.RrrR', 'RqrrRrrrR', 'RqrrrrrrR', '.RrrrrrR.', '..RrrrR..', '...RrR...', '....R....'];
const heartPaths = (() => {
  const d = {};
  HEART.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      let end = x + 1;
      while (end < row.length && row[end] === row[x]) end++;
      if (row[x] !== '.') d[row[x]] = (d[row[x]] || '') + `M${x} ${y}h${end - x}v1h-${end - x}z`;
      x = end;
    }
  });
  return d;
})();
const hearts = (value, max = 7) =>
  `<span class="hearts" aria-hidden="true">${Array.from({ length: max }, (_, i) => {
    const px = Math.round(Math.max(0, Math.min(1, value - i)) * 9);
    const shape = (cls) => Object.entries(heartPaths).map(([c, d]) => `<path class="${cls}${c}" d="${d}"/>`).join('');
    return `<svg class="heart" style="--i:${i}" viewBox="0 0 9 8" shape-rendering="crispEdges">${shape('e-')}${
      px ? `<g style="clip-path:inset(0 ${9 - px}px 0 0)">${shape('f-')}</g>` : ''
    }</svg>`;
  }).join('')}</span>`;

function testing(s) {
  const longest = Math.max(...s.flows.map((f) => secs(f.time[0])));
  const word = (n) => {
    const x = steps(n);
    return t(x.ru.split(' ')[1], x.en.split(' ')[1]);
  };
  const flows = s.flows
    .map((f) => {
      const [was, now] = f.steps;
      const [tw, tn] = f.time;
      const down = Math.round((1 - now / was) * 100);
      const pips = Array.from({ length: was }, (_, i) => `<i${i < now ? ' class="now"' : ''} style="--i:${was - 1 - i}"></i>`).join('');
      return `<article class="tf">
      <h3 class="tf-name">${L(f.name)}</h3>
      <div class="tf-steps">
        <p class="tf-big"><b>${now}</b><span>${L(word(now))}</span></p>
        <p class="tf-was"><span class="down">−${down}%</span><span>${L(t(`было ${was}`, `was ${was}`))}</span></p>
        <span class="pips" aria-hidden="true">${pips}</span>
      </div>
      <div class="tf-time">
        <p class="tf-k">${L(t('Медианное время', 'Median time'))}</p>
        <span class="tbar" aria-hidden="true"><i class="was" style="width:${pct(secs(tw) / longest)}"></i><i class="now" style="--from:${pct(secs(tw) / longest)};--to:${pct(tn / longest)}"></i></span>
        <p class="tf-sec"><b><span data-count-from="${Math.round(secs(tw))}">${tn}</span> ${L(t('с', 's'))}</b><span>${L(t(`вместо ${typeof tw === 'object' ? tw[1].ru : tw} с`, `instead of ${typeof tw === 'object' ? tw[1].en : tw} s`))}</span></p>
      </div>
      <div class="tf-more">
        <div><p class="tf-k">${L(t('Первый клик', 'First click'))}</p><p class="tf-n"><b><span data-count-from="0">${f.fcs}</span>%</b></p><span class="mana" aria-hidden="true"><i style="--to:${f.fcs}%"></i></span></div>
        <div><p class="tf-k">${L(t('Лёгкость', 'Ease'))}</p><p class="tf-n"><b>${L(f.seq[1])}</b><span>${L(t('из 7', 'of 7'))}</span></p>${hearts(f.seq[0])}</div>
      </div>
    </article>`;
    })
    .join('');
  const dots = Array.from({ length: s.people }, (_, i) => `<i style="--i:${i}"></i>`).join('');
  return `${head('testing', s)}
  <div class="tst" data-play>
    <div class="tdone"><span class="crowd" aria-hidden="true">${dots}</span><p><b>${L(t(`${s.people} из ${s.people}`, `${s.people} of ${s.people}`))}</b> <span>${L(t('прошли все три задачи сами, без подсказок', 'did all three tasks on their own, with no hints'))}</span></p></div>
    <div class="tflows">${flows}</div>
  </div>
  <p class="aside">${L(s.note)}</p>
</section>`;
}

const review = (s) => `${head('review', s)}
  ${video(s.video)}
</section>`;

const outcome = (s) => `${head('outcome', s)}
  ${prose(s.prose)}
  <h3>${L(s.nextTitle)}</h3>
  <div class="next">${s.next.map(([h, p]) => `<div><h4>${L(h)}</h4><p>${L(p)}</p></div>`).join('')}</div>
</section>`;

function toc(items) {
  return `<nav class="toc" aria-label="${L(t('Главы', 'Chapters'))}">${items
    .map(([id, title, group]) => {
      const sub = ['card-data', 'cashback', 'categories', 'home'].includes(id);
      return `${group ? `<span class="toc-group">${L(group)}</span>` : ''}<a href="#c-${id}"${sub ? ' class="sub"' : ''}>${L(title)}</a>`;
    })
    .join('')}</nav>`;
}

const n = D.solutions.length;
const body = [
  toc(D.toc),
  `<div class="cs">`,
  overview(D.overview),
  screens(D.screens),
  processSec(D.process),
  interviews(D.interviews),
  ...D.solutions.map((s, i) => solution(s, i, n)),
  testing(D.testing),
  review(D.review),
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
