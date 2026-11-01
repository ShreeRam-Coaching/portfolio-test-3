/* Maximalist layer 2: stat counters, bento, extra tickers, floating CTA, cursor, h2 highlights */
(function () {
  function mk(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; return e; }
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = 'https://wa.me/919350002593?text=Hi%20Bhavya%2C%20I%20want%20the%20free%20demo%20for%20my%20business';

  // highlight key words in headings
  [['#problems h2', 'these problems?'], ['#solution h2', 'Three steps.'], ['#work h2', 'My work'], ['#contact h2', 'your website']].forEach(function (p) {
    var h = document.querySelector(p[0]); if (!h) return;
    h.innerHTML = h.innerHTML.replace(p[1], '<mark class="hl">' + p[1] + '</mark>');
  });

  // hero stats with counters
  var slot = document.getElementById('mslot');
  var cta = document.querySelector('.hero .cta');
  if (cta) {
    var st = mk('div', 'stats', '<div class="stat"><b data-n="0" data-p="&#8377;">&#8377;0</b><small>Cost of a Demo</small></div><div class="stat"><b>24/7</b><small>Online Presence</small></div><div class="stat"><b data-n="100" data-s="%">0%</b><small>Responsive Design</small></div>');
    cta.parentNode.insertBefore(st, slot || cta.nextSibling);
    var done = false;
    function count() {
      if (done) return; done = true;
      [].forEach.call(st.querySelectorAll('b[data-n]'), function (b) {
        var n = +b.dataset.n, s = b.dataset.s || '', t0 = performance.now();
        (function f(t) { var k = Math.min(1, (t - t0) / 1200); b.textContent = (b.dataset.p || '') + Math.round(n * k) + s; if (k < 1) requestAnimationFrame(f); })(t0);
      });
    }
    if (calm) { [].forEach.call(st.querySelectorAll('b[data-n]'), function (b) { b.textContent = (b.dataset.p || '') + b.dataset.n + (b.dataset.s || ''); }); done = true; }
    else setTimeout(count, 600);
  }

  // bento "why me" section before #work
  var work = document.getElementById('work');
  if (work) {
    var sec = mk('section', 'sec light', '');
    sec.id = 'why';
    sec.innerHTML = '<div class="in"><p class="eyebrow reveal">Why me</p><h2 class="reveal">Built to bring <mark class="hl">more calls</mark></h2>' +
      '<div class="bento">' +
      '<div class="bx a reveal"><i>01</i><h3>Free demo first</h3><p>I make it before you pay anything. If you do not love it, you owe nothing.</p></div>' +
      '<div class="bx b reveal"><i>02</i><h3>Fast</h3><p>Pages that load quickly, even on slow phones.</p></div>' +
      '<div class="bx c reveal"><i>03</i><h3>Phone-first</h3><p>Looks right on every screen size.</p></div>' +
      '<div class="bx d reveal"><i>04</i><h3>Easy to call</h3><p>WhatsApp and call buttons, always one tap away.</p></div>' +
      '<div class="bx e reveal"><i>05</i><h3>Clear info</h3><p>Services, timings and contact in one place.</p></div>' +
      '</div></div>';
    work.parentNode.insertBefore(sec, work.previousElementSibling && work.previousElementSibling.classList.contains('strip') ? work.previousElementSibling : work);
    var gwd = mk('div', 'gw g-hello', 'WHY'); gwd.setAttribute('aria-hidden', 'true'); sec.appendChild(gwd);
    sec.style.position = 'relative'; sec.style.overflow = 'clip';
    // reveal for the new nodes
    if ('IntersectionObserver' in window && !calm) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in2'); io.unobserve(e.target); } }); }, { threshold: .15 });
      [].forEach.call(sec.querySelectorAll('.reveal'), function (el, i) { el.style.transitionDelay = (i % 5) * 70 + 'ms'; io.observe(el); });
    } else [].forEach.call(sec.querySelectorAll('.reveal'), function (el) { el.classList.add('in2'); });
  }

  // floating WhatsApp CTA
  var f = mk('a', 'fcta', 'Free demo \u2197'); f.href = WA; f.target = '_blank'; f.rel = 'noopener';
  document.body.appendChild(f);
  function fs() { f.classList.toggle('on', (window.pageYOffset || 0) > innerHeight * .6); }
  addEventListener('scroll', fs, { passive: true }); fs();

  // cursor blob
  if (!calm && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var c = mk('div', 'cur'); c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
    var x = 0, y = 0, tx = 0, ty = 0;
    addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    var run = false; function loop() { x += (tx - x) * .25; y += (ty - y) * .25; c.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; if (Math.abs(tx - x) + Math.abs(ty - y) > .5) requestAnimationFrame(loop); else run = false; }
    addEventListener('mousemove', function () { if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true });
    document.addEventListener('mouseover', function (e) { c.classList.toggle('big', !!e.target.closest('a,button')); });
  }

  // 3D tilt on cards: mouse hover and touch press
  if (!calm) {
    var SEL = '.bx,.stat';
    function tilt(e) {
      var t = e.target.closest && e.target.closest(SEL); if (!t) return;
      var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      t.style.transition = 'transform .08s'; t._tl = 1;
      t.style.transform = 'perspective(700px) rotateX(' + (-py * 18) + 'deg) rotateY(' + (px * 18) + 'deg) scale(1.04)';
    }
    function untilt() {
      [].forEach.call(document.querySelectorAll(SEL), function (t) {
        if (t._tl) { t._tl = 0; t.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)'; t.style.transform = ''; }
      });
    }
    document.addEventListener('pointerdown', tilt, { passive: true });
    document.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { if (e.target.closest(SEL)) tilt(e); else untilt(); } }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { document.addEventListener(n, untilt, { passive: true }); });
  }
})();
