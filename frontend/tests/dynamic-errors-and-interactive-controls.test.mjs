import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const loadTypeScriptModule = async (relativePath) => {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  Function("module", "exports", output)(compiledModule, compiledModule.exports);
  return compiledModule.exports;
};

test("los listados con error dinámico dejan de ser indexables y anuncian el fallo", async () => {
  const [blog, charcuteria] = await Promise.all([
    readFile(new URL("../src/pages/blog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/charcuteria.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of [blog, charcuteria]) {
    assert.match(source, /noindex=\{Boolean\(error\)\}/);
    assert.match(source, /nofollow=\{Boolean\(error\)\}/);
    assert.match(source, /error \? undefined : currentUrl/);
    assert.match(source, /errorStyles\.errorContainer\} role="alert"/);
  }
});

test("el giro por hover mantiene sincronizadas la cara visible y su semántica", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../src/pages/charcuteria.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/pages/charcuteria.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /hoveredCardId/);
  assert.match(page, /matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)/);
  assert.match(page, /onMouseEnter=\{\(\) => \{[\s\S]*?supportsCardHover\(\)[\s\S]*?setHoveredCardId\(productId\)/);
  assert.match(page, /aria-expanded=\{isCardFlipped\}/);
  assert.match(page, /aria-hidden=\{isCardFlipped\}/);
  assert.match(page, /aria-hidden=\{!isCardFlipped\}/);
  assert.doesNotMatch(css, /\.card:hover\s+\.cardInner/);
});

test("el hashtag compartido elimina símbolos y conserva letras Unicode", async () => {
  const { buildFacebookHashtag } = await loadTypeScriptModule("../src/utils/shareHashtag.ts");

  assert.equal(buildFacebookHashtag("¿Jamón ibérico? 100% calidad"), "#Jamónibérico100calidad");
  assert.equal(buildFacebookHashtag("***"), "#ElParaisoDelJamon");

  const shareLink = await readFile(new URL("../src/components/ShareLink.tsx", import.meta.url), "utf8");
  assert.match(shareLink, /hashtag=\{buildFacebookHashtag\(title\)\}/);
});

test("la página actual del paginador no puede activarse de nuevo", async () => {
  const [paginator, css] = await Promise.all([
    readFile(new URL("../src/components/Paginator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/components/Paginator.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(paginator, /disabled=\{pageEntry === currentPage\}/);
  assert.match(paginator, /aria-current=\{pageEntry === currentPage \? "page" : undefined\}/);
  assert.match(css, /\.paginatorButton\.active:disabled[\s\S]*?opacity: 1/);
});

test("el botón de subida no envía formularios y elimina transiciones con movimiento reducido", async () => {
  const [button, css] = await Promise.all([
    readFile(new URL("../src/components/ScrollToTopButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/components/ScrollToTopButton.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(button, /<button[\s\S]*?type="button"[\s\S]*?onClick=\{scrollToTop\}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.scrollToTop[\s\S]*?transition: none/);
});

test("los estados asíncronos del mapa se anuncian sin cambiar su carga por idioma", async () => {
  const map = await readFile(new URL("../src/components/Map.tsx", import.meta.url), "utf8");

  assert.match(map, /return <div role="alert">\{intl\.formatMessage\(\{ id: "Map_Error_Texto" \}\)\}<\/div>/);
  assert.match(map, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(map, /markerLoadError && <div role="alert">/);
  assert.match(map, /getGoogleMapsLoader\(apiKey, mapLocale\)/);
});
