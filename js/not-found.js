/* HWaiHub – Fehlerseite (404): Der Hoster liefert für jede unbekannte Adresse dieselbe Datei /404.html (Deutsch).
   Beginnt die aufgerufene Adresse mit /en/, geht es zur englischen Fehlerseite weiter. */
(function () {
  'use strict';
  if (/^\/en(\/|$)/.test(location.pathname) && location.pathname !== '/en/404.html') location.replace('/en/404.html');
})();
