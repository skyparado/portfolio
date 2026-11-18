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
  }

  function open() {
    opener = document.activeElement;
    gate.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    var start = gate.querySelector('.cls-card.is-current') || cards[0];
    start.focus(); say(start);
  }
  // the text box speaks for whichever Sky is pointed at or focused
  var sayName = gate.querySelector('.cls-say-name'), sayLine = gate.querySelector('.cls-say-line');
  function say(card) {
    cards.forEach(function (c) { c.classList.toggle('is-aim', c === card); });
    sayName.textContent = card.querySelector('.cls-name').textContent;
    sayLine.textContent = card.dataset.line;
  }
  function close() {
    if (!valid(load())) return; // nothing chosen yet: the gate stays until a class is picked
    gate.hidden = true;
    document.documentElement.style.overflow = '';
    if (opener && opener.focus) opener.focus();
  }

  cards.forEach(function (c, i) {
    c.addEventListener('mouseenter', function () { say(c); });
    c.addEventListener('focus', function () { say(c); });
    c.addEventListener('keydown', function (e) { // arrow keys walk between Skys
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1 }[e.key];
      if (j !== undefined) { e.preventDefault(); cards[(j + cards.length) % cards.length].focus(); }
    });
    c.addEventListener('click', function () {
      var first = !valid(load());
      save(c.dataset.cls); apply(c.dataset.cls); close();
      if (!first) document.getElementById('classes').scrollIntoView({ block: 'start' });
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
