/* Parado World: homepage adventure and shared section previews. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main) return;
  const home = /(?:^|\/)index\.html$|\/$/.test(location.pathname);
  const places = [
    {name:'Cozy cottage',category:'About me',x:3,y:3,color:'#efb6d2',title:'Hi, I’m Sky.',text:'A Computer Science student at De La Salle University, majoring in Network and Information Security. I build software, explore application security, and bring a little curiosity to everything I do.',url:'index.html#profile',cards:['DLSU · Computer Science','Network & Information Security','Security + software + curiosity']},
    {name:'Build lab',category:'Projects',x:12,y:3,color:'#75def2',title:'A desk full of experiments.',text:'From CampusCart and a Google Docs add-on to networking utilities and security tools: explore the things I’ve built and the problems they solve.',url:'projects.html',cards:['CampusCart · full-stack','cito-docs-addon · Google Workspace','Networking utilities · TCP/IP','AI web-app fuzzer · security']},
    {name:'Trophy tower',category:'Certificates',x:17,y:8,color:'#ffd074',title:'Small steps. Shiny milestones.',text:'CTF Champion with Team Prompt Patrol, ISC2 Certified in Cybersecurity, and Junior VAPT Practitioner. This is my collection of certifications, training, and achievements.',url:'certs.html',cards:['CTF Champion · Team Prompt Patrol','ISC2 Certified in Cybersecurity','Junior VAPT Practitioner']},
    {name:'Memory grove',category:'Experience',x:9,y:11,color:'#9be5a8',title:'Every chapter adds something.',text:'A journey through college, senior high, and junior high: academic awards, leadership, debate, and community work. Open the campaign log to see the full story.',url:'experience.html',cards:['College · DLSU','Leadership & debate','Community & volunteering']},
    {name:'Post office',category:'Contact',x:3,y:9,color:'#ffae87',title:'Let’s make something together.',text:'Have a project, opportunity, or idea? Find my email, GitHub, and LinkedIn on the contact page. I’d love to hear what you’re working on.',url:'contact.html',cards:['Projects & collaboration','Opportunities & conversations','Email · GitHub · LinkedIn']},
    {name:'Skill garden',category:'Skills',x:17,y:3,color:'#b7a1ff',title:'What’s in my toolkit?',text:'Python, Java, C++, JavaScript, TypeScript, and SQL, alongside full-stack development, REST APIs, Git, and network security. My security toolkit includes VAPT, secure coding, and OWASP fundamentals.',url:'skills.html',cards:['Python · Java · C++','JavaScript · TypeScript · SQL','REST APIs · Git · full-stack','VAPT · secure coding · networks']}
  ];
  const storageKey = 'parado.adventure.v2';
  let collected = new Set();
  try {const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))collected=new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<places.length));}catch{}
  const banner=document.createElement('section');
  banner.className='quest-banner';
  banner.innerHTML='<span class="quest-mini" aria-hidden="true"></span><div><span class="quest-kicker">BACK TO PARADO WORLD</span><h2>A portfolio you can wander through.</h2><p>Meet Sky and preview every stop before opening a page.</p></div><button type="button" class="quest-button quest-launch" aria-haspopup="dialog">Explore the world</button>';
  if(!home){const footer=main.querySelector('.footer');if(footer)footer.before(banner);else main.append(banner);}
  const world=document.createElement(home?'section':'dialog');
  world.className='quest-dialog'+(home?' quest-home':'');
  world.setAttribute('aria-labelledby','quest-title');
  world.innerHTML=`
    <header class="quest-header"><div><span class="quest-kicker">SKY PARADO / A LITTLE WORLD OF MY OWN</span><h2 id="quest-title">Choose your adventure.</h2><p class="quest-intro">Security student. Software builder. Curious human.<br>Pick a place — I’ll show you around.</p></div><div class="quest-header-actions">${home?'<a class="quest-button" href="#character">Character sheet ↓</a>':'<button type="button" class="quest-button" data-close>Back to page ×</button>'}<button type="button" class="quest-motion"></button></div></header>
    <div class="quest-hud"><span>✦ PLAY AS SKY</span><span data-score></span></div>
    <progress class="quest-progress" max="6" value="0" aria-label="Places discovered"></progress>
    <div class="quest-layout"><div class="quest-world-column">
      <div class="quest-map"><canvas class="quest-world-canvas" width="420" height="280" tabindex="0" aria-label="Explore Sky's world using arrow keys or W A S D. Press E to preview a nearby place. You can also click or tap a destination on the map." aria-describedby="quest-help"></canvas><div class="quest-map-labels"></div></div>
      <p id="quest-help" class="quest-help">WASD / arrows to walk · E to explore · Click a place to visit<br>You’re Sky! Click the map or use the controls to move.</p>
      <div class="quest-controls" aria-label="Movement controls"><button type="button" data-move="0,-1" aria-label="Move up">↑</button><button type="button" data-move="-1,0" aria-label="Move left">←</button><button type="button" data-move="0,1" aria-label="Move down">↓</button><button type="button" data-move="1,0" aria-label="Move right">→</button><button type="button" data-explore>Explore [E]</button></div>
      <p class="quest-near" data-near role="status"></p>
    </div><aside class="quest-journal"><span class="quest-kicker" data-category>YOUR LITTLE TOUR GUIDE</span><canvas class="quest-scene" width="240" height="100" aria-hidden="true"></canvas><div class="quest-summary" aria-live="polite"><h3 data-title>Hi! I’m pixel Sky.</h3><p data-story>Welcome to my corner of the internet. Choose a destination to get a quick introduction before diving into the full section.</p></div><div class="quest-preview-card"><span data-card>Six places. One curious explorer.</span><button type="button" data-next aria-label="Next preview card" hidden>Next →</button></div><a class="quest-button" data-link hidden></a><div class="quest-destinations" aria-label="Choose a section"></div><p data-reward role="status"></p><button type="button" class="quest-reset">Restart discoveries</button></aside></div>
    <footer class="quest-footer">Take your time. Stay curious. <span data-save>Discoveries saved on this device.</span></footer>`;
  if(home){
    const footer=main.querySelector('.footer');
    if(footer)footer.before(world);else main.append(world);
    document.querySelector('#boot')?.remove();
  }else document.body.append(world);
  const $=s=>world.querySelector(s);
  const canvas=$('.quest-world-canvas'),ctx=canvas.getContext('2d');
  const scene=$('.quest-scene'),sc=scene.getContext('2d');
  const motionMedia=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false,timer=null,frame=0,selected=-1,card=0,lastMove=0;
  let player={x:7,y:7},facing=1;
  try{paused=localStorage.getItem('parado.pixel-motion')==='off';}catch{}
  const enabled=()=>!paused&&!motionMedia.matches;
  const active=()=>home||world.open;
  const motion=$('.quest-motion');
  function syncMotion(){
    clearInterval(timer);timer=null;
    document.documentElement.dataset.pixelMotion=enabled()?'on':'off';
    motion.textContent=enabled()?'Pause motion':'Motion paused';
    motion.setAttribute('aria-pressed',String(!enabled()));
    motion.disabled=motionMedia.matches;
    if(enabled()&&active()&&!document.hidden)timer=setInterval(()=>{
      frame++;

      draw();drawScene();
    },140);
    draw();drawScene();syncCompanion();
  }
  motion.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('parado.pixel-motion',paused?'off':'on');}catch{}syncMotion();});
  motionMedia.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncMotion);
  const destinations=$('.quest-destinations');
  places.forEach((p,i)=>{
    const b=document.createElement('button');b.type='button';b.style.setProperty('--stop-color',p.color);
    b.addEventListener('click',()=>visit(i));destinations.append(b);
    const label=document.createElement('button');label.type='button';label.className='quest-map-stop';
    label.style.left=(p.x+.5)/21*100+'%';label.style.top=(p.y+1.6)/14*100+'%';
    label.style.setProperty('--stop-color',p.color);label.textContent=p.category;
    label.setAttribute('aria-label',p.name+' ['+p.category+'] — preview');
    label.addEventListener('click',()=>visit(i));$('.quest-map-labels').append(label);
  });
  function refresh(){
    $('[data-score]').textContent=collected.size+' / 6 PLACES DISCOVERED';
    $('progress').value=collected.size;
    [...destinations.children].forEach((b,i)=>{
      b.textContent=(collected.has(i)?'✓ ':'◇ ')+places[i].name+' ['+places[i].category+']';
      b.setAttribute('aria-pressed',String(selected===i));
    });
    $('[data-reward]').textContent=collected.size===6?'★ World explored! Thanks for getting to know me.':'';
  }
  function previewCard(){ $('[data-card]').textContent=selected<0?'Six places. One curious explorer.':places[selected].cards[card];drawScene(); }
  function discover(i){
    selected=i;card=0;collected.add(i);const p=places[i];
    world.style.setProperty('--scene-color',p.color);
    $('[data-category]').textContent=p.name+' ['+p.category+']';
    $('[data-title]').textContent=p.title;$('[data-story]').textContent=p.text;
    $('[data-link]').hidden=false;$('[data-link]').href=p.url;$('[data-link]').textContent='Explore '+p.category.toLowerCase()+' →';
    $('[data-next]').hidden=false;
    try{localStorage.setItem(storageKey,JSON.stringify([...collected]));}catch{$('[data-save]').textContent='Discoveries saved for this visit only.';}
    previewCard();refresh();
    $('[data-near]').textContent=p.category+' preview ready — read the introduction, then open the full section.';
  }
  function visit(i){player={x:places[i].x,y:places[i].y+1};move(0,0);discover(i);draw();}
  function near(){return places.findIndex(p=>Math.abs(p.x-player.x)+Math.abs(p.y-player.y)<=1);}
  function move(dx,dy){
    if(dx)facing=Math.sign(dx);
    player.x=Math.max(1,Math.min(19,player.x+dx));player.y=Math.max(1,Math.min(12,player.y+dy));
    
    const i=near();$('[data-explore]').disabled=i<0;
    $('[data-near]').textContent=i<0?'Follow the paths, or select any labeled destination.':places[i].name+' ['+places[i].category+'] — press E for a preview.';
    draw();
  }
  function explore(){const i=near();if(i>=0)discover(i);}
  $('[data-explore]').addEventListener('click',explore);
  $('[data-next]').addEventListener('click',()=>{if(selected<0)return;card=(card+1)%places[selected].cards.length;previewCard();});
  world.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>move(...b.dataset.move.split(',').map(Number))));

  canvas.addEventListener('click',e=>{
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*21,y=(e.clientY-r.top)/r.height*14;
    const i=places.findIndex(p=>Math.abs(p.x+.5-x)<1.2&&Math.abs(p.y+.5-y)<1.4);
    if(i>=0)visit(i);else{player={x:Math.round(x),y:Math.round(y)};move(0,0);}canvas.focus();
  });
  window.addEventListener('keydown',e=>{
    if(!active()||e.key==='Tab'||e.key==='Escape')return;
    if(home&&!world.contains(document.activeElement))return;
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const dirs={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
    const d=dirs[e.key.toLowerCase()];
    if(d||e.key.toLowerCase()==='e'){e.preventDefault();e.stopImmediatePropagation();if(d){if(!e.repeat||performance.now()-lastMove>95){move(...d);lastMove=performance.now();}}else explore();}
  },true);
  if(!home){
    banner.querySelector('button').addEventListener('click',()=>{world.showModal();document.body.classList.add('quest-playing');canvas.focus();syncMotion();});
    $('[data-close]').addEventListener('click',()=>world.close());
    world.addEventListener('close',()=>{clearInterval(timer);timer=null;document.body.classList.remove('quest-playing');banner.querySelector('button').focus();});
  }
  $('.quest-reset').addEventListener('click',()=>{
    collected.clear();selected=-1;card=0;player={x:7,y:7};
    try{localStorage.removeItem(storageKey);}catch{}
    $('[data-category]').textContent='YOUR LITTLE TOUR GUIDE';$('[data-title]').textContent='A fresh little adventure.';
    $('[data-story]').textContent='Pick a destination for a short introduction. Pixel Sky will come along for the ride.';
    $('[data-link]').hidden=true;$('[data-next]').hidden=true;previewCard();refresh();move(0,0);
  });
  function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
  function sprite(c,x,y,scale=1,flip=1,pose=frame){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale*flip,scale);
    const hair='#51334d',skin='#f5bd9a',dress='#e788bb',step=enabled()?pose%4:0;
    box(c,-5,0,10,11,hair);box(c,-7,4,3,11,hair);box(c,4,4,3,11,hair);
    box(c,-3,4,6,6,skin);box(c,1,5,1,2,'#32263d');
    box(c,-5,0,3,3,'#ffe197');box(c,-4,10,8,4,dress);box(c,-6,14,12,4,dress);
    box(c,-7,11,3,4,skin);box(c,4,11+(step<2?0:-2),3,4,skin);
    box(c,-4,18,3,3+(step===1?1:0),'#ffdfc6');box(c,1,18,3,3+(step===3?1:0),'#ffdfc6');
    box(c,-5,21,4,2,'#48394e');box(c,1,21,4,2,'#48394e');c.restore();
  }
  function draw(){
    if(!ctx)return;ctx.imageSmoothingEnabled=false;
    const b=(x,y,w,h,c)=>box(ctx,x,y,w,h,c),t=enabled()?frame:0;
    b(0,0,420,280,'#549a85');
    for(let y=0;y<14;y++)for(let x=0;x<21;x++){
      const region=x>14?(y>6?'#85849e':'#9082a8'):(x>8?'#55959a':(y>7?'#639477':'#649c83'));
      b(x*20,y*20,20,20,region);
      if((x*7+y*3)%5===0){b(x*20+5,y*20+12,2,3,'#a1c79b');b(x*20+8,y*20+10,2,4,'#3b776c');}
      if(y===7||x===7||(y===4&&x>=3&&x<=17)||(y===10&&x>=3&&x<=9)||(x===17&&y>=4&&y<=9)){
        b(x*20,y*20,20,20,'#d1b797');b(x*20+4,y*20+5,5,2,'#bba084');b(x*20+13,y*20+14,3,2,'#e5cfaa');
      }
    }
    // A rippling pond, stepping stones, and flower beds.
    b(205,166,58,30,'#467eaa');b(213,159,40,44,'#559fc0');b(220+(t%6)*3,173,12,2,'#a9dce4');b(232-(t%5)*2,188,13,2,'#87cbd9');
    for(let i=0;i<32;i++){const x=(i*83)%408+5,y=(i*47)%266+5;if(y>130&&y<163)continue;b(x,y,2,5,'#396f64');b(x-2,y-2,6,3,['#f7b5d0','#ffe09c','#bcb7ed'][i%3]);}
    [0,2,5,10,14,18,20].forEach((x,i)=>[0,13].forEach(y=>{
      const sway=enabled()&&t%6<3?1:0;b(x*20+8,y*20+10,4,10,'#755667');
      b(x*20+2+sway,y*20+2,16,12,i%3===0?'#d78fad':'#397a70');b(x*20+5+sway,y*20,10,7,i%3===0?'#edb2c7':'#77b499');
    }));
    places.forEach((p,i)=>{
      const x=p.x*20,y=p.y*20;
      b(x-9,y+17,38,5,'#426f6a');
      b(x-6,y-7,32,26,i===2?'#e0c38e':i===1?'#c3e3db':'#f1d5b7');
      if(i===3){b(x+7,y-15,6,34,'#745264');b(x-9,y-16,37,17,'#6caf8c');b(x-3,y-23,24,14,'#a5cf9e');}
      else{
        b(x-10,y-12,40,6,p.color);b(x-5,y-18,30,6,p.color);b(x,y-23,20,5,p.color);
        b(x+5,y+5,9,14,'#67506f');b(x-2,y-2,6,6,t%8<4?'#fff0b8':p.color);b(x+17,y-2,5,6,p.color);
        if(i===1){b(x+21,y-26-(t%4),4,4,'#bde4dd');b(x+23,y-34-(t%4),5,4,'#deece0');}
        if(i===2){b(x+7,y-31,7,6,'#ffdf7c');b(x+9,y-25,3,5,'#ffdf7c');}
        if(i===4){b(x+4,y-10,13,8,'#fff0d6');b(x+7,y-7,6,2,'#db826c');}
        if(i===5){b(x-11,y+8,8,12,'#9173a5');b(x-10,y+3,6,7,'#a7d2a1');}
      }
      if(near()===i)b(x-9,y+23,38,2,'#fff2bf');
    });
    // A little wandering butterfly.
    const butterflyX=95+Math.round(Math.sin(t/9)*25),butterflyY=103+(t%4<2?0:3);
    b(butterflyX,butterflyY,2,5,'#554365');b(butterflyX-3,butterflyY-1,3,t%2?3:5,'#ffdda5');b(butterflyX+2,butterflyY-1,3,t%2?3:5,'#ffd0d7');
    b(player.x*20+3,player.y*20+21,14,3,'#49736f');
    sprite(ctx,player.x*20+10,player.y*20-2,1,facing);
  }
  function drawScene(){
    if(!sc)return;sc.imageSmoothingEnabled=false;
    const b=(x,y,w,h,c)=>box(sc,x,y,w,h,c),t=enabled()?frame:0,p=places[selected]||places[0];
    const light=document.documentElement.dataset.theme==='light';
    b(0,0,240,100,light?'#f3e5d8':'#242940');b(0,74,240,26,light?'#d6bbbc':'#45415f');
    b(12,12,51,43,'#7cb5c6');b(16,16,43,35,'#b8dbe0');b(35,13,4,42,'#eee0c4');b(12,32,50,3,'#eee0c4');
    b(186,20,39,5,p.color);b(191,10,5,10,'#a2cda5');b(201,6,5,14,'#eeb6cb');
    const bob=t%4<2?0:-1;
    sprite(sc,88,42+bob,2,1);
    if(selected===1||selected===5){
      // Sky flips through a little stack of project / skill cards.
      b(116,68,91,6,'#d8b28f');b(121,74,5,20,'#b28b83');b(195,74,5,20,'#b28b83');
      b(133,34,51,31,'#524e72');b(137,38,43,23,p.color);b(144,44,24,2,'#3a5467');b(144,50,18+(t%3)*3,2,'#3a5467');
      const flip=enabled()?t%6:0;b(166+flip,49-flip,27,18,'#ffebc6');b(170+flip,53-flip,17,2,'#bf8a9d');b(170+flip,58-flip,12,2,'#bf8a9d');
    }else if(selected===2){
      b(142,65,55,7,'#d9bb99');b(159,36,23,18,'#ffcf75');b(154,38,5,11,'#f4b65f');b(182,38,5,11,'#f4b65f');b(168,54,5,9,'#ffe097');b(161,62,20,3,'#ffe097');b(195,30+(t%3)*2,3,3,'#fff0b3');
    }else if(selected===4){
      b(144,54-(t%5),43,25,'#f1c8b7');b(151,61-(t%5),29,3,'#be778d');b(160,64-(t%5),11,3,'#be778d');
    }else if(selected===3){
      b(131,54,68,23,'#f3d9b7');b(163,53,3,25,'#b08a8d');b(138,59,18,2,'#a88997');b(172,59,18,2,'#a88997');b(138,65,18,2,'#a88997');
    }else{
      b(150,62,33,15,'#bf9bbd');b(163,32,5,30,'#7cab8f');b(150,34,15,9,'#acd2a5');b(168,42,14,8,'#8ebea0');b(163,27+(t%3),7,7,'#f7c3d6');
    }
  }

  // The document companion shares Sky's sprite and carries her position between pages.
  const companion=document.createElement('canvas');
  companion.className='sky-companion';companion.width=24;companion.height=30;
  companion.setAttribute('aria-hidden','true');
  const walkway=document.createElement('div');
  walkway.className='sky-walkway';
  // Social profiles shared across the site.
  const gardenProfiles = [
    {name:'Facebook', url:'https://www.facebook.com/skyhannah.parado.875/', color:'#acc9ef', icon:'<path d="M14 21v-8h3l1-4h-4V7c0-1 1-2 2-2h2V2h-3c-4 0-5 2-5 5v2H7v4h3v8z"/>'},
    {name:'GitHub', url:'https://github.com/skyparado', color:'#d6c0ee', icon:'<path d="M5 8 4 3l5 3h6l5-3-1 5c2 2 2 7-1 9-1 1-3 1-4 1v4h-4v-4c-4 1-6-1-7-4l2-1c1 2 2 3 5 2-4-1-6-4-5-7z"/>'},
    {name:'Instagram', url:'https://www.instagram.com/sky.parado/', color:'#f1bad3', icon:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1.5"/>'},
    {name:'LinkedIn', url:'https://linkedin.com/in/sky-hannah-parado-3a9218256', color:'#a9dcd9', icon:'<path d="M3 9h4v12H3zM9 9h4v2c2-4 8-3 8 2v8h-4v-7c0-3-4-3-4 0v7H9z"/><circle cx="5" cy="5" r="2"/>'},
    {name:'Gmail', url:'mailto:sky.parado@gmail.com', color:'#f5d6a5', icon:'<path d="M3 6h18v13H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 7 9-7" fill="none" stroke="currentColor" stroke-width="2"/>'}
  ];
  const tree=(x,pink=false)=>`<g transform="translate(${x} 0)"><path fill="#896779" d="M28 48h8v40h-8z"/><path fill="${pink?'#b9789d':'#4e897c'}" d="M12 22h40v10h8v29H4V32h8z"/><path fill="${pink?'#e7a9c8':'#87b99b'}" d="M20 10h24v8h10v25H10V26h10z"/><path fill="${pink?'#ffd1df':'#b7d5ad'}" d="M22 16h16v6H22zM14 29h9v6h-9z"/><path fill="${pink?'#f5c2d7':'#a1c6a2'}" d="M42 43h8v6h-8z"/></g>`;
  walkway.innerHTML=`
    <div class="sky-garden-scenery" aria-hidden="true">
      <svg class="garden-trees garden-trees-left" viewBox="0 0 210 96" shape-rendering="crispEdges">${tree(0)}${tree(66,true)}${tree(138)}</svg>
      <svg class="garden-trees garden-trees-right" viewBox="0 0 210 96" shape-rendering="crispEdges">${tree(0,true)}${tree(70)}${tree(140,true)}</svg>
      <div class="garden-flowers"></div><span class="garden-mushroom"></span><span class="garden-mushroom second"></span>
      <span class="garden-sparkle one">+</span><span class="garden-sparkle two">+</span>
    </div>
    <nav class="garden-socials" aria-label="Find Sky online">
      <span class="garden-caption">a little corner of my internet</span>
      <div class="garden-social-links">${gardenProfiles.map(p=>{
        const contents=`<span class="garden-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${p.icon}</svg></span><span class="garden-social-name">${p.name}</span>`;
        return p.url?`<a class="garden-social" style="--social-color:${p.color}" href="${p.url}" ${p.url.startsWith('https:')?'target="_blank" rel="noopener noreferrer"':''} aria-label="${p.name}${p.url.startsWith('https:')?' (opens in a new tab)':''}">${contents}</a>`:`<button type="button" class="garden-social" style="--social-color:${p.color}" aria-disabled="true" aria-label="${p.name}: coming soon" title="${p.name}: coming soon">${contents}<span class="garden-soon">soon</span></button>`;
      }).join('')}</div>
    </nav>`;
  walkway.append(companion);document.body.append(walkway);
  document.body.classList.add('has-sky-walkway');
  const companionContext=companion.getContext('2d');
  let companionX=24,companionFacing=1;
  let destinationX=companionX,companionRAF=null,walkFrame=0,lastTick=0;
  try{
    const saved=JSON.parse(sessionStorage.getItem('parado.sky-position')||'null');
    if(saved&&Number.isFinite(saved.x)){
      companionX=Math.max(8,Math.min(innerWidth-56,saved.x*innerWidth));
      destinationX=companionX;
    }
  }catch{}
  function paintCompanion(walking=false){
    if(!companionContext)return;
    companionContext.clearRect(0,0,24,30);
    companionContext.imageSmoothingEnabled=false;
    box(companionContext,5,26,14,2,'#30253d55');
    sprite(companionContext,12,2,1,companionFacing,walking?walkFrame:0);
    companion.style.transform='translateX('+Math.round(companionX)+'px)';
  }
  function tickCompanion(time){
    companionRAF=null;
    if(!enabled()||document.hidden||companion.hidden)return;
    if(time-lastTick>=70){
      lastTick=time;
      const dx=destinationX-companionX;
      const distance=Math.abs(dx);
      if(distance<2){paintCompanion();return;}
      const speed=Math.min(14,distance);
      companionX+=Math.sign(dx)*speed;
      if(Math.abs(dx)>1)companionFacing=Math.sign(dx);
      walkFrame=(walkFrame+1)%4;paintCompanion(true);
    }
    companionRAF=requestAnimationFrame(tickCompanion);
  }
  function syncCompanion(){
    if(companionRAF!==null)cancelAnimationFrame(companionRAF);
    companionRAF=null;
    if(!enabled()||document.hidden){destinationX=companionX;}
    paintCompanion();
  }
  function followPointer(e){
    // Sky stays on her footer path; only the pointer's horizontal position matters.
    if(!enabled())return;
    destinationX=Math.max(8,Math.min(innerWidth-56,e.clientX-24));
    if(companionRAF===null)companionRAF=requestAnimationFrame(tickCompanion);
  }
  document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')followPointer(e);},{passive:true});
  document.addEventListener('pointerdown',followPointer,{passive:true});
  window.addEventListener('resize',()=>{
    companionX=Math.max(8,Math.min(innerWidth-56,companionX));
    destinationX=companionX;paintCompanion();
  });
  window.addEventListener('pagehide',()=>{
    try{sessionStorage.setItem('parado.sky-position',JSON.stringify({x:companionX/innerWidth}));}catch{}
    if(companionRAF!==null)cancelAnimationFrame(companionRAF);
    companionRAF=null;
  });
  paintCompanion();

  new MutationObserver(()=>drawScene()).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  refresh();move(0,0);syncMotion();
})();

