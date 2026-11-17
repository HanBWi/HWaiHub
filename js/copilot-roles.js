/* HWaiHub – Microsoft Copilot: „Einsatz nach Rolle“ als Reiter. Ohne JavaScript stehen alle Rollen untereinander. */
(function () {
  'use strict';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.cp-tabs [role="tab"]'));
  if (!tabs.length) return;
  document.documentElement.classList.add('cp-js');
  function show(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i, p = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (p) p.hidden = !on;
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
  show(0);
})();
