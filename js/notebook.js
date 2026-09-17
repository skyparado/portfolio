/* A bound notebook with accessible chapter tabs and real page navigation. */
(() => {
  'use strict';
  const book = document.getElementById('experience-notebook');
  if (!book) return;
  const pages = [...book.querySelectorAll('.notebook-page')];
  const tabs = [...book.querySelectorAll('.notebook-tabs a')];
  let current = 0;
  book.querySelector('.notebook-tabs').setAttribute('role','tablist');
  book.querySelectorAll('.notebook-controls').forEach(el=>el.hidden=false);
  tabs.forEach((tab,i)=>{
    tab.id='notebook-tab-'+i;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',pages[i].id);
    pages[i].setAttribute('role','tabpanel');pages[i].setAttribute('aria-labelledby',tab.id);pages[i].tabIndex=0;
    tab.addEventListener('click',event=>{event.preventDefault();show(i,true,false);});
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();show(next,true,false);tabs[next].focus();}
    });
  });
  function show(index,save=false,scroll=false){
    current=Math.max(0,Math.min(pages.length-1,index));
    pages.forEach((page,i)=>page.hidden=i!==current);
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===current));tab.tabIndex=i===current?0:-1;});
    book.querySelectorAll('[data-notebook-prev]').forEach(b=>b.disabled=current===0);
    book.querySelectorAll('[data-notebook-next]').forEach(b=>b.disabled=current===pages.length-1);
    book.querySelectorAll('.notebook-page-number').forEach(el=>el.textContent='Page '+(current+1)+' / '+pages.length+' - '+tabs[current].textContent);
    if(save)history.replaceState(null,'','#'+pages[current].id);
    if(scroll){book.scrollIntoView({block:'start'});pages[current].focus({preventScroll:true});}
  }
  book.querySelectorAll('[data-notebook-prev]').forEach(b=>b.addEventListener('click',()=>show(current-1,true,true)));
  book.querySelectorAll('[data-notebook-next]').forEach(b=>b.addEventListener('click',()=>show(current+1,true,true)));
  function fromHash(){const i=pages.findIndex(p=>p.id===location.hash.slice(1));show(i<0?0:i);if(i>=0)requestAnimationFrame(()=>book.scrollIntoView({block:'start'}));}
  window.addEventListener('hashchange',fromHash);
  book.classList.add('is-paged');fromHash();
})();
