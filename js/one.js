/* One-page home: scroll progress + active section in the nav, experience
   tabs, project filters, mailto letter form, stepped reveal-on-scroll.
   Theme, boot screen, palette and footer year still come from main.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('one-js');

  /* ---------- scroll progress + active section ---------- */
  var bar = $('.one-progress i');
  var links = $$('.one-nav a');
  /* nav links open the full pages; data-sec names the home section each one lights up for */
  var sec = function (a) { return a.dataset.sec || a.getAttribute('href'); };
  var sections = links.map(function (a) { return $(sec(a)); }).filter(Boolean);
  var ticking = false;
  function onScroll() {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, h.scrollTop / max) : 0) + ')';
    var line = window.innerHeight * 0.35, current = sections[0];
    sections.forEach(function (s) { if (s.offsetParent && s.getBoundingClientRect().top <= line) current = s; }); // sections hidden by the chosen class don't count
    var last = sections[sections.length - 1];
    if (last && last.getBoundingClientRect().top < window.innerHeight * 0.6) current = last;
    links.forEach(function (a) {
      var on = current && sec(a) === '#' + current.id;
      a.classList.toggle('active', !!on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- experience tabs (WAI-ARIA tabs pattern) ---------- */
  var tabs = $$('.one-tabs [role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); selectTab(tabs[j], true); }
    });
  });

  /* ---------- character card: labels show in the dialog box ---------- */
  var card = $('.cc'), say = $('#ccSay');
  if (card && say) {
    var idle = say.textContent;
    var tell = function (e) {
      var el = e.target.closest('[aria-label]');
      say.textContent = el && card.contains(el) ? el.getAttribute('aria-label') : idle;
    };
    card.addEventListener('mouseover', tell);
    card.addEventListener('focusin', tell);
    card.addEventListener('mouseleave', function () { say.textContent = idle; });
  }

  /* ---------- skill tree: hover names the path, click marks a node learned ---------- */
  var treeBar = $('#treeBar'), nodes = $$('.tree-node');
  function trace(n, verb) {
    var holder = n.closest('[data-branch]'), branch = holder ? holder.dataset.branch : '';
    var learned = nodes.filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).length;
    if (treeBar) treeBar.textContent = 'SKY \u203a ' + branch + ' \u203a ' + n.textContent.replace(' \u2713', '') + (verb ? '  \u00b7  ' + verb : '') + '  \u00b7  ' + learned + ' / ' + nodes.length + ' learned';
  }
  /* each branch's skills show in one panel under the tree (not a drop-down over the page) */
  var branches = $$('.tree-br'), panel = null;
  if (branches.length) {
    panel = document.createElement('div'); panel.className = 'tree-panel'; panel.id = 'treePanel'; panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<div class="tree-panel-head"><span class="tree-panel-icon"></span><b></b><small></small></div>';
    branches.forEach(function (br) {
      var ul = br.querySelector('ul'), name = br.querySelector('.tree-root span').textContent;
      ul.dataset.branch = name; ul.hidden = true;
      if (br.dataset.show) ul.dataset.show = br.dataset.show; // follows the chosen class like its branch
      ul.style.setProperty('--k', getComputedStyle(br).getPropertyValue('--k'));
      panel.appendChild(ul);
      var root = br.querySelector('.tree-root');
      root.setAttribute('role', 'button'); root.setAttribute('aria-controls', 'treePanel');
      ['click', 'focus'].forEach(function (ev) { root.addEventListener(ev, function () { pickBranch(br); }); }); // not hover: scrolling under a resting mouse would flip it
      root.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickBranch(br); } });
    });
    $('.tree-branches').after(panel);
  }
  function pickBranch(br) {
    if (!br || br.classList.contains('is-open')) return;
    branches.forEach(function (b) { b.classList.toggle('is-open', b === br); b.querySelector('.tree-root').setAttribute('aria-expanded', String(b === br)); });
    var name = br.querySelector('.tree-root span').textContent, count = 0;
    [].forEach.call(panel.querySelectorAll('ul'), function (ul) { ul.hidden = ul.dataset.branch !== name; if (!ul.hidden) count = ul.querySelectorAll('.tree-node').length; });
    panel.style.setProperty('--k', getComputedStyle(br).getPropertyValue('--k'));
    panel.querySelector('.tree-panel-icon').innerHTML = br.querySelector('.tree-root [data-item]').innerHTML;
    panel.querySelector('b').textContent = name;
    panel.querySelector('small').textContent = count + ' skills \u00b7 click one to mark it learned';
    panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');
  }
  function firstVisible() { return branches.filter(function (b) { return b.offsetParent; })[0]; }
  if (panel) {
    pickBranch(firstVisible());
    // when the chosen class hides the open branch, open the first one still showing
    new MutationObserver(function () {
      var open = branches.filter(function (b) { return b.classList.contains('is-open'); })[0];
      if (!open || !open.offsetParent) { if (open) open.classList.remove('is-open'); pickBranch(firstVisible()); }
    }).observe(document.body, { attributes: true, attributeFilter: ['data-cls'] });
  }

  nodes.forEach(function (n) {
    n.addEventListener('mouseenter', function () { trace(n); });
    n.addEventListener('focus', function () { trace(n); });
    n.addEventListener('click', function () {
      var on = n.getAttribute('aria-pressed') !== 'true';
      n.setAttribute('aria-pressed', on);
      trace(n, on ? 'learned!' : 'unlearned');
    });
  });

  /* ---------- sfx: synthesized square-wave blips, no audio files ---------- */
  var AC = window.AudioContext || window.webkitAudioContext, ctx = null, muted = false;
  var sfxBtn = $('.cc-sfx');
  var HOT = 'a,button,.one-proj,.one-timeline>li,.cc-photo';
  try { muted = localStorage.getItem('parado.sfx') === 'off'; } catch (e) {}
  if (sfxBtn) sfxBtn.setAttribute('aria-pressed', !muted);
  function blip(freq, dur, vol, at) {
    if (muted || !ctx) return;
    var t = ctx.currentTime + (at || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
  }
  /* browsers only allow audio after a click or key press, so hover blips start after the first one */
  document.addEventListener('click', function (e) {
    if (!ctx && AC) ctx = new AC();
    var el = e.target.closest(HOT);
    if (el && el === sfxBtn) {
      muted = !muted;
      sfxBtn.setAttribute('aria-pressed', !muted);
      try { localStorage.setItem('parado.sfx', muted ? 'off' : 'on'); } catch (err) {}
    }
    if (!el) return;
    var tab = el.matches('[role="tab"],[data-filter]');
    blip(tab ? 520 : 660, 0.06, 0.04); blip(tab ? 780 : 990, 0.09, 0.04, 0.06);
  });
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest(HOT);
    if (el && !el.contains(e.relatedTarget)) blip(1320, 0.03, 0.012);
  });

  /* ---------- letter form -> mail app ---------- */
  var form = $('#contactForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('#formNote');
    var bad = null;
    ['name', 'email', 'message'].forEach(function (n) {
      var f = form.elements[n];
      var v = f.value.trim();
      var ok = v && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !bad) bad = f;
    });
    if (bad) {
      note.textContent = bad.name === 'email' ? 'That email address doesn’t look right.' : bad.name === 'message' ? 'Your letter is still empty.' : 'Please add your name.';
      note.classList.add('is-error');
      bad.focus();
      return;
    }
    note.classList.remove('is-error');
    note.textContent = 'Opening your email app…';
    var name = form.elements.name.value.trim();
    var body = form.elements.message.value.trim() + '\n\n— ' + name + ' (' + form.elements.email.value.trim() + ')';
    location.href = 'mailto:sky.parado@gmail.com?subject=' + encodeURIComponent('A letter from ' + name) + '&body=' + encodeURIComponent(body);
  });

  /* scroll entrances now live in js/motion.js (shared by every page) */

})();
