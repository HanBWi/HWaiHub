(function () {
  // ─────────────────────────────────────────────────────────────────
  // KONFIGURATION — Make.com Webhook → Notion
  // Setup: https://make.com (kostenloser Account)
  // 1. Neues Szenario: Webhooks → Notion (Create Database Item)
  // 2. Webhook-URL von Make.com hier eintragen:
  // ─────────────────────────────────────────────────────────────────
  var WEBHOOK_URL = 'https://hook.eu1.make.com/mtmn2bhcxbo6h8ivvcdp9sj6o1lcer86';

  var MSGS = {
    de: {
      sending:  'Wird gesendet…',
      success:  '✓ Vielen Dank! Deine Nachricht ist angekommen. Ich melde mich so bald wie möglich.',
      error:    'Leider ist ein Fehler aufgetreten. Bitte schreib mir direkt an info@hwaihub.com.',
      required: 'Bitte fülle alle Pflichtfelder aus.',
      gdpr:     'Bitte stimme der Datenschutzerklärung zu.',
      notset:   'Formular noch nicht konfiguriert. Bitte schreib direkt an info@hwaihub.com.',
    },
    en: {
      sending:  'Sending…',
      success:  '✓ Thank you! Your message has been received. I\'ll get back to you as soon as possible.',
      error:    'Something went wrong. Please write to me directly at info@hwaihub.com.',
      required: 'Please fill in all required fields.',
      gdpr:     'Please accept the privacy policy.',
      notset:   'Form not configured yet. Please write directly to info@hwaihub.com.',
    },
    pl: {
      sending:  'Wysyłanie…',
      success:  '✓ Dziękuję! Twoja wiadomość dotarła. Odezwę się jak najszybciej.',
      error:    'Coś poszło nie tak. Napisz bezpośrednio na info@hwaihub.com.',
      required: 'Proszę wypełnić wszystkie wymagane pola.',
      gdpr:     'Proszę zaakceptować politykę prywatności.',
      notset:   'Formularz jeszcze nie skonfigurowany. Napisz na info@hwaihub.com.',
    },
    pt: {
      sending:  'A enviar…',
      success:  '✓ Obrigada! A sua mensagem foi recebida. Responderei o mais breve possível.',
      error:    'Ocorreu um erro. Por favor escreva diretamente para info@hwaihub.com.',
      required: 'Por favor preencha todos os campos obrigatórios.',
      gdpr:     'Por favor aceite a política de privacidade.',
      notset:   'Formulário ainda não configurado. Escreva para info@hwaihub.com.',
    },
    es: {
      sending:  'Enviando…',
      success:  '✓ ¡Gracias! Tu mensaje ha sido recibido. Te responderé lo antes posible.',
      error:    'Algo salió mal. Por favor escríbeme directamente a info@hwaihub.com.',
      required: 'Por favor rellena todos los campos obligatorios.',
      gdpr:     'Por favor acepta la política de privacidad.',
      notset:   'Formulario aún no configurado. Escribe a info@hwaihub.com.',
    },
  };

  function getLang() {
    var l = localStorage.getItem('hw_lang') || 'de';
    return MSGS[l] ? l : 'de';
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
    el.style.color       = ok ? '#4ade80' : '#f87171';
    el.style.border      = '1px solid ' + (ok ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideFeedback() {
    var el = document.getElementById('cf-feedback');
    if (el) el.style.display = 'none';
  }

  function setSubmitState(loading) {
    var btn = document.getElementById('cf-submit');
    if (!btn) return;
    if (loading) {
      btn.setAttribute('data-original', btn.textContent);
      btn.disabled    = true;
      btn.textContent = t('sending');
    } else {
      btn.disabled    = false;
      btn.textContent = btn.getAttribute('data-original') || 'Nachricht senden →';
    }
  }

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideFeedback();

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
      if (!WEBHOOK_URL || WEBHOOK_URL.indexOf('MAKE_') === 0) {
        showFeedback(false, t('notset'));
        return;
      }

      setSubmitState(true);

      fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     name.trim(),
          email:    email.trim(),
          company:  company.trim(),
          size:     size,
          topic:    topic,
          message:  message.trim(),
          lang:     getLang(),
          _subject: 'Neue Anfrage von ' + name.trim() + ' – HWaiHub',
        }),
      })
        .then(function (res) {
          setSubmitState(false);
          // Jede 2xx Antwort von Make.com gilt als Erfolg
          if (res.ok) {
            showFeedback(true, t('success'));
            form.reset();
          } else {
            throw new Error('HTTP ' + res.status);
          }
        })
        .catch(function (err) {
          console.error('Contact form error:', err);
          setSubmitState(false);
          showFeedback(false, t('error'));
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
