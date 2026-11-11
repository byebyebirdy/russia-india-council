'use strict';
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const controls = hero.querySelector('.hero-controls');
  const toggle = hero.querySelector('.motion-toggle');
  const scenes = [...hero.querySelectorAll('[data-scene-select]')];
  const steps = [...hero.querySelectorAll('[data-scene-step]')];
  const sceneName = hero.querySelector('.hero-scene-name');
  const names = ['Стеклянная волна', 'Световой поток', 'Медленный наезд', 'Контурные волны'];
  const englishNames = ['Glass wave', 'Light sweep', 'Slow cinematic zoom', 'Contour waves'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let visible = true;
  let scene = Number(hero.dataset.scene) || 0;


  function selectScene(index) {
    scene = (index + scenes.length) % scenes.length;
    hero.dataset.scene = String(scene);
    scenes.forEach((button, i) => button.setAttribute('aria-pressed', String(i === scene)));
    update();
  }
  function update() {
    const english = document.documentElement.lang === 'en';
    const stopped = paused || reduced.matches || document.hidden || !visible;
    hero.classList.toggle('is-paused', stopped);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', english ? (paused ? 'Play animation' : 'Pause animation') : (paused ? 'Продолжить анимацию' : 'Приостановить анимацию'));
    scenes.forEach((button, i) => button.setAttribute('aria-label', english ? englishNames[i] : names[i]));
    steps.forEach(button => button.setAttribute('aria-label', button.dataset.sceneStep === '1' ? (english ? 'Next animation variant' : 'Следующий вариант анимации') : (english ? 'Previous animation variant' : 'Предыдущий вариант анимации')));
    sceneName.textContent = english ? englishNames[scene] : names[scene];
  }
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  scenes.forEach((button, index) => button.addEventListener('click', () => selectScene(index)));
  steps.forEach(button => button.addEventListener('click', () => selectScene(scene + Number(button.dataset.sceneStep))));
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }).observe(hero);
  controls.hidden = false;
  update();
})();

