import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("volver al locale actual cancela un cambio de idioma pendiente", async () => {
  const source = await readFile(
    new URL("../src/hooks/useLocaleChange.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /const activeNavigationLocaleRef = useRef<string \| null>\(null\)/);
  assert.match(
    source,
    /if \(newLocale === router\.locale\) \{[\s\S]*?pendingController\.abort\(\);[\s\S]*?\+\+localeChangeSequenceRef\.current/
  );
  assert.match(
    source,
    /pendingNavigationLocale && pendingNavigationLocale !== newLocale[\s\S]*?router\.replace\(router\.asPath, router\.asPath, \{ locale: newLocale \}\)/
  );
  assert.match(source, /activeNavigationLocaleRef\.current = newLocale;[\s\S]*?router\.push/);
});

test("Analytics no mezcla vistas automáticas y manuales", async () => {
  const [trackingSource, gaSource] = await Promise.all([
    readFile(new URL("../src/hooks/useTrackingGA.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/gaUtils.ts", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(trackingSource, /useVisitedPageTrackingGA/);
  assert.doesNotMatch(trackingSource, /sendGAPageView/);
  assert.doesNotMatch(gaSource, /sendGAPageView/);
  assert.doesNotMatch(gaSource, /hitType:\s*["']pageview["']/);

  const pages = [
    "404.tsx",
    "_error.tsx",
    "arenal.tsx",
    "aviso-legal.tsx",
    "blog.tsx",
    "blog/[slug].tsx",
    "charcuteria.tsx",
    "contacto.tsx",
    "gastronomia.tsx",
    "index.tsx",
    "nosotros.tsx",
    "politica-cookies.tsx",
    "politica-privacidad.tsx",
    "reina-victoria.tsx",
    "reservas.tsx",
    "san-bernardo.tsx",
  ];

  for (const page of pages) {
    const pageSource = await readFile(
      new URL(`../src/pages/${page}`, import.meta.url),
      "utf8"
    );
    assert.doesNotMatch(pageSource, /useVisitedPageTrackingGA/);
  }
});

test("un fallo temporal al buscar una traducción conserva el artículo y la preferencia actual", async () => {
  const source = await readFile(
    new URL("../src/hooks/useLocaleChange.ts", import.meta.url),
    "utf8"
  );
  const errorMarker = 'clientLogger.error("Error al obtener la traducción del artículo:"';
  const catchStart = source.lastIndexOf("} catch (error: unknown) {", source.indexOf(errorMarker));
  const catchEnd = source.indexOf("\n        }\n      }", source.indexOf(errorMarker));
  const translationErrorHandler = source.slice(catchStart, catchEnd);

  assert.ok(catchStart >= 0 && catchEnd > catchStart);
  assert.match(
    translationErrorHandler,
    /activeRequestControllerRef\.current === controller[\s\S]*?activeRequestControllerRef\.current = null/
  );
  assert.match(translationErrorHandler, /return;/);
  assert.doesNotMatch(translationErrorHandler, /newPath\s*=/);
  assert.doesNotMatch(translationErrorHandler, /saveLocalePreference/);
  assert.doesNotMatch(translationErrorHandler, /router\.(?:push|replace)/);
});

test("Telegram comparte también el título del artículo", async () => {
  const source = await readFile(
    new URL("../src/components/ShareLink.tsx", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /<TelegramShareButton[\s\S]*?title=\{messageWithLink\}/
  );
  assert.doesNotMatch(source, /const telegramMessage/);
});

test("los botones de compartir tienen etiquetas accesibles traducidas", async () => {
  const source = await readFile(
    new URL("../src/components/ShareLink.tsx", import.meta.url),
    "utf8"
  );
  const requiredKeys = [
    "sharedLink_CompartirX",
    "sharedLink_CompartirFacebook",
    "sharedLink_CompartirWhatsApp",
    "sharedLink_CompartirTelegram",
    "sharedLink_CompartirEmail",
  ];

  for (const key of requiredKeys) {
    assert.match(source, new RegExp(`aria-label=\\{getShareLabel\\("${key}"\\)\\}`));
  }

  for (const locale of ["es", "en", "de", "fr"]) {
    const messages = JSON.parse(
      await readFile(
        new URL(`../src/locales/${locale}/common.json`, import.meta.url),
        "utf8"
      )
    );
    for (const key of requiredKeys) {
      assert.equal(typeof messages[key], "string");
      assert.notEqual(messages[key].trim(), "");
    }
  }
});

test("las páginas de error no publican canonical ni hreflang de la ruta técnica 404", async () => {
  const [appSource, seoSource] = await Promise.all([
    readFile(new URL("../src/pages/_app.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/config/next-seo.config.ts", import.meta.url),
      "utf8"
    ),
  ]);

  assert.match(
    appSource,
    /const isErrorPage = router\.pathname === "\/404" \|\| router\.pathname === "\/_error"/
  );
  assert.match(appSource, /const seoPath = isErrorPage \? undefined : router\.asPath/);
  assert.match(
    appSource,
    /const includeLanguageAlternates = !isErrorPage && router\.pathname !== "\/blog\/\[slug\]"/
  );
  assert.match(
    appSource,
    /getSEOConfig\(appLocale, currentMessages, seoPath, includeLanguageAlternates\)/
  );
  assert.match(seoSource, /url: routePath \? currentUrl : undefined/);
});
