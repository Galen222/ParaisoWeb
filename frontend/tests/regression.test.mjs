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
