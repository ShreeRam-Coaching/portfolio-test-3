/* Bottom navigation: expands into a full menu, shows which section you are in */
(function () {
  var nav = document.getElementById('bnav');
  if (!nav) return;
  var btn = nav.querySelector('.bnav-btn'), panel = nav.querySelector('.bnav-panel'), now = document.getElementById('bnav-now');
  var links = [].slice.call(nav.querySelectorAll('.bnav-links a'));
  var scrim = document.querySelector('.bnav-scrim');
  var open = false;

  panel.inert = true;
  function lock(on) {
    if (window.__lenis) { on ? window.__lenis.stop() : window.__lenis.start(); }
    else document.documentElement.style.overflow = on ? 'hidden' : '';
  }
  function set(v) {
    open = v;
    nav.classList.toggle('open', v);
    btn.setAttribute('aria-expanded', v);
    btn.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    panel.setAttribute('aria-hidden', !v);
    panel.inert = !v;
    lock(v);
    if (v) setTimeout(function () { if (open && links[0]) links[0].focus({ preventScroll: true }); }, 350);
  }
  btn.addEventListener('click', function () { set(!open); if (!open) btn.focus({ preventScroll: true }); });
  if (scrim) scrim.addEventListener('click', function () { set(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { set(false); btn.focus({ preventScroll: true }); } });
  links.concat([].slice.call(nav.querySelectorAll('.bnav-logo, .bnav-contact a'))).forEach(function (a) {
    a.addEventListener('click', function () { if (open) set(false); });   // unlock first, so the smooth scroll can run
  });

  // which section are we in?
  var marks = [['top', 'Home'], ['problems', 'The problem'], ['solution', 'How it works'], ['why', 'Why me'], ['work', 'My work'], ['showcase', 'My work'], ['contact', 'Contact']];
  var linkFor = { top: 0, problems: 1, solution: 2, why: -1, work: 3, showcase: 3, contact: 4 };
  var lastId = '', ticking = false;
  function where() {
    ticking = false;
    var line = innerHeight * .4, cur = marks[0], el, r;
    for (var i = 0; i < marks.length; i++) {
      el = document.getElementById(marks[i][0]); if (!el) continue;
      r = el.getBoundingClientRect();
      if (r.top <= line) cur = marks[i];
    }
    var bands = document.querySelectorAll('.sec.band');       // the project rows below the cards belong to "My work"
    if (bands.length && bands[0].getBoundingClientRect().top <= line) {
      var c = document.getElementById('contact');
      if (!c || c.getBoundingClientRect().top > line) cur = ['showcase', 'My work'];
    }
    if (cur[0] === lastId) return;
    lastId = cur[0]; now.textContent = cur[1];
    var li = linkFor[cur[0]];
    links.forEach(function (a, i) { if (i === li) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  function tick() { if (!ticking) { ticking = true; requestAnimationFrame(where); } }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  addEventListener('load', tick);
  where();
})();
