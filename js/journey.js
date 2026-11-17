/* HWaiHub – HWaiHub-Weg: Methodenschritte aufklappen (Erklärung je Schritt).
   Ohne JavaScript sind alle Erklärungen sichtbar. Je Phase ist höchstens ein Schritt geöffnet. */
(function () {
  'use strict';
  document.querySelectorAll('[data-journey]').forEach(function (root) {
    root.classList.add('journey--enhanced');
    var btns = Array.prototype.slice.call(root.querySelectorAll('.jr-m-btn'));
    function set(btn, open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var p = document.getElementById(btn.getAttribute('aria-controls'));
      if (p) p.hidden = !open;
    }
    btns.forEach(function (b) { set(b, false); });
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.closest('.jr-mlist').querySelectorAll('.jr-m-btn').forEach(function (x) { set(x, false); });
        set(b, open);
        if (open) document.dispatchEvent(new CustomEvent('hwai:context', { detail: { section: 'method-step', topic: b.id.replace('jr-m-btn-', '') } }));
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') set(b, false);
      });
    });
  });
})();
