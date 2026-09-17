(() => {
  const browser = document.querySelector('.project-browser');
  if (!browser) return;
  const buttons = [...browser.querySelectorAll('[data-project-filter]')];
  const cards = [...document.querySelectorAll('.work-card')];
  const groups = [...document.querySelectorAll('.project-group')];
  const count = document.getElementById('project-count');
  function filter(category) {
    let visible = 0;
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) visible++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category)));
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.work-card')].some(card => !card.hidden); });
    count.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
  }
  buttons.forEach(button => button.addEventListener('click', () => filter(button.dataset.projectFilter)));
  browser.hidden = false;
})();
