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
    "user@host.example.0xb",
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
