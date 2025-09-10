// script.js
// Loads reCAPTCHA v3 and submits the form with a token

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lead-form');
  const statusBox = document.getElementById('form-status');

  const BACKEND = (window.KARBA_CONFIG && window.KARBA_CONFIG.BACKEND_URL) || '';
  const SITE = (window.KARBA_CONFIG && window.KARBA_CONFIG.RECAPTCHA_SITE_KEY) || '';

  // 1) Load the correct Google script (NOTE: api, not qpi)
  function loadRecaptcha() {
    if (!SITE) return; // won't load without a site key
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE}`;
    s.async = true;
    document.head.appendChild(s);
  }
  loadRecaptcha();

  // 2) Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusBox.textContent = 'Submitting...';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      // Wait for grecaptcha and get a token for action "lead"
      if (!window.grecaptcha || !SITE) {
        statusBox.textContent = 'reCAPTCHA not loaded yet. Please refresh and try again.';
        return;
      }
      await grecaptcha.ready();
      const token = await grecaptcha.execute(SITE, { action: 'lead' });

      // Send data + token to backend
      const res = await fetch(BACKEND + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken: token })
      });

      const bodyText = await res.text();
      if (res.ok) {
        statusBox.textContent = 'Thank you! We will contact you shortly.';
        form.reset();
      } else {
        statusBox.textContent = 'Error: ' + bodyText;
      }
    } catch (err) {
      console.error(err);
      statusBox.textContent = 'Network error. Please try again.';
    }
  });
});
