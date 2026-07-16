import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("el consentimiento se sincroniza entre pestañas y al recuperar visibilidad", async () => {
  const [hookSource, cookieUtilsSource] = await Promise.all([
    readFile(new URL("../src/hooks/useCookieLogic.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/cookieUtils.ts", import.meta.url), "utf8"),
  ]);

  assert.match(cookieUtilsSource, /COOKIE_CONSENT_SYNC_STORAGE_KEY/);
  assert.match(cookieUtilsSource, /localStorage\.setItem/);
  assert.match(cookieUtilsSource, /notifyCookieConsentChanged\(\)/);
  assert.match(hookSource, /window\.addEventListener\("storage", handleStorage\)/);
  assert.match(hookSource, /window\.addEventListener\("focus", synchronizeConsent\)/);
  assert.match(hookSource, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
  assert.match(hookSource, /restoreSavedConsent\(\)/);
});

test("el formulario rechaza adjuntos vacíos antes de solicitar el envío", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /if \(file\.size === 0\)/);
  assert.match(source, /if \(file\.size === 0\) \{[\s\S]*?clearSelectedFile\(\);[\s\S]*?contacto_ArchivoNoJPG-PDF/);
});

test("charcutería conserva la primera fila duplicada y normaliza la empresa opcional", async () => {
  const source = await readFile(
    new URL("../src/services/charcuteriaService.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /const seenProductIds = new Set<number>\(\)/);
  assert.match(source, /if \(seenProductIds\.has\(product\.id_producto\)\)/);
  assert.match(source, /empresa: product\.empresa\?\.trim\(\) \|\| null/);
});

test("la ficha de charcutería no crea encabezados vacíos para empresas ausentes", async () => {
  const source = await readFile(
    new URL("../src/pages/charcuteria.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /\{product\.empresa && <h3 className=\{styles\.empresa\}>/);
});

test("una segunda imagen opcional vacía no invalida el artículo", async () => {
  const source = await readFile(
    new URL("../src/services/blogService.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /const isOptionalPublicAssetPath/);
  assert.match(source, /value\.trim\(\) === "" \|\| isSafePublicAssetPath\(value\)/);
  assert.match(source, /imagen_url_2:[\s\S]*?value\.imagen_url_2\.trim\(\) === ""[\s\S]*?\? null/);
});
