import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("el blog mantiene un h1 durante la carga inicial", async () => {
  const source = await readSource("src/pages/blog.tsx");

  assert.match(
    source,
    /loadingBlog\s*&&\s*\([\s\S]*?<h1 className="visually-hidden">[\s\S]*?id: "blog_Titulo"[\s\S]*?<Loader className="BD"/,
  );
});

test("charcutería mantiene un h1 durante la carga inicial", async () => {
  const source = await readSource("src/pages/charcuteria.tsx");

  assert.match(
    source,
    /loadingProducts\s*&&\s*\([\s\S]*?<h1 className="visually-hidden">[\s\S]*?id: "charcuteria_Titulo"[\s\S]*?<Loader className="BD"/,
  );
});

test("los estados de error no referencian una clase CSS inexistente", async () => {
  const sources = await Promise.all([
    readSource("src/pages/blog.tsx"),
    readSource("src/pages/charcuteria.tsx"),
    readSource("src/pages/blog/[slug].tsx"),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /errorStyles\.errorText/);
  }
});

test("los tres puntos visibles del loader reciben su animación", async () => {
  const css = await readSource("src/styles/components/Loader.module.css");

  assert.match(css, /\.loader_element:nth-child\(2\)\s*\{[\s\S]*?animation:/);
  assert.match(css, /\.loader_element:nth-child\(3\)\s*\{[\s\S]*?animation:/);
  assert.match(css, /\.loader_element:nth-child\(4\)\s*\{[\s\S]*?animation:/);
  assert.doesNotMatch(css, /\.loader_element:nth-child\(1\)/);
});

test("la política de privacidad escribe correctamente Política", async () => {
  const messages = JSON.parse(await readSource("src/locales/es/common.json"));

  assert.match(messages.politicaPrivacidad_Actualizacion_Texto, /Política de Privacidad/);
  assert.doesNotMatch(messages.politicaPrivacidad_Actualizacion_Texto, /Politíca/);
});

test("el título español de contacto conserva la tilde", async () => {
  const messages = JSON.parse(await readSource("src/locales/es/common.json"));

  assert.equal(messages.contacto_Titulo, "Póngase en contacto con nosotros");
});

test("los mensajes compartidos conservan la identidad exacta de la marca", async () => {
  const source = await readSource("src/components/ShareLink.tsx");

  assert.match(source, /const fullTitle = `El Paraíso Del Jamón - \$\{title\}`;/);
  assert.doesNotMatch(source, /El Paraíso del Jamón/);
});
