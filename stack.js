/* My work: sticky card stack engine.
   ONE place owns every scroll-linked motion on the project cards, so nothing fights anything else.

   DESKTOP: each card sits pinned (CSS sticky, set up in work.js) while the next one swings in over it.
     IN    (card k)    swings up from the bottom-left corner and settles flat; its screenshot grows into place, tilts in 3D and the chips fly in
     REST  (card k)    while it sits pinned the screenshot slowly zooms and drifts
     OUT   (card k-1)  gets pushed back: shrinks, tilts a touch, darkens; its screenshot tilts away and the chips drift off

   PHONE: a deliberately light version so it stays smooth on a real phone. The cards still pin and the next one slides over,
     the card underneath just shrinks a little and darkens. No 3D tilt, no floating pieces, no per-image motion.

   Tuning lives in the T object below. */
(function () {
  var wrap = document.getElementById('showcase');
  if (!wrap || !window.gsap || !window.ScrollTrigger) return;
  var cards = [].slice.call(wrap.querySelectorAll('.scard'));
  if (cards.length < 2 || !cards[0]._rs) return;
  gsap.registerPlugin(ScrollTrigger);

  var last = cards.length - 1;

  // ---- dwell: a short rest where each card sits still and readable before the next one comes in (height set in work3.css)
  cards.forEach(function (c, i) {
    if (i === last) return;
    var d = document.createElement('div');
    d.className = 'rs-dwell';
    d.setAttribute('aria-hidden', 'true');
    c._rs.parentNode.insertBefore(d, c._rs.nextSibling);
    c.classList.add('has-next');
  });
  cards.forEach(function (c, i) { if (i > 0) c.classList.add('over'); });   // gets the soft shadow, because it lands on top of another card

  // ---- tuning (desktop only; the phone version is in the "phone" branch below)
  var T = {
    desk: { rot: 24, lift: 6, grow: .96, inEnd: 'top 18%', back: .93, backRot: -2.2, dim: .55, persp: 1000, tiltY: 24, tiltX: 11, push: 110, chipZ: [100, 70, 150, 170], imgIn: .84, zoom: 1.04, drift: 4, slide: 3.2, imgScale: 1.07 },
    phone: { rot: 9, rotX: 12, lift: 5, grow: .95, persp: 900, tiltY: 15, tiltX: 7, imgIn: .9, back: .94, backRot: -1.6, dim: .5, inEnd: 'top 20%', scrub: .4 }
  };

  var mm = gsap.matchMedia();
  mm.add({ phone: '(max-width: 760px)', desk: '(min-width: 761px)' }, function (ctx) {
    var phone = ctx.conditions.phone;

    // ===================== PHONE: light and smooth =====================
    if (phone) {
      var Q = T.phone;
      cards.forEach(function (card, i) {
        var next = cards[i + 1], dir = i % 2 ? -1 : 1, stage = card.querySelector('.scard-stage');
        gsap.set(card, { transformPerspective: Q.persp });
        if (stage) gsap.set(stage, { transformPerspective: Q.persp });
        if (i > 0) {
          // IN: the card lands tilted and settles flat; its screenshot swings in with a little 3D turn
          var tin = gsap.timeline({ defaults: { force3D: true }, scrollTrigger: { trigger: card._mark, start: 'top bottom', end: Q.inEnd, scrub: Q.scrub } });
          tin.fromTo(card, { rotation: Q.rot, rotationX: Q.rotX, yPercent: Q.lift, scale: Q.grow, transformOrigin: '0% 100%' }, { rotation: 0, rotationX: 0, yPercent: 0, scale: 1, transformOrigin: '0% 100%', ease: 'power2.out' }, 0);
          if (stage) tin.fromTo(stage, { rotationY: Q.tiltY * dir, rotationX: Q.tiltX, scale: Q.imgIn }, { rotationY: 0, rotationX: 0, scale: 1, ease: 'power3.out' }, 0);
        }
        if (next) {
          // the next card slides over this one: this one shrinks a little and darkens (only transform + opacity, both GPU-cheap)
          var tl = gsap.timeline({
            defaults: { immediateRender: false, force3D: true, ease: 'none' },
            scrollTrigger: { trigger: next._mark, start: 'top bottom', end: 'top top', scrub: Q.scrub }
          });
          tl.fromTo(card, { scale: 1, rotation: 0, transformOrigin: '0% 100%' }, { scale: Q.back, rotation: Q.backRot, transformOrigin: '0% 100%' }, 0);
          if (stage) tl.fromTo(stage, { rotationY: 0, rotationX: 0 }, { rotationY: -Q.tiltY * dir * .6, rotationX: -Q.tiltX * .6 }, 0);
          tl.fromTo(card._dim, { opacity: 0 }, { opacity: Q.dim }, 0);
        }
        // progress line under the tag row
        gsap.fromTo(card._prog, { scaleX: 0 }, {
          scaleX: 1, ease: 'none', force3D: true,
          scrollTrigger: { trigger: card._mark, start: 'top 60%', endTrigger: next ? next._mark : wrap, end: next ? 'top top' : 'bottom bottom', scrub: true }
        });
      });
      return;
    }

    // ===================== DESKTOP: full 3D version =====================
    var P = T.desk;
    var SC = window.__lenis ? true : .6;
    // Lenis already eases the scroll itself, so the tweens follow it 1:1 (extra smoothing on top is what made it float).

    cards.forEach(function (card, i) {
      var dir = i % 2 ? -1 : 1;
      var stage = card.querySelector('.scard-stage');
      var chips = ['.scard-chip.c1', '.scard-chip.c2', '.scard-sticker', '.scard-spin'].map(function (s) { return card.querySelector(s); });
      var c1 = chips[0], c2 = chips[1], sk = chips[2], sp = chips[3];

      if (stage) gsap.set(stage, { transformPerspective: P.persp });

      // ===== IN: this card lands on the one before it =====
      if (i > 0) {
        var tin = gsap.timeline({
          defaults: { force3D: true },
          scrollTrigger: { trigger: card._mark, start: 'top bottom', end: P.inEnd, scrub: SC }
        });
        tin.fromTo(card,
          { rotation: P.rot, yPercent: P.lift, scale: P.grow, transformOrigin: '0% 100%' },
          { rotation: 0, yPercent: 0, scale: 1, transformOrigin: '0% 100%', ease: 'power2.out' }, 0);
        if (stage) tin.fromTo(stage,
          { rotationY: P.tiltY * dir, rotationX: P.tiltX, z: -P.push, scale: P.imgIn },
          { rotationY: 0, rotationX: 0, z: 0, scale: 1, ease: 'power3.out' }, 0);
        chips.forEach(function (el, j) {
          if (el && P.chipZ[j]) tin.fromTo(el, { z: P.chipZ[j] }, { z: 0, ease: 'power3.out' }, 0);
        });
      }

      // ===== REST: card is pinned and still; the screenshot slowly zooms and drifts =====
      if (i < last && stage) {
        var gap = card._rs.nextSibling;
        gsap.fromTo(stage, { scale: 1, rotationY: 0 }, {
          scale: P.zoom, rotationY: -P.drift * dir, ease: 'none', force3D: true, immediateRender: false,
          scrollTrigger: { trigger: cards[i + 1]._mark, start: function () { return 'top bottom+=' + gap.offsetHeight; }, end: 'top bottom', scrub: SC }
        });
      }

      // ===== OUT: the next card covers this one =====
      if (i < last) {
        var tout = gsap.timeline({
          defaults: { force3D: true, immediateRender: false },
          scrollTrigger: { trigger: cards[i + 1]._mark, start: 'top bottom', end: 'top top', scrub: SC }
        });
        tout.fromTo(card,
          { scale: 1, rotation: 0, transformOrigin: '0% 100%' },
          { scale: P.back, rotation: P.backRot, transformOrigin: '0% 100%', ease: 'power1.in' }, 0);
        tout.fromTo(card._dim, { opacity: 0 }, { opacity: P.dim, ease: 'none' }, 0);
        if (stage) tout.fromTo(stage,
          { rotationY: -P.drift * dir, rotationX: 0, z: 0, scale: P.zoom },
          { rotationY: -P.tiltY * dir, rotationX: -P.tiltX * .8, z: -P.push, scale: .9, ease: 'none' }, 0);
        chips.forEach(function (el, j) {
          if (el && P.chipZ[j]) tout.fromTo(el, { z: 0 }, { z: P.chipZ[j], ease: 'none' }, 0);
        });
        if (c1) tout.fromTo(c1, { y: 0 }, { y: -60, ease: 'none' }, 0);
        if (c2) tout.fromTo(c2, { y: 0 }, { y: 50, ease: 'none' }, 0);
        if (sp) tout.fromTo(sp, { y: 0 }, { y: -90, ease: 'none' }, 0);
        if (sk) tout.fromTo(sk, { rotation: 12, y: 0 }, { rotation: 12 + 150 * dir, y: -40, ease: 'none' }, 0);
      }

      // ===== the website inside the frame slides slowly for the whole time the card is on screen =====
      var pic = card.querySelector('.scard-img img');
      if (pic) {
        gsap.set(pic, { scale: P.imgScale, transformOrigin: '50% 50%' });
        gsap.fromTo(pic, { yPercent: P.slide }, {
          yPercent: -P.slide, ease: 'none', force3D: true,
          scrollTrigger: { trigger: card._mark, start: i ? 'top bottom' : 'top 85%', endTrigger: i < last ? cards[i + 1]._mark : wrap, end: i < last ? 'top top' : 'bottom bottom', scrub: SC }
        });
      }

      // ===== progress line under the tag row =====
      var next = cards[i + 1];
      gsap.fromTo(card._prog, { scaleX: 0 }, {
        scaleX: 1, ease: 'none', force3D: true,
        scrollTrigger: { trigger: card._mark, start: 'top 60%', endTrigger: next ? next._mark : wrap, end: next ? 'top top' : 'bottom bottom', scrub: true }
      });
    });
  });

  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
