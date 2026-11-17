/* HWaiHub – Kontaktformular
 * Der Formular-Endpunkt kommt ausschließlich aus der zentralen Konfiguration
 * (site.json → formEndpoint → <meta name="hw-form-endpoint">). Kein Token,
 * keine Zugangsdaten im Code: Auf statischem Hosting ist jeder Endpunkt
 * öffentlich; Prüfung, Filter und Rate-Limit erfolgen im Empfänger (Make).
 * Ist kein Endpunkt gesetzt, wird nichts gesendet und auf E-Mail verwiesen.
 */
(function () {
  'use strict';

  var RATE_LIMIT_MAX = 3;
  var RATE_LIMIT_MS = 10 * 60 * 1000;
  var MIN_FILL_MS = 3000; // Zeitfalle gegen Bots

  var MSGS = {
    de: {
      sending: 'Wird gesendet…',
      success: '✓ Nachricht erhalten. Wir melden uns so schnell wie möglich.',
      error: 'Fehler beim Senden. Bitte schreiben Sie direkt an info@hwaihub.com.',
      required: 'Bitte füllen Sie alle Pflichtfelder aus.',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
      gdpr: 'Bitte stimmen Sie der Datenschutzerklärung zu.',
      notset: 'Das Formular ist noch nicht freigeschaltet. Bitte schreiben Sie direkt an info@hwaihub.com.',
      ratelimit: 'Zu viele Anfragen. Bitte warten Sie einige Minuten oder schreiben Sie direkt an info@hwaihub.com.'
    },
    en: {
      sending: 'Sending…',
      success: '✓ Message received. We will get back to you as soon as possible.',
      error: 'Error while sending. Please write directly to info@hwaihub.com.',
      required: 'Please fill in all required fields.',
      email: 'Please enter a valid email address.',
      gdpr: 'Please agree to the privacy policy.',
      notset: 'The form is not active yet. Please write directly to info@hwaihub.com.',
      ratelimit: 'Too many requests. Please wait a few minutes or write directly to info@hwaihub.com.'
    }
  };

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'de').slice(0, 2);
    return MSGS[l] ? l : 'de';
  }
  function t(key) { return (MSGS[lang()] || MSGS.de)[key] || MSGS.de[key]; }

  function endpoint() {
    var m = document.querySelector('meta[name="hw-form-endpoint"]');
    var v = m ? (m.getAttribute('content') || '').trim() : '';
    return /^https:\/\//.test(v) ? v : '';
  }

  function showFeedback(ok, msg) {
    var el = document.getElementById('cf-feedback');
    if (!el) return;
    el.textContent = msg;
    el.setAttribute('role', ok ? 'status' : 'alert');
    el.className = ok ? 'is-ok' : 'is-error';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function hideFeedback() {
    var el = document.getElementById('cf-feedback');
    if (el) el.className = '';
  }
  function setSubmitState(loading) {
    var btn = document.getElementById('cf-submit');
    if (!btn) return;
    if (loading) {
      btn.setAttribute('data-original', btn.textContent);
      btn.disabled = true;
      btn.textContent = t('sending');
    } else {
      btn.disabled = false;
      btn.textContent = btn.getAttribute('data-original') || btn.textContent;
    }
  }

  function rl() {
    try { return JSON.parse(sessionStorage.getItem('hw_contact_rl') || '{"count":0,"since":0}'); }
    catch (e) { return { count: 0, since: 0 }; }
  }
  function isRateLimited() {
    var d = rl();
    if (Date.now() - d.since > RATE_LIMIT_MS) return false;
    return d.count >= RATE_LIMIT_MAX;
  }
  function incrementRateLimit() {
    var d = rl(), now = Date.now();
    if (now - d.since > RATE_LIMIT_MS) d = { count: 0, since: now };
    d.count++;
    try { sessionStorage.setItem('hw_contact_rl', JSON.stringify(d)); } catch (e) {}
  }

  function val(id) { var el = document.getElementById(id); return el ? (el.value || '') : ''; }

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var startedAt = Date.now();

    // Kurs-Knöpfe (Academy): Kurs in der Warteliste vorauswählen
    document.querySelectorAll('[data-interest]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sel = document.getElementById('cf-interest');
        if (sel) sel.value = btn.getAttribute('data-interest');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideFeedback();

      if (val('cf-honeypot')) return;               // Honeypot
      if (Date.now() - startedAt < MIN_FILL_MS) return; // Zeitfalle
      if (isRateLimited()) { showFeedback(false, t('ratelimit')); return; }

      var data = {
        name: val('cf-name').trim(),
        email: val('cf-email').trim(),
        company: val('cf-company').trim(),
        size: val('cf-size'),
        topic: val('cf-topic') || form.getAttribute('data-segment') || '',
        message: val('cf-message').trim(),
        interest: val('cf-interest'),
        source: val('cf-source'),
        lang: lang()
      };
      var gdpr = (document.getElementById('cf-gdpr') || {}).checked || false;
      // Make setzt Felder direkt in den JSON-Text für Notion ein: Name/Unternehmen ohne Sonderzeichen,
      // Nachricht zusätzlich als escapter Text in „notes“ (message bleibt für die E-Mail lesbar)
      data.name = data.name.replace(/["\\]/g, '').replace(/\s+/g, ' ');
      data.company = data.company.replace(/["\\]/g, '').replace(/\s+/g, ' ');
      data.notes = JSON.stringify(data.message.slice(0, 1750)).slice(1, -1);
      // Herkunft eindeutig kennzeichnen: Academy-Warteliste vs. Kontaktformular
      var isWaitlist = form.getAttribute('data-segment') === 'academy_waitlist';
      // Notion-Auswahlwerte immer deutsch (data-de), auch auf den englischen Seiten
      var deText = function (o) { return o.getAttribute('data-de') || o.text; };
      data.tag = isWaitlist ? 'Academy Warteliste' : 'Warm Lead';
      data.form = isWaitlist ? 'warteliste' : 'kontakt';
      if (isWaitlist) {
        // Kurswahl lesbar in Nachricht und Notizen, damit sie in Notion und in der E-Mail sichtbar ist
        var sel = document.getElementById('cf-interest');
        var label = sel && sel.selectedIndex > 0 ? deText(sel.options[sel.selectedIndex]) : 'kein Kurs ausgewählt';
        data.message = 'Academy-Warteliste · Interesse: ' + label;
        data.notes = JSON.stringify(data.message).slice(1, -1);
        if (!data.name) data.name = data.email;
      }
      // Für Notion fertig aufbereitete Felder (Make setzt sie unverändert in den Notion-Aufruf ein)
      var cleanSel = function (t) { return String(t || '').replace(/["\\,]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90); };
      var topicSel = document.getElementById('cf-topic');
      var interestText = isWaitlist
        ? (data.interest ? cleanSel(deText(document.getElementById('cf-interest').options[document.getElementById('cf-interest').selectedIndex])) : 'Academy (noch offen)')
        : (topicSel && topicSel.selectedIndex > 0 ? cleanSel(deText(topicSel.options[topicSel.selectedIndex])) : 'Allgemeine Anfrage');
      data.quelle = isWaitlist ? 'Academy-Warteliste' : 'Website-Kontakt';
      data.interestJson = JSON.stringify([{ name: interestText }]);
      data.phoneJson = 'null';
      data.positionJson = '[]';
      data.page = location.pathname;
      data.submittedAt = new Date().toISOString();
      data.mailExtra = '';
      data.callback = '';

      // Pflichtfelder: alle Felder mit required-Attribut (Kontakt: Name, E-Mail, Nachricht; Warteliste: E-Mail)
      var missing = Array.prototype.some.call(form.querySelectorAll('[required]'), function (f) {
        return f.type === 'checkbox' ? false : !String(f.value || '').trim();
      });
      if (missing || !data.email) { showFeedback(false, t('required')); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) { showFeedback(false, t('email')); return; }
      if (data.name.length > 120 || data.company.length > 160 || data.message.length > 4000) { showFeedback(false, t('required')); return; }
      if (!gdpr) { showFeedback(false, t('gdpr')); return; }
      // Nachweis der Einwilligung (Warteliste: Art. 6 Abs. 1 lit. a DSGVO) – Zeitpunkt steht in submittedAt
      data.consent = true;

      var url = endpoint();
      if (!url) { showFeedback(false, t('notset')); return; }

      setSubmitState(true);
      incrementRateLimit();
      fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          setSubmitState(false);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          showFeedback(true, t('success'));
          form.reset();
        })
        .catch(function () {
          setSubmitState(false);
          showFeedback(false, t('error'));
        });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
