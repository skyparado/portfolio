/* Zoom-in details: clicking a project card or timeline entry lifts a copy of it to the
   centre of the screen, with everything else blurred behind it. Esc, x or a click outside
   zooms it back into place. Styles live in css/zoom.css. */
(function () {
  'use strict';
  var TARGETS = '.one-proj, .one-timeline > li, .work-card';
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VARS = ['--tape', '--q', '--project-color', '--c', '--tilt'];
  var open = null; // { overlay, card, src }

  function title(src) { var h = src.querySelector('h3, h4'); return h ? h.textContent.trim() : 'Details'; }

  function copyOf(src) {
    var card = src.cloneNode(true);
    [card].concat([].slice.call(card.querySelectorAll('[id]'))).forEach(function (n) { n.removeAttribute('id'); });
    card.classList.remove('m-pop', 'm-in', 'm-swap', 'one-reveal', 'is-in');
    card.classList.add('zoom-card');
    card.removeAttribute('tabindex'); card.removeAttribute('role');
    var cs = getComputedStyle(src);
    VARS.forEach(function (v) { var x = cs.getPropertyValue(v); if (x) card.style.setProperty(v, x.trim()); });
    var d = card.querySelector('details'); if (d) d.open = true;
    var hint = card.querySelector('.zoom-hint'); if (hint) hint.remove();
    if (src.matches('.one-timeline > li')) { // timeline styles hang off the list, so keep one around it
      var ol = document.createElement('ol'); ol.className = 'one-timeline zoom-list'; ol.appendChild(card); return { node: ol, card: card };
    }
    return { node: card, card: card };
  }

  function fly(card, from, reverse) {
    var to = card.getBoundingClientRect();
    var start = 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px) scale(' + from.width / to.width + ',' + from.height / to.height + ')';
    var frames = [{ transform: start, transformOrigin: '0 0' }, { transform: 'none', transformOrigin: '0 0' }];
    return card.animate(reverse ? frames.reverse() : frames, { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
  }

  function show(src) {
    if (open) return;
    var from = src.getBoundingClientRect();
    var overlay = document.createElement('div');
    overlay.className = 'zoom';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', title(src));
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'zoom-x'; x.setAttribute('aria-label', 'Close details'); x.innerHTML = '&times;';
    var stage = document.createElement('div'); stage.className = 'zoom-stage';
    var c = copyOf(src); stage.appendChild(c.node);
    overlay.append(x, stage);
    document.body.appendChild(overlay);
    document.documentElement.classList.add('zoom-open');
    src.style.visibility = 'hidden';
    open = { overlay: overlay, card: c.card, src: src };
    if (!calm) { overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' }); fly(c.card, from); }
    x.focus();
    x.addEventListener('click', hide);
    overlay.addEventListener('click', function (e) { if (!e.target.closest('.zoom-card')) hide(); });
  }

  function hide() {
    if (!open) return;
    var o = open; open = null;
    var finished = false;
    function done() {
      if (finished) return; finished = true;
      o.overlay.remove(); o.src.style.visibility = ''; document.documentElement.classList.remove('zoom-open');
      if (o.src.focus) o.src.focus({ preventScroll: true });
    }
    if (calm) return done();
    o.card.getAnimations().forEach(function (a) { a.cancel(); });
    o.overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in', fill: 'both' });
    fly(o.card, o.src.getBoundingClientRect(), true).onfinish = done;
    setTimeout(done, 450); // backup, in case the animation is slow to start on a busy device
  }

  // wire up the cards: keyboard-reachable, a small "+ details" hint, and the click
  [].forEach.call(document.querySelectorAll(TARGETS), function (el) {
    if (!el.matches('.work-card')) {
      el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-label', title(el) + ', show details');
      var hint = document.createElement('span'); hint.className = 'zoom-hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = '+ details';
      el.appendChild(hint);
      el.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); show(el); } });
    }
    el.addEventListener('click', function (e) {
      if (e.target.closest('a') || (e.target.closest('button') && !e.target.closest('summary'))) return; // links still go where they point
      if (e.target.closest('summary')) e.preventDefault(); // "Project details" zooms instead of dropping open
      show(el);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); }
    if (e.key === 'Tab') { e.preventDefault(); open.overlay.querySelector('.zoom-x').focus(); } // focus stays in the dialog
  });
})();
