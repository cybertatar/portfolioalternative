// The pixel scenes of «Как мы работали», ported from the main site
// (src/components/case/scenes/*.astro in cybertatar/Portfolio): the swordsman and the mage (the
// two of us) argue and get the senior's review, open a chest of bank ideas, and run the test.
// Each scene is a list of states: the page script (runScene in pause.html) switches the root's
// data-state on a timer and the CSS (.toon in pause.html) does the rest.
//
// Sprites are drawn once, as <symbol>s in a hidden <svg> (symbols()), and used by reference.
const { palette, sprites } = require('./mascots.js');

const t = (ru, en) => ({ ru, en });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const used = new Set();
// One sprite as an SVG filling its box's width
function sprite(name, cls = '') {
  const rows = sprites[name];
  if (!rows) throw new Error(`No sprite «${name}»`);
  used.add(name);
  return `<svg class="sprite${cls ? ' ' + cls : ''}" viewBox="0 0 ${rows[0].length} ${rows.length}" aria-hidden="true" focusable="false"><use href="#spr-${name}"/></svg>`;
}

// Every sprite the scenes used, one rect per horizontal run of a colour
function symbols() {
  const defs = [...used]
    .map((name) => {
      const rows = sprites[name];
      const rects = [];
      rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
          const c = row[x];
          let end = x + 1;
          while (end < row.length && row[end] === c) end++;
          if (c !== '.') rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${palette[c]}"/>`);
          x = end;
        }
      });
      return `<symbol id="spr-${name}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges">${rects.join('')}</symbol>`;
    })
    .join('');
  return `<svg class="sprites" aria-hidden="true" focusable="false">${defs}</svg>`;
}

// A hero: the body, the faces over it (eyes open and shut take turns, so they blink)
const hero = (who, cls, faces) =>
  `<div class="guy ${cls}">${sprite(who)}${faces.map((f) => sprite(`${who}-${f}`, `face ${f}`)).join('')}</div>`;

/* «Дизайнили вдвоём, проверяли у сеньора»: the two argue in a cloud of dust, show the result,
   the elder comes down with a review, the party gets sad, and it starts over */
function team(L) {
  const review = t(
    'Карты над счётом, а сумма счёта мелкая. Сам понял, что сделал-то?',
    'Cards above the account, and the balance is tiny. Do you even get what you’ve made?',
  );
  const label = t(
    `Двое дизайнеров спорят, показывают макет сеньору, он отвечает: «${review.ru}»`,
    `Two designers argue, show the mockup to the senior, and the answer is: “${review.en}”`,
  );
  return `<div class="toon team" data-scene="team" role="img" aria-label="${L(label)}">
  <div class="desk"></div>
  ${hero('swordsman', 'a', ['happy', 'blink', 'sad'])}
  ${hero('mage', 'b', ['happy', 'blink', 'sad'])}
  <div class="arm arm-a">${sprite('arm-sword')}</div>
  <div class="prop-phone">${sprite('phone')}</div>
  <div class="arm arm-b">${sprite('arm-mage')}</div>
  <div class="cloud">${sprite('cloud')}${[1, 2, 3].map((i) => `<span class="puff p${i}">${sprite('puff')}</span>`).join('')}<span class="swear s1">#</span><span class="swear s2">!</span><span class="swear s3">@</span></div>
  <div class="elder"><span class="quest">${sprite('quest')}</span><span class="arm-s left">${sprite('arm-elder')}</span><span class="arm-s right">${sprite('arm-elder')}</span>${sprite('elder')}${sprite('elder-angry', 'face angry')}${sprite('elder-talk', 'face talk')}</div>
  <div class="dialog px-clip" aria-hidden="true"><span class="dialog-label">${L(t('Ревью сеньора', 'Senior review'))}</span><p class="dialog-text"><span data-type-ru="${esc(review.ru)}" data-type-en="${esc(review.en)}"></span></p></div>
</div>`;
}

/* «Выбрали четыре направления»: a chest between the two opens, a bank's real app icon rises
   with the idea we took from that bank, like loot with its tooltip, and one of the two takes it.
   `tile`: the mark sits on a white app-icon tile; without it the file is the whole icon */
const BANKS = [
  [t('Сбер', 'Sber'), 'sber', true, t('Флип карты', 'Card flip')],
  [t('Ozon Банк', 'Ozon Bank'), 'ozon', false, t('Копирование иконкой', 'Copy icon')],
  [t('Т-Банк', 'T-Bank'), 'tbank', true, t('Акцент на скорости', 'Focus on speed')],
  [t('Альфа-Банк', 'Alfa-Bank'), 'alfa', true, t('Кешбэк в таббаре', 'Cashback in the tab bar')],
  [t('Райффайзен', 'Raiffeisen'), 'raiffeisen', false, t('Кешбэк в бейдже', 'Cashback in a badge')],
];
function bench(L) {
  // The script reads the banks in the page's language
  const inLang = (lang) => esc(JSON.stringify(BANKS.map(([name, logo, tile, idea]) => ({ name: name[lang], logo: `img/psb/banks/${logo}.svg`, tile, idea: idea[lang] }))));
  const label = t(
    `Сравнили пять банков: ${BANKS.map(([n, , , i]) => `${n.ru} — ${i.ru.toLowerCase()}`).join(', ')}`,
    `We compared five banks: ${BANKS.map(([n, , , i]) => `${n.en} — ${i.en.toLowerCase()}`).join(', ')}`,
  );
  return `<div class="toon bench" data-scene="bench" data-banks-ru="${inLang('ru')}" data-banks-en="${inLang('en')}" role="img" aria-label="${L(label)}">
  <div class="desk"></div>
  ${hero('swordsman', 'a', ['happy', 'blink'])}
  ${hero('mage', 'b', ['happy', 'blink'])}
  <div class="arm arm-a">${sprite('arm-sword')}</div>
  <div class="arm arm-b">${sprite('arm-mage')}</div>
  <div class="chest">${sprite('chest', 'shut')}${sprite('chest-open', 'open')}</div>
  <span class="glint g1"></span><span class="glint g2"></span><span class="glint g3"></span>
  <span class="loot tile" data-loot aria-hidden="true"><img src="img/psb/banks/sber.svg" alt="" data-logo /></span>
  <div class="tooltip px-clip" aria-hidden="true"><span class="tooltip-bank" data-bank></span><span class="tooltip-idea" data-idea></span></div>
</div>`;
}

/* «Видели путь, а не только финал»: the prototype's research flow, sign in, task, a session
   replay logging every tap, the ease rating, the summary */
const LOG = [
  ['+00:00.0', 'start', t('Первое подключение кешбэка', 'First cashback activation')],
  ['+00:04.3', 'tap', t('Хочу подключить', 'I want to activate')],
  ['+00:08.1', 'tap', t('7% Деливери', '7% Delivery')],
  ['+00:11.1', 'tap', t('3% На бензин', '3% Fuel')],
  ['+00:14.1', 'tap', t('Подключить', 'Activate')],
  ['+00:18.3', 'finish', t('Кешбэк подключён', 'Cashback activated')],
];
const ROWS = [
  [t('Подключить кешбэк', 'Activate cashback'), 30, 83, t('6,5', '6.5')],
  [t('Выбрать категории', 'Choose categories'), 30, 100, t('6,7', '6.7')],
  [t('Скопировать данные карты', 'Copy card details'), 30, 83, t('6,0', '6.0')],
];
function testing(L) {
  const label = t(
    'Прототип для теста: участник вводит имя, получает задание, каждое его нажатие записывается в журнал сессии, в конце он оценивает лёгкость задания, а результаты сводятся в таблицу',
    'The test prototype: a participant enters a name and gets a task, every tap goes into the session log, at the end they rate how easy the task was, and the results add up to a table',
  );
  const screens = ['cb-off', 'cb-connect', 'success']
    .map((s, i) => `<img class="shot${i ? '' : ' on'}" src="img/psb/scene/${s}.webp" alt="" loading="lazy" decoding="async" data-screen="${i}" />`)
    .join('');
  const log = LOG.map(([time, kind, what], i) => `<li data-row="${i}"><span class="log-t">${time}</span><span class="log-kind ${kind}">${kind}</span><span class="log-what">${L(what)}</span></li>`).join('');
  const rows = ROWS.map(
    ([task, done, fcs, seq]) =>
      `<tr><td>${L(task)}</td><td><span data-count="${done}">${done}</span>/30</td><td><span data-count="${fcs}">${fcs}</span>%<span class="sbar" style="--v:${fcs}%"></span></td><td><span data-final-ru="${seq.ru}" data-final-en="${seq.en}">${L(seq)}</span></td></tr>`,
  ).join('');
  return `<div class="toon testing" data-scene="testing" role="img" aria-label="${L(label)}">
  <div class="tcard start px-clip"><span class="kicker">${L(t('Юзабилити-тест ПСБ', 'PSB usability test'))}</span><span class="card-title">${L(t('Начать тест', 'Start the test'))}</span><span class="field-label">${L(t('Ваше имя', 'Your name'))}</span><span class="field px-clip" data-target="field"><span data-type-ru="Участник 12" data-type-en="Participant 12"></span><i class="caret"></i></span><span class="sbtn px-clip" data-target="start">${L(t('Начать тест', 'Start the test'))}</span></div>
  <div class="tcard task px-clip"><span class="kicker">${L(t('Задание', 'Task'))}</span><span class="card-title">${L(t('Первое подключение кешбэка', 'First cashback activation'))}</span><span class="card-text">${L(t('Подключите кешбэк и выберите три категории на этот месяц.', 'Activate cashback and choose three categories for this month.'))}</span><span class="sbtn px-clip" data-target="go">${L(t('Старт', 'Start'))}</span></div>
  <div class="session"><div class="mini-phone px-clip">${screens}</div><div class="log px-clip"><span class="kicker">${L(t('Повтор сессии', 'Session replay'))}</span><span class="timer" data-timer>+00:00.0</span><span class="tline"><span class="tline-fill"></span></span><ol>${log}</ol></div></div>
  <div class="tcard seq px-clip"><span class="card-title">${L(t('Насколько легко было выполнить задание?', 'How easy was the task?'))}</span><span class="scale">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<span class="pick px-clip" data-pick="${n}">${n}</span>`).join('')}</span><span class="scale-ends"><span>${L(t('Очень сложно', 'Very hard'))}</span><span>${L(t('Очень легко', 'Very easy'))}</span></span></div>
  <div class="tcard summary px-clip"><span class="kicker">${L(t('Саммари по сессиям', 'Session summary'))}</span><span class="card-title">${L(t('30 клиентов ПСБ, 3 задания', '30 PSB customers, 3 tasks'))}</span><table><thead><tr><th>${L(t('Сценарий', 'Flow'))}</th><th>${L(t('Завершили', 'Completed'))}</th><th>First click</th><th>SEQ</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="tcard done px-clip"><span class="check px-clip" aria-hidden="true"><svg viewBox="0 0 12 12" shape-rendering="crispEdges"><path fill="currentColor" d="M1 6h2v2H1zM2 7h2v2H2zM3 8h2v2H3zM5 7h2v2H5zM6 6h2v2H6zM7 5h2v2H7zM8 4h2v2H8zM9 3h2v2H9zM4 9h2v1H4z"/></svg></span><span class="card-title">${L(t('Тест завершён', 'Test complete'))}</span><span class="card-text">${L(t('Запись сохранена. Спасибо за участие!', 'The recording is saved. Thank you for taking part!'))}</span></div>
  <img class="cursor" src="img/psb/scene/gauntlet.png" alt="" width="32" height="32" data-cursor />
</div>`;
}

// The party, standing beside a line they say together (the takeaway of the interviews)
const party = () =>
  `<div class="party" aria-hidden="true"><span class="member">${sprite('swordsman')}${sprite('swordsman-calm', 'face')}</span><span class="member">${sprite('mage')}${sprite('mage-calm', 'face')}</span></div>`;

module.exports = { team, bench, testing, party, symbols };
