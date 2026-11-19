/* Shared motion helpers (styles live in css/motion.css): scroll pop-ins with a small stagger,
   and a quick fade-out before following a link to another page of the site. */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (sessionStorage.getItem('m.arrive-zoom')) { sessionStorage.removeItem('m.arrive-zoom'); document.documentElement.classList.add('m-arrive-zoom'); } } catch (err) {}

  // blocks that pop in; elements already handled by older reveal code (.reveal / .one-reveal) are skipped
  var POP = ['.page-banner', '.section-title', '.one-proj', '.one-timeline > li', '.tree-br', '.trophy-slot', '.one-more',
             '.cls-quest', '.cls-badges li', '.chan', '.term', '.work-card', '.project-browser', '.cert', '.honor-item',
             '.experience-entry', '.skill-search', '.skill-toolbar', '.skill-garden', '.skill-dialogue',
             '.one-tabs', '.one-school', '.tree-top', '.tree-core', '.trophy-case-top', '.cls-sheet-top', '.cls-h'].join(',');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          el.style.setProperty('--m-d', Math.min(i++, 8) * 0.07 + 's'); // stagger blocks that arrive together
          el.classList.add('m-in');
        } else if (!el.closest('.zoom')) {
          // scrolled fully out of view: reset, so it plays its entrance again next time (from whichever side it comes back)
          el.classList.remove('m-in');
          el.classList.toggle('m-above', e.boundingClientRect.top < 0);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    [].forEach.call(document.querySelectorAll(POP), function (el) {
      if (el.closest('.reveal, .cls-gate, dialog')) return;
      el.classList.add('m-pop');
      io.observe(el);
    });
  }

  // leaving: the clicked link floats forward and zooms toward you while the page blurs away, then we go.
  // Same-site page links only; new tabs, downloads, in-page hashes and modifier-clicks are left alone.
  var STYLE = ['color', 'background', 'font', 'padding', 'border', 'border-radius', 'box-shadow', 'display', 'gap', 'align-items',
               'justify-content', 'text-align', 'letter-spacing', 'line-height', 'text-transform', 'text-decoration', 'text-shadow'];
  function ghostOf(a) {
    var r = a.getBoundingClientRect(), cs = getComputedStyle(a);
    var g = a.cloneNode(true);
    [g].concat([].slice.call(g.querySelectorAll('[id]'))).forEach(function (n) { n.removeAttribute('id'); });
    g.classList.remove('m-pop', 'm-in', 'm-above');
    [].forEach.call(g.querySelectorAll('.key'), function (k) { k.remove(); }); // nav shortcut badges
    var svgs = a.querySelectorAll('svg'), copies = g.querySelectorAll('svg');
    [].forEach.call(svgs, function (s, i) { var c = getComputedStyle(s); copies[i].style.cssText += ';width:' + c.width + ';height:' + c.height + ';flex:none'; });
    STYLE.forEach(function (k) { g.style.setProperty(k, cs.getPropertyValue(k)); }); // keep its look outside its usual parent
    g.classList.add('m-ghost');
    g.setAttribute('aria-hidden', 'true');
    g.style.left = r.left + 'px'; g.style.top = r.top + 'px'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.body.appendChild(g);
    var s = Math.max(1.25, Math.min(2.4, innerWidth * 0.5 / r.width, innerHeight * 0.4 / r.height));
    var dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2);
    g.animate([{ transform: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' }],
              { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    if (a.closest('.nav')) { // top nav: a quick plain fade, no zoom
      document.documentElement.classList.add('m-leave-plain');
      setTimeout(function () { location.href = a.href; }, 220);
      return;
    }
    ghostOf(a);
    try { sessionStorage.setItem('m.arrive-zoom', '1'); } catch (err) {} // the next page zooms in to match
    document.documentElement.classList.add('m-leave');
    setTimeout(function () { location.href = a.href; }, 460);
  });
  // coming back with the browser's back button restores the page from cache mid-zoom: undo it
  window.addEventListener('pageshow', function () {
    document.documentElement.classList.remove('m-leave', 'm-leave-plain');
    [].forEach.call(document.querySelectorAll('.m-ghost'), function (g) { g.remove(); });
  });
})();
