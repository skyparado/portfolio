/* =====================================================================
   PARADO // projects — Pokémon-TCG card decks
   One card on stage, neighbours peeking. Shift through with arrows,
   swipe/drag, dots, or by clicking a side card. Cards keep their crisp, flat pixel-game framing.
   Supports any number of independent [data-deck] carousels on a page.
   ===================================================================== */
(function () {
  'use strict';

  function initDeck(deck) {
    const viewport = deck.querySelector('.deck-viewport');
    const track    = deck.querySelector('.deck-track');
    const cards    = [...deck.querySelectorAll('.pcard')];
    const prevBtn  = deck.querySelector('.deck-nav.prev');
    const nextBtn  = deck.querySelector('.deck-nav.next');
    const dotsWrap = deck.querySelector('.deck-dots');
    const countEl  = deck.querySelector('.deck-count b');
    if (!cards.length || !track) return;

    let index = 0;

    /* ---- dots ---- */
    if (dotsWrap) cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Card ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap ? [...dotsWrap.children] : [];

    /* ---- centring maths ---- */
    function centerFor(i) {
      const card = cards[i];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      return viewport.clientWidth / 2 - cardCenter;
    }
    function layout(animate = true) {
      track.classList.toggle('no-anim', !animate);
      track.style.transform = 'translateX(' + centerFor(index) + 'px)';
      cards.forEach((c, i) => {
        c.classList.toggle('active', i === index);
        c.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        if (i !== index) c.style.transform = '';          // drop any leftover tilt
      });
      dots.forEach((d, i) => { d.classList.toggle('on', i === index); d.setAttribute('aria-selected', i === index); });
      if (countEl) countEl.textContent = String(index + 1).padStart(2, '0');
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === cards.length - 1;
      if (animate) requestAnimationFrame(() => track.classList.remove('no-anim'));
    }
    function go(i) { index = Math.max(0, Math.min(cards.length - 1, i)); layout(); }
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    /* ---- pointer drag / swipe (declared before click so handlers can read dragMoved) ---- */
    let dragging = false, startX = 0, dragMoved = false;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; dragMoved = false; startX = e.clientX;
      viewport.classList.add('dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 8) dragMoved = true;
    });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false; viewport.classList.remove('dragging');
      const dx = e.clientX - startX;
      if (dx <= -45) next();
      else if (dx >= 45) prev();
    });

    /* click a peeking side card to draw it; a drag never counts as a click.
       Works for <article> and whole-card <a> repo cards alike. */
    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (dragMoved) { e.preventDefault(); return; }
        if (i !== index) { e.preventDefault(); go(i); }     // draw it instead of following any link
      });
    });

    /* ---- keyboard (only while the deck is engaged) ---- */
    if (viewport.hasAttribute('tabindex')) viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    /* ---- init + keep centred on resize ---- */
    let rAF;
    window.addEventListener('resize', () => { cancelAnimationFrame(rAF); rAF = requestAnimationFrame(() => layout(false)); });
    window.addEventListener('load', () => layout(false));
    layout(false);
  }

  document.querySelectorAll('[data-deck]').forEach(initDeck);
})();
