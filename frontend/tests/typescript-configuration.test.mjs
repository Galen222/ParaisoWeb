import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("TypeScript 6 conserva los tipos globales usados por Next y Google Maps", async () => {
  const [packageSource, tsconfigSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../tsconfig.json", import.meta.url), "utf8"),
  ]);

  const packageJson = JSON.parse(packageSource);
  const tsconfig = JSON.parse(tsconfigSource.replace(/^\/\/.*$/gm, ""));

  assert.match(packageJson.devDependencies.typescript, /^\^6\.0\.3$/);
  assert.equal(ts.versionMajorMinor, "6.0");
  assert.deepEqual(tsconfig.compilerOptions.types, ["node", "google.maps"]);
});
