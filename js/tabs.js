/* HWaiHub – einfache Reiter für Bereiche mit [data-tabs]: Knöpfe [role=tab] steuern Panels über aria-controls.
   Ohne JavaScript bleiben alle Panels sichtbar. Pfeiltasten wechseln zwischen den Reitern. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    box.classList.add('is-tabbed');
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
        var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
        if (!d) return; ev.preventDefault(); show((i + d + tabs.length) % tabs.length, true);
      });
    });
    show(0);
  });
})();
