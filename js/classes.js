/* Choose your class. Every load of the home page opens a full-screen picker (the last pick is
   marked); the pick is saved and shapes the home view until changed from the nav button. */
(function () {
  'use strict';
  var KEY = 'sky.class';
  var gate = document.getElementById('clsGate');
  if (!gate) return;
  var cards = [].slice.call(gate.querySelectorAll('.cls-card'));
  var sheets = [].slice.call(document.querySelectorAll('.cls-sheet'));
  var navName = document.getElementById('clsNavName');
  var opener = null;

  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(k) { try { localStorage.setItem(KEY, k); } catch (e) {} }
  function valid(k) { return cards.some(function (c) { return c.dataset.cls === k; }); }

  function apply(k) {
    var name = 'class';
    sheets.forEach(function (s) { var on = s.dataset.cls === k; s.hidden = !on; if (on) name = s.dataset.name; });
    var picked = valid(load()); // first-time visitors have no "last pick" to show
    cards.forEach(function (c) { c.classList.toggle('is-current', picked && c.dataset.cls === k); });
    if (navName) navName.textContent = name;
    var icon = document.querySelector('.cls-switch [data-item]'), sprite = document.querySelector('.cls-sheet:not([hidden]) .cls-sprite svg');
    if (icon && sprite) icon.innerHTML = sprite.outerHTML; // nav shows the chosen class's sprite
    document.body.dataset.cls = k;
    // if the open experience chapter was just hidden, fall back to Work
    var tab = document.querySelector('.one-tabs [role="tab"][aria-selected="true"]');
    if (tab && !tab.offsetParent) document.getElementById('tab-work').click();
    // skill tree counts follow what is visible
    var br = [].filter.call(document.querySelectorAll('.tree-br'), function (b) { return b.offsetParent; });
    var nodes = br.reduce(function (n, b) { return n + b.querySelectorAll('li').length; }, 0);
    var cmd = document.querySelector('#skills .one-cmd'), count = document.querySelector('.tree-count');
    if (cmd) cmd.textContent = nodes + ' nodes \u00b7 ' + br.length + ' branches';
    if (count) count.textContent = br.length + ' BRANCHES \u00b7 HOVER TO GROW';
  }

  function open() {
    opener = document.activeElement;
    gate.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    (gate.querySelector('.cls-card.is-current') || cards[0]).focus();
  }
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function enterMain() { // replay the page's arrival once the picker is gone (css/motion.css)
    var m = document.querySelector('main'); if (!m || calm) return;
    m.classList.remove('m-enter'); void m.offsetWidth; m.classList.add('m-enter');
  }
  function swapIn() { // items the new class reveals animate in
    if (calm) return;
    [].forEach.call(document.querySelectorAll('main [data-show], main .cls-sheet'), function (el) {
      if (!el.offsetParent) return;
      el.classList.remove('m-swap'); void el.offsetWidth; el.classList.add('m-swap');
    });
  }
  function close() {
    if (!valid(load())) return; // nothing chosen yet: the gate stays until a class is picked
    gate.hidden = true;
    document.documentElement.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }

  cards.forEach(function (c, i) {
    c.addEventListener('keydown', function (e) { // arrow keys move between classes
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1 }[e.key];
      if (j !== undefined) { e.preventDefault(); cards[(j + cards.length) % cards.length].focus(); }
    });
    c.addEventListener('click', function () {
      if (gate.classList.contains('is-picking')) return;
      var first = !valid(load()), changed = c.dataset.cls !== document.body.dataset.cls;
      save(c.dataset.cls); apply(c.dataset.cls);
      if (changed) swapIn();
      // a little ceremony: the chosen card bounces, the screen lifts away, then the page rises in
      var wait = calm ? 0 : 380, lift = calm ? 0 : 300;
      gate.classList.add('is-picking'); c.classList.add('is-picked');
      setTimeout(function () {
        gate.classList.add('is-leaving');
        setTimeout(function () {
          gate.classList.remove('is-picking', 'is-leaving'); c.classList.remove('is-picked');
          close(); enterMain();
          if (!first) document.getElementById('classes').scrollIntoView({ block: 'start' });
        }, lift);
      }, wait);
    });
  });
  [].forEach.call(document.querySelectorAll('[data-cls-open]'), function (b) { b.addEventListener('click', open); });
  gate.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var i = cards.indexOf(document.activeElement); // keep focus inside the dialog
    if (e.shiftKey && i <= 0) { e.preventDefault(); cards[cards.length - 1].focus(); }
    else if (!e.shiftKey && i === cards.length - 1) { e.preventDefault(); cards[0].focus(); }
  });

  var saved = load();
  apply(valid(saved) ? saved : 'all');
  open(); // the class select is the loader: it greets every page load, last pick pre-marked
})();
