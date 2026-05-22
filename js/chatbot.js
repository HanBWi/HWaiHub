(function () {
  'use strict';

  // ── Content & Translations ───────────────────────────────────
  var CB = {
    de: {
      toggle_label: 'Chat öffnen',
      title: 'HWaiHub Assistent',
      subtitle: 'Fragen zu Leistungen & Paketen',
      placeholder: 'Deine Frage…',
      send: '→',
      greeting: 'Hallo! 👋 Ich beantworte Fragen zu den Leistungen, Paketen und allem rund um HWaiHub. Womit kann ich helfen?',
      quick_start: ['Leistungen', 'Pakete & Preise', 'Über Hanna', 'Kontakt'],
      responses: {
        services: {
          text: '**HWaiHub bietet vier Kernleistungen:**\n\n🧭 KI-Strategie & Roadmap\n⚙️ Prozessautomatisierung\n🧑‍💼 Change Management\n🎓 Workshops & Training\n\nÜber welche möchtest du mehr erfahren?',
          chips: ['KI-Strategie', 'Automatisierung', 'Change Management', 'Workshops']
        },
        strategy: {
          text: '🧭 **KI-Strategie & Roadmap**\n\nVon der Ist-Analyse bis zum priorisierten Umsetzungsplan — ohne Technologie-Overkill, mit echtem Business-Impact.\n\n✓ KI-Readiness Assessment\n✓ Use-Case-Priorisierung (ROI-basiert)\n✓ Technologie-Auswahl & Vendor-Screening\n✓ Rollout-Roadmap mit Meilensteinen',
          chips: ['Pakete & Preise', 'Kontakt']
        },
        automation: {
          text: '⚙️ **Prozessautomatisierung**\n\nZeitfresser eliminieren, Fehlerquoten senken, Teams entlasten — dort, wo es den größten Hebel hat.\n\n✓ Prozessanalyse & Automatisierungspotenziale\n✓ Implementierung (E-Mail, Dokumente, Workflows)\n✓ DSGVO-konforme Umsetzung\n✓ Monitoring-Dashboard & KPIs',
          chips: ['Pakete & Preise', 'Kontakt']
        },
        change: {
          text: '🧑‍💼 **Change Management**\n\nKI scheitert nicht an der Technologie — sie scheitert an fehlender Akzeptanz. Ich begleite Teams strategisch, empathisch und nachhaltig.\n\n✓ Stakeholder-Analyse & Kommunikationsstrategie\n✓ Führungskräfte-Coaching\n✓ Widerstandsmanagement\n✓ Kulturwandel & KI-Mindset',
          chips: ['Pakete & Preise', 'Kontakt']
        },
        workshops: {
          text: '🎓 **Workshops & Training**\n\nPraxisnahe Workshops für Führungsteams, Fachbereiche oder das gesamte Unternehmen.\n\n✓ KI-Grundlagen für Nicht-Techniker\n✓ Prompt Engineering (ChatGPT, Copilot & Co.)\n✓ Tool-spezifische Intensivtrainings\n✓ E-Learning-Module & Nachbetreuung',
          chips: ['Pakete & Preise', 'Kontakt']
        },
        website: {
          text: '🌐 **Website-Pakete**\n\n**Starter-Website**\n✓ Vollständige Markenidentität\n✓ Einseitige Website oder Landing Page\n✓ Professionelle Texterstellung\n✓ Mobiloptimiert & schnell\n✓ 1 Sprache inklusive\n✓ 1 Kontaktformular\n\n📦 Betreuungspaket: **€79/Monat**\n✓ 5 Änderungswünsche/Monat\n✓ Chat-Support\n✓ Fertig in 7 Tagen\n✓ Sicheres Hosting & SSL\n✓ Automatische Backups & Updates\n\n——————————————\n\n**Professional-Website**\n✓ Vollständige Markenidentität\n✓ Website mit bis zu 5 Seiten\n✓ Professionelle Texterstellung\n✓ Mobiloptimiert & schnell\n✓ 2 Sprachen inklusive\n✓ 2 Kontaktformulare\n✓ 1 CMS-Collection\n✓ 3 Integrationen\n✓ SEO inklusive\n\n📦 Betreuungspaket: **€179/Monat**\n✓ Unbegrenzte Änderungswünsche\n✓ 3 Plätze in der Websprint-App\n✓ Chat-Support\n✓ Fertig in 14 Tagen',
          chips: ['Pakete & Preise', 'Kontakt']
        },
        pricing: {
          text: '💼 **Pakete & Preise**\n\n**Starter** — ab €2.999 (einmalig)\nErster KI-Einstieg: 1 Automatisierung, Prozessanalyse, 2 Wochen Nachbetreuung\n\n**Professional** — ab €7.999 + €600/Mo.\nBeliebtestes Paket: 3–5 Automatisierungen, Dashboard, Priority-Support\n\n**Enterprise** — ab €18.999\nKomplette digitale Transformation, dedizierter KI-Berater\n\nAlle Preise netto zzgl. MwSt. · Erstgespräch kostenlos & unverbindlich',
          chips: ['Starter', 'Professional', 'Enterprise', 'Kontakt']
        },
        starter: {
          text: '**Starter — ab €2.999**\n*(einmalig, netto zzgl. 19% MwSt.)*\n\n✓ 1 KI-Automatisierung eingerichtet\n✓ Prozessanalyse\n✓ z.B. E-Mail-Assistent oder Kalenderoptimierung\n✓ 2 Wochen Nachbetreuung\n✓ Schritt-für-Schritt-Anleitung\n\nIdeal für den ersten KI-Schritt.',
          chips: ['Professional', 'Enterprise', 'Kontakt']
        },
        professional: {
          text: '**Professional — ab €7.999 + €600/Mo.**\n*(netto zzgl. 19% MwSt.)*\n\n✓ 3–5 KI-Automatisierungen\n✓ Vollständige Prozessanalyse\n✓ E-Mail + Kalender + Rechnungen\n✓ Übersichts-Dashboard\n✓ Monatliches Optimierungs-Meeting\n✓ Priority-Support (24h)\n✓ DSGVO-Dokumentation inkl.\n\nDas beliebteste Paket für wachsende Teams.',
          chips: ['Starter', 'Enterprise', 'Kontakt']
        },
        enterprise: {
          text: '**Enterprise — ab €18.999**\n*(individuell, netto zzgl. 19% MwSt.)*\n\n✓ Komplette digitale Transformation\n✓ Unbegrenzte Automatisierungen\n✓ End-to-End Produktentwicklung\n✓ Dedizierter KI-Berater\n✓ Mitarbeiterschulungen inkl.\n✓ Retainer-Modell möglich\n\nFür Unternehmen, die vollen Umfang wollen.',
          chips: ['Starter', 'Professional', 'Kontakt']
        },
        about: {
          text: '👩‍💼 **Hanna Winkelmann**\nAI & Digital Transformation Consultant · Gründerin, HWaiHub\n\nMit über einem Jahrzehnt Erfahrung begleitet Hanna Unternehmen von der KI-Strategie bis zur Umsetzung — ohne Buzzwords, mit messbaren Ergebnissen.\n\n📍 Cascais, Portugal — Remote & vor Ort\n\nZertifizierungen: Microsoft Azure · CSPO · SAS · PRINCE2 Agile',
          chips: ['Leistungen', 'Kontakt']
        },
        contact: {
          text: '📬 **Kontakt aufnehmen**\n\nDas kostenlose Erstgespräch dauert 30 Minuten — unverbindlich.\n\n✉️ hallo@hwaihub.com\n\nOder nutze das Kontaktformular auf der Startseite. Ich melde mich in der Regel innerhalb von 24 Stunden.',
          chips: ['Zum Kontaktformular →']
        },
        fallback: {
          text: 'Für diese Frage bin ich vielleicht zu begrenzt 😊 Hanna beantwortet sie gerne direkt:\n\n✉️ hallo@hwaihub.com\n\nOder nutze das kostenlose Erstgespräch.',
          chips: ['Leistungen', 'Pakete & Preise', 'Kontakt']
        }
      },
      keywords: {
        services:     ['leistung', 'service', 'angebot', 'was machst', 'was bietest', 'ki beratung', 'beratung'],
        strategy:     ['strategie', 'roadmap', 'ki-strategie', 'ki strategie', 'plan', 'planung'],
        automation:   ['automatisierung', 'automatisieren', 'prozess', 'workflow', 'e-mail assistent'],
        change:       ['change management', 'change', 'veränderung', 'akzeptanz', 'führungskraft', 'team führen'],
        workshops:    ['workshop', 'training', 'schulung', 'weiterbildung', 'prompt engineering', 'kurs'],
        website:      ['website', 'webseite', 'landing page', 'homepage', 'internetseite', 'webdesign', 'seite erstellen', 'hosting', 'ssl', 'websprint'],
        pricing:      ['preis', 'kosten', 'paket', 'pakete', 'wie viel', 'wieviel', 'budget', 'bezahlen'],
        starter:      ['starter', 'einstieg', '2999', '2.999', 'günstig', 'klein'],
        professional: ['professional', 'wachstum', '7999', '7.999'],
        enterprise:   ['enterprise', 'vollausbau', '18999', '18.999', 'groß', 'komplett'],
        about:        ['über hanna', 'wer ist', 'erfahrung', 'zertifikat', 'hintergrund', 'portugal', 'cascais', 'remote', 'standort'],
        contact:      ['kontakt', 'buchen', 'erstgespräch', 'termin', 'anfragen', 'e-mail', 'mail', 'schreiben', 'melden']
      }
    },

    en: {
      toggle_label: 'Open chat',
      title: 'HWaiHub Assistant',
      subtitle: 'Questions about services & pricing',
      placeholder: 'Your question…',
      send: '→',
      greeting: 'Hi! 👋 I can answer questions about HWaiHub\'s services, packages, and anything else. How can I help?',
      quick_start: ['Services', 'Packages & Pricing', 'About Hanna', 'Contact'],
      responses: {
        services: {
          text: '**HWaiHub offers four core services:**\n\n🧭 AI Strategy & Roadmap\n⚙️ Process Automation\n🧑‍💼 Change Management\n🎓 Workshops & Training\n\nWhich one would you like to know more about?',
          chips: ['AI Strategy', 'Automation', 'Change Management', 'Workshops']
        },
        strategy: {
          text: '🧭 **AI Strategy & Roadmap**\n\nFrom current-state analysis to a prioritised action plan — no tech overkill, just targeted steps with real business impact.\n\n✓ AI Readiness Assessment\n✓ Use-case prioritisation (ROI-based)\n✓ Technology selection & vendor screening\n✓ Rollout roadmap with milestones',
          chips: ['Packages & Pricing', 'Contact']
        },
        automation: {
          text: '⚙️ **Process Automation**\n\nEliminate time-wasters, reduce error rates, and relieve your teams — where it makes the biggest difference.\n\n✓ Process analysis & automation potential\n✓ Implementation (email, documents, workflows)\n✓ GDPR-compliant setup\n✓ Monitoring dashboard & KPIs',
          chips: ['Packages & Pricing', 'Contact']
        },
        change: {
          text: '🧑‍💼 **Change Management**\n\nAI doesn\'t fail because of technology — it fails due to lack of acceptance. I guide leaders and teams through change: strategically, empathetically, sustainably.\n\n✓ Stakeholder analysis & communication strategy\n✓ Leadership coaching\n✓ Resistance management\n✓ Culture change & AI mindset',
          chips: ['Packages & Pricing', 'Contact']
        },
        workshops: {
          text: '🎓 **Workshops & Training**\n\nHands-on workshops for leadership teams, departments, or the entire organisation.\n\n✓ AI basics for non-technical staff\n✓ Prompt engineering (ChatGPT, Copilot & more)\n✓ Tool-specific intensive training\n✓ E-learning modules & follow-up',
          chips: ['Packages & Pricing', 'Contact']
        },
        website: {
          text: '🌐 **Website Packages**\n\n**Starter Website**\n✓ Full brand identity\n✓ One-page website or landing page\n✓ Professional copywriting\n✓ Mobile-ready & fast loading\n✓ 1 language included\n✓ 1 contact form\n\n📦 Monthly care package: **€79/month**\n✓ 5 website change requests/month\n✓ Chat support\n✓ Ready in 7 days\n✓ Secure hosting & SSL certificate\n✓ Automatic backups & technical updates\n\n——————————————\n\n**Professional Website**\n✓ Full brand identity\n✓ Custom website up to 5 pages\n✓ Professional copywriting\n✓ Mobile-ready & fast loading\n✓ 2 languages included\n✓ 2 contact forms\n✓ 1 CMS collection\n✓ 3 integrations\n✓ SEO included\n\n📦 Monthly care package: **€179/month**\n✓ Unlimited website change requests\n✓ 3 seats in Websprint app\n✓ Chat support\n✓ Ready in 14 days',
          chips: ['Packages & Pricing', 'Contact']
        },
        pricing: {
          text: '💼 **Packages & Pricing**\n\n**Starter** — from €2,999 (one-time)\nFirst AI step: 1 automation, process analysis, 2 weeks aftercare\n\n**Professional** — from €7,999 + €600/mo.\nMost popular: 3–5 automations, dashboard, priority support\n\n**Enterprise** — from €18,999\nFull digital transformation, dedicated AI consultant\n\nAll prices net plus VAT · Initial call free & non-binding',
          chips: ['Starter', 'Professional', 'Enterprise', 'Contact']
        },
        starter: {
          text: '**Starter — from €2,999**\n*(one-time, net plus VAT)*\n\n✓ 1 AI automation set up\n✓ Process analysis\n✓ e.g. email assistant or calendar\n✓ 2 weeks aftercare\n✓ Step-by-step guide\n\nIdeal for your first AI step.',
          chips: ['Professional', 'Enterprise', 'Contact']
        },
        professional: {
          text: '**Professional — from €7,999 + €600/mo.**\n*(net plus VAT)*\n\n✓ 3–5 AI automations\n✓ Full process analysis\n✓ Email + calendar + invoices\n✓ Overview dashboard\n✓ Monthly optimisation meeting\n✓ Priority support (24h)\n✓ GDPR documentation incl.\n\nThe most popular package for growing teams.',
          chips: ['Starter', 'Enterprise', 'Contact']
        },
        enterprise: {
          text: '**Enterprise — from €18,999**\n*(custom, net plus VAT)*\n\n✓ Complete digital transformation\n✓ Unlimited automations\n✓ End-to-end product development\n✓ Dedicated AI consultant\n✓ Employee training included\n✓ Retainer model available\n\nFor companies that want the full scope.',
          chips: ['Starter', 'Professional', 'Contact']
        },
        about: {
          text: '👩‍💼 **Hanna Winkelmann**\nAI & Digital Transformation Consultant · Founder, HWaiHub\n\nWith over a decade of experience, Hanna guides companies from AI strategy to implementation — no buzzwords, measurable results.\n\n📍 Cascais, Portugal — Remote & on-site\n\nCertifications: Microsoft Azure · CSPO · SAS · PRINCE2 Agile',
          chips: ['Services', 'Contact']
        },
        contact: {
          text: '📬 **Get in touch**\n\nThe free initial call lasts 30 minutes — completely non-binding.\n\n✉️ hallo@hwaihub.com\n\nOr use the contact form on the homepage. I usually reply within 24 hours.',
          chips: ['To contact form →']
        },
        fallback: {
          text: 'Great question — I might be a little limited here 😊 Hanna would be happy to answer it directly:\n\n✉️ hallo@hwaihub.com\n\nOr book a free initial call.',
          chips: ['Services', 'Packages & Pricing', 'Contact']
        }
      },
      keywords: {
        services:     ['service', 'offer', 'what do you', 'what does', 'consulting', 'ai consulting'],
        strategy:     ['strategy', 'roadmap', 'ai strategy', 'plan', 'planning'],
        automation:   ['automation', 'automate', 'process', 'workflow', 'email assistant'],
        change:       ['change management', 'change', 'transformation', 'acceptance', 'leadership'],
        workshops:    ['workshop', 'training', 'course', 'prompt engineering', 'learning'],
        website:      ['website', 'landing page', 'homepage', 'web design', 'webdesign', 'hosting', 'ssl', 'websprint', 'one page', 'web page'],
        pricing:      ['price', 'cost', 'package', 'packages', 'how much', 'budget', 'pay'],
        starter:      ['starter', 'entry', '2999', '2,999', 'cheap', 'small'],
        professional: ['professional', 'growth', '7999', '7,999'],
        enterprise:   ['enterprise', 'full scale', '18999', '18,999', 'large', 'complete'],
        about:        ['about hanna', 'who is', 'experience', 'certification', 'background', 'portugal', 'cascais', 'remote', 'location'],
        contact:      ['contact', 'book', 'call', 'appointment', 'email', 'write', 'reach', 'get in touch']
      }
    },

    pl: {
      toggle_label: 'Otwórz czat',
      title: 'Asystent HWaiHub',
      subtitle: 'Pytania o usługi i pakiety',
      placeholder: 'Twoje pytanie…',
      send: '→',
      greeting: 'Cześć! 👋 Mogę odpowiadać na pytania o usługi, pakiety i wszystko związane z HWaiHub. Jak mogę pomóc?',
      quick_start: ['Usługi', 'Pakiety i Ceny', 'O Hannie', 'Kontakt'],
      responses: {
        services: {
          text: '**HWaiHub oferuje cztery kluczowe usługi:**\n\n🧭 Strategia AI i Plan działania\n⚙️ Automatyzacja procesów\n🧑‍💼 Zarządzanie zmianą\n🎓 Warsztaty i szkolenia\n\nO której chcesz wiedzieć więcej?',
          chips: ['Strategia AI', 'Automatyzacja', 'Zarządzanie zmianą', 'Warsztaty']
        },
        strategy: {
          text: '🧭 **Strategia AI i Plan działania**\n\nOd analizy stanu obecnego do priorytetowego planu działania — bez nadmiaru technologii, z realnym wpływem na biznes.\n\n✓ Ocena gotowości na AI\n✓ Priorytetyzacja przypadków użycia (na podstawie ROI)\n✓ Dobór technologii i screening dostawców\n✓ Roadmapa wdrożenia z kamieniami milowymi',
          chips: ['Pakiety i Ceny', 'Kontakt']
        },
        automation: { text: '⚙️ **Automatyzacja procesów**\n\nEliminacja pożeraczy czasu, redukcja błędów, odciążenie zespołów — tam, gdzie efekt jest największy.\n\n✓ Analiza procesów i potencjał automatyzacji\n✓ Wdrożenie (e-mail, dokumenty, przepływy pracy)\n✓ Implementacja zgodna z RODO\n✓ Dashboard monitoringowy i KPI', chips: ['Pakiety i Ceny', 'Kontakt'] },
        change:     { text: '🧑‍💼 **Zarządzanie zmianą**\n\nAI nie zawodzi z powodu technologii — zawodzi z powodu braku akceptacji. Prowadzę liderów i zespoły przez zmianę: strategicznie, empatycznie, trwale.\n\n✓ Analiza interesariuszy i strategia komunikacji\n✓ Coaching kadry kierowniczej\n✓ Zarządzanie oporem\n✓ Zmiana kultury i mindset AI', chips: ['Pakiety i Ceny', 'Kontakt'] },
        workshops:  { text: '🎓 **Warsztaty i szkolenia**\n\nPraktyczne warsztaty dla kadry kierowniczej, działów lub całej firmy.\n\n✓ Podstawy AI dla osób nieinformatycznych\n✓ Prompt engineering (ChatGPT, Copilot i inne)\n✓ Intensywne szkolenia z konkretnych narzędzi\n✓ Moduły e-learningowe i wsparcie po szkoleniu', chips: ['Pakiety i Ceny', 'Kontakt'] },
        website: { text: '🌐 **Pakiety Stron Internetowych**\n\n**Starter — Strona internetowa**\n✓ Pełna identyfikacja wizualna marki\n✓ Jednostronicowa witryna lub landing page\n✓ Profesjonalne teksty\n✓ Responsywna i szybka\n✓ 1 język w zestawie\n✓ 1 formularz kontaktowy\n\n📦 Pakiet opieki: **€79/mies.**\n✓ 5 zmian na stronie/miesiąc\n✓ Wsparcie chat\n✓ Gotowa w 7 dni\n✓ Bezpieczny hosting & SSL\n✓ Automatyczne kopie zapasowe i aktualizacje\n\n——————————————\n\n**Professional — Strona internetowa**\n✓ Pełna identyfikacja wizualna marki\n✓ Strona do 5 podstron\n✓ Profesjonalne teksty\n✓ Responsywna i szybka\n✓ 2 języki w zestawie\n✓ 2 formularze kontaktowe\n✓ 1 kolekcja CMS\n✓ 3 integracje\n✓ SEO w zestawie\n\n📦 Pakiet opieki: **€179/mies.**\n✓ Nieograniczone zmiany na stronie\n✓ 3 miejsca w aplikacji Websprint\n✓ Wsparcie chat\n✓ Gotowa w 14 dni', chips: ['Pakiety i Ceny', 'Kontakt'] },
        pricing: {
          text: '💼 **Pakiety i Ceny**\n\n**Starter** — od €2 999 (jednorazowo)\nPierwszy krok w AI: 1 automatyzacja, analiza procesów, 2 tygodnie wsparcia\n\n**Professional** — od €7 999 + €600/mies.\nNajpopularniejszy: 3–5 automatyzacji, dashboard, wsparcie priorytetowe\n\n**Enterprise** — od €18 999\nKompletna transformacja cyfrowa, dedykowany doradca AI\n\nWszystkie ceny netto plus VAT · Pierwsza rozmowa bezpłatna',
          chips: ['Starter', 'Professional', 'Enterprise', 'Kontakt']
        },
        starter:      { text: '**Starter — od €2 999**\n*(jednorazowo, netto plus VAT)*\n\n✓ 1 automatyzacja AI wdrożona\n✓ Analiza procesów\n✓ np. asystent e-mail lub kalendarz\n✓ 2 tygodnie wsparcia po wdrożeniu\n✓ Instrukcja krok po kroku\n\nIdealny na pierwszy krok w AI.', chips: ['Professional', 'Enterprise', 'Kontakt'] },
        professional: { text: '**Professional — od €7 999 + €600/mies.**\n*(netto plus VAT)*\n\n✓ 3–5 automatyzacji AI\n✓ Pełna analiza procesów\n✓ E-mail + kalendarz + faktury\n✓ Dashboard przeglądowy\n✓ Miesięczne spotkanie optymalizacyjne\n✓ Priority support (24h)\n✓ Dokumentacja RODO w zestawie', chips: ['Starter', 'Enterprise', 'Kontakt'] },
        enterprise:   { text: '**Enterprise — od €18 999**\n*(indywidualnie, netto plus VAT)*\n\n✓ Kompletna transformacja cyfrowa\n✓ Nieograniczone automatyzacje\n✓ Tworzenie produktów end-to-end\n✓ Dedykowany doradca AI\n✓ Szkolenia pracowników w zestawie\n✓ Model retainerowy możliwy', chips: ['Starter', 'Professional', 'Kontakt'] },
        about:   { text: '👩‍💼 **Hanna Winkelmann**\nKonsultantka AI i Transformacji Cyfrowej · Założycielka, HWaiHub\n\nZ ponad dziesięcioletnim doświadczeniem prowadzi firmy od strategii AI do wdrożenia — bez słów kluczowych, z mierzalnymi wynikami.\n\n📍 Cascais, Portugalia — Zdalnie i na miejscu\n\nCertyfikaty: Microsoft Azure · CSPO · SAS · PRINCE2 Agile', chips: ['Usługi', 'Kontakt'] },
        contact: { text: '📬 **Skontaktuj się**\n\nBezpłatna pierwsza rozmowa trwa 30 minut — bez zobowiązań.\n\n✉️ hallo@hwaihub.com\n\nLub skorzystaj z formularza kontaktowego na stronie głównej. Zazwyczaj odpowiadam w ciągu 24 godzin.', chips: ['Do formularza kontaktowego →'] },
        fallback: { text: 'Świetne pytanie — może trochę przekraczam moje możliwości 😊 Hanna chętnie odpowie bezpośrednio:\n\n✉️ hallo@hwaihub.com', chips: ['Usługi', 'Pakiety i Ceny', 'Kontakt'] }
      },
      keywords: {
        services:     ['usług', 'serwis', 'ofert', 'co robisz', 'co oferujesz', 'doradztwo'],
        strategy:     ['strategi', 'roadmap', 'plan', 'planowanie'],
        automation:   ['automatyzacj', 'automat', 'proces', 'workflow'],
        change:       ['zarządzanie zmianą', 'zmian', 'transformacj', 'akceptacj', 'przywódc'],
        workshops:    ['warsztat', 'szkoleni', 'kurs', 'prompt engineering'],
        website:      ['website', 'strona internet', 'landing page', 'witryn', 'hosting', 'ssl', 'websprint', 'webdesign'],
        pricing:      ['cen', 'koszt', 'pakiet', 'ile', 'budżet', 'płac'],
        starter:      ['starter', 'wejście', '2999', '2 999'],
        professional: ['professional', 'wzrost', '7999', '7 999'],
        enterprise:   ['enterprise', 'pełna skala', '18999', '18 999'],
        about:        ['o hannie', 'kto', 'doświadczen', 'certyfikat', 'portugalia', 'cascais', 'zdalnie'],
        contact:      ['kontakt', 'umów', 'rozmow', 'termin', 'e-mail', 'napisz', 'skontaktuj']
      }
    },

    es: {
      toggle_label: 'Abrir chat',
      title: 'Asistente HWaiHub',
      subtitle: 'Preguntas sobre servicios y paquetes',
      placeholder: 'Tu pregunta…',
      send: '→',
      greeting: '¡Hola! 👋 Puedo responder preguntas sobre los servicios, paquetes y todo lo relacionado con HWaiHub. ¿En qué puedo ayudarte?',
      quick_start: ['Servicios', 'Paquetes y Precios', 'Sobre Hanna', 'Contacto'],
      responses: {
        services: {
          text: '**HWaiHub ofrece cuatro servicios principales:**\n\n🧭 Estrategia de IA & Hoja de ruta\n⚙️ Automatización de Procesos\n🧑‍💼 Gestión del Cambio\n🎓 Talleres y Formación\n\n¿Sobre cuál te gustaría saber más?',
          chips: ['Estrategia de IA', 'Automatización', 'Gestión del Cambio', 'Talleres']
        },
        strategy:     { text: '🧭 **Estrategia de IA & Hoja de ruta**\n\nDesde el análisis del estado actual hasta un plan de acción priorizado — sin exceso tecnológico, con impacto real en el negocio.\n\n✓ Evaluación de madurez en IA\n✓ Priorización de casos de uso (basada en ROI)\n✓ Selección de tecnología & cribado de proveedores\n✓ Hoja de ruta de implementación con hitos', chips: ['Paquetes y Precios', 'Contacto'] },
        automation:   { text: '⚙️ **Automatización de Procesos**\n\nEliminar tareas repetitivas, reducir errores y liberar a los equipos — donde tiene más impacto.\n\n✓ Análisis de procesos & potencial de automatización\n✓ Implementación (correo, documentos, flujos)\n✓ Configuración conforme al RGPD\n✓ Panel de monitorización & KPIs', chips: ['Paquetes y Precios', 'Contacto'] },
        change:       { text: '🧑‍💼 **Gestión del Cambio**\n\nLa IA no falla por la tecnología — falla por falta de adopción. Acompaño a líderes y equipos en el cambio: de forma estratégica, empática y sostenible.\n\n✓ Análisis de stakeholders & estrategia de comunicación\n✓ Coaching de liderazgo\n✓ Gestión de resistencias\n✓ Cambio cultural & mentalidad de IA', chips: ['Paquetes y Precios', 'Contacto'] },
        workshops:    { text: '🎓 **Talleres y Formación**\n\nTalleres prácticos para equipos directivos, departamentos o toda la empresa.\n\n✓ Fundamentos de IA para no técnicos\n✓ Ingeniería de prompts (ChatGPT, Copilot y más)\n✓ Formaciones intensivas de herramientas específicas\n✓ Módulos de e-learning & seguimiento', chips: ['Paquetes y Precios', 'Contacto'] },
        website: { text: '🌐 **Paquetes de Sitio Web**\n\n**Starter — Sitio Web**\n✓ Identidad de marca completa\n✓ Web de una página o landing page\n✓ Redacción profesional\n✓ Adaptado a móvil y carga rápida\n✓ 1 idioma incluido\n✓ 1 formulario de contacto\n\n📦 Paquete de mantenimiento: **€79/mes**\n✓ 5 cambios en la web/mes\n✓ Soporte por chat\n✓ Lista en 7 días\n✓ Hosting seguro & certificado SSL\n✓ Copias de seguridad automáticas y actualizaciones\n\n——————————————\n\n**Professional — Sitio Web**\n✓ Identidad de marca completa\n✓ Web personalizada hasta 5 páginas\n✓ Redacción profesional\n✓ Adaptado a móvil y carga rápida\n✓ 2 idiomas incluidos\n✓ 2 formularios de contacto\n✓ 1 colección CMS\n✓ 3 integraciones\n✓ SEO incluido\n\n📦 Paquete de mantenimiento: **€179/mes**\n✓ Cambios ilimitados en la web\n✓ 3 asientos en la app Websprint\n✓ Soporte por chat\n✓ Lista en 14 días', chips: ['Paquetes y Precios', 'Contacto'] },
        pricing: {
          text: '💼 **Paquetes y Precios**\n\n**Starter** — desde €2.999 (único)\nPrimer paso en IA: 1 automatización, análisis de procesos, 2 semanas de seguimiento\n\n**Professional** — desde €7.999 + €600/mes\nEl más popular: 3–5 automatizaciones, panel, soporte prioritario\n\n**Enterprise** — desde €18.999\nTransformación digital completa, consultor de IA dedicado\n\nTodos los precios netos más IVA · Primera llamada gratuita y sin compromiso',
          chips: ['Starter', 'Professional', 'Enterprise', 'Contacto']
        },
        starter:      { text: '**Starter — desde €2.999**\n*(único, neto más IVA)*\n\n✓ 1 automatización de IA configurada\n✓ Análisis de procesos\n✓ p.ej. asistente de correo o calendario\n✓ 2 semanas de seguimiento\n✓ Guía paso a paso\n\nIdeal para dar el primer paso en IA.', chips: ['Professional', 'Enterprise', 'Contacto'] },
        professional: { text: '**Professional — desde €7.999 + €600/mes**\n*(neto más IVA)*\n\n✓ 3–5 automatizaciones de IA\n✓ Análisis completo de procesos\n✓ Correo + calendario + facturas\n✓ Panel de visión general\n✓ Reunión mensual de optimización\n✓ Soporte prioritario (24h)\n✓ Documentación RGPD incluida\n\nEl paquete más popular para equipos en crecimiento.', chips: ['Starter', 'Enterprise', 'Contacto'] },
        enterprise:   { text: '**Enterprise — desde €18.999**\n*(personalizado, neto más IVA)*\n\n✓ Transformación digital completa\n✓ Automatizaciones ilimitadas\n✓ Desarrollo end-to-end\n✓ Consultor de IA dedicado\n✓ Formación de empleados incluida\n✓ Modelo de retainer disponible\n\nPara empresas que quieren el alcance completo.', chips: ['Starter', 'Professional', 'Contacto'] },
        about:   { text: '👩‍💼 **Hanna Winkelmann**\nConsultora de IA & Transformación Digital · Fundadora, HWaiHub\n\nCon más de una década de experiencia, guía a empresas desde la estrategia de IA hasta la implementación — sin buzzwords, con resultados medibles.\n\n📍 Cascais, Portugal — Remoto y presencial\n\nCertificaciones: Microsoft Azure · CSPO · SAS · PRINCE2 Agile', chips: ['Servicios', 'Contacto'] },
        contact: { text: '📬 **Ponte en contacto**\n\nLa primera llamada gratuita dura 30 minutos — sin compromiso.\n\n✉️ hallo@hwaihub.com\n\nO usa el formulario de contacto en la página principal. Normalmente respondo en 24 horas.', chips: ['Al formulario de contacto →'] },
        fallback: { text: 'Buena pregunta — puede que me quede un poco corto aquí 😊 Hanna estaría encantada de responderla directamente:\n\n✉️ hallo@hwaihub.com', chips: ['Servicios', 'Paquetes y Precios', 'Contacto'] }
      },
      keywords: {
        services:     ['servicio', 'oferta', 'qué hace', 'qué ofrece', 'consultoría'],
        strategy:     ['estrategi', 'hoja de ruta', 'roadmap', 'plan', 'planificación'],
        automation:   ['automatiz', 'automat', 'proceso', 'flujo'],
        change:       ['gestión del cambio', 'cambio', 'transformación', 'liderazgo'],
        workshops:    ['taller', 'formación', 'curso', 'ingeniería de prompts'],
        website:      ['website', 'sitio web', 'página web', 'landing page', 'webdesign', 'hosting', 'ssl', 'websprint'],
        pricing:      ['precio', 'coste', 'paquete', 'cuánto', 'presupuesto', 'pagar'],
        starter:      ['starter', 'entrada', '2999', '2.999'],
        professional: ['professional', 'crecimiento', '7999', '7.999'],
        enterprise:   ['enterprise', 'escala completa', '18999', '18.999', 'grande', 'completo'],
        about:        ['sobre hanna', 'quién es', 'experiencia', 'certificación', 'portugal', 'cascais', 'remoto'],
        contact:      ['contacto', 'contactar', 'llamada', 'correo', 'escribir', 'ponerse en contacto']
      }
    },

    pt: {
      toggle_label: 'Abrir chat',
      title: 'Assistente HWaiHub',
      subtitle: 'Questões sobre serviços e pacotes',
      placeholder: 'A tua pergunta…',
      send: '→',
      greeting: 'Olá! 👋 Posso responder questões sobre os serviços, pacotes e tudo relacionado com a HWaiHub. Em que posso ajudar?',
      quick_start: ['Serviços', 'Pacotes e Preços', 'Sobre Hanna', 'Contacto'],
      responses: {
        services: {
          text: '**HWaiHub oferece quatro serviços principais:**\n\n🧭 Estratégia de IA & Roadmap\n⚙️ Automatização de Processos\n🧑‍💼 Gestão da Mudança\n🎓 Workshops & Formações\n\nSobre qual gostarias de saber mais?',
          chips: ['Estratégia de IA', 'Automatização', 'Gestão da Mudança', 'Workshops']
        },
        strategy:     { text: '🧭 **Estratégia de IA & Roadmap**\n\nDa análise do estado atual ao plano de ação priorizado — sem excesso tecnológico, com impacto real no negócio.\n\n✓ Avaliação de maturidade em IA\n✓ Priorização de casos de uso (baseada em ROI)\n✓ Seleção de tecnologia & triagem de fornecedores\n✓ Roadmap de implementação com marcos', chips: ['Pacotes e Preços', 'Contacto'] },
        automation:   { text: '⚙️ **Automatização de Processos**\n\nEliminar tarefas repetitivas, reduzir erros e libertar as equipas — onde tem mais impacto.\n\n✓ Análise de processos & potencial de automatização\n✓ Implementação (e-mail, documentos, fluxos)\n✓ Configuração conforme RGPD\n✓ Dashboard de monitorização & KPIs', chips: ['Pacotes e Preços', 'Contacto'] },
        change:       { text: '🧑‍💼 **Gestão da Mudança**\n\nA IA não falha por causa da tecnologia — falha pela falta de adesão. Guio líderes e equipas pela mudança: de forma estratégica, empática e sustentável.\n\n✓ Análise de stakeholders & estratégia de comunicação\n✓ Coaching de liderança\n✓ Gestão de resistências\n✓ Mudança cultural & mentalidade de IA', chips: ['Pacotes e Preços', 'Contacto'] },
        workshops:    { text: '🎓 **Workshops & Formações**\n\nWorkshops práticos para equipas de liderança, departamentos ou toda a empresa.\n\n✓ Fundamentos de IA para não técnicos\n✓ Engenharia de prompts (ChatGPT, Copilot e mais)\n✓ Formações intensivas de ferramentas específicas\n✓ Módulos de e-learning & acompanhamento', chips: ['Pacotes e Preços', 'Contacto'] },
        website: { text: '🌐 **Pacotes de Website**\n\n**Starter — Website**\n✓ Identidade de marca completa\n✓ Website de uma página ou landing page\n✓ Copywriting profissional\n✓ Adaptado para mobile e carregamento rápido\n✓ 1 idioma incluído\n✓ 1 formulário de contacto\n\n📦 Pacote de manutenção: **€79/mês**\n✓ 5 pedidos de alteração/mês\n✓ Suporte por chat\n✓ Pronto em 7 dias\n✓ Hosting seguro & certificado SSL\n✓ Backups automáticos e atualizações técnicas\n\n——————————————\n\n**Professional — Website**\n✓ Identidade de marca completa\n✓ Website personalizado até 5 páginas\n✓ Copywriting profissional\n✓ Adaptado para mobile e carregamento rápido\n✓ 2 idiomas incluídos\n✓ 2 formulários de contacto\n✓ 1 coleção CMS\n✓ 3 integrações\n✓ SEO incluído\n\n📦 Pacote de manutenção: **€179/mês**\n✓ Pedidos de alteração ilimitados\n✓ 3 lugares na app Websprint\n✓ Suporte por chat\n✓ Pronto em 14 dias', chips: ['Pacotes e Preços', 'Contacto'] },
        pricing: {
          text: '💼 **Pacotes e Preços**\n\n**Starter** — a partir de €2.999 (único)\nPrimeiro passo em IA: 1 automatização, análise de processos, 2 semanas de acompanhamento\n\n**Professional** — a partir de €7.999 + €600/mês\nMais popular: 3–5 automatizações, dashboard, suporte prioritário\n\n**Enterprise** — a partir de €18.999\nTransformação digital completa, consultor de IA dedicado\n\nTodos os preços líquidos mais IVA · Primeira conversa gratuita',
          chips: ['Starter', 'Professional', 'Enterprise', 'Contacto']
        },
        starter:      { text: '**Starter — a partir de €2.999**\n*(único, líquido mais IVA)*\n\n✓ 1 automatização de IA configurada\n✓ Análise de processos\n✓ p.ex. assistente de e-mail ou calendário\n✓ 2 semanas de acompanhamento\n✓ Guia passo a passo\n\nIdeal para dar o primeiro passo em IA.', chips: ['Professional', 'Enterprise', 'Contacto'] },
        professional: { text: '**Professional — a partir de €7.999 + €600/mês**\n*(líquido mais IVA)*\n\n✓ 3–5 automatizações de IA\n✓ Análise completa de processos\n✓ E-mail + calendário + faturas\n✓ Dashboard de visão geral\n✓ Reunião mensal de otimização\n✓ Suporte prioritário (24h)\n✓ Documentação RGPD incluída', chips: ['Starter', 'Enterprise', 'Contacto'] },
        enterprise:   { text: '**Enterprise — a partir de €18.999**\n*(personalizado, líquido mais IVA)*\n\n✓ Transformação digital completa\n✓ Automatizações ilimitadas\n✓ Implementação end-to-end\n✓ Consultor de IA dedicado\n✓ Formação de colaboradores incluída\n✓ Modelo de retainer disponível', chips: ['Starter', 'Professional', 'Contacto'] },
        about:   { text: '👩‍💼 **Hanna Winkelmann**\nConsultora de IA & Transformação Digital · Fundadora, HWaiHub\n\nCom mais de uma década de experiência, guia empresas da estratégia de IA à implementação — sem buzzwords, com resultados mensuráveis.\n\n📍 Cascais, Portugal — Remoto e presencial\n\nCertificações: Microsoft Azure · CSPO · SAS · PRINCE2 Agile', chips: ['Serviços', 'Contacto'] },
        contact: { text: '📬 **Entra em contacto**\n\nA primeira conversa gratuita dura 30 minutos — sem compromisso.\n\n✉️ hallo@hwaihub.com\n\nOu usa o formulário de contacto na página inicial. Normalmente respondo em até 24 horas.', chips: ['Ir ao formulário →'] },
        fallback: { text: 'Boa pergunta — talvez eu seja um pouco limitado aqui 😊 A Hanna responderia de bom grado diretamente:\n\n✉️ hallo@hwaihub.com', chips: ['Serviços', 'Pacotes e Preços', 'Contacto'] }
      },
      keywords: {
        services:     ['serviç', 'ofert', 'o que faz', 'o que oferece', 'consultori'],
        strategy:     ['estratégi', 'roadmap', 'plan', 'planeament'],
        automation:   ['automatiz', 'automat', 'process', 'fluxo'],
        change:       ['gestão da mudança', 'mudança', 'transformaç', 'liderança'],
        workshops:    ['workshop', 'formaç', 'curso', 'engenharia de prompts'],
        website:      ['website', 'página web', 'landing page', 'webdesign', 'hosting', 'ssl', 'websprint', 'site'],
        pricing:      ['preç', 'cust', 'pacote', 'quanto', 'orçamento', 'pagar'],
        starter:      ['starter', 'entrada', '2999', '2.999'],
        professional: ['professional', 'crescimento', '7999', '7.999'],
        enterprise:   ['enterprise', 'escala total', '18999', '18.999'],
        about:        ['sobre hanna', 'quem é', 'experiência', 'certificaç', 'portugal', 'cascais', 'remoto'],
        contact:      ['contacto', 'contactar', 'conversa', 'e-mail', 'escrever', 'entrar em contacto']
      }
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  function getLang() {
    var l = (typeof localStorage !== 'undefined' && localStorage.getItem('hw_lang')) || 'en';
    return CB[l] ? l : 'en';
  }

  function renderText(raw) {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function matchTopic(input, lang) {
    var lower = input.toLowerCase();
    var kw = CB[lang].keywords;
    var order = ['starter','professional','enterprise','strategy','automation','change','workshops','website','pricing','services','about','contact'];
    for (var i = 0; i < order.length; i++) {
      var topic = order[i];
      var words = kw[topic];
      for (var j = 0; j < words.length; j++) {
        if (lower.indexOf(words[j]) !== -1) return topic;
      }
    }
    // chip-label shortcuts
    var chipMap = {
      // de
      'leistungen':'services','pakete & preise':'pricing','pakete':'pricing','über hanna':'about','kontakt':'contact',
      'ki-strategie':'strategy','ki strategie':'strategy','automatisierung':'automation',
      'change management':'change','workshops':'workshops','starter':'starter','professional':'professional','enterprise':'enterprise',
      'zum kontaktformular →':'contact',
      // en
      'services':'services','packages & pricing':'pricing','packages':'pricing','about hanna':'about','contact':'contact',
      'ai strategy':'strategy','automation':'automation','to contact form →':'contact',
      // pl
      'usługi':'services','pakiety i ceny':'pricing','o hannie':'about',
      'strategia ai':'strategy','automatyzacja':'automation','zarządzanie zmianą':'change','warsztaty':'workshops',
      'do formularza kontaktowego →':'contact',
      // pt
      'serviços':'services','pacotes e preços':'pricing','sobre hanna':'about',
      'estratégia de ia':'strategy','automação':'automation','gestão de mudanças':'change',
      'ir ao formulário →':'contact',
      // es
      'servicios':'services','paquetes y precios':'pricing',
      'estrategia de ia':'strategy','automatización':'automation','gestión del cambio':'change','talleres':'workshops',
      'al formulario de contacto →':'contact'
    };
    var key = Object.keys(chipMap).find(function(k){ return lower === k; });
    return key ? chipMap[key] : 'fallback';
  }

  // ── CSS ───────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#hw-chat-widget{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9000;font-family:inherit;}',
    '#hw-chat-toggle{width:56px;height:56px;border-radius:50%;background:var(--purple,#7B2FBE);border:none;cursor:pointer;',
    'box-shadow:0 4px 20px rgba(123,47,190,.4);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;}',
    '#hw-chat-toggle:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(123,47,190,.5);}',
    '#hw-chat-toggle svg{width:26px;height:26px;fill:#fff;}',
    '#hw-chat-window{position:absolute;bottom:68px;right:0;width:360px;max-width:calc(100vw - 2rem);',
    'background:#1a1a2e;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.5);',
    'display:flex;flex-direction:column;overflow:hidden;',
    'transform-origin:bottom right;transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .2s;}',
    '#hw-chat-window.hw-hidden{transform:scale(.8) translateY(12px);opacity:0;pointer-events:none;}',
    '#hw-chat-header{padding:1rem 1.1rem;background:linear-gradient(135deg,var(--purple,#7B2FBE),#5b1fa0);',
    'display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}',
    '.hw-header-info{display:flex;align-items:center;gap:.7rem;}',
    '.hw-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.15);',
    'display:flex;align-items:center;justify-content:center;font-size:1.1rem;}',
    '.hw-header-title{font-size:.95rem;font-weight:700;color:#fff;line-height:1.2;}',
    '.hw-header-sub{font-size:.72rem;color:rgba(255,255,255,.7);}',
    '#hw-chat-close{background:none;border:none;color:rgba(255,255,255,.7);font-size:1.1rem;cursor:pointer;',
    'padding:.2rem .4rem;border-radius:6px;transition:color .15s;line-height:1;}',
    '#hw-chat-close:hover{color:#fff;}',
    '#hw-chat-messages{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem;',
    'max-height:340px;min-height:200px;scroll-behavior:smooth;}',
    '#hw-chat-messages::-webkit-scrollbar{width:4px;}',
    '#hw-chat-messages::-webkit-scrollbar-track{background:transparent;}',
    '#hw-chat-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px;}',
    '.hw-msg{max-width:88%;display:flex;flex-direction:column;gap:.3rem;}',
    '.hw-msg-bot{align-self:flex-start;}',
    '.hw-msg-user{align-self:flex-end;}',
    '.hw-bubble{padding:.65rem .85rem;border-radius:14px;font-size:.82rem;line-height:1.55;word-break:break-word;}',
    '.hw-msg-bot .hw-bubble{background:#252542;color:#e8e8f5;border-bottom-left-radius:4px;}',
    '.hw-msg-user .hw-bubble{background:var(--purple,#7B2FBE);color:#fff;border-bottom-right-radius:4px;}',
    '.hw-chips{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.25rem;}',
    '.hw-chip{background:rgba(123,47,190,.25);border:1px solid rgba(123,47,190,.5);color:#c4a0f0;',
    'border-radius:20px;padding:.3rem .75rem;font-size:.74rem;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap;}',
    '.hw-chip:hover{background:rgba(123,47,190,.55);color:#fff;}',
    '.hw-typing{display:flex;align-items:center;gap:.25rem;padding:.5rem .7rem;background:#252542;border-radius:12px;',
    'border-bottom-left-radius:4px;width:fit-content;}',
    '.hw-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);animation:hwBounce 1s infinite;}',
    '.hw-dot:nth-child(2){animation-delay:.15s;} .hw-dot:nth-child(3){animation-delay:.3s;}',
    '@keyframes hwBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',
    '#hw-chat-input-row{padding:.75rem;border-top:1px solid rgba(255,255,255,.08);',
    'display:flex;gap:.5rem;flex-shrink:0;background:#14142a;}',
    '#hw-chat-input{flex:1;background:#252542;border:1px solid rgba(255,255,255,.1);border-radius:10px;',
    'padding:.55rem .8rem;color:#e8e8f5;font-size:.82rem;outline:none;transition:border-color .15s;font-family:inherit;}',
    '#hw-chat-input:focus{border-color:rgba(123,47,190,.6);}',
    '#hw-chat-input::placeholder{color:rgba(255,255,255,.3);}',
    '#hw-chat-send{background:var(--purple,#7B2FBE);border:none;border-radius:10px;color:#fff;',
    'width:38px;height:38px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;transition:opacity .15s;}',
    '#hw-chat-send:hover{opacity:.85;}',
    '@media(max-width:480px){#hw-chat-window{width:calc(100vw - 2rem);right:0;}}'
  ].join('');
  document.head.appendChild(style);

  // ── Widget HTML ───────────────────────────────────────────────
  var widget = document.createElement('div');
  widget.id = 'hw-chat-widget';
  widget.innerHTML = [
    '<button id="hw-chat-toggle" aria-label="Chat">',
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    '<path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>',
    '</svg></button>',
    '<div id="hw-chat-window" class="hw-hidden">',
    '<div id="hw-chat-header">',
    '<div class="hw-header-info"><div class="hw-avatar">🤖</div>',
    '<div><div class="hw-header-title" id="hw-title"></div>',
    '<div class="hw-header-sub" id="hw-subtitle"></div></div></div>',
    '<button id="hw-chat-close" aria-label="Close">✕</button>',
    '</div>',
    '<div id="hw-chat-messages"></div>',
    '<div id="hw-chat-input-row">',
    '<input id="hw-chat-input" type="text" autocomplete="off"/>',
    '<button id="hw-chat-send">→</button>',
    '</div></div>'
  ].join('');
  document.body.appendChild(widget);

  // ── State & elements ──────────────────────────────────────────
  var isOpen = false;
  var greeted = false;
  var win     = document.getElementById('hw-chat-window');
  var msgs    = document.getElementById('hw-chat-messages');
  var input   = document.getElementById('hw-chat-input');
  var toggle  = document.getElementById('hw-chat-toggle');
  var closeBtn= document.getElementById('hw-chat-close');

  function updateLabels() {
    var t = CB[getLang()];
    document.getElementById('hw-title').textContent    = t.title;
    document.getElementById('hw-subtitle').textContent = t.subtitle;
    input.placeholder = t.placeholder;
  }

  function addMessage(text, isUser, chips) {
    var msg = document.createElement('div');
    msg.className = 'hw-msg ' + (isUser ? 'hw-msg-user' : 'hw-msg-bot');
    var bubble = document.createElement('div');
    bubble.className = 'hw-bubble';
    bubble.innerHTML = renderText(text);
    msg.appendChild(bubble);
    if (!isUser && chips && chips.length) {
      var row = document.createElement('div');
      row.className = 'hw-chips';
      chips.forEach(function(label) {
        var chip = document.createElement('button');
        chip.className = 'hw-chip';
        chip.textContent = label;
        chip.addEventListener('click', function() {
          if (label === CB[getLang()].responses.contact.chips[0] ||
              label === 'Zum Kontaktformular →' || label === 'To contact form →' ||
              label === 'Do formularza kontaktowego →' || label === 'Ir ao formulário →' ||
              label === 'Al formulario de contacto →') {
            window.location.href = 'index.html#contact';
            return;
          }
          handleInput(label);
        });
        row.appendChild(chip);
      });
      msg.appendChild(row);
    }
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping(cb) {
    var el = document.createElement('div');
    el.className = 'hw-msg hw-msg-bot';
    el.innerHTML = '<div class="hw-typing"><div class="hw-dot"></div><div class="hw-dot"></div><div class="hw-dot"></div></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function() { msgs.removeChild(el); cb(); }, 600);
  }

  function handleInput(text) {
    if (!text.trim()) return;
    addMessage(text, true);
    input.value = '';
    var lang  = getLang();
    var topic = matchTopic(text, lang);
    var resp  = CB[lang].responses[topic] || CB[lang].responses.fallback;
    showTyping(function() {
      addMessage(resp.text, false, resp.chips);
    });
  }

  function openChat() {
    isOpen = true;
    win.classList.remove('hw-hidden');
    updateLabels();
    if (!greeted) {
      greeted = true;
      var lang = getLang();
      var t = CB[lang];
      setTimeout(function() {
        addMessage(t.greeting, false, t.quick_start);
      }, 200);
    }
    setTimeout(function() { input.focus(); }, 300);
  }

  function closeChat() {
    isOpen = false;
    win.classList.add('hw-hidden');
  }

  // ── Events ────────────────────────────────────────────────────
  toggle.addEventListener('click', function() { isOpen ? closeChat() : openChat(); });
  closeBtn.addEventListener('click', closeChat);

  document.getElementById('hw-chat-send').addEventListener('click', function() {
    handleInput(input.value);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleInput(input.value);
  });

  // Sync language when user switches
  var _origSetLang = typeof window.setLang === 'function' ? window.setLang : null;
  if (_origSetLang) {
    window.setLang = function(lang) {
      _origSetLang(lang);
      if (isOpen) updateLabels();
    };
  }
})();
