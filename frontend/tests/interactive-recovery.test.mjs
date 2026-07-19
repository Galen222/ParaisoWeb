import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el CAPTCHA permite reintentar sin recargar tras un fallo temporal", async () => {
  const [captcha, styles, ...localeSources] = await Promise.all([
    readSource("../src/components/Captcha.tsx"),
    readSource("../src/styles/components/Form.module.css"),
    ...["es", "en", "de", "fr"].map((locale) =>
      readSource(`../src/locales/${locale}/common.json`),
    ),
  ]);

  assert.match(captcha, /const \[loadAttempt, setLoadAttempt\] = useState\(0\)/);
  assert.match(captcha, /\[hasUsableSiteKey, loadAttempt, siteKey\]/);
  assert.match(captcha, /window\.grecaptcha\.reset\(widgetId\)/);
  assert.match(captcha, /containerRef\.current\?\.replaceChildren\(\)/);
  assert.match(captcha, /setLoadAttempt\(\(currentAttempt\) => currentAttempt \+ 1\)/);
  assert.match(captcha, /onClick=\{handleRetry\}/);
  assert.match(captcha, /contacto_CaptchaReintentar/);
  assert.match(styles, /\.captchaRetryButton\s*\{/);

  for (const localeSource of localeSources) {
    const messages = JSON.parse(localeSource);
    assert.equal(typeof messages.contacto_CaptchaReintentar, "string");
    assert.ok(messages.contacto_CaptchaReintentar.trim().length > 0);
  }
});

test("las tarjetas de charcutería limpian el hover al paginar o cambiar de idioma", async () => {
  const page = await readSource("../src/pages/charcuteria.tsx");

  assert.match(page, /useEffect\(\(\) => \{[\s\S]*?queueMicrotask\(\(\) => \{[\s\S]*?setHoveredCardId\(null\)/);
  assert.match(page, /\}, \[currentLocale, currentPage\]\);/);
  assert.match(page, /cancelled = true/);
});
