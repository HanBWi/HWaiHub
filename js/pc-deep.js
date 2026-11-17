/* HWaiHub – KI-Potenzialcheck: Vertiefung („Ist-Analyse“) für die Bereiche mit dem größten Hebel.
   Ergänzt pc-engine.js (die 12 Fragen und ihre Auswertung bleiben unverändert). Rein, ohne DOM – Test: scripts/test-pc-deep.mjs
   Ablauf: Nach den 12 Fragen folgen immer vier Vertiefungsfragen (13–16) zum Bereich mit dem größten Hebel:
   Menge, Aufwand, Engstelle und Ausfallrisiko. Der Check hat damit durchgehend 16 Fragen.
   Zeitangaben sind ausschließlich Hochrechnungen aus den Angaben des Kunden (Mittelwerte der gewählten Spannen) –
   keine Einsparversprechen, keine Preise. Vorschläge berücksichtigen die Voraussetzungen aus den 12 Fragen. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HWPCD = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var ORDER = ['vertrieb', 'verwaltung', 'kundenservice', 'wissen', 'steuerung', 'mitarbeiter'];
  var DEP_STD = ['Die Vertretung übernimmt ohne Probleme', 'Es dauert deutlich länger', 'Es bleibt liegen'];

  // Je Bereich: der Ablauf in fünf Schritten. Je Schritt: was wir dahinter meist finden (diag), was sofort geht (sofort,
  // sofortM = Variante mit Microsoft 365), wie der Schritt danach läuft (ziel) und welche Voraussetzung er braucht (need).
  var AREAS = {
    vertrieb: {
      name: 'Vertrieb', process: 'Von der Anfrage zum Angebot', title: 'Wie bei Ihnen aus einer Anfrage ein Angebot wird', quote: 'Angebote dauern zu lange.',
      vol: { q: 'Wie viele Angebote oder Kostenvoranschläge schreiben Sie im Monat?', unit: 'Angebote', opts: [['bis 10', 5], ['11 bis 30', 20], ['31 bis 100', 60], ['mehr als 100', 130]] },
      eff: { q: 'Wie viel Arbeitszeit steckt in einem typischen Angebot – alle Beteiligten zusammen?', opts: [['unter 30 Minuten', 0.4], ['30 bis 60 Minuten', 0.75], ['1 bis 3 Stunden', 2], ['mehr als 3 Stunden', 4]] },
      dep: { q: 'Was passiert, wenn die Person ausfällt, die Angebote normalerweise schreibt?', opts: DEP_STD },
      rest: 'Anfragen, Angebote, Nachfassen',
      steps: [
        { id: 'klaeren', label: 'Anfrage lesen, Angaben klären', sub: 'Was will der Kunde genau, und was fehlt noch?', diag: 'Anfragen kommen über mehrere Kanäle und unvollständig an. Bevor jemand kalkulieren kann, wird nachgefragt – und jede Rückfrage kostet Zeit.', sofort: 'Eine feste Liste der Angaben, ohne die kein Angebot beginnt – als Formular oder Checkliste.', sofortM: 'Copilot in Outlook fasst lange Anfragen zusammen und listet fehlende Angaben auf.', ziel: 'Eingehende Anfragen werden ausgelesen, fehlende Angaben nachgefragt, der Vorgang liegt vorbereitet bereit.', need: null },
        { id: 'daten', label: 'Preise und Kundendaten zusammensuchen', sub: 'Preisliste, frühere Angebote, Verfügbarkeit', diag: 'Preise, Kundenhistorie und Verfügbarkeiten liegen an verschiedenen Orten. Die eigentliche Arbeit ist das Suchen, nicht das Anbieten.', sofort: 'Eine gültige Preisliste und ein Ort für Kundendaten – verbindlich für alle.', ziel: 'Die Daten zum Kunden und zu den Positionen werden automatisch zusammengeführt und dem Angebot beigelegt.', need: 'data' },
        { id: 'kalkulieren', label: 'Kalkulieren', sub: 'Aufwand, Material, Zuschläge, Marge', diag: 'Kalkuliert wird aus Erfahrung und mit alten Werten. Das hängt an wenigen Personen und lässt sich schwer vertreten.', sofort: 'Ein Kalkulationsschema mit festen Bausteinen und Zuschlägen, das auch die Vertretung nutzen kann.', ziel: 'Die Kalkulation wird aus Positionen und Erfahrungswerten vorgeschlagen; ein Mensch prüft Preis und Marge.', need: 'proc' },
        { id: 'schreiben', label: 'Angebot schreiben und freigeben', sub: 'Text und Positionen zusammenstellen, intern abstimmen', diag: 'Jedes Angebot wird neu formuliert, Freigaben laufen per Zuruf. Gute Texte gibt es – sie stecken in alten Angeboten.', sofort: 'Eine Angebotsvorlage mit geprüften Textbausteinen und eine klare Freigabegrenze.', sofortM: 'Copilot in Word erstellt den Entwurf aus Vorlage und Stichpunkten; freigegeben wird durch einen Menschen.', ziel: 'Der Angebotsentwurf entsteht aus Anfrage, Vorlage und Preisliste. Kein Angebot geht ohne menschliche Freigabe hinaus.', need: 'proc' },
        { id: 'nachfassen', label: 'Nachfassen', sub: 'Beim Kunden nachfragen, bis eine Entscheidung fällt', diag: 'Nach dem Versand kümmert sich niemand planmäßig. Aufträge gehen dann nicht am Preis verloren, sondern weil niemand nachfragt.', sofort: 'Ein fester Nachfass-Termin je Angebot mit klarer Zuständigkeit.', ziel: 'Erinnerungen und CRM-Einträge laufen automatisch mit; der Entwurf für die Nachfass-Mail liegt bereit.', need: null }
      ]
    },
    verwaltung: {
      name: 'Verwaltung', process: 'Vom Beleg zur Buchung', title: 'Wie bei Ihnen ein Beleg bearbeitet wird', quote: 'Wir kopieren Daten zwischen fünf Systemen.',
      vol: { q: 'Wie viele Belege – Eingangsrechnungen, Lieferscheine, Aufträge – bearbeiten Sie im Monat?', unit: 'Belege', opts: [['bis 50', 30], ['51 bis 200', 120], ['201 bis 500', 350], ['mehr als 500', 700]] },
      eff: { q: 'Wie viel Arbeitszeit steckt in einem Beleg – vom Eingang bis zur Ablage?', opts: [['unter 3 Minuten', 0.04], ['3 bis 10 Minuten', 0.1], ['10 bis 20 Minuten', 0.25], ['mehr als 20 Minuten', 0.5]] },
      dep: { q: 'Was passiert, wenn die Person ausfällt, die Belege normalerweise bearbeitet?', opts: DEP_STD },
      rest: 'Belege, Dateneingabe, Rechnungen',
      steps: [
        { id: 'eingang', label: 'Eingang und Sortieren', sub: 'Post, E-Mail und Portale durchsehen, Belege zuordnen', diag: 'Belege kommen per Post, E-Mail und Portal. Jemand sortiert, benennt und leitet weiter – jeden Tag.', sofort: 'Ein zentrales Eingangspostfach und eine feste Benennung.', ziel: 'Belege werden beim Eingang erkannt, benannt und dem richtigen Vorgang zugeordnet.', need: null },
        { id: 'erfassen', label: 'Daten erfassen', sub: 'Beträge, Daten und Positionen ins System eingeben', diag: 'Werte werden aus PDFs abgetippt. Das ist die teuerste und zugleich die fehleranfälligste Form der Datenerfassung.', sofort: 'Prüfen, welche Belegarten Ihre Buchhaltungssoftware schon auslesen kann – oft ist die Funktion vorhanden, aber nicht eingerichtet.', ziel: 'Belegdaten werden ausgelesen, die Kontierung wird vorgeschlagen, nur Ausnahmen prüft ein Mensch.', need: 'data' },
        { id: 'uebertragen', label: 'In weitere Systeme übertragen', sub: 'Dieselben Angaben in ERP, Buchhaltung oder Listen eintragen', diag: 'Dieselben Daten werden in zwei oder drei Systeme eingetragen, weil die Systeme nicht verbunden sind. Excel überbrückt, was fehlt.', sofort: 'Festlegen, welches System je Belegart führt – alle anderen übernehmen nur.', ziel: 'Die Systeme tauschen die Daten automatisch aus; die doppelte Erfassung entfällt.', need: 'data' },
        { id: 'freigeben', label: 'Prüfen und freigeben', sub: 'Sachlich prüfen, zur Zahlung oder Buchung freigeben', diag: 'Freigaben laufen per Zuruf oder Umlaufmappe. Belege liegen, weil jemand nicht da ist, und Zahlungsfristen geraten unter Druck.', sofort: 'Freigabegrenzen und Vertretung schriftlich festlegen.', ziel: 'Freigaben laufen digital mit Erinnerung und Vertretungsregel; Beträge über einer Grenze prüft immer ein Mensch.', need: 'proc' },
        { id: 'ablegen', label: 'Ablegen und wiederfinden', sub: 'Speichern, benennen, später wiederfinden', diag: 'Abgelegt wird nach persönlichem System. Wiederfinden gelingt nur der Person, die abgelegt hat.', sofort: 'Eine Ablagestruktur und eine Benennungsregel für alle.', ziel: 'Dokumente werden klassifiziert und automatisch am richtigen Ort abgelegt.', need: null }
      ]
    },
    kundenservice: {
      name: 'Kundenservice', process: 'Von der Kundenfrage zur Antwort', title: 'Wie bei Ihnen eine Kundenanfrage beantwortet wird', quote: 'Jeden Morgen zwei Stunden Anfragen sortieren.',
      vol: { q: 'Wie viele Kundenanfragen – E-Mail, Telefon, Formular – kommen pro Woche an?', unit: 'Anfragen', opts: [['bis 25 pro Woche', 60], ['26 bis 100 pro Woche', 250], ['101 bis 300 pro Woche', 800], ['mehr als 300 pro Woche', 1600]] },
      eff: { q: 'Wie viel Arbeitszeit steckt in einer typischen Anfrage, bis sie beantwortet ist?', opts: [['unter 5 Minuten', 0.05], ['5 bis 15 Minuten', 0.17], ['15 bis 30 Minuten', 0.37], ['mehr als 30 Minuten', 0.75]] },
      dep: { q: 'Was passiert mit Anfragen, wenn die zuständige Person nicht da ist?', opts: ['Die Vertretung antwortet wie gewohnt', 'Antworten dauern deutlich länger', 'Anfragen bleiben liegen'] },
      rest: 'Anfragen, Antworten, Reklamationen',
      steps: [
        { id: 'eingang', label: 'Eingang über mehrere Kanäle', sub: 'Telefon, E-Mail, Formular, persönliche Postfächer', diag: 'Anfragen kommen über Telefon, persönliche Postfächer und Formulare. Niemand sieht alles – deshalb fällt etwas durch.', sofort: 'Ein gemeinsames Postfach als einziger Eingang, mit sichtbarem Bearbeitungsstand.', ziel: 'Alle Eingänge laufen an einer Stelle zusammen und werden mit Bearbeitungsstand geführt.', need: null },
        { id: 'zuordnen', label: 'Lesen, einordnen, weiterleiten', sub: 'Worum geht es, und wer ist zuständig?', diag: 'Jeden Morgen liest jemand alles und verteilt von Hand. Diese Zeit bringt keinem Kunden etwas.', sofort: 'Wenige feste Themen mit je einer zuständigen Person.', ziel: 'Anfragen werden nach Thema und Dringlichkeit vorsortiert und der zuständigen Person zugewiesen.', need: 'proc' },
        { id: 'info', label: 'Informationen für die Antwort suchen', sub: 'Auftragsstand, Termin oder zuständige Person herausfinden', diag: 'Die Antwort steht im ERP, im Auftrag oder im Kopf einer Kollegin. Der Kundenservice fragt intern nach und wartet.', sofort: 'Die häufigsten Fragen mit geprüften Antworten an einem Ort sammeln.', ziel: 'Auftragsstand und Termin werden aus dem System zur Anfrage dazugelegt.', need: 'data' },
        { id: 'antworten', label: 'Antwort schreiben', sub: 'Formulieren, prüfen, senden', diag: 'Dieselben Antworten werden jeden Tag neu formuliert – je nach Person in anderer Qualität.', sofort: 'Geprüfte Antwortbausteine für die Standardfälle.', sofortM: 'Copilot in Outlook entwirft die Antwort aus Verlauf und Bausteinen; ein Mensch sendet.', ziel: 'Für Standardfälle liegt der Antwortentwurf bereit; kritische Antworten gehen nie ungeprüft hinaus.', need: null },
        { id: 'nachhalten', label: 'Nachhalten und eskalieren', sub: 'Offene Fälle im Blick behalten, bei Verzögerung reagieren', diag: 'Offene Fälle hat niemand im Blick. Der Kunde fragt nach – und aus einer Frage wird eine Beschwerde.', sofort: 'Eine Liste offener Fälle mit Frist, einmal täglich geprüft.', ziel: 'Offene Fälle werden automatisch erinnert und nach klaren Regeln eskaliert.', need: 'proc' }
      ]
    },
    wissen: {
      name: 'Wissen', process: 'Von der Frage zur verlässlichen Information', title: 'Wie Ihre Mitarbeitenden an eine Information kommen', quote: 'Wir suchen ständig Informationen aus PDFs und E-Mails.',
      vol: { q: 'Wie viele Mitarbeitende suchen täglich nach internen Informationen – Preise, Abläufe, frühere Entscheidungen?', unit: 'Personen', perDay: true, opts: [['bis 5', 3], ['6 bis 20', 12], ['21 bis 50', 35], ['mehr als 50', 80]] },
      eff: { q: 'Wie viel Zeit geht dabei pro Person und Tag verloren?', opts: [['unter 10 Minuten', 0.1], ['10 bis 30 Minuten', 0.33], ['30 bis 60 Minuten', 0.75], ['mehr als 1 Stunde', 1.25]] },
      dep: { q: 'Was passiert, wenn eine erfahrene Person länger ausfällt?', opts: ['Das Wissen ist dokumentiert, die Arbeit läuft weiter', 'Es geht langsamer, vieles muss erfragt werden', 'Bestimmte Aufgaben stehen still'] },
      rest: 'Suche, Einarbeitung, Abhängigkeit von Einzelnen',
      steps: [
        { id: 'wo', label: 'Überlegen, wo die Information stehen könnte', sub: 'Ordner, Laufwerk, E-Mail – oder weiß es jemand?', diag: 'Es gibt viele Ablageorte und keine gemeinsame Ordnung. Wer neu ist, weiß nicht einmal, wo er anfangen soll.', sofort: 'Eine Ablagestruktur festlegen und die wichtigsten Ablageorte benennen.', ziel: 'Eine Frage in Alltagssprache genügt – gesucht wird in allen freigegebenen Ablagen.', need: null },
        { id: 'suchen', label: 'In Ordnern und E-Mails suchen', sub: 'Dateien öffnen, Verläufe durchblättern', diag: 'Dokumente sind uneinheitlich benannt. Die Suche findet zu viel oder nichts, also wird geblättert.', sofort: 'Benennungsregeln festlegen und die meistgenutzten Ordner aufräumen.', sofortM: 'Copilot durchsucht SharePoint und Teams – vorher die Berechtigungen prüfen, sonst findet er auch, was nicht jeder sehen soll.', ziel: 'Die KI-Suche liefert die Antwort mit Quellenangabe und zeigt nur, was die fragende Person sehen darf.', need: 'data' },
        { id: 'fragen', label: 'Eine Kollegin oder einen Kollegen fragen', sub: 'Wenn die Suche nichts ergibt', diag: 'Die schnellste Suche ist die Frage an die erfahrene Kollegin. Sie wird damit zum Engpass – und ihr Wissen steht nirgends.', sofort: 'Die häufigsten Fragen an die Wissensträger sammeln und die Antworten einmal aufschreiben.', ziel: 'Wiederkehrende Fragen beantwortet eine Wissenssammlung; die Fachperson bestätigt nur noch Sonderfälle.', need: 'proc' },
        { id: 'gueltig', label: 'Prüfen, ob die gefundene Fassung noch gilt', sub: 'Ist das die aktuelle Preisliste, die gültige Anweisung?', diag: 'Es gibt mehrere Fassungen derselben Unterlage. Niemand weiß sicher, welche gilt – also wird nachgefragt oder falsch gearbeitet.', sofort: 'Je Dokumentart eine verantwortliche Person und ein Gültigkeitsdatum.', ziel: 'Es gibt eine gültige Fassung je Unterlage; veraltete Dokumente werden gekennzeichnet.', need: 'proc' },
        { id: 'festhalten', label: 'Die Antwort für das nächste Mal festhalten', sub: 'Damit die nächste Person nicht von vorn sucht', diag: 'Die gefundene Antwort bleibt im Kopf oder in einer E-Mail. Die nächste Person – oft eine neue Kollegin oder ein neuer Kollege – sucht dieselbe Information von vorn.', sofort: 'Häufige Fragen und ihre Antworten an einem festen Ort sammeln – auch als Grundlage für die Einarbeitung.', ziel: 'Antworten werden mit Quelle festgehalten. Neue Mitarbeitende fragen einen Assistenten, der aus den freigegebenen Unterlagen antwortet.', need: null }
      ]
    },
    steuerung: {
      name: 'Steuerung', process: 'Von den Zahlen zur Entscheidung', title: 'Wie bei Ihnen aus Zahlen ein Bericht und eine Entscheidung wird', quote: 'Die Zahlen sind da – nur nicht aufbereitet.',
      vol: { q: 'Wie oft erstellen Sie Berichte oder Auswertungen, mit denen Sie das Unternehmen steuern?', unit: 'Berichte', opts: [['einmal im Monat', 1], ['zwei- bis viermal im Monat', 3], ['mehrmals pro Woche', 10], ['täglich', 20]] },
      eff: { q: 'Wie viel Arbeitszeit steckt in einem Bericht?', opts: [['unter 1 Stunde', 0.5], ['1 bis 4 Stunden', 2.5], ['etwa ein Arbeitstag', 8], ['mehrere Tage', 16]] },
      dep: { q: 'Was passiert, wenn die Person ausfällt, die die Berichte erstellt?', opts: ['Der Bericht kommt trotzdem pünktlich', 'Er kommt später oder unvollständig', 'Es gibt keinen Bericht'] },
      rest: 'Berichte, Kennzahlen, Entscheidungen',
      steps: [
        { id: 'sammeln', label: 'Zahlen aus den Systemen holen', sub: 'Exporte aus ERP, Buchhaltung, CRM und Excel', diag: 'Die Zahlen liegen in ERP, Buchhaltung, CRM und Excel. Jeder Bericht beginnt mit Exportieren und Kopieren.', sofort: 'Je Kennzahl festlegen, aus welchem System sie kommt.', ziel: 'Die Zahlen laufen automatisch aus den führenden Systemen in ein Kennzahlenbild.', need: 'data' },
        { id: 'abgleichen', label: 'Abgleichen und bereinigen', sub: 'Unstimmigkeiten zwischen den Quellen klären', diag: 'Die Zahlen aus verschiedenen Quellen passen nicht zusammen. Ein Teil der Arbeit ist die Klärung, welche stimmt.', sofort: 'Die Definition der wichtigsten Kennzahlen einmal verbindlich aufschreiben.', ziel: 'Abweichungen zwischen den Quellen werden automatisch markiert statt von Hand gesucht.', need: 'data' },
        { id: 'aufbereiten', label: 'Bericht aufbereiten', sub: 'Tabellen, Grafiken und Kommentar erstellen', diag: 'Der Bericht wird jedes Mal in Excel und PowerPoint neu gebaut. Das Format kostet mehr Zeit als die Aussage.', sofort: 'Eine feste Berichtsvorlage mit wenigen Kennzahlen.', sofortM: 'Copilot in Excel und Word bereitet Auswertung und Kommentar vor.', ziel: 'Der Bericht bereitet sich selbst vor; ein Mensch ergänzt die Bewertung.', need: 'proc' },
        { id: 'entscheiden', label: 'Besprechen und entscheiden', sub: 'Zahlen vorstellen, Maßnahmen beschließen', diag: 'Bis der Bericht vorliegt, sind die Zahlen alt. Entschieden wird dann doch nach Gefühl.', sofort: 'Ein fester Termin und wenige Kennzahlen, nach denen wirklich gesteuert wird.', ziel: 'Aktuelle Zahlen stehen jederzeit bereit; Abweichungen lösen einen Hinweis aus.', need: null },
        { id: 'nachhalten', label: 'Beschlüsse nachhalten', sub: 'Prüfen, ob Beschlossenes umgesetzt wurde', diag: 'Besprechungen enden ohne festgehaltene Aufgaben. Beim nächsten Termin wird dasselbe wieder besprochen.', sofort: 'Beschlüsse mit Person und Termin in einer Liste festhalten.', sofortM: 'Besprechungszusammenfassungen in Teams halten Beschlüsse und Aufgaben fest.', ziel: 'Aus der Besprechung werden Aufgaben mit Termin und Erinnerung.', need: null }
      ]
    },
    mitarbeiter: {
      name: 'Mitarbeitende', process: 'Vom Werkzeug zur sicheren Nutzung im Team', title: 'Was Ihr Team braucht, um KI sicher zu nutzen', quote: 'Wir haben Copilot – aber niemand nutzt ihn richtig.',
      people: true, rest: 'Nutzung, Schulung, Regeln',
      vol: { q: 'Wie viele Mitarbeitende arbeiten überwiegend am Bildschirm?', unit: 'Personen', opts: [['bis 5', 3], ['6 bis 20', 12], ['21 bis 50', 35], ['mehr als 50', 80]] },
      steps: [
        { id: 'wofuer', label: 'Wissen, wofür KI im eigenen Alltag taugt', sub: 'Welche meiner Aufgaben kann KI erleichtern?', diag: 'Die Werkzeuge sind bekannt, die Anwendungsfälle nicht. Ohne Beispiele aus der eigenen Arbeit bleibt es beim Ausprobieren.', sofort: 'Je Rolle wenige konkrete Anwendungsfälle aus dem echten Alltag sammeln.', ziel: 'Jede Rolle hat ihre Anwendungsfälle – geschult an eigenen Aufgaben statt an Folien.', need: null },
        { id: 'erlaubt', label: 'Wissen, was erlaubt ist', sub: 'Welche Daten dürfen in welches Werkzeug?', diag: 'Niemand weiß sicher, welche Daten in welches Werkzeug dürfen. Die Vorsichtigen nutzen KI gar nicht, die Mutigen ohne Regeln.', sofort: 'Eine kurze KI-Richtlinie: erlaubte Werkzeuge, erlaubte Daten, wer Ergebnisse prüft.', ziel: 'Klare Regeln, die jede und jeder kennt – mit dokumentierter Schulung.', need: null },
        { id: 'werkzeug', label: 'Das passende Werkzeug haben', sub: 'Ein freigegebenes Werkzeug mit Firmenkonto', diag: 'Lizenzen sind vorhanden, aber nicht dort, wo sie Nutzen stiften – oder es wird auf private Konten ausgewichen.', sofort: 'Festlegen, welches Werkzeug für welche Aufgabe gilt, und private Konten ablösen.', ziel: 'Ein freigegebener Werkzeugsatz für alle, Lizenzen dort, wo sie genutzt werden.', need: null },
        { id: 'pruefen', label: 'Ergebnisse prüfen', sub: 'Wer kontrolliert, bevor etwas hinausgeht?', diag: 'KI-Ergebnisse werden übernommen, ohne dass klar ist, wer sie prüft. Das fällt erst auf, wenn ein Fehler beim Kunden ankommt.', sofort: 'Je Anwendungsfall festlegen, was ein Mensch prüft, bevor etwas hinausgeht.', ziel: 'KI schlägt vor, Menschen geben frei – als fester Teil jedes Ablaufs.', need: null },
        { id: 'gemeinsam', label: 'Gemeinsam statt jeder für sich', sub: 'Gute Beispiele teilen, einheitlich arbeiten', diag: 'Jede Abteilung erfindet eigene Wege. Was bei einem funktioniert, erfährt der Nächste nicht.', sofort: 'Schlüsselanwender benennen und gute Beispiele regelmäßig teilen.', ziel: 'Schlüsselanwender tragen bewährte Anwendungsfälle ins Team; die Nutzung wird sichtbar.', need: null }
      ]
    }
  };

  var TRAIN = { q: 'Wurde Ihr Team bisher im Umgang mit KI geschult?', opts: [['Ja, alle Rollen', 'Mit Dokumentation'], ['Einzelne waren auf Schulungen', 'Ohne gemeinsamen Stand'], ['Nein, bisher nicht', '']] };
  var TOOLS = { q: 'Welche KI-Werkzeuge stehen Ihrem Team offiziell zur Verfügung?', opts: [['Microsoft Copilot', 'Mit Lizenz im Unternehmen'], ['ChatGPT, Claude oder Ähnliches', 'Als Firmenkonto'], ['Nur kostenlose oder private Konten', 'Ohne Freigabe'], ['Keine', 'Bisher nichts bereitgestellt']] };
  // Englische Texte: gleiche Schritte, Werte und Reihenfolge wie oben – nur die Sprache unterscheidet sich.
  var DEP_STD_EN = ["The stand-in takes over without problems", "It takes considerably longer", "It is left undone"];
  var EN = {
    vertrieb: {
      name: "Sales", process: "From enquiry to quote", title: "How an enquiry becomes a quote in your company",
      volQ: "How many quotes or cost estimates do you write per month?", unit: "quotes", unit1: "quote", vol: ["up to 10", "11 to 30", "31 to 100", "more than 100"],
      effQ: "How much working time goes into a typical quote – everyone involved combined?", eff: ["under 30 minutes", "30 to 60 minutes", "1 to 3 hours", "more than 3 hours"],
      depQ: "What happens when the person who normally writes quotes is absent?", dep: DEP_STD_EN,
      steps: [
        ["Read the enquiry, clarify details", "What exactly does the customer want, and what is still missing?", "Enquiries arrive through several channels and incomplete. Before anyone can calculate, questions go back – and every query costs time.", "A fixed list of the details without which no quote is started – as a form or checklist.", "Incoming enquiries are read automatically, missing details are requested, and the case is ready prepared.", "Copilot in Outlook summarises long enquiries and lists missing details."],
        ["Gather prices and customer data", "Price list, earlier quotes, availability", "Prices, customer history and availability sit in different places. The real work is searching, not quoting.", "One valid price list and one place for customer data – binding for everyone.", "Customer and item data are merged automatically and attached to the quote."],
        ["Calculate", "Effort, material, surcharges, margin", "Calculation relies on experience and old figures. It depends on a few people and is hard to cover.", "A calculation scheme with fixed building blocks and surcharges that the stand-in can use too.", "The calculation is proposed from items and empirical values; a person checks price and margin."],
        ["Write and approve the quote", "Compile text and items, coordinate internally", "Every quote is worded from scratch, approvals happen informally. Good texts exist – they are buried in old quotes.", "A quote template with checked text modules and a clear approval threshold.", "The quote draft is created from enquiry, template and price list. No quote goes out without human approval.", "Copilot in Word creates the draft from template and key points; a person approves."],
        ["Follow up", "Ask the customer until a decision is made", "After sending, nobody follows up systematically. Orders are then lost not on price but because nobody asks.", "A fixed follow-up date per quote with clear responsibility.", "Reminders and CRM entries run automatically; the draft for the follow-up email is ready."]
      ]
    },
    verwaltung: {
      name: "Administration", process: "From document to booking", title: "How a document is processed in your company",
      volQ: "How many documents – incoming invoices, delivery notes, orders – do you process per month?", unit: "documents", unit1: "document", vol: ["up to 50", "51 to 200", "201 to 500", "more than 500"],
      effQ: "How much working time goes into one document – from receipt to filing?", eff: ["under 3 minutes", "3 to 10 minutes", "10 to 20 minutes", "more than 20 minutes"],
      depQ: "What happens when the person who normally processes documents is absent?", dep: DEP_STD_EN,
      steps: [
        ["Receipt and sorting", "Go through post, email and portals, assign documents", "Documents arrive by post, email and portal. Someone sorts, names and forwards them – every day.", "One central inbox and a fixed naming convention.", "Documents are recognised on receipt, named and assigned to the right case."],
        ["Capture data", "Enter amounts, dates and items into the system", "Values are typed in from PDFs. That is the most expensive and at the same time the most error-prone form of data capture.", "Check which document types your accounting software can already read – the function is often there but not set up.", "Document data is read automatically, account assignment is proposed, and a person checks only exceptions."],
        ["Transfer to other systems", "Enter the same details in ERP, accounting or lists", "The same data is entered in two or three systems because the systems are not connected. Excel bridges the gaps.", "Define which system leads for each document type – all others only take over.", "The systems exchange the data automatically; duplicate entry disappears."],
        ["Check and approve", "Check the content, approve for payment or booking", "Approvals happen informally or by circulation folder. Documents wait because someone is away, and payment deadlines come under pressure.", "Set approval thresholds and deputies in writing.", "Approvals run digitally with reminders and a deputy rule; amounts above a threshold are always checked by a person."],
        ["File and retrieve", "Save, name, find again later", "Filing follows personal systems. Only the person who filed something can find it again.", "One filing structure and one naming rule for everyone.", "Documents are classified and filed automatically in the right place."]
      ]
    },
    kundenservice: {
      name: "Customer service", process: "From customer question to answer", title: "How a customer enquiry is answered in your company",
      volQ: "How many customer enquiries – email, phone, form – arrive per week?", unit: "enquiries", unit1: "enquiry", vol: ["up to 25 per week", "26 to 100 per week", "101 to 300 per week", "more than 300 per week"],
      effQ: "How much working time goes into a typical enquiry until it is answered?", eff: ["under 5 minutes", "5 to 15 minutes", "15 to 30 minutes", "more than 30 minutes"],
      depQ: "What happens to enquiries when the responsible person is away?", dep: ["The stand-in answers as usual", "Answers take considerably longer", "Enquiries are left unanswered"],
      steps: [
        ["Receipt through several channels", "Phone, email, form, personal inboxes", "Enquiries arrive by phone, in personal inboxes and through forms. Nobody sees everything – so things slip through.", "One shared inbox as the only entry point, with visible processing status.", "All incoming enquiries come together in one place and are tracked with their status."],
        ["Read, classify, forward", "What is it about, and who is responsible?", "Every morning someone reads everything and distributes it by hand. That time benefits no customer.", "A few fixed topics, each with one responsible person.", "Enquiries are pre-sorted by topic and urgency and assigned to the responsible person."],
        ["Find the information for the answer", "Find out order status, date or the responsible person", "The answer is in the ERP, in the order or in a colleague's head. Customer service asks internally and waits.", "Collect the most frequent questions with checked answers in one place.", "Order status and date are added to the enquiry from the system."],
        ["Write the answer", "Word it, check it, send it", "The same answers are worded anew every day – in different quality depending on the person.", "Checked answer modules for the standard cases.", "For standard cases the answer draft is ready; critical answers never go out unchecked.", "Copilot in Outlook drafts the answer from the thread and modules; a person sends."],
        ["Track and escalate", "Keep open cases in view, react to delays", "Nobody keeps an eye on open cases. The customer asks again – and a question turns into a complaint.", "A list of open cases with deadlines, checked once a day.", "Open cases trigger automatic reminders and are escalated by clear rules."]
      ]
    },
    wissen: {
      name: "Knowledge", process: "From question to reliable information", title: "How your employees get to a piece of information",
      volQ: "How many employees search for internal information every day – prices, workflows, earlier decisions?", unit: "people", unit1: "person", vol: ["up to 5", "6 to 20", "21 to 50", "more than 50"],
      effQ: "How much time is lost per person and day?", eff: ["under 10 minutes", "10 to 30 minutes", "30 to 60 minutes", "more than 1 hour"],
      depQ: "What happens when an experienced person is absent for a longer time?", dep: ["The knowledge is documented, work continues", "Things slow down, much has to be asked", "Certain tasks come to a standstill"],
      steps: [
        ["Think about where the information could be", "Folder, drive, email – or does someone know?", "There are many storage locations and no shared order. New people do not even know where to start.", "Define a filing structure and name the most important storage locations.", "A question in everyday language is enough – the search covers all approved storage locations."],
        ["Search folders and emails", "Open files, scroll through threads", "Documents are named inconsistently. Search finds too much or nothing, so people browse.", "Set naming rules and tidy up the most-used folders.", "AI search delivers the answer with its source and shows only what the person asking is allowed to see.", "Copilot searches SharePoint and Teams – check permissions first, otherwise it also finds what not everyone should see."],
        ["Ask a colleague", "When the search turns up nothing", "The fastest search is asking the experienced colleague. That makes them a bottleneck – and their knowledge is written down nowhere.", "Collect the most frequent questions put to the knowledge holders and write the answers down once.", "A knowledge collection answers recurring questions; the expert only confirms special cases."],
        ["Check whether the version found is still valid", "Is this the current price list, the valid instruction?", "There are several versions of the same document. Nobody knows for sure which one applies – so people ask or work with the wrong one.", "One responsible person and one validity date per document type.", "There is one valid version per document; outdated documents are marked."],
        ["Record the answer for next time", "So that the next person does not start from scratch", "The answer found stays in someone's head or in an email. The next person – often a new colleague – searches for the same information from scratch.", "Collect frequent questions and their answers in one fixed place – also as a basis for onboarding.", "Answers are recorded with their source. New employees ask an assistant that answers from the approved documents."]
      ]
    },
    steuerung: {
      name: "Management reporting", process: "From figures to decision", title: "How figures become a report and a decision in your company",
      volQ: "How often do you create reports or analyses that you use to steer the company?", unit: "reports", unit1: "report", vol: ["once a month", "two to four times a month", "several times a week", "daily"],
      effQ: "How much working time goes into one report?", eff: ["under 1 hour", "1 to 4 hours", "about one working day", "several days"],
      depQ: "What happens when the person who creates the reports is absent?", dep: ["The report still arrives on time", "It arrives later or incomplete", "There is no report"],
      steps: [
        ["Pull figures from the systems", "Exports from ERP, accounting, CRM and Excel", "The figures sit in ERP, accounting, CRM and Excel. Every report starts with exporting and copying.", "Define for each metric which system it comes from.", "Figures flow automatically from the leading systems into one metrics view."],
        ["Reconcile and clean up", "Clarify discrepancies between the sources", "Figures from different sources do not match. Part of the work is clarifying which one is right.", "Write down the definition of the most important metrics once, bindingly.", "Deviations between the sources are flagged automatically instead of being searched for by hand."],
        ["Prepare the report", "Create tables, charts and commentary", "The report is rebuilt in Excel and PowerPoint every time. The format costs more time than the message.", "A fixed report template with a few metrics.", "The report prepares itself; a person adds the assessment.", "Copilot in Excel and Word prepares analysis and commentary."],
        ["Discuss and decide", "Present figures, agree on actions", "By the time the report is ready, the figures are old. Decisions are then made on gut feeling after all.", "A fixed date and a few metrics that are really used for steering.", "Current figures are available at any time; deviations trigger an alert."],
        ["Track decisions", "Check whether what was decided has been done", "Meetings end without recorded tasks. At the next meeting the same things are discussed again.", "Record decisions with person and date in one list.", "The meeting turns into tasks with dates and reminders.", "Meeting summaries in Teams record decisions and tasks."]
      ]
    },
    mitarbeiter: {
      name: "Employees", process: "From tool to safe use in the team", title: "What your team needs to use AI safely",
      volQ: "How many employees work mainly at a screen?", unit: "people", unit1: "person", vol: ["up to 5", "6 to 20", "21 to 50", "more than 50"],
      steps: [
        ["Knowing what AI is good for in your own work", "Which of my tasks can AI make easier?", "The tools are known, the use cases are not. Without examples from people's own work, it stays at trying things out.", "Collect a few concrete use cases per role from real daily work.", "Every role has its use cases – trained on its own tasks instead of slides."],
        ["Knowing what is allowed", "Which data may go into which tool?", "Nobody knows for sure which data may go into which tool. The cautious do not use AI at all, the bold use it without rules.", "A short AI policy: permitted tools, permitted data, who checks results.", "Clear rules that everyone knows – with documented training."],
        ["Having the right tool", "An approved tool with a company account", "Licences exist, but not where they create value – or people fall back on private accounts.", "Define which tool applies to which task and replace private accounts.", "One approved tool set for everyone, licences where they are used."],
        ["Checking results", "Who checks before something goes out?", "AI results are adopted without it being clear who checks them. This only shows when an error reaches the customer.", "Define per use case what a person checks before something goes out.", "AI proposes, people approve – as a fixed part of every workflow."],
        ["Together instead of everyone for themselves", "Share good examples, work consistently", "Every department invents its own ways. What works for one never reaches the next.", "Name key users and share good examples regularly.", "Key users carry proven use cases into the team; usage becomes visible."]
      ]
    }
  };
  var TRAIN_EN = { q: "Has your team been trained in using AI so far?", opts: [["Yes, all roles", "With documentation"], ["Individuals have attended training", "No shared level"], ["No, not yet", ""]] };
  var TOOLS_EN = { q: "Which AI tools are officially available to your team?", opts: [["Microsoft Copilot", "Licensed in the company"], ["ChatGPT, Claude or similar", "As a company account"], ["Only free or private accounts", "Without approval"], ["None", "Nothing provided so far"]] };
  // Bereich in der gewünschten Sprache: deutsche Daten mit englischen Texten überlagert (Werte und IDs bleiben gleich)
  var CACHE = {};
  function area(k, lang) {
    var A = AREAS[k]; if (!A || lang !== 'en') return A;
    if (CACHE[k]) return CACHE[k];
    var e = EN[k], o = { name: e.name, process: e.process, title: e.title, people: A.people, quote: A.quote, rest: A.rest };
    o.vol = { q: e.volQ, unit: e.unit, unit1: e.unit1, perDay: A.vol.perDay, opts: A.vol.opts.map(function (x, i) { return [e.vol[i], x[1]]; }) };
    if (A.eff) o.eff = { q: e.effQ, opts: A.eff.opts.map(function (x, i) { return [e.eff[i], x[1]]; }) };
    if (A.dep) o.dep = { q: e.depQ, opts: e.dep };
    o.steps = A.steps.map(function (s, i) { var t = e.steps[i]; return { id: s.id, need: s.need, label: t[0], sub: t[1], diag: t[2], sofort: t[3], ziel: t[4], sofortM: t[5] }; });
    return (CACHE[k] = o);
  }

  var CODE = { vertrieb: 'v', verwaltung: 'a', kundenservice: 'k', wissen: 'w', steuerung: 's', mitarbeiter: 'm' };

  // Welcher Bereich wird vertieft? Immer Priorität 1 (sie berücksichtigt Hebel und den markierten Fokus aus Frage 12),
  // damit Ist-Analyse, Prioritäten und Vorschlag im Ergebnis zusammenpassen.
  // Zeigt kein Bereich einen Hebel, wird der erste zutreffende Bereich vertieft – so bleiben es immer 16 Fragen.
  function pick(res) {
    if (!res || !res.areas) return [];
    var all = res.areas.filter(function (x) { return x.applicable && AREAS[x.slug]; }).sort(function (x, y) { return y.w - x.w; });
    var cand = all.filter(function (x) { return x.p >= 1; }), f = cand.filter(function (x) { return x.fokus; });
    var one = cand[0] || f[0] || all.filter(function (x) { return x.fokus; })[0] || all[0];
    return one ? [one.slug] : [];
  }

  // Fragen der Vertiefung: name = Feldname, opts = [Wert, Titel, Unterzeile]
  function questions(slugs, lang) {
    var out = [], en = lang === 'en', L = function (de, e) { return en ? e : de; }, TR = en ? TRAIN_EN : TRAIN, TO = en ? TOOLS_EN : TOOLS;
    (slugs || []).forEach(function (k) {
      var A = area(k, lang); if (!A) return;
      var block = L('D · Vertiefung', 'D · Deep dive'), p = 'd_' + k + '_';
      out.push({ name: p + 'vol', area: A.name, block: block, type: 'single', q: A.vol.q, opts: A.vol.opts.map(function (o, i) { return [String(i), o[0], '']; }) });
      if (A.people) out.push({ name: p + 'eff', area: A.name, block: block, type: 'single', q: TR.q, opts: TR.opts.map(function (o, i) { return [String(i), o[0], o[1]]; }) });
      else out.push({ name: p + 'eff', area: A.name, block: block, type: 'single', q: A.eff.q, hint: L('Eine grobe Schätzung genügt.', 'A rough estimate is enough.'), opts: A.eff.opts.map(function (o, i) { return [String(i), o[0], '']; }) });
      out.push({ name: p + 'bn', area: A.name, block: block, type: 'multi', max: 2,
        q: A.people ? L('Woran scheitert die Nutzung von KI im Alltag am häufigsten?', 'What most often stops AI from being used in daily work?') : L('An welcher Stelle geht dabei am meisten Zeit verloren?', 'At which point is the most time lost?'),
        hint: (A.people ? L('Fünf Dinge, die ein Team für die sichere Nutzung braucht.', 'Five things a team needs to use AI safely.') : L('Der Ablauf in fünf Schritten: ', 'The workflow in five steps: ') + A.title.charAt(0).toLowerCase() + A.title.slice(1) + '.') + L(' Wählen Sie bis zu zwei.', ' Choose up to two.'),
        opts: A.steps.map(function (st, i) { return [st.id, (i + 1) + ' · ' + st.label, st.sub]; }) });
      if (A.people) out.push({ name: p + 'dep', area: A.name, block: block, type: 'single', q: TO.q, opts: TO.opts.map(function (o, i) { return [String(i), o[0], o[1]]; }) });
      else out.push({ name: p + 'dep', area: A.name, block: block, type: 'single', q: A.dep.q, opts: A.dep.opts.map(function (o, i) { return [String(i), o, '']; }) });
    });
    return out;
  }
  function complete(slugs, d) {
    d = d || {};
    return (slugs || []).length > 0 && questions(slugs).every(function (q) { var v = d[q.name]; return q.type === 'multi' ? (v || []).length >= 1 : v != null && v !== ''; });
  }

  function hoursRound(h) { return h >= 20 ? Math.round(h / 5) * 5 : Math.max(1, Math.round(h)); }
  function idx(v, max) { var x = parseInt(v, 10); return isNaN(x) ? 0 : Math.max(0, Math.min(max, x)); }

  // ctx: { proc: Ablauf beschrieben, data: führende Datenquelle, m365: Microsoft 365 vorhanden } – aus den 12 Fragen
  function evaluate(slugs, d, ctx, lang) {
    d = d || {}; ctx = ctx || {};
    var en = lang === 'en', L = function (de, e) { return en ? e : de; }, Q1 = L('„', '"'), Q2 = L('“', '"');
    var durText = function (h) { return h >= 1 ? (en ? String(h) + (h === 1 ? ' hr' : ' hrs') : String(h).replace('.', ',') + ' Std.') : Math.round(h * 60) + L(' Min.', ' min'); };
    return (slugs || []).filter(function (k) { return AREAS[k]; }).map(function (k) {
      var A = area(k, lang), p = 'd_' + k + '_';
      var chosen = (d[p + 'bn'] || []).filter(function (id) { return A.steps.some(function (s) { return s.id === id; }); }).slice(0, 2);
      var bns = A.steps.filter(function (s) { return chosen.indexOf(s.id) >= 0; }).map(function (s) {
        var ok = !s.need || (s.need === 'data' ? !!ctx.data : !!ctx.proc);
        return {
          id: s.id, n: A.steps.indexOf(s) + 1, label: s.label, diag: s.diag, sofort: ctx.m365 && s.sofortM ? s.sofortM : s.sofort, ziel: s.ziel, ready: ok, need: s.need,
          voraus: ok ? L('Nichts – die Voraussetzungen sind nach Ihren Angaben gegeben.', 'Nothing – according to your answers the prerequisites are in place.')
            : s.need === 'data' ? L('Eine führende Datenquelle für diesen Ablauf festlegen.', 'Define one leading data source for this workflow.')
            : L('Den Ablauf einmal verbindlich beschreiben – wer macht was, in welcher Reihenfolge.', 'Describe the workflow once, bindingly – who does what, in which order.')
        };
      });
      var o = { key: k, name: A.name, process: A.process, title: A.title, people: !!A.people, bns: bns,
        steps: A.steps.map(function (s) { return { id: s.id, label: s.label, sub: s.sub, bn: chosen.indexOf(s.id) >= 0 }; }) };
      var vol = A.vol.opts[idx(d[p + 'vol'], 3)];
      if (A.people) {
        var t = idx(d[p + 'eff'], 2);
        o.hours = null; o.dep = null; o.depText = '';
        o.train = t; o.trainText = [L('Alle Rollen geschult', 'All roles trained'), L('Einzelne geschult', 'Individuals trained'), L('Bisher keine Schulung', 'No training so far')][t];
        var tl = idx(d[p + 'dep'], 3);
        o.tools = [L('Microsoft Copilot mit Lizenz', 'Microsoft Copilot, licensed'), L('KI-Werkzeug als Firmenkonto', 'AI tool as a company account'), L('nur kostenlose oder private Konten', 'only free or private accounts'), L('keine Werkzeuge bereitgestellt', 'no tools provided')][tl];
        o.basis = vol[0] + L(' Mitarbeitende am Bildschirm · Werkzeuge: ', ' employees at a screen · tools: ') + o.tools;
        o.teamLabel = vol[0];
        o.lead = L('Nach Ihren Angaben arbeiten ' + vol[0] + ' Mitarbeitende überwiegend am Bildschirm. ', 'According to your answers, ' + vol[0] + ' employees work mainly at a screen. ') +
          [L('Alle Rollen sind im Umgang mit KI geschult.', 'All roles have been trained in using AI.'), L('Einzelne waren auf Schulungen, einen gemeinsamen Stand gibt es nicht.', 'Individuals have attended training; there is no shared level.'), L('Eine Schulung im Umgang mit KI gab es bisher nicht.', 'There has been no AI training so far.')][t];
      } else {
        var eff = A.eff.opts[idx(d[p + 'eff'], 3)], dep = idx(d[p + 'dep'], 2);
        o.hours = hoursRound(vol[1] * eff[1] * (A.vol.perDay ? 20 : 1));
        var unit = vol[1] === 1 ? (en ? A.vol.unit1 : A.vol.unit.replace(/e$/, '')) : A.vol.unit;
        o.basis = A.vol.perDay ? vol[1] + L(' Personen × ca. ', ' people × approx. ') + durText(eff[1]) + L(' am Tag × 20 Arbeitstage', ' per day × 20 working days') : vol[1] + ' ' + A.vol.unit + L(' × ca. ', ' × approx. ') + durText(eff[1]);
        o.short = A.vol.perDay ? vol[1] + L(' Personen × ', ' people × ') + durText(eff[1]) + L(' am Tag', ' per day') : vol[1] + ' ' + unit + ' × ' + durText(eff[1]);
        o.lead = en
          ? 'According to your answers, ' + (A.vol.perDay ? 'around ' + vol[1] + ' people spend about ' + durText(eff[1]) + ' every day searching for information' : 'around ' + vol[1] + ' ' + unit + ' come up per month, each taking about ' + durText(eff[1]) + ' of working time') + '. That ties up around ' + o.hours + ' hours per month.'
          : 'Nach Ihren Angaben ' + (A.vol.perDay ? 'suchen rund ' + vol[1] + ' Personen jeden Tag etwa ' + durText(eff[1]) + ' nach Informationen' : 'fallen im Monat rund ' + vol[1] + ' ' + unit + ' an, mit jeweils etwa ' + durText(eff[1]) + ' Arbeitszeit') + '. Das bindet rund ' + o.hours + ' Stunden im Monat.';
        o.dep = dep; o.depLabel = [L('gering', 'low'), L('erhöht', 'elevated'), L('hoch', 'high')][dep];
        o.depShort = [L('läuft es weiter', 'work continues'), L('wird es langsam', 'things slow down'), L('steht es still', 'it comes to a halt')][dep];
        o.depText = [L('Die Vertretung funktioniert – der Ablauf hängt nicht an einer Person.', 'Cover works – the workflow does not depend on one person.'), L('Ein Ausfall bremst spürbar – der Ablauf hängt stark an einzelnen Personen.', 'An absence slows things down noticeably – the workflow depends heavily on individuals.'), L('Der Ablauf steht, wenn eine Person fehlt.', 'The workflow stops when one person is missing.')][dep];
      }
      o.where = bns.map(function (b) { return L('Schritt ', 'step ') + b.n + ' ' + Q1 + b.label + Q2; }).join(L(' und ', ' and '));
      o.lead += (A.people ? L(' Am häufigsten scheitert die Nutzung an ', ' Use most often fails at ') : L(' Am häufigsten hängt der Ablauf an ', ' The workflow most often gets stuck at ')) + o.where + '.';
      o.summary = o.name + ' (' + Q1 + o.process + Q2 + '): ' + (o.hours != null ? L('rund ', 'around ') + o.hours + L(' Std./Monat gebunden (', ' hrs/month tied up (') + o.basis + L('), Ausfallrisiko ', '), absence risk ') + o.depLabel : o.basis + ', ' + o.trainText) +
        L('; Engstelle: ', '; bottleneck: ') + bns.map(function (b) { return b.label; }).join(' + ');
      return o;
    });
  }

  // Vertiefungsantworten ⇄ Kurzcode für den Teilen-Link (je Bereich sechs Zeichen, keine personenbezogenen Daten)
  function encode(slugs, d) {
    d = d || {};
    return (slugs || []).filter(function (k) { return AREAS[k]; }).map(function (k) {
      var A = AREAS[k], p = 'd_' + k + '_', ids = A.steps.map(function (s) { return s.id; });
      var bn = (d[p + 'bn'] || []).map(function (id) { return ids.indexOf(id); }).filter(function (i) { return i >= 0; }).slice(0, 2);
      return CODE[k] + idx(d[p + 'vol'], 3) + idx(d[p + 'eff'], 3) + idx(d[p + 'dep'], A.people ? 3 : 2) + (bn.length ? bn[0] : 0) + (bn.length > 1 ? bn[1] : '-');
    }).join('');
  }
  function decode(code) {
    if (!/^[vakwsm][0-3][0-3][0-3][0-4][0-4-]$/.test(code || '')) return null;
    var slugs = [], d = {};
    for (var i = 0; i < code.length; i += 6) {
      var c = code.slice(i, i + 6), k = ORDER.filter(function (x) { return CODE[x] === c[0]; })[0], p = 'd_' + k + '_', A = AREAS[k];
      if (slugs.indexOf(k) >= 0) return null;
      slugs.push(k); d[p + 'vol'] = c[1]; d[p + 'eff'] = c[2]; d[p + 'dep'] = A.people ? c[3] : String(Math.min(2, +c[3]));
      d[p + 'bn'] = [c[4], c[5]].filter(function (x) { return x !== '-'; }).map(function (x) { return A.steps[+x].id; }).filter(function (x, n, arr) { return arr.indexOf(x) === n; });
    }
    return { slugs: slugs, d: d };
  }

  return { ORDER: ORDER, AREAS: AREAS, area: area, pick: pick, questions: questions, complete: complete, evaluate: evaluate, encode: encode, decode: decode };
});
