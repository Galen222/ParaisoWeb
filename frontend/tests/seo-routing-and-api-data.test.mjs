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

test("NEXT_PUBLIC_SITE_URL solo admite un origen HTTP(S) canónico", async () => {
  const { normalizePublicSiteUrl } = await loadTypeScriptModule(
    "../src/utils/publicSiteUrl.ts"
  );

  assert.equal(
    normalizePublicSiteUrl("https://www.paraisodeljamon.com/"),
    "https://www.paraisodeljamon.com"
  );
  assert.throws(() => normalizePublicSiteUrl("https://usuario:clave@example.com"));
  assert.throws(() => normalizePublicSiteUrl("https://example.com/base"));
  assert.throws(() => normalizePublicSiteUrl("https://example.com?utm_source=test"));
  assert.throws(() => normalizePublicSiteUrl("javascript:alert(1)"));
});

test("las rutas de imágenes procedentes de la API no pueden escapar de su carpeta pública", async () => {
  const { isSafePublicAssetPath } = await loadTypeScriptModule(
    "../src/utils/publicAssetPath.ts"
  );

  assert.equal(isSafePublicAssetPath("productos/jamon-iberico.webp"), true);
  assert.equal(isSafePublicAssetPath("jamón-ibérico.png"), true);
  assert.equal(isSafePublicAssetPath("../web/error.png"), false);
  assert.equal(isSafePublicAssetPath("%2e%2e/web/error.png"), false);
  assert.equal(isSafePublicAssetPath("%252e%252e/web/error.png"), false);
  assert.equal(isSafePublicAssetPath("imagenes%252fprivadas/foto.png"), false);
  assert.equal(isSafePublicAssetPath("foto%E2%80%AEgnp.png"), false);
  assert.equal(isSafePublicAssetPath("https://example.com/image.png"), false);
  assert.equal(isSafePublicAssetPath("imagen.png?version=2"), false);
  assert.equal(isSafePublicAssetPath("/imagen.png"), false);
});

test("las redirecciones de slugs traducidos conservan la consulta original", async () => {
  const [page, loader] = await Promise.all([
    readFile(new URL("../src/pages/blog/[slug].tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/services/blogLoader.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /loadBlogData\([\s\S]*?getQuerySuffix\(context\.resolvedUrl\)/);
  assert.match(loader, /routeSuffix = ""/);
  assert.match(
    loader,
    /buildLocalizedBlogPath\(locale, normalizedTranslatedSlug, routeSuffix\)/
  );
});

test("la preferencia de idioma localiza un artículo aunque el slug pertenezca a otro locale", async () => {
  const redirect = await readFile(
    new URL("../src/utils/redirectByCookieSlug.ts", import.meta.url),
    "utf8"
  );

  assert.match(redirect, /getBlogFallbackLocales/);
  assert.match(redirect, /const locales = \[locale, \.\.\.getBlogFallbackLocales\(locale\)\]/);
  assert.match(redirect, /error\.response\?\.status === 404/);
  assert.match(redirect, /findBlogPostBySlug\(normalizedSlug, locale, token\)/);
});

test("el sitemap conserva las rutas estáticas si falla la fuente de artículos", async () => {
  const sitemap = await readFile(
    new URL("../src/pages/sitemap.xml.tsx", import.meta.url),
    "utf8"
  );

  assert.match(sitemap, /let blogEntries: SitemapBlogEntry\[\] = \[\]/);
  assert.match(sitemap, /blogEntries = await getSitemapBlogEntries\(\)/);
  assert.match(sitemap, /se publicarán las rutas estáticas/);
  assert.match(sitemap, /buildStaticFields\(siteUrl\)/);
  assert.match(sitemap, /blogEntriesAvailable[\s\S]*?s-maxage=60/);
});

test("el campo de nombre completo usa el token de autocompletado correcto", async () => {
  const form = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(form, /autoComplete="name"[\s\S]*?id="name"/);
  assert.doesNotMatch(form, /autoComplete="given-name"/);
});

test("blog y charcutería validan las rutas de imagen antes de renderizarlas", async () => {
  const [blogService, charcuteriaService] = await Promise.all([
    readFile(new URL("../src/services/blogService.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/services/charcuteriaService.ts", import.meta.url), "utf8"),
  ]);

  assert.match(blogService, /isSafePublicAssetPath\(post\.imagen_url\)/);
  assert.match(blogService, /isOptionalPublicAssetPath\(post\.imagen_url_2\)/);
  assert.match(blogService, /isSafePublicAssetPath\(value\)/);
  assert.match(charcuteriaService, /isSafePublicAssetPath\(product\.imagen_url\)/);
});
