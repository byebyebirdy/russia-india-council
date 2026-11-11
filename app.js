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
