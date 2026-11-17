/* HWaiHub – Seitenfunktionen: Navigation, Modals, Hinweisleiste, Teilen, Formular-Vorbelegung, Rechner.
   Keine Tracking-Skripte, keine Drittanbieter. Alles funktioniert auch ohne JavaScript. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var T = function (de, en) { return EN ? en : de; };

  // ── Navigation: Dropdowns (<details>) schließen sich gegenseitig, bei Klick außerhalb und mit Escape ──
  function initNav() {
    var dds = Array.prototype.slice.call(document.querySelectorAll('[data-dd]'));
    dds.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) dds.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
    document.addEventListener('click', function (e) {
      dds.forEach(function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      dds.forEach(function (d) { if (d.open) { d.open = false; d.querySelector('summary').focus(); } });
      var m = document.querySelector('[data-mobile-menu][open]');
      if (m) { m.open = false; m.querySelector('summary').focus(); }
    });
    var mm = document.querySelector('[data-mobile-menu]');
    if (mm) {
      mm.addEventListener('toggle', function () { document.body.style.overflow = mm.open ? 'hidden' : ''; });
      mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mm.open = false; }); });
    }
  }

  // ── Modals ──
  function openModal(id) {
    var el = document.getElementById(id); if (!el) return;
    el.classList.add('open'); document.body.style.overflow = 'hidden';
    var f = el.querySelector('button, a, [tabindex]'); if (f) f.focus();
  }
  function closeModal(id) {
    var el = document.getElementById(id); if (!el) return;
    el.classList.remove('open'); document.body.style.overflow = '';
  }
  function initModals() {
    document.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('[data-open-modal]');
      if (o) { openModal(o.getAttribute('data-open-modal')); return; }
      var c = e.target.closest && e.target.closest('[data-close-modal]');
      if (c) { closeModal(c.getAttribute('data-close-modal')); return; }
      if (e.target.classList && e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(function (m) { closeModal(m.id); });
    });
  }

  // ── Hinweisleiste (nur technisch notwendige Speicherfunktion) ──
  function initCookieBanner() {
    var banner = document.getElementById('cookieBanner'); if (!banner) return;
    var seen = null;
    try { seen = localStorage.getItem('hw_cookies'); } catch (e) {}
    banner.hidden = !!seen;
    document.querySelectorAll('[data-cookie-ok]').forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.setItem('hw_cookies', 'accepted'); } catch (e) {}
        banner.hidden = true;
      });
    });
  }

  // ── Teilen: LinkedIn, E-Mail, Link kopieren (keine Fremdskripte) ──
  function initShare() {
    var canon = document.querySelector('link[rel="canonical"]');
    var pageUrl = canon ? canon.href : location.href.split('#')[0];
    document.querySelectorAll('.hw-share').forEach(function (box) {
      var url = box.getAttribute('data-url') || pageUrl;
      var text = box.getAttribute('data-text') || document.title;
      box.innerHTML = '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url) + '" target="_blank" rel="noopener noreferrer">' + T('Auf LinkedIn teilen', 'Share on LinkedIn') + '</a>' +
        '<a href="mailto:?subject=' + encodeURIComponent(text) + '&body=' + encodeURIComponent(text + ': ' + url) + '">' + T('Per E-Mail senden', 'Send by email') + '</a>' +
        '<button type="button">' + T('Link kopieren', 'Copy link') + '</button>';
      box.querySelector('button').addEventListener('click', function (ev) {
        var b = ev.currentTarget, done = function () { var t = b.textContent; b.textContent = T('Kopiert ✓', 'Copied ✓'); setTimeout(function () { b.textContent = t; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt(T('Link kopieren:', 'Copy link:'), url); });
        else window.prompt(T('Link kopieren:', 'Copy link:'), url);
      });
    });
  }

  // ── UTM: nur in der Sitzung merken, nur bei eigenem Absenden als Feld übergeben (Addendum V3.1, Kap. 21.5) ──
  function utmString(p) {
    return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(function (k) {
      var v = p.get(k); return v ? k.replace('utm_', '') + '=' + v.replace(/[^\w.-]/g, '').slice(0, 60) : '';
    }).filter(Boolean).join('; ');
  }
  function rememberUtm() {
    try {
      var s = utmString(new URLSearchParams(location.search));
      if (s) sessionStorage.setItem('hw_utm', s);
    } catch (e) {}
  }

  // ── Kontaktformular: Thema aus ?thema= vorbelegen, Check-Zusammenfassung übernehmen ──
  function initContactPrefill() {
    var form = document.getElementById('contactForm'); if (!form) return;
    var params = new URLSearchParams(location.search);
    var topic = (params.get('thema') || '').replace(/[^a-z_-]/g, '');
    var sel = document.getElementById('cf-topic');
    if (topic && sel && sel.querySelector('option[value="' + topic + '"]')) sel.value = topic;
    try {
      var summary = sessionStorage.getItem('hw_check_summary');
      var ta = document.getElementById('cf-message');
      if (summary && ta && !ta.value && params.get('ergebnis') === '1') ta.value = summary + '\n\n';
      var src = document.getElementById('cf-source');
      if (src) src.value = sessionStorage.getItem('hw_utm') || '';
    } catch (e) {}
  }

  // ── Zeitverlust-Rechner (rechnet nur im Browser, Beispielwerte) ──
  function initCalc() {
    var P = document.getElementById('rcP'); if (!P) return;
    var H = document.getElementById('rcH'), R = document.getElementById('rcR'), A = document.getElementById('rcA'), Ao = document.getElementById('rcAo');
    var fmt = function (n) { return Math.round(n).toLocaleString(T('de-DE', 'en-GB')); };
    function calc() {
      var p = Math.max(0, parseFloat(P.value) || 0), h = Math.max(0, parseFloat(H.value) || 0), r = Math.max(0, parseFloat(R.value) || 0), a = parseInt(A.value, 10) || 0;
      var hy = p * h * 46, cost = hy * r, gain = cost * a / 100;
      Ao.textContent = a + ' %';
      document.getElementById('rcHeute').textContent = '€' + T(' ', '') + fmt(cost) + T(' pro Jahr', ' per year');
      document.getElementById('rcHeuteH').textContent = fmt(hy) + T(' Stunden pro Jahr', ' hours per year');
      document.getElementById('rcGewinn').textContent = '€' + T(' ', '') + fmt(gain) + T(' pro Jahr', ' per year');
      document.getElementById('rcGewinnH').textContent = fmt(hy * a / 100) + T(' Stunden pro Jahr', ' hours per year');
    }
    [P, H, R, A].forEach(function (el) { el.addEventListener('input', calc); }); calc();
  }

  // Externe Terminbuchung (Microsoft Bookings): neuer Tab, Hinweis für Screenreader
  function initBookingLinks() {
    document.querySelectorAll('a[data-route="booking"]').forEach(function (a) {
      if (!/^https?:\/\//.test(a.getAttribute('href') || '') || a.hostname === location.hostname) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      var s = document.createElement('span');
      s.className = 'visually-hidden';
      s.textContent = T(' (öffnet Microsoft Bookings in einem neuen Tab)', ' (opens Microsoft Bookings in a new tab)');
      a.appendChild(s);
    });
  }

  function init() { initBookingLinks(); initNav(); initModals(); initCookieBanner(); initShare(); rememberUtm(); initContactPrefill(); initCalc(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
