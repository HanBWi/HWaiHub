/* HWaiHub – Startseite: Kundenweg (Bereich wählen) und Zusagen im HWaiHub-Haus.
   Rein clientseitig, nichts wird gespeichert oder gesendet. Ohne JavaScript bleibt der erste Bereich sichtbar. */
(function () {
  'use strict';
  // Kundenweg: Bereichsauswahl aktualisiert Problem, Pilot und Ergebnis
  var pick = document.querySelector('.jw-pick');
  if (pick) {
    var btns = Array.prototype.slice.call(pick.querySelectorAll('button'));
    var q = document.getElementById('jwQuote'), pl = document.getElementById('jwPilot'), r = document.getElementById('jwResult');
    var setArea = function (key) {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-k') === key;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (on) {
          if (q) q.textContent = '„' + b.getAttribute('data-quote') + '“';
          if (pl) pl.textContent = b.getAttribute('data-pilot');
          if (r) r.textContent = b.getAttribute('data-result');
        }
      });
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { setArea(b.getAttribute('data-k')); }); });
    // Wer oben im Bereichs-Explorer einen Bereich wählt, sieht hier denselben Weg
    document.addEventListener('hwai:context', function (ev) {
      var k = ev.detail && ev.detail.problem;
      if (k && pick.querySelector('[data-k="' + k + '"]')) setArea(k);
    });
  }

  // HWaiHub-Haus: sieben Zusagen als Tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.hh-promises [role="tab"]'));
  var panel = document.getElementById('hhp-p');
  if (tabs.length && panel) {
    var show = function (t, focus) {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); x.tabIndex = x === t ? 0 : -1; });
      panel.innerHTML = '';
      var s = document.createElement('strong'); s.textContent = t.getAttribute('data-title');
      panel.appendChild(s); panel.appendChild(document.createTextNode(' ' + t.getAttribute('data-text')));
      panel.setAttribute('aria-labelledby', t.id);
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.tabIndex = i === 0 ? 0 : -1;
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('keydown', function (ev) {
        var d = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; ev.preventDefault();
        show(tabs[(i + d + tabs.length) % tabs.length], true);
      });
    });
  }
})();
