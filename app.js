(function () {
  var nav = document.getElementById('nav');
  function navS() { nav.classList.toggle('s', (window.pageYOffset || 0) > 10); }
  addEventListener('scroll', navS, { passive: true }); navS();

  // ---------- fade-up reveal ----------
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in2'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  } else { els.forEach(function (e) { e.classList.add('in2'); }); }

  // ---------- scroll-driven 3D mockup ----------
  var stage = document.getElementById('stage');
  var prob = document.getElementById('problems'), sol = document.getElementById('solution'), show = document.getElementById('showcase');
  var slot = document.getElementById('mslot');
  if (!stage || !prob || !sol || !show) return;

  var rig = document.getElementById('rig'), obj = document.getElementById('obj');
  var cap = document.getElementById('cap'), urlEl = document.getElementById('url'), hit = document.getElementById('hit');
  var imgs = [].slice.call(stage.querySelectorAll('.shots img'));
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;

  var HOME = 'bhavyaweb.runs-on.dev';
  var PROJ = [
    { n: 'Waves Gym', u: 'https://wavesfitness.vercel.app/', h: 'wavesfitness.vercel.app' },
    { n: 'JYRAN', u: 'https://jayraneats.vercel.app/', h: 'jayraneats.vercel.app' },
    { n: 'Randhawa Clinic', u: 'https://randhawaclinic.vercel.app/', h: 'randhawaclinic.vercel.app' }
  ];

  // pose keys: x(vw) y(vh) z(px) s rx ry rz sp(depth spread) op fl(flat) sh(internal shift) ws(stick to hero slot) gm(glide-around mix, phones)
  var K = ['x', 'y', 'z', 's', 'rx', 'ry', 'rz', 'sp', 'op', 'fl', 'sh', 'ws', 'gm'];
  function P(a) { var o = {}; K.forEach(function (k, i) { o[k] = a[i] === undefined ? 0 : a[i]; }); return o; }

  var W_ = [                                       // desktop / laptop
    P([22, -2, 0, .76, 10, -24, 1.5, 1.0, 1, 0, 0, 0]),     // hero: beside the text, angled
    P([8, 2, 60, .86, 16, -12, .5, 1.7, 1, 0, .6, 0]),       // mid: toward center, layers separate
    P([33, 10, -220, .50, 24, -50, -2, 1.1, .9, 0, 1, 0]),   // problems: further rotated, back and down
    P([37, 46, -520, .34, 38, -66, -4, .6, 0, 0, 1, 0]),     // exit: far back and down
    P([0, 0, 0, 1, 0, 0, 0, .25, 1, 1, 0, 0])                // my work: front-facing
  ];
  var N_ = [                                       // phone / tablet: object rides in its own hero slot
    P([0, 0, 0, .82, 18, -30, -1, 1.4, 1, 0, 0, 1, 0]),       // sits in the slot, angled, layers floating
    P([0, 0, 70, .94, 12, 16, 1, 2.3, 1, 0, .7, 1, 0]),       // slot at center: swings the other way, layers fan out
    P([0, 0, -40, .40, 6, -12, -1, 1.0, .6, 0, 1, 0, 1]),   // MINI: small, ghosted, roams all over the problems section BEHIND the text
    P([0, 0, -260, .20, 22, -40, -3, 1, 0, 0, 1, 0, 1]),      // shrinks a bit more and fades out as "Simple. Three steps." arrives
    P([0, 40, -300, .40, 34, -40, 0, .6, 0, 0, 1, 0, 0]),     // parked, hidden
    P([0, 0, 0, 1, 0, 0, 0, .2, 1, 1, 0, 0, 0])               // my work: front-facing
  ];

  var A = [], vh = innerHeight, wide = innerWidth >= 1000, iS = 5, iE = 6, slotC = 0;
  function topOf(el) { return el.getBoundingClientRect().top + (window.pageYOffset || 0); }
  function build() {
    vh = innerHeight; wide = innerWidth >= 1000;
    var sProb = topOf(prob), sSol = topOf(sol), sShow = topOf(show), H = show.offsetHeight, list;
    if (wide || !slot) {
      list = [
        [0, W_[0]], [sProb * .55, W_[1]], [sProb + vh * .2, W_[2]], [sSol + vh * .1, W_[3]],
        [sShow - vh * .4, W_[3]], [sShow, W_[3]], [sShow + H - vh, W_[3]]
      ];
      iS = 5; iE = 6; slotC = 0;
    } else {
      var sTop = topOf(slot), sH = slot.offsetHeight;
      slotC = sTop + sH / 2;
      list = [
        [0, N_[0]], [Math.max(1, sTop - vh * .8), N_[0]], [slotC - vh * .5, N_[1]],
        [slotC + vh * .22, N_[2]],                 // small by here, then keeps gliding through the whole problems section
        [sSol - vh * .65, N_[2]],
        [sSol - vh * .05, N_[3]],                  // gone when the solution section is on screen
        [sShow - vh * .4, N_[4]], [sShow, N_[4]], [sShow + H - vh, N_[4]]
      ];
      iS = 7; iE = 8;
    }
    for (var i = 1; i < list.length; i++) if (list[i][0] <= list[i - 1][0]) list[i][0] = list[i - 1][0] + 1;
    A = list;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // scroll position -> target values (piecewise interpolation, ~linear with a soft ease)
  function target(y) {
    var out = {}, n = A.length, i = 0;
    if (y >= A[n - 1][0]) {
      K.forEach(function (k) { out[k] = A[n - 1][1][k]; });
      out.ex = -(y - A[n - 1][0]);                 // after the showcase, scroll away with the page
    } else {
      while (i < n - 2 && y >= A[i + 1][0]) i++;
      var a = A[i], b = A[i + 1], t = clamp((y - a[0]) / (b[0] - a[0]), 0, 1);
      var e = t * .6 + (t * t * (3 - 2 * t)) * .4;
      K.forEach(function (k) { out[k] = a[1][k] + (b[1][k] - a[1][k]) * e; });
      out.ex = 0;
    }
    if (calm) { out.rx *= .4; out.ry *= .4; out.rz *= .4; }
    out.f = clamp((y - A[iS][0]) / (A[iE][0] - A[iS][0]), 0, 1) * 3;   // project preview progress
    return out;
  }

  var KD = K.concat(['ex', 'f']);
  var cur = {}, vs = 0, prevY = 0, mx = 0, my = 0, shotsOK = true, lastIdx = '', last = 0, running = false;
  function scrollNow() { return window.pageYOffset || 0; }
  function idleOn() { return !calm && scrollNow() < vh * .3; }
  function glideOn() { return !calm && !wide && cur.gm > .02 && cur.op > .02; }

  function alphaFor(i, f) {   // neighbours cross-fade around each boundary, so the screen is never empty
    var w = .14;
    var up = i === 0 ? 1 : clamp((f - (i - w)) / (2 * w), 0, 1);
    var down = i === 2 ? 1 : 1 - clamp((f - (i + 1 - w)) / (2 * w), 0, 1);
    return Math.min(up, down);
  }

  function apply(time) {
    var vw = innerWidth / 100, vhh = innerHeight / 100, sy = scrollNow();
    var w = idleOn() ? clamp(1 - sy / (vh * .3), 0, 1) : 0;           // idle fades out once you scroll
    var amp = wide ? 1 : 1.9;                                        // phones get a livelier idle sway
    var vn = clamp(vs / 2200, -1, 1) * (wide ? 1 : .55);             // scroll velocity: tilts + shears the layers (calmer on touch screens)
    var ry = cur.ry + w * (Math.sin(time * .5) * 1.8 * amp + mx * 4) + vn * 5;
    var rx = cur.rx + w * (Math.sin(time * .37 + 1) * 1.1 * amp - my * 2.5) - vn * 9;
    var bob = w * Math.sin(time * .6) * 6 * amp;
    var gm = clamp(cur.gm, 0, 1), gx = 0, gy = 0;
    if (gm > .001 && !wide) {                                        // phone mini mode: drift around the screen, driven by scroll + a slow idle float
      var ph = sy / vh;
      gx = gm * (Math.sin(ph * 2.1 + .6) * 30 + Math.sin(time * .5) * 6) * vw;   // roams freely, behind the text
      gy = gm * (Math.cos(ph * 1.7) * 30 + Math.sin(time * .7 + 1) * 5) * vhh;
      ry += gm * Math.cos(ph * 2.1 + .6) * 5;                       // turns as it swings left/right
    }
    var slotOff = cur.ws * Math.max(0, slotC - sy - vh / 2);         // phone: ride up with the hero slot, then hold at center and glide down
    var glide = wide ? 0 : vn * 16;                                  // phone: extra downward drift while scrolling
    rig.style.transform = 'translate3d(' + (cur.x * vw + gx).toFixed(1) + 'px,' + (cur.y * vhh + cur.ex + bob + slotOff + glide + gy).toFixed(1) + 'px,' + cur.z.toFixed(1) + 'px) scale(' + cur.s.toFixed(4) + ')';
    obj.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + (cur.rz + vn * -1.5).toFixed(2) + 'deg)';
    var fl = clamp(cur.fl, 0, 1);
    obj.style.setProperty('--sp', cur.sp.toFixed(3));
    obj.style.setProperty('--vl', (vn * 3).toFixed(3));
    obj.style.setProperty('--sh', cur.sh.toFixed(3));
    obj.style.setProperty('--fl', fl.toFixed(3));
    obj.style.setProperty('--fm', (shotsOK ? fl : 0).toFixed(3));
    obj.style.setProperty('--gl', (ry / 60 * 18).toFixed(1) + '%');
    var op = clamp(cur.op, 0, 1);
    stage.style.opacity = op.toFixed(3);
    stage.style.visibility = op < .01 ? 'hidden' : 'visible';

    // phones: the mini stays behind the page text (z-index 1 under the content) so the text is always readable
    stage.style.zIndex = '';

    var f = clamp(cur.f, 0, 2.999);
    imgs.forEach(function (im, i) { im.style.opacity = alphaFor(i, f).toFixed(3); });
    var idx = Math.floor(f);
    var inShow = fl > .5 ? 1 : 0, key = idx + ':' + inShow;
    if (key !== lastIdx) {
      lastIdx = key;
      urlEl.textContent = inShow ? PROJ[idx].h : HOME;
      cap.textContent = PROJ[idx].n + ' · View website';
      cap.href = PROJ[idx].u;
      hit.href = PROJ[idx].u;
    }
    var cop = clamp((fl - .6) / .4, 0, 1);
    cap.style.opacity = cop.toFixed(3);
    cap.style.pointerEvents = cop > .5 ? 'auto' : 'none';
    hit.style.pointerEvents = cop > .5 ? 'auto' : 'none';
  }

  var lastIdle = 0;
  function frame(now) {
    lastIdle = now;
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    var sy = scrollNow(), want = target(sy);
    var v = (sy - prevY) / dt; prevY = sy;
    vs += (v - vs) * (1 - Math.exp(-dt * 9));
    if (calm || Math.abs(vs) < .5) vs = 0;
    var k = calm ? 1 : 1 - Math.exp(-dt * (wide ? 7.5 : 5.5)), moving = false;   // smooth, physical follow
    KD.forEach(function (key) {
      var d = want[key] - cur[key];
      if (Math.abs(d) > .0006 * (Math.abs(want[key]) + 1)) moving = true;
      cur[key] += d * k;
    });
    apply(now / 1000);
    if (moving || vs !== 0 || idleOn() || glideOn()) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  // image fallback: if screenshots can't load, keep the dark mock visible
  var failed = 0;
  function fail() { failed++; if (failed >= imgs.length) shotsOK = false; kick(); }
  imgs.forEach(function (im) {
    im.addEventListener('error', fail);
    if (im.complete && im.naturalWidth === 0) fail();
  });

  rig.style.willChange = 'transform'; obj.style.willChange = 'transform';
  build();
  var first = target(scrollNow());
  KD.forEach(function (k) { cur[k] = first[k]; });
  prevY = scrollNow();
  if (!calm && scrollNow() < vh * .3) {                              // entrance: stack slides in from the right and fades up, never over the text
    cur.sp = first.sp * 1.6; cur.ry = first.ry - 12; cur.rx = first.rx + 5;
    cur.s = first.s * .9; cur.op = 0; cur.z = first.z - 100;
    if (wide) cur.x = first.x + 14;
  }
  apply(performance.now() / 1000);
  kick();

  addEventListener('scroll', kick, { passive: true });
  if (!touch && !calm) addEventListener('mousemove', function (e) {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; if (idleOn()) kick();
  });

  var lw = innerWidth, lh = innerHeight, raf = 0;
  function relayout() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { build(); kick(); }); }
  addEventListener('resize', function () {
    if (innerWidth === lw && touch && Math.abs(innerHeight - lh) < 160) return;   // ignore mobile address-bar resize
    lw = innerWidth; lh = innerHeight; relayout();
  });
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(document.body);
})();