'use strict';
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const modal = $('#modal');
let activeLanguage = 'ru';
let previousFocus;
function openModal(title, content) {
  previousFocus = document.activeElement;
  $('#modal-title').textContent = title;
  $('#modal-content').replaceChildren();
  if (typeof content === 'string') { const p = document.createElement('p'); p.textContent = content; $('#modal-content').append(p); }
  else $('#modal-content').append(content);
  modal.showModal();
}
$('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => { if (event.target === modal) { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close(); } });
modal.addEventListener('close', () => previousFocus?.focus());
const menuButton = $('.menu-toggle');
function closeMenu() { menuButton.setAttribute('aria-expanded','false'); $('#main-nav').classList.remove('open'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  $('#main-nav').classList.toggle('open', open);
});
$$('#main-nav a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
document.addEventListener('submit', event => {
  if (!event.target.matches('#application-form')) return;
  event.preventDefault();
  $('#modal-title').textContent = activeLanguage === 'ru' ? 'Заявка в деморежиме' : 'Demo application';
  const message = document.createElement('p');
  message.textContent = activeLanguage === 'ru' ? 'Форма заполнена корректно. Это визуальный прототип: ваши данные никуда не отправлены и не сохранены.' : 'The form is valid. This is a visual prototype: your information has not been sent or saved.';
  $('#modal-content').replaceChildren(message);
});
$$('[data-open-application]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  const content = $('#application-template').content.cloneNode(true);
  if (activeLanguage === 'en') {
    const intro = content.querySelector('.application-modal-intro');
    if (intro) intro.textContent = 'The Russian–Indian Business Council invites you to find partners, join joint projects and develop cooperation between businesses in Russia and India.';
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const original = walker.currentNode.textContent;
      const key = original.trim().replace(/\s+/g, ' ');
      if (normalizedTranslations.has(key)) walker.currentNode.textContent = original.replace(original.trim(), normalizedTranslations.get(key));
    }
  }
  openModal(activeLanguage === 'ru' ? 'Оставить заявку' : 'Apply now', content);
}));
document.addEventListener('click', event => {
  const button = event.target.closest('[data-document]');
  if (!button) return;
  openModal(button.textContent, activeLanguage === 'ru' ? 'Это визуальный прототип сайта. Содержание этого документа не предоставлено в макете. Форма работает в демонстрационном режиме и не передаёт персональные данные.' : 'This is a visual prototype. The design does not include this document. The demonstration form does not transmit personal information.');
});
$$('[data-demo]').forEach(button => button.addEventListener('click', () => openModal(activeLanguage === 'ru' ? button.dataset.demo : 'Demo preview', activeLanguage === 'ru' ? 'Это демонстрационный элемент. Контактные данные и ссылки на социальные сети не указаны в макете.' : 'This is a demonstration element. Contact details and social media links were not supplied in the design.')));
$$('[data-news]').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('.news-card');
  const content = document.createElement('div');
  content.append($('img',card).cloneNode());
  const date = document.createElement('p'); date.textContent = activeLanguage === 'ru' ? '26 октября 2026' : '26 October 2026'; content.append(date);
  const note = document.createElement('p'); note.textContent = activeLanguage === 'ru' ? 'Предпросмотр новости из макета. Полный текст публикации не предоставлен.' : 'News preview from the design. The full article was not supplied.'; content.append(note);
  openModal($('h3',card).textContent,content);
}));

// Count once on entering the viewport, with the reference's 1.6 s ease-out and 80 ms stagger.
const counterElements = $$('[data-counter]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const counterValues = new Map(counterElements.map(element => [element, Number(element.dataset.counter)]));
function formatCounter(element, value) {
  return value.toLocaleString(activeLanguage === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: Number(element.dataset.decimals),
    maximumFractionDigits: Number(element.dataset.decimals)
  });
}
function updateCounterLabels() {
  counterElements.forEach(element => {
    element.textContent = formatCounter(element, counterValues.get(element));
    const card = element.closest('.stat');
    const number = $('.stat-number', card);
    const prefix = [...number.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('');
    const unit = $('.stat-unit', card).textContent;
    $('.sr-only', card).textContent = prefix + formatCounter(element, Number(element.dataset.counter)) + (unit === '%' ? '' : ' ') + unit;
  });
}
if (counterElements.length && !reducedMotion.matches && 'IntersectionObserver' in window) {
  let frame;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    function tick(now) {
      let complete = true;
      counterElements.forEach((element, index) => {
        const progress = Math.max(0, Math.min(1, (now - start - index * 80) / 1600));
        const value = Number(element.dataset.counter) * (1 - Math.pow(1 - progress, 3));
        counterValues.set(element, value);
        element.textContent = formatCounter(element, value);
        if (progress < 1) complete = false;
      });
      if (!complete) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }, { rootMargin: '0px 0px -15% 0px' });
  counterElements.forEach(element => { element.textContent = formatCounter(element, 0); counterValues.set(element, 0); });
  observer.observe($('#statistics'));
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    cancelAnimationFrame(frame);
    counterElements.forEach(element => counterValues.set(element, Number(element.dataset.counter)));
    updateCounterLabels();
  });
}
$('#calendar-open')?.addEventListener('click', () => {
  const content = document.createElement('div');
  $$('.event').forEach(card => {
    const item = document.createElement('article'); item.className = 'calendar-item';
    item.append($('h3',card).cloneNode(true));
    const p = document.createElement('p'); p.textContent = $('.date',card).innerText.replace(/\n/g,' ') + ' · ' + $('.place',card).innerText.replace(/\n/g,', '); item.append(p); content.append(item);
  });
  const note = document.createElement('p'); note.textContent = activeLanguage === 'ru' ? 'Демонстрационный календарь: даты и названия перенесены из макета.' : 'Demonstration calendar: dates and names are taken from the design.'; note.style.marginTop = '20px'; content.append(note);
  openModal(activeLanguage === 'ru' ? 'Календарь событий' : 'Event calendar', content);
});

// The prototype keeps all form values in the current page only. No storage or network submission.
const translations = new Map([
['Российско-Индийский','Russian–Indian'],['Российско-','Russian–'],['Индийский','Indian'],['Деловой Совет','Business Council'],['Российско-Индийский Деловой Совет','Russian–Indian Business Council'],['Перейти к содержимому','Skip to content'],['О Совете','About the Council'],['Аналитика','Insights'],['Мероприятия','Events'],['Новости','News'],['Бизнес с Индией','Business with India'],['Оставить заявку','Apply now'],['Стать участником','Become a member'],['Платформа для развития','A platform for developing'],['экономического партнерства','economic partnerships'],['Развиваем экономическое сотрудничество России и Индии, объединяя бизнес и госструктуры двух стран','Developing economic cooperation between Russia and India, connecting businesses and government institutions'],
['место','place'],['по скорости роста экономики','in economic growth rate'],['млрд','bn'],['население','population'],['трлн','tn'],['объём ВВП','GDP'],['рост иностранных инвестиций','foreign investment growth'],
['Перспективные направления взаимодействия','Promising areas of cooperation'],['Платежи и FX','Payments & FX'],['Торговля и таможня','Trade & customs'],['Инвестиции','Investment'],['Отраслевое развитие','Industry development'],['Человеческий капитал','Human capital'],['Страхование','Insurance'],
['Помогаем проводить международные платежи и выбирать подходящие решения для обмена валют','We help businesses make international payments and find suitable currency exchange solutions'],['Помогаем выстраивать поставки, оформлять таможенные документы и выходить на новые рынки','We help organise supply chains, prepare customs documents and enter new markets'],['Помогаем находить инвестиционные возможности и привлекать капитал для развития бизнеса','We help identify investment opportunities and raise capital for business growth'],['Поддерживаем отраслевые проекты, развитие производства и внедрение новых технологий','We support industry projects, manufacturing development and the adoption of new technologies'],['Помогаем развивать компетенции команд, привлекать специалистов и раскрывать потенциал сотрудников','We help develop team capabilities, attract specialists and unlock employee potential'],['Помогаем подбирать страховые решения для защиты бизнеса, сотрудников и имущества','We help select insurance solutions to protect businesses, employees and property'],
['Задача Совета','Our mission'],['Объединять бизнес России и Индии, поддерживать диалог и создавать условия для совместных проектов','To unite businesses in Russia and India, support dialogue and create opportunities for joint projects'],['Герман Греф','Herman Gref'],['Председатель Совета, Президент, Председатель Правления Сбербанка','Chairman of the Russia–India Business Council, President and Chairman of the Executive Board of Sberbank'],
['Ближайшие мероприятия','Upcoming events'],['20 мероприятий запланировано в 2027 году','20 events planned for 2027'],['Календарь событий','Event calendar'],['января','January'],['февраля','February'],['октября','October'],['Индия','India'],['Гураджат','Gujarat'],['Калькутта','Kolkata'],['Индия, Дели','Delhi, India'],['Глобальная выставка мобильности Bharat 2027 продвигает видение более чистой, умной, программно-определяемой и связанной экосистемы мобильности, которая бесшовно интегрирует городские центры с сельской Индией','Bharat 2027 promotes a cleaner, smarter, software-defined and connected mobility ecosystem that seamlessly connects urban centres with rural India'],['Энергетические форумы как драйвер международного взаимодействия: РЭН и ФСЭГ наметили направления сотрудничества','Energy forums driving international cooperation: Russian Energy Week and GECF outline areas of collaboration'],
['Личные данные','Personal information'],['Имя и фамилия','Full name'],['Компания','Company'],['Адрес электронной почты','Email address'],['Телефон','Phone'],['Комментарий','Comment'],['Согласия и условия','Terms & consent'],['Принимаю условия пользовательского соглашения','I accept the terms of the user agreement'],['Пользовательское соглашение','User agreement'],['Даю согласие на обработку персональных данных в соответствии с политикой конфиденциальности','I consent to the processing of personal data in accordance with the privacy policy'],['Согласие на обработку ПНд','Personal data consent'],['Политика конфиденциальности','Privacy policy'],['Отправить заявку','Submit application'],['Демонстрационная форма. Данные не отправляются.','Demo form. No information is sent.'],['Оставьте заявку','Join the Council'],['Российско-Индийский Деловой Совет приглашает вас находить партнёров, участвовать в совместных проектах и развивать сотрудничество между бизнесом России и Индии','Join the Russia–India Business Council to find partners, take part in joint projects and develop cooperation between Russian and Indian businesses'],['Все права защищены','All rights reserved'],['Наши соцсети','Social media'],['Информация','Information'],['Контакты','Contacts'],['Документы','Documents'],['Инструкции','Instructions']
]);
translations.set('На главную','Back to home');
translations.set('Правление Совета','Council Board');
translations.set('Состав Правления','Board members');
translations.set('Информация о членах Правления будет опубликована после согласования.','Information about Board members will be published after approval.');
translations.set('Развиваем сотрудничество вместе','Developing cooperation together');
translations.set('Способствовать всестороннему развитию партнерства России и Индии, объединяя бизнес, технологии, инвестиции и человеческий капитал двух стран', 'To foster comprehensive partnership between Russia and India, bringing together the businesses, technologies, investment and human capital of both countries');
for (const [ru,en] of [['Промышленность','Industry'],['Финансы и инвестиции','Finance & investment'],['Энергетика','Energy'],['Образование и кадры','Education & talent'],['Технологии и инновации','Technology & innovation'],['Здравоохранение','Healthcare'],['Логистика','Logistics']]) translations.set(ru,en);
const normalizedTranslations = new Map([...translations].map(([key,value]) => [key.replace(/\s+/g, ' ').trim(),value]));
const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (!node.parentElement.closest('script, dialog')) {
    const original = node.textContent; const key = original.trim();
    const normalized = key.replace(/\s+/g, ' ');
    if (normalizedTranslations.has(normalized)) textNodes.push({node, original, english: original.replace(key, normalizedTranslations.get(normalized))});
  }
}
$$('[data-lang]').forEach(button => button.addEventListener('click', () => {
  activeLanguage = button.dataset.lang;
  document.documentElement.lang = activeLanguage;
  textNodes.forEach(({node,original,english}) => node.textContent = activeLanguage === 'ru' ? original : english);
  $$('[data-lang]').forEach(b => { const selected = b === button; b.classList.toggle('selected',selected); b.setAttribute('aria-pressed',String(selected)); });
  const about = document.body.classList.contains('about-page');
  document.title = activeLanguage === 'ru' ? (about ? 'О Совете — ' : '') + 'Российско-Индийский Деловой Совет' : (about ? 'About the Council — ' : '') + 'Russian–Indian Business Council';
  updateCounterLabels();
}));
