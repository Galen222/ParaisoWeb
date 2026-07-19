import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readSource = async (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el contenido de cada página queda dentro del landmark principal", async () => {
  const app = await readSource("../src/pages/_app.tsx");

  assert.match(
    app,
    /<Navbar[\s\S]*?<main>[\s\S]*?<Component[\s\S]*?<\/main>[\s\S]*?<Footer \/>/
  );
});

test("la navegación de escritorio usa un landmark nav y el hero usa header", async () => {
  const navbar = await readSource("../src/components/Navbar.tsx");

  assert.match(
    navbar,
    /<nav[\s\S]*?ref=\{navbarMenuRef\}[\s\S]*?aria-label=\{intl\.formatMessage\(\{ id: "navbar_menu" \}\)\}/
  );
  assert.match(navbar, /<header className=\{styles\.navbar\}>/);
  assert.doesNotMatch(navbar, /<div ref=\{navbarMenuRef\}/);
});

test("el consentimiento de privacidad tiene un nombre accesible", async () => {
  const form = await readSource("../src/components/Form.tsx");

  assert.match(form, /id="privacyCheck"[\s\S]*?aria-labelledby="privacyCheckText"/);
  assert.match(form, /id="privacyCheckText" className=\{styles\.checkText\}/);
});

test("los subtítulos mantienen su aspecto y exponen nivel semántico dos", async () => {
  const sources = await Promise.all([
    readSource("../src/components/Form.tsx"),
    readSource("../src/components/Localization.tsx"),
    readSource("../src/components/Carousel.tsx"),
    readSource("../src/components/Transport.tsx"),
    readSource("../src/pages/gastronomia.tsx"),
    readSource("../src/pages/aviso-legal.tsx"),
    readSource("../src/pages/politica-cookies.tsx"),
    readSource("../src/pages/politica-privacidad.tsx"),
    readSource("../src/pages/blog.tsx"),
    readSource("../src/pages/charcuteria.tsx"),
  ]);

  for (const source of sources) {
    assert.match(source, /<h[234] aria-level=\{2\}/);
  }
});

test("los iconos de transporte son decorativos y no repiten el título", async () => {
  const transport = await readSource("../src/components/Transport.tsx");

  assert.equal((transport.match(/<img src=\{image\w+\} alt="" \/>/g) || []).length, 4);
  assert.doesNotMatch(transport, /image(?:Metro|Bus|Taxi|Parking)Alt/);
});

test("la meta de autor usa un nombre HTML válido", async () => {
  const seo = await readSource("../src/config/next-seo.config.ts");

  assert.match(seo, /name: "author",\s*content: "PACAVA S\.A\."/);
  assert.doesNotMatch(seo, /name: "PACAVA S\.A"/);
});

test("el carrusel automático permite pausar y reanudar el movimiento", async () => {
  const [carousel, sliderTypes, carouselCss, ...localeFiles] = await Promise.all([
    readSource("../src/components/Carousel.tsx"),
    readSource("../src/types/react-slick.d.ts"),
    readSource("../src/styles/components/Carousel.module.css"),
    ...["es", "en", "de", "fr"].map((locale) =>
      readSource(`../src/locales/${locale}/common.json`)
    ),
  ]);

  assert.match(carousel, /autoplay: !prefersReducedMotion && !isPaused/);
  assert.match(carousel, /sliderRef\.current\?\.slickPause\(\)/);
  assert.match(carousel, /sliderRef\.current\?\.slickPlay\(\)/);
  assert.match(carousel, /id: isPaused \? "carousel_Reanudar" : "carousel_Pausar"/);
  assert.doesNotMatch(carousel, /aria-pressed=\{isPaused\}/);
  assert.match(sliderTypes, /slickPause\(\): void/);
  assert.match(sliderTypes, /slickPlay\(\): void/);
  assert.match(carouselCss, /\.autoplayButton/);
  assert.match(carousel, /aria-label=\{intl\.formatMessage/);
  assert.match(carousel, /<svg aria-hidden="true"/);
  assert.match(carouselCss, /width: 28px;/);
  assert.match(carouselCss, /height: 28px;/);
  assert.match(carouselCss, /padding: 6px;/);

  for (const localeFile of localeFiles) {
    assert.match(localeFile, /"carousel_Pausar":/);
    assert.match(localeFile, /"carousel_Reanudar":/);
  }
});

test("los archivos de pruebas usan nombres descriptivos", async () => {
  const files = await readdir(new URL("./", import.meta.url));

  assert.equal(files.some((file) => /(?:phase|fase)\d*/i.test(file)), false);
});
