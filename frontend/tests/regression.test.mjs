import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const loadTypeScriptModule = async (relativePath) => {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourceUrl.pathname,
  }).outputText;

  const encoded = Buffer.from(transpiled, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
};

test("las rutas de blog codifican Unicode sin alterar query ni fragmento", async () => {
  const { buildBlogPath, buildLocalizedBlogPath } = await loadTypeScriptModule(
    "../src/utils/blogPath.ts"
  );

  assert.equal(
    buildBlogPath("jamón-ibérico", "?utm_source=test#detalle"),
    "/blog/jam%C3%B3n-ib%C3%A9rico?utm_source=test#detalle"
  );
  assert.equal(
    buildLocalizedBlogPath("de", "schinken-qualität"),
    "/de/blog/schinken-qualit%C3%A4t"
  );
});

test("la URL canónica elimina parámetros, fragmentos y evita duplicar el locale", async () => {
  const { buildCanonicalPageUrl } = await loadTypeScriptModule(
    "../src/utils/canonicalUrl.ts"
  );

  assert.equal(
    buildCanonicalPageUrl(
      "https://www.paraisodeljamon.com/",
      "/blog/articulo?utm_source=newsletter#comentarios",
      "en",
      "es",
      ["es", "en", "de"]
    ),
    "https://www.paraisodeljamon.com/en/blog/articulo"
  );
  assert.equal(
    buildCanonicalPageUrl(
      "https://www.paraisodeljamon.com",
      "/de/blog/artikel?ref=mail",
      "de",
      "es",
      ["es", "en", "de"]
    ),
    "https://www.paraisodeljamon.com/de/blog/artikel"
  );
});

test("el formulario no se considera completo sin privacidad o adjunto obligatorio", async () => {
  const { isContactFormComplete } = await loadTypeScriptModule(
    "../src/utils/contactFormValidation.ts"
  );
  const base = {
    reason: "informacion",
    email: "ana@example.com",
    message: "Consulta",
    file: null,
  };

  assert.equal(isContactFormComplete(base, true, true, false), false);
  assert.equal(
    isContactFormComplete({ ...base, reason: "factura" }, true, true, true),
    false
  );
  assert.equal(isContactFormComplete(base, true, true, true), true);
});

test("el consentimiento vuelve a solicitarse solo al salir de las políticas sin decisión", async () => {
  const { shouldReopenConsentModal } = await loadTypeScriptModule(
    "../src/utils/cookieConsentState.ts"
  );

  assert.equal(shouldReopenConsentModal(true, "/politica-cookies"), false);
  assert.equal(shouldReopenConsentModal(true, "/politica-privacidad"), false);
  assert.equal(shouldReopenConsentModal(true, "/contacto"), true);
  assert.equal(shouldReopenConsentModal(true, "/contacto", "v1.rejected"), false);
});

test("las fechas API rechazan offsets superiores a UTC±14:00", async () => {
  const { isValidApiDateString } = await loadTypeScriptModule(
    "../src/utils/apiDate.ts"
  );

  assert.equal(isValidApiDateString("2026-07-16T10:00:00+14:00"), true);
  assert.equal(isValidApiDateString("2026-07-16T10:00:00-14:00"), true);
  assert.equal(isValidApiDateString("2026-07-16T10:00:00+14:01"), false);
  assert.equal(isValidApiDateString("2026-07-16T10:00:00+23:59"), false);
});
