import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

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

  return import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
};

test("las tarjetas de charcutería responden al clic con cualquier puntero", async () => {
  const source = await readSource("../src/pages/charcuteria.tsx");

  assert.match(source, /onClick=\{\(\) => handleCardClick\(String\(product\.id_producto\)\)\}/);
  assert.doesNotMatch(source, /useTouchDevice|isTouchDevice/);
});

test("la cara oculta de cada tarjeta queda fuera del árbol accesible", async () => {
  const source = await readSource("../src/pages/charcuteria.tsx");

  assert.match(source, /className=\{styles\.front\}[\s\S]*?aria-hidden=\{Boolean\(flippedCards\[product\.id_producto\]\)\}/);
  assert.match(source, /className=\{styles\.back\}[\s\S]*?aria-hidden=\{!Boolean\(flippedCards\[product\.id_producto\]\)\}/);
});

test("el menú de restaurantes no se oculta mientras conserva el foco", async () => {
  const source = await readSource("../src/components/Navbar.tsx");

  assert.match(source, /handleRestaurantsMouseLeave[\s\S]*?contains\(document\.activeElement\)/);
  assert.match(source, /onMouseLeave=\{handleRestaurantsMouseLeave\}/);
  assert.doesNotMatch(source, /onMouseLeave=\{closeRestaurantsMenu\}/);
});

test("los puntos del carrusel describen la diapositiva de destino", async () => {
  const [carousel, ...localeSources] = await Promise.all([
    readSource("../src/components/Carousel.tsx"),
    ...["es", "en", "de", "fr"].map((locale) =>
      readSource(`../src/locales/${locale}/common.json`)
    ),
  ]);

  assert.match(carousel, /customPaging: \(index: number\)/);
  assert.match(carousel, /id: "carousel_IrDiapositiva"[\s\S]*?slide: index \+ 1/);

  for (const localeSource of localeSources) {
    const messages = JSON.parse(localeSource);
    assert.equal(typeof messages.carousel_IrDiapositiva, "string");
    assert.match(messages.carousel_IrDiapositiva, /\{slide\}/);
  }
});

test("la política de cookies no repite el título principal", async () => {
  const source = await readSource("../src/pages/politica-cookies.tsx");
  const titleReferences = source.match(/id: "politicaCookies_Principal_Titulo"/g) ?? [];

  assert.equal(titleReferences.length, 1);
  assert.match(source, /<h1[^>]*>[\s\S]*?politicaCookies_Principal_Titulo/);
});

test("la descripción SEO del artículo elimina sintaxis Markdown", async () => {
  const { stripMarkdownForSeo } = await loadTypeScriptModule(
    "../src/utils/markdownText.ts"
  );

  assert.equal(
    stripMarkdownForSeo("# Título\nTexto con **negrita**, [enlace](https://example.com) e ![imagen](foto.jpg)."),
    "Título Texto con negrita, enlace e imagen."
  );

  const article = await readSource("../src/pages/blog/[slug].tsx");
  assert.match(article, /const plainSeoContent = blogDetails\?\.contenido/);
  assert.match(article, /stripMarkdownForSeo\(blogDetails\.contenido\)/);
  assert.match(article, /plainSeoContent[\s\S]*?buildSeoPreview\(plainSeoContent, 150\)/);
});

test("los encabezados Markdown no generan un segundo h1 en el artículo", async () => {
  const source = await readSource("../src/pages/blog/[slug].tsx");

  assert.match(source, /components=\{\{[\s\S]*?h1: \(\{ node, \.\.\.headingProps \}\)[\s\S]*?return <h2 \{\.\.\.headingProps\} \/>/);
});
