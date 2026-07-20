import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { resolveBackendPython } from "../scripts/run-backend-tests.mjs";

test("las pruebas backend usan primero el Python del entorno virtual del proyecto", () => {
  const rootDirectory = path.resolve("/project");
  const windowsPython = path.join(rootDirectory, "backend", ".venv", "Scripts", "python.exe");
  const unixPython = path.join(rootDirectory, "backend", ".venv", "bin", "python");

  assert.equal(
    resolveBackendPython({
      rootDirectory,
      environment: {},
      fileExists: (candidate) => candidate === windowsPython,
    }),
    windowsPython,
  );

  assert.equal(
    resolveBackendPython({
      rootDirectory,
      environment: {},
      fileExists: (candidate) => candidate === unixPython,
    }),
    unixPython,
  );
});

test("un intérprete configurado explícitamente tiene prioridad sobre el entorno virtual", () => {
  assert.equal(
    resolveBackendPython({
      rootDirectory: path.resolve("/project"),
      environment: { PARAISOWEB_PYTHON: " C:\\Python314\\python.exe " },
      fileExists: () => true,
    }),
    "C:\\Python314\\python.exe",
  );
});

test("npm run test delega el backend al lanzador que selecciona el entorno correcto", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(packageJson.scripts["test:backend"], "node scripts/run-backend-tests.mjs");
});
