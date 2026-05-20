const CODES = { en:'EN', de:'DE', pl:'PL', pt:'PT', es:'ES' };

let currentLang = localStorage.getItem('hw_lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('hw_lang', lang);
  // Close dropdown
  const sw = document.getElementById('langSwitcher');
  if (sw) { sw.classList.remove('open'); }
  const trigger = document.getElementById('langTrigger');
  if (trigger) trigger.setAttribute('aria-expanded','false');
  // Update trigger label
  const codeEl = document.getElementById('langCurrentCode');
  if (codeEl) codeEl.textContent = CODES[lang] || lang.toUpperCase();
  // Update option states
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  // Update all tagged elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (window.T && window.T[lang] && window.T[lang][key] !== undefined) el.textContent = window.T[lang][key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (window.T && window.T[lang] && window.T[lang][key] !== undefined) el.innerHTML = window.T[lang][key];
  });
  // Update form placeholders
  const placeholders = {
    de: { name:'Max Mustermann', email:'max@firma.de', firm:'Musterfirma GmbH', msg:'Beschreib kurz dein Projekt oder deine Frage…' },
    en: { name:'John Smith', email:'john@company.com', firm:'Company Ltd.', msg:'Briefly describe your project or question…' },
    pl: { name:'Jan Kowalski', email:'jan@firma.pl', firm:'Firma Sp. z o.o.', msg:'Krótko opisz swój projekt lub pytanie…' },
    pt: { name:'João Silva', email:'joao@empresa.pt', firm:'Empresa Lda.', msg:'Descreva brevemente o seu projecto ou questão…' },
  };
  const p = placeholders[lang];
  const inputs = document.querySelectorAll('input[type=text], input[type=email], textarea');
  if (inputs[0]) inputs[0].placeholder = p.name;
  if (inputs[1]) inputs[1].placeholder = p.email;
  if (inputs[2]) inputs[2].placeholder = p.firm;
  const ta = document.querySelector('textarea');
  if (ta) ta.placeholder = p.msg;
  // Update html lang attribute
  document.documentElement.lang = lang;
}

// ── Dropdown toggle (called via inline onclick) ──────────────
function toggleLangDropdown(e) {
  e.stopPropagation();
  const sw      = document.getElementById('langSwitcher');
  const trigger = document.getElementById('langTrigger');
  const isOpen  = sw.classList.toggle('open');
  trigger.setAttribute('aria-expanded', String(isOpen));
}

// Close dropdown on outside click
document.addEventListener('click', function() {
  const sw      = document.getElementById('langSwitcher');
  const trigger = document.getElementById('langTrigger');
  if (sw) sw.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
});

// ── Modals (global — referenced from onclick attributes) ─────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
function closeModalOutside(e, overlay) {
  if (e.target === overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ── Cookie Banner (global — referenced from onclick attributes) ──
function acceptCookies() {
  localStorage.setItem('hw_cookies', 'accepted');
  const b = document.getElementById('cookieBanner');
  if (b) b.style.display = 'none';
}
function declineCookies() {
  localStorage.setItem('hw_cookies', 'declined');
  const b = document.getElementById('cookieBanner');
  if (b) b.style.display = 'none';
}

// ── Component loader ─────────────────────────────────────────
// Injects nav and footer from components.js (synchronous — works
// with file://, HTTP, and HTTPS without any CORS restrictions).
function loadComponents() {
  function inject(id, html) {
    var el = document.getElementById(id);
    if (!el || !html) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    el.replaceWith.apply(el, Array.from(tmp.childNodes));
  }
  inject('nav-root',    window.HW_NAV);
  inject('footer-root', window.HW_FOOTER);
}

// ── Init ─────────────────────────────────────────────────────
function initAll() {
  // Hamburger menu
  var hamburger = document.querySelector('.hamburger');
  var navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
    // Close on nav link click (mobile)
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }

  // Cookie banner
  var banner = document.getElementById('cookieBanner');
  if (banner) {
    if (!localStorage.getItem('hw_cookies')) {
      banner.style.display = '';
    } else {
      banner.style.display = 'none';
    }
  }

  // Active nav link — nur Links ohne Hash-Fragment markieren (Kontakt-Link soll nie aktiv sein)
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href && !href.includes('#') && href === current) a.classList.add('active');
  });

  // Branchen-Accordion: nur eine <details> auf einmal öffnen
  var allDetails = document.querySelectorAll('.sv-ind-item');
  if (allDetails.length) {
    allDetails.forEach(function(det) {
      det.addEventListener('toggle', function() {
        if (det.open) {
          allDetails.forEach(function(other) {
            if (other !== det && other.open) {
              other.open = false;
            }
          });
        }
      });
    });
  }

  // Language init
  setLang(currentLang);
}

// ── Boot ─────────────────────────────────────────────────────
// Expose setLang globally so chatbot.js and inline onclick can always find it
window.setLang = setLang;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
    initAll();
  });
} else {
  loadComponents();
  initAll();
}
