/* Choose your class: tabs that swap the career-path sheet, remembered per visitor. */
(function () {
  'use strict';
  var tabs = [].slice.call(document.querySelectorAll('.cls-picker [role="tab"]'));
  if (!tabs.length) return;
  function pick(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    try { localStorage.setItem('sky.class', tab.dataset.cls); } catch (e) {}
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t); });
    t.addEventListener('keydown', function (e) {
      var j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault(); pick(tabs[(j + tabs.length) % tabs.length], true);
    });
  });
  var saved = null;
  try { saved = localStorage.getItem('sky.class'); } catch (e) {}
  var start = tabs.filter(function (t) { return t.dataset.cls === saved; })[0];
  if (start) pick(start);
})();
