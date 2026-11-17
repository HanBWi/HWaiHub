/* HWaiHub – Fördercheck / Förder-Navigator (Blueprint V3, Kap. 15) · Funding check (EN)
   Sieben Fragen, Auswertung nur im Browser, keine personenbezogenen Daten.
   Einordnung: A besonders relevant zur Prüfung · B könnte relevant sein / Informationen fehlen ·
   C derzeit eher nicht passend (mit belegtem Grund) · D kostenlose Unterstützung.
   Keine Prozentwerte, kein Score, keine Förderzusage. Unsichere Programme erhalten nie A.
   Ausgelaufene Programme zählen nie als Ergebnis. Fristen werden zur Laufzeit geprüft.
   Sprache: Deutsch und Englisch aus derselben Logik (T(de, en)); die Programmtexte kommen je Sprache fertig aus foerderPublic. */
(function () {
  'use strict';
  // Logo aus der zentralen Quelle (partials/logo.njk über <template id="hwLogoTpl"> im Basis-Layout)
  var LOGO = (function () { var t = document.getElementById('hwLogoTpl'); return t ? t.innerHTML : 'HWaiHub'; })();
  var root = document.getElementById('fc'); if (!root) return;
  var data;
  try { data = JSON.parse(document.getElementById('fc-data').textContent); } catch (e) { return; }
  var EN = document.documentElement.lang === 'en';
  var T = function (de, en) { return EN ? en : de; };
  var el = function (id) { return document.getElementById(id); };
  var qs = Array.prototype.slice.call(root.querySelectorAll('.pc-q'));
  var step = 0;
  root.classList.add('pc--enhanced');

  var TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  var LAND = EN
    ? { BW: 'Baden-Württemberg', BY: 'Bavaria', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg', HE: 'Hesse', MV: 'Mecklenburg-Western Pomerania', NI: 'Lower Saxony', NW: 'North Rhine-Westphalia', RP: 'Rhineland-Palatinate', SL: 'Saarland', SN: 'Saxony', ST: 'Saxony-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thuringia' }
    : { BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg', HE: 'Hessen', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen' };
  var KOSTEN = EN
    ? { beratung: 'consulting', software: 'software', implementierung: 'implementation', hardware: 'hardware', personal: 'own staff', entwicklung: 'development', schulung: 'training', fue: 'research and development' }
    : { beratung: 'Beratung', software: 'Software', implementierung: 'Implementierung', hardware: 'Hardware', personal: 'eigenes Personal', entwicklung: 'Entwicklung', schulung: 'Schulung', fue: 'Forschung und Entwicklung' };
  // Förderart: die Daten bleiben deutsch (die Logik prüft darauf), angezeigt wird je Sprache
  var ART = { 'Förderkredit': 'Promotional loan', 'Zuschuss': 'Grant', 'Weiterbildung': 'Further training', 'sonstige': 'Other', 'kostenlose Unterstützung': 'Free support', 'Beratung': 'Consulting' };
  var GROUPS = [
    ['A', T('Besonders relevant zur Prüfung', 'Particularly relevant to look into'), T('Nach Ihren Angaben passen Vorhaben und Rahmenbedingungen gut. Sie sollten diese Programme prüfen.', 'According to your answers, your project and conditions fit well. You should look into these programmes.')],
    ['B', T('Könnte relevant sein – Informationen fehlen', 'Could be relevant – information missing'), T('Diese Programme könnten in Frage kommen. Einzelne Punkte sind offen oder müssen geprüft werden.', 'These programmes could be an option. Some points are open or need to be checked.')],
    ['D', T('Kostenlose Unterstützung', 'Free support'), T('Kostenlose Angebote für eine erste Einordnung oder Begleitung.', 'Free offers for a first assessment or guidance.')],
    ['C', T('Derzeit eher nicht passend', 'Currently less suitable'), T('Diese Programme passen thematisch, eine belegte Bedingung spricht nach Ihren Angaben aber derzeit dagegen.', 'These programmes fit the topic, but according to your answers a documented condition currently speaks against them.')]
  ];

  function d(s) { if (!s) return null; var x = new Date(s + 'T00:00:00'); return isNaN(x) ? null : x; }
  function deDate(s) { var x = d(s); return x ? (EN ? x.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : x.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })) : ''; }
  function eur(n) { return EN ? '€' + n.toLocaleString('en-GB') : n.toLocaleString('de-DE') + ' €'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function list(a) { return (a || []).filter(function (x) { return String(x || '').trim(); }); }
  function checked(name) { return Array.prototype.map.call(root.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i; }); }
  function val(name) { var c = checked(name)[0]; return c ? c.value : null; }
  function vals(name) { return checked(name).map(function (i) { return i.value; }); }

  // ── Stepper (kein automatisches Weiterspringen, Fokus auf Frage) ──
  function answered(q) {
    var sel = q.querySelector('select'); if (sel) return !!sel.value;
    if (q.querySelector('input[type=checkbox]')) return !!q.querySelector('input:checked') || q.hasAttribute('data-optional');
    return !!q.querySelector('input:checked');
  }
  function render() {
    qs.forEach(function (x, i) { x.classList.toggle('active', i === step); x.hidden = i !== step; });
    el('fcBar').style.width = ((step + 1) / qs.length * 100) + '%';
    el('fcStepLabel').textContent = T('Fördercheck · Frage ', 'Funding check · Question ') + (step + 1) + T(' von ', ' of ') + qs.length;
    el('fcArea').textContent = qs[step].getAttribute('data-block');
    el('fcBack').disabled = step === 0;
    el('fcNext').textContent = step === qs.length - 1 ? T('Ergebnis anzeigen →', 'Show result →') : T('Weiter →', 'Next →');
    el('fcMissing').hidden = true;
  }
  function focusQ() { var lg = qs[step].querySelector('legend'); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus(); } }
  function go(dir) {
    if (dir > 0 && !answered(qs[step])) { el('fcMissing').hidden = false; var f = qs[step].querySelector('input, select'); if (f) f.focus(); return; }
    if (dir > 0 && step === qs.length - 1) { evaluate(); return; }
    step = Math.min(qs.length - 1, Math.max(0, step + dir));
    render(); focusQ();
  }
  el('fcNext').addEventListener('click', function () { go(1); });
  el('fcBack').addEventListener('click', function () { go(-1); });
  el('fcReset').addEventListener('click', function () {
    el('fcForm').reset(); step = 0;
    el('fcResult').hidden = true; root.querySelector('.pc-card').classList.remove('done');
    render(); focusQ();
  });
  // ── Als PDF speichern: eigene, helle Druckansicht nur mit dem Ergebnis (Kopf mit Datum und Ihren Angaben) ──
  function answerRows() {
    return qs.map(function (q) {
      var lg = q.querySelector('legend').cloneNode(true); var sm = lg.querySelector('span, small'); if (sm) sm.remove();
      var sel = q.querySelector('select');
      var picked = sel ? (sel.selectedIndex > 0 ? [sel.options[sel.selectedIndex].text] : [])
        : Array.prototype.map.call(q.querySelectorAll('input:checked'), function (i) { var b = i.parentNode.querySelector('b'); return b ? b.textContent : i.value; });
      return '<tr><th scope="row">' + esc(lg.textContent.trim()) + '</th><td>' + esc(picked.join(', ') || T('keine Angabe', 'no answer')) + '</td></tr>';
    }).join('');
  }
  function printResult() {
    var res = el('fcResult');
    var head = el('fcPrintHead');
    if (!head) { head = document.createElement('div'); head.id = 'fcPrintHead'; head.className = 'fc-print-head'; res.insertBefore(head, res.firstChild); }
    var date = new Date().toLocaleDateString(EN ? 'en-GB' : 'de-DE', { day: EN ? 'numeric' : '2-digit', month: 'long', year: 'numeric' });
    head.innerHTML = '<div class="fc-ph-top"><span class="fc-ph-word">' + LOGO + '</span><span>' + T('Fördercheck · Erste Orientierung · ', 'Funding check · First orientation · ') + esc(date) + '</span></div>' +
      '<p class="fc-ph-k">' + T('Ihre Angaben', 'Your answers') + '</p><table class="fc-ph-answers"><tbody>' + answerRows() + '</tbody></table>';
    // Zugeklappte Programme für den Druck öffnen, danach wieder schließen
    var closed = Array.prototype.filter.call(res.querySelectorAll('details'), function (d) { return !d.open; });
    closed.forEach(function (d) { d.open = true; });
    document.body.classList.add('fc-printing');
    var t = document.title; document.title = T('HWaiHub Fördercheck – ', 'HWaiHub Funding check – ') + date;
    var done = function () {
      document.body.classList.remove('fc-printing'); document.title = t;
      closed.forEach(function (d) { d.open = false; });
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); }, 60);
  }
  el('fcPrint').addEventListener('click', printResult);

  // ── Einordnung ──
  var SIZE = { 5: [1, 9], 30: [10, 49], 150: [50, 249], 400: [250, 499], 800: [500, Infinity] };
  function classify(p, a) {
    var why = [], open = [], stop = [], note = [];   // note: Hinweis ohne Einfluss auf die Einordnung
    var types = p.passende_vorhabenstypen || [], topics = p.passende_vorhaben || [];
    var free = p.foerderart === 'kostenlose Unterstützung';

    // Ort
    if (p.ebene === 'Land') { if ((p.bundeslaender || []).indexOf(a.land) < 0) return null; why.push(T('Landesprogramm ', 'State programme: ') + LAND[a.land]); }
    else why.push(T('Bundesprogramm', 'Federal programme'));

    // Thema und Art
    var topicHit = a.vorhaben.filter(function (v) { return topics.indexOf(v) >= 0; });
    var typeHit = a.typ === 'F' || types.indexOf(a.typ) >= 0;
    var typeExcluded = (p.ausschluss_vorhabenstypen || []).indexOf(a.typ) >= 0;
    if (!typeHit && !typeExcluded) return null;
    if (!topicHit.length && !free) return null;
    if (typeExcluded) stop.push(p.ausschluss_vorhabenstypen_text || T('Diese Art von Vorhaben ist in diesem Programm ausgeschlossen.', 'This type of project is excluded from this programme.'));
    else if (a.typ === 'F') open.push(T('Art des Vorhabens noch unklar – sie entscheidet über die Passung.', 'Type of project still unclear – it determines the fit.'));
    else why.push(T('Passt zur Art Ihres Vorhabens', 'Fits the type of your project'));
    if (topicHit.length) why.push(T('Thema passt zu Ihrer Auswahl', 'Topic matches your selection'));

    // Größe
    if (a.size == null) { if (p.mitarbeiter_max) open.push(T('Unternehmensgröße klären – Programm richtet sich an Unternehmen bis ' + p.mitarbeiter_max + ' Beschäftigte.', 'Clarify company size – the programme is aimed at companies with up to ' + p.mitarbeiter_max + ' employees.')); }
    else {
      var span = SIZE[a.size] || [a.size, a.size];
      if (p.mitarbeiter_max && span[0] > p.mitarbeiter_max) stop.push(T('Richtet sich an Unternehmen bis ' + p.mitarbeiter_max + ' Beschäftigte.', 'Aimed at companies with up to ' + p.mitarbeiter_max + ' employees.'));
      else if (p.mitarbeiter_max && span[1] > p.mitarbeiter_max) open.push(T('Richtet sich an Unternehmen bis ' + p.mitarbeiter_max + ' Beschäftigte – bitte prüfen, ob Ihr Unternehmen darunter liegt.', 'Aimed at companies with up to ' + p.mitarbeiter_max + ' employees – please check whether your company is below that.'));
      else if (p.groesse_pruefen_ab && a.size >= p.groesse_pruefen_ab) open.push(T('Bei Ihrer Unternehmensgröße gelten andere Stufen oder Bedingungen – bitte prüfen.', 'For your company size, different tiers or conditions apply – please check.'));
      else if (p.mitarbeiter_max) why.push(T('Unternehmensgröße liegt im Rahmen', 'Company size is within range'));
    }

    // Projektbeginn
    var rule = p.projektbeginn_regel;
    var started = a.status === 'begonnen', ordered = a.status === 'beauftragt';
    if (rule === 'vor_beginn_pflicht') {
      if (started || (ordered && p.beginn_als_auftrag)) stop.push(T('Antrag muss vor Beginn gestellt werden' + (p.beginn_als_auftrag ? ' – schon die Auftragserteilung gilt als Beginn.' : '.'), 'The application must be submitted before the project starts' + (p.beginn_als_auftrag ? ' – placing the order already counts as the start.' : '.')));
      else if (ordered) open.push(T('Prüfen, ob die Auftragserteilung bereits als Vorhabensbeginn gilt.', 'Check whether placing the order already counts as the start of the project.'));
      else why.push(T('Vorhaben noch nicht begonnen', 'Project not yet started'));
    } else if (rule === 'vor_beginn_empfohlen' && (started || ordered)) open.push(T('Antrag möglichst vor Beginn – bitte mit der zuständigen Stelle klären.', 'Apply before the start if possible – please clarify with the responsible body.'));
    else if (rule === 'pruefen' && (started || ordered)) open.push(T('Regel zum Projektbeginn ist offen – begonnene Vorhaben bitte vorab klären.', 'The rule on the project start is open – please clarify projects that have already started in advance.'));

    // Budget
    if (a.budget) {
      if (p.invest_min && a.budget.max != null && a.budget.max < p.invest_min) stop.push(T('Mindestvolumen ' + eur(p.invest_min) + '.', 'Minimum volume ' + eur(p.invest_min) + '.'));
      else if (p.invest_max && a.budget.min > p.invest_max) open.push(T('Höchstbetrag ' + eur(p.invest_max) + ' – ggf. nur ein Teil förderfähig.', 'Maximum amount ' + eur(p.invest_max) + ' – possibly only part of it is eligible.'));
      else if (p.invest_min && a.budget.min < p.invest_min) open.push(T('Mindestvolumen ' + eur(p.invest_min) + ' – bitte prüfen.', 'Minimum volume ' + eur(p.invest_min) + ' – please check.'));
    } else if (p.invest_min) open.push(T('Budget klären – Mindestvolumen ' + eur(p.invest_min) + '.', 'Clarify budget – minimum volume ' + eur(p.invest_min) + '.'));

    // Kosten
    var ok = p.foerderfaehige_kosten || [], ex = p.ausgeschlossene_kosten || [];
    if (a.kosten.length && !free) {
      var hit = a.kosten.filter(function (k) { return ok.indexOf(k) >= 0; });
      var allEx = a.kosten.every(function (k) { return ex.indexOf(k) >= 0; });
      if (allEx) stop.push(T('Die gewählten Kostenarten (', 'The selected cost types (') + a.kosten.map(function (k) { return KOSTEN[k]; }).join(', ') + T(') sind nicht förderfähig.', ') are not eligible.'));
      else if (hit.length) {
        why.push(T('Förderfähige Kosten: ', 'Eligible costs: ') + hit.map(function (k) { return KOSTEN[k]; }).join(', '));
        var no = a.kosten.filter(function (k) { return ex.indexOf(k) >= 0; });
        if (no.length) note.push(T('Nicht förderfähig laut Quelle: ', 'Not eligible according to the source: ') + no.map(function (k) { return KOSTEN[k]; }).join(', ') + '.');
      }
      else if (ok.length) open.push(T('Prüfen, ob Ihre Kostenarten förderfähig sind.', 'Check whether your cost types are eligible.'));
    }

    // Status
    if (p.status === 'pruefen') open.push(p.status_hinweis || T('Aktueller Programmstatus ist zu prüfen.', 'The current programme status needs to be checked.'));
    if (p.status === 'derzeit_nicht_beantragbar') {
      var win = d(p.naechstes_antragsfenster);
      open.push(win && win <= TODAY
        ? T('Antragsfenster laut Förderstelle seit ' + deDate(p.naechstes_antragsfenster) + ' geöffnet – es kann bereits wieder geschlossen sein. Bitte aktuellen Stand prüfen.', 'According to the funding body, the application window has been open since ' + deDate(p.naechstes_antragsfenster) + ' – it may already have closed again. Please check the current status.')
        : T('Derzeit nicht beantragbar – nächstes Antragsfenster laut Förderstelle ab ' + deDate(p.naechstes_antragsfenster) + '.', 'Currently not open for applications – next application window according to the funding body from ' + deDate(p.naechstes_antragsfenster) + '.'));
    }
    if (p.antragsfrist) open.push(T('Antragsfrist: ', 'Application deadline: ') + deDate(p.antragsfrist) + '.');

    var cat = free ? 'D' : stop.length ? 'C' : (open.length || p.status !== 'aktiv') ? 'B' : 'A';
    if (free && stop.length) cat = 'C';
    return { p: p, cat: cat, why: why, open: open.concat(note), stop: stop };
  }

  function card(r) {
    var p = r.p, h = '';
    var level = p.ebene === 'Land' ? LAND[(p.bundeslaender || [])[0]] || T('Land', 'State') : T('Bund', 'Federal');
    h += '<article class="fc-card fc-' + r.cat + '"><header><p class="fc-meta">' + esc(EN ? (ART[p.foerderart] || p.foerderart || '') : (p.foerderart || '')) + ' · ' + esc(level) + ' · ' + esc(p.traeger || '') + '</p>';
    h += '<h4>' + esc(p.name) + '</h4>' + (EN && p.name_de ? '<p class="fc-name-de">Official name: <span lang="de">' + esc(p.name_de) + '</span></p>' : '') + (p.kurzbeschreibung ? '<p>' + esc(p.kurzbeschreibung) + '</p>' : '') + '</header>';
    if (r.stop.length) h += '<div class="fc-sec fc-stop"><h5>' + T('Warum derzeit eher nicht passend', 'Why it is currently less suitable') + '</h5><ul>' + r.stop.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="fc-sec"><h5>' + T('Warum angezeigt', 'Why it is shown') + '</h5><ul>' + r.why.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    if (p.was_unterstuetzt) h += '<div class="fc-sec"><h5>' + T('Was unterstützt werden kann', 'What can be supported') + '</h5><p>' + esc(p.was_unterstuetzt) + '</p></div>';
    var req = list(p.zentrale_voraussetzungen);
    if (req.length) h += '<div class="fc-sec"><h5>' + T('Zentrale Voraussetzungen', 'Key requirements') + '</h5><ul>' + req.slice(0, 5).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    var check = r.open.concat(list(p.ungefragte_kernkriterien));
    if (check.length) h += '<div class="fc-sec"><h5>' + T('Was noch zu prüfen ist', 'What still needs to be checked') + '</h5><ul>' + check.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    if (p.projektbeginn_text) h += '<div class="fc-sec"><h5>' + T('Projektbeginn', 'Project start') + '</h5><p>' + esc(p.projektbeginn_text) + '</p></div>';
    if (p.foerderhoehe_text) h += '<div class="fc-sec"><h5>' + T('Förderhöhe laut Quelle', 'Funding amount according to the source') + '</h5><p>' + esc(p.foerderhoehe_text) + '</p></div>';
    if (p.status_hinweis && p.status !== 'pruefen' && !(d(p.naechstes_antragsfenster) && d(p.naechstes_antragsfenster) < TODAY)) h += '<p class="fc-note">' + esc(p.status_hinweis) + '</p>';
    h += '<footer><span>' + T('Stand: ', 'As of: ') + esc(deDate(p.geprueft_am)) + T(' · Quelle: ', ' · Source: ') + esc(p.official_source_name || '') + '</span>';
    h += '<a href="' + esc(p.official_url) + '" target="_blank" rel="noopener">' + T('Offizielle Förderbedingungen prüfen', 'Check the official funding conditions') + '<span class="visually-hidden">' + T(' (öffnet eine externe Seite)', ' (opens an external page)') + '</span> →</a></footer></article>';
    return h;
  }

  function evaluate() {
    var budgetRaw = val('budget'), sizeRaw = val('size');
    var a = {
      land: el('fcLand').value,
      size: sizeRaw ? parseInt(sizeRaw, 10) : null,
      vorhaben: vals('vorhaben'), typ: val('typ'), status: val('status'),
      budget: budgetRaw ? { min: parseInt(budgetRaw.split('-')[0], 10), max: budgetRaw.split('-')[1] ? parseInt(budgetRaw.split('-')[1], 10) : null } : null,
      kosten: vals('kosten')
    };
    var out = { A: [], B: [], C: [], D: [] }, hints = [], shownDates = [];
    var german = !!LAND[a.land];

    if (german) {
      data.programme.forEach(function (p) {
        var until = d(p.gueltig_bis), frist = d(p.antragsfrist), window_ = d(p.naechstes_antragsfenster);
        if ((until && until < TODAY) || (frist && frist < TODAY)) { // abgelaufen → nicht als Ergebnis, aber als Hinweis
          var here = p.ebene !== 'Land' || (p.bundeslaender || []).indexOf(a.land) >= 0;
          if (here && p.status !== 'ausgelaufen') hints.push(p.name + (frist && frist < TODAY ? T(' – Antragsfrist am ', ' – application deadline on ') + deDate(p.antragsfrist) + T(' abgelaufen.', ' has passed.') : T(' – Laufzeit laut Quelle bis ', ' – term according to the source until ') + deDate(p.gueltig_bis) + '.') + T(' Ob es eine Verlängerung gibt, zeigt die offizielle Seite.', ' The official page shows whether there is an extension.'));
          return;
        }
        var inLand = p.ebene !== 'Land' || (p.bundeslaender || []).indexOf(a.land) >= 0;
        if (p.status === 'ausgelaufen') { if (inLand) hints.push(p.name + T(' – nicht mehr verfügbar', ' – no longer available') + (p.ausgelaufen_am ? T(' (seit ', ' (since ') + deDate(p.ausgelaufen_am) + ')' : '') + '.'); return; }
        if (p.status === 'derzeit_nicht_beantragbar' && !window_) { if (inLand) hints.push(p.name + T(' – derzeit nicht beantragbar', ' – currently not open for applications') + (p.status_hinweis ? ': ' + p.status_hinweis : '.')); return; }
        var r = classify(p, a); if (!r) return;
        if (r.cat === 'A' && p.status !== 'aktiv') r.cat = 'B';
        out[r.cat].push(r); shownDates.push(p.geprueft_am);
      });
    }

    var sum = '';
    if (!german) sum = T('Der Fördercheck enthält derzeit nur Programme für Unternehmen mit Sitz oder Betriebsstätte in Deutschland. Für ' + (a.land === 'AT' ? 'Österreich' : a.land === 'CH' ? 'die Schweiz' : 'andere Länder') + ' wenden Sie sich bitte an die nationalen Förderstellen.',
      'The funding check currently covers only programmes for companies with a registered office or site in Germany. For ' + (a.land === 'AT' ? 'Austria' : a.land === 'CH' ? 'Switzerland' : 'other countries') + ', please contact the national funding bodies.');
    else {
      var n = out.A.length + out.B.length + out.D.length;
      sum = n ? T('Für ' + LAND[a.land] + ' und Ihre Angaben haben wir ' + (n === 1 ? 'ein Programm gefunden, das Sie prüfen sollten.' : n + ' Programme gefunden, die Sie prüfen sollten.'),
                  'For ' + LAND[a.land] + ' and your answers we found ' + (n === 1 ? 'one programme you should look into.' : n + ' programmes you should look into.'))
              : T('Für Ihre Angaben haben wir derzeit kein Programm gefunden, das gut passt. Das kann an Vorhabensart, Status oder Größe liegen – ändern Sie gegebenenfalls einzelne Angaben.',
                  'For your answers we currently found no programme that fits well. This may be due to the type of project, its status or company size – change individual answers if appropriate.');
    }
    el('fcSummary').textContent = sum;

    var html = '';
    GROUPS.forEach(function (g) {
      var lst = out[g[0]]; if (!lst.length) return;
      html += '<section class="fc-group fc-group-' + g[0] + '"><h3>' + esc(g[1]) + ' <span>(' + lst.length + ')</span></h3><p class="fc-group-sub">' + esc(g[2]) + '</p>';
      if (g[0] === 'C') html += '<details><summary>' + T('Programme anzeigen', 'Show programmes') + '</summary>' + lst.map(card).join('') + '</details>';
      else html += lst.map(card).join('');
      html += '</section>';
    });
    el('fcGroups').innerHTML = html;
    el('fcHints').innerHTML = hints.length ? '<h3>' + T('Nicht oder derzeit nicht verfügbar', 'No longer or currently not available') + '</h3><ul>' + hints.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' : '';
    shownDates.sort();
    el('fcStand').textContent = !german ? '' : T('Stand der angezeigten Programmdaten: ', 'Programme data shown as of: ') + deDate(shownDates[0] || data.stand) + T('. Förderbedingungen ändern sich – maßgeblich ist immer die offizielle Quelle.', '. Funding conditions change – the official source is always authoritative.');

    root.querySelector('.pc-card').classList.add('done');
    el('fcResult').hidden = false;
    el('fcResult').focus();
    document.dispatchEvent(new CustomEvent('hwai:context', { detail: { section: 'foerdercheck-result' } }));
  }

  render();
})();
