import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

const loadTypeScriptModule = async (relativePath) => {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(`(function (require, module, exports) { ${outputText}\n })`);
  wrapper(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
};

test("el correo de contacto comparte las fronteras reales de EmailStr", async () => {
  const { isValidContactEmail } = await loadTypeScriptModule(
    "../src/utils/contactEmailValidation.ts"
  );

  const validEmails = [
    "plain@example.com",
    " x@example.com ",
    "x@y.z",
    `${"a".repeat(100)}@example.com`,
    "usuario@bücher.de",
    "用户@例子.广告",
    "a@example。com",
    "a@example．com",
    "a@example｡com",
    "user@host.example.0xb",
    "a\u034Fb@example.com",
    "a\uFE0Fb@example.com",
  ];
  const invalidEmails = [
    '"a b"@example.com',
    '"@example.com',
    "a@ab--cd.com",
    "a@xn--ab-cde.com",
    "a@localhost",
    "a@example.z9",
    "a@service.onion",
    `${"用".repeat(83)}@example.com`,
    "a\u200b@example.com",
    "a@exa\u200bmple.com",
    "a\u2028@example.com",
    "a\u2060@example.com",
    "a\u202E@example.com",
    "a\u2003b@example.com",
  ];

  validEmails.forEach((email) => assert.equal(isValidContactEmail(email), true, email));
  invalidEmails.forEach((email) => assert.equal(isValidContactEmail(email), false, email));
});

test("el formulario utiliza el validador alineado con el backend", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /import \{ isValidContactEmail \} from "\.\.\/utils\/contactEmailValidation"/);
  assert.match(source, /setIsValidEmail\(isValidContactEmail\(value\)\)/);
  assert.doesNotMatch(source, /validator\.isEmail/);
});

test("restaurar personalización desde otra pestaña no reemplaza su idioma", async () => {
  const { shouldPersistLocalePreference } = await loadTypeScriptModule(
    "../src/utils/localePreferenceSync.ts"
  );

  assert.equal(
    shouldPersistLocalePreference(
      { locale: "en", personalizationEnabled: false },
      { locale: "en", personalizationEnabled: true }
    ),
    false
  );
  assert.equal(
    shouldPersistLocalePreference(
      { locale: "es", personalizationEnabled: true },
      { locale: "de", personalizationEnabled: true }
    ),
    true
  );
  assert.equal(
    shouldPersistLocalePreference(
      { locale: "es", personalizationEnabled: true },
      { locale: "es", personalizationEnabled: true }
    ),
    false
  );
});

test("la pestaña que acepta personalización guarda su locale antes de sincronizar", async () => {
  const source = await readFile(
    new URL("../src/hooks/useCookieLogic.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /shouldPersistLocalePreference\(localePreferenceSnapshotRef\.current, currentSnapshot\)/);
  assert.match(source, /if \(AcceptCookiePersonalization\) \{[\s\S]*?saveLocalePreference\(router\.locale \|\| "es"\);[\s\S]*?setCookieConsentPersonalization\(true\);/);
  assert.match(source, /setAcceptCookiePersonalization\(true\);[\s\S]*?saveLocalePreference\(router\.locale \|\| "es"\);[\s\S]*?saveCookieConsentPreference\(COOKIE_CONSENT_ACCEPTED\);/);
});

test("la configuración no crea redirecciones propias sobre las rutas españolas canónicas", async () => {
  const source = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.doesNotMatch(source, /source: "\/es"/);
  assert.doesNotMatch(source, /source: "\/es\/:path\*"/);
  assert.match(source, /defaultLocale: "es"/);
});

test("la preferencia de idioma usa el nombre público _locale", async () => {
  const files = await Promise.all([
    readFile(new URL("../src/utils/cookieUtils.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/redirectByCookie.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/redirectByCookieSlug.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/hooks/useLocaleChange.ts", import.meta.url), "utf8"),
  ]);
  const combinedSource = files.join("\n");

  assert.match(combinedSource, /LOCALE_COOKIE_NAME/);
  assert.doesNotMatch(combinedSource, /NEXT_LOCALE/);
});

test("el formulario no renderiza una clase CSS inexistente en los campos de contacto", async () => {
  const [formSource, formStyles] = await Promise.all([
    readFile(new URL("../src/components/Form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/components/Form.module.css", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(formSource, /styles\.input/);
  assert.match(formStyles, /\.form input,/);
});

test("las palabras clave SEO inglesas no mezclan texto español", async () => {
  const source = await readFile(new URL("../src/locales/en/common.json", import.meta.url), "utf8");
  const locale = JSON.parse(source);

  assert.match(locale.seo_keywords, /(?:^|, )about us(?:,|$)/);
  assert.doesNotMatch(locale.seo_keywords, /nosotros us/);
});
