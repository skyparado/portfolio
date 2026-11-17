/* Post office extras: the postage meter fills as the letter is written, and the
   stamp thunks down when it is sent. Validation and the mailto: stay in main.js. */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  var meter = document.querySelectorAll('#postMeter i');
  if (!form || !meter.length) return;
  var name = document.getElementById('c-name'), email = document.getElementById('c-email'), msg = document.getElementById('c-msg');
  function filled() {
    return [name.value.trim() !== '', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), msg.value.trim() !== ''];
  }
  function sync() {
    var ok = filled();
    ok.forEach(function (on, i) { meter[i].classList.toggle('on', on); });
    form.classList.toggle('is-ready', ok.every(Boolean));
  }
  form.addEventListener('input', sync);
  form.addEventListener('submit', function () {
    if (!filled().every(Boolean)) return;
    form.classList.remove('is-sent'); void form.offsetWidth; form.classList.add('is-sent');
  });
  sync();
})();
