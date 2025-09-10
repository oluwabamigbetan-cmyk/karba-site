// script.js
(function () {
  const cfg = window.KARBA_CONFIG || {};
  const BACKEND = (cfg.BACKEND_URL || "").replace(/\/+$/,"");
  const SITE_KEY = cfg.RECAPTCHA_SITE_KEY;

  // Set WhatsApp button
  const waBtn = document.getElementById("whatsappBtn");
  if (waBtn) {
    const phone = "2349136253825"; // your number without +
    const text = encodeURIComponent("Hello KARBA, I'd like a free consultation.");
    waBtn.href = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  }

  // Form handling
  const form = document.getElementById("lead-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submitBtn");

  function show(msg, good=false){
    if(!status) return;
    status.style.color = good ? "#e9cf7f" : "#e9cf7f";
    status.textContent = msg;
  }

  async function getRecaptchaToken() {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha || !SITE_KEY) {
        return resolve(null); // allow fallback if not loaded
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(SITE_KEY, { action: "submit" })
          .then(resolve)
          .catch(() => resolve(null));
      });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!BACKEND) {
        show("Setup error: BACKEND_URL missing.", false);
        return;
      }

      submitBtn.disabled = true;
      show("Submitting…");

      const data = Object.fromEntries(new FormData(form).entries());
      const token = await getRecaptchaToken();

      try {
        const res = await fetch(`${BACKEND}/api/leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, recaptchaToken: token })
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = json?.message || `Error ${res.status}`;
          show(`Error: ${msg}`, false);
        } else {
          show("Thank you! We will contact you shortly.", true);
          form.reset();
        }
      } catch (err) {
        show("Network error. Please try again.", false);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
