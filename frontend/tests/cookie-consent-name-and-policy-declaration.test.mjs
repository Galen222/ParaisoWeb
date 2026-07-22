import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("the consent cookie uses only the _consent name", async () => {
  const cookieUtils = await readSource("src/utils/cookieUtils.ts");

  assert.match(cookieUtils, /export const COOKIE_CONSENT_NAME = "_consent";/);
  assert.doesNotMatch(cookieUtils, /_cookie_consent/);
});

test("the cookie policy renders five declared cookies with _consent first", async () => {
  const policyPage = await readSource("src/pages/politica-cookies.tsx");

  assert.match(policyPage, /const COOKIE_DECLARATION_ORDER = \[5, 1, 2, 3, 4\] as const;/);
  assert.equal((policyPage.match(/COOKIE_DECLARATION_ORDER\.map/g) ?? []).length, 2);
});

test("all supported locales declare the _consent cookie", async () => {
  for (const locale of ["es", "en", "de", "fr"]) {
    const messages = JSON.parse(await readSource(`src/locales/${locale}/common.json`));

    assert.equal(messages.politicaCookies_Utilizadas_Nombre5, "_consent");
    assert.equal(messages.politicaCookies_Utilizadas_Titular5, "paraisodeljamon.com");
    assert.ok(messages.politicaCookies_Utilizadas_Finalidad5);
    assert.ok(messages.politicaCookies_Utilizadas_Duracion5);
  }
});
