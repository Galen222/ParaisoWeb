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

test("los textos españoles del blog conservan sus tildes", async () => {
  const messages = JSON.parse(await readSource("src/locales/es/common.json"));

  assert.match(messages.blog_Details_Error, /artículo/);
  assert.match(messages.blog_Details_Error, /inténtelo/);
  assert.equal(messages.blog_Details_SEO_Titulo_Preview, "El Paraíso Del Jamón - Artículo");
  assert.match(messages.blog_Details_SEO_Contenido_Preview, /artículo completo/);
  assert.equal(messages.sharedLink_cuerpo, "Puede leer el artículo en ");
});

test("el texto español de reservas escribe teléfono correctamente", async () => {
  const messages = JSON.parse(await readSource("src/locales/es/common.json"));

  assert.match(messages.reservas_Texto2, /números de teléfono/);
  assert.doesNotMatch(messages.reservas_Texto2, /\btelefono\b/);
});

test("la clasificación española de cookies no contiene las erratas corregidas", async () => {
  const messages = JSON.parse(await readSource("src/locales/es/common.json"));

  assert.match(messages.politicaCookies_Clasificacion1_Texto2, /cookies sean instaladas/);
  assert.match(messages.politicaCookies_Clasificacion3_Texto_Punto1, /por ejemplo controlar el tráfico/);
  assert.match(messages.politicaCookies_Clasificacion3_Texto_Punto2, /características de carácter general predefinidas/);

  const policyText = [
    messages.politicaCookies_Clasificacion1_Texto2,
    messages.politicaCookies_Clasificacion3_Texto_Punto1,
    messages.politicaCookies_Clasificacion3_Texto_Punto2,
  ].join(" ");
  assert.doesNotMatch(policyText, /\bseas instaladas\b|jemeplo|\btrafico\b|caracteristicas|prefefinidas/);
});
