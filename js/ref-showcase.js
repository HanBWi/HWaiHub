/* HWaiHub – Referenz-Schaufenster: die Phasen der Datenbank laufen nacheinander durch, die Karte füllt sich.
 * Reine Darstellung, keine Daten. Bei reduzierter Bewegung bleibt alles statisch. */
(function () {
  'use strict';
  var root = document.querySelector('.ref--showcase');
  if (!root) return;
  var items = root.querySelectorAll('.ref-ui-ph li');
  var card = root.querySelector('.ref-ui-card');
  var tag = root.querySelector('[data-ref-tag]');
  var label = root.getAttribute('data-ref-phase') || '';
  if (!items.length || !card || !tag) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0, timer = null, visible = false;
  function show(n) {
    items.forEach(function (li, k) { li.classList.toggle('is-on', k === n); });
    tag.textContent = label + ' ' + items[n].getAttribute('data-n') + ' · ' + items[n].getAttribute('data-name');
    card.classList.remove('is-run'); void card.offsetWidth; card.classList.add('is-run');
  }
  function tick() { i = (i + 1) % items.length; show(i); }
  function start() { if (!timer && visible) timer = setInterval(tick, 2400); }
  function stop() { clearInterval(timer); timer = null; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? (show(i), start()) : stop(); }, { threshold: 0.35 }).observe(root);
  }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
})();
