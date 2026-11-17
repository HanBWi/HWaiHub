/* HWaiHub – KI-Potenzialcheck: Bedienung, Ergebnisansicht, Bericht (PDF) und Übermittlung an HWaiHub.
   Die Auswertung selbst steht in pc-engine.js (getestet mit npm test).
   Datenschutz: Antworten werden erst übertragen, wenn die Person den Bericht anfordert und ausdrücklich einwilligt.
   Ziel ist site.formEndpoint (Make → Notion), dasselbe wie beim Kontaktformular, mit form = "potenzialcheck". */
(function () {
  'use strict';
  // Logo aus der zentralen Quelle (partials/logo.njk über <template id="hwLogoTpl"> im Basis-Layout)
  var LOGO = (function () { var t = document.getElementById('hwLogoTpl'); return t ? t.innerHTML : 'HWaiHub'; })();
  var root = document.getElementById('potenzialcheck'); if (!root || !window.HWPC) return;
  var E = window.HWPC;
  var form = document.getElementById('pcForm');
  var qs = Array.prototype.slice.call(root.querySelectorAll('.pc-q'));
  var step = 0, pointer = false, last = null;
  // Vertiefung („Ist-Analyse“, pc-deep.js): Fragen 13–16 zum Bereich mit dem größten Hebel. Texte je Seitensprache (DE/EN).
  var base = qs.slice(), DEEP = window.HWPCD || null, D = {}, deepSlugs = [], TOTAL = base.length + (DEEP ? 4 : 0);
  var el = function (id) { return document.getElementById(id); };
  root.classList.add('pc--enhanced');
  // Sprache der Seite: Texte und Auswertung auf Englisch unter /en/; Notion-Felder (quelle, interestJson, topic) bleiben deutsch
  var EN = document.documentElement.lang === 'en';
  var T = function (de, en) { return EN ? en : de; };

  var ROUTES = {};
  try { ROUTES = JSON.parse(document.getElementById('hw-routes').textContent); } catch (e) {}
  var r = function (k) { return ROUTES[k] || '/'; };
  var abs = function (u) { try { return new URL(u, location.origin).href; } catch (e) { return u; } };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ── Fragen ──
  function answered(q) { return !!q.querySelector('input:checked') || (!q.getAttribute('data-min') && q.querySelector('input[type=checkbox]')); }
  // Vertiefungsfragen im selben Aufbau wie die festen Fragen erzeugen (gleiche Klassen, gleiches Aussehen)
  function buildDeep(slugs) {
    Array.prototype.forEach.call(form.querySelectorAll('.pc-q--deep'), function (x) { x.remove(); });
    deepSlugs = DEEP ? (slugs || DEEP.pick(E.evaluate(answers(), 'de'))) : [];
    var nodes = (DEEP ? DEEP.questions(deepSlugs, EN ? 'en' : 'de') : []).map(function (q) {
      var fs = document.createElement('fieldset'), multi = q.type === 'multi', cur = D[q.name];
      fs.className = 'pc-q pc-q--deep'; fs.hidden = true; fs.setAttribute('data-area', q.area); fs.setAttribute('data-block', q.block);
      if (multi) { fs.setAttribute('data-min', '1'); fs.setAttribute('data-max', q.max); }
      fs.innerHTML = '<legend class="pc-legend">' + esc(q.q) + (multi ? ' <small class="pc-multi">' + T('Bis zu zwei wählbar', 'Choose up to two') + '</small>' : '') + '</legend><div class="pc-opts">' + q.opts.map(function (o) {
        var on = multi ? (cur || []).indexOf(o[0]) >= 0 : cur === o[0];
        return '<label><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + q.name + '" value="' + esc(o[0]) + '"' + (on ? ' checked' : '') + ' /><span><b>' + esc(o[1]) + '</b>' + (o[2] ? '<i>' + esc(o[2]) + '</i>' : '') + '</span></label>';
      }).join('') + '</div>' + (q.hint ? '<p class="pc-hint">' + esc(q.hint) + '</p>' : '');
      form.appendChild(fs); return fs;
    });
    qs = base.concat(nodes);
    return nodes.length > 0;
  }
  function readDeep() {
    Array.prototype.forEach.call(form.querySelectorAll('.pc-q--deep'), function (fs) {
      var inp = fs.querySelectorAll('input'), name = inp[0].name, on = Array.prototype.filter.call(inp, function (i) { return i.checked; }).map(function (i) { return i.value; });
      if (inp[0].type === 'checkbox') D[name] = on; else if (on.length) D[name] = on[0];
    });
  }
  function render() {
    qs.forEach(function (x, i) { x.classList.toggle('active', i === step); x.hidden = i !== step; });
    var inDeep = step >= base.length;
    el('pcBar').style.width = ((step + 1) / Math.max(qs.length, TOTAL) * 100) + '%';
    el('pcStepLabel').textContent = T('Frage ', 'Question ') + (step + 1) + T(' von ', ' of ') + Math.max(qs.length, TOTAL);
    el('pcArea').textContent = qs[step].getAttribute('data-block') + ' · ' + qs[step].getAttribute('data-area');
    el('pcBack').disabled = step === 0;
    el('pcNext').textContent = step === qs.length - 1 && (inDeep || !DEEP) ? T('Ergebnis anzeigen →', 'Show result →') : T('Weiter →', 'Next →');
    el('pcMissing').hidden = true;
  }
  function go(d) {
    if (d > 0 && !answered(qs[step])) { el('pcMissing').hidden = false; var f = qs[step].querySelector('input'); if (f) f.focus(); return; }
    // Nach Frage 12: Vertiefungsfragen für die Bereiche mit dem größten Hebel aufbauen (immer neu, falls Antworten geändert wurden)
    if (d > 0 && DEEP && step === base.length - 1) { readDeep(); if (!buildDeep()) { show(true); return; } }
    else if (d > 0 && step === qs.length - 1) { readDeep(); show(true); return; }
    step = Math.min(qs.length - 1, Math.max(0, step + d));
    render();
    var lg = qs[step].querySelector('legend'); if (lg && d !== 0) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
  }
  function val(n) { var e = form.querySelector('input[name=' + n + ']:checked'); return e ? e.value : ''; }
  function answers() {
    var a = {}; for (var i = 1; i <= 11; i++) a['q' + i] = val('q' + i);
    a.q12 = Array.prototype.map.call(form.querySelectorAll('input[name=q12]:checked'), function (e) { return e.value; });
    return a;
  }
  function setAnswers(a) {
    for (var i = 1; i <= 11; i++) { var inp = form.querySelector('input[name=q' + i + '][value="' + a['q' + i] + '"]'); if (inp) inp.checked = true; }
    Array.prototype.forEach.call(form.querySelectorAll('input[name=q12]'), function (c) { c.checked = a.q12.indexOf(c.value) >= 0; });
  }
  // Fragen und gewählte Antworten im Klartext (für Bericht und Übermittlung)
  function answerList() {
    return qs.map(function (q, i) {
      var lg = q.querySelector('legend').cloneNode(true); var sm = lg.querySelector('small'); if (sm) sm.remove();
      var picked = Array.prototype.map.call(q.querySelectorAll('input:checked'), function (inp) { var b = inp.parentNode.querySelector('b'); return b ? b.textContent : inp.value; });
      return { n: i + 1, block: q.getAttribute('data-area'), q: lg.textContent.trim(), a: picked.length ? picked.join(', ') : T('keine Angabe', 'no answer') };
    });
  }

  // ── Ist-Analyse (Fragen 13–16): nutzt ausschließlich vorhandene Ergebnis-Bausteine; Texte je Sprache über T(de, en) ──
  var DEEPDATA = {}, LANG = EN ? 'en' : 'de', Q1 = T('„', '"'), Q2 = T('“', '"');
  try { DEEPDATA = JSON.parse(document.getElementById('pc-deep-data').textContent); } catch (e) {}
  function shareUrl(a) { return location.origin + location.pathname + '?a=' + E.encode(a) + (last && last.deep ? '&d=' + DEEP.encode(deepSlugs, D) : ''); }
  function afterFlow(x) { var d = DEEPDATA[x.key]; return d && d.withAi ? d.withAi.map(function (st) { return st[0] + (st[1] === 'mensch' ? T(' (Mensch)', ' (person)') : T(' (KI)', ' (AI)')); }).join(' → ') : ''; }
  var BN_LABELS = [T('Was meist dahintersteckt', 'What is usually behind it'), T('Was Sie sofort tun können', 'What you can do right away'), T('Wie es mit KI laufen kann', 'How it can work with AI'), T('Was vorher nötig ist', 'What is needed first')];
  function deepHtml(list) {
    return list.map(function (x) {
      var d = DEEPDATA[x.key] || {}, one = x.bns.length === 1;
      return '<div class="pc-block pc-block--deep"><p class="pc-recos-label">' + T('Unsere Einschätzung · ', 'Our assessment · ') + esc(x.name) + '</p>' +
        '<h3 class="pc-prio-title">' + esc(x.title) + '</h3>' +
        '<p class="pc-deep-lead">' + (x.people
          ? T('Damit KI im Alltag wirkt, braucht ein Team fünf Dinge: konkrete Anwendungsfälle, klare Regeln, das passende Werkzeug, eine Prüfung der Ergebnisse und einen gemeinsamen Weg. Bei Ihnen fehlt es am deutlichsten an ' + (one ? 'einer Stelle' : 'zwei Stellen') + ':',
              'For AI to work in daily business, a team needs five things: concrete use cases, clear rules, the right tool, a check of the results and a shared approach. In your case the gap is clearest in ' + (one ? 'one place' : 'two places') + ':')
          : T('Ihr Ablauf läuft in fünf Schritten. Die meiste Zeit geht ' + (one ? 'an einer Stelle' : 'an zwei Stellen') + ' verloren – dort lohnt es sich anzusetzen.',
              'Your workflow runs in five steps. Most time is lost ' + (one ? 'at one point' : 'at two points') + ' – that is where it pays to start.')) + '</p>' +
        '<div class="pc-prios">' + x.bns.map(function (b) {
          return '<div class="pc-prio"><div class="pc-prio-n">' + b.n + '</div><div class="pc-prio-body">' +
            '<div class="pc-prio-head"><span class="pc-prio-area">' + T('Schritt ' + b.n + ' von 5', 'Step ' + b.n + ' of 5') + '</span><span class="typ">' + T('Engstelle', 'Bottleneck') + '</span></div>' +
            '<h3 class="pc-prio-title">' + esc(b.label) + '</h3>' +
            '<div class="pc-prio-grid">' + [b.diag, b.sofort, b.ziel, b.voraus].map(function (t, i) { return '<div><small>' + BN_LABELS[i] + '</small><span>' + esc(t) + '</span></div>'; }).join('') + '</div></div></div>';
        }).join('') + '</div>' +
        (d.withAi ? '<h4 class="pc-deep-h">' + T('So kann der Ablauf danach aussehen', 'What the workflow can look like afterwards') + '</h4><p class="pc-deep-lead">' + T('KI übernimmt die Vorarbeit, die Entscheidung bleibt bei einem Menschen.', 'AI does the groundwork; the decision stays with a person.') + '</p>' +
          '<ol class="pc-steps pc-steps--after">' + d.withAi.map(function (st, i) {
            return '<li><span class="pc-steps-n">' + (i + 1) + '</span><span><b>' + esc(st[0]) + '</b></span><em class="' + (st[1] === 'mensch' ? 'pc-tag' : 'typ') + '">' + (st[1] === 'mensch' ? T('Mensch entscheidet', 'Person decides') : T('KI bereitet vor', 'AI prepares')) + '</em></li>'; }).join('') + '</ol>' : '') +
        '<div class="pc-dim">' + (d.measure ? '<p><b>' + T('Woran wir die Verbesserung messen:', 'How we measure the improvement:') + '</b> ' + esc(d.measure.join(' · ')) + '</p>' : '') + (d.control ? '<p><b>' + T('So bleibt es kontrolliert:', 'How it stays under control:') + '</b> ' + esc(d.control) + '</p>' : '') +
        '<p>' + T('Diese Einschätzung beruht auf Erfahrungen mit vergleichbaren Abläufen. Ob es bei Ihnen genauso ist, klären wir im Erstgespräch.', 'This assessment is based on experience with comparable workflows. Whether it is the same in your company is something we clarify in the intro call.') + '</p></div></div>';
    }).join('');
  }

  // ── Ergebnis als Beratungsantwort (nach den 16 Fragen) ──
  // Ersetzt Kernaussage, Vorschlag und Fahrplan durch Aussagen zum wichtigsten Ablauf. Keine neuen Zahlen: Stunden = Hochrechnung aus den Angaben.
  function story(a, res, x) {
    var d = DEEPDATA[x.key] || {}, b1 = x.bns[0], ctx = res.ctx, gov = +a.q10 || 0, trained = a.q9 === 'a';
    var where = x.bns.map(function (b) { return Q1 + b.label + Q2; }).join(T(' und ', ' and '));
    var pr = Q1 + x.process + Q2, bl = b1 ? Q1 + b1.label + Q2 : '';
    var base = !ctx.procReady && !ctx.dataReady ? T('Bevor KI hier hilft, braucht der Ablauf eine verbindliche Beschreibung und eine verlässliche Datenquelle.', 'Before AI can help here, the workflow needs a binding description and a reliable data source.')
      : !ctx.procReady ? T('Bevor KI hier hilft, braucht der Ablauf eine verbindliche Beschreibung – wer macht was, in welcher Reihenfolge.', 'Before AI can help here, the workflow needs a binding description – who does what, in which order.')
      : !ctx.dataReady ? T('Bevor KI hier hilft, braucht der Ablauf eine verlässliche Datenquelle.', 'Before AI can help here, the workflow needs a reliable data source.')
      : T('Ihre Abläufe und Daten tragen bereits – dieser Schritt lässt sich gezielt verbessern.', 'Your workflows and data already hold – this step can be improved in a targeted way.');
    var gTeam = T('Geschultes Team mit dokumentierter KI-Kompetenz (Art. 4 KI-Verordnung)', 'A trained team with documented AI literacy (Art. 4 EU AI Act)'), gPol = T('Kurze, verbindliche KI-Richtlinie', 'A short, binding AI policy');
    var lAc = ['academy-unternehmen', T('Schulungen für Unternehmen', 'Training for companies')], lAn = ['analyse', T('KI-Transformationsanalyse', 'AI Transformation Analysis')];
    var o = {};
    if (x.people) {
      o.verdict = T('Ihr größter Hebel: ein Team, das KI sicher und gezielt nutzt.', 'Your biggest lever: a team that uses AI safely and purposefully.');
      o.sub = T('Am häufigsten scheitert die Nutzung an ', 'Use most often fails at ') + where + '. ' +
        [T('Ihr Team ist bereits geschult – jetzt geht es um feste Anwendungsfälle je Rolle.', 'Your team is already trained – now it is about fixed use cases per role.'), T('Einzelne sind geschult, ein gemeinsamer Stand fehlt.', 'Individuals are trained, but there is no shared level.'), T('Eine Schulung gab es bisher nicht.', 'There has been no training so far.')][x.train] +
        T(' Mit klaren Regeln und Übung an echten Aufgaben ändert sich das schnell.', ' With clear rules and practice on real tasks, that changes quickly.');
      o.tiles = [[T('Ihr Team', 'Your team'), x.teamLabel, T('Mitarbeitende überwiegend am Bildschirm', 'employees working mainly at a screen')], [T('Ansatzpunkt', 'Starting point'), b1 ? b1.label : '–', T('das größte Hindernis nach Ihren Angaben', 'the biggest obstacle according to your answers')], [T('Schulung bisher', 'Training so far'), [T('alle Rollen', 'all roles'), T('einzelne', 'individuals'), T('keine', 'none')][x.train], T('Werkzeuge: ', 'Tools: ') + x.tools]];
      o.first = { title: T('KI-Schulung für Ihr Team – mit Richtlinie und ersten Anwendungsfällen', 'AI training for your team – with a policy and first use cases'),
        text: T('Ihr Team lernt den sicheren Umgang mit KI an eigenen Aufgaben. Wir legen gemeinsam fest, welche Werkzeuge und Daten erlaubt sind und wer Ergebnisse prüft. Dabei sammeln wir die Abläufe, die im Alltag am meisten Zeit kosten.', 'Your team learns to use AI safely on its own tasks. Together we define which tools and data are permitted and who checks results. Along the way we collect the workflows that cost the most time in daily business.'),
        gets: [gTeam, gPol, T('Liste der Anwendungsfälle je Rolle mit Priorität', 'A prioritised list of use cases per role')], links: [lAc, ['enablement', T('KI-Befähigung & Regeln', 'AI Enablement & Rules')]] };
    } else {
      o.verdict = T('Ihr größter Hebel: ' + x.name + ' – rund ' + x.hours + ' Stunden im Monat.', 'Your biggest lever: ' + x.name + ' – around ' + x.hours + ' hours per month.');
      o.sub = T('So viel Zeit bindet der Ablauf ' + pr + ' nach Ihren Angaben. Am meisten geht bei ' + where + ' verloren. ', 'That is how much time the workflow ' + pr + ' ties up according to your answers. Most is lost at ' + where + '. ') + base +
        (x.dep === 2 ? T(' Und: Fällt die zuständige Person aus, steht der Ablauf still.', ' And: when the responsible person is absent, the workflow stops.') : '');
      o.tiles = [[T('Gebundene Zeit', 'Time tied up'), T('rund ' + x.hours + ' Std.', 'approx. ' + x.hours + ' hrs'), T('im Monat – Hochrechnung aus Ihren Angaben (', 'per month – extrapolated from your answers (') + x.short + ')'],
        [T('Ansatzpunkt', 'Starting point'), T('Schritt ', 'Step ') + (b1 ? b1.n : '–'), b1 ? b1.label : ''], [T('Wenn jemand ausfällt', 'When someone is absent'), x.depShort, x.depText]];
      var ready = ctx.procReady && ctx.dataReady && gov >= 2;
      o.first = !trained
        ? { title: T('Schulung und Ablauf-Analyse zusammen', 'Training and workflow analysis together'),
            text: T('Ihr Team lernt in einer praxisnahen Schulung den sicheren Umgang mit KI – an Aufgaben aus dem Bereich ' + x.name + '. Parallel nehmen wir mit den Beteiligten den Ablauf ' + pr + ' auf, beginnend bei ' + bl + ', und messen, wo die Zeit wirklich verloren geht.',
                    'In hands-on training your team learns to use AI safely – on tasks from ' + x.name + '. In parallel we map the workflow ' + pr + ' with the people involved, starting at ' + bl + ', and measure where the time is really lost.'),
            gets: [gTeam, gPol, T('Umsetzungsplan für diesen Ablauf mit Wirtschaftlichkeitsrechnung', 'An implementation plan for this workflow with a cost-benefit calculation')], links: [lAc, lAn] }
        : ready
        ? { title: T('Ein begrenzter Pilot im Ablauf ' + pr, 'A limited pilot in the workflow ' + pr),
            text: T('Die Voraussetzungen tragen. Wir setzen den Schritt ' + bl + ' als einen Anwendungsfall um – mit Schlüsselanwendern aus Ihrem Team und menschlicher Freigabe – und messen vorher und nachher.', 'The prerequisites hold. We implement the step ' + bl + ' as one use case – with key users from your team and human approval – and measure before and after.'),
            gets: [T('Funktionierender Ablauf im Alltag', 'A working workflow in daily business'), T('Messung vorher und nachher: ', 'Measurement before and after: ') + (d.measure || []).join(', '), T('Entscheidungsgrundlage für die Ausweitung', 'A basis for deciding on expansion')], links: [['pilot', T('KI & Automation Pilot', 'AI & Automation Pilot')]] }
        : { title: T('KI-Transformationsanalyse für den Ablauf ' + pr, 'AI Transformation Analysis for the workflow ' + pr),
            text: T('Wir nehmen den Ablauf mit den Beteiligten auf, beginnend bei ' + bl + ', klären die fehlenden Voraussetzungen und rechnen durch, was sich lohnt.', 'We map the workflow with the people involved, starting at ' + bl + ', clarify the missing prerequisites and calculate what pays off.'),
            gets: [T('Ablauf heute, mit gemessenen Engstellen', 'The workflow today, with measured bottlenecks'), T('Bewertete Lösungswege – mit und ohne KI', 'Assessed solution paths – with and without AI'), T('Umsetzungsplan mit Wirtschaftlichkeitsrechnung', 'An implementation plan with a cost-benefit calculation')], links: [lAn] };
    }
    if (gov === 0) o.first.urgent = T('Vorab, unabhängig davon: KI-Werkzeuge laufen bei Ihnen teils über private Konten. Eine kurze Richtlinie zu erlaubten Werkzeugen und Daten sollte vor jedem weiteren Schritt stehen.', 'First, independently of this: AI tools are partly used via private accounts in your company. A short policy on permitted tools and data should come before any further step.');
    // Fahrplan aus dem wichtigsten Ablauf
    var p1 = [], p2 = [], p3 = [];
    if (gov <= 1) p1.push(T('KI-Richtlinie festlegen: erlaubte Werkzeuge, Daten und Freigaben', 'Set an AI policy: permitted tools, data and approvals'));
    if (!trained && !x.people) p1.push(T('Praxisnahe KI-Schulung für das Team, je Rolle dokumentiert', 'Hands-on AI training for the team, documented per role'));
    p1.push(x.people ? T('Anwendungsfälle je Rolle sammeln und priorisieren', 'Collect and prioritise use cases per role') : T('Ablauf mit den Beteiligten aufnehmen, Ausgangswerte messen (', 'Map the workflow with the people involved, measure baselines (') + (d.measure || []).join(', ') + ')');
    var need = []; x.bns.forEach(function (b) { if (!b.ready) { var v = b.need === 'data' ? T('führende Datenquelle festlegen', 'define the leading data source') : T('Ablauf verbindlich beschreiben', 'describe the workflow bindingly'); if (need.indexOf(v) < 0) need.push(v); } });
    if (need.length) p1.push(T('Voraussetzungen schaffen: ', 'Create the prerequisites: ') + need.join(', '));
    if ((+a.q11 || 0) <= 2) p1.push(T('Zielbild und verantwortliche Person in der Geschäftsführung festlegen', 'Define the target picture and a responsible person in management'));
    x.bns.forEach(function (b) { p2.push(T('Schritt ' + b.n + ' ' + Q1 + b.label + Q2 + ' verbessern', 'Improve step ' + b.n + ' ' + Q1 + b.label + Q2)); });
    p2.push(x.people ? T('Schlüsselanwender benennen, gute Beispiele im Team teilen', 'Name key users, share good examples in the team') : T('Schlüsselanwender schulen, menschliche Freigabe festlegen', 'Train key users, define human approval'));
    p2.push(T('Wirkung messen und über die Ausweitung entscheiden', 'Measure impact and decide on expansion'));
    res.prios.forEach(function (p) { if (p.slug !== x.key) p3.push(T('Nächster Bereich ', 'Next area ') + p.name + ': ' + p.reco.title); });
    p3.push(T('Nutzen und Kosten laufend im Blick behalten, weitere Abläufe priorisieren', 'Keep an eye on benefits and costs, prioritise further workflows'));
    o.roadmap = [{ phase: 'Phase 1', title: T('Klären und absichern', 'Clarify and secure'), items: p1 }, { phase: 'Phase 2', title: x.people ? T('Sicher nutzen im Alltag', 'Safe use in daily work') : T('Ersten Ablauf verbessern', 'Improve the first workflow'), items: p2 }, { phase: 'Phase 3', title: T('Ausweiten, was wirkt', 'Expand what works'), items: p3 }];
    return o;
  }
  function firstHtml(f) {
    return '<p class="pc-first-label">' + T('Unser Vorschlag für den Einstieg', 'Our suggestion for getting started') + '</p>' + (f.urgent ? '<p><b>' + esc(f.urgent) + '</b></p>' : '') +
      '<h3 class="pc-first-title">' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p>' +
      '<p><b>' + T('Was Sie danach in der Hand haben:', 'What you will have afterwards:') + '</b></p><ul class="pc-first-list">' + f.gets.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' +
      '<p>' + T('Umfang und Preis nennen wir im Erstgespräch vorab. Für Beratung und Qualifizierung könnte ein Förderprogramm in Frage kommen – <a href="' + r('foerdercheck') + '">erste Orientierung im Fördercheck</a> (keine Förderzusage).',
                'We state scope and price upfront in the intro call. For companies with a site in Germany, a public funding programme might be an option for consulting and training – <a href="' + r('foerdercheck') + '">first orientation in the funding check</a> (no promise of funding).') + '</p>' +
      f.links.map(function (l) { return '<a class="link-arrow link-arrow--light" href="' + r(l[0]) + '">' + esc(l[1]) + ' →</a>'; }).join(' ');
  }
  // Reihenfolge einer Beratungsantwort: Kernaussage → Einschätzung → Vorschlag → Prioritäten → Fahrplan → Hinweise → Details
  function arrange(on) {
    if (!on) return;
    var more = el('pcMore');
    if (!more) {
      more = document.createElement('details'); more.id = 'pcMore'; more.className = 'pc-block pc-more';
      more.innerHTML = '<summary class="pc-recos-label">' + T('Ihre Ausgangslage im Detail: Reifeprofil und Hebel je Bereich', 'Your starting point in detail: maturity profile and lever per area') + '</summary><div class="pc-kpis" id="pcKpis2"></div>';
      [el('pcProfile'), el('pcAreas')].forEach(function (n) { if (n && n.parentNode) more.appendChild(n.parentNode); });
    }
    var after = el('pcDeepRes');
    [el('pcFirst'), root.querySelector('.pc-recos'), el('pcRoadmap').parentNode, el('pcRisk'), more].forEach(function (n) { if (n) { after.parentNode.insertBefore(n, after.nextSibling); after = n; } });
  }

  // ── Ergebnis am Bildschirm ──
  function ringSvg(pct, size, dark) {
    var rr = 54, c = 2 * Math.PI * rr, off = c * (1 - pct / 100);
    return '<svg class="pc-ring-svg" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<defs><linearGradient id="pcg' + size + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8842E"/><stop offset=".55" stop-color="#E2B85A"/><stop offset="1" stop-color="#A87230"/></linearGradient></defs>' +
      '<circle cx="60" cy="60" r="' + rr + '" fill="none" stroke="' + (dark ? 'rgba(255,255,255,.12)' : '#EDE4D3') + '" stroke-width="9"/>' +
      (pct > 0 ? '<circle cx="60" cy="60" r="' + rr + '" fill="none" stroke="url(#pcg' + size + ')" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 60 60)"/>' : '') + '</svg>';
  }
  function bar(pct) { return '<span class="pc-meter" aria-hidden="true"><i style="width:' + Math.max(3, pct) + '%"></i></span>'; }

  function show(scroll) {
    var a = answers(), res = E.evaluate(a, EN ? 'en' : 'de'); last = { a: a, res: res };
    last.deep = DEEP && deepSlugs.length && DEEP.complete(deepSlugs, D) ? DEEP.evaluate(deepSlugs, D, { proc: res.ctx.procReady, data: res.ctx.dataReady, m365: res.ctx.m365 }, LANG) : null;
    var st = last.deep ? story(a, res, last.deep[0]) : null; last.story = st;
    if (st) { res.verdict = st.verdict; res.sub = st.sub; res.roadmap = st.roadmap; res.first = { title: st.first.title, text: st.first.text, route: st.first.links[0][0], label: st.first.links[0][1] }; }
    var dz = el('pcDeepRes');
    if (!dz) { dz = document.createElement('div'); dz.id = 'pcDeepRes'; el('pcKpis').parentNode.insertBefore(dz, el('pcKpis').nextSibling); }
    dz.innerHTML = last.deep ? deepHtml(last.deep) : ''; dz.hidden = !last.deep;
    var pages = 6 + (last.deep ? last.deep.length : 0), rt = root.querySelector('.pc-report-cta .pc-first-title');
    if (rt) rt.textContent = T('Ihr Ergebnis auf ' + ({ 6: 'sechs', 7: 'sieben', 8: 'acht' })[pages] + ' Seiten – als PDF zum Weitergeben', 'Your result on ' + ({ 6: 'six', 7: 'seven', 8: 'eight' })[pages] + ' pages – as a PDF to pass on');
    if (!unlocked) el('pcrState').textContent = T('Vorschau · ' + pages + ' Seiten', 'Preview · ' + pages + ' pages');
    el('pcStageNum').textContent = res.reife;
    el('pcRing').style.background = 'conic-gradient(var(--color-gold-bright) 0 ' + res.reife + '%, rgba(255,255,255,.09) ' + res.reife + '% 100%)';
    el('pcStage').innerHTML = T('KI-Reife', 'AI maturity') + ' <b>' + res.reife + ' %</b> · ' + esc(res.stageName);
    el('pcVerdict').textContent = res.verdict;
    el('pcVerdictSub').textContent = res.sub;

    var kpiBase = [[T('Fundament', 'Foundation'), res.fundament, T('Prozesse · Daten · Plattform', 'Processes · data · platform')], [T('Bereitschaft', 'Readiness'), res.bereitschaft, T('KI-Nutzung · Regeln · Führung', 'AI use · rules · leadership')], [T('Hebel', 'Lever'), res.hebel, T('Zeitverlust in Ihren Bereichen', 'Time lost in your areas')]].map(function (k) {
      return '<div class="pc-kpi"><small>' + k[0] + '</small><strong>' + k[1] + ' %</strong>' + bar(k[1]) + '<span>' + k[2] + '</span></div>';
    }).join('');
    arrange(!!st);
    el(st ? 'pcKpis2' : 'pcKpis').innerHTML = kpiBase;
    if (st) el('pcKpis').innerHTML = st.tiles.map(function (k) { return '<div class="pc-kpi"><small>' + esc(k[0]) + '</small><strong>' + esc(k[1]) + '</strong><span>' + esc(k[2]) + '</span></div>'; }).join('');
    else if (el('pcKpis2')) el('pcKpis2').innerHTML = '';

    el('pcProfile').innerHTML = res.dims.map(function (d) {
      return '<div class="pc-dim"><div class="pc-dim-h"><b>' + esc(d.name) + '</b><span>' + d.pct + ' %</span></div>' + bar(d.pct) + '<p>' + esc(d.text) + '</p></div>';
    }).join('');

    el('pcAreas').innerHTML = res.areas.map(function (x) {
      if (!x.applicable) return '<div class="pc-area pc-area--na"><span class="n">' + esc(x.name) + '</span><span class="t" aria-hidden="true"></span><span class="l">' + T('trifft nicht zu', 'not applicable') + '</span></div>';
      return '<div class="pc-area"><span class="n">' + esc(x.name) + (x.fokus ? ' <em class="pc-tag">' + T('Ihr Fokus', 'Your focus') + '</em>' : '') + '</span><span class="t" aria-hidden="true"><i style="width:' + Math.max(4, x.pct) + '%"></i></span><span class="l' + (x.p >= 2 ? ' hi' : '') + '">' + T('Hebel ', 'Lever ') + x.pct + ' % · ' + x.level + '</span></div>';
    }).join('');

    el('pcPrios').innerHTML = res.prios.length ? res.prios.map(function (x, i) {
      var rc = x.reco;
      return '<div class="pc-prio"><div class="pc-prio-n">0' + (i + 1) + '</div><div class="pc-prio-body">' +
        '<div class="pc-prio-head"><span class="pc-prio-area">' + esc(x.name) + '</span>' + (x.fokus ? '<span class="pc-tag">' + T('Ihr Fokus', 'Your focus') + '</span>' : '') + '<span class="typ">' + esc(rc.typeLabel) + '</span></div>' +
        '<h3 class="pc-prio-title">' + esc(rc.title) + '</h3>' +
        '<div class="pc-prio-grid"><div><small>' + T('Ansatz', 'Approach') + '</small><span>' + esc(rc.approach) + '</span></div><div><small>' + T('Was wir messen würden', 'What we would measure') + '</small><span>' + esc(rc.measure) + '</span></div></div>' +
        '<div class="pc-prio-links"><a href="' + r(rc.route) + '">' + esc(rc.offer) + ' →</a><a href="' + r('anwendungsfaelle') + '#bereich-' + x.slug + '">' + T('Situation ' + esc(x.name) + ' im Detail →', esc(x.name) + ' situation in detail →') + '</a></div></div></div>';
    }).join('') : '<p class="pc-none">' + T('Ihre Antworten zeigen in keinem Bereich einen dringenden Hebel – eine gute Ausgangslage. Sinnvoll sind gezielte Verbesserungen und eine regelmäßige Überprüfung.', 'Your answers show no urgent lever in any area – a good starting point. Targeted improvements and regular reviews make sense.') + '</p>';

    el('pcFirst').innerHTML = '<p class="pc-first-label">' + T('Ihr empfohlener nächster Schritt', 'Your recommended next step') + '</p><h3 class="pc-first-title">' + esc(res.first.title) + '</h3><p>' + esc(res.first.text) + '</p><a class="link-arrow link-arrow--light" href="' + r(res.first.route) + '">' + esc(res.first.label) + ' →</a>';
    if (st) el('pcFirst').innerHTML = firstHtml(st.first);
    var rl = root.querySelector('.pc-recos .pc-recos-label'); if (rl) rl.textContent = st ? T('Ihre drei Prioritäten im Überblick', 'Your three priorities at a glance') : T('Ihre drei Prioritäten – mit passendem Ansatz', 'Your three priorities – with a matching approach');

    el('pcRoadmap').innerHTML = res.roadmap.map(function (p) {
      return '<li><small>' + esc(p.phase) + '</small><b>' + esc(p.title) + '</b><ul>' + p.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></li>';
    }).join('');

    var rk = el('pcRisk');
    rk.innerHTML = res.risks.length ? '<p class="pc-recos-label">' + T('Worauf Sie achten sollten', 'What to watch out for') + '</p>' + res.risks.map(function (x) {
      return '<p class="pc-risk-' + x.kind + '"><b>' + esc(x.title) + ':</b> ' + esc(x.text) + ' <a href="' + r(x.route) + '">' + T('Mehr →', 'More →') + '</a></p>';
    }).join('') : '';
    rk.hidden = !res.risks.length;

    try { sessionStorage.setItem('hw_check_summary', T('Ergebnis aus dem KI-Potenzialcheck: ', 'Result from the AI Potential Check: ') + res.summary); } catch (e) {}
    var share = el('pcShare'); if (share) rebuildShare(share, shareUrl(a));

    root.querySelector('.pc-card').classList.add('done');
    el('pcResult').hidden = false; el('pcResult').classList.add('show');
    if (scroll) { var h = el('pcResultTitle'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'start' }); }
    try { document.dispatchEvent(new CustomEvent('hwai:context', { detail: { section: 'potenzialcheck', topic: 'result' } })); } catch (e) {}
  }

  function rebuildShare(box, url) {
    var text = T('Unser Ergebnis im HWaiHub KI-Potenzialcheck', 'Our result in the HWaiHub AI Potential Check');
    box.innerHTML = '<a href="mailto:?subject=' + encodeURIComponent(text) + '&body=' + encodeURIComponent(text + ': ' + url) + '">' + T('Ergebnis per E-Mail an die Geschäftsführung', 'Email the result to management') + '</a><button type="button">' + T('Ergebnis-Link kopieren', 'Copy result link') + '</button>';
    box.querySelector('button').addEventListener('click', function (ev) {
      var b = ev.currentTarget, done = function () { var t = b.textContent; b.textContent = T('Kopiert ✓', 'Copied ✓'); setTimeout(function () { b.textContent = t; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt(T('Link kopieren:', 'Copy link:'), url); });
      else window.prompt(T('Link kopieren:', 'Copy link:'), url);
    });
  }

  // ── Bericht (Druckansicht → „Als PDF speichern“), A4 im HWaiHub-Design ──
  function buildReport(person) {
    var res = last.res, date = new Date().toLocaleDateString(T('de-DE', 'en-GB'), { day: '2-digit', month: 'long', year: 'numeric' });
    // Vor der Freischaltung: Platzhalter statt Name und Unternehmen
    var firm = esc(person.company || person.name || T('Ihr Unternehmen', 'Your company'));
    var who = person.name ? esc(person.name) + (person.role ? ' · ' + esc(person.role) : '') : T('Ihr Name', 'Your name');
    var head = function (t, n) { return '<header class="pcr-head"><span class="pcr-word">' + LOGO + '</span><span>' + T('KI-Potenzialbericht', 'AI potential report') + ' · ' + firm + '</span></header><p class="pcr-kicker">' + n + '</p><h2 class="pcr-h">' + t + '</h2>'; };
    var mbar = function (p) { return '<span class="pcr-bar"><i style="width:' + Math.max(3, p) + '%"></i></span>'; };
    var html = '';
    // Deckblatt
    html += '<section class="pcr-cover"><div class="pcr-cover-in">' +
      '<div><span class="pcr-word pcr-word--xl">' + LOGO + '</span><p class="pcr-claim">Business first. Technology second.</p></div>' +
      '<div class="pcr-cover-mid"><p class="pcr-kicker pcr-kicker--light">' + T('Persönliche Auswertung', 'Personal assessment') + '</p><h1>' + T('KI-Potenzial&shy;bericht', 'AI potential report') + '</h1><p class="pcr-for">' + T('für ', 'for ') + firm + '</p>' +
      '<div class="pcr-cover-score">' + ringSvg(res.reife, 150, true) + '<div><strong>' + res.reife + ' %</strong><span>' + T('KI-Reife', 'AI maturity') + ' · ' + esc(res.stageName) + '</span></div></div>' +
      '<p class="pcr-cover-verdict">' + esc(res.verdict) + '</p></div>' +
      '<dl class="pcr-cover-meta"><div><dt>' + T('Erstellt für', 'Prepared for') + '</dt><dd>' + who + '</dd></div><div><dt>' + T('Datum', 'Date') + '</dt><dd>' + date + '</dd></div><div><dt>' + T('Grundlage', 'Basis') + '</dt><dd>' + (last.deep ? T('KI-Potenzialcheck, 16 Fragen', 'AI Potential Check, 16 questions') : T('KI-Potenzialcheck, 12 Fragen', 'AI Potential Check, 12 questions')) + '</dd></div></dl>' +
      '</div></section>';
    // 01 Zusammenfassung und Reifeprofil
    html += '<section class="pcr-page">' + head(T('Das Wichtigste auf einen Blick', 'The key points at a glance'), T('01 · Zusammenfassung', '01 · Summary')) +
      '<div class="pcr-summary"><div class="pcr-sum-ring">' + ringSvg(res.reife, 112, false) + '<div><strong>' + res.reife + ' %</strong><span>' + T('KI-Reife', 'AI maturity') + '</span></div></div>' +
      '<div><p class="pcr-verdict">' + esc(res.verdict) + '</p><p>' + esc(res.sub) + '</p></div></div>' +
      '<div class="pcr-kpis">' + [[T('Fundament', 'Foundation'), res.fundament, T('Prozesse, Daten, Plattform', 'Processes, data, platform')], [T('Bereitschaft', 'Readiness'), res.bereitschaft, T('KI-Nutzung, Regeln, Führung', 'AI use, rules, leadership')], [T('Hebel', 'Lever'), res.hebel, T('Zeitverlust in Ihren Bereichen', 'Time lost in your areas')]].map(function (k) {
        return '<div><small>' + k[0] + '</small><strong>' + k[1] + ' %</strong>' + mbar(k[1]) + '<span>' + k[2] + '</span></div>'; }).join('') + '</div>' +
      (res.strengths.length ? '<p class="pcr-strengths"><b>' + T('Ihre Stärken', 'Your strengths') + '</b>' + esc(res.strengths.join(' · ')) + '</p>' : '') +
      '<h3 class="pcr-h3">' + T('Ihr Reifeprofil', 'Your maturity profile') + '</h3><div class="pcr-dims">' + res.dims.map(function (d) {
        return '<div class="pcr-dim"><div class="pcr-dim-h"><small>' + esc(d.group) + '</small><b>' + esc(d.name) + '</b><span>' + d.pct + ' %</span></div>' + mbar(d.pct) + '<p>' + esc(d.text) + '</p></div>'; }).join('') + '</div></section>';
    // Ist-Analyse: je vertieftem Bereich eine Seite
    (last.deep || []).forEach(function (x) {
      var flow = afterFlow(x), d = DEEPDATA[x.key] || {};
      var stx = last.story;
      html += '<section class="pcr-page">' + head(esc(x.title), T('Unsere Einschätzung · ', 'Our assessment · ') + esc(x.name)) +
        (stx ? '<p class="pcr-verdict">' + esc(stx.verdict) + '</p><p>' + esc(stx.sub) + '</p><div class="pcr-kpis">' + stx.tiles.map(function (k) { return '<div><small>' + esc(k[0]) + '</small><strong>' + esc(k[1]) + '</strong><span>' + esc(k[2]) + '</span></div>'; }).join('') + '</div>' : '') +
        '<h3 class="pcr-h3">' + (x.bns.length > 1 ? T('Wo die Zeit verloren geht – zwei Ansatzpunkte', 'Where the time is lost – two starting points') : T('Wo die Zeit verloren geht', 'Where the time is lost')) + '</h3>' + x.bns.map(function (b) {
          return '<article class="pcr-prio"><span class="pcr-prio-n">' + b.n + '</span><div><h4>' + esc(b.label) + '</h4><p>' + esc(b.diag) + '</p><p class="pcr-prio-m"><b>' + BN_LABELS[1] + ':</b> ' + esc(b.sofort) + '</p><p class="pcr-prio-m"><b>' + BN_LABELS[2] + ':</b> ' + esc(b.ziel) + '</p><p class="pcr-prio-m"><b>' + BN_LABELS[3] + ':</b> ' + esc(b.voraus) + '</p></div></article>'; }).join('') +
        '<p class="pcr-note">' + (flow ? '<b>' + T('So kann der Ablauf danach aussehen:', 'What the workflow can look like afterwards:') + '</b> ' + esc(flow) + '. ' : '') + (d.control ? esc(d.control) + ' ' : '') + (x.hours != null ? T('Die Zeitangabe ist eine Hochrechnung aus Ihren Angaben, keine Messung und kein Wirkungsversprechen.', 'The time figure is an extrapolation from your answers, not a measurement and not a promise of impact.') : '') + '</p></section>';
    });
    // 02 Hebel und Prioritäten
    html += '<section class="pcr-page">' + head(T('Wo Ihr größter Hebel liegt', 'Where your biggest lever lies'), T('02 · Hebel und Prioritäten', '02 · Levers and priorities')) +
      '<table class="pcr-areas"><thead><tr><th>' + T('Bereich', 'Area') + '</th><th>' + T('Hebel', 'Lever') + '</th><th></th><th>' + T('Empfohlener Ansatz', 'Recommended approach') + '</th></tr></thead><tbody>' + res.areas.map(function (x) {
        return '<tr' + (x.p >= 2 ? ' class="hi"' : '') + '><td><b>' + esc(x.name) + '</b>' + (x.fokus ? ' <em>' + T('Ihr Fokus', 'Your focus') + '</em>' : '') + '</td><td>' + (x.applicable ? x.pct + ' %' : '–') + '</td><td>' + (x.applicable ? mbar(x.pct) : '<span class="pcr-na">' + T('trifft nicht zu', 'not applicable') + '</span>') + '</td><td>' + (x.reco && x.p > 0 ? esc(x.reco.title) : x.applicable ? T('läuft gut', 'runs well') : '') + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h3 class="pcr-h3">' + T('Ihre drei Prioritäten', 'Your three priorities') + '</h3>' + (res.prios.length ? res.prios.map(function (x, i) {
        return '<article class="pcr-prio"><span class="pcr-prio-n">0' + (i + 1) + '</span><div><p class="pcr-prio-meta">' + esc(x.name) + ' · ' + esc(x.reco.typeLabel) + T(' · Hebel ', ' · lever ') + x.pct + ' %' + (x.fokus ? T(' · Ihr Fokus', ' · your focus') : '') + '</p><h4>' + esc(x.reco.title) + '</h4><p>' + esc(x.reco.approach) + '</p><p class="pcr-prio-m"><b>' + T('Was wir messen würden:', 'What we would measure:') + '</b> ' + esc(x.reco.measure) + ' &nbsp;·&nbsp; <b>' + T('Passendes Angebot:', 'Matching service:') + '</b> ' + esc(x.reco.offer) + '</p></div></article>'; }).join('')
        : '<p>' + T('Ihre Antworten zeigen keinen dringenden Hebel. Sinnvoll sind gezielte Verbesserungen und eine regelmäßige Überprüfung.', 'Your answers show no urgent lever. Targeted improvements and regular reviews make sense.') + '</p>') + '</section>';
    // 03 Fahrplan, Hinweise, nächster Schritt
    html += '<section class="pcr-page">' + head(T('Ihr Weg zu messbarer Wirkung', 'Your path to measurable impact'), T('03 · Fahrplan', '03 · Roadmap')) +
      '<ol class="pcr-road">' + res.roadmap.map(function (p) { return '<li><small>' + esc(p.phase) + '</small><b>' + esc(p.title) + '</b><ul>' + p.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></li>'; }).join('') + '</ol>' +
      '<p class="pcr-note">' + T('Vorschlag auf Basis Ihrer Angaben. Umfang und Reihenfolge legen wir gemeinsam fest – nach jeder Phase entscheiden Sie, ob es weitergeht.', 'Proposal based on your answers. We define scope and order together – after each phase you decide whether to continue.') + '</p>' +
      (res.risks.length ? '<h3 class="pcr-h3">' + T('Worauf Sie achten sollten', 'What to watch out for') + '</h3><div class="pcr-risks">' + res.risks.map(function (x) { return '<p class="pcr-risk pcr-risk--' + x.kind + '"><b>' + esc(x.title) + '</b>' + esc(x.text) + '</p>'; }).join('') + '</div>' : '') +
      '</section>';
    // 04 Nächster Schritt und Methodik
    html += '<section class="pcr-page">' + head(T('Wie es jetzt weitergeht', 'How to proceed now'), T('04 · Ihr nächster Schritt', '04 · Your next step')) +
      '<div class="pcr-next"><div><p class="pcr-kicker pcr-kicker--light">' + T('Ihr empfohlener nächster Schritt', 'Your recommended next step') + '</p><h3>' + esc(res.first.title) + '</h3><p>' + esc(res.first.text) + '</p>' +
      '<p class="pcr-next-cta">' + T('Kostenloses Erstgespräch, 30 Minuten – Termin wählen:', 'Free intro call, 30 minutes – choose a time:') + '<br /><b>' + esc(abs(r('booking'))) + '</b></p></div>' +
      '<div class="pcr-hanna"><img src="/assets/images/hanna_weiss.jpg" alt="" /><b>Hanna Winkelmann</b><span>' + T('Gründerin HWaiHub', 'Founder, HWaiHub') + '</span><span>info@hwaihub.com</span><span>hwaihub.com</span></div></div>' +
      (EN
        ? '<h3 class="pcr-h3">What to expect in the intro call</h3><ol class="pcr-steps">' +
          '<li><b>Review your result together</b><span>We go through your priorities and clarify where time is really lost.</span></li>' +
          '<li><b>Name the right starting point</b><span>You learn which step is worthwhile – with scope and price upfront.</span></li>' +
          '<li><b>You decide</b><span>30 minutes, free and without obligation. After each step you decide whether to continue.</span></li></ol>' +
          '<div class="pcr-method"><h3 class="pcr-h3">How the assessment is created</h3><ul>' +
          '<li><b>AI maturity</b> combines foundation (processes, data, platform) and readiness (AI use, rules, leadership) – 0 to 3 points per question, rounded to 5 %.</li>' +
          '<li><b>Lever per area</b> shows how much time is lost there according to your answers. Areas that do not apply are not included.</li>' +
          '<li><b>Recommendations</b> take lever and prerequisites into account: Copilot only with Microsoft 365, automation only with a sound workflow and reliable data – otherwise the process comes first.</li>' +
          '<li><b>Limits:</b> The assessment is based solely on your answers. It does not replace an audit, contains no promises of impact and is not legal advice. In the AI Transformation Analysis we examine your real workflows, data and rules.</li></ul></div></section>'
        : '<h3 class="pcr-h3">Was Sie im Erstgespräch erwartet</h3><ol class="pcr-steps">' +
      '<li><b>Ihr Ergebnis gemeinsam prüfen</b><span>Wir gehen Ihre Prioritäten durch und klären, wo der Zeitverlust wirklich entsteht.</span></li>' +
      '<li><b>Passenden Einstieg benennen</b><span>Sie erfahren, welcher Schritt sich lohnt – mit Umfang und Preis vorab.</span></li>' +
      '<li><b>Sie entscheiden</b><span>30 Minuten, kostenlos und unverbindlich. Nach jedem Schritt entscheiden Sie, ob es weitergeht.</span></li></ol>' +
      '<div class="pcr-method"><h3 class="pcr-h3">So entsteht die Auswertung</h3><ul>' +
      '<li><b>KI-Reife</b> setzt sich aus Fundament (Prozesse, Daten, Plattform) und Bereitschaft (KI-Nutzung, Regeln, Führung) zusammen – je Frage 0 bis 3 Punkte, auf 5 % gerundet.</li>' +
      '<li><b>Hebel je Bereich</b> zeigt, wie viel Zeit dort nach Ihren Angaben verloren geht. Bereiche, die nicht zutreffen, fließen nicht ein.</li>' +
      '<li><b>Empfehlungen</b> berücksichtigen Hebel und Voraussetzungen: Copilot nur mit Microsoft 365, Automatisierung nur mit tragfähigem Ablauf und verlässlichen Daten – sonst zuerst der Prozess.</li>' +
      '<li><b>Grenzen:</b> Die Einordnung basiert ausschließlich auf Ihren Angaben. Sie ersetzt kein Audit, enthält keine Wirkungsversprechen und ist keine Rechtsberatung. In der KI-Transformationsanalyse prüfen wir Ihre echten Abläufe, Daten und Regeln.</li></ul></div></section>');
    // 05 Anhang: Antworten
    html += '<section class="pcr-page">' + head(T('Ihre Antworten im Überblick', 'Your answers at a glance'), T('05 · Anhang', '05 · Appendix')) +
      '<table class="pcr-answers"><tbody>' + answerList().map(function (x) { return '<tr><td>' + x.n + '</td><td><small>' + esc(x.block) + '</small>' + esc(x.q) + '</td><td><b>' + esc(x.a) + '</b></td></tr>'; }).join('') + '</tbody></table></section>';
    var box = el('pcReport'); box.innerHTML = html;
    return Promise.all(Array.prototype.map.call(box.querySelectorAll('img'), function (img) {
      return img.complete ? Promise.resolve() : new Promise(function (ok) { img.onload = img.onerror = ok; });
    }));
  }
  function printReport() {
    document.body.classList.add('pc-printing');
    var t = document.title; document.title = T('HWaiHub KI-Potenzialbericht', 'HWaiHub AI potential report');
    var done = function () { document.body.classList.remove('pc-printing'); document.title = t; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); }, 80);
  }

  // ── Vorschau: Bericht sofort erstellen, ab Seite 2 verschwommen bis zur Freischaltung ──
  var modal = el('pcrModal'), unlocked = false;
  if (modal && modal.parentNode !== document.body) document.body.appendChild(modal); // eigene Ebene, auch für den Druck
  function fit() { var st = el('pcrStage'), rp = el('pcReport'); if (st && rp) rp.style.zoom = Math.min(1, (st.clientWidth - 32) / 794).toFixed(3); }
  function openPreview() {
    buildReport(person || { name: '', company: '' });
    modal.hidden = false; document.documentElement.classList.add('pcr-open');
    el('pcrStage').scrollTop = 0; fit();
    setTimeout(function () { (unlocked ? el('pcrSave') : el('pl-name')).focus({ preventScroll: true }); }, 60);
  }
  function closePreview() { modal.hidden = true; document.documentElement.classList.remove('pcr-open'); el('pcPdfOpen').focus({ preventScroll: true }); }
  function unlock() {
    unlocked = true;
    el('pcReport').classList.remove('is-locked'); el('pcrGate').hidden = true;
    el('pcrSave').disabled = false; el('pcrState').textContent = T('Freigeschaltet für ', 'Unlocked for ') + person.name;
    return buildReport(person);
  }
  function sentNote(text, cls, html) {
    var n = el('pcrNote'); if (!n) { n = document.createElement('p'); n.id = 'pcrNote'; modal.querySelector('.pcr-topbar').appendChild(n); }
    n.className = 'pcr-note-top ' + cls; if (html) n.innerHTML = text; else n.textContent = text;
    n.insertAdjacentHTML('beforeend', ' <span>' + T('Zum Speichern im Druckfenster „Als PDF speichern“ wählen und „Kopf- und Fußzeilen“ abwählen.', 'To save, choose "Save as PDF" in the print dialog and deselect "Headers and footers".') + '</span>');
  }

  // ── Freischalten: Übermittlung an HWaiHub (nur mit Einwilligung) ──
  function clean(v) { return String(v || '').replace(/["\\]/g, '').replace(/\s+/g, ' ').trim(); }
  function endpoint() { var m = document.querySelector('meta[name="hw-form-endpoint"]'); var v = m ? (m.getAttribute('content') || '').trim() : ''; return /^https:\/\//.test(v) ? v : ''; }
  var startedAt = Date.now(), person = null, sent = false;
  function lead(ev) {
    ev.preventDefault();
    var msg = el('plMsg');
    var g = function (id) { var x = el(id); return x ? (x.type === 'checkbox' ? x.checked : (x.value || '').trim()) : ''; };
    if (g('pl-hp')) return;
    person = { name: g('pl-name'), email: g('pl-email'), company: g('pl-company'), role: g('pl-role'), size: g('pl-size'), phone: g('pl-phone'), callback: g('pl-callback') };
    var err = !person.name || !person.email ? T('Bitte Name und E-Mail angeben.', 'Please enter your name and email.')
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(person.email) ? T('Bitte eine gültige E-Mail-Adresse angeben.', 'Please enter a valid email address.')
      : person.name.length > 120 || person.company.length > 160 ? T('Bitte kürzere Angaben verwenden.', 'Please use shorter entries.')
      : !g('pl-consent') ? T('Bitte bestätigen Sie die Einwilligung, damit wir Ihren Bericht erstellen dürfen.', 'Please confirm your consent so that we may create your report.') : '';
    if (err) { msg.textContent = err; msg.className = 'pl-msg is-error'; return; }
    var res = last.res, btn = el('plSubmit'), list = answerList();
    var payload = {
      form: 'potenzialcheck', lang: EN ? 'en' : 'de', submittedAt: new Date().toISOString(), tag: 'Potenzialcheck',
      name: clean(person.name), email: person.email, company: clean(person.company), role: person.role, size: person.size, phone: person.phone,
      callbackRequested: !!person.callback, consent: true,
      topic: 'KI-Potenzialcheck', message: res.summary,
      result: {
        reife: res.reife, stufe: res.stageName, fundament: res.fundament, bereitschaft: res.bereitschaft, hebel: res.hebel, urteil: res.verdict,
        naechsterSchritt: res.first.title,
        prioritaeten: res.prios.map(function (x) { return x.name + ': ' + x.reco.title; }),
        hebelJeBereich: res.areas.map(function (x) { return x.name + ': ' + (x.applicable ? x.pct + ' %' : T('trifft nicht zu', 'not applicable')); }),
        hinweise: res.risks.map(function (x) { return x.title; }),
        fokus: res.fokus,
        istAnalyse: (last.deep || []).map(function (x) { return x.summary; })
      },
      answers: list.map(function (x) { return x.n + '. ' + x.q + ' → ' + x.a; }),
      code: E.encode(last.a), shareUrl: shareUrl(last.a),
      source: (function () { try { return sessionStorage.getItem('hw_utm') || ''; } catch (e) { return ''; } })(),
      fillSeconds: Math.round((Date.now() - startedAt) / 1000)
    };
    // Notizen für Notion: vollständig, als escapter JSON-Text (Make setzt ihn direkt in den Notion-Aufruf ein; max. 2000 Zeichen)
    var notes = 'KI-Potenzialcheck' + (EN ? ' (EN)' : '') + ' · ' + res.summary +
      '\n\nRückruf gewünscht: ' + (person.callback ? 'JA' : 'nein') + (person.role ? ' · Rolle: ' + person.role : '') +
      (last.deep ? '\nIst-Analyse: ' + payload.result.istAnalyse.join(' | ') : '') +
      '\nHebel: ' + payload.result.hebelJeBereich.join(', ') +
      (res.risks.length ? '\nHinweise: ' + payload.result.hinweise.join(', ') : '') +
      '\n\nAntworten:\n' + list.map(function (x) { return x.n + '. ' + x.a; }).join('\n') +
      '\n\nErgebnis-Link: ' + payload.shareUrl;
    payload.notes = JSON.stringify(notes.slice(0, 1750)).slice(1, -1);
    // Zusatzsatz für die Bestätigungsmail (Make setzt ihn unverändert ein)
    payload.mailExtra = T('Ihr Ergebnis aus dem KI-Potenzialcheck können Sie jederzeit wieder öffnen: ', 'You can reopen your result from the AI Potential Check at any time: ') + payload.shareUrl;
    payload.callback = person.callback ? 'Ja – bitte melden' : 'nein';
    // Für Notion fertig aufbereitete Felder (Make setzt sie unverändert in den Notion-Aufruf ein)
    var phone = String(person.phone || '').replace(/[^\d+()\/ -]/g, '').trim().slice(0, 40);
    var role = String(person.role || '').replace(/["\\]/g, '').trim().slice(0, 120);
    payload.quelle = 'KI-Potenzialcheck';
    payload.interestJson = JSON.stringify([{ name: 'KI-Potenzialcheck' }]);
    payload.phoneJson = phone ? JSON.stringify(phone) : 'null';
    payload.positionJson = role ? JSON.stringify([{ text: { content: role } }]) : '[]';
    btn.disabled = true; msg.className = 'pl-msg'; msg.textContent = T('Einen Moment …', 'One moment …');
    var url = endpoint();
    var send = sent ? Promise.resolve(true) : url ? Promise.race([
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) }).then(function (x) { if (!x.ok) throw new Error('HTTP ' + x.status); return true; }),
      new Promise(function (_, no) { setTimeout(function () { no(new Error('timeout')); }, 9000); })
    ]) : Promise.reject(new Error('noendpoint'));
    send.then(function () {
      sent = true;
      sentNote(T('✓ Danke, ', '✓ Thank you, ') + person.name.split(' ')[0] + '. ' + (person.callback ? T('Wir melden uns persönlich bei Ihnen.', 'We will get back to you personally.') : T('Bei Fragen zu Ihrem Ergebnis sind wir für Sie da.', 'If you have questions about your result, we are here for you.')), 'is-ok');
    }, function () {
      // Bericht trotzdem freischalten; Übermittlung per E-Mail anbieten
      var body = T('Ergebnis aus dem KI-Potenzialcheck', 'Result from the AI Potential Check') + '\n\n' + person.name + (person.company ? ' · ' + person.company : '') + (person.role ? ' · ' + person.role : '') + '\n' + person.email + '\n\n' + res.summary + T('\n\nAntworten:\n', '\n\nAnswers:\n') + payload.answers.join('\n') + '\n\nLink: ' + payload.shareUrl;
      sentNote(T('Die automatische Übermittlung an HWaiHub hat nicht geklappt – ', 'The automatic transmission to HWaiHub did not work – ') + '<a href="mailto:info@hwaihub.com?subject=' + encodeURIComponent(T('KI-Potenzialcheck: ', 'AI Potential Check: ') + (person.company || person.name)) + '&body=' + encodeURIComponent(body) + '">' + T('Ergebnis per E-Mail an HWaiHub senden', 'Send the result to HWaiHub by email') + '</a>.', 'is-warn', true);
    }).then(function () { btn.disabled = false; msg.textContent = ''; return unlock(); })
      .then(function () { el('pcrStage').scrollTop = 0; el('pcrSave').focus({ preventScroll: true }); printReport(); });
  }

  function reset() {
    form.reset(); sent = false; D = {}; buildDeep([]);
    el('pcResult').hidden = true; el('pcResult').classList.remove('show');
    unlocked = false; person = null; el('pcReport').classList.add('is-locked'); el('pcrGate').hidden = false; el('pcrSave').disabled = true;
    el('pcrState').textContent = T('Vorschau · ' + (DEEP ? 7 : 6) + ' Seiten', 'Preview · ' + (DEEP ? 7 : 6) + ' pages'); var nt = el('pcrNote'); if (nt) nt.remove(); el('plMsg').textContent = '';
    if (!modal.hidden) closePreview();
    root.querySelector('.pc-card').classList.remove('done');
    step = 0; render();
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }

  // ── Ereignisse ──
  form.addEventListener('pointerdown', function () { pointer = true; });
  form.addEventListener('keydown', function () { pointer = false; });
  form.addEventListener('change', function (e) {
    var fsx = e.target.closest ? e.target.closest('.pc-q--deep') : null;
    if (fsx) { var mx = +fsx.getAttribute('data-max'); if (mx && fsx.querySelectorAll('input:checked').length > mx) e.target.checked = false; readDeep(); el('pcMissing').hidden = true; }
    if (e.target.type === 'radio' && pointer && step < qs.length - 1) setTimeout(function () { go(1); }, 220);
    pointer = false;
  });
  el('pcBack').addEventListener('click', function () { go(-1); });
  el('pcNext').addEventListener('click', function () { go(1); });
  el('pcReset').addEventListener('click', reset);
  el('pcLeadForm').addEventListener('submit', lead);
  el('pcPdfOpen').addEventListener('click', openPreview);
  el('pcrClose').addEventListener('click', closePreview);
  el('pcrSave').addEventListener('click', function () { if (unlocked) printReport(); });
  modal.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePreview(); });
  window.addEventListener('resize', function () { if (!modal.hidden) fit(); });

  // Start: geteiltes Ergebnis (?a=…) oder Vorauswahl (?bereich=…)
  var params = new URLSearchParams(location.search);
  render();
  var shared = E.decode(params.get('a'));
  var sharedDeep = shared && DEEP ? DEEP.decode(params.get('d')) : null;
  if (shared) { setAnswers(shared); if (sharedDeep) { D = sharedDeep.d; buildDeep(sharedDeep.slugs); } step = qs.length - 1; render(); show(false); }
  else {
    var b = (params.get('bereich') || '').replace(/[^a-z-]/g, '');
    var key = E.AREAS.filter(function (k) { return E.SLUG[k] === b; })[0];
    if (key) {
      var c = form.querySelector('input[name=q12][value="' + key + '"]'); if (c) c.checked = true;
      var note = el('pcPreselect'); if (note) { note.textContent = T('Vorauswahl: Bereich „' + E.LABEL[key] + '“ ist als Fokus markiert. Sie können das in Frage 12 ändern.', 'Preselected: the area "' + E.LABEL_EN[key] + '" is marked as a focus. You can change this in question 12.'); note.hidden = false; }
    }
  }
})();
