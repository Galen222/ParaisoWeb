import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el artículo conserva la imagen social predeterminada cuando no tiene imagen propia", async () => {
  const source = await readSource("../src/pages/blog/[slug].tsx");

  assert.match(
    source,
    /images: blogDetails\?\.imagen_url[\s\S]*?: baseSeoConfig\.openGraph\?\.images \?\? \[\]/
  );
  assert.doesNotMatch(source, /images: blogDetails\?\.imagen_url[\s\S]*?\n\s*: \[\],/);
});

test("el botón de volver del artículo respeta la reducción de movimiento", async () => {
  const source = await readSource("../src/pages/blog/[slug].tsx");

  assert.match(source, /const prefersReducedMotion = usePrefersReducedMotion\(\)/);
  assert.match(source, /type="button"[\s\S]*?!prefersReducedMotion && isPushingBack \? "animate-push" : ""/);
});

test("el botón de borrar cookies respeta la reducción de movimiento", async () => {
  const source = await readSource("../src/pages/politica-cookies.tsx");

  assert.match(source, /const prefersReducedMotion = usePrefersReducedMotion\(\)/);
  assert.match(source, /type="button"[\s\S]*?!prefersReducedMotion && isPushingDelCookies \? "animate-push" : ""/);
});

test("las tablas de cookies tienen un nombre accesible y ocultan sus separadores", async () => {
  const source = await readSource("../src/pages/politica-cookies.tsx");

  assert.match(source, /<h3 id="cookies-used-table-title"/);
  assert.equal((source.match(/aria-labelledby="cookies-used-table-title"/g) ?? []).length, 2);
  assert.match(source, /className=\{styles\.tableSeparator\} aria-hidden="true"/);
});

test("el mensaje de descarga correcta incluye la tilde de éxito", async () => {
  const messages = JSON.parse(await readSource("../src/locales/es/common.json"));

  assert.equal(messages.gastronomia_Descargar_Carta_Ok, "Carta descargada con éxito");
});

test("el error general del blog incluye la tilde de inténtelo", async () => {
  const messages = JSON.parse(await readSource("../src/locales/es/common.json"));

  assert.match(messages.blog_Error, /por favor inténtelo más tarde/);
  assert.doesNotMatch(messages.blog_Error, /intentelo/);
});

test("la finalidad de privacidad puntúa correctamente la razón social", async () => {
  const messages = JSON.parse(await readSource("../src/locales/es/common.json"));

  assert.match(messages.politicaPrivacidad_Finalidad_Texto1, /PACAVA S\.A\., solo como/);
  assert.doesNotMatch(messages.politicaPrivacidad_Finalidad_Texto1, /PACAVA S\.A, sólo/);
});
