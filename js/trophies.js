(() => {
  'use strict';
  const cabinet = document.querySelector('.trophy-case');
  if (!cabinet) return;
  const trophies = [...cabinet.querySelectorAll('.trophy-slot')];
  const panels = [...cabinet.querySelectorAll('.trophy-info')];
  let selected = -1;
  function inspect(index) {
    if (index === selected) return;
    selected = index;
    trophies.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    panels.forEach((panel,i)=>panel.hidden=i!==index);
    cabinet.querySelector('.trophy-announcement').textContent=panels[index].querySelector('h3').textContent;
  }
  trophies.forEach((button,index)=>{
    button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')inspect(index);});
    button.addEventListener('focus',()=>inspect(index));
    button.addEventListener('click',()=>inspect(index));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%trophies.length;
      else if(event.key==='ArrowLeft')next=(index-1+trophies.length)%trophies.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=trophies.length-1;
      if(next!==undefined){event.preventDefault();trophies[next].focus();}
    });
  });
  cabinet.querySelectorAll('[data-certificate]').forEach(button=>{
    const card=[...document.querySelectorAll('.cert[data-full]')].find(card=>card.dataset.full===button.dataset.certificate);
    if(!card){button.hidden=true;return;}
    button.addEventListener('click',()=>card.click());
  });
  cabinet.classList.add('is-interactive');
  inspect(0);
})();
