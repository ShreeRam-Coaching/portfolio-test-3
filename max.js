/* Maximalist layer: progress bar, giant words, ticker strips, badges, footer name */
(function () {
  var main = document.querySelector('main');
  if (!main) return;
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function hide(e) { e.setAttribute('aria-hidden', 'true'); return e; }
  var hero = document.getElementById('top'), prob = document.getElementById('problems'), sol = document.getElementById('solution');
  var work = document.getElementById('work'), contact = document.getElementById('contact'), foot = document.querySelector('footer');

  // scroll progress bar
  var bar = hide(mk('div', 'prog')); document.body.appendChild(bar);
  function prog() { var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, (window.pageYOffset || 0) / h) : 0).toFixed(4) + ')'; }
  addEventListener('scroll', prog, { passive: true }); addEventListener('resize', prog); prog();

  // headline highlight
  var h1 = hero && hero.querySelector('h1');
  if (h1) h1.innerHTML = h1.innerHTML.replace("Let's fix that.", '<mark class="hl">Let\'s fix that.</mark>');

  // giant outlined words
  function gw(sec, txt, cls) { if (sec) sec.appendChild(hide(mk('div', 'gw ' + cls, txt))); }
  gw(hero, 'WEBSITES', 'g-hero'); gw(prob, 'PROBLEMS?', 'g-prob'); gw(sol, '3 STEPS', 'g-sol'); gw(contact, 'HELLO', 'g-hello');
  [].forEach.call(document.querySelectorAll('.band'), function (b, i) { gw(b, '0' + (i + 1), 'g-num'); });

  // ticker strips between sections
  function strip(text, cls, before) {
    if (!before) return;
    var line = ''; for (var k = 0; k < 5; k++) line += text + ' \u2726 ';
    var s = hide(mk('div', 'strip ' + cls, '<div><span>' + line + '</span><span>' + line + '</span></div>'));
    before.parentNode.insertBefore(s, before);
  }
  strip('SELECTED WORK \u2726 CONCEPT WEBSITES \u2726 SCROLL DOWN', 'rv', work);
  strip("LET'S TALK \u2726 FREE DEMO \u2726 YOU PAY NOTHING TO SEE IT", 'ch', contact);

  // spinning badges
  var bid = 0;
  function badge(parent, text, href, arrow, ext) {
    if (!parent) return; bid++;
    var a = mk('a', 'badge',
      '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="bdg' + bid + '" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>' +
      '<text><textPath href="#bdg' + bid + '" textLength="280" lengthAdjust="spacing">' + text + '</textPath></text></svg><b>' + arrow + '</b>');
    a.href = href; a.tabIndex = -1; hide(a);
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    parent.appendChild(a);
  }
  badge(hero, 'AVAILABLE FOR NEW PROJECTS \u2726 SEE MY WORK \u2726 ', '#work', '\u2193', false);
  var wa = contact && contact.querySelector('.contacts a');
  badge(contact, "LET'S TALK \u2726 FREE DEMO \u2726 LET'S TALK \u2726 ", wa ? wa.href : '#contact', '\u2197', !!wa);

  // problems sticker
  if (prob) prob.appendChild(hide(mk('div', 'stk', 'Sound<br>familiar?')));

  // footer giant name
  if (foot) foot.appendChild(hide(mk('div', 'fbig', 'BHAVYA SHARMA')));

  // pause endless animations that are off-screen, to keep scrolling smooth
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('off', !e.isIntersecting); });
    }, { rootMargin: '150px' });
    [].forEach.call(document.querySelectorAll('.strip,.badge,.scard-marq,.scard-spin,.scard-chip,.scard-sticker'), function (el) { io.observe(el); });
  }
})();
