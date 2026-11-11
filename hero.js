'use strict';
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const controls = hero.querySelector('.hero-controls');
  const toggle = hero.querySelector('.motion-toggle');
  if (!controls || !toggle) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = true;

  function update() {
    const english = document.documentElement.lang === 'en';
    const stopped = paused || reduced.matches || document.hidden || !visible;
    hero.classList.toggle('is-paused', stopped);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', english ? (paused ? 'Play animation' : 'Pause animation') : (paused ? 'Продолжить анимацию' : 'Приостановить анимацию'));
  }
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(hero);
  controls.hidden = false;
  update();
})();
