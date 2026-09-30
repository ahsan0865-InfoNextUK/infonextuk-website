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
      _url: window.location.origin + window.location.pathname,
      _replyto: document.getElementById('q-email').value.trim(),
      Reference: reference,
      Name: document.getElementById('q-name').value.trim(),
      Email: document.getElementById('q-email').value.trim(),
      Phone: document.getElementById('q-phone').value.trim(),
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

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_) {
        // Some FormSubmit error responses are HTML rather than JSON.
      }

      if (!response.ok || (responseData && responseData.success === false)) {
        const detail = responseData && responseData.message ? responseData.message : 'Submission failed';
        throw new Error(detail);
      }

      // Save the same enquiry to the Google Sheets dashboard separately.
      // Using a no-cors text POST avoids cross-origin preflight issues with Apps Script.
      if (GOOGLE_SHEETS_WEBHOOK) {
        try {
          await fetch(GOOGLE_SHEETS_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify(payload)
          });
        } catch (sheetError) {
          console.error('Google Sheets logging error:', sheetError);
        }
      }

      showStatus(
        'Thank you. Your enquiry has been submitted. Your reference is ' + reference +
        '. We will review the scope and contact you by email with the service, price and expected delivery time.',
        'success'
      );
      queryForm.reset();
    } catch (error) {
      console.error('InfoNext UK form submission error:', error);
      const providerDetail = error && error.message && error.message !== 'Submission failed'
        ? ' Submission service message: ' + error.message
        : '';
      showStatus(
        'We could not submit the form just now.' + providerDetail +
        ' Please try once more. If it still fails, use the WhatsApp button while we investigate.',
        'error'
      );
    } finally {
      querySubmit.disabled = false;
      querySubmit.textContent = 'Submit query';
    }
  });
}
