import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("Bravo Murillo permanece comentado y fuera de la interfaz pública", async () => {
  const [navbar, banners, contacto, reservas, sitemap, map, slides, closedPage] =
    await Promise.all([
      readSource("../src/components/Navbar.tsx"),
      readSource("../src/utils/bannersData.ts"),
      readSource("../src/pages/contacto.tsx"),
      readSource("../src/pages/reservas.tsx"),
      readSource("../src/pages/sitemap.xml.tsx"),
      readSource("../src/components/Map.tsx"),
      readSource("../src/utils/slidesData.ts"),
      readSource("../src/pages-disabled/bravo-murillo.tsx.disabled"),
    ]);

  assert.equal(
    (navbar.match(/Restaurante cerrado: se conserva el enlace comentado/g) ?? []).length,
    2,
  );
  assert.match(banners, /\/\/ Restaurante cerrado: \{ href: "\/bravo-murillo"/);
  assert.match(contacto, /\{\/\* Restaurante cerrado: <Localization localizationName="bravo-murillo" \/> \*\/\}/);
  assert.match(reservas, /\{\/\* Restaurante cerrado: <Localization localizationName="bravo-murillo" \/> \*\/\}/);
  assert.match(sitemap, /\/\/ Restaurante cerrado: "\/bravo-murillo"/);
  assert.match(map, /\/\* Restaurante cerrado: se conserva su configuración/);
  assert.match(slides, /\/\* Restaurante cerrado: se conserva el carrusel comentado/);

  const nonCommentedLines = closedPage
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("//"));
  assert.deepEqual(nonCommentedLines, []);
  assert.match(closedPage, /BravoMurilloPage/);
  assert.match(closedPage, /LocalBusinessJsonLd|Localization|Carousel|Transport|Map/);
});

test("los textos públicos y las palabras clave ya no muestran Bravo Murillo", async () => {
  for (const locale of ["es", "en", "de", "fr"]) {
    const messages = JSON.parse(
      await readSource(`../src/locales/${locale}/common.json`),
    );

    assert.doesNotMatch(messages.seo_keywords, /Bravo Murillo/i);
    assert.doesNotMatch(messages.nosotros_Texto2c, /Bravo Murillo/i);
  }
});
