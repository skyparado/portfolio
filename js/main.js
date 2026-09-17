/* =====================================================================
   PARADO // portfolio OS  —  shared interactions
   Features: saved theme, boot sequence, command palette (Ctrl/Cmd+K),
   keyboard nav (1-5 / g+key), scroll reveal, animated stat bars,
   typing effect, konami easter egg, visit counter, contact terminal.
   All state persists via localStorage / sessionStorage.
   ===================================================================== */
(function () {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME (saved session) ---------- */
  const root = document.documentElement;
  const THEME_KEY = 'parado.theme';
  function setTheme(mode, save = true) {
    root.setAttribute('data-theme', mode);
    if (save) localStorage.setItem(THEME_KEY, mode);
    $$('.theme-btn').forEach(btn => {
      const dark = mode === 'dark';
      const lbl = $('.tl', btn); if (lbl) lbl.textContent = dark ? 'light' : 'dark';
      const ico = $('svg', btn);
      if (ico) ico.innerHTML = dark
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    });
  }
  const saved = localStorage.getItem(THEME_KEY);
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), false);
  $$('.theme-btn').forEach(b => b.addEventListener('click', () =>
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')));

  /* ---------- TOAST ---------- */
  let toastEl = $('#toast');
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'toast'; document.body.appendChild(toastEl); }
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- VISIT COUNTER (saved session) ---------- */
  const visits = (parseInt(localStorage.getItem('parado.visits') || '0', 10) + 1);
  localStorage.setItem('parado.visits', visits);
  const lastSeen = localStorage.getItem('parado.lastSeen');
  localStorage.setItem('parado.lastSeen', new Date().toISOString());
  $$('[data-visits]').forEach(el => el.textContent = String(visits).padStart(3, '0'));
  $$('[data-lastseen]').forEach(el => {
    el.textContent = lastSeen
      ? 'last login ' + new Date(lastSeen).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : 'first login';
  });

  /* ---------- BOOT SEQUENCE (once per session) ---------- */
  const boot = $('#boot');
  if (boot) {
    const already = sessionStorage.getItem('parado.booted');
    if (already || reduce) {
      boot.classList.add('done'); setTimeout(() => boot.remove(), 200);
    } else {
      const lineEl = $('.boot-line', boot);
      const bar = $('.boot-bar i', boot);
      const lines = [
        ['booting parado.os v2.6 ................ ', 'ok'],
        ['mounting /skills /projects /certs ..... ', 'ok'],
        ['loading security modules .............. ', 'ok'],
        ['establishing uplink // github ......... ', 'ok'],
        ['decrypting resume payload ............. ', 'ok'],
        ['access granted. welcome, operator.', '']
      ];
      let i = 0;
      const finish = () => { sessionStorage.setItem('parado.booted', '1'); boot.classList.add('done'); setTimeout(() => boot.remove(), 600); };
      const step = () => {
        if (i >= lines.length) { setTimeout(finish, 550); return; }
        const [txt, tag] = lines[i];
        const p = document.createElement('p'); p.className = 'boot-line';
        p.innerHTML = txt + (tag ? `<span class="ok">[${tag}]</span>` : '');
        lineEl.parentNode.insertBefore(p, bar.parentNode);
        if (bar) bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
        i++; setTimeout(step, 340);
      };
      // remove placeholder first line
      if (lineEl) lineEl.remove();
      setTimeout(step, 250);
      const skip = () => finish();
      boot.addEventListener('click', skip);
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape' || e.key === 'Enter') { skip(); document.removeEventListener('keydown', esc); }
      });
    }
  }

  /* ---------- TYPING EFFECT ---------- */
  const typed = $('#typed');
  if (typed) {
    const roles = (typed.dataset.roles || '').split('|').filter(Boolean);
    if (reduce || !roles.length) { typed.textContent = roles[0] || ''; }
    else {
      let ri = 0, ci = 0, del = false;
      (function tick() {
        const w = roles[ri]; typed.textContent = w.slice(0, ci);
        if (!del && ci < w.length) { ci++; setTimeout(tick, 45); }
        else if (!del && ci === w.length) { del = true; setTimeout(tick, 1700); }
        else if (del && ci > 0) { ci--; setTimeout(tick, 22); }
        else { del = false; ri = (ri + 1) % roles.length; setTimeout(tick, 320); }
      })();
    }
  }

  /* ---------- SCROLL REVEAL ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 })
    : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- ANIMATED STAT BARS ---------- */
  const barObs = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach(e => {
        if (e.isIntersecting) { const b = e.target; b.style.width = (b.dataset.val || 0) + '%'; barObs.unobserve(b); }
      }), { threshold: .4 })
    : null;
  $$('.bar i[data-val]').forEach(b => barObs ? barObs.observe(b) : (b.style.width = (b.dataset.val || 0) + '%'));

  /* ---------- GLITCH on hero heading hover ---------- */
  $$('.glitch').forEach(g => {
    const fire = () => { if (reduce) return; g.classList.remove('go'); void g.offsetWidth; g.classList.add('go'); };
    g.addEventListener('mouseenter', fire);
    setTimeout(fire, 900);
  });

  /* ---------- COMMAND PALETTE (Ctrl/Cmd + K) ---------- */
  const pages = [
    { t: 'Home',       d: 'character sheet & overview', u: 'index.html',      k: '1' },
    { t: 'Projects',   d: 'missions & builds',          u: 'projects.html',   k: '2' },
    { t: 'Certs',      d: 'achievements unlocked',      u: 'certs.html',      k: '3' },
    { t: 'Experience', d: 'campaign log',               u: 'experience.html', k: '4' },
    { t: 'Contact',    d: 'open an uplink',             u: 'contact.html',    k: '5' },
    { t: 'Skills', d: 'search the skill garden', u: 'skills.html', k: '6' },
    { t: 'Toggle theme', d: 'switch night / light',     act: () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark') },
    { t: 'GitHub',     d: 'github.com/skyparado',       u: 'https://github.com/skyparado', ext: true },
  ];
  const pal = document.createElement('div');
  pal.id = 'palette';
  pal.innerHTML = `
    <div class="pal-box" role="dialog" aria-label="Command palette">
      <input class="pal-input mono" type="text" placeholder="&gt; type a command…  (esc to close)" aria-label="Command">
      <ul class="pal-list"></ul>
      <div class="pal-foot mono"><span>↑↓ navigate</span><span>⏎ run</span><span>esc close</span></div>
    </div>`;
  document.body.appendChild(pal);
  const palStyle = document.createElement('style');
  palStyle.textContent = `
    #palette{position:fixed;inset:0;z-index:800;display:none;align-items:flex-start;justify-content:center;
      padding-top:14vh;background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(4px)}
    #palette.open{display:flex}
    .pal-box{width:min(560px,92%);background:var(--panel);border:1px solid var(--accent-dim);border-radius:12px;
      box-shadow:0 30px 70px -20px rgba(0,0,0,.7),0 0 30px var(--accent-glow);overflow:hidden}
    .pal-input{width:100%;border:0;border-bottom:1px solid var(--line);background:var(--panel-2);color:var(--fg);
      padding:16px 18px;font-size:14px;outline:none}
    .pal-list{list-style:none;margin:0;padding:6px;max-height:44vh;overflow:auto}
    .pal-list li{display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:8px;cursor:pointer}
    .pal-list li .pt{font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--fg)}
    .pal-list li .pd{font-size:11.5px;color:var(--fg-dim);margin-left:2px}
    .pal-list li .pk{margin-left:auto;font-family:"JetBrains Mono",monospace;font-size:10px;color:var(--comment);
      border:1px solid var(--line);border-radius:4px;padding:1px 6px}
    .pal-list li.sel,.pal-list li:hover{background:color-mix(in srgb,var(--accent) 12%,transparent)}
    .pal-list li.sel .pt{color:var(--accent)}
    .pal-foot{display:flex;gap:16px;justify-content:center;padding:10px;border-top:1px solid var(--line);
      font-size:10.5px;color:var(--comment)}`;
  document.head.appendChild(palStyle);
  const palInput = $('.pal-input', pal), palList = $('.pal-list', pal);
  let sel = 0, filtered = pages;
  function renderPal() {
    palList.innerHTML = filtered.map((p, i) => `
      <li data-i="${i}" class="${i === sel ? 'sel' : ''}">
        <span class="pt">${p.t}</span><span class="pd">${p.d}</span>
        ${p.k ? `<span class="pk">${p.k}</span>` : (p.ext ? '<span class="pk">↗</span>' : '')}
      </li>`).join('');
  }
  function openPal() { pal.classList.add('open'); palInput.value = ''; filtered = pages; sel = 0; renderPal(); palInput.focus(); }
  function closePal() { pal.classList.remove('open'); }
  function runPal(p) {
    closePal();
    if (!p) return;
    if (p.act) return p.act();
    if (p.ext) return window.open(p.u, '_blank', 'noopener');
    if (p.u) window.location.href = p.u;
  }
  palInput.addEventListener('input', () => {
    const q = palInput.value.toLowerCase().trim();
    filtered = pages.filter(p => (p.t + ' ' + p.d).toLowerCase().includes(q));
    sel = 0; renderPal();
  });
  palList.addEventListener('click', e => { const li = e.target.closest('li'); if (li) runPal(filtered[+li.dataset.i]); });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? closePal() : openPal(); return; }
    if (!pal.classList.contains('open')) return;
    if (e.key === 'Escape') closePal();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); renderPal(); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); sel = Math.max(sel - 1, 0); renderPal(); }
    else if (e.key === 'Enter')     { e.preventDefault(); runPal(filtered[sel]); }
  });

  /* ---------- NUMBER-KEY QUICK NAV (1..5) ---------- */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || pal.classList.contains('open')) return;
    const map = { '1': 'index.html', '2': 'projects.html', '3': 'certs.html', '4': 'experience.html', '5': 'contact.html', '6': 'skills.html' };
    if (map[e.key]) window.location.href = map[e.key];
    if (e.key === '?') toast('shortcuts: 1-6 pages · Ctrl+K palette · T theme');
    if (e.key.toLowerCase() === 't') setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------- KONAMI EASTER EGG ---------- */
  const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let ki = 0;
  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === seq[ki]) ? ki + 1 : (k === seq[0] ? 1 : 0);
    if (ki === seq.length) {
      ki = 0; document.body.classList.toggle('matrix-mode');
      toast(document.body.classList.contains('matrix-mode') ? '// cheat unlocked: matrix rain' : '// matrix rain off');
      if (document.body.classList.contains('matrix-mode')) startMatrix(); else stopMatrix();
    }
  });

  /* ---------- MATRIX RAIN (konami) ---------- */
  let mCanvas, mCtx, mRAF, drops = [];
  function startMatrix() {
    if (reduce) return;
    mCanvas = document.createElement('canvas');
    mCanvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.22';
    document.body.prepend(mCanvas);
    mCtx = mCanvas.getContext('2d');
    const resize = () => { mCanvas.width = innerWidth; mCanvas.height = innerHeight; drops = Array(Math.floor(innerWidth / 14)).fill(1); };
    resize(); window.addEventListener('resize', resize);
    const chars = '01ｱｲｳｴｵｶｷｸ<>/\\{}[]#$*'.split('');
    (function draw() {
      mCtx.fillStyle = 'rgba(8,11,17,.08)'; mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);
      mCtx.fillStyle = '#a970ff'; mCtx.font = '13px monospace';
      drops.forEach((y, i) => {
        mCtx.fillText(chars[(Math.random() * chars.length) | 0], i * 14, y * 14);
        drops[i] = (y * 14 > mCanvas.height && Math.random() > .975) ? 0 : y + 1;
      });
      mRAF = requestAnimationFrame(draw);
    })();
  }
  function stopMatrix() { cancelAnimationFrame(mRAF); if (mCanvas) mCanvas.remove(); }

  /* ---------- CONTACT TERMINAL (fake send + mailto fallback) ---------- */
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#c-name', form).value.trim() || 'operator';
      const email = $('#c-email', form).value.trim();
      const msg = $('#c-msg', form).value.trim();
      const note = $('#formNote', form);
      if (!email || !msg) { note.textContent = 'Please add your email address and a message.'; note.classList.remove('ok'); return; }
      note.classList.add('ok');
      note.textContent = 'Your letter is ready, ' + name + '. Opening your email app...';
      const body = encodeURIComponent(`From: ${name} <${email}>\n\n${msg}`);
      setTimeout(() => { window.location.href = `mailto:sky.parado@gmail.com?subject=${encodeURIComponent('uplink from ' + name)}&body=${body}`; }, 700);
    });
  }

  /* ---------- EXPERIENCE: expand-in-place log cards ---------- */
  $$('.log-row').forEach(row => {
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.setAttribute('aria-expanded', 'false');
    if (!$('.expand', row)) {
      const ex = document.createElement('span');
      ex.className = 'expand';
      ex.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
      row.appendChild(ex);
    }
    const toggle = () => {
      const open = row.classList.toggle('open');
      row.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* ---------- certificate lightbox ---------- */
  const lb = $('#lb');
  if (lb) {
    const lbImg = $('img', lb), lbCap = $('.cap', lb);
    const cards = $$('.cert');
    let idx = -1;
    const show = (i) => {
      idx = (i + cards.length) % cards.length;
      const c = cards[idx];
      lbImg.src = c.dataset.full;
      lbImg.alt = c.dataset.cap || '';
      lbCap.innerHTML = c.dataset.cap ? `<b>&#9873;</b> ${c.dataset.cap}` : '';
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    cards.forEach((c, i) => c.addEventListener('click', () => show(i)));
    $('.x', lb).addEventListener('click', close);
    $('.prev', lb).addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
    $('.next', lb).addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  /* ---------- footer year / hint ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  console.log('%c parado.os ', 'background:#a970ff;color:#080b11;font-weight:700;padding:2px 6px;border-radius:3px', 'try Ctrl+K, press ? for shortcuts, and ↑↑↓↓←→←→ b a');
})();
