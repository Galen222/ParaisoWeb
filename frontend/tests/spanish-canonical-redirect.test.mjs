import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { buildSpanishCanonicalRedirect } = require("../server.cjs");

test("solo el prefijo español explícito redirige a la ruta sin locale", () => {
  assert.equal(buildSpanishCanonicalRedirect("/es"), "/");
  assert.equal(buildSpanishCanonicalRedirect("/es/"), "/");
  assert.equal(buildSpanishCanonicalRedirect("/es/blog"), "/blog");
  assert.equal(buildSpanishCanonicalRedirect("/es/blog?pagina=2"), "/blog?pagina=2");
});

test("las rutas canónicas nunca se redirigen a sí mismas", () => {
  assert.equal(buildSpanishCanonicalRedirect("/"), null);
  assert.equal(buildSpanishCanonicalRedirect("/blog"), null);
  assert.equal(buildSpanishCanonicalRedirect("/en/blog"), null);
  assert.equal(buildSpanishCanonicalRedirect("/de/blog"), null);
  assert.equal(buildSpanishCanonicalRedirect("/fr/blog"), null);
  assert.equal(buildSpanishCanonicalRedirect("/espanol"), null);
});

test("la redirección no puede convertirse en una URL externa", () => {
  assert.equal(buildSpanishCanonicalRedirect("/es//example.com/ruta"), "/example.com/ruta");
});

test("producción arranca mediante el servidor que inspecciona la URL original", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(packageJson.scripts.start, "node server.cjs");
});

test("PM2 arranca mediante el mismo servidor personalizado que npm start", () => {
  const ecosystem = require("../ecosystem.config.js");
  const [application] = ecosystem.apps;

  assert.equal(application.script, "server.cjs");
  assert.equal(application.args, undefined);
});
