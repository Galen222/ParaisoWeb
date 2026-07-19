import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("los banners promocionales no alteran la jerarquía de encabezados", async () => {
  const [banner, css] = await Promise.all([
    readSource("../src/components/Banner.tsx"),
    readSource("../src/styles/components/Banner.module.css"),
  ]);

  assert.match(banner, /<p className=\{styles\.text\}>\{content\.text\}<\/p>/);
  assert.match(banner, /<p className=\{styles\.highlightText\}>\{content\.highlightText\}<\/p>/);
  assert.doesNotMatch(banner, /<h[1-6][^>]*className=\{styles\.(?:text|highlightText)\}/);
  assert.match(css, /\.text,\s*\.highlightText\s*\{\s*margin: 0;/);
});

test("el aviso legal no repite su título principal como subtítulo", async () => {
  const source = await readSource("../src/pages/aviso-legal.tsx");

  assert.match(source, /<h1 className="text-center">\{intl\.formatMessage\(\{ id: "avisoLegal_Principal_Titulo" \}\)\}<\/h1>/);
  assert.doesNotMatch(source, /<h3[^>]*>\{intl\.formatMessage\(\{ id: "avisoLegal_Principal_Titulo" \}\)\}<\/h3>/);
});

test("la política de privacidad no repite su título principal como subtítulo", async () => {
  const source = await readSource("../src/pages/politica-privacidad.tsx");

  assert.match(source, /<h1 className="text-center">\{intl\.formatMessage\(\{ id: "politicaPrivacidad_Principal_Titulo" \}\)\}<\/h1>/);
  assert.doesNotMatch(source, /<h3[^>]*>\{intl\.formatMessage\(\{ id: "politicaPrivacidad_Principal_Titulo" \}\)\}<\/h3>/);
});

test("la navegación principal identifica la página actual en móvil y escritorio", async () => {
  const source = await readSource("../src/components/Navbar.tsx");

  assert.match(source, /const getCurrentPageAria = \(href: string\): "page" \| undefined =>/);
  assert.match(source, /router\.pathname === href \|\|[\s\S]*?href === "\/blog" && router\.pathname\.startsWith\("\/blog\/"\)/);
  assert.equal((source.match(/aria-current=\{getCurrentPageAria\("\/contacto"\)\}/g) ?? []).length, 2);
  assert.equal((source.match(/aria-current=\{getCurrentPageAria\("\/san-bernardo"\)\}/g) ?? []).length, 2);
});

test("el pie identifica la página legal actual", async () => {
  const source = await readSource("../src/components/Footer.tsx");

  assert.match(source, /aria-current=\{getCurrentPageAria\("\/aviso-legal"\)\}/);
  assert.match(source, /aria-current=\{getCurrentPageAria\("\/politica-privacidad"\)\}/);
  assert.match(source, /aria-current=\{getCurrentPageAria\("\/politica-cookies"\)\}/);
});

test("el nombre rechazado informa del error y bloquea el envío", async () => {
  const source = await readSource("../src/components/Form.tsx");

  assert.match(source, /const \[hasInvalidNameInput, setHasInvalidNameInput\] = useState\(false\)/);
  assert.match(source, /setFormData\(\(current\) => \(\{ \.\.\.current, \[name\]: normalizedValue \}\)\)/);
  assert.match(source, /setHasInvalidNameInput\(!isValidNameInput\(normalizedValue\.trim\(\)\)\)/);
  assert.match(source, /aria-invalid=\{hasNameValidationError\}/);
  assert.match(source, /id="nameValidationError" className=\{styles\.validationError\}[\s\S]*?contacto_NombreInvalido/);
  assert.match(source, /!hasNameValidationError &&[\s\S]*?isContactFormComplete/);
});

test("los controles no admitidos del mensaje se anuncian y bloquean el envío", async () => {
  const [source, es, en, de, fr] = await Promise.all([
    readSource("../src/components/Form.tsx"),
    readSource("../src/locales/es/common.json"),
    readSource("../src/locales/en/common.json"),
    readSource("../src/locales/de/common.json"),
    readSource("../src/locales/fr/common.json"),
  ]);

  assert.match(source, /setFormData\(\(current\) => \(\{ \.\.\.current, \[name\]: limitedValue \}\)\)/);
  assert.match(source, /setHasInvalidMessageInput\(containsUnsupportedContactMessageControl\(limitedValue\)\)/);
  assert.match(source, /aria-invalid=\{hasInvalidMessageInput\}/);
  assert.match(source, /id="messageValidationError" className=\{styles\.validationError\}[\s\S]*?contacto_MensajeCaracteresInvalidos/);
  assert.match(source, /!hasInvalidMessageInput &&[\s\S]*?isContactFormComplete/);

  for (const localeSource of [es, en, de, fr]) {
    const messages = JSON.parse(localeSource);
    assert.equal(typeof messages.contacto_NombreInvalido, "string");
    assert.equal(typeof messages.contacto_MensajeCaracteresInvalidos, "string");
  }
});
