/* Smooth scrolling (Lenis, desktop only) + My work "reverse sticky scroll" cards (GSAP UI reverse-sticky-scroll, plain JS) */
(function () {
  var calm = false;   // My work animation always runs, even when the device asks for reduced motion
  var imgs = document.querySelectorAll('img');
  for (var n = 0; n < imgs.length; n++) imgs[n].decoding = 'async';       // big screenshots decode off the main thread

  var wrap = document.getElementById('showcase');
  var cards = wrap ? [].slice.call(wrap.querySelectorAll('.scard')) : [];

  // ---- maximalist dressing for each card: ticker, giant word, tags, browser frame, chips, sticker, spinning badge
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  cards.forEach(function (card, i) {
    var title = card.querySelector('.scard-title');
    var shot = card.querySelector('.scard-img');
    var body = card.querySelector('.scard-body');
    var num = card.querySelector('.scard-idx').textContent.trim();
    var name = title.textContent.trim();
    if (i === cards.length - 1) card.classList.add('lm');
    var mark = mk('div', 'scard-mark'); mark.setAttribute('aria-hidden', 'true');   // steady scroll reference
    var rs = mk('div', 'rs'), par = card.parentNode;                                  // the "section" that stays put while the next card swings in
    par.insertBefore(rs, card); rs.appendChild(card); par.insertBefore(mark, rs);
    card._mark = mark; card._rs = rs;

    // demo layout (GSAP UI reverse-sticky-scroll): tag row, rule, huge title, rule, details in columns
    var host = shot.getAttribute('data-host') || '';
    var top = mk('div', 'rv-top');
    top.innerHTML = '<p class="rv-tag"><span>' + num + ' \u2014 ' + name + '</span><span>Concept website \u00b7 ' + num + ' / 0' + cards.length + '</span></p><hr class="rv-hr">';
    var prog = mk('i', 'rv-prog'); prog.setAttribute('aria-hidden', 'true'); top.appendChild(prog);     // fills as you scroll through this card
    card.insertBefore(top, card.firstChild);
    var dim = mk('div', 'rv-dim'); dim.setAttribute('aria-hidden', 'true'); card.appendChild(dim);      // darkens while the next card covers this one
    card._prog = prog; card._dim = dim;
    var foot = mk('div', 'rv-foot');
    foot.innerHTML = '<hr class="rv-hr"><div class="rv-cols">' +
      '<div><p class="rv-label">Type</p><p class="rv-detail">Business website</p></div>' +
      '<div><p class="rv-label">Focus</p><p class="rv-detail">Web design \u00b7 Mobile-friendly</p></div>' +
      '<div><p class="rv-label">Live demo</p><p class="rv-detail">' + host + '</p></div></div>';
    card.appendChild(foot);

    body.insertBefore(mk('ul', 'scard-tags', '<li>Business website</li><li>Web design</li><li>Mobile-friendly</li><li>Concept</li>'), title);

    var stage = mk('div', 'scard-stage');
    shot.parentNode.insertBefore(stage, shot);
    stage.appendChild(shot);
    stage.appendChild(mk('span', 'scard-chip c1', 'Services'));
    stage.appendChild(mk('span', 'scard-chip c2', 'Timings &amp; contact'));
    stage.appendChild(mk('span', 'scard-sticker', 'Concept<br>\u2726'));
    var spin = mk('a', 'scard-spin',
      '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="scc' + i + '" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>' +
      '<text><textPath href="#scc' + i + '" textLength="280" lengthAdjust="spacing">VIEW WEBSITE \u2726 VIEW WEBSITE \u2726 </textPath></text></svg><b>\u2197</b>');
    spin.href = shot.href; spin.target = '_blank'; spin.rel = 'noopener'; spin.tabIndex = -1; spin.setAttribute('aria-hidden', 'true');
    stage.appendChild(spin);
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // ---- smooth scroll, kept in step with GSAP so pinned cards never lag or jitter
  var touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.Lenis && !calm && !touch) {
    var lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      anchors: { offset: 0 }                                              // menu links glide to the section
    });
    window.__lenis = lenis;                                               // lets the bottom menu pause scrolling while open
    lenis.on('scroll', ScrollTrigger.update);
    // window resize: go to the top, re-measure everything, come back (keeps the cards in place at any size)
    ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
    var rzT, lw = innerWidth, lh = innerHeight;
    addEventListener('resize', function () {
      if (innerWidth === lw && Math.abs(innerHeight - lh) < 150) return;   // phone address bar showing/hiding: do nothing
      lw = innerWidth; lh = innerHeight;
      clearTimeout(rzT);
      rzT = setTimeout(function () {
        var y = window.scrollY;
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.resize();
        ScrollTrigger.refresh();
        lenis.scrollTo(y, { immediate: true, force: true });
        ScrollTrigger.update();
      }, 250);
    });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ---- My work: reverse sticky scroll. Each card stays put (CSS sticky) while the next one swings in from the bottom-left corner
  function setStick() {                                                  // a card taller than the screen sticks once its bottom edge arrives
    cards.forEach(function (c) { c._rs.style.setProperty('--rs-top', (innerWidth <= 760 ? 0 : Math.min(0, innerHeight - c._rs.offsetHeight)) + 'px'); });   // phones: always pin at the top, so the title is what you see
  }
  setStick();
  addEventListener('load', setStick);
  ScrollTrigger.addEventListener('refreshInit', setStick);
  // the card animation itself (swing-in, push-back, 3D tilt, progress line) lives in stack.js

  addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
