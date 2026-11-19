/* Shared motion helpers (styles live in css/motion.css): scroll pop-ins with a small stagger,
   and a quick fade-out before following a link to another page of the site. */
(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  // leaving: fade out, then go (same-site page links only; new tabs, hashes, mail and modifier-clicks are left alone)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    document.documentElement.classList.add('m-leave');
    setTimeout(function () { location.href = a.href; }, 200);
  });
  // coming back via the browser's back button restores the page from cache, still faded: undo it
  window.addEventListener('pageshow', function () { document.documentElement.classList.remove('m-leave'); });
})();
