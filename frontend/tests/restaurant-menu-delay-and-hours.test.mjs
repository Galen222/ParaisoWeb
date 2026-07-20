import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el menú de restaurantes concede tiempo para alcanzar el desplegable", async () => {
  const source = await readSource("../src/components/Navbar.tsx");

  assert.match(source, /const RESTAURANTS_MENU_CLOSE_DELAY_MS = 300;/);
  assert.match(
    source,
    /scheduleRestaurantsMenuClose[\s\S]*?setTimeout\([\s\S]*?closeRestaurantsMenu\(\)[\s\S]*?RESTAURANTS_MENU_CLOSE_DELAY_MS/,
  );
  assert.match(source, /onMouseEnter=\{handleRestaurantsMouseEnter\}/);
  assert.match(source, /onFocus=\{cancelScheduledRestaurantsClose\}/);
  assert.match(
    source,
    /handleRestaurantsMouseLeave[\s\S]*?contains\(document\.activeElement\)[\s\S]*?scheduleRestaurantsMenuClose\(\)/,
  );
  assert.match(
    source,
    /handleRestaurantsMouseEnter[\s\S]*?cancelScheduledRestaurantsClose\(\)[\s\S]*?openRestaurantsMenu\(\)/,
  );
});

test("el banner francés de charcuteros usa una frase breve", async () => {
  const messages = JSON.parse(
    await readSource("../src/locales/fr/common.json"),
  );

  assert.equal(messages.banner_EmpleoTemp_Texto1, "Recherche de");
  assert.equal(messages.banner_EmpleoTemp_Texto2, "charcutiers");
});

test("Reina Victoria informa del cierre del sábado en los cuatro idiomas", async () => {
  const expectedHours = {
    es: "Domingo y de lunes a viernes de 07:00 - 02:00. Sábado cerrado.",
    en: "Sunday and Monday to Friday from 7:00 to 02:00. Closed on Saturdays.",
    fr: "Le dimanche et du lundi au vendredi de 7 h à 2 h. Fermé le samedi.",
    de: "Sonntag und Montag bis Freitag von 7:00 bis 02:00. Samstags geschlossen.",
  };

  for (const [locale, expected] of Object.entries(expectedHours)) {
    const messages = JSON.parse(
      await readSource(`../src/locales/${locale}/common.json`),
    );
    assert.equal(
      messages["contacto_Informacion_reina-victoria_Horario_Numero"],
      expected,
    );
  }

  const page = await readSource("../src/pages/reina-victoria.tsx");
  const openingHours = page.match(/openingHours=\{\[[\s\S]*?\]\}/)?.[0] ?? "";

  assert.match(openingHours, /"Monday"/);
  assert.match(openingHours, /"Sunday"/);
  assert.doesNotMatch(openingHours, /"Saturday"/);
  assert.match(openingHours, /closes: "02:00"/);
});
