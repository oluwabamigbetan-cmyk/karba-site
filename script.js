// script.js — KARBA site form + reCAPTCHA v3

(function () {
  const $ = (sel) => document.querySelector(sel);

  // Elements
  const form = $('#consultation-form');
  const statusBox = $('#form-status');

  // Config from config.js
  const BACKEND = (window.KARBA_CONFIG && window.KARBA_CONFIG.BACKEND_URL) || '';
  const SITEKEY = (window.KARBA_CONFIG && window.KARBA_CONFIG.RECAPTCHA_SITE_KEY) || '';

  // --- Helpers ---
  function setStatus(msg) {
    if (statusBox) statusBox.textContent = msg;
  }
  function disableForm(disabled) {
    if (!form) return;
    for (const el of form.elements) el.disabled = disabled;
  }

  // --- Load reCAPTCHA script (NOTE: api, not qpi) ---
  function loadRecaptcha() {
    if (!SITEKEY) return;
    if (document.getElementById('recaptcha-script')) return; // already loaded
    const s = document.createElement('script');
    s.id = 'recaptcha-script';
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITEKEY}`;
    s.async = true;
    document.head.appendChild(s);
  }
  loadRecaptcha();

  // --- Form submit handler ---
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!BACKEND) {
        setStatus('Error: BACKEND_URL not set.');
        return;
      }
      if (!window.grecaptcha || !SITEKEY) {
        setStatus('Loading security… please wait a second and try again.');
        return;
      }

      // Gather form data
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      try {
        disableForm(true);
        setStatus('Submitting…');

        // Get reCAPTCHA token for action "lead"
        await grecaptcha.ready();
        const token = await grecaptcha.execute(SITEKEY, { action: 'lead' });

        // Send to backend
        const res = await fetch(`${BACKEND}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, recaptchaToken: token })
        });

        const text = await res.text();
        if (res.ok) {
          setStatus('Thank you! We will contact you shortly.');
          form.reset();
        } else {
          setStatus('Error: ' + text);
        }
      } catch (err) {
        console.error(err);
        setStatus('Network error. Please try again.');
      } finally {
        disableForm(false);
      }
    });
  }
})();
