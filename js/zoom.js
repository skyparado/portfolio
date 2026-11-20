/* Zoom-in details: clicking a project card or timeline entry lifts a copy of it to the
   centre of the screen, with everything else blurred behind it. Esc, x or a click outside
   zooms it back into place. Styles live in css/zoom.css. */
(function () {
  'use strict';
  var TARGETS = '.one-proj, .one-timeline > li, .work-card';
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var open = null; // { overlay, card, src }

  function title(src) { var h = src.querySelector('h3, h4'); return h ? h.textContent.trim() : 'Details'; }
  function txt(root, sel) { var n = root.querySelector(sel); return n ? n.textContent.trim() : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function svg(root, sel) { var n = root.querySelector(sel); return n ? n.outerHTML : ''; }
  function accent(src) { // the card's own colour, whichever variable it uses
    var cs = getComputedStyle(src);
    return ['--q', '--tape', '--project-color', '--c'].map(function (v) { return cs.getPropertyValue(v).trim(); }).filter(Boolean)[0] || 'var(--accent)';
  }

  // purpose-built detail cards, filled from whatever card was clicked
  function build(src) {
    var card = document.createElement('article');
    card.className = 'zoom-card zd';
    card.style.setProperty('--q', accent(src));
    if (src.matches('.one-timeline > li')) {
      var h4 = src.querySelector('h4'), org = txt(h4, 'span');
      var role = h4 ? h4.firstChild.textContent.trim() : '';
      var chapter = txt(src.closest('.one-frame') || document, '.one-school h3');
      var bullets = [].map.call(src.querySelectorAll('ul li'), function (li) { return '<li>' + esc(li.textContent.trim()) + '</li>'; }).join('');
      var now = src.classList.contains('is-now'), next = src.classList.contains('is-next');
      card.classList.add('zd-entry');
      card.innerHTML =
        '<header class="zd-head"><span class="zd-kicker">&#10022; QUEST LOG' + (chapter ? ' &middot; ' + esc(chapter) : '') + '</span></header>' +
        '<div class="zd-badge">' + svg(src, ':scope > [data-item] svg') + '</div>' +
        '<div class="zd-body"><h3>' + esc(role) + '</h3>' + (org ? '<p class="zd-org">' + esc(org) + '</p>' : '') +
        '<div class="zd-chips"><span class="zd-chip zd-when">&#9719; ' + esc(txt(src, '.one-when')) + '</span>' +
        '<span class="zd-chip ' + (next ? 'zd-next">&#9654; INCOMING' : now ? 'zd-now">&#9632; ACTIVE' : 'zd-done">&#10003; CLEARED') + '</span></div>' +
        (bullets ? '<ul class="zd-list">' + bullets + '</ul>' : '') + '</div>';
      return card;
    }
    // project cards (home board and projects page)
    var home = src.matches('.one-proj');
    var img = src.querySelector(home ? '.one-pic img' : '.work-shot');
    var icon = svg(src, home ? '.one-sticker svg' : '.work-banner [data-item] svg');
    var link = src.querySelector(home ? '.one-link[href]' : '.project-repo[href]');
    var tags = [].map.call(src.querySelectorAll(home ? '.one-tags li' : '.work-tags li'), function (t) { return '<li>' + esc(t.textContent.trim()) + '</li>'; }).join('');
    var desc = home ? txt(src, '.one-desc p:not(.one-win)') : txt(src, '.work-description');
    var win = txt(src, home ? '.one-win' : '.work-highlight');
    var more = home ? '' : [].map.call(src.querySelectorAll('.work-details h4'), function (h) {
      var p = h.nextElementSibling; return '<h4 class="zd-sub">' + esc(h.textContent.trim()) + '</h4>' + (p ? '<p>' + esc(p.textContent.trim()) + '</p>' : '');
    }).join('');
    card.classList.add('zd-proj');
    card.innerHTML =
      (img ? '<figure class="zd-shot"><img src="' + esc(img.getAttribute('src')) + '" alt="' + esc(img.alt) + '">' + (icon ? '<span class="zd-sticker">' + icon + '</span>' : '') + '</figure>' : '') +
      '<div class="zd-body"><div class="zd-chips"><span class="zd-chip zd-cat">' + esc(txt(src, home ? '.one-proj-top span' : '.work-card-top > span:not(.work-icon)')) + '</span>' +
      (txt(src, 'time') ? '<span class="zd-chip zd-when">&#9719; ' + esc(txt(src, 'time')) + '</span>' : '') + '</div>' +
      '<h3>' + esc(title(src)) + '</h3>' + (desc ? '<p class="zd-lead">' + esc(desc) + '</p>' : '') +
      (win ? '<p class="zd-win"><span aria-hidden="true">&#9733;</span> ' + esc(win) + '</p>' : '') + more +
      (tags ? '<ul class="zd-tags">' + tags + '</ul>' : '') +
      (link ? '<a class="zd-cta" href="' + esc(link.href) + '" target="_blank" rel="noopener">View repository <span aria-hidden="true">&#8599;</span></a>' : '') + '</div>';
    return card;
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
    var c = { card: build(src) }; stage.appendChild(c.card);
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
