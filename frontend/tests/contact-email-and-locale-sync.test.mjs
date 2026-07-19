import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

const loadTypeScriptModule = async (relativePath, moduleMocks = {}) => {
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
  wrapper(
    (id) => Object.hasOwn(moduleMocks, id) ? moduleMocks[id] : require(id),
    loadedModule,
    loadedModule.exports
  );
  return loadedModule.exports;
};

const VALID_CONTACT_EMAILS = [
  "usuario@example.com",
  "A.B+C@example-domain.es",
  "o'hara@example.com",
  "usuario@xn--bcher-kva.de",
  "usuario@bücher.de",
  "usuario@例子.公司",
  "usuario@παράδειγμα.δοκιμή",
  "usuario@bu\u0308cher.de",
  "usuario@123.example",
  "usuario@example.c3",
];

const INVALID_CONTACT_EMAILS = [
  "",
  " usuario@example.com",
  "usuario@example.com ",
  "usuario @example.com",
  "usuario@example .com",
  "Nombre <correo@example.com>",
  '"Nombre" <correo@example.com>',
  "usuario",
  "@example.com",
  "usuario@",
  "usuario@@example.com",
  "用户@example.com",
  '"usuario"@example.com',
  ".usuario@example.com",
  "usuario.@example.com",
  "usu..ario@example.com",
  "usuario@localhost",
  "usuario@.example.com",
  "usuario@example..com",
  "usuario@-example.com",
  "usuario@example-.com",
  "usuario@exam_ple.com",
  "usuario@😀.com",
  "usuario@\u0308example.com",
  "usuario@example-\u0308.com",
  "usuario@example.c",
  "usuario@example.1",
  "usuario@example。com",
  `${"a".repeat(65)}@example.com`,
  `usuario@${"a".repeat(64)}.com`,
];

test("el frontend aplica reglas literales de correo sin servicios ni contratos externos", async () => {
  const source = await readFile(
    new URL("../src/utils/contactEmailValidation.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /MAX_EMAIL_LENGTH = 254/);
  assert.match(source, /MAX_LOCAL_PART_LENGTH = 64/);
  assert.match(source, /MAX_DOMAIN_LABEL_LENGTH = 63/);
  assert.match(source, /\\p\{L\}\\p\{N\}\\p\{M\}/);
  assert.match(source, /validateContactEmail/);
  assert.match(source, /isValidContactEmail/);
  assert.doesNotMatch(
    source,
    /contactEmailContract|axios|NEXT_PUBLIC_API_CONTACTO_URL|validar-email|validator\.isEmail|toASCII|normalize\(/
  );

  const validationModule = await loadTypeScriptModule(
    "../src/utils/contactEmailValidation.ts"
  );

  for (const email of VALID_CONTACT_EMAILS) {
    assert.equal(
      validationModule.validateContactEmail(email),
      email,
      `Debe aceptar y conservar ${JSON.stringify(email)}`
    );
  }

  for (const email of INVALID_CONTACT_EMAILS) {
    assert.equal(
      validationModule.validateContactEmail(email),
      null,
      `Debe rechazar ${JSON.stringify(email)}`
    );
  }
});

test("el formulario valida el correo sin realizar una petición adicional", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /isValidContactEmail\(formData\.email\)/);
  assert.match(source, /type="text"[\s\S]*?inputMode="email"/);
  assert.doesNotMatch(source, /validateContactEmailWithBackend|emailValidationStatus|aria-busy|validar-email/);
  assert.doesNotMatch(source, /type="email"|validator\.isEmail/);
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
