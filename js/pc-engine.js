/* HWaiHub – KI-Potenzialcheck: Auswertungslogik (rein, ohne DOM – im Browser und in Node testbar: scripts/test-potenzialcheck.mjs)
   Grundsätze: Ergebnis folgt nachvollziehbar aus den Antworten. Keine erfundenen Wirkungszahlen, keine Preise.
   Empfehlungen berücksichtigen Hebel UND Voraussetzungen (Prozess, Daten, Plattform, Regeln):
   – Copilot wird nur empfohlen, wenn Microsoft 365 vorhanden ist.
   – Automatisierung nur, wenn Ablauf und Daten tragen; sonst „Prozess zuerst“.
   Antworten: q1–q3, q10, q11 = 0–3 · q4–q8 = 0–3 oder 'n' (trifft nicht zu) · q9 = a–d · q12 = Liste der Fokusbereiche */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HWPC = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var AREAS = ['Vertrieb', 'Verwaltung', 'Kundenservice', 'Wissen', 'Steuerung', 'Mitarbeiter'];
  var SLUG = { Vertrieb: 'vertrieb', Verwaltung: 'verwaltung', Kundenservice: 'kundenservice', Wissen: 'wissen', Steuerung: 'steuerung', Mitarbeiter: 'mitarbeiter' };
  var LABEL = { Vertrieb: 'Vertrieb', Verwaltung: 'Verwaltung', Kundenservice: 'Kundenservice', Wissen: 'Wissen', Steuerung: 'Steuerung', Mitarbeiter: 'Mitarbeitende' };
  var TYP = { halten: 'Halten', copilot: 'Copilot', automation: 'Automatisierung', agent: 'KI-Assistent', wissen: 'Wissenssuche', enable: 'Befähigung', process: 'Prozess zuerst', regeln: 'Regeln' };
  var STAGES = ['', 'Manuell geprägt', 'Digital, aber unverbunden', 'Vernetzt', 'Automatisierungsbereit'];
  // Englisch: gleiche Logik, eigene Texte (Sprache je Aufruf: evaluate(a, 'en'))
  var LABEL_EN = { Vertrieb: 'Sales', Verwaltung: 'Administration', Kundenservice: 'Customer service', Wissen: 'Knowledge', Steuerung: 'Management reporting', Mitarbeiter: 'Employees' };
  var TYP_EN = { halten: 'Maintain', copilot: 'Copilot', automation: 'Automation', agent: 'AI assistant', wissen: 'Knowledge search', enable: 'Enablement', process: 'Process first', regeln: 'Rules' };
  var STAGES_EN = ['', 'Mainly manual', 'Digital, but disconnected', 'Connected', 'Ready for automation'];
  var LANG = 'de';
  function L(de, en) { return LANG === 'en' ? en : de; }

  // Reifeprofil: sechs Dimensionen, je Stufe eine Einordnung (0 … 3)
  var DIMS = [
    { key: 'q1', name: 'Prozesse', group: 'Fundament', text: [
      'Abläufe hängen von der Person ab. Bevor etwas automatisiert wird, braucht es einen gemeinsamen, wiederholbaren Ablauf.',
      'Das Prozesswissen steckt in den Köpfen erfahrener Mitarbeitender. Das ist ein Risiko bei Ausfall und bremst jede Automatisierung.',
      'Abläufe sind grob beschrieben, im Alltag wird oft abgewichen. Für einen Pilot reicht das, wenn der eine Ablauf vorher geschärft wird.',
      'Abläufe sind beschrieben und gelebt – eine sehr gute Voraussetzung für Automatisierung.'] },
    { key: 'q2', name: 'Daten', group: 'Fundament', text: [
      'Oft ist unklar, welche Daten aktuell sind. KI und Automatisierung würden diese Unsicherheit nur beschleunigen.',
      'Daten liegen in Excel, E-Mails und Ordnern. Für KI fehlt eine verlässliche Quelle – das ist meist der erste Hebel.',
      'Daten liegen in mehreren, teilweise verbundenen Systemen. Automatisierung ist möglich, wenn die führende Quelle je Ablauf feststeht.',
      'Es gibt ein führendes, gepflegtes System. Daten können verlässlich angebunden werden.'] },
    { key: 'q3', name: 'Plattform', group: 'Fundament', text: [
      'Es gibt keine gemeinsame Arbeitsplattform. Zusammenarbeit und jede KI-Lösung beginnen mit einer gemeinsamen Basis.',
      'Gearbeitet wird mit E-Mail und Office. Microsoft Copilot setzt Microsoft 365 voraus – Alternativen sind technologieoffen möglich.',
      'Microsoft 365 ist vorhanden, wird aber uneinheitlich genutzt. Die Basis für Copilot ist da, Ablage und Berechtigungen brauchen Ordnung.',
      'Microsoft 365 mit Teams und SharePoint wird zentral genutzt – eine starke Basis für Copilot und Automatisierung.'] },
    { key: 'ki', name: 'KI-Nutzung', group: 'Bereitschaft', text: [
      'KI wird noch nicht eingesetzt. Das ist kein Nachteil: Sie können geordnet starten – mit Regeln und Schulung von Anfang an.',
      'Einzelne nutzen KI auf eigene Faust. Das zeigt Interesse, birgt aber Risiken für Daten und Qualität.',
      'Lizenzen sind vorhanden, werden aber kaum genutzt. Hier liegt bezahltes Potenzial brach.',
      'KI ist eingeführt, geschult und geregelt – eine gute Basis, um weitere Anwendungsfälle zu erschließen.'] },
    { key: 'q10', name: 'Regeln', group: 'Bereitschaft', text: [
      'Es gibt keine Regeln, private Konten sind im Einsatz. Das ist das dringendste Thema: Kundendaten könnten betroffen sein.',
      'Das Bewusstsein ist da, Regeln fehlen noch. Eine kurze, verbindliche KI-Richtlinie schafft schnell Sicherheit.',
      'Es gibt mündliche Absprachen. Schriftlich festgehalten werden sie verbindlich und nachweisbar.',
      'Eine schriftliche Richtlinie ist bekannt – sie trägt auch neue Anwendungsfälle.'] },
    { key: 'q11', name: 'Führung', group: 'Bereitschaft', text: [
      'Die Geschäftsführung ist skeptisch. Ein kleiner, gemessener Pilot mit klaren Regeln ist der beste Weg, Risiken greifbar zu machen.',
      'Die Geschäftsführung wartet ab. Ohne Zielbild und verantwortliche Person versanden KI-Vorhaben im Alltag.',
      'Die Geschäftsführung will starten, weiß aber nicht wo. Genau dafür ist eine klare Priorisierung da.',
      'Zielbild, Budget und Verantwortung stehen – Sie können zügig und gezielt umsetzen.'] }
  ];

  // Empfehlungen: [Typ, Titel, Ansatz, Was wir messen, [Route, Angebot]]
  var R = {
    halten: function (area) { return ['halten', 'Stand halten', 'Dieser Bereich läuft bereits gut. Fokus auf laufende Verbesserung.', '–', ['begleitung', 'KI-Begleitung']]; },
    Vertrieb: {
      copilot: ['copilot', 'Copilot für Angebotstexte und Nachfassen', 'Vorlagen, Textentwürfe und Notizen mit Copilot in Outlook und Word – ohne Systemumbau.', 'Zeit pro Angebot, Reaktionszeit', ['copilot-einfuehrung', 'Copilot-Einführung']],
      vorlagen: ['process', 'Angebotsvorlagen und Preisbasis vereinheitlichen', 'Eine gültige Preisliste, Textbausteine und eine Vorlage – die Grundlage, auf der später ein Angebotsentwurf automatisch entstehen kann.', 'Zeit pro Angebot, Rückfragen', ['business-automation', 'KI & Business Automation']],
      automation: ['automation', 'Anfrage → Angebot automatisieren', 'Anfrage auslesen, Daten zusammenführen, Angebotsentwurf erzeugen – ein Mensch prüft und gibt frei.', 'Durchlaufzeit, Zeit pro Angebot, Rückfragen', ['pilot', 'KI & Automation Pilot']],
      process: ['process', 'Angebotsprozess klären, dann automatisieren', 'Erst Ablauf, Zuständigkeiten und Datenquellen festlegen, dann den Angebotsentwurf automatisieren – mit menschlicher Freigabe.', 'Durchlaufzeit, verpasste Anfragen', ['analyse', 'KI-Transformationsanalyse']]
    },
    Verwaltung: {
      teil: ['automation', 'Restliche Belegarten anbinden', 'Die noch manuellen Belegarten gezielt automatisieren – Ausnahmen prüft ein Mensch.', 'Manuelle Erfassungen, Bearbeitungszeit', ['pilot', 'KI & Automation Pilot']],
      automation: ['automation', 'Belege erkennen und übernehmen', 'Dokumente erkennen, Daten strukturieren, Ausnahmen prüfen lassen und automatisch übernehmen – Systeme verbinden statt doppelt erfassen.', 'Manuelle Erfassungen, Fehlerquote, Bearbeitungszeit', ['pilot', 'KI & Automation Pilot']],
      process: ['process', 'Datenfluss zuerst ordnen', 'Führendes System je Belegart festlegen und Medienbrüche beseitigen – dann automatisieren.', 'Doppelerfassung, Fehlerquote', ['analyse', 'KI-Transformationsanalyse']]
    },
    Kundenservice: {
      copilot: ['copilot', 'KI-Antwortentwürfe im Postfach', 'Copilot in Outlook für Standardantworten und gemeinsame Vorlagen – ein Mensch sendet.', 'Reaktionszeit, Qualität der Antworten', ['copilot-einfuehrung', 'Copilot-Einführung']],
      vorlagen: ['process', 'Gemeinsames Postfach und Antwortvorlagen', 'Ein Eingangskanal, klare Zuständigkeiten und geprüfte Standardantworten – sofort wirksam, Grundlage für spätere Automatisierung.', 'Reaktionszeit, Nachfragen', ['business-automation', 'KI & Business Automation']],
      automation: ['automation', 'Anfragen einordnen und vorbereiten', 'Eingang analysieren, zuordnen, Antwortentwurf erstellen – ein Mensch prüft und sendet.', 'Statusanfragen, Reaktionszeit, Eskalationen', ['pilot', 'KI & Automation Pilot']],
      agent: ['agent', 'Interner KI-Assistent mit Freigabe', 'Standardfälle vorbereiten, komplexe Fälle an Mitarbeitende, klare Eskalations- und Freigaberegeln.', 'Reaktionszeit, Eskalationen, Anteil Standardfälle', ['pilot', 'KI & Automation Pilot']],
      process: ['process', 'Zuständigkeiten klären, dann automatisieren', 'Eingangskanäle bündeln, Zuständigkeiten und Antwortstandards festlegen – danach Einordnung und Entwürfe automatisieren.', 'Liegezeit, Nachfragen', ['analyse', 'KI-Transformationsanalyse']]
    },
    Wissen: {
      copilot: ['copilot', 'Copilot-Suche über vorhandene Ablagen', 'SharePoint und Teams mit Copilot durchsuchbar machen – Berechtigungen vorher prüfen.', 'Suchzeit, Rückfragen', ['copilot-einfuehrung', 'Copilot-Einführung']],
      ablage: ['process', 'Ablage ordnen, dann Copilot', 'Ablagestruktur und Berechtigungen in Teams und SharePoint vereinheitlichen – erst dann liefert Copilot verlässliche Antworten.', 'Suchzeit, Ablagefehler', ['copilot-einfuehrung', 'Copilot-Einführung']],
      wissen: ['wissen', 'Wissenssuche mit Quellenangabe', 'Dokumente strukturieren und per KI durchsuchbar machen – mit Rechten und sichtbaren Quellen.', 'Suchzeit, Wiederverwendung, Einarbeitungszeit', ['pilot', 'KI & Automation Pilot']],
      process: ['process', 'Wissen sichern, dann KI-Suche', 'Kritisches Wissen zuerst dokumentieren und zentral ablegen, dann eine KI-Suche mit Berechtigungen aufsetzen.', 'Abhängigkeit von Einzelnen, Einarbeitungszeit', ['analyse', 'KI-Transformationsanalyse']]
    },
    Steuerung: {
      copilot: ['copilot', 'Berichte mit Copilot aufbereiten', 'Auswertungen und Zusammenfassungen für die Geschäftsführung mit Copilot in Excel und Word.', 'Aufwand pro Bericht', ['copilot-einfuehrung', 'Copilot-Einführung']],
      vorlagen: ['process', 'Kennzahlen festlegen und Bericht standardisieren', 'Wenige, verbindliche Kennzahlen und eine feste Berichtsvorlage – die Grundlage für eine spätere Automatisierung.', 'Aufwand pro Bericht', ['business-automation', 'KI & Business Automation']],
      automation: ['automation', 'Kennzahlen automatisch zusammenführen', 'Zahlen aus ERP, Buchhaltung und CRM automatisiert zusammenführen und aufbereiten.', 'Aufwand pro Bericht, Aktualität', ['pilot', 'KI & Automation Pilot']],
      process: ['process', 'Datenbasis zuerst festlegen', 'Führende Datenquelle je Kennzahl definieren, dann ein automatisiertes Kennzahlenbild aufbauen.', 'Aktualität, Aufwand', ['analyse', 'KI-Transformationsanalyse']]
    },
    Mitarbeiter: {
      ausbauen: ['halten', 'Nutzung ausbauen', 'Gute Basis – nächste Anwendungsfälle je Rolle erschließen und Nutzung messen.', 'Aktive Nutzung', ['begleitung', 'KI-Begleitung']],
      vertiefen: ['enable', 'Rollenbezogene Vertiefung', 'Anwendungsfälle je Rolle vertiefen, Regeln schriftlich festhalten und im Team verankern.', 'Aktive Nutzung, Qualität', ['academy-unternehmen', 'Academy für Unternehmen']],
      regeln: ['regeln', 'Regeln und rollenbezogene Schulung', 'Einheitliche Werkzeuge, KI-Richtlinie und Schulung je Rolle – statt Einzelinitiativen auf privaten Konten.', 'Aktive Nutzung, sichere Nutzung', ['enablement', 'KI-Befähigung & Regeln']],
      copilot: ['copilot', 'Copilot wirklich einführen', 'Vorbereitung, rollenbasierte Anwendungsfälle, Schulung und Messung der Nutzung.', 'Aktive Nutzung, Zeitersparnis je Anwendungsfall', ['copilot-einfuehrung', 'Copilot-Einführung']],
      start: ['enable', 'Geordnet starten: Grundlagen und Richtlinie', 'Kurze KI-Richtlinie, praxisnahe Grundlagenschulung und ein erster, begrenzter Anwendungsfall.', 'Aktive Nutzung, sichere Nutzung', ['academy-unternehmen', 'Academy für Unternehmen']]
    }
  };

  var DIMS_EN = {
    q1: { name: 'Processes', group: 'Foundation', text: [
      'Workflows depend on the person. Before anything is automated, a shared, repeatable workflow is needed.',
      'Process knowledge sits in the heads of experienced employees. That is a risk in case of absence and slows down any automation.',
      'Workflows are roughly described, but day-to-day practice often deviates. That is enough for a pilot if that one workflow is sharpened first.',
      'Workflows are described and followed – a very good basis for automation.'] },
    q2: { name: 'Data', group: 'Foundation', text: [
      'It is often unclear which data is current. AI and automation would only accelerate this uncertainty.',
      'Data sits in Excel, emails and folders. AI lacks a reliable source – that is usually the first lever.',
      'Data sits in several, partly connected systems. Automation is possible once the leading source is fixed per workflow.',
      'There is a leading, well-maintained system. Data can be connected reliably.'] },
    q3: { name: 'Platform', group: 'Foundation', text: [
      'There is no shared work platform. Collaboration and any AI solution start with a common basis.',
      'Work is done with email and Office. Microsoft Copilot requires Microsoft 365 – technology-agnostic alternatives are possible.',
      'Microsoft 365 is in place but used inconsistently. The basis for Copilot is there; filing and permissions need tidying up.',
      'Microsoft 365 with Teams and SharePoint is used centrally – a strong basis for Copilot and automation.'] },
    ki: { name: 'AI use', group: 'Readiness', text: [
      'AI is not used yet. That is not a disadvantage: you can start in an orderly way – with rules and training from the beginning.',
      'Individuals use AI on their own initiative. That shows interest but carries risks for data and quality.',
      'Licences are in place but hardly used. Paid-for potential lies idle here.',
      'AI is introduced, trained and governed – a good basis for opening up further use cases.'] },
    q10: { name: 'Rules', group: 'Readiness', text: [
      'There are no rules and private accounts are in use. This is the most urgent topic: customer data could be affected.',
      'Awareness is there, rules are still missing. A short, binding AI policy quickly creates certainty.',
      'There are verbal agreements. Written down, they become binding and verifiable.',
      'A written policy is known – it also carries new use cases.'] },
    q11: { name: 'Leadership', group: 'Readiness', text: [
      'Management is sceptical. A small, measured pilot with clear rules is the best way to make risks tangible.',
      'Management is waiting. Without a target picture and a responsible person, AI initiatives fizzle out in daily business.',
      'Management wants to start but does not know where. That is exactly what clear prioritisation is for.',
      'Target picture, budget and responsibility are in place – you can implement quickly and purposefully.'] }
  };

  var R_EN = {
    halten: function (area) { return ['halten', 'Maintain', 'This area already runs well. Focus on continuous improvement.', '–', ['begleitung', 'AI Partnership']]; },
    Vertrieb: {
      copilot: ['copilot', 'Copilot for quote texts and follow-ups', 'Templates, text drafts and notes with Copilot in Outlook and Word – without rebuilding systems.', 'Time per quote, response time', ['copilot-einfuehrung', 'Copilot rollout']],
      vorlagen: ['process', 'Standardise quote templates and price basis', 'One valid price list, text modules and a template – the basis on which a quote draft can later be created automatically.', 'Time per quote, follow-up questions', ['business-automation', 'AI & Business Automation']],
      automation: ['automation', 'Automate enquiry → quote', 'Read the enquiry, merge data, generate a quote draft – a person checks and approves.', 'Lead time, time per quote, follow-up questions', ['pilot', 'AI & Automation Pilot']],
      process: ['process', 'Clarify the quote process, then automate', 'First define workflow, responsibilities and data sources, then automate the quote draft – with human approval.', 'Lead time, missed enquiries', ['analyse', 'AI Transformation Analysis']]
    },
    Verwaltung: {
      teil: ['automation', 'Connect the remaining document types', 'Automate the document types still handled manually – a person checks exceptions.', 'Manual entries, processing time', ['pilot', 'AI & Automation Pilot']],
      automation: ['automation', 'Recognise and import documents', 'Recognise documents, structure data, have exceptions checked and import automatically – connect systems instead of entering data twice.', 'Manual entries, error rate, processing time', ['pilot', 'AI & Automation Pilot']],
      process: ['process', 'Sort out the data flow first', 'Define the leading system per document type and remove media breaks – then automate.', 'Duplicate entry, error rate', ['analyse', 'AI Transformation Analysis']]
    },
    Kundenservice: {
      copilot: ['copilot', 'AI reply drafts in the inbox', 'Copilot in Outlook for standard replies and shared templates – a person sends.', 'Response time, quality of replies', ['copilot-einfuehrung', 'Copilot rollout']],
      vorlagen: ['process', 'Shared inbox and reply templates', 'One inbound channel, clear responsibilities and checked standard replies – effective immediately, basis for later automation.', 'Response time, follow-up questions', ['business-automation', 'AI & Business Automation']],
      automation: ['automation', 'Classify and prepare enquiries', 'Analyse incoming messages, assign them, create a reply draft – a person checks and sends.', 'Status enquiries, response time, escalations', ['pilot', 'AI & Automation Pilot']],
      agent: ['agent', 'Internal AI assistant with approval', 'Prepare standard cases, route complex cases to employees, clear escalation and approval rules.', 'Response time, escalations, share of standard cases', ['pilot', 'AI & Automation Pilot']],
      process: ['process', 'Clarify responsibilities, then automate', 'Bundle inbound channels, define responsibilities and reply standards – then automate classification and drafts.', 'Waiting time, follow-up questions', ['analyse', 'AI Transformation Analysis']]
    },
    Wissen: {
      copilot: ['copilot', 'Copilot search across existing storage', 'Make SharePoint and Teams searchable with Copilot – check permissions first.', 'Search time, follow-up questions', ['copilot-einfuehrung', 'Copilot rollout']],
      ablage: ['process', 'Tidy up storage, then Copilot', 'Standardise filing structure and permissions in Teams and SharePoint – only then does Copilot give reliable answers.', 'Search time, filing errors', ['copilot-einfuehrung', 'Copilot rollout']],
      wissen: ['wissen', 'Knowledge search with sources', 'Structure documents and make them searchable with AI – with permissions and visible sources.', 'Search time, reuse, onboarding time', ['pilot', 'AI & Automation Pilot']],
      process: ['process', 'Secure knowledge, then AI search', 'Document critical knowledge first and store it centrally, then set up an AI search with permissions.', 'Dependence on individuals, onboarding time', ['analyse', 'AI Transformation Analysis']]
    },
    Steuerung: {
      copilot: ['copilot', 'Prepare reports with Copilot', 'Analyses and summaries for management with Copilot in Excel and Word.', 'Effort per report', ['copilot-einfuehrung', 'Copilot rollout']],
      vorlagen: ['process', 'Define metrics and standardise the report', 'A few binding metrics and a fixed report template – the basis for later automation.', 'Effort per report', ['business-automation', 'AI & Business Automation']],
      automation: ['automation', 'Merge metrics automatically', 'Merge and prepare figures from ERP, accounting and CRM automatically.', 'Effort per report, timeliness', ['pilot', 'AI & Automation Pilot']],
      process: ['process', 'Define the data basis first', 'Define the leading data source per metric, then build an automated metrics view.', 'Timeliness, effort', ['analyse', 'AI Transformation Analysis']]
    },
    Mitarbeiter: {
      ausbauen: ['halten', 'Expand usage', 'Good basis – open up the next use cases per role and measure usage.', 'Active usage', ['begleitung', 'AI Partnership']],
      vertiefen: ['enable', 'Role-specific deep dive', 'Deepen use cases per role, write down rules and embed them in the team.', 'Active usage, quality', ['academy-unternehmen', 'Academy for companies']],
      regeln: ['regeln', 'Rules and role-based training', 'Uniform tools, an AI policy and training per role – instead of individual initiatives on private accounts.', 'Active usage, safe usage', ['enablement', 'AI Enablement & Rules']],
      copilot: ['copilot', 'Really roll out Copilot', 'Preparation, role-based use cases, training and measuring usage.', 'Active usage, time saved per use case', ['copilot-einfuehrung', 'Copilot rollout']],
      start: ['enable', 'Start in an orderly way: basics and policy', 'A short AI policy, practical basic training and a first, limited use case.', 'Active usage, safe usage', ['academy-unternehmen', 'Academy for companies']]
    }
  };

  function n(v) { var x = parseInt(v, 10); return isNaN(x) ? 0 : Math.max(0, Math.min(3, x)); }
  function round5(x) { return Math.round(x * 20) * 5; }

  function evaluate(a, lang) {
    a = a || {};
    LANG = lang === 'en' ? 'en' : 'de';
    var Rx = L(R, R_EN), LB = L(LABEL, LABEL_EN), TY = L(TYP, TYP_EN), ST = L(STAGES, STAGES_EN);
    var proz = n(a.q1), daten = n(a.q2), sys = n(a.q3), gov = n(a.q10), fuehrung = n(a.q11);
    var ki = /^[a-d]$/.test(a.q9 || '') ? a.q9 : 'd';
    var fokus = (a.q12 || []).filter(function (x) { return AREAS.indexOf(x) >= 0; });
    var kiR = { a: 3, b: 1, c: 1, d: 0 }[ki];
    var ctx = {
      procReady: proz >= 2, dataReady: daten >= 2, m365: sys >= 2, m365Strong: sys === 3,
      governed: gov >= 2, mature: false
    };

    // Reife = Fundament (Prozesse, Daten, Plattform) + Bereitschaft (KI-Nutzung, Regeln, Führung), je 0–9 Punkte
    var F = proz + daten + sys, B = kiR + gov + fuehrung, Rsum = F + B;
    var reife = round5(Rsum / 18), fundament = round5(F / 9), bereitschaft = round5(B / 9);
    var stage = Rsum <= 5 ? 1 : Rsum <= 10 ? 2 : Rsum <= 14 ? 3 : 4;
    ctx.mature = stage >= 3 && ctx.governed;

    // Hebel je Bereich (0 = gering … 3 = hoch); 'n' = trifft nicht zu
    var P = {};
    ['Vertrieb', 'Verwaltung', 'Kundenservice', 'Wissen', 'Steuerung'].forEach(function (k, i) {
      var v = a['q' + (i + 4)];
      P[k] = v === 'n' ? null : n(v);
    });
    // Mitarbeitende: aus KI-Nutzung, Regeln und Führung abgeleitet
    P.Mitarbeiter = ki === 'a' ? (gov >= 2 ? 0 : 1) : ki === 'b' ? (gov <= 1 ? 3 : 2) : ki === 'c' ? 3 : (fuehrung >= 2 ? 2 : 1);

    function reco(k, p) {
      if (p === null) return null;
      var r = Rx[k];
      if (k === 'Mitarbeiter') {
        if (ki === 'a') return p === 0 ? r.ausbauen : r.vertiefen;
        if (ki === 'b') return r.regeln;
        if (ki === 'c') return ctx.m365 ? r.copilot : r.vertiefen;
        return r.start;
      }
      if (p === 0) return Rx.halten(k);
      switch (k) {
        case 'Vertrieb':
          if (p === 1) return ctx.m365 ? r.copilot : r.vorlagen;
          return ctx.procReady && ctx.dataReady ? r.automation : r.process;
        case 'Verwaltung':
          if (p === 1) return ctx.dataReady ? r.teil : r.process;
          return ctx.dataReady ? r.automation : r.process;
        case 'Kundenservice':
          if (p === 1) return ctx.m365 ? r.copilot : r.vorlagen;
          if (!ctx.procReady) return r.process;
          return ctx.mature && ctx.dataReady ? r.agent : r.automation;
        case 'Wissen':
          if (p === 1) return ctx.m365Strong ? r.copilot : ctx.m365 ? r.ablage : r.process;
          // KI-Suche braucht dokumentiertes Wissen: ohne beschriebene Abläufe zuerst sichern
          if (ctx.m365Strong && ctx.dataReady && ctx.procReady) return r.wissen;
          return ctx.m365 && ctx.procReady ? r.ablage : r.process;
        case 'Steuerung':
          if (p === 1) return ctx.m365 ? r.copilot : r.vorlagen;
          return ctx.dataReady ? r.automation : r.process;
      }
    }

    var areas = AREAS.map(function (k, i) {
      var p = P[k], rc = reco(k, p), f = fokus.indexOf(k) >= 0;
      return {
        key: k, name: LB[k], slug: SLUG[k], p: p, applicable: p !== null, fokus: f,
        pct: p === null ? null : round5(p / 3), level: p === null ? L('trifft nicht zu', 'not applicable') : p >= 2 ? L('hoch', 'high') : p === 1 ? L('mittel', 'medium') : L('gering', 'low'),
        reco: rc ? { type: rc[0], typeLabel: TY[rc[0]], title: rc[1], approach: rc[2], measure: rc[3], route: rc[4][0], offer: rc[4][1] } : null,
        // Gewicht: Hebel, eigene Einschätzung (Fokus), umsetzbar ohne Vorarbeit; bei Gleichstand gilt die Reihenfolge der Bereiche
        w: p === null ? -1 : p + (f ? 0.5 : 0) + (rc && rc[0] !== 'process' ? 0.25 : 0) - i * 0.001
      };
    });
    var app = areas.filter(function (x) { return x.applicable; });
    var psum = app.reduce(function (s, x) { return s + x.p; }, 0);
    var hebel = app.length ? round5(psum / (app.length * 3)) : 0;
    var strong = app.filter(function (x) { return x.p >= 2; }).length;
    var hoch = hebel >= 50 || strong >= 3;
    var reifeHoch = reife >= 55;

    var prios = areas.filter(function (x) { return x.applicable && x.p >= 1; }).sort(function (x, y) { return y.w - x.w; }).slice(0, 3);
    var p1 = prios[0];

    // Gesamturteil (Hebel × Reife)
    var verdict, sub, first;
    var p1t = p1 ? L('„', '"') + p1.reco.title + L('“', '"') + ' (' + p1.name + ')' : '';
    if (hoch && reifeHoch) {
      verdict = L('Hohes Potenzial – Sie können gezielt umsetzen.', 'High potential – you can implement purposefully.');
      sub = L('Zeit geht an mehreren Stellen verloren, und Ihr Fundament trägt bereits. Der schnellste Weg zu messbarer Wirkung ist ein begrenzter Pilot in Ihrer Priorität 1.', 'Time is lost in several places, and your foundation already holds. The fastest way to measurable impact is a limited pilot in your priority 1.');
      first = p1 && p1.reco.type !== 'process'
        ? { title: 'Pilot: ' + p1.reco.title, text: L('Ein Anwendungsfall im Bereich ' + p1.name + ', klar abgegrenzt, mit Schlüsselanwendern und menschlicher Freigabe. Wir messen vorher und nachher: ', 'One use case in ' + p1.name + ', clearly scoped, with key users and human approval. We measure before and after: ') + p1.reco.measure + '.', route: 'pilot', label: L('KI & Automation Pilot ansehen', 'View the AI & Automation Pilot') }
        : { title: L('Transformationsanalyse mit Pilotplanung', 'Transformation analysis with pilot planning'), text: L('Den Ablauf ' + p1t + ' schärfen, Daten klären und den Pilot mit Messgrößen planen.', 'Sharpen the workflow ' + p1t + ', clarify data and plan the pilot with metrics.'), route: 'analyse', label: L('KI-Transformationsanalyse ansehen', 'View the AI Transformation Analysis') };
    } else if (hoch) {
      verdict = L('Hohes Potenzial – das Fundament entscheidet über die Reihenfolge.', 'High potential – the foundation determines the order.');
      sub = L('Zeit geht an mehreren Stellen verloren. Prozesse, Daten oder Regeln sind aber noch nicht stabil genug, um sofort zu automatisieren. Die richtige Reihenfolge spart mehr als das schnellste Werkzeug.', 'Time is lost in several places. But processes, data or rules are not yet stable enough to automate right away. The right order saves more than the fastest tool.');
      first = { title: L('KI-Transformationsanalyse mit Fokus auf das Fundament', 'AI Transformation Analysis focused on the foundation'), text: L('Kernprozesse erfassen, führende Datenquellen festlegen, Regeln klären – und daraus einen Umsetzungsplan mit Wirtschaftlichkeit ableiten', 'Capture core processes, define leading data sources, clarify rules – and derive an implementation plan with a cost-benefit calculation') + (p1 ? L(', beginnend mit ', ', starting with ') + p1t : '') + '.', route: 'analyse', label: L('KI-Transformationsanalyse ansehen', 'View the AI Transformation Analysis') };
    } else if (reifeHoch) {
      verdict = L('Solide Basis – jetzt gezielt verfeinern.', 'Solid basis – now refine purposefully.');
      sub = L('Die großen Zeitfresser sind weitgehend im Griff. Wirkung entsteht nun durch gezielte Anwendungsfälle, bessere Nutzung vorhandener Werkzeuge und laufende Verbesserung.', 'The big time wasters are largely under control. Impact now comes from targeted use cases, better use of existing tools and continuous improvement.');
      first = { title: p1 ? L('Gezielter Anwendungsfall: ', 'Targeted use case: ') + p1.reco.title : L('Laufende Begleitung', 'Ongoing support'), text: L('Nächste Anwendungsfälle je Abteilung, Regeln und Verankerung im Alltag – mit einer verantwortlichen Ansprechperson.', 'Next use cases per department, rules and embedding in daily work – with one accountable contact person.'), route: 'begleitung', label: L('KI-Begleitung ansehen', 'View the AI Partnership') };
    } else {
      verdict = L('Selektives Potenzial – Grundlagen zuerst, ohne große Investition.', 'Selective potential – basics first, without a big investment.');
      sub = L('Der Druck ist insgesamt moderat, das Fundament noch im Aufbau. Sinnvoll ist ein bewusster Einstieg: Regeln festlegen, Mitarbeitende befähigen, Ablagen ordnen – und den einen Ablauf mit klarem Hebel angehen.', 'The pressure is moderate overall and the foundation is still being built. A deliberate start makes sense: set rules, enable employees, tidy up storage – and tackle the one workflow with a clear lever.');
      first = { title: L('KI-Richtlinie und Grundlagenschulung, dann ein Ablauf', 'AI policy and basic training, then one workflow'), text: L('Regeln für Werkzeuge und Daten, praxisnahe Schulung für das Team, danach die Entscheidung über den ersten Anwendungsfall', 'Rules for tools and data, practical training for the team, then the decision on the first use case') + (p1 ? L(' – naheliegend: ', ' – an obvious candidate: ') + p1t : '') + '.', route: 'academy-unternehmen', label: L('Academy für Unternehmen ansehen', 'View the Academy for companies') };
    }
    // Private Konten mit möglichen Kundendaten: Regeln gehen allem vor
    var urgent = gov === 0;
    if (gov === 0) {
      first = { title: L('Sofort KI-Regeln festlegen, danach: ', 'Set AI rules immediately, then: ') + first.title, text: L('Erlaubte Werkzeuge, erlaubte Daten und Freigaben in einer kurzen Richtlinie festhalten und das Team einweisen. ', 'Record permitted tools, permitted data and approvals in a short policy and brief the team. ') + first.text, route: 'enablement', label: L('KI-Befähigung & Regeln ansehen', 'View AI Enablement & Rules') };
    }

    // Hinweise und Risiken
    var risks = [];
    if (gov === 0) risks.push({ kind: 'hoch', title: L('Datenschutz: private Konten', 'Data protection: private accounts'), text: L('KI-Werkzeuge werden ohne Regeln, teils über private Konten genutzt. Kundendaten und Betriebsgeheimnisse könnten so das Unternehmen verlassen. Eine kurze Richtlinie zu erlaubten Werkzeugen und Daten sollte vor jedem weiteren Schritt stehen.', 'AI tools are used without rules, partly via private accounts. Customer data and trade secrets could leave the company this way. A short policy on permitted tools and data should come before any further step.'), route: 'enablement' });
    if ((ki === 'b' || ki === 'c') || (ki === 'a' && gov <= 1)) risks.push({ kind: 'mittel', title: L('KI-Kompetenz nach EU-KI-Verordnung', 'AI literacy under the EU AI Act'), text: L('Unternehmen, die KI-Systeme einsetzen, müssen nach Artikel 4 der KI-Verordnung Maßnahmen ergreifen, die den Aufbau von KI-Kompetenz ihrer Mitarbeitenden unterstützen (seit 27. Juli 2026 in geänderter Fassung). Schulung und Regeln sollten nachvollziehbar dokumentiert sein. (Hinweis, keine Rechtsberatung.)', 'Under Article 4 of the AI Act, companies that use AI systems must take measures that support the development of their employees\' AI literacy (amended version since 27 July 2026). Training and rules should be documented traceably. (Note, not legal advice.)'), route: 'ai-act' });
    if (ki === 'c') risks.push({ kind: 'mittel', title: L('Bezahlte Lizenzen ungenutzt', 'Paid licences unused'), text: L('Vorhandene KI-Lizenzen entfalten erst mit konkreten Anwendungsfällen, Regeln und Schulung Wirkung. Bis dahin entstehen Kosten ohne Nutzen.', 'Existing AI licences only have an effect with concrete use cases, rules and training. Until then, they cost money without benefit.'), route: 'copilot-einfuehrung' });
    if (fuehrung <= 1) risks.push({ kind: 'mittel', title: L('Führung und Verantwortung', 'Leadership and accountability'), text: L('Ohne Zielbild und verantwortliche Person versanden KI-Vorhaben im Alltag. Ein kurzes Gespräch zur Erwartung der Geschäftsführung lohnt sich vor jeder Investition.', 'Without a target picture and a responsible person, AI initiatives fizzle out in daily business. A short conversation about management\'s expectations is worthwhile before any investment.'), route: 'booking' });
    if (hoch && (proz <= 1 || daten <= 1)) risks.push({ kind: 'mittel', title: L('Fundament vor Werkzeug', 'Foundation before tools'), text: (proz <= 1 ? L('Abläufe hängen an Personen', 'Workflows depend on people') : L('Daten liegen verstreut', 'Data is scattered')) + L('. Wer hier direkt automatisiert, automatisiert die Unordnung mit. Erst den einen Ablauf und seine Datenquelle klären, dann umsetzen.', '. Automating directly here means automating the disorder too. First clarify the one workflow and its data source, then implement.'), route: 'analyse' });
    var fokusMiss = fokus.filter(function (k) { return !prios.some(function (x) { return x.key === k; }); });
    if (fokus.length && fokusMiss.length) risks.push(LANG === 'en'
      ? { kind: 'info', title: 'Your assessment compared', text: 'You see levers in "' + fokusMiss.map(function (k) { return LB[k]; }).join('", "') + '". Your answers show ' + (prios.length ? 'the biggest levers in "' + prios.map(function (x) { return x.name; }).join('", "') + '"' : 'no urgent lever there') + '. This is exactly what we clarify in the intro call – the time loss is often somewhere other than expected.', route: 'booking' }
      : { kind: 'info', title: 'Ihre Einschätzung im Abgleich', text: 'Sie sehen Hebel in „' + fokusMiss.map(function (k) { return LB[k]; }).join('“, „') + '“. Ihre Antworten zeigen ' + (prios.length ? 'die größten Hebel in „' + prios.map(function (x) { return x.name; }).join('“, „') + '“' : 'dort keinen dringenden Hebel') + '. Genau diesen Abgleich klären wir im Erstgespräch – oft steckt der Zeitverlust an einer anderen Stelle als vermutet.', route: 'booking' });

    // Stärken
    var strengths = [];
    DIMS.forEach(function (d) { var s = d.key === 'ki' ? kiR : n(a[d.key]); if (s === 3) strengths.push(L(d.name, DIMS_EN[d.key].name)); });
    app.forEach(function (x) { if (x.p === 0 && x.key !== 'Mitarbeiter') strengths.push(x.name + L(' läuft effizient', ' runs efficiently')); });

    // Fahrplan (Vorschlag in drei Phasen)
    var ph1 = [], ph2 = [], ph3 = [];
    // Regeln und Schulung für Mitarbeitende gehören in Phase 1 – sie sind kein Pilot und erscheinen nicht doppelt
    var inPh1 = function (x) { return x.key === 'Mitarbeiter' && (x.reco.type === 'regeln' || x.reco.type === 'enable') && (gov <= 1 || ki !== 'a'); };
    var pilot = prios.filter(function (x) { return !inPh1(x); })[0];
    if (gov <= 1) ph1.push(L('KI-Richtlinie festlegen: erlaubte Werkzeuge, Daten, Freigaben', 'Set an AI policy: permitted tools, data, approvals'));
    if (ki === 'b' || ki === 'c' || ki === 'd' || prios.some(inPh1)) ph1.push(L('Grundlagenschulung für das Team, je Rolle (KI-Kompetenz dokumentieren)', 'Basic training for the team, per role (document AI literacy)'));
    if (fuehrung <= 2) ph1.push(L('Zielbild und verantwortliche Person in der Geschäftsführung festlegen', 'Define the target picture and a responsible person in management'));
    if (pilot) ph1.push(L('Ausgangswerte für ', 'Capture baselines for ') + pilot.name + L(' erfassen: ', ': ') + pilot.reco.measure);
    if (!ctx.dataReady && pilot) ph1.push(L('Führende Datenquelle für den ersten Ablauf festlegen', 'Define the leading data source for the first workflow'));
    if (pilot) {
      ph2.push((pilot.reco.type === 'process' ? L('Ablauf neu aufsetzen: ', 'Redesign the workflow: ') : L('Pilot umsetzen: ', 'Implement the pilot: ')) + pilot.reco.title + ' (' + pilot.name + ')');
      ph2.push(L('Schlüsselanwender schulen, menschliche Freigabe festlegen', 'Train key users, define human approval'));
      ph2.push(L('Wirkung messen und über die Ausweitung entscheiden', 'Measure impact and decide on expansion'));
    } else if (prios.length) {
      ph2.push(L('Ersten Anwendungsfall im Alltag auswählen und als kleinen Pilot umsetzen', 'Choose a first everyday use case and implement it as a small pilot'));
      ph2.push(L('Wirkung messen und über die Ausweitung entscheiden', 'Measure impact and decide on expansion'));
    }
    prios.forEach(function (x) { if (x !== pilot && !inPh1(x)) ph3.push(L('Nächster Bereich: ', 'Next area: ') + x.reco.title + ' (' + x.name + ')'); });
    ph3.push(L('Nutzen und Kosten laufend im Blick behalten, weitere Abläufe priorisieren', 'Keep an eye on benefits and costs, prioritise further workflows'));
    if (!ph2.length) ph2.push(L('Gezielte Verbesserungen in den Bereichen mit dem größten Nutzen', 'Targeted improvements in the areas with the greatest benefit'));
    var roadmap = [
      { phase: 'Phase 1', title: L('Klären und absichern', 'Clarify and secure'), items: ph1.length ? ph1 : [L('Ergebnis im Erstgespräch prüfen und Prioritäten bestätigen', 'Review the result in the intro call and confirm priorities')] },
      { phase: 'Phase 2', title: L('Ersten Ablauf umsetzen', 'Implement the first workflow'), items: ph2 },
      { phase: 'Phase 3', title: L('Ausweiten, was wirkt', 'Expand what works'), items: ph3 }
    ];

    var dims = DIMS.map(function (d) {
      // KI-Nutzung: Punktwert für die Reife ist kiR; die Einordnung unterscheidet zusätzlich „Lizenzen ungenutzt“ (Text 2)
      var score = d.key === 'ki' ? kiR : n(a[d.key]);
      var ti = d.key === 'ki' ? { a: 3, b: 1, c: 2, d: 0 }[ki] : score;
      var de = LANG === 'en' ? DIMS_EN[d.key] : d;
      return { key: d.key, name: de.name, group: de.group, score: score, pct: round5(score / 3), text: de.text[ti] };
    });

    var summary = L('KI-Reife ', 'AI maturity ') + reife + ' % (' + ST[stage] + L('), Hebel ', '), lever ') + hebel + ' %. ' + verdict + L(' Prioritäten: ', ' Priorities: ') +
      (prios.length ? prios.map(function (x, i) { return (i + 1) + '. ' + x.name + ' – ' + x.reco.title; }).join('; ') : L('keine dringenden', 'none urgent')) + L('. Nächster Schritt: ', '. Next step: ') + first.title + '.';

    return {
      reife: reife, fundament: fundament, bereitschaft: bereitschaft, hebel: hebel, stage: stage, stageName: ST[stage],
      hoch: hoch, reifeHoch: reifeHoch, urgent: urgent, ctx: ctx,
      dims: dims, areas: areas, prios: prios, verdict: verdict, sub: sub, first: first,
      risks: risks, strengths: strengths, roadmap: roadmap, fokus: fokus, summary: summary
    };
  }

  // Antworten ⇄ Kurzcode für den Teilen-Link (keine personenbezogenen Daten)
  var KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'];
  function encode(a) {
    var s = KEYS.map(function (k) { return a[k] == null || a[k] === '' ? '-' : String(a[k]); }).join('');
    var mask = 0; AREAS.forEach(function (x, i) { if ((a.q12 || []).indexOf(x) >= 0) mask |= (1 << i); });
    return s + mask.toString(36);
  }
  function decode(code) {
    if (!/^[0-3][0-3][0-3][0-3n][0-3n][0-3n][0-3n][0-3n][a-d][0-3][0-3][0-9a-z]{1,2}$/.test(code || '')) return null;
    var a = {}; KEYS.forEach(function (k, i) { a[k] = code[i]; });
    var mask = parseInt(code.slice(11), 36) || 0;
    a.q12 = AREAS.filter(function (x, i) { return mask & (1 << i); });
    return a;
  }

  return { evaluate: evaluate, encode: encode, decode: decode, AREAS: AREAS, LABEL: LABEL, LABEL_EN: LABEL_EN, SLUG: SLUG, DIMS: DIMS };
});
