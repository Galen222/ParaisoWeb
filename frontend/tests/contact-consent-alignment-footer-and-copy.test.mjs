import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("el checkbox de privacidad centra el cuadrado y la marca respecto al texto", async () => {
  const styles = await readSource("../src/styles/components/Form.module.css");

  assert.match(
    styles,
    /\.form \.checkboxControl \{[\s\S]*?width: 22px;[\s\S]*?height: 22px;[\s\S]*?flex: 0 0 22px;/
  );
  assert.match(
    styles,
    /\.form \.checkboxControl \{[\s\S]*?margin-top: 0;[\s\S]*?margin-bottom: 0;[\s\S]*?padding: 0;/
  );
  assert.match(
    styles,
    /\.form \.checkboxControl \{[\s\S]*?display: inline-flex;[\s\S]*?align-items: center;[\s\S]*?align-self: center;[\s\S]*?line-height: 0;/
  );
  assert.match(
    styles,
    /\.checkboxControl svg \{[\s\S]*?display: block;[\s\S]*?width: 16px;[\s\S]*?height: 16px;/
  );
  assert.doesNotMatch(styles, /\.checkText \{[\s\S]*?transform: translateY/);
});

test("el input oculto no hereda el ancho ni el padding de los campos visibles", async () => {
  const styles = await readSource("../src/styles/components/Form.module.css");

  assert.match(
    styles,
    /\.form \.hiddenCheckbox \{[\s\S]*?width: 1px;[\s\S]*?height: 1px;[\s\S]*?padding: 0;[\s\S]*?clip-path: inset\(50%\);/
  );
  assert.doesNotMatch(styles, /\.hiddenCheckbox \{[\s\S]*?width: 0;/);
});

test("solo el cuadrado del consentimiento activa la casilla", async () => {
  const form = await readSource("../src/components/Form.tsx");

  assert.match(
    form,
    /<label className=\{styles\.checkboxControl\} htmlFor="privacyCheck">[\s\S]*?<input[\s\S]*?id="privacyCheck"/
  );
  assert.match(form, /<span className=\{styles\.privacyConsentText\}>[\s\S]*?contacto_PoliticaPrivacidad_1[\s\S]*?<\/span>/);
  assert.match(form, /<Link href="\/politica-privacidad" className=\{styles\.link\}>/);
  assert.doesNotMatch(form, /<label htmlFor="privacyCheck" className=\{styles\.privacyConsent/);
  assert.match(form, /aria-required="true"[\s\S]*?aria-labelledby="privacyCheckText"/);
  assert.doesNotMatch(form, /className=\{styles\.hiddenCheckbox\}\s+required/);
});

test("el footer incluye el año también en el renderizado del servidor", async () => {
  const footer = await readSource("../src/components/Footer.tsx");

  assert.match(footer, /const getCurrentYear = \(\): string => new Date\(\)\.getUTCFullYear\(\)\.toString\(\)/);
  assert.match(footer, /const getServerCurrentYear = getCurrentYear/);
  assert.match(footer, /Date\.UTC\([\s\S]*?now\.getUTCDate\(\) \+ 1/);
});

test("los textos españoles corregidos no conservan espacios ni erratas públicas", async () => {
  const locale = JSON.parse(await readSource("../src/locales/es/common.json"));

  assert.doesNotMatch(locale["san-bernardo_Texto"], /\.\s{2,}Su/);
  assert.match(locale["politicaCookies_Clasificacion1_Texto1_Punto1"], /dominio gestionado/);
  assert.match(locale["politicaCookies_Clasificacion1_Texto1_Punto2"], /dominio que no es gestionado/);
  assert.match(locale["politicaCookies_Aceptacion_Texto1"], /momento en que se accede/);
  assert.doesNotMatch(locale["politicaCookies_Denegacion_Texto"], /sitio web\s+\./);
});
