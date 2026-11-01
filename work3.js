/* My work: sticky progress rail, word-by-word title reveal, heading fade (card stack motion is in stack.js) */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var wrap = document.getElementById('showcase');
  if (!wrap) return;
  var cards = [].slice.call(wrap.querySelectorAll('.scard'));
  if (!cards.length) return;
  var last = cards.length - 1;

  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  // ---------- 1. sticky progress rail (stays fixed while the cards stack) ----------
  var rail = mk('div', 'wrail', '<b class="n">01</b><span class="track"><i class="fill"></i></span><small>0' + cards.length + '</small>');
  rail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(rail);
  var num = rail.querySelector('.n'), fill = rail.querySelector('.fill');

  ScrollTrigger.create({
    trigger: wrap, start: 'top 55%', end: 'bottom 45%',
    onToggle: function (self) { rail.classList.toggle('on', self.isActive); }
  });
  ScrollTrigger.create({
    trigger: wrap, start: 'top top', end: 'bottom bottom',
    onUpdate: function (self) { gsap.set(fill, { scaleY: self.progress }); }
  });
  cards.forEach(function (card, i) {
    ScrollTrigger.create({
      trigger: card._mark, start: 'top 50%',
      endTrigger: cards[i + 1] ? cards[i + 1]._mark : wrap, end: i === last ? 'bottom 50%' : 'top 50%',
      onToggle: function (self) {
        if (!self.isActive) return;
        num.textContent = '0' + (i + 1);
        gsap.fromTo(num, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: 'power2.out' });
      }
    });
  });

  // ---------- 2. each card: words rise in, tags and text follow ----------
  cards.forEach(function (card) {
    var title = card.querySelector('.scard-title');
    if (title) {
      var words = title.textContent.trim().split(/\s+/);
      title.innerHTML = words.map(function (w) { return '<span class="tw"><span>' + w + '</span></span>'; }).join(' ');
    }
    var tw = card.querySelectorAll('.tw>span'),
        tags = card.querySelectorAll('.scard-tags li'),
        copy = card.querySelector('.scard-copy'),
        parts = [].slice.call(card.querySelectorAll('.scard-chip, .scard-sticker, .scard-spin'));
    gsap.set(tw, { yPercent: 115 });
    gsap.set(tags, { y: 18, opacity: 0 });
    if (copy) gsap.set(copy, { y: 30, opacity: 0 });
    gsap.set(parts, { scale: .4, opacity: 0 });
    var shown = false;
    function reveal() {                                            // safe to call many times; also fires if the card was scrolled past quickly
      if (shown) return; shown = true;
      var tl = gsap.timeline();
      tl.to(tw, { yPercent: 0, duration: .85, ease: 'power4.out', stagger: .09 }, 0)
        .to(tags, { y: 0, opacity: 1, duration: .5, ease: 'power2.out', stagger: .06 }, .1)
        .to(copy, { y: 0, opacity: 1, duration: .6, ease: 'power2.out' }, .35)
        .to(parts, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)', stagger: .08 }, .45);
    }
    ScrollTrigger.create({ trigger: card._mark, start: 'top 72%', end: 'bottom top', onEnter: reveal, onLeave: reveal, onEnterBack: reveal });
  });

  function scrollFx(k, phone, lite) {
  // (card tilt, push-back and chip parallax now live in stack.js)

  // ---------- 5. "My work" heading tilts back and fades as the cards arrive ----------
  var intro = document.querySelector('#work>.in');
  if (intro) gsap.fromTo(intro, { rotationX: 0, y: 0, scale: 1, opacity: 1, transformPerspective: 900 },
    { rotationX: 30 * k, y: -50, scale: .9, opacity: .15, transformPerspective: 900, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: '#work', start: 'center 35%', end: 'bottom top', scrub: true } });

  // (the three project rows below the cards have no scroll animation: they only use the CSS wipe reveal from style.css)
  }

  var mm3 = gsap.matchMedia();
  mm3.add('(min-width: 761px)', function () { scrollFx(1, false); });
  mm3.add('(max-width: 760px)', function () { scrollFx(.5, false, true); });


  // ---------- 7. mouse screens only: the big titles lean with your scroll speed, screenshots tilt toward the pointer ----------
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var skews = cards.map(function (c) { var t = c.querySelector('.scard-title'); return t ? gsap.quickTo(t, 'skewY', { duration: .55, ease: 'power3.out' }) : null; });
    ScrollTrigger.create({
      trigger: wrap, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) { var v = gsap.utils.clamp(-5, 5, self.getVelocity() / -350); skews.forEach(function (s) { if (s) s(v); }); },
      onLeave: function () { skews.forEach(function (s) { if (s) s(0); }); },
      onLeaveBack: function () { skews.forEach(function (s) { if (s) s(0); }); }
    });
    ScrollTrigger.addEventListener('scrollEnd', function () { skews.forEach(function (s) { if (s) s(0); }); });

    cards.forEach(function (card) {
      var img = card.querySelector('.scard-img'); if (!img) return;
      var rx = gsap.quickTo(img, 'rotationX', { duration: .5, ease: 'power3.out' }),
          ry = gsap.quickTo(img, 'rotationY', { duration: .5, ease: 'power3.out' });
      gsap.set(img, { transformPerspective: 900 });
      img.addEventListener('pointermove', function (e) {
        var r = img.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 10);
        rx(-((e.clientY - r.top) / r.height - .5) * 8);
      });
      img.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }

  addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
