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

test("el referer interno debe coincidir también en protocolo y puerto", async () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const { isSameRequestHost } = await loadTypeScriptModule(
    "../src/utils/requestHost.ts"
  );

  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.paraisodeljamon.com";
    assert.equal(
      isSameRequestHost(new URL("https://www.paraisodeljamon.com/blog"), {
        host: "backend-interno:3000",
      }),
      true
    );
    assert.equal(
      isSameRequestHost(new URL("http://www.paraisodeljamon.com/blog"), {
        host: "www.paraisodeljamon.com",
      }),
      false
    );
    assert.equal(
      isSameRequestHost(new URL("https://www.paraisodeljamon.com:444/blog"), {
        host: "www.paraisodeljamon.com",
      }),
      false
    );

    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(
      isSameRequestHost(new URL("http://localhost:3000/blog"), {
        host: "localhost:3000",
      }),
      true
    );
    assert.equal(
      isSameRequestHost(new URL("http://localhost:4000/blog"), {
        host: "localhost:3000",
      }),
      false
    );
  } finally {
    if (previousSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    }
  }
});

test("los componentes corregidos conservan HTML válido y controles nativos", async () => {
  const [footer, animatedTitle, banner, form, navbar] = await Promise.all([
    readFile(new URL("../src/components/Footer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AnimatedTitle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Banner.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(footer, /<span className=\{styles\.linksContainer\}>/);
  assert.doesNotMatch(footer, /<div className=\{styles\.linksContainer\}>/);
  assert.match(footer, /getServerCurrentYear = \(\): string => ""/);
  assert.doesNotMatch(
    footer,
    /Footer_Rights[^\n]*new Date\(\)\.getFullYear\(\)/
  );

  assert.doesNotMatch(animatedTitle, /<h1>[\s\S]*?<div/);
  assert.doesNotMatch(banner, /<Link[\s\S]*?<button/);

  assert.match(form, /<label className=\{styles\.checkboxControl\} htmlFor="privacyCheck">/);
  assert.doesNotMatch(form, /checkboxControl\} onClick=/);

  assert.match(navbar, /<button[\s\S]*?aria-controls="navbar-mobile-menu"/);
  assert.match(navbar, /className=\{styles\.flagButton\}/);
  assert.doesNotMatch(navbar, /<img[\s\S]*?onClick=\{\(\) => handleLocaleChange/);
});


test("la fase 3 preserva el email escrito y usa actualizaciones de estado no obsoletas", async () => {
  const [form, menuContext] = await Promise.all([
    readFile(new URL("../src/components/Form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/contexts/MenuContext.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(form, /const value = e\.target\.value\.normalize\("NFC"\)/);
  assert.match(form, /email: value/);
  assert.doesNotMatch(form, /sanitizedValue/);
  assert.match(menuContext, /setMobileMenu\(\(isOpen\) => !isOpen\)/);
});

test("los menús, tarjetas y paginador de fase 3 son utilizables con teclado", async () => {
  const [navbar, charcuteria, paginator] = await Promise.all([
    readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/charcuteria.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Paginator.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(navbar, /aria-controls="navbar-restaurants-menu"/);
  assert.match(navbar, /event\.key === "Escape"/);
  assert.doesNotMatch(navbar, /onFocus=\{openRestaurantsMenu\}/);

  assert.match(charcuteria, /role="button"/);
  assert.match(charcuteria, /tabIndex=\{0\}/);
  assert.match(charcuteria, /aria-pressed=/);
  assert.match(charcuteria, /handleCardKeyDown/);

  assert.match(paginator, /<nav className=\{styles\.paginator\}/);
  assert.match(paginator, /aria-current=\{pageEntry === currentPage \? "page" : undefined\}/);
  assert.match(paginator, /className=\{styles\.paginatorEllipsis\}/);
  assert.doesNotMatch(paginator, /disabled=\{typeof pageNum !== "number"\}/);
});

test("las imágenes Open Graph específicas usan URLs absolutas", async () => {
  const pages = [
    "san-bernardo.tsx",
    "bravo-murillo.tsx",
    "reina-victoria.tsx",
    "arenal.tsx",
    "gastronomia.tsx",
    "nosotros.tsx",
  ];

  for (const page of pages) {
    const source = await readFile(new URL(`../src/pages/${page}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /url: "\/images\//);
    assert.match(source, /url: `\$\{siteUrl\.replace\(\/\\\/\+\$\/, ""\)\}\/images\//);
  }
});

test("las claves accesibles nuevas existen en los tres idiomas", async () => {
  const locales = ["es", "en", "de"];
  const requiredKeys = [
    "charcuteria_MostrarDetalles",
    "charcuteria_OcultarDetalles",
    "paginador_Navegacion",
    "paginador_PrimeraPagina",
    "paginador_PaginaAnterior",
    "paginador_Pagina",
    "paginador_PaginaActual",
    "paginador_PaginaSiguiente",
    "paginador_UltimaPagina",
  ];

  for (const locale of locales) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    for (const key of requiredKeys) assert.equal(typeof messages[key], "string");
  }
});

test("la fase 4 retira del foco los menús ocultos y limpia su estado", async () => {
  const [navbar, menuContext, navbarStyles] = await Promise.all([
    readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/contexts/MenuContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles/components/Navbar.module.css", import.meta.url), "utf8"),
  ]);

  assert.match(navbar, /hidden=\{!mobileMenu\}/);
  assert.match(navbar, /hidden=\{!restaurantsMenu\}/);
  assert.match(navbar, /previousIsMobileRef/);
  assert.match(navbar, /closeMobileMenu\(\);[\s\S]*closeRestaurantsMenu\(\);/);
  assert.match(navbarStyles, /\.navbarMenu\[hidden\],[\s\S]*\.dropdown\[hidden\][\s\S]*display: none !important/);
  assert.match(menuContext, /const closeMobileMenu = useCallback/);
  assert.match(menuContext, /const closeRestaurantsMenu = useCallback/);
});

test("el diálogo de cookies tiene destino legal real y semántica accesible", async () => {
  const cookie = await readFile(
    new URL("../src/components/Cookie.tsx", import.meta.url),
    "utf8"
  );

  assert.match(cookie, /role="dialog"/);
  assert.match(cookie, /aria-modal="true"/);
  assert.match(cookie, /aria-labelledby="cookie-dialog-title"/);
  assert.match(cookie, /href="\/politica-cookies"/);
  assert.match(cookie, /href="\/politica-privacidad"/);
  assert.doesNotMatch(cookie, /href="#"/);
});

test("el diálogo de cookies contiene el foco y lo restaura al cerrarse", async () => {
  const cookie = await readFile(
    new URL("../src/components/Cookie.tsx", import.meta.url),
    "utf8"
  );

  assert.match(cookie, /const dialogRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(cookie, /dialogRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(cookie, /previouslyFocusedElement\.focus\(\{ preventScroll: true \}\)/);
  assert.match(cookie, /event\.key !== "Tab"/);
  assert.match(cookie, /tabIndex=\{-1\}/);
  assert.match(cookie, /onKeyDown=\{handleDialogKeyDown\}/);
  assert.match(cookie, /aria-describedby="cookie-dialog-description"/);
});

test("el formulario no usa validación nativa sobre un input de archivo oculto", async () => {
  const form = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );
  const fileInput = form.match(/<input\s+ref=\{fileInputRef\}[\s\S]*?\/>/)?.[0] ?? "";

  assert.match(fileInput, /className="d-none"/);
  assert.match(fileInput, /aria-required=\{formData\.reason === "factura" \|\| formData\.reason === "curriculum"\}/);
  assert.doesNotMatch(fileInput, /(^|\s)required=/);
});

test("borrar o invalidar el consentimiento vuelve a solicitar una decisión explícita", async () => {
  const [cookieUtils, cookieLogic] = await Promise.all([
    readFile(new URL("../src/utils/cookieUtils.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/hooks/useCookieLogic.ts", import.meta.url), "utf8"),
  ]);

  assert.match(cookieUtils, /export const COOKIE_CONSENT_CLEARED_EVENT/);
  assert.match(cookieUtils, /window\.dispatchEvent\(new Event\(COOKIE_CONSENT_CLEARED_EVENT\)\)/);
  assert.match(cookieUtils, /setAcceptCookiePersonalization\(false\);[\s\S]*setCookieConsentAnalysisGoogle\(false\);[\s\S]*await disableGA\(\)/);

  assert.match(cookieLogic, /window\.addEventListener\(COOKIE_CONSENT_CLEARED_EVENT, handleConsentCleared\)/);
  assert.match(cookieLogic, /revokeCookieCategories\(\{ analysis: true, googleAnalytics: true, personalization: true \}\);[\s\S]*setShowCookieModal\(true\);/);
  assert.doesNotMatch(cookieLogic, /hasValidPersonalizationCookie|hasAnalysisCookie|hasGoogleAnalyticsCookie/);
});

test("un tipo de carrusel desconocido no ejecuta undefined.map", async () => {
  const carousel = await readFile(
    new URL("../src/components/Carousel.tsx", import.meta.url),
    "utf8"
  );

  assert.match(carousel, /const slides: Slide\[\] \| undefined/);
  assert.match(carousel, /if \(!slides \|\| slides\.length === 0\)/);
  assert.match(carousel, /console\.error\([\s\S]*`Carrusel no disponible:/);
});

test("el aviso legal anida las listas secundarias dentro de su elemento de lista", async () => {
  const legalNotice = await readFile(
    new URL("../src/pages/aviso-legal.tsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(
    legalNotice,
    /<\/li>\s*<ul className=\{styles\.listas2\}>/
  );
  assert.match(
    legalNotice,
    /avisoLegal_Obligaciones_Texto1_Punto1[\s\S]*?<ul className=\{styles\.listas2\}>[\s\S]*?<\/ul>\s*<\/li>/
  );
  assert.match(
    legalNotice,
    /avisoLegal_Obligaciones_Texto2_Punto9[\s\S]*?<ul className=\{styles\.listas2\}>[\s\S]*?<\/ul>\s*<\/li>/
  );
});

test("el modal de cookies bloquea el fondo y muestra el foco de sus interruptores", async () => {
  const [cookie, cookieStyles] = await Promise.all([
    readFile(new URL("../src/components/Cookie.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/styles/components/Cookie.module.css", import.meta.url),
      "utf8"
    ),
  ]);

  assert.match(cookie, /const previousBodyOverflow = document\.body\.style\.overflow/);
  assert.match(cookie, /document\.body\.style\.overflow = "hidden"/);
  assert.match(cookie, /document\.body\.style\.overflow = previousBodyOverflow/);
  assert.match(cookieStyles, /input:focus-visible \+ \.slider/);
  assert.match(cookieStyles, /\.hiddenCheckbox \{[\s\S]*?width: 1px;[\s\S]*?height: 1px;/);
  assert.doesNotMatch(cookieStyles, /\.hiddenCheckbox \{[\s\S]*?width: 0;/);
});

test("las cabeceras de la tabla de cookies están traducidas y tienen alcance semántico", async () => {
  const cookiePolicy = await readFile(
    new URL("../src/pages/politica-cookies.tsx", import.meta.url),
    "utf8"
  );
  const requiredKeys = [
    "politicaCookies_Utilizadas_CabeceraNombre",
    "politicaCookies_Utilizadas_CabeceraTitular",
    "politicaCookies_Utilizadas_CabeceraFinalidad",
    "politicaCookies_Utilizadas_CabeceraDuracion",
  ];

  assert.match(cookiePolicy, /<th scope="row">/);
  assert.match(cookiePolicy, /<th scope="col">/);
  assert.doesNotMatch(cookiePolicy, /<t[dh]>Nombre<\/t[dh]>/);
  assert.doesNotMatch(cookiePolicy, /<t[dh]>Titular<\/t[dh]>/);
  assert.doesNotMatch(cookiePolicy, /<t[dh]>Finalidad<\/t[dh]>/);
  assert.doesNotMatch(cookiePolicy, /<t[dh]>Duración<\/t[dh]>/);

  for (const locale of ["es", "en", "de"]) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    for (const key of requiredKeys) assert.equal(typeof messages[key], "string");
  }
});

test("las páginas de error y el error temporal del blog no son indexables", async () => {
  const [errorPage, notFoundPage, blogDetail] = await Promise.all([
    readFile(new URL("../src/pages/_error.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/404.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/blog/[slug].tsx", import.meta.url), "utf8"),
  ]);

  assert.match(errorPage, /<NextSeo noindex nofollow \/>/);
  assert.match(notFoundPage, /<NextSeo noindex nofollow \/>/);
  assert.match(blogDetail, /noindex=\{Boolean\(error\)\}/);
  assert.match(blogDetail, /nofollow=\{Boolean\(error\)\}/);
});

test("la firma PDF puede aparecer dentro de los primeros 1024 bytes", async () => {
  const { hasPdfSignature } = await loadTypeScriptModule(
    "../src/utils/pdfSignature.ts"
  );

  assert.equal(await hasPdfSignature(new Blob(["%PDF-1.7"])), true);
  assert.equal(await hasPdfSignature(new Blob(["comentario previo\n%PDF-1.7"])), true);
  assert.equal(await hasPdfSignature(new Blob(["x".repeat(1020), "%PDF-1.7"])), false);
  assert.equal(await hasPdfSignature(new Blob(["contenido HTML"])), false);
});


test("el formulario usa la misma validación de correo que el backend sin restricciones extra de guiones", async () => {
  const form = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(form, /validateEmailPart/);
  assert.doesNotMatch(form, /\[\.\-\]\{2,\}/);
  assert.match(form, /setIsValidEmail\(validator\.isEmail\(value\)\)/);
});

test("la configuración SEO no genera una segunda directiva robots contradictoria", async () => {
  const seoConfig = await readFile(
    new URL("../src/config/next-seo.config.ts", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(seoConfig, /name:\s*["']robots["']/);
  assert.doesNotMatch(seoConfig, /content:\s*["']index, follow["']/);
});

test("la clave de ejemplo de Google Maps se trata como configuración ausente", async () => {
  const map = await readFile(
    new URL("../src/components/Map.tsx", import.meta.url),
    "utf8"
  );

  assert.match(map, /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\?\.trim\(\)/);
  assert.match(map, /apiKey === "cambiar_por_clave_publica_de_google_maps"/);
  assert.match(map, /if \(!apiKey \|\| isExampleApiKey\)/);
});

test("la política explica que rechazar cookies se recuerda durante un año", async () => {
  const expectedFragments = {
    es: ["se recordará durante un año", "retirar el consentimiento"],
    en: ["remembered for one year", "withdraw consent"],
    de: ["ein Jahr lang gespeichert", "Einwilligung widerrufen"],
  };

  for (const [locale, fragments] of Object.entries(expectedFragments)) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    const explanation = messages.politicaCookies_Aceptacion_Texto3_Punto3;

    for (const fragment of fragments) assert.match(explanation, new RegExp(fragment));
  }
});

test("la fase 8 redirige un slug existente en otro idioma a su traducción canónica", async () => {
  const [blogLoader, localeFallback] = await Promise.all([
    readFile(new URL("../src/services/blogLoader.ts", import.meta.url), "utf8"),
    loadTypeScriptModule("../src/utils/blogLocaleFallback.ts"),
  ]);

  assert.deepEqual(localeFallback.getBlogFallbackLocales("en"), ["es", "de"]);
  assert.equal(localeFallback.isSupportedBlogLocale("fr"), false);
  assert.match(blogLoader, /getBlogFallbackLocales\(locale\)/);
  assert.match(blogLoader, /error\.response\?\.status === 404/);
  assert.match(blogLoader, /getBlogPostById\(blogDetails\.id_noticia, locale, token\)/);
  assert.match(blogLoader, /destination: buildLocalizedBlogPath\(locale, normalizedTranslatedSlug, routeSuffix\)/);
});

test("Google Analytics ignora el identificador público de ejemplo y formatos inválidos", async () => {
  const { normalizeGoogleAnalyticsId } = await loadTypeScriptModule(
    "../src/utils/googleAnalyticsId.ts"
  );

  assert.equal(normalizeGoogleAnalyticsId(undefined), null);
  assert.equal(normalizeGoogleAnalyticsId("G-XXXXXXXXXX"), null);
  assert.equal(normalizeGoogleAnalyticsId("UA-123456-1"), null);
  assert.equal(normalizeGoogleAnalyticsId("  g-ab12cd34ef  "), "G-AB12CD34EF");
});

test("el endpoint interno del sitemap solo acepta direcciones loopback", async () => {
  const { requireLoopbackSitemapApiUrl } = await loadTypeScriptModule(
    "../src/utils/sitemapApiUrl.ts"
  );

  assert.equal(
    requireLoopbackSitemapApiUrl("http://127.0.0.1:8000/api/sitemap/blog"),
    "http://127.0.0.1:8000/api/sitemap/blog"
  );
  assert.equal(
    requireLoopbackSitemapApiUrl("http://[::1]:8000/api/sitemap/blog"),
    "http://[::1]:8000/api/sitemap/blog"
  );
  assert.throws(
    () => requireLoopbackSitemapApiUrl("https://api.example.com/api/sitemap/blog"),
    /loopback local/
  );
});

test("el enlace alemán de ayuda de Firefox no queda truncado", async () => {
  const messages = JSON.parse(
    await readFile(new URL("../src/locales/de/common.json", import.meta.url), "utf8")
  );

  assert.equal(
    messages.politicaCookies_Desactivacion_Texto3_Punto2_Enlace,
    "https://support.mozilla.org/de/kb/cookies-und-website-daten-in-firefox-loschen"
  );
});
