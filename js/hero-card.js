/* HWaiHub – interaktive Vorschaukarte im Hero (aus der Ursprungsversion übernommen).
   Sechs Bereiche mit Beispielwerten („Beispielansicht“), nichts wird gespeichert oder gesendet. */
(function () {
  'use strict';
  var data = {
    vertrieb: { score: 78, sub: 'Vertrieb &amp; Angebotsprozess – hoher Hebel', rows: [['Anfrage → Angebot', 'HOHER HEBEL', 1, 'angebot'], ['Nachfassen &amp; CRM-Pflege', 'HOHER HEBEL', 1, 'nachfassen'], ['Kalkulation vorbereiten', 'MITTEL', 0, 'kalkulation']] },
    verwaltung: { score: 84, sub: 'Verwaltung – größter Zeitverlust', rows: [['Eingangsrechnungen erfassen', 'HOHER HEBEL', 1, 'rechnungen'], ['Dokumente klassifizieren &amp; ablegen', 'HOHER HEBEL', 1, 'ablage'], ['Mehrfacheingaben vermeiden', 'MITTEL', 0, 'mehrfach']] },
    kundenservice: { score: 74, sub: 'Kundenservice – schnelle Wirkung', rows: [['Anfragen klassifizieren', 'HOHER HEBEL', 1, 'sortieren'], ['Antwortentwürfe vorbereiten', 'HOHER HEBEL', 1, 'antworten'], ['Standardfragen automatisch lösen', 'MITTEL', 0, 'standard']] },
    wissen: { score: 69, sub: 'Wissen – Suche kostet täglich Zeit', rows: [['Interne Wissenssuche', 'HOHER HEBEL', 1, 'suche'], ['Onboarding-Fragen beantworten', 'MITTEL', 0, 'onboarding'], ['Richtlinien aktuell halten', 'MITTEL', 0, 'richtlinien']] },
    steuerung: { score: 71, sub: 'Steuerung – Zahlen sind da, nicht aufbereitet', rows: [['Kennzahlen automatisch zusammenführen', 'HOHER HEBEL', 1, 'kennzahlen'], ['Monatsreport aufbereiten', 'HOHER HEBEL', 1, 'report'], ['Meeting-Zusammenfassungen', 'MITTEL', 0, 'meetings']] },
    mitarbeiter: { score: 81, sub: 'Mitarbeiter – Lizenzen da, Nutzung niedrig', rows: [['Microsoft 365 &amp; Copilot verankern', 'HOHER HEBEL', 1, 'copilot'], ['Regeln &amp; KI-Richtlinie festlegen', 'HOHER HEBEL', 1, 'richtlinie'], ['Rollenbezogene Schulung', 'MITTEL', 0, 'schulung']] }
  };
  // Englische Seiten: gleiche Beispielwerte, englische Texte
  if (document.documentElement.lang === 'en') data = {
    vertrieb: { score: 78, sub: 'Sales &amp; quote process – high lever', rows: [['Enquiry → quote', 'HIGH LEVER', 1, 'angebot'], ['Follow-up &amp; CRM upkeep', 'HIGH LEVER', 1, 'nachfassen'], ['Prepare calculations', 'MEDIUM', 0, 'kalkulation']] },
    verwaltung: { score: 84, sub: 'Administration – biggest time loss', rows: [['Capture incoming invoices', 'HIGH LEVER', 1, 'rechnungen'], ['Classify &amp; file documents', 'HIGH LEVER', 1, 'ablage'], ['Avoid duplicate entries', 'MEDIUM', 0, 'mehrfach']] },
    kundenservice: { score: 74, sub: 'Customer service – quick impact', rows: [['Classify enquiries', 'HIGH LEVER', 1, 'sortieren'], ['Prepare reply drafts', 'HIGH LEVER', 1, 'antworten'], ['Resolve standard questions automatically', 'MEDIUM', 0, 'standard']] },
    wissen: { score: 69, sub: 'Knowledge – searching costs time every day', rows: [['Internal knowledge search', 'HIGH LEVER', 1, 'suche'], ['Answer onboarding questions', 'MEDIUM', 0, 'onboarding'], ['Keep policies up to date', 'MEDIUM', 0, 'richtlinien']] },
    steuerung: { score: 71, sub: 'Management reporting – figures exist, not prepared', rows: [['Merge metrics automatically', 'HIGH LEVER', 1, 'kennzahlen'], ['Prepare the monthly report', 'HIGH LEVER', 1, 'report'], ['Meeting summaries', 'MEDIUM', 0, 'meetings']] },
    mitarbeiter: { score: 81, sub: 'Employees – licences there, usage low', rows: [['Embed Microsoft 365 &amp; Copilot', 'HIGH LEVER', 1, 'copilot'], ['Set rules &amp; AI policy', 'HIGH LEVER', 1, 'richtlinie'], ['Role-based training', 'MEDIUM', 0, 'schulung']] }
  };
  var card = document.getElementById('hqCard');
  if (!card) return;
  var ring = document.getElementById('hqRing'), num = document.getElementById('hqNum'),
      sub = document.getElementById('hqSub'), rows = document.getElementById('hqRows'),
      more = document.getElementById('hqMore'), scoreLink = document.getElementById('hqScoreLink'),
      chips = Array.prototype.slice.call(card.querySelectorAll('.hq-chips button')), timer, safety, g = 0,
      base = card.getAttribute('data-base') || '';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function set(v) {
    num.textContent = v;
    ring.style.background = 'conic-gradient(#E2B85A 0 ' + v + '%, rgba(255,255,255,.08) ' + v + '% 100%)';
  }
  function paint(k) {
    var d = data[k]; if (!d) return;
    rows.innerHTML = d.rows.map(function (r) {
      return '<a class="hw-row hw-row--link" href="' + base + '#p-' + k + '-' + r[3] + '" title="' + (document.documentElement.lang === 'en' ? 'See problem and solution in this area' : 'Problem und Lösung im Bereich ansehen') + '"><span>' + r[0] + '</span><b' + (r[2] ? '' : ' class="mid"') + '>' + r[1] + ' <i aria-hidden="true">→</i></b></a>';
    }).join('');
    if (scoreLink) scoreLink.setAttribute('href', base + '#bereich-' + k);
    Array.prototype.forEach.call(rows.children, function (el, i) { el.style.animationDelay = (i * 70) + 'ms'; });
    sub.innerHTML = d.sub;
    if (more) more.setAttribute('href', base + '#bereich-' + k);
    var from = parseInt(num.textContent, 10) || 0, to = d.score, t0 = null, gen = ++g;
    cancelAnimationFrame(timer); clearTimeout(safety);
    if (reduce || !from || from === to) { set(to); return; }
    set(from);
    function tick(ts) {
      if (gen !== g) return;
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 520), e = 1 - Math.pow(1 - p, 3);
      set(Math.round(from + (to - from) * e));
      if (p < 1) timer = requestAnimationFrame(tick);
    }
    timer = requestAnimationFrame(tick);
    safety = setTimeout(function () { if (gen === g && parseInt(num.textContent, 10) !== to) { cancelAnimationFrame(timer); set(to); } }, 900);
  }
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
      paint(b.getAttribute('data-k'));
    });
  });
  paint('vertrieb');
})();
