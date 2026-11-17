/* HWaiHub – Kontext-Schnittstelle für einen künftigen AI Advisor (Addendum V3.1, Kap. 9.2)
 * Liest nicht sensible Kontextsignale aus dem HTML. Speichert nichts dauerhaft,
 * sendet nichts, erstellt keine Profile. Ohne aktiven Advisor wird getContext()
 * nirgends aufgerufen. Das Ereignis "hwai:context" bleibt im Browser.
 */
(function () {
  'use strict';
  var state = { section: null, problem: null, topic: null };

  function getContext() {
    var body = document.body || {};
    return Object.freeze({
      locale: document.documentElement.getAttribute('lang') || 'de',
      page: body.getAttribute ? body.getAttribute('data-page-key') : null,
      section: state.section,
      problem: state.problem,
      topic: state.topic
    });
  }

  document.addEventListener('hwai:context', function (e) {
    var d = (e && e.detail) || {};
    if (typeof d.section === 'string') state.section = d.section.slice(0, 40);
    if (typeof d.problem === 'string') state.problem = d.problem.slice(0, 40);
    if (typeof d.topic === 'string') state.topic = d.topic.slice(0, 40);
  });

  window.HWaiHub = window.HWaiHub || {};
  window.HWaiHub.getContext = getContext;
})();
