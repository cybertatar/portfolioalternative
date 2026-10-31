// The PSB case, both languages side by side. tools/case-psb/build.js turns it into the case
// body of sketches/pause.html (between the case:psb markers) and the English dictionary entries.
// Texts come from the main site (src/pages/cases/psb.astro in cybertatar/Portfolio); the
// iterations, success criteria and per-flow results are adapted from the co-author's version of
// the case (psb-portfolio-preview.gremten.workers.dev). No interpuncts anywhere.

const t = (ru, en) => ({ ru, en });
const before = t('Было', 'Before');
const after = t('Стало', 'After');
const notNeeded = t('Не нужен', 'Not needed');

module.exports = {
  toc: [
    ['overview', t('Обзор', 'Overview')],
    ['screens', t('Финальные экраны', 'Final screens')],
    ['process', t('Как мы работали', 'How we worked')],
    ['interviews', t('Интервью', 'Interviews')],
    ['home', t('Главная', 'Home'), t('Решения', 'Solutions')],
    ['card-data', t('Данные карты', 'Card details')],
    ['cashback', t('Подключение кешбэка', 'Activating cashback')],
    ['categories', t('Кешбэк после подключения', 'Cashback after activation')],
    ['testing', t('Тестирование', 'Testing')],
    ['review', t('Ревью', 'Review')],
    ['outcome', t('Выводы', 'Takeaways')],
  ],

  overview: {
    eyebrow: t('ПСБ Mobile, концепт-редизайн', 'PSB Mobile, redesign concept'),
    title: t(
      'Упростил ежедневные действия, которые в приложении ощущались как поход в отделение',
      'I simplified everyday actions that felt like a trip to a bank branch',
    ),
    prose: [
      t(
        'Я не клиент ПСБ, но не раз слышал от друзей и знакомых, что они бросали подключение кешбэка на полпути. В какой-то момент любопытство взяло верх: что же там так путает людей? Я изучил приложение банка и его условия.',
        'I’m not a PSB customer, but I’ve heard from friends more than once that they gave up activating cashback halfway through. At some point curiosity got the better of me: what was confusing people so much? I studied the bank’s app and its terms.',
      ),
      t(
        'Условия по кешбэку хорошие, но подключение растянулось на 12 шагов: переходы в браузер и почтовый клиент, подтверждение почты, несколько согласий, а в конце так и не было понятно, получилось ли.',
        'The cashback terms are good, but activation took 12 steps: jumps to a browser and a mail app, email confirmation, several consents, and at the end it still wasn’t clear whether it had worked.',
      ),
      t(
        'Нашлись сложности и в других сценариях: реквизиты счёта спрятаны глубоко в меню, история операций разбита по картам, а чтобы посмотреть CVV, нужен код из СМС даже после входа по биометрии.',
        'Other flows had their difficulties too: account details are buried deep in the menu, the history is split by card, and viewing the CVV takes a code from a text message even after biometric login.',
      ),
      t(
        'Каждое из этих решений по отдельности объяснимо, но вместе они делают простые действия сложнее, чем нужно. Я решил разобраться, где именно возникают трудности и как сделать эти сценарии удобнее.',
        'Each of these decisions makes sense on its own, but together they make simple actions harder than they need to be. I set out to find where exactly the difficulties arise and how to make these flows easier.',
      ),
    ],
    facts: [
      [t('Роль', 'Role'), t('Продуктовый дизайнер, в паре', 'Product designer, in a team of two')],
      [t('Формат', 'Format'), t('Концепт, 2026', 'Concept, 2026')],
      [t('Сфера', 'Industry'), t('Банк, B2C, мобильное приложение', 'Banking, B2C, mobile app')],
    ],
    quests: [
      [
        'home',
        t('Главная', 'Home'),
        t(
          'Промо и продукты банка спорили с повседневными действиями, историю было трудно найти',
          'Bank promos and products competed with everyday actions, and the history was hard to find',
        ),
        t(
          'Баланс, частые действия и история наверху, а предложения банка можно закрыть',
          'Balance, frequent actions and history at the top, and bank offers can be closed',
        ),
      ],
      [
        'card-data',
        t('Данные карты', 'Card details'),
        t(
          'Данные лежали на третьей вкладке, а CVV открывался только по коду из СМС',
          'The details were on the third tab, and the CVV only showed after a code from a text message',
        ),
        t(
          'Их можно посмотреть и скопировать на одном экране, без кода из СМС',
          'They can be viewed and copied on one screen, with no text message code',
        ),
      ],
      [
        'cashback',
        t('Подключение кешбэка', 'Activating cashback'),
        t(
          '12 шагов через почту и браузер, а подключённый кешбэк не появлялся, пока не перезайдёшь в приложение',
          '12 steps through email and a browser, and the activated cashback didn’t show up until you reopened the app',
        ),
        t(
          'Одна кнопка рядом с условиями, и сразу выбор категорий',
          'One button next to the terms, and straight on to choosing categories',
        ),
      ],
      [
        'categories',
        t('Кешбэк после подключения', 'Cashback after activation'),
        t(
          'Категории нужно было выбирать каждый месяц, а приложение об этом не напоминало',
          'Categories had to be chosen every month, and the app never reminded you',
        ),
        t(
          'Их можно выбрать на месяц вперёд и поменять до его начала',
          'They can be chosen a month ahead and changed before it starts',
        ),
      ],
    ],
    // Number, unit, what it is, the detail; gauge: [before, after] seconds or a share of 1
    stats: [
      ['23', t('с', 's'), t('Подключение кешбэка', 'Activating cashback'), t('вместо 105 с, 5 шагов вместо 12', 'instead of 105 s, 5 steps instead of 12'), [105, 23]],
      ['17', t('с', 's'), t('Путь к данным карты', 'Getting to card details'), t('вместо 42 с, 4 шага вместо 7', 'instead of 42 s, 4 steps instead of 7'), [42, 17]],
      ['89%', null, t('Первый клик верный', 'First click success'), t('начали с правильного действия', 'started with the right action'), 0.89],
      [t('6,4', '6.4'), t('из 7', 'of 7'), t('Оценка лёгкости', 'Ease score'), t('SEQ, среднее по задачам', 'SEQ, average across tasks'), 6.4 / 7],
    ],
    statsNote: t(
      'Юзабилити-тест с 30 клиентами банка: все дошли до конца каждой задачи.',
      'A usability test with 30 of the bank’s customers: everyone got to the end of every task.',
    ),
  },

  screens: {
    eyebrow: t('Итог', 'Outcome'),
    title: t('Финальные экраны', 'Final screens'),
    lead: t(
      'Экраны рабочего прототипа, на котором проходил юзабилити-тест: каждый открывает свой сценарий, а внутри всё приложение целиком.',
      'Screens of the working prototype we ran the usability test on: each opens its own flow, and the whole app is inside.',
    ),
    phones: [
      ['img/psb/main.webp', t('Главная', 'Home')],
      ['img/psb/race/card-data.webp', t('Данные карты', 'Card details')],
      ['img/psb/cb-off.webp', t('Подключение кешбэка', 'Activating cashback')],
    ],
    kit: t(
      'Экраны собраны из UI-кита: на каждый компонент написана спецификация, его варианты, размеры и состояния.',
      'The screens are built from a UI kit: every component has a spec with its variants, sizes and states.',
    ),
    links: [
      [t('UI-кит в Figma', 'UI kit in Figma'), 'https://www.figma.com/design/CzUlWtfXzInfjatugJLjQ1/PSB-Bank-Redesign-Concept?node-id=0-1'],
      [t('Проект в Figma', 'Figma file'), 'https://www.figma.com/design/CzUlWtfXzInfjatugJLjQ1/PSB-Bank-Redesign-Concept?node-id=25-284'],
    ],
  },

  process: {
    eyebrow: t('Процесс', 'Process'),
    title: t('Как мы работали', 'How we worked'),
    steps: [
      [
        t('Дизайнили вдвоём, проверяли у сеньора', 'Designed as a pair, reviewed by a senior designer'),
        t(
          'Пока один предлагал концепцию, другой искал в ней слабые места, потом менялись ролями. Результат показывали сеньору и, если было нужно, дорабатывали по его правкам.',
          'While one of us proposed a concept, the other looked for its weak spots, then we swapped roles. We showed the result to a senior designer and, when needed, reworked it based on the feedback.',
        ),
      ],
      [
        t('Выбрали четыре направления', 'Picked four focus areas'),
        t(
          'Разобрали исходные сценарии и сравнили их в пяти банках. У каждого взяли лучшее и сосредоточились на главной, данных карты, подключении кешбэка и выборе категорий.',
          'We broke down the original flows and compared them across five banks. We took the best from each and focused on the home screen, card details, activating cashback and choosing categories.',
        ),
      ],
      [
        t('Не только макеты', 'More than mockups'),
        t(
          'Завайбкодили прототип для быстрого тестирования: в нём можно пройти сценарии на телефоне, подключить кешбэк, выбрать категории и открыть данные карты.',
          'We vibe-coded a prototype for quick testing: it lets you go through the flows on a phone, activate cashback, choose categories and open card details.',
        ),
      ],
      [
        t('Видели путь, а не только финал', 'We saw the path, not just the finish'),
        t(
          'Прототип сам записывал действия участников: нажатия, прокрутку, переходы между экранами, начало и конец каждого задания.',
          'The prototype logged what participants did: taps, scrolling, screen transitions, the start and the end of each task.',
        ),
      ],
    ],
    video: ['img/psb/walkthrough.mp4', 'img/psb/walkthrough-poster.webp', t('Прохождение прототипа на телефоне', 'Going through the prototype on a phone')],
    criteria: {
      title: t('Критерии успеха', 'Success criteria'),
      lead: t(
        'До редизайна мы дали пяти клиентам банка кликабельную копию исходных экранов и посмотрели, где они ошибаются и сколько времени уходит на задачи. Больше всего проблем было с подключением кешбэка. Новое решение мерили по трём признакам.',
        'Before the redesign we gave five of the bank’s customers a clickable copy of the original screens and watched where they went wrong and how long the tasks took. Activating cashback caused the most trouble. We measured the new design by three signs.',
      ),
      items: [
        [t('Первый клик', 'First click'), t('Человек сразу начинает с правильного действия', 'People start with the right action')],
        [t('Время', 'Time'), t('Новый путь занимает меньше времени, чем исходный', 'The new path takes less time than the original one')],
        [t('Лёгкость', 'Ease'), t('Путь кажется простым и понятным, оценка по шкале SEQ', 'The path feels simple and clear, rated on the SEQ scale')],
      ],
    },
  },

  interviews: {
    eyebrow: t('Исследование', 'Research'),
    title: t('Что показали интервью', 'What the interviews showed'),
    lead: t(
      'Когда масштаб был выбран, мы поговорили с тремя клиентами ПСБ, чтобы сопоставить свои предположения с их опытом.',
      'Once the scope was set, we talked to three PSB customers to check our assumptions against their experience.',
    ),
    video: ['interviews', t('Фрагменты интервью', 'Interview excerpts')],
    findings: [
      [
        t('Похожие названия сбивали с толку', 'Similar names were confusing'),
        t(
          'Кешбэк подключался через «Бонусный счёт», а «Кешбэк и скидки» открывал список партнёров.',
          'Cashback was activated through the “Bonus account”, while “Cashback and discounts” opened a list of partners.',
        ),
      ],
      [
        t('Данные карты искали вне приложения', 'Card details came from the physical card'),
        t(
          'Лояльный клиент искал данные своей карты не в приложении: он достал её из кошелька.',
          'A loyal customer didn’t look for their card details in the app: they took the card out of their wallet.',
        ),
      ],
      [
        t('Не сразу верилось, что это банк', 'Hard to believe it was a real bank'),
        t(
          'Экраны выглядели собранными по шаблону, и один участник при первом знакомстве засомневался, что перед ним настоящее приложение банка.',
          'The screens looked put together from a template, and at first sight one participant doubted it was a real banking app.',
        ),
      ],
    ],
    say: [
      t('Вывод', 'Takeaway'),
      t(
        'Одного сокращения пути было недостаточно. Нужно было сделать понятным весь процесс: где найти нужное, как выполнить действие и увидеть результат.',
        'Shortening the path alone wasn’t enough. The whole process had to make sense: where to find what you need, how to do it and how to see the result.',
      ),
    ],
  },

  solutions: [
    {
      id: 'home',
      title: t('Главная страница', 'Home screen'),
      lead: t(
        'Повседневные задачи и предложения банка должны быть заметны одновременно, но не конкурировать между собой.',
        'Everyday tasks and bank offers should be visible at the same time without competing with each other.',
      ),
      problem: [
        t(
          'Повседневные операции, промо и другие продукты банка имели почти одинаковый вес. Историю операций было трудно найти: у каждой карты она своя, на отдельной вкладке.',
          'Everyday actions, promos and other bank products carried almost the same weight. The history was hard to find: each card had its own, on a separate tab.',
        ),
        t(
          'В кешбэк было сложно попасть: «Бонусный счёт» лежал в самом конце главной.',
          'Cashback was hard to get to: the “Bonus account” sat at the very bottom of the home screen.',
        ),
      ],
      solution: [
        t(
          'Сохранили привычную модель главной: сгруппировали баланс, действия и историю и показали карты внутри их счетов.',
          'We kept the familiar home screen model: grouped the balance, actions and history, and showed the cards inside their accounts.',
        ),
        t(
          'На главной планировался отдельный блок кешбэка, но вместе с вкладкой и бейджем получалось три входа. Блок убрали и оставили бейдж, чтобы проверить, заметят ли его.',
          'We planned a separate cashback block on the home screen, but with the tab and the badge that made three ways in. We dropped the block and kept the badge, to see whether people would notice it.',
        ),
      ],
      pair: [
        ['img/psb/before/cb-01.webp', before],
        ['img/psb/main.webp', after],
      ],
      variants: {
        title: t('Варианты главной', 'Home screen options'),
        items: [
          [
            'img/psb/iter/rejected-barrel.webp',
            t('Барабан карт', 'Card carousel'),
            t(
              'Карты шли друг за другом, и связь счёт → карта считывалась хуже. Если карт много, нужную найти тяжело.',
              'The cards came one after another, so the account → card link read worse. With many cards, finding the right one was hard.',
            ),
          ],
          [
            'img/psb/iter/home-iter-euro.webp',
            t('Европейский стандарт', 'European standard'),
            t(
              'Мастер-счёт и быстрые действия на градиенте, как в европейских необанках. Для клиентов ПСБ непривычно.',
              'A master account and quick actions on a gradient, as in European neobanks. Unfamiliar to PSB customers.',
            ),
          ],
          [
            'img/psb/main.webp',
            t('Привычная иерархия', 'Familiar hierarchy'),
            t(
              'Баланс, счета с картами внутри, действия и история: всё на первом экране, в привычном порядке.',
              'Balance, accounts with their cards, actions and history: all on the first screen, in the usual order.',
            ),
            true,
          ],
        ],
      },
      rows: [
        [t('Баланс', 'Balance'), t('«Всего доступно средств» в отдельной карточке', '“Total available funds” in a separate card'), t('«Всего на счетах» наверху, рядом бейдж кешбэка', '“Total in accounts” at the top, with a cashback badge next to it')],
        [t('Карты и счета', 'Cards and accounts'), t('Два отдельных списка', 'Two separate lists'), t('Карты внутри своих счетов', 'Cards inside their accounts')],
        [t('Частые действия', 'Frequent actions'), t('Нет на главной', 'Not on the home screen'), t('QR, перевод, по номеру и пополнение под счетами', 'QR, transfers, by phone number and top-ups under the accounts')],
        [t('Предложения банка', 'Bank offers'), t('Вес как у продуктов, среди счетов и карт', 'As prominent as products, among the accounts and cards'), t('Баннеры сверху, их можно закрыть', 'Banners at the top that can be closed')],
        [t('Кешбэк', 'Cashback'), t('«Бонусный счёт» в конце главной', '“Bonus account” at the very bottom'), t('Бейдж у баланса и вкладка «Выгода»', 'A badge by the balance and the “Benefits” tab')],
        [t('История', 'History'), t('Отдельная вкладка, у каждой карты своя', 'A separate tab, split by card'), t('На главной, сразу под действиями', 'On the home screen, right under the actions')],
      ],
      result: t(
        'История стала общей и всегда видна на первом экране. Кешбэк нашли все 30 участников. Бейдж заметили, его стоит проверить A/B-тестом.',
        'The history is shared now and always on the first screen. All 30 participants found cashback. The badge got noticed; it’s worth an A/B test.',
      ),
      stats: [
        ['63%', null, t('нашли кешбэк через вкладку «Выгода»', 'found cashback through the “Benefits” tab')],
        ['37%', null, t('через бейдж у баланса: второй вход не остался незамеченным', 'through the badge by the balance: the second way in got noticed')],
      ],
    },
    {
      id: 'card-data',
      title: t('Данные карты', 'Card details'),
      lead: t(
        'Посмотреть и скопировать данные карты должно быть простым и понятным действием сразу после входа в приложение.',
        'Viewing and copying card details should be a simple, clear action right after opening the app.',
      ),
      problem: [
        t(
          'Данные лежали на третьей вкладке карты, а CVV открывался только по коду из СМС, даже после входа по биометрии или ПИН-коду.',
          'The details were on the card’s third tab, and the CVV only opened with a code from a text message, even after logging in with biometrics or a PIN.',
        ),
        t(
          'Один участник из-за долгого поиска достал физическую карту и списал данные с неё.',
          'Because the search took so long, one participant took out the physical card and copied the details from it.',
        ),
      ],
      solution: [
        t(
          'Связали счета и их карты и собрали просмотр и копирование на одном экране.',
          'We linked accounts with their cards and put viewing and copying on one screen.',
        ),
        t(
          'Код из СМС перед показом CVV убрали: клиент уже вошёл по ПИН-коду или биометрии, и у конкурентов этого хватает, пока сессия активна. Сейчас так делает и сам ПСБ.',
          'We dropped the text message code before the CVV: the customer has already logged in with a PIN or biometrics, which is enough for competitors while the session is active. PSB itself does this now.',
        ),
      ],
      race: [
        [before, 7, 42, [
          ['before/card-01', t('Главная, карта в «Картах»', 'Home, the card under “Cards”')],
          ['before/card-02', t('«Настройки» карты', 'The card’s “Settings”')],
          ['before/card-03', t('Свайп, «История»', 'Swipe, “History”')],
          ['before/card-04', t('Третья вкладка, «О карте»', 'Third tab, “About the card”')],
          ['before/card-05', t('Номер скрыт', 'Number hidden')],
          ['before/card-07', t('Удержал поле, скопировано', 'Held the field, copied')],
          ['before/card-08', t('CVV только по СМС', 'CVV only via text message')],
          ['before/card-09', t('Код не подставился', 'The code didn’t autofill')],
          ['before/card-10', t('Согласие подтверждено', 'Consent confirmed')],
        ]],
        [after, 4, 17, [
          ['race/card-home', t('Главная, текущий счёт', 'Home, current account')],
          ['race/card-account', t('Карта внутри счёта', 'The card inside the account')],
          ['race/card-card', t('«Данные карты» на карте', '“Card details” on the card')],
          ['race/card-data', t('Номер, срок и CVV сразу', 'Number, expiry and CVV at once')],
          ['race/card-copied', t('Скопировано', 'Copied')],
        ]],
      ],
      rows: [
        [t('Где найти', 'Where to find'), t('Третья вкладка в карточке карты', 'The third tab on the card’s page'), t('Карта внутри счёта, данные на ней', 'The card inside its account, the details on the card')],
        ['CVV', t('Только по коду из СМС, даже после входа по биометрии', 'Only with a text message code, even after biometric login'), t('Сразу, вместе с номером и сроком', 'Right away, with the number and the expiry date')],
        [t('Выход из приложения', 'Leaving the app'), t('В сообщения за кодом: сам он не подставлялся', 'Off to Messages for the code, which didn’t autofill'), notNeeded],
        [t('Копирование', 'Copying'), t('Удержать поле, пока внизу не появится подсказка', 'Hold the field until a hint pops up'), t('Кнопка у каждого поля и плашка «Скопировано»', 'A button by every field and a “Copied” toast')],
      ],
      result: t(
        'Большинство нашли данные сразу. Но тем, у кого ПСБ единственный банк, карты внутри счёта были непривычны, а переворот карты оказался не самым явным способом показать данные. Это видно по оценке лёгкости, самой низкой в тесте.',
        'Most people found the details right away. But for those whose only bank is PSB, cards inside an account felt unfamiliar, and flipping the card wasn’t the most obvious way to show the details. The ease score, the lowest in the test, shows it.',
      ),
      stats: [
        ['83%', null, t('сразу начали с правильного действия', 'started with the right action')],
        ['67%', null, t('прошли без единой ошибки', 'finished without a single error')],
        [t('6,0', '6.0'), t('из 7', 'of 7'), t('оценка лёгкости', 'ease score')],
      ],
    },
    {
      id: 'cashback',
      title: t('Подключение кешбэка', 'Activating cashback'),
      lead: t(
        'Кешбэк — самая популярная программа лояльности в российских банках, и подключить его должно быть не сложнее, чем прочитать условия.',
        'Cashback is the most popular loyalty program at Russian banks, and activating it should be no harder than reading the terms.',
      ),
      problem: [
        t(
          'Один человек на замере старого приложения бросил поиски: в «Кешбэк и скидки» был только список партнёров, а сам кешбэк прятался в «Бонусном счёте».',
          'One person in the test of the old app gave up searching: “Cashback and discounts” held only a list of partners, and the cashback itself hid in the “Bonus account”.',
        ),
        t(
          'Те, кто дошёл до конца, упирались в тупик: после подключения ничего не менялось, пока не перезайдёшь в приложение.',
          'Those who made it to the end hit a dead end: nothing changed after activation until you reopened the app.',
        ),
      ],
      solution: [
        t(
          'Саму программу не трогали, упростили путь: убрали выходы в почту и браузер и объединили подключение с первым выбором категорий.',
          'We left the program itself alone and simplified the path: no more trips to mail and a browser, and activation merged with the first choice of categories.',
        ),
        t(
          'Вместо нескольких согласий осталась кнопка «Подключить кешбэк» с условиями под ней, как у других банков.',
          'Instead of several consents there is one “Activate cashback” button with the terms under it, as at other banks.',
        ),
      ],
      race: [
        [before, 12, 105, [
          ['before/cb-01', t('Главная', 'Home')],
          ['before/cb-02', t('Внизу «Бонусный счёт»', '“Bonus account” at the bottom')],
          ['before/cb-03', t('Условия и «Подключить»', 'Terms and “Activate”')],
          ['before/cb-04', t('Почта и два согласия', 'Email and two consents')],
          ['before/cb-05', t('Ждём письмо', 'Waiting for the email')],
          ['before/cb-06', t('Не дождался, ошибка', 'Gave up waiting, an error')],
          ['before/cb-07', t('Письмо в почте', 'The email in the mail app')],
          ['before/cb-08', t('Ссылка в браузере', 'The link in a browser')],
          ['before/cb-09', t('Согласие не открыть', 'The consent won’t open')],
          ['before/cb-10', t('Готово', 'Done')],
          ['before/cb-01', t('А на главной кешбэка нет', 'Still no cashback on the home screen')],
        ]],
        [after, 5, 23, [
          ['race/start', t('«Хочу подключить» в «Выгоде»', '“I want to activate” in “Benefits”')],
          ['race/cats-0', t('Выбор трёх категорий', 'Choosing three categories')],
          ['race/cats-3', t('Отметил три', 'Ticked three')],
          ['race/success', t('Кешбэк подключён', 'Cashback activated')],
        ]],
      ],
      rows: [
        [t('Где найти', 'Where to find'), t('«Бонусный счёт» внизу главной', '“Bonus account” at the bottom of home'), t('«Выгода» в таббаре и бейдж у баланса', '“Benefits” in the tab bar and a badge by the balance')],
        [t('Выход из приложения', 'Leaving the app'), t('В почту за письмом, в браузер по ссылке', 'To mail for an email, to a browser for a link'), notNeeded],
        [t('Согласия', 'Consents'), t('Два переключателя и экран, который не открыть', 'Two toggles and a screen that won’t open'), t('Одна кнопка рядом с условиями', 'One button next to the terms')],
        [t('Категории', 'Categories'), t('Отдельно, после подключения', 'Separately, after activation'), t('Сразу, кнопка считает выбранные', 'Right away, the button counts them')],
        [t('После подключения', 'After activation'), t('Главная как раньше, пока не перезайдёшь', 'Home stays the same until you reopen the app'), t('Кешбэк сразу виден у баланса', 'Cashback shows by the balance right away')],
      ],
      result: t(
        'Все участники подключили кешбэк, и большинство сразу начали с правильного действия. Без ошибок прошли не все: по пути отвлекались на плитки предложений, их вес стоит ослабить в следующей итерации.',
        'Every participant activated cashback, and most started with the right action. Not everyone got through without errors: the offer tiles drew attention along the way, and their weight is worth toning down next.',
      ),
      stats: [
        ['83%', null, t('сразу начали с правильного действия', 'started with the right action')],
        ['63%', null, t('прошли без единой ошибки', 'finished without a single error')],
        [t('6,5', '6.5'), t('из 7', 'of 7'), t('оценка лёгкости', 'ease score')],
      ],
    },
    {
      id: 'categories',
      title: t('Кешбэк после подключения', 'Cashback after activation'),
      lead: t(
        'Кешбэк должен приносить выгоду каждый месяц, а не только после первого подключения.',
        'Cashback should pay off every month, not only after the first activation.',
      ),
      problem: [
        t(
          'В интервью человек рассказал, что забывает выбрать категории в начале месяца, а иногда вообще не находит кешбэк. Приложение не напоминало, а кнопка выбора была незаметной.',
          'In an interview someone told us they forget to choose categories at the start of the month, and sometimes can’t find cashback at all. The app never reminded them, and the choose button was easy to miss.',
        ),
        t(
          'Выгоду нельзя было увидеть сразу, поэтому не было повода возвращаться.',
          'The benefit wasn’t visible at a glance, so there was no reason to come back.',
        ),
      ],
      solution: [
        t(
          'Категории на следующий месяц можно выбрать заранее и поменять до его начала.',
          'Categories for next month can be chosen in advance and changed before it starts.',
        ),
        t(
          'Блок статистики показывает, сколько баллов принесла каждая категория: это повод пользоваться кешбэком дальше.',
          'A stats block shows how many points each category brought in: a reason to keep using cashback.',
        ),
      ],
      race: [
        [before, 7, t('28,7', '28.7'), [
          ['before/card-01', t('Главная', 'Home')],
          ['before/cats-02', t('Ищет кешбэк, листая главную', 'Scrolling home for cashback')],
          ['before/cats-03', t('«Бонусный счёт» внизу', '“Bonus account” at the bottom')],
          ['before/cats-04', t('Выбрал, проверка данных', 'Chosen, checking the details')],
          ['before/cats-05', t('Операция выполнена', 'Operation completed')],
        ]],
        [after, 6, 14, [
          ['race/next-home', t('Главная, вкладка «Выгода»', 'Home, the “Benefits” tab')],
          ['race/next-cashback', t('«Категории на октябрь»', '“Categories for October”')],
          ['race/next-0', t('Выбор трёх категорий', 'Choosing three categories')],
          ['race/next-3', t('Отметил три', 'Ticked three')],
          ['race/next-success', t('Категории выбраны', 'Categories chosen')],
        ]],
      ],
      variants: {
        title: t('Варианты блока статистики', 'Stats block options'),
        items: [
          [
            'img/psb/iter/iter-benefit-2-line.webp',
            t('График по месяцам', 'Monthly chart'),
            t('Выглядел красиво, но не объяснял, за что начислен кешбэк.', 'Looked nice, but didn’t explain what the cashback was for.'),
          ],
          [
            'img/psb/iter/iter-benefit-3-pics.webp',
            t('Категории картинками', 'Categories as pictures'),
            t('Понятно, но занимает полэкрана, и выбору на следующий месяц не хватает места.', 'Clear, but takes half the screen, leaving no room to choose next month.'),
          ],
          [
            'img/psb/iter/iter-benefit-1-month.webp',
            t('Полоса по категориям', 'Bar by category'),
            t('Видно, сколько принесла каждая категория, а «Весь год» одним нажатием показывает выгоду за год.', 'You see what each category brought in, and “Whole year” shows the year’s benefit in one tap.'),
            true,
          ],
        ],
      },
      rows: [
        [t('Где найти', 'Where to find'), t('«Бонусный счёт» в конце главной', '“Bonus account” at the very bottom'), t('«Выгода» в таббаре', '“Benefits” in the tab bar')],
        [t('Напоминание', 'Reminder'), t('Нет, о новом месяце нужно помнить самому', 'None, you remember the new month yourself'), t('Плашка «Категории на октябрь» с кнопкой «Выбрать»', 'A “Categories for October” banner with a “Choose” button')],
        [t('Когда выбирать', 'When to choose'), t('Каждый месяц, когда он уже начался', 'Every month, once it has started'), t('Заранее, и поменять до начала месяца', 'In advance, changeable before the month starts')],
        [t('Подтверждение', 'Confirmation'), t('Отдельный экран с юридическими формулировками', 'A separate screen of legal wording'), t('Кнопка «Подключить» под категориями', 'An “Activate” button under the categories')],
      ],
      result: t(
        'Выбор устроен так же, как при первом подключении, поэтому разбираться заново не пришлось. Оценка лёгкости здесь самая высокая в тесте.',
        'The choice works the same as on first activation, so nobody had to figure it out again. The ease score here is the highest in the test.',
      ),
      stats: [
        ['100%', null, t('сразу начали с правильного действия', 'started with the right action')],
        ['90%', null, t('прошли без единой ошибки', 'finished without a single error')],
        [t('6,7', '6.7'), t('из 7', 'of 7'), t('оценка лёгкости', 'ease score')],
      ],
    },
  ],

  testing: {
    eyebrow: t('Проверка', 'Validation'),
    title: t('Тестирование с 30 клиентами', 'Testing with 30 customers'),
    lead: t(
      'Тест в рабочем прототипе прошли 30 клиентов ПСБ, часть сами, часть на созвоне. Мы смотрели на достижение цели, первое действие и лёгкость. Все справились без помощи.',
      'Thirty PSB customers took the test in the working prototype, some on their own, some on a call. We looked at task success, the first action and ease. Everyone managed without help.',
    ),
    bars: [
      [t('Подключение кешбэка', 'Activating cashback'), 105, 23],
      [t('Данные карты', 'Card details'), 42, 17],
      [t('Выбор категорий', 'Choosing categories'), 28.7, 14],
    ],
    head: [t('Сценарий', 'Flow'), t('Завершили', 'Completed'), t('Первый клик', 'First click'), 'SEQ'],
    tests: [
      [t('Подключить кешбэк', 'Activate cashback'), '30/30', '83%', t('6,5/7', '6.5/7')],
      [t('Выбрать категории', 'Choose categories'), '30/30', '100%', t('6,7/7', '6.7/7')],
      [t('Скопировать данные карты', 'Copy card details'), '30/30', '83%', t('6,0/7', '6.0/7')],
    ],
    note: t(
      'Медианное время. «Было» — пять клиентов банка на кликабельной копии исходных экранов, медиана тех, кто дошёл до конца.',
      'Median times. “Before” is five of the bank’s customers on a clickable copy of the original screens, the median of those who finished.',
    ),
  },

  review: {
    eyebrow: t('Ревью', 'Review'),
    title: t('Что сказал сеньор', 'What the senior designer said'),
    video: ['review', t('Ревью кейса от сеньор-дизайнера', 'Case review by a senior designer')],
  },

  outcome: {
    eyebrow: t('Выводы', 'Takeaways'),
    title: t('Опыт, который я получил', 'The experience I gained'),
    prose: [
      t(
        'Проект стал для меня новым опытом во многих отношениях. Мы прекрасно сработались с коллегой и освоили вайбкодинг — отличный инструмент для проверки гипотез. Прототипы в Figma сильно ограничены и то и дело ломаются, а здесь можно собрать живой прототип и получить данные о том, как им пользуются люди. Это расширяет возможности для проверки гипотез и ускоряет итерации.',
        'The project was a new experience for me in many ways. My colleague and I worked together wonderfully and got the hang of vibe coding, a great tool for testing hypotheses. Figma prototypes are very limited and keep breaking, whereas here you can build a live prototype and get data on how people use it. That opens up more ways to test hypotheses and speeds up iterations.',
      ),
      t(
        'Пока я работал над дизайном и изучал конкурентов, вспомнил давний холивар: что важнее, UX или UI? На этом проекте я убедился, что они важны в равной степени. Без хорошего визуала человек может просто не дойти до самых продуманных решений. А с одним визуалом, без сопровождения на всём пути, он не доберётся до результата.',
        'While working on the design and studying competitors, I recalled an old holy war: which matters more, UX or UI? This project convinced me they matter equally. Without good visuals, a person may never reach the most carefully thought-out solutions. And with visuals alone, without guidance all the way through, they won’t get to the result.',
      ),
      t('Отдельное спасибо Игорю Плющу: он делился опытом и ревьюил проект.', 'Special thanks to Igor Plyusch: he shared his experience and reviewed the project.'),
    ],
    nextTitle: t('Что бы я ещё протестировал', 'What I’d test next'),
    next: [
      [
        t('Вход в кешбэк', 'The way into cashback'),
        t(
          'В тесте кешбэк искали по заданию, а в жизни на него натыкаются случайно. Стоит проверить, заметят ли его сами, и, если подключение в приоритете, попробовать на главной баннер с выгодой.',
          'In the test people looked for cashback because the task said so; in real life they come across it by chance. It’s worth checking whether they notice it on their own and, if activation is a priority, trying a banner on the home screen.',
        ),
      ],
      [
        t('Данные карты', 'Card details'),
        t(
          'Сравнить переворот карты с блоком данных под ней. Участникам старшей возрастной группы переворот, похоже, давался сложнее, особенно тем, у кого ПСБ единственный банк.',
          'Compare flipping the card with a block of details under it. Older participants seemed to find the flip harder, especially those whose only bank is PSB.',
        ),
      ],
      [
        t('Подключение кешбэка', 'Activating cashback'),
        t(
          'Часть участников по пути первым делом цепляла плитки предложений. Можно ослабить их визуальный вес и проверить это в следующих итерациях.',
          'Along the way, some participants went for the offer tiles first. Their visual weight could be toned down and tested in the next iterations.',
        ),
      ],
    ],
  },
};
