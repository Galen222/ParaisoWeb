import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el CAPTCHA aparece debajo del consentimiento y bloquea el envío sin token", async () => {
  const [form, validation, service] = await Promise.all([
    readSource("../src/components/Form.tsx"),
    readSource("../src/utils/contactFormValidation.ts"),
    readSource("../src/services/formService.ts"),
  ]);

  const checkboxPosition = form.indexOf('id="privacyCheck"');
  const captchaPosition = form.indexOf("<Captcha");
  const submitPosition = form.indexOf('type="submit"');

  assert.ok(checkboxPosition >= 0);
  assert.ok(captchaPosition > checkboxPosition);
  assert.ok(submitPosition > captchaPosition);
  assert.match(form, /formData\.captchaToken !== ""/);
  assert.match(validation, /isCaptchaVerified[\s\S]*?&&\s+isCaptchaVerified/);
  assert.match(service, /formData\.append\("captcha_token", data\.captchaToken\)/);
});

test("reCAPTCHA se carga una sola vez con nonce CSP y conserva el idioma inicial", async () => {
  const [captcha, loader, proxy] = await Promise.all([
    readSource("../src/components/Captcha.tsx"),
    readSource("../src/utils/recaptchaLoader.ts"),
    readSource("../src/proxy.ts"),
  ]);

  assert.match(captcha, /const initialLocaleRef = useRef\(intl\.locale\)/);
  assert.match(captcha, /loadRecaptcha\(initialLocaleRef\.current\)/);
  assert.match(loader, /let recaptchaLoadPromise:/);
  assert.match(loader, /getDocumentCspNonce\(\)/);
  assert.match(loader, /script\.nonce = nonce/);
  assert.match(loader, /render=explicit&hl=/);
  assert.match(proxy, /script-src[^;]*https:\/\/www\.google\.com[^;]*https:\/\/www\.gstatic\.com/);
  assert.match(proxy, /frame-src[^;]*https:\/\/\*\.google\.com/);
});

test("los ejemplos de entorno documentan destinos en español y las claves CAPTCHA separadas", async () => {
  const [frontendEnv, backendEnv] = await Promise.all([
    readSource("../.env.example"),
    readSource("../../backend/.env.example"),
  ]);

  assert.match(frontendEnv, /^FRONTEND_LOG_TARGET=archivo$/m);
  assert.match(backendEnv, /^BACKEND_LOG_TARGET=archivo$/m);
  assert.match(frontendEnv, /^NEXT_PUBLIC_RECAPTCHA_SITE_KEY=/m);
  assert.match(backendEnv, /^RECAPTCHA_SECRET_KEY=/m);
  assert.doesNotMatch(frontendEnv, /^RECAPTCHA_SECRET_KEY=/m);
});
