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
const queryStatus = document.getElementById('query-status');
const querySubmit = document.getElementById('query-submit');

function showStatus(message, type) {
  if (!queryStatus) return;
  queryStatus.textContent = message;
  queryStatus.className = 'query-status show ' + type;
}

if (queryForm) {
  queryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!queryForm.checkValidity()) {
      queryForm.reportValidity();
      return;
    }

    const reference = 'INX-' + Date.now().toString().slice(-8);
    const payload = {
      _subject: 'New InfoNext UK enquiry - ' + reference,
      _template: 'table',
      Reference: reference,
      Name: document.getElementById('q-name').value.trim(),
      Email: document.getElementById('q-email').value.trim(),
      Country: document.getElementById('q-country').value.trim(),
      Category: document.getElementById('q-category').value,
      Deadline: document.getElementById('q-deadline').value,
      Goal: document.getElementById('q-goal').value.trim(),
      'Key facts': document.getElementById('q-details').value.trim(),
      'Terms accepted': 'Yes'
    };

    querySubmit.disabled = true;
    querySubmit.textContent = 'Submitting...';
    showStatus('Submitting your enquiry securely...', 'loading');

    try {
      const response = await fetch('https://formsubmit.co/ajax/hello@infonextuk.co.uk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Submission failed');

      showStatus(
        'Thank you. Your enquiry has been submitted. Your reference is ' + reference +
        '. We will review the scope and contact you by email with the service, price and expected delivery time.',
        'success'
      );
      queryForm.reset();
    } catch (error) {
      showStatus(
        'We could not submit the form just now. Please try again. If the problem continues, use the WhatsApp button at the bottom of the page.',
        'error'
      );
    } finally {
      querySubmit.disabled = false;
      querySubmit.textContent = 'Submit query';
    }
  });
}
