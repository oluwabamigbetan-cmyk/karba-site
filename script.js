// add near the top
const SKIP_RECAPTCHA = process.env.RECAPTCHA_SKIP === 'true';

// ...in your /api/leads handler, before calling Google:
if (!SKIP_RECAPTCHA) {
  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: recaptchaToken
    })
  });
  const verify = await verifyRes.json();
  if (!verify.success || (verify.score ?? 0) < 0.3) {
    return res.status(400).json({ ok:false, message: 'reCAPTCHA verification failed' });
  }
} else {
  console.log('⚠️  RECAPTCHA SKIPPED FOR TESTING');
}
