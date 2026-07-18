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
  assert.throws(() => normalizePublicSiteUrl("https://example.com:0"));
  assert.throws(() => normalizePublicSiteUrl("javascript:alert(1)"));
});

test("las URLs públicas de API rechazan el puerto TCP cero", async () => {
  const { requirePublicApiUrl } = await loadTypeScriptModule(
    "../src/config/api.config.ts"
  );

  assert.equal(
    requirePublicApiUrl("https://api.example.com:8443/base/", "API_URL"),
    "https://api.example.com:8443/base"
  );
  assert.throws(() => requirePublicApiUrl("https://api.example.com:0/base", "API_URL"));
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
  assert.match(redirect, /const fallbackPosts: BlogPost\[\] = \[\]/);
  assert.match(redirect, /selectUniqueBlogFallbackPost\(fallbackPosts\)/);
  assert.match(redirect, /error\.response\?\.status === 404/);
  assert.match(redirect, /findBlogPostBySlug\(normalizedSlug, locale, token\)/);
});

test("el sitemap conserva las rutas estáticas si falla la fuente de artículos", async () => {
  const sitemap = await readFile(
    new URL("../src/pages/sitemap.xml.tsx", import.meta.url),
    "utf8"
  );

  assert.match(sitemap, /let blogEntries: SitemapBlogEntry\[\] = \[\]/);
  assert.match(sitemap, /blogEntries = await getSitemapBlogEntries\(frontendLogger\)/);
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

test("la redirección por cookie distingue un cambio manual de otro artículo", async () => {
  const redirect = await readFile(
    new URL("../src/utils/redirectByCookieSlug.ts", import.meta.url),
    "utf8"
  );

  assert.match(redirect, /getBlogRefererCandidate/);
  assert.match(redirect, /getBlogPostBySlug\([\s\S]*?refererCandidate\.slug[\s\S]*?refererCandidate\.locale/);
  assert.match(redirect, /refererBlogPost\.id_noticia === blogPost\.id_noticia/);
  assert.doesNotMatch(
    redirect,
    /isBlogDetailsPath\(refererUrl\.pathname\)[\s\S]*?return null/
  );
});

test("las rutas públicas rechazan delimitadores URL aunque estén codificados", async () => {
  const { isSafePublicAssetPath } = await loadTypeScriptModule(
    "../src/utils/publicAssetPath.ts"
  );

  assert.equal(isSafePublicAssetPath("foto%3Fversion.png"), false);
  assert.equal(isSafePublicAssetPath("foto%2523ancla.png"), false);
  assert.equal(isSafePublicAssetPath("carpeta/imagen-normal.png"), true);
});

test("los enlaces telefónicos usan un destino normalizado sin alterar el texto visible", async () => {
  const [{ buildTelephoneHref }, map, localization] = await Promise.all([
    loadTypeScriptModule("../src/utils/telephoneHref.ts"),
    readFile(new URL("../src/components/Map.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Localization.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal(buildTelephoneHref("+34 91 532 83 50"), "tel:+34915328350");
  assert.equal(buildTelephoneHref("(91) 532-83-50"), "tel:915328350");
  assert.match(map, /href="\$\{buildTelephoneHref\(location\.telephone\)\}"/);
  assert.doesNotMatch(map, /href="tel:\$\{location\.telephone\}"/);
  assert.doesNotMatch(
    map,
    /buildTelephoneHref\(location\.telephone\)[\s\S]{0,80}target="_blank"/
  );
  assert.match(localization, /href=\{buildTelephoneHref\(telephone\)\}/);
});

test("cada restaurante tiene una identidad estable y está vinculado con la marca", async () => {
  const restaurants = [
    { file: "san-bernardo.tsx", slug: "san-bernardo", name: "Paraíso Del Jamón I", branchCode: "I" },
    { file: "bravo-murillo.tsx", slug: "bravo-murillo", name: "Paraíso Del Jamón II", branchCode: "II" },
    { file: "reina-victoria.tsx", slug: "reina-victoria", name: "Paraíso Del Jamón III", branchCode: "III" },
    { file: "arenal.tsx", slug: "arenal", name: "Paraíso Del Jamón IV", branchCode: "IV" },
  ];

  for (const restaurant of restaurants) {
    const page = await readFile(
      new URL(`../src/pages/${restaurant.file}`, import.meta.url),
      "utf8"
    );

    assert.match(page, /const organizationId = `\$\{siteUrl\}\/#organization`/);
    const expectedRestaurantId = `const restaurantId = \`\${siteUrl}/#restaurant-${restaurant.slug}\`;`;
    assert.ok(page.includes(expectedRestaurantId));
    assert.match(page, /<OrganizationJsonLd[\s\S]*?id=\{organizationId\}[\s\S]*?name="El Paraíso Del Jamón"/);
    assert.match(
      page,
      new RegExp(`<LocalBusinessJsonLd[\\s\\S]*?id=\\{restaurantId\\}[\\s\\S]*?name="${restaurant.name}"`)
    );
    assert.match(page, new RegExp(`branchCode="${restaurant.branchCode}"`));
    assert.match(
      page,
      /parentOrganization=\{\{[\s\S]*?"@type": "Organization"[\s\S]*?"@id": organizationId[\s\S]*?name: "El Paraíso Del Jamón"/
    );
    assert.doesNotMatch(page, /<LocalBusinessJsonLd[\s\S]*?id=\{currentUrl\}/);
  }
});

test("el título alemán de Arenal conserva el número romano IV", async () => {
  const messages = JSON.parse(
    await readFile(new URL("../src/locales/de/common.json", import.meta.url), "utf8")
  );

  assert.equal(messages.arenal_Titulo, "Willkommen in Paraíso Del Jamón IV");
});

test("los errores temporales del artículo no publican canonical ni og:url", async () => {
  const [app, articlePage] = await Promise.all([
    readFile(new URL("../src/pages/_app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/blog/[slug].tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    app,
    /const isBlogContentError = router\.pathname === "\/blog\/\[slug\]" && Boolean\(pageProps\.error\)/
  );
  assert.match(app, /const seoPath = isErrorPage \? undefined : router\.asPath/);
  assert.match(articlePage, /url: error \? undefined : currentUrl/);
});

test("las cuatro sucursales mantienen su identidad exacta en la interfaz", async () => {
  const [map, ...localeSources] = await Promise.all([
    readFile(new URL("../src/components/Map.tsx", import.meta.url), "utf8"),
    ...["es", "en", "de", "fr"].map((locale) =>
      readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    ),
  ]);

  for (const roman of ["I", "II", "III", "IV"]) {
    assert.match(map, new RegExp(`name: "Paraíso Del Jamón ${roman}"`));
    for (const localeSource of localeSources) {
      assert.match(localeSource, new RegExp(`Paraíso Del Jamón ${roman}`));
      assert.doesNotMatch(localeSource, new RegExp(`Paraíso del Jamón ${roman}`));
    }
  }
});
test("la política de cookies enlaza a la ayuda oficial HTTPS de Safari", async () => {
  const expectedUrls = {
    es: "https://support.apple.com/es-es/guide/safari/sfri11471/mac",
    en: "https://support.apple.com/en-us/guide/safari/sfri11471/mac",
    de: "https://support.apple.com/de-de/guide/safari/sfri11471/mac",
    fr: "https://support.apple.com/fr-fr/guide/safari/sfri11471/mac",
  };

  for (const [locale, expectedUrl] of Object.entries(expectedUrls)) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    assert.equal(
      messages.politicaCookies_Desactivacion_Texto3_Punto4_Enlace,
      expectedUrl
    );
  }
});
