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

test("Analytics no duplica una vista por cambios exclusivos de ancla", async () => {
  const source = await readFile(
    new URL("../src/hooks/useTrackingGA.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /const routeWithoutHash = router\.asPath\.split\("#", 1\)\[0\]/);
  assert.match(
    source,
    /\[cookieConsentAnalysisGoogle, currentPage, routeWithoutHash\]/
  );
  assert.doesNotMatch(
    source,
    /\[cookieConsentAnalysisGoogle, currentPage, router\.asPath\]/
  );
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

  for (const locale of ["es", "en", "de"]) {
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
