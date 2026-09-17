/* Skill garden: local, evidence-backed search. No generated skill claims. */
(() => {
  'use strict';
  const explorer = document.getElementById('skill-explorer');
  if (!explorer) return;
  const categories = {all:'All skills',code:'Code',security:'Security',web:'Web & tools',network:'Networking',people:'People & leadership'};
  const inventory = ['Listed in my portfolio skill inventory.', 'certs.html#loadout'];
  const skills = [
    ['Python','code','py scripting programming','Python is part of my security and networking project toolkit.','My AI web-app scanner and custom networking utilities list Python.','projects.html'],
    ['Java','code','jvm programming','Java is one of the languages in my networking toolkit.','My network programming projects list Java alongside Python and sockets.','projects.html'],
    ['C++','code','cpp cplusplus c plus plus programming','C++ is one of the programming languages in my toolkit.',...inventory],
    ['JavaScript','code','js javascript programming frontend','I worked on a campus marketplace using JavaScript.','For CampusCart, I led the frontend and helped harden the backend as part of a five-person team.','projects.html'],
    ['TypeScript','code','ts typescript programming','TypeScript is part of my Google Workspace add-on project.','The cito-docs-addon project lists TypeScript, Apps Script, and APIs.','projects.html'],
    ['SQL','code','database databases query programming','I used SQL in a campus marketplace with attention to safe database access.','CampusCart includes parameterized SQL and sanitized inputs.','projects.html'],
    ['HTML','code','html5 markup frontend','HTML is part of my listed web-development toolkit.',...inventory],
    ['CSS','code','css3 styling frontend','CSS is part of my listed web-development toolkit.',...inventory],
    ['VAPT','security','pentest pentesting penetration testing vulnerability assessment','My training covers vulnerability assessment, validation, and security reporting.','Junior VAPT Practitioner training through NSSECU2 at De La Salle University.','certs.html'],
    ['OWASP Top 10','security','owasp application appsec web security','OWASP Top 10 is part of my application-security toolkit.','My AI web-app scanner project lists OWASP Top 10 and reports findings across seven vulnerability classes.','projects.html'],
    ['Nmap','security','network scanning enumeration','Nmap is included in my security-tool inventory.',...inventory],
    ['Burp Suite','security','burp web testing proxy','Burp Suite is included in my web-security toolkit.',...inventory],
    ['CVSS v3.1','security','cvss scoring risk severity','CVSS scoring is part of my security training.','My Junior VAPT Practitioner training includes CVSS v3.1 scoring and technical reporting.','certs.html'],
    ['Secure coding','security','secure development application security input validation','I have applied secure-coding practices to a team-built web application.','CampusCart includes secure authentication, input sanitization, and parameterized SQL.','projects.html'],
    ['Secure SDLC','security','sdlc threat modeling threat modelling software development lifecycle','I worked with security considerations from design through release.','The CampusCart project describes threat modelling and backend hardening.','projects.html'],
    ['CTF','security','capture the flag competitions cybersecurity','I have put my security learning into practice through Capture The Flag competitions.','DLSU CTF champion; ISO CTF 2026 second place; K17 CTF 2026 team placement of 152 out of 682.','certs.html'],
    ['Full-stack web','web','fullstack full stack frontend backend web development','I have worked across the frontend and backend of a web application.','CampusCart is an end-to-end campus marketplace built with a team of five.','projects.html'],
    ['REST APIs','web','rest api apis endpoints integration','REST APIs are part of my listed development toolkit.',...inventory],
    ['Git / GitHub','web','git github version control repositories','Git and GitHub are part of my development toolkit.','My portfolio links to repositories for citation tools, networking utilities, and other builds.','projects.html'],
    ['Apps Script','web','google workspace google apps script automation','I have worked on a Google Workspace citation add-on.','cito-docs-addon lists Apps Script, TypeScript, and API work.','projects.html'],
    ['TCP/IP','network','tcp ip networking protocols','TCP/IP is part of my networking toolkit.',...inventory],
    ['ICMP','network','ping traceroute protocols','I have built utilities around ICMP networking behavior.','My projects include a custom ping utility and traceroute using ICMP.','projects.html'],
    ['Sockets','network','socket raw sockets network programming','Socket programming is part of my networking projects.','My network programming work includes ping, traceroute, and a VoIP simulator.','projects.html'],
    ['Packet analysis','network','packets traffic analysis network analysis','Packet analysis is included in my networking skill inventory.',...inventory],
    ['Leadership','people','team leadership management leading','I have led organization work, project teams, and events.','Roles include CIDA Vice President, HackerCup Corporate Relations Assistant Team Lead, and community-project head.','experience.html#senior-high'],
    ['Corporate relations','people','sponsorship sponsorships partnerships externals','I have helped secure sponsorships and coordinate partnerships.','As HackerCup 2026 Corporate Relations Assistant Team Lead, I worked with technology companies and coordinated committees.','experience.html#college'],
    ['Event management','people','events logistics organizing organisation organization','I have helped organize national and international debate competitions.','CIDA work covered logistics, registration, adjudication, and finance.','experience.html#senior-high'],
    ['Fundraising','people','fundraiser funds charity sponsorship','I have worked on fundraising through competitions and community projects.','CIDA competitions earned over PHP 100,000 per cycle; VIV 2023 raised over PHP 100,000.','experience.html#senior-high'],
    ['Public speaking','people','speaking communication hosting emcee debate','Public speaking has been part of my debate and event-hosting experience.','My experience includes competition participation, Gavel Club hosting, and courtside correspondence.','experience.html#senior-high'],
    ['Debate','people','competitive debate debating training','I have competed in debate and helped train other students.','My experience includes Hijas Debate Society head trainer and Ignatian Debate League member.','experience.html#junior-high'],
    ['Graphics & layout','people','design graphic graphics publication marketing','I have contributed graphics and publication layouts.','My experience includes Interact marketing work and graphics for SEEDs and Blueprint.','experience.html#junior-high'],
    ['Photography','people','photo photographs camera video','Photography has been part of my publication and organization work.','I served as a publication photographer and coordinated video and photo assignments.','experience.html#junior-high']
  ].map(([name,category,aliases,description,evidence,url],i)=>({id:'skill-'+i,name,category,aliases,description,evidence,url}));
  const query = document.getElementById('skill-query');
  const cloud = document.getElementById('skill-cloud');
  const count = document.getElementById('skill-count');
  const clear = document.getElementById('skill-clear');
  const empty = document.querySelector('.skill-empty');
  const title = document.getElementById('skill-answer-title');
  const question = document.querySelector('.skill-question');
  const answer = document.querySelector('.skill-answer-text');
  const badge = document.querySelector('.skill-category');
  const evidence = document.querySelector('.skill-evidence');
  const related = document.querySelector('.skill-related');
  const announcement = document.getElementById('skill-announcement');
  let category = 'all', filtered = skills, selected = null;
  const normalize = value => value.toLowerCase().trim().replace(/\s+/g,' ');
  const shortcuts = {py:'Python',js:'JavaScript',ts:'TypeScript',cpp:'C++',cplusplus:'C++','c plus plus':'C++',owasp:'OWASP Top 10',cvss:'CVSS v3.1',git:'Git / GitHub',github:'Git / GitHub',fullstack:'Full-stack web','full stack':'Full-stack web',api:'REST APIs',apis:'REST APIs',rest:'REST APIs',pentest:'VAPT',pentesting:'VAPT'};
  const exact = (skill,q) => normalize(skill.name)===q || shortcuts[q]===skill.name;
  const colors = {code:'var(--cyan)',security:'var(--purple)',web:'var(--accent)',network:'var(--amber)',people:'var(--skill-green)'};
  const filterBox = document.querySelector('.skill-filters');
  Object.entries(categories).forEach(([key,label])=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.category=key;button.setAttribute('aria-pressed',String(key===category));
    button.addEventListener('click',()=>{category=key;filterBox.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();});
    filterBox.append(button);
  });
  function resetAnswer(mode='initial') {
    selected=null;badge.hidden=true;evidence.hidden=true;related.hidden=true;
    if(mode==='empty'){
      question.textContent=query.value.trim()?'You searched for “'+query.value.trim()+'”.':'No matches in this category.';
      title.textContent='That skill is not listed here.';
      answer.textContent='Try a broader word, choose All skills, or ask me about it through the contact page. This garden shows the skills documented in my portfolio.';
    }else if(mode==='matches'){
      question.textContent='Let’s find what you’re looking for.';
      title.textContent=filtered.length+' skills to explore';
      answer.textContent='Pick one of the floating words to see its story. You can also press Enter in the search box to inspect the closest match.';
    }else{
      question.textContent='Let’s explore my toolkit.';title.textContent='What would you like to know?';
      answer.textContent='Pick a floating skill, or type a word above. I’ll show you how it connects to my projects, training, or experience.';
    }
  }
  function inspect(skill,scroll=false) {
    selected=skill;question.textContent='You asked about '+skill.name+'.';badge.hidden=false;badge.textContent=categories[skill.category];
    title.textContent=skill.name;answer.textContent=skill.description;
    evidence.hidden=false;evidence.querySelector('p').textContent=skill.evidence;evidence.querySelector('a').href=skill.url;
    evidence.querySelector('a').textContent=(skill.url.includes('#loadout')?'View skill inventory':skill.url.startsWith('experience')?'View experience':skill.url.startsWith('certs')?'View achievements':'View projects')+' ↗';
    related.querySelector('div').replaceChildren();
    skills.filter(s=>s.category===skill.category&&s!==skill).slice(0,3).forEach(s=>{
      const b=document.createElement('button');b.type='button';b.textContent=s.name;b.addEventListener('click',()=>{query.value=s.name;category='all';filterBox.querySelectorAll('button').forEach(f=>f.setAttribute('aria-pressed',String(f.dataset.category==='all')));render();inspect(s);});related.querySelector('div').append(b);
    });
    related.hidden=!related.querySelector('div').children.length;
    cloud.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===skill.id)));
    announcement.textContent=skill.name+'. '+skill.description;
    if(scroll&&matchMedia('(max-width: 800px)').matches)document.querySelector('.skill-dialogue').scrollIntoView({block:'start'});
  }
  function render() {
    const q=normalize(query.value);
    filtered=skills.filter(s=>(category==='all'||s.category===category)&&(!q||normalize([s.name,s.aliases,categories[s.category]].join(' ')).includes(q)));
    filtered.sort((a,b)=>Number(exact(b,q))-Number(exact(a,q)));
    cloud.replaceChildren();
    filtered.forEach((s,i)=>{
      const b=document.createElement('button');b.type='button';b.className='skill-orb';b.textContent=s.name;b.dataset.id=s.id;
      b.style.setProperty('--orb-color',colors[s.category]);b.style.setProperty('--float-delay',(-i*.43)+'s');b.style.setProperty('--float-duration',(4+i%4)+'s');
      b.setAttribute('aria-pressed','false');b.setAttribute('aria-controls','skill-answer-title');
      b.addEventListener('click',()=>inspect(s,true));cloud.append(b);
    });
    count.textContent=filtered.length+' / '+skills.length+' skills';empty.hidden=filtered.length!==0;clear.hidden=!query.value;
    if(!filtered.length)resetAnswer('empty');
    else if(q&&(filtered.length===1||exact(filtered[0],q)))inspect(filtered[0]);
    else resetAnswer(q||category!=='all'?'matches':'initial');
  }
  document.querySelector('.skill-search').addEventListener('submit',event=>{event.preventDefault();if(filtered.length)inspect(filtered[0],true);else announcement.textContent='No matching skill is listed. Try another word or category.';});
  query.addEventListener('input',render);
  clear.addEventListener('click',()=>{query.value='';render();query.focus();});
  const motion = document.querySelector('.skill-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false;
  function syncMotion(){const forced=reduced.matches||document.documentElement.dataset.pixelMotion==='off';const stop=paused||forced;explorer.dataset.motion=stop?'off':'on';motion.disabled=forced;motion.textContent=stop?'Floating paused':'Pause floating';motion.setAttribute('aria-pressed',String(stop));}
  motion.addEventListener('click',()=>{paused=!paused;syncMotion();});reduced.addEventListener('change',syncMotion);
  new MutationObserver(syncMotion).observe(document.documentElement,{attributes:true,attributeFilter:['data-pixel-motion']});
  query.value=(new URLSearchParams(location.search).get('q')||'').slice(0,100);
  explorer.hidden=false;render();syncMotion();
})();
