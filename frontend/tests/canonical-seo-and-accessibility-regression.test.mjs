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

test("la URL canónica elimina el prefijo español sin crear rutas ambiguas", async () => {
  const { buildCanonicalPageUrl } = await loadTypeScriptModule(
    "../src/utils/canonicalUrl.ts"
  );
  const locales = ["es", "en", "de", "fr"];

  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/es", "es", "es", locales),
    "https://www.paraisodeljamon.com/"
  );
  assert.equal(
    buildCanonicalPageUrl(
      "https://www.paraisodeljamon.com/",
      "/es/blog?utm_source=mail#articulos",
      "es",
      "es",
      locales
    ),
    "https://www.paraisodeljamon.com/blog"
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/en/blog", "en", "es", locales),
    "https://www.paraisodeljamon.com/en/blog"
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/estaurantes", "es", "es", locales),
    "https://www.paraisodeljamon.com/estaurantes"
  );
  assert.equal(
    buildCanonicalPageUrl("https://www.paraisodeljamon.com", "/", "en", "es", locales),
    "https://www.paraisodeljamon.com/en"
  );
});

test("la URL del navegador conserva los datos de locale al hidratar", async () => {
  const source = await readFile(new URL("../src/hooks/useCurrentUrl.ts", import.meta.url), "utf8");

  assert.match(
    source,
    /window\.location\.pathname,[\s\S]*?router\.locale,[\s\S]*?router\.defaultLocale,[\s\S]*?router\.locales/
  );
});

test("el selector de archivos expone descripción y anuncia el nombre seleccionado", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /id="fileUploadDescription"/);
  assert.match(source, /aria-label=\{intl\.formatMessage\(\{ id: "contacto_BotonSubirArchivo" \}\)\}/);
  assert.match(source, /aria-controls="fileUpload"/);
  assert.match(source, /aria-describedby="fileUploadDescription fileUploadName"/);
  assert.match(source, /id="fileUploadName"[\s\S]*?role="status"[\s\S]*?aria-live="polite"/);
});

test("el título visual del hero no duplica el h1 principal", async () => {
  const source = await readFile(
    new URL("../src/components/AnimatedTitle.tsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /<h1[\s>]/);
  assert.match(source, /<div aria-hidden="true">/);

  const errorPages = [
    ["../src/pages/blog.tsx", "blog_Error"],
    ["../src/pages/blog/[slug].tsx", "blog_Details_Error"],
    ["../src/pages/charcuteria.tsx", "{error}"],
  ];
  for (const [path, message] of errorPages) {
    const pageSource = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(pageSource, new RegExp(`<h1[^>]*>[\\s\\S]*?${message}[\\s\\S]*?</h1>`));
  }
});

test("el menú de escritorio reserva su espacio antes del título", async () => {
  const source = await readFile(
    new URL("../src/styles/components/Navbar.module.css", import.meta.url),
    "utf8"
  );

  assert.match(source, /\.navbarMenuSpace\s*\{[\s\S]*?height:\s*42px;[\s\S]*?flex-shrink:\s*0;/);
});

test("las ilustraciones de error no repiten mensajes ya visibles", async () => {
  const paths = [
    "../src/pages/404.tsx",
    "../src/pages/_error.tsx",
    "../src/pages/blog.tsx",
    "../src/pages/blog/[slug].tsx",
    "../src/pages/charcuteria.tsx",
  ];

  for (const path of paths) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /error\.png[^\n]*alt=(?:"Error|\{`Error)/i);
    assert.match(source, /<Image[^>]+alt=""/);
  }
});

test("los títulos SEO españoles mantienen la marca y la ortografía correctas", async () => {
  const source = await readFile(new URL("../src/locales/es/common.json", import.meta.url), "utf8");
  const locale = JSON.parse(source);

  assert.equal(locale.blog_SEO_Titulo, "El Paraíso Del Jamón - Blog");
  assert.equal(
    locale["politica-privacidad_SEO_Titulo"],
    "El Paraíso Del Jamón - Política de Privacidad"
  );
});
