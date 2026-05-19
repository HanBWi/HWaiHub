(function () {
  // ─────────────────────────────────────────────────────────────────
  // KONFIGURATION — nach Make.com-Setup hier die Webhook-URL eintragen
  // ─────────────────────────────────────────────────────────────────
  var WEBHOOK_URL = 'DEINE_MAKE_WEBHOOK_URL_HIER_EINFÜGEN';

  var MSGS = {
    de: {
      sending:  'Wird gesendet…',
      success:  'Vielen Dank! Deine Nachricht ist angekommen. Ich melde mich so bald wie möglich.',
      error:    'Leider ist ein Fehler aufgetreten. Bitte schreib mir direkt an info@hwaihub.com.',
      required: 'Bitte fülle alle Pflichtfelder aus.',
      gdpr:     'Bitte stimme der Datenschutzerklärung zu.',
    },
    en: {
      sending:  'Sending…',
      success:  'Thank you! Your message has been received. I\'ll get back to you as soon as possible.',
      error:    'Something went wrong. Please write to me directly at info@hwaihub.com.',
      required: 'Please fill in all required fields.',
      gdpr:     'Please accept the privacy policy.',
    },
    pl: {
      sending:  'Wysyłanie…',
      success:  'Dziękuję! Twoja wiadomość dotarła. Odezwę się jak najszybciej.',
      error:    'Coś poszło nie tak. Napisz bezpośrednio na info@hwaihub.com.',
      required: 'Proszę wypełnić wszystkie wymagane pola.',
      gdpr:     'Proszę zaakceptować politykę prywatności.',
    },
    pt: {
      sending:  'A enviar…',
      success:  'Obrigada! A sua mensagem foi recebida. Responderei o mais breve possível.',
      error:    'Ocorreu um erro. Por favor escreva diretamente para info@hwaihub.com.',
      required: 'Por favor preencha todos os campos obrigatórios.',
      gdpr:     'Por favor aceite a política de privacidade.',
    },
  };

  function getLang() {
    return localStorage.getItem('hw_lang') || 'de';
  }

  function t(key) {
    var lang = getLang();
    return (MSGS[lang] || MSGS['de'])[key] || MSGS['de'][key];
  }

  function showFeedback(ok, msg) {
    var el = document.getElementById('cf-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = ok ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)';
    el.style.color = ok ? '#4ade80' : '#f87171';
    el.style.border = '1px solid ' + (ok ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)');
    if (ok) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setSubmitState(loading) {
    var btn = document.getElementById('cf-submit');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? t('sending') : (btn.getAttribute('data-original') || 'Nachricht senden →');
    if (!loading && !btn.getAttribute('data-original')) return;
    if (!btn.getAttribute('data-original')) btn.setAttribute('data-original', btn.textContent);
  }

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = (document.getElementById('cf-name')    || {}).value || '';
      var email   = (document.getElementById('cf-email')   || {}).value || '';
      var company = (document.getElementById('cf-company') || {}).value || '';
      var size    = (document.getElementById('cf-size')    || {}).value || '';
      var topic   = (document.getElementById('cf-topic')   || {}).value || '';
      var message = (document.getElementById('cf-message') || {}).value || '';
      var gdpr    = (document.getElementById('cf-gdpr')    || {}).checked || false;

      // Validierung
      if (!name.trim() || !email.trim() || !message.trim()) {
        showFeedback(false, t('required'));
        return;
      }
      if (!gdpr) {
        showFeedback(false, t('gdpr'));
        return;
      }

      // Webhook noch nicht konfiguriert?
      if (!WEBHOOK_URL || WEBHOOK_URL.indexOf('DEINE_') === 0) {
        showFeedback(false, t('error'));
        console.warn('HWaiHub Contact: Webhook-URL nicht konfiguriert. Bitte WEBHOOK_URL in js/contact.js eintragen.');
        return;
      }

      var btn = document.getElementById('cf-submit');
      if (btn && !btn.getAttribute('data-original')) {
        btn.setAttribute('data-original', btn.textContent);
      }
      setSubmitState(true);
      document.getElementById('cf-feedback').style.display = 'none';

      var payload = {
        name:    name.trim(),
        email:   email.trim(),
        company: company.trim(),
        size:    size,
        topic:   topic,
        message: message.trim(),
        lang:    getLang(),
        source:  'hwaihub.com Kontaktformular',
      };

      fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          setSubmitState(false);
          showFeedback(true, t('success'));
          form.reset();
        })
        .catch(function (err) {
          console.error('Contact form error:', err);
          setSubmitState(false);
          showFeedback(false, t('error'));
        });
    });
  }

  // Warten bis DOM bereit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
