const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const queryForm = document.getElementById('query-form');
if (queryForm) {
  queryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('q-name').value.trim();
    const country = document.getElementById('q-country').value.trim();
    const category = document.getElementById('q-category').value;
    const deadline = document.getElementById('q-deadline').value;
    const goal = document.getElementById('q-goal').value.trim();
    const details = document.getElementById('q-details').value.trim();

    const message = [
      'Hi InfoNext UK, I would like to submit a query.',
      '',
      'Name: ' + name,
      'Country: ' + country,
      'Category: ' + category,
      'Deadline: ' + deadline,
      '',
      'What I am trying to achieve:',
      goal,
      '',
      'Key facts:',
      details,
      '',
      'I have read the Terms & Conditions and Privacy Notice.'
    ].join('\n');

    window.open('https://wa.me/447345676448?text=' + encodeURIComponent(message), '_blank', 'noopener');
  });
}
