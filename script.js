// Paste the deployed Google Apps Script web-app URL here after setup.
// Leave blank until the Sheet webhook is deployed. FormSubmit email delivery still works.
const GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwSu_b0a9BANRMOWPOZ_ETMpqSJt4lp8VTsQhVD6ZT6Z-KrOrR1LfU0Tn90xOacnlyWPQ/exec';

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
  queryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!queryForm.checkValidity()) {
      queryForm.reportValidity();
      return;
    }

    const reference = 'INX-' + Date.now().toString().slice(-8);
    const payload = {
      Reference: reference,
      Name: document.getElementById('q-name').value.trim(),
      Email: document.getElementById('q-email').value.trim(),
      Phone: document.getElementById('q-phone').value.trim(),
      Country: document.getElementById('q-country').value.trim(),
      Category: document.getElementById('q-category').value,
      Deadline: document.getElementById('q-deadline').value,
      Goal: document.getElementById('q-goal').value.trim(),
      'Key facts': document.getElementById('q-details').value.trim(),
      'Terms accepted': 'Yes',
      'Form URL': window.location.origin + window.location.pathname
    };

    if (!GOOGLE_SHEETS_WEBHOOK) {
      showStatus('The enquiry service is temporarily unavailable. Please use the WhatsApp button at the bottom of the page.', 'error');
      return;
    }

    querySubmit.disabled = true;
    querySubmit.textContent = 'Submitting...';
    showStatus('Submitting your enquiry securely...', 'loading');

    // Send directly to the InfoNext UK Google Apps Script endpoint.
    // sendBeacon queues the small request without making the customer wait
    // for a third-party form service. The Apps Script stores it in the
    // dashboard and can send the notification email.
    const body = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
    let queued = false;

    if (navigator.sendBeacon) {
      queued = navigator.sendBeacon(GOOGLE_SHEETS_WEBHOOK, body);
    }

    if (!queued) {
      fetch(GOOGLE_SHEETS_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch((error) => {
        console.error('InfoNext UK enquiry submission error:', error);
      });
    }

    showStatus(
      'Thank you. Your enquiry has been submitted. Your reference is ' + reference +
      '. We will review the scope and contact you by email with the service, price and expected delivery time.',
      'success'
    );
    queryForm.reset();
    querySubmit.disabled = false;
    querySubmit.textContent = 'Submit query';
  });
}
