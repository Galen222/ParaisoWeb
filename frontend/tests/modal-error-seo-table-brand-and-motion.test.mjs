import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el modal de cookies oculta e inutiliza el contenido de fondo", async () => {
  const source = await readSource("../src/pages/_app.tsx");

  assert.match(source, /<Cookie[\s\S]*?<div aria-hidden=\{showCookieModal \? true : undefined\} inert=\{showCookieModal\}>/);
  assert.match(source, /inert=\{showCookieModal\}[\s\S]*?<Navbar[\s\S]*?<main>[\s\S]*?<Footer \/>[\s\S]*?<\/div>/);
});

test("las páginas de error publican metadatos localizados y no indexables", async () => {
  const [notFound, errorPage] = await Promise.all([
    readSource("../src/pages/404.tsx"),
    readSource("../src/pages/_error.tsx"),
  ]);

  for (const source of [notFound, errorPage]) {
    assert.match(source, /<NextSeo[\s\S]*?title=\{seoTitle\}[\s\S]*?description=\{message\}[\s\S]*?noindex[\s\S]*?nofollow/);
    assert.match(source, /openGraph=\{\{ title: seoTitle, description: message \}\}/);
  }
});

test("la tabla legal identifica su título y los encabezados de cada fila", async () => {
  const source = await readSource("../src/components/LegalInfo.tsx");

  assert.match(source, /<caption[^>]*>[\s\S]*?contacto_Tabla_Titulo[\s\S]*?<\/caption>/);
  assert.equal((source.match(/<th scope="row"/g) ?? []).length, 6);
  assert.doesNotMatch(source, /<th colSpan=\{2\}>/);
});

test("el control del carrusel anuncia una acción sin estado contradictorio", async () => {
  const source = await readSource("../src/components/Carousel.tsx");

  assert.match(source, /id: isPaused \? "carousel_Reanudar" : "carousel_Pausar"/);
  assert.doesNotMatch(source, /aria-pressed=\{isPaused\}/);
});

test("la descarga de la carta respeta la reducción de movimiento", async () => {
  const source = await readSource("../src/pages/gastronomia.tsx");

  assert.match(source, /const prefersReducedMotion = usePrefersReducedMotion\(\)/);
  assert.match(source, /if \(!prefersReducedMotion\) \{[\s\S]*?setIsPushingDownloadMenuFile\(true\)/);
  assert.match(source, /!prefersReducedMotion && isPushingDownloadMenuFile \? "animate-push" : ""/);
  assert.match(source, /<button[\s\S]*?type="button"[\s\S]*?handleDownloadMenu/);
});

test("la cabecera y las descripciones SEO usan el nombre completo de la marca", async () => {
  const [navbar, ...localeSources] = await Promise.all([
    readSource("../src/components/Navbar.tsx"),
    ...["es", "en", "de", "fr"].map((locale) =>
      readSource(`../src/locales/${locale}/common.json`)
    ),
  ]);

  assert.equal((navbar.match(/EL PARAÍSO DEL JAMÓN/g) ?? []).length, 2);
  assert.doesNotMatch(navbar, />PARAISO DEL JAMON</);

  for (const localeSource of localeSources) {
    const messages = JSON.parse(localeSource);
    assert.match(messages.seo_descripcion, /El Paraíso Del Jamón/);
  }
});

test("los textos legales españoles corrigen tildes, concordancia y puntuación", async () => {
  const messages = JSON.parse(await readSource("../src/locales/es/common.json"));
  const legalText = [
    messages.politicaCookies_Utilizadas_Finalidad1,
    messages.politicaCookies_Utilizadas_Finalidad3,
    messages.politicaCookies_Actualizacion_Texto,
    messages.politicaPrivacidad_Principal_Texto3,
    messages.politicaPrivacidad_Finalidad_Texto2_Punto1,
    messages.politicaPrivacidad_Actualizacion_Texto,
    messages.avisoLegal_Principal_Texto3,
    messages.avisoLegal_Propiedad_Texto1,
    messages.avisoLegal_Actualizacion_Texto,
  ].join("\n");

  assert.match(legalText, /anónima/);
  assert.match(legalText, /El uso del sitio web/);
  assert.match(legalText, /inquietudes que pueda tener/);
  assert.match(legalText, /insertados en la página/);
  assert.doesNotMatch(legalText, /anonima|PACAVA S\.A se|El uso de sitio web|inquietudes que puedas tener|insertados en el página/);
});
