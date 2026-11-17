/* HWaiHub – Wirkung & Kennzahlen: Detailauswertungen als Reiter. Ohne JavaScript stehen alle drei untereinander.
   Deep-Links #dd-vertrieb, #dd-kundenservice, #dd-buchhaltung (aus „Ihre Situation“) öffnen den passenden Reiter. */
(function () {
  'use strict';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.wk-tabs [role="tab"]'));
  if (!tabs.length) return;
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  document.documentElement.classList.add('wk-js');
  function show(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return; ev.preventDefault(); show((i + d + tabs.length) % tabs.length, true);
    });
  });
  function fromHash() {
    var i = panels.findIndex(function (p) { return p && '#' + p.id === location.hash; });
    if (i < 0) return false;
    show(i); setTimeout(function () { document.getElementById('deep-dives').scrollIntoView({ block: 'start' }); }, 60);
    return true;
  }
  if (!fromHash()) show(0);
  window.addEventListener('hashchange', fromHash);
})();
