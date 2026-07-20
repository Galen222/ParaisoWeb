import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const readJson = async (relativePath) =>
  JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));

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

test("la portada de cada idioma usa la misma URL Open Graph antes y después de hidratar", async () => {
  const { buildCanonicalPageUrl } = await loadTypeScriptModule("../src/utils/canonicalUrl.ts");
  const locales = ["es", "en", "de", "fr"];

  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/", "es", "es", locales),
    "https://www.paraisodeljamon.com/",
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/", "en", "es", locales),
    "https://www.paraisodeljamon.com/en",
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/", "de", "es", locales),
    "https://www.paraisodeljamon.com/de",
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/", "fr", "es", locales),
    "https://www.paraisodeljamon.com/fr",
  );
});

test("el blog oculta el paginador cuando todos los artículos caben en una página", async () => {
  const source = await readFile(new URL("../src/pages/blog.tsx", import.meta.url), "utf8");

  assert.match(source, /\{totalPages > 1 && \(\s*<Paginator/);
  assert.doesNotMatch(source, /\{paginatedBlogs\.length > 0 && \(\s*<Paginator/);
});

test("la charcutería oculta el paginador cuando todos los productos caben en una página", async () => {
  const source = await readFile(new URL("../src/pages/charcuteria.tsx", import.meta.url), "utf8");

  assert.match(source, /\{totalPages > 1 && \(\s*<Paginator/);
  assert.doesNotMatch(source, /\{paginatedProducts\.length > 0 && \(\s*<Paginator/);
});

test("los textos visibles y alternativos de restaurantes conservan las tildes", async () => {
  const locale = await readJson("../src/locales/es/common.json");

  assert.match(locale.seo_keywords, /menú/);
  const disabledBravoMurillo = await readFile(
    new URL("../src/locales-disabled/es/bravo-murillo.common.jsonc.disabled", import.meta.url),
    "utf8",
  );
  assert.match(disabledBravoMurillo, /"bravo-murillo_Carousel_Alt10": "Menú"/);
  assert.match(locale["reina-victoria_Texto"], /charcutería/);
  assert.equal(locale["arenal_Carousel_Alt10"], "Plato del menú");
  assert.equal(locale.Map_Marker_Texto1, "Cómo llegar");
});

test("la página Nosotros y la política de cookies usan español correcto", async () => {
  const locale = await readJson("../src/locales/es/common.json");

  assert.equal(locale.nosotros_Titulo, "Quiénes somos");
  assert.match(locale.nosotros_Texto3_Punto2, /menú diario/);
  assert.match(locale.politicaCookies_Clasificacion1_Texto1, /dominio/);
  assert.match(locale.politicaCookies_Utilizadas_Finalidad2, /anónima/);
  assert.match(locale.politicaCookies_Aceptacion_Texto3_Punto4, /asimismo/);
});

test("los textos legales corrigen la capitalización y la conjunción incorrectas", async () => {
  const locale = await readJson("../src/locales/es/common.json");

  assert.match(locale.politicaPrivacidad_Finalidad_Texto3_Punto4, /redes sociales\. El Titular/);
  assert.match(locale.avisoLegal_Cookies_Texto3, /navegación o publicitarias adaptadas al usuario/);
  assert.match(locale.avisoLegal_Cookies_Texto3, /medir las visitas y los parámetros del tráfico/);
  assert.doesNotMatch(locale.avisoLegal_Cookies_Texto3, /navegación u publicitarias/);
});
