/* =====================================================================
   Pixel Sky — a scripted site guide.
   Not a live AI: it matches what a visitor types against topics written
   here on purpose, so it is free to host on a static site and it can
   never invent something about Sky. To teach it something new, add a
   topic to TOPICS (keywords + reply + optional actions/next chips).
   ===================================================================== */
(function () {
  'use strict';
  if (document.querySelector('.guide')) return;

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = matchMedia('(max-width: 560px)');
  var ONEPAGE = document.body.getAttribute('data-page') === 'one';
  var STORE = 'parado.guide.v1';
  var EMAIL = 'sky.parado@gmail.com';

  /* ---------- what Pixel Sky knows ----------
     go:'#id'  scrolls to a section of the one-page home (or opens it from other pages)
     href:'x'  opens a page / link            next: follow-up chip labels            */
  var TOPICS = [
    { id: 'about', chip: 'Who is Sky?',
      keywords: ['who is sky', 'about sky', 'tell me about sky', 'tell me about yourself', 'introduce', 'summary', 'background', 'sky parado', 'sky hannah', 'overview', 'who'],
      reply: "Sky Hannah Parado is a Computer Science student at De La Salle University, majoring in Network & Information Security. Sky is President of DLSU's Information Security Organization, an ISC2 CC exam passer and a CTF champion. Sky builds web apps, tests them for security holes, and automates workflows, with internships in security operations and web maintenance.",
      actions: [{ label: 'Show me', go: '#character' }], next: ['Projects', 'CTF wins', 'Experience'] },

    { id: 'projects', chip: 'Projects',
      keywords: ['project', 'projects', 'portfolio', 'built', 'build', 'made', 'work samples', 'repos', 'repository', 'code'],
      reply: "Ten projects so far. The featured four: an AI Web App Scanner (38 findings across 7 vulnerability classes), the CITO citation add-on for Google Docs, CampusCart (a campus marketplace, frontend lead + backend security), and hand-built networking utilities. There are also AI, systems and web side projects.",
      actions: [{ label: 'Show me', go: '#projects' }], next: ['The scanner', 'CampusCart', 'Skills'] },

    { id: 'scanner', chip: 'The scanner',
      keywords: ['scanner', 'scanners', 'fuzzer', 'fuzzing', 'ai web app', 'web app scanner', 'llm', 'investigatory', 'false positive'],
      reply: "The AI Web App Scanner audits web apps that were built with LLMs, looking for common security weaknesses. It turned up 38 findings across 7 vulnerability classes and recorded zero false positives against a hardened control app. Python, OWASP Top 10.",
      actions: [{ label: 'Show me', go: '#proj-fuzzer' }, { label: 'Repo ↗', href: 'https://github.com/skyparado/InvestigatoryScanner' }], next: ['Certifications', 'Other projects'] },

    { id: 'cito', keywords: ['cito', 'citation', 'google docs', 'google doc', 'add-on', 'addon', 'apps script', 'oauth'],
      reply: "CITO lets you highlight text in a Google Doc and find supporting or opposing research without leaving the document. Sky built the first version of the add-on, including scoped OAuth permissions and secure token storage.",
      actions: [{ label: 'Show me', go: '#proj-cito' }, { label: 'Repo ↗', href: 'https://github.com/skyparado/CITO-Citation-Tool' }], next: ['Other projects', 'Skills'] },

    { id: 'campuscart', chip: 'CampusCart', keywords: ['campuscart', 'campus cart', 'marketplace', 'team project', 'secure sdlc', 'threat model'],
      reply: "CampusCart is a campus marketplace built by a five-person team. Sky led the frontend and hardened the backend: secure authentication, sanitized inputs, parameterized SQL, and threat modelling from design through release.",
      actions: [{ label: 'Show me', go: '#proj-campuscart' }], next: ['The scanner', 'Experience'] },

    { id: 'network', keywords: ['ping', 'traceroute', 'icmp', 'voip', 'network programming', 'networking project', 'socket', 'sockets', 'tcp', 'packet'],
      reply: "Sky's networking work includes a custom ping, an ICMP traceroute, and a VoIP simulator, written in Python and Java with raw ICMP sockets, to learn how TCP/IP really behaves.",
      actions: [{ label: 'Show me', go: '#proj-netutils' }], next: ['Other projects', 'Skills'] },

    { id: 'ai', keywords: ['catbot', 'cat bot', 'q-learning', 'qlearning', 'reinforcement', 'pinoybot', 'sokoban', 'machine learning', 'nlp', 'artificial intelligence', 'ai project', 'ai projects', 'pathfinding'],
      reply: "On the AI side: CatBot (a tabular Q-learning agent that catches adversarial cats on an 8x8 grid), PINOYBOT (an NLP language classifier), and a Sokoban solver that explores search and pathfinding. Sky also evaluates LLM-generated Python code as an AI trainer at DataAnnotation.",
      actions: [{ label: 'Show me', go: '#projects', filter: 'ai' }], next: ['The scanner', 'Skills'] },

    { id: 'ctf', chip: 'CTF wins',
      keywords: ['ctf', 'ctfs', 'capture the flag', 'hackathon', 'iso', 'champion', 'win', 'wins', 'won', 'competition', 'competitions', 'k17', 'csctf', 'pink+', 'huawei', 'prompt patrol', 'achievement', 'achievements', 'award', 'awards', 'trophy', 'trophies', 'hackfest'],
      reply: "Champion of DLSU Capture The Flag 2026 with Team Prompt Patrol. 2nd place at ISO CTF 2026. 44th of 609 teams at CSCTF 2026 (top 8%). 66th of 589 teams at PINK+ CTF (top 12%). Sky also played K17 CTF 2026, joined HackFest 2026, and is part of the pioneering batch of the Huawei Future Innovators Camp.",
      actions: [{ label: 'Show me', go: '#trophies' }, { label: 'Trophy room', href: 'certs.html' }], next: ['Certifications', 'Projects'] },

    { id: 'certs', chip: 'Certifications',
      keywords: ['cert', 'certs', 'certificate', 'certificates', 'certification', 'certifications', 'isc2', 'cc', 'vapt', 'credential', 'credentials', 'pentest', 'penetration'],
      reply: "Sky passed the ISC2 Certified in Cybersecurity (CC) exam in March 2026 and became a Junior VAPT Practitioner in August 2026: recon, enumeration, controlled exploitation, privilege escalation, CVSS v3.1 scoring and technical reporting. The trophy room has all 25 certificates.",
      actions: [{ label: 'Show me', go: '#trophies' }, { label: 'All 25 →', href: 'certs.html' }], next: ['CTF wins', 'Skills'] },

    { id: 'experience', chip: 'Experience',
      keywords: ['experience', 'work', 'job', 'jobs', 'hackercup', 'hacker cup', 'lscs', 'techbiz', 'soc', 'ahead', 'good trade', 'dataannotation', 'csg', 'archers', 'president', 'computer society', 'org', 'orgs', 'organization', 'organizations', 'officer', 'roles', 'role', 'uratex', 'immersion'],
      reply: "Work: SOC Analyst and Ethical Hacking Intern at TechBiz Security. IT and Web Maintenance Intern at AHEAD Tutorial and Review Center. Web Developer at The Good Trade PH, automating their merchant applications with Google Apps Script. Analyst and AI Trainer at DataAnnotation. On campus: President of the Information Security Organization, Web Developer for the Computer Studies Government, and Assistant Manager at DLSU Archers Consulting Group.",
      actions: [{ label: 'Show me', go: '#experience' }, { label: 'Full journal', href: 'experience.html' }], next: ['Education', 'Leadership'] },

    { id: 'education', chip: 'Education',
      keywords: ['education', 'school', 'university', 'dlsu', 'la salle', 'de la salle', 'degree', 'major', 'course', 'gpa', 'dean', 'deans list', 'grades', 'senior high', 'ateneo', 'student', 'study', 'studying', 'college', 'year level'],
      reply: "BS Computer Science at De La Salle University, majoring in Network & Information Security (2024 to present). Sky has made the Dean's List three times: First Dean's Lister twice and Second once. Senior high was STEM at Ateneo de Cebu: top 10% of the graduating cohort, with Gold Honors in Grade 11 and Silver Honors in Grade 12.",
      actions: [{ label: 'Show me', go: '#experience' }], next: ['Experience', 'Skills'] },

    { id: 'skills', chip: 'Skills',
      keywords: ['skill', 'skills', 'stack', 'tools', 'tool', 'language', 'languages', 'tech', 'technologies', 'python', 'java', 'c++', 'javascript', 'typescript', 'sql', 'html', 'css', 'burp', 'nmap', 'owasp', 'git', 'know', 'good at'],
      reply: "Security: Nmap, Burp Suite, VAPT, penetration testing, OWASP Top 10, CVSS v3.1, API security testing. Languages: Python, Java, C++, JavaScript, TypeScript, SQL, HTML & CSS. AI and automation: LLM integration, prompt engineering, Google Apps Script, workflow automation. Tools: REST APIs, Git, Figma, WordPress, Google Workspace. Plus project management, technical documentation and team leadership.",
      actions: [{ label: 'Show me', go: '#skills' }, { label: 'Skill garden', href: 'skills.html' }], next: ['Projects', 'Certifications'] },

    { id: 'leadership', chip: 'Leadership',
      keywords: ['leadership', 'lead', 'leader', 'debate', 'debater', 'cida', 'public speaking', 'speaker', 'host', 'hosting', 'emcee', 'fundraising', 'fundraiser', 'event', 'events', 'volunteer', 'volunteering', 'community', 'interact'],
      reply: "Plenty. Sky is President of DLSU's Information Security Organization, leading five departments, 30+ officers and 100+ members. Before that, Sky was its Organization Development Officer and a Corporate Relations Assistant Team Lead for HackerCup 2026. As Vice President of the Cebu Inter-School Debate Association, Sky organized five debate competitions of 200+ participants each, at about PHP 100,000 per competition.",
      actions: [{ label: 'Full journal', href: 'experience.html' }], next: ['Experience', 'Hire Sky'] },

    { id: 'contact', chip: 'Hire Sky',
      keywords: ['hire', 'hiring', 'contact', 'reach', 'email', 'mail', 'available', 'availability', 'recruit', 'recruiter', 'opportunity', 'internship', 'intern', 'ojt', 'work with', 'collaborate', 'message', 'talk'],
      reply: "Good news: Sky is open to internships in security and software, based in Manila. Email is fastest (" + EMAIL + "), or use the form at the bottom of the page.",
      actions: [{ label: 'Email Sky', href: 'mailto:' + EMAIL + '?subject=Hello%20Sky' }, { label: 'Contact form', go: '#contact' }], next: ['Socials', 'Projects'] },

    { id: 'socials', chip: 'Socials',
      keywords: ['github', 'linkedin', 'social', 'socials', 'profile', 'profiles', 'online'],
      reply: "GitHub: github.com/skyparado. LinkedIn: in/sky-hannah-parado. Both are linked at the top and bottom of the page.",
      actions: [{ label: 'GitHub ↗', href: 'https://github.com/skyparado' }, { label: 'LinkedIn ↗', href: 'https://linkedin.com/in/sky-hannah-parado-3a9218256' }], next: ['Hire Sky', 'Projects'] },

    { id: 'location', keywords: ['where', 'location', 'based', 'manila', 'cebu', 'from', 'live', 'philippines', 'city'],
      reply: "Sky is based in Manila for university and grew up in Cebu, where senior high, debate and most of the community work happened.",
      next: ['Education', 'Hire Sky'] },

    { id: 'resume', keywords: ['resume', 'résumé', 'cv', 'curriculum'],
      reply: "The résumé isn't posted on the site. Send Sky a quick email and it'll come right back to you.",
      actions: [{ label: 'Request résumé', href: 'mailto:' + EMAIL + '?subject=R%C3%A9sum%C3%A9%20request' }], next: ['Experience', 'Skills'] },

    { id: 'site', keywords: ['this site', 'website', 'this page', 'pages', 'navigate', 'trophy room', 'skill garden', 'journal', 'workshop', 'parado world', 'map', 'explore'],
      reply: "This page is the quick tour. For more: the Workshop has every project, the Trophy Room has all 25 certificates, the Journal covers the full story from junior high on, and the Skill Garden is an interactive toolkit.",
      actions: [{ label: 'Trophy room', href: 'certs.html' }, { label: 'Journal', href: 'experience.html' }, { label: 'Skill garden', href: 'skills.html' }], next: ['Projects', 'Hire Sky'] }
  ];
  /* chip labels that aren't a topic's own chip */
  var ALIAS = { 'Other projects': 'projects' };

  /* checked before topics: short social replies */
  var SMALL = [
    { keywords: ['are you real', 'are you human', 'are you a bot', 'are you ai', 'are you an ai', 'chatgpt', 'gpt', 'what are you', 'how do you work', 'llm bot'],
      reply: "I'm Pixel Sky, a scripted guide and not a live AI. I match what you type against answers Sky wrote, so I won't make anything up. If I don't know something, I'll point you to Sky directly." },
    { keywords: ['who made you', 'who built you', 'who created you', 'who coded you'],
      reply: "Sky made me, pixel by pixel. I'm a few hundred lines of plain JavaScript with no servers and no tracking." },
    { keywords: ['what can you do', 'what can i ask', 'help', 'options', 'menu'],
      reply: "Ask me about Sky's projects, CTF wins, certifications, skills, experience, education, or how to get in touch. I can also jump you to the right part of the page." },
    { keywords: ['joke', 'funny', 'make me laugh'],
      reply: "I'd tell you a UDP joke, but you might not get it. …A TCP joke, then? I'll keep telling it until you acknowledge it." },
    { keywords: ['thanks', 'thank you', 'thank u', 'ty', 'salamat', 'appreciate'],
      reply: "Anytime! Anything else you'd like to see?" },
    { keywords: ['bye', 'goodbye', 'see you', 'see ya', 'later'],
      reply: "Bye for now! If you want to reach Sky, the email is " + EMAIL + "." },
    { short: true, keywords: ['hi', 'hello', 'hey', 'yo', 'hiya', 'good morning', 'good afternoon', 'good evening', 'kumusta', 'musta', 'sup'],
      reply: "Hi there! What would you like to know about Sky?" }
  ];

  var START_CHIPS = ['Who is Sky?', 'Projects', 'CTF wins', 'Certifications', 'Skills', 'Hire Sky'];
  var GREETING = "Hi, I'm Pixel Sky, Sky's site guide! Ask me anything about Sky's work, or tap a topic below.";

  /* ---------- the pixel face (14 x 14): long hair, side-swept fringe ---------- */
  var FACE = [
    '...HHHHHHHH...',
    '..HHhhHHHHHH..',
    '.HHhHHHHHHHHH.',
    '.HHHHHHHHHHHH.',
    '.HHHHHHSSSHHH.',
    '.HHHSSSSSSSHH.',
    '.HHSESSSSESHH.',
    '.HHSESSSSESHH.',
    '.HHBSSSSSSBHH.',
    '.HHSSSMMSSSHH.',
    '.HHHSSSSSSHHH.',
    '.HHH.SSSS.HHH.',
    '.HHHLLLLLLHHH.',
    '.HH.LLLLLL.HH.'
  ];
  var COL = { H: '#5b3a2e', h: '#8a5a44', S: '#f3cfb3', E: '#2b2230', B: '#f2a7c3', M: '#c75b86', L: '#fff0dc' };
  function face() {
    var r = '';
    FACE.forEach(function (row, y) {
      var x = 0;
      while (x < row.length) {
        var c = row[x], w = 1;
        if (c === '.' || c === 'E') { x++; continue; }
        while (row[x + w] === c) w++;
        r += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="' + COL[c] + '"/>';
        x += w;
      }
    });
    r += '<rect class="px-eye" x="4" y="6" width="1" height="2" fill="' + COL.E + '"/><rect class="px-eye" x="9" y="6" width="1" height="2" fill="' + COL.E + '"/>';
    return '<svg viewBox="0 0 14 14" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
  }

  /* ---------- state (per tab session, so it follows you across pages) ---------- */
  var state = { log: [], greeted: false, open: false, misses: 0 };
  try { var s = JSON.parse(sessionStorage.getItem(STORE) || 'null'); if (s && Array.isArray(s.log)) state = Object.assign(state, s); } catch (e) {}
  function save() {
    state.log = state.log.slice(-30);
    try { sessionStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- build the DOM ---------- */
  var root = document.createElement('div');
  root.className = 'guide';
  root.innerHTML =
    '<div class="guide-bubble" id="gBubble" hidden role="status">' +
      '<button class="guide-bubble-x" type="button" aria-label="Dismiss">&times;</button>' +
      '<p>Hi! I’m <b>Pixel Sky</b>, Sky’s site guide. Need a hand finding something?</p>' +
      '<button class="guide-bubble-go" type="button">Ask a question →</button>' +
    '</div>' +
    '<section class="guide-panel" id="gPanel" hidden role="dialog" aria-modal="false" aria-labelledby="gTitle">' +
      '<header class="guide-head">' +
        '<span class="guide-ava">' + face() + '</span>' +
        '<div class="guide-title"><b id="gTitle">Pixel Sky</b><span>Sky’s site guide · scripted, not AI</span></div>' +
        '<button class="guide-icon" type="button" data-reset aria-label="Start over" title="Start over"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg></button>' +
        '<button class="guide-icon" type="button" data-close aria-label="Close chat"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '</header>' +
      '<div class="guide-log" id="gLog" role="log" aria-live="polite"></div>' +
      '<div class="guide-chips" id="gChips" role="group" aria-label="Suggested questions"></div>' +
      '<form class="guide-form" id="gForm" autocomplete="off">' +
        '<label for="gInput" class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Ask Pixel Sky a question</label>' +
        '<input id="gInput" type="text" maxlength="200" placeholder="Ask about Sky…" enterkeyhint="send">' +
        '<button class="guide-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      '</form>' +
    '</section>' +
    '<div class="guide-quip" id="gQuip" hidden aria-hidden="true"></div>' +
    '<button class="guide-launch" id="gLaunch" type="button" aria-expanded="false" aria-controls="gPanel" aria-label="Chat with Pixel Sky, the site guide">' +
      face() + '<span class="guide-badge" id="gBadge" hidden>1</span>' +
    '</button>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var launch = $('#gLaunch'), panel = $('#gPanel'), log = $('#gLog'), chips = $('#gChips'),
      form = $('#gForm'), input = $('#gInput'), bubble = $('#gBubble'), badge = $('#gBadge');

  /* sit above the pixel-garden walkway on the older pages */
  function lift() {
    var w = document.querySelector('.sky-walkway');
    root.style.setProperty('--g-lift', w && getComputedStyle(w).visibility !== 'hidden' ? w.offsetHeight + 'px' : '0px');
  }
  lift();
  window.addEventListener('resize', lift);
  setTimeout(lift, 600);

  /* ---------- rendering ---------- */
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  function renderMsg(m) {
    var b = el('div', 'g-msg ' + (m.from === 'me' ? 'g-me' : 'g-bot'));
    /* Pixel Sky answers in bullets: one per sentence (a new sentence = punctuation, space, capital) */
    var parts = m.from === 'me' ? [m.text] : m.text.replace(/([.!?])\s+(?=[A-Z…("“])/g, '$1\n').split('\n');
    if (parts.length < 2) b.textContent = m.text;
    else {
      var list = el('ul', 'g-list');
      parts.forEach(function (p) { list.appendChild(el('li', null, p)); });
      b.appendChild(list);
    }
    if (m.actions && m.actions.length) {
      var row = el('div', 'g-acts');
      m.actions.forEach(function (a) {
        var btn;
        if (a.href) {
          btn = el('a', 'g-act', a.label);
          btn.href = a.href;
          if (/^https?:/.test(a.href)) { btn.target = '_blank'; btn.rel = 'noopener'; }
        } else {
          btn = el('button', 'g-act', a.label);
          btn.type = 'button';
          btn.addEventListener('click', function () { goTo(a); });
        }
        row.appendChild(btn);
      });
      b.appendChild(row);
    }
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }

  function renderChips(labels) {
    chips.innerHTML = '';
    (labels || START_CHIPS).forEach(function (l) {
      var c = el('button', 'guide-chip', l);
      c.type = 'button';
      c.addEventListener('click', function () { ask(l); });
      chips.appendChild(c);
    });
    chips.scrollTop = 0;
  }

  function push(m) { state.log.push(m); save(); renderMsg(m); }

  /* ---------- matching ---------- */
  function norm(t) { return ' ' + t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9+#é]+/g, ' ').trim() + ' '; }
  function hits(q, kw) {
    var k = norm(kw).trim();
    if (!k) return false;
    /* long keywords may match inside words (certif -> certification); short ones need word edges */
    return k.length >= 5 ? q.indexOf(k) > -1 : q.indexOf(' ' + k + ' ') > -1;
  }
  function match(text) {
    var q = norm(text);
    var words = q.trim().split(' ').length;
    for (var i = 0; i < SMALL.length; i++) {
      var s = SMALL[i];
      if (s.short && words > 4) continue;
      if (s.keywords.some(function (k) { return hits(q, k); })) {
        /* a greeting glued to a real question ("hi, what projects...") should answer the question */
        if (s.short) { var t = bestTopic(q); if (t) return t; }
        return s;
      }
    }
    return bestTopic(q);
  }
  function bestTopic(q) {
    var best = null, top = 0;
    TOPICS.forEach(function (t) {
      var score = 0;
      t.keywords.forEach(function (k) { if (hits(q, k)) score += norm(k).trim().length; });
      if (score > top) { top = score; best = t; }
    });
    return best;
  }
  function byChip(label) {
    if (ALIAS[label]) return TOPICS.filter(function (t) { return t.id === ALIAS[label]; })[0];
    return TOPICS.filter(function (t) { return t.chip === label; })[0];
  }

  /* ---------- conversation ---------- */
  var busy = false;
  function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    push({ from: 'me', text: text });
    var hit = byChip(text) || match(text);
    var reply;
    if (hit) {
      state.misses = 0;
      reply = { from: 'bot', text: hit.reply, actions: hit.actions || null };
    } else {
      state.misses++;
      reply = state.misses > 1
        ? { from: 'bot', text: "I'm still stumped, sorry! Sky can answer that one directly.", actions: [{ label: 'Email Sky', href: 'mailto:' + EMAIL + '?subject=Question%20from%20your%20site' }] }
        : { from: 'bot', text: "Hmm, I don't have a scripted answer for that yet. I know about Sky's projects, CTF wins, certifications, skills, experience, and how to get in touch. Try one of these:" };
    }
    busy = true;
    var dots = el('div', 'g-msg g-bot g-typing');
    dots.setAttribute('aria-label', 'Pixel Sky is typing');
    dots.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(dots);
    log.scrollTop = log.scrollHeight;
    var wait = REDUCED ? 150 : Math.min(950, 380 + reply.text.length * 2.2);
    setTimeout(function () {
      dots.remove();
      push(reply);
      renderChips(hit && hit.next ? hit.next : START_CHIPS);
      busy = false;
    }, wait);
  }

  /* scroll to a section of the home page, or open the home page there */
  function goTo(a) {
    var id = a.go.slice(1);
    if (!ONEPAGE) { location.href = 'index.html' + a.go; return; }
    var target = document.getElementById(id);
    if (!target) return;
    var f = document.querySelector('[data-filter="' + (a.filter || 'all') + '"]');
    if (f && (a.filter || target.hidden)) f.click();
    if (MOBILE.matches) close(false);
    target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: target.classList.contains('proj') ? 'center' : 'start' });
    if (target.classList.contains('proj')) {
      target.classList.remove('guide-flash'); void target.offsetWidth; target.classList.add('guide-flash');
      setTimeout(function () { target.classList.remove('guide-flash'); }, 1900);
    }
  }

  /* ---------- open / close ---------- */
  function open() {
    hideBubble(true);
    badge.hidden = true;
    panel.hidden = false;
    root.classList.add('is-open');
    launch.setAttribute('aria-expanded', 'true');
    state.open = true;
    if (!state.log.length) { push({ from: 'bot', text: GREETING }); renderChips(); }
    else if (!chips.children.length) renderChips();
    save();
    log.scrollTop = log.scrollHeight;
    /* don't pop the phone keyboard over the answers */
    if (!MOBILE.matches) input.focus();
  }
  function close(refocus) {
    panel.hidden = true;
    root.classList.remove('is-open');
    launch.setAttribute('aria-expanded', 'false');
    state.open = false;
    save();
    if (refocus !== false) launch.focus();
  }
  function hideBubble(forever) {
    bubble.hidden = true;
    if (forever) { state.greeted = true; save(); }
  }

  launch.addEventListener('click', function () { panel.hidden ? open() : close(); });
  $('[data-close]').addEventListener('click', function () { close(); });
  $('[data-reset]').addEventListener('click', function () {
    state.log = []; state.misses = 0; save();
    log.innerHTML = '';
    push({ from: 'bot', text: GREETING });
    renderChips();
    input.focus();
  });
  $('.guide-bubble-x').addEventListener('click', function () { hideBubble(true); });
  $('.guide-bubble-go').addEventListener('click', open);
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; ask(v); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) close();
  });

  /* ---------- reactions: Pixel Sky hops and comments on whatever you hover ----------
     [selector, lines]. First match wins, so put the specific ones first. */
  var REACT = [
    ['.cc-photo', ["That's the real Sky!", 'Hi, me!', 'Good hair day.', 'Yes, the dress has polka dots.', 'She took forty photos for that one.', 'Looking sharp!', "That's who I'm based on. Slightly more pixels."]],
    ['.cc-sfx', ['Beep boop!', 'Too loud? Sorry!', 'I like the bleeps.', 'Shh mode?']],
    ['.cc-stats', ['Numbers go up!', 'She counts everything.', 'Twenty-five certificates. I checked.', 'Stats screen! My favourite part of any game.']],
    ['.inv a', ['Good pick!', 'She carries that everywhere.', 'Ooh, that one.', 'Careful, that one is rare.', 'Inventory full? Never.', 'Click it, click it!', 'That took a while to collect.']],
    ['.tree-node', ['Level up!', 'She maxed that one out.', 'Another branch unlocked!', 'Learned the hard way.', 'Ooh, good pick.', 'That one gets used daily.', 'Skill point well spent.', 'Took years to grow that.']],
    ['.tree-root, .tree-core', ['A whole branch of those!', 'She has range.', 'Look how much it has grown!', 'Root of it all.']],
    ['#trophy-0', ['Wow, champion!', 'She worked really hard on that!', 'First place. Still not over it.', 'Team Prompt Patrol forever!', 'She screamed when they announced it.', 'Gold looks good on her.']],
    ['#trophy-1', ['Second place, so close!', 'She stayed up late for that one.', 'Wow!', 'Silver and proud.', 'Next year: gold.', 'So many flags captured.']],
    ['#trophy-2', ['Top quarter of 682 teams!', '2,700 points. Not bad!', 'A whole world of teams and she held on.', 'SlayTheFlagII. Great team name.', 'That one was a marathon.']],
    ['#trophy-3', ['Certified hacker. The nice kind.', 'She studied so hard for that!', 'She breaks things, then writes the report.', 'Privilege: escalated.', 'Ask her about CVSS. Actually, do not.']],
    ['#trophy-4', ['Passed the exam!', 'That one took a lot of flashcards.', 'So much coffee went into that.', 'She was so nervous. Nailed it.', 'Official now!']],
    ['.cert', ['Ooh, shiny!', 'Wow!', 'She worked really hard on that!', 'She is so proud of that one.', 'Click to see it up close!', 'Another one for the wall.', 'She remembers that day.', 'Framed in her heart.', 'Collect them all!']],
    ['.trophy-slot', ['Ooh, shiny!', 'Wow!', 'She worked really hard on that!', 'She is so proud of that one.', 'Do not drop it!', 'Polished daily.']],
    ['.one-proj, .work-card', ['She built that!', 'Peek inside!', 'One of my favourites.', 'So many late nights on that.', 'It even works!', 'Go on, open the repo.', 'There were bugs. There are fewer now.', 'She would build it again.', 'Fuelled by snacks.']],
    ['.one-more', ['More this way!', 'Follow the sign!', 'There is a whole room back there.', 'Adventure awaits!', 'I painted that sign myself.']],
    ['.one-timeline>li, .experience-entry', ['Staff badge! Fancy.', 'She wore that one proudly.', 'What a quest log.', 'That was a busy year.', 'She never sits still.', 'So many meetings.', 'And she still passed her classes!', 'Leader energy.', 'I got tired just reading that.']],
    ['.one-tabs [role="tab"]', ['Time travel!', 'A different chapter.', 'She was so small back then.', 'Flip the page!']],
    ['.one-filters button, .project-filters button', ['Sort them out!', 'Picky. I like it.', 'Good filter.', 'Show me the goods.']],
    ['.one-tags li, .work-tags li', ['She knows that one well.', 'Tools of the trade.', 'Ask her about it!', 'Learned the hard way.']],
    ['.one-form, .one-links, .chan, .term', ['Say hi! She replies fast.', 'She loves mail.', 'Go on, write something nice.', 'No spam please. I will know.', 'A new letter?!']],
    ['.nav-links a, .brand', ['Ooh, where are we going?', 'Field trip!', 'Right this way.', 'I will come with you.', 'Good choice.']],
    ['.theme-btn', ['Lights!', 'Day or night?', 'My eyes!', 'Cozy mode.']],
    ['.footer a, .garden-social a', ['She is on there too.', 'Follow her!', 'Stalk responsibly.']]
  ];
  /* extra lines for whatever pixel item is inside the thing you hover (inventory, projects, tool rack) */
  var ITEM_LINES = {
    web: ['Websites! She makes those.', 'It is responsive. Mostly.', 'She centres divs for fun.'],
    ai: ['Beep boop. A friend!', 'The robot learned by failing a lot.', 'It is smarter than it looks.'],
    net: ['Packets go whoosh.', 'She wrote ping by hand. By hand!', 'It is always DNS.'],
    sec: ['Shields up!', 'She finds the holes before the bad guys.', 'Hacker, but the nice kind.'],
    sys: ['Tiny chip, big brain.', 'Cache hit!', 'Low-level wizardry.'],
    bug: ['Eek, a bug!', 'Thirty-eight of them. She counted.', 'Squash it! Gently.', 'Zero false alarms, too.'],
    star: ['Gold star student.', "Dean's list, three times!", 'She does her homework. Annoying, right?'],
    trophy: ['Winner winner!', 'The cabinet is getting full.', 'There are five. So far.'],
    journal: ['Dear diary...', 'Her whole story is in there.', 'Chapter one: a debate kid.'],
    code: ['So many languages!', 'She dreams in Python.', 'Semicolons optional. Sometimes.'],
    mail: ['You have mail! Well, she will.', 'Write to her!', 'Stamps not required.'],
    flag: ['Captured!', 'She leads the party.', 'Born to host an event.'],
    cart: ['Add to cart!', 'A whole marketplace for campus.', 'Five people built that. She ran the front.'],
    doc: ['Cite your sources!', 'It lives inside Google Docs.', 'Research, but faster.'],
    crate: ['Push the box. No, the other way.', 'The solver beats me every time.', 'Classic puzzle.'],
    chat: ['Kumusta! It knows the language.', 'It can tell Tagalog from English.', 'A bot, like me!'],
    disk: ['Retro!', 'Save your game.', 'Remember floppy disks? Me neither.'],
    route: ['Hop, hop, hop.', 'Follow the packets!', 'Every hop tells a story.']
  };
  var MOODS = ['hop', 'wiggle', 'nod', 'jump'];
  var quip = $('#gQuip'), quipTimer = null, lastHit = null, lastLine = '';
  document.addEventListener('mouseover', function (e) {
    if (root.contains(e.target)) return;
    var hit = null, lines = null;
    for (var i = 0; i < REACT.length && !hit; i++) { hit = e.target.closest(REACT[i][0]); lines = REACT[i][1]; }
    if (!hit) { lastHit = null; return; }
    if (hit === lastHit) return;
    lastHit = hit;
    var item = hit.querySelector('[data-item]');
    if (item && ITEM_LINES[item.dataset.item]) lines = ITEM_LINES[item.dataset.item].concat(lines);
    /* never the same line twice in a row */
    var line = lastLine;
    for (var n = 0; n < 6 && line === lastLine; n++) line = lines[Math.floor(Math.random() * lines.length)];
    lastLine = line;
    launch.dataset.mood = MOODS[Math.floor(Math.random() * MOODS.length)];
    launch.classList.remove('is-react'); void launch.offsetWidth; launch.classList.add('is-react');
    /* the quip sits beside the launcher, clear of the chat panel and greeting, so it always shows */
    quip.textContent = line;
    quip.hidden = true; void quip.offsetWidth; quip.hidden = false;
    clearTimeout(quipTimer);
    quipTimer = setTimeout(function () { quip.hidden = true; launch.classList.remove('is-react'); }, 2400);
  });

  /* ---------- restore + first visit greeting ---------- */
  state.log.forEach(function (m) { renderMsg(m); });
  if (state.open && !MOBILE.matches) open();
  if (!state.greeted && !state.log.length) {
    badge.hidden = false;
    setTimeout(function () { if (panel.hidden && !state.greeted) bubble.hidden = false; }, 3500);
  }
})();
