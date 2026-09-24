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
    const email = document.getElementById('q-email').value.trim();
    const country = document.getElementById('q-country').value.trim();
    const category = document.getElementById('q-category').value;
    const deadline = document.getElementById('q-deadline').value;
    const goal = document.getElementById('q-goal').value.trim();
    const details = document.getElementById('q-details').value.trim();

    const subject = 'InfoNext UK enquiry - ' + category;
    const body = [
      'Hello InfoNext UK,',
      '',
      'I would like to submit a query.',
      '',
      'Full name: ' + name,
      'Email: ' + email,
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
      'I have read and agree to the Terms & Conditions and acknowledge the Privacy Notice.',
      '',
      'I understand that submitting this enquiry does not include a substantive answer. Please confirm the appropriate service, total price and expected delivery time before I decide whether to proceed.'
    ].join('\n');

    window.location.href =
      'mailto:hello@infonextuk.co.uk?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
}
