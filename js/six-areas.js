/* HWaiHub – Bereichs-Explorer „Sechs Bereiche“ auf der Seite „Ihre Situation“.
   Tabs mit Pfeiltasten, Detailansicht je Bereich. Deep-Links: #bereich-<key>, #<key>, #p-<key>-<problem>. */
(function () {
  'use strict';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.hw-tab'));
  if (!tabs.length) return;

  function select(key, opts) {
    opts = opts || {};
    var panel = document.getElementById('panel-' + key);
    if (!panel) return false;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-key') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      var p = document.getElementById('panel-' + t.getAttribute('data-key'));
      if (p) p.hidden = !on;
      if (on && opts.focus) t.focus({ preventScroll: true });
      // Aktiven Reiter in der waagerecht scrollbaren Bereichsleiste sichtbar halten (Handy)
      var bar = t.parentElement;
      if (on && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
    });
    if (opts.scroll) setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
    document.dispatchEvent(new CustomEvent('hwai:context', { detail: { section: 'bereiche', problem: key } }));
    return true;
  }
  // Ein bestimmtes Problem im Bereich hervorheben (aus der Hero-Karte)
  function focusProblem(key, prob) {
    var el = document.getElementById('p-' + key + '-' + prob);
    if (!el) return;
    document.querySelectorAll('.hx-prob.is-focus').forEach(function (x) { x.classList.remove('is-focus'); });
    setTimeout(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('is-focus'); el.focus({ preventScroll: true });
      setTimeout(function () { el.classList.remove('is-focus'); }, 3200);
    }, 60);
  }
  // Liefert [bereich, problem] aus #bereich-x, #x oder #p-x-problem – nur für vorhandene Bereiche
  function parseHash(h) {
    var x = (h || '').match(/#(?:p-([a-z]+)-([a-z0-9-]+)|bereich-([a-z]+)|([a-z]+))$/);
    if (!x) return null;
    var key = x[1] || x[3] || x[4];
    return document.getElementById('panel-' + key) ? [key, x[2] || ''] : null;
  }
  function openFromHash(h) {
    var r = parseHash(h); if (!r) return;
    if (select(r[0], { scroll: !r[1] }) && r[1]) focusProblem(r[0], r[1]);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.getAttribute('data-key'), { scroll: true }); });
    t.addEventListener('keydown', function (ev) {
      var d = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      ev.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      select(n.getAttribute('data-key'), { focus: true });
    });
  });
  // Seiteninterne Links wie #bereich-vertrieb oder #p-vertrieb-angebot öffnen den Bereich
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (!parseHash(h)) return;
    ev.preventDefault();
    try { history.replaceState(null, '', h); } catch (e) {}
    openFromHash(h);
  });
  // Ohne JavaScript sind alle Bereiche untereinander lesbar; mit JavaScript zeigt der Explorer einen Bereich.
  tabs.forEach(function (t) { var p = document.getElementById('panel-' + t.getAttribute('data-key')); if (p) p.hidden = t.getAttribute('aria-selected') !== 'true'; });
  if (parseHash(location.hash)) setTimeout(function () { openFromHash(location.hash); }, 250);
  window.addEventListener('hashchange', function () { openFromHash(location.hash); });
})();
