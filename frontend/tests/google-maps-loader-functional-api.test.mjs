import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("Google Maps permite actualizaciones compatibles de js-api-loader 2 y usa su API funcional", async () => {
  const [packageJsonSource, packageLockSource, loaderSource] = await Promise.all([
    readSource("../package.json"),
    readSource("../package-lock.json"),
    readSource("../src/utils/GoogleMapsLoader.ts"),
  ]);
  const packageJson = JSON.parse(packageJsonSource);
  const packageLock = JSON.parse(packageLockSource);
  const declaredRange = packageJson.dependencies["@googlemaps/js-api-loader"];
  const installedVersion = packageLock.packages["node_modules/@googlemaps/js-api-loader"].version;
  const [major, minor, patchVersion] = installedVersion.split(".").map(Number);

  assert.match(declaredRange, /^\^2\./);
  assert.equal(packageLock.packages[""].dependencies["@googlemaps/js-api-loader"], declaredRange);
  assert.equal(major, 2);
  assert.ok(minor > 1 || (minor === 1 && patchVersion >= 1));
  assert.match(
    loaderSource,
    /import\s*\{[\s\S]*?importLibrary,[\s\S]*?setOptions,[\s\S]*?\}\s*from "@googlemaps\/js-api-loader"/,
  );
  assert.doesNotMatch(loaderSource, /new Loader\(/);
  assert.match(loaderSource, /setOptions\(\{[\s\S]*?key: apiKey,[\s\S]*?v: "weekly",[\s\S]*?language/);
});

test("el cargador conserva la primera configuración y los tres reintentos de la versión anterior", async () => {
  const source = (await readSource("../src/utils/GoogleMapsLoader.ts"))
    .replace(
      /import\s*\{[\s\S]*?\}\s*from "@googlemaps\/js-api-loader";/,
      `const { setOptions, importLibrary } = globalThis.__googleMapsLoaderTest;`,
    )
    .replace(
      "setTimeout(resolve, milliseconds);",
      "globalThis.__googleMapsLoaderTest.wait(milliseconds, resolve);",
    );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (module, exports) { ${outputText}\n })`,
  );

  const configurations = [];
  const attempts = new Map();
  const retryDelays = [];
  const previousTestApi = globalThis.__googleMapsLoaderTest;
  globalThis.__googleMapsLoaderTest = {
    setOptions(options) {
      configurations.push(options);
    },
    wait(milliseconds, resolve) {
      retryDelays.push(milliseconds);
      resolve();
    },
    async importLibrary(libraryName) {
      const attempt = (attempts.get(libraryName) ?? 0) + 1;
      attempts.set(libraryName, attempt);
      if (libraryName === "maps" && attempt <= 3) {
        throw new Error("fallo transitorio");
      }
      return { libraryName };
    },
  };

  try {
    wrapper(loadedModule, loadedModule.exports);
    const firstLoader = loadedModule.exports.getGoogleMapsLoader("clave-inicial", "es");
    const secondLoader = loadedModule.exports.getGoogleMapsLoader("otra-clave", "fr");

    assert.equal(firstLoader, secondLoader);
    assert.deepEqual(configurations, [
      { key: "clave-inicial", v: "weekly", language: "es" },
    ]);
    assert.deepEqual(await firstLoader.importLibrary("maps"), {
      libraryName: "maps",
    });
    assert.equal(attempts.get("maps"), 4);
    assert.deepEqual(retryDelays, [1_000, 2_000, 4_000]);
    assert.deepEqual(await firstLoader.importLibrary("marker"), {
      libraryName: "marker",
    });
    assert.equal(attempts.get("marker"), 1);
  } finally {
    if (previousTestApi === undefined) delete globalThis.__googleMapsLoaderTest;
    else globalThis.__googleMapsLoaderTest = previousTestApi;
  }
});

test("js-api-loader copia el nonce CSP y usa la primera clave e idioma", () => {
  const frontendRoot = fileURLToPath(new URL("..", import.meta.url));
  const script = String.raw`
    const scripts = [];
    const documentMock = {
      querySelector(selector) {
        if (selector === "script[nonce]") return { nonce: "nonce-de-prueba" };
        return null;
      },
      createElement() {
        return { src: "", nonce: "", onerror: null };
      },
      head: {
        append(scriptElement) {
          scripts.push(scriptElement);
        },
      },
    };
    const windowMock = {};
    globalThis.document = documentMock;
    globalThis.window = windowMock;

    const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
    setOptions({ key: "clave-de-prueba", v: "weekly", language: "es" });
    globalThis.google = windowMock.google;
    const loading = importLibrary("maps");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const bootstrapResolve = windowMock.google.maps.__ib__;
    windowMock.google.maps.importLibrary = async (libraryName) => ({ libraryName });
    bootstrapResolve();
    await loading;

    console.log(JSON.stringify({ nonce: scripts[0].nonce, src: scripts[0].src }));
  `;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: frontendRoot,
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout.trim());
  const scriptUrl = new URL(output.src);

  assert.equal(output.nonce, "nonce-de-prueba");
  assert.equal(scriptUrl.origin, "https://maps.googleapis.com");
  assert.equal(scriptUrl.searchParams.get("key"), "clave-de-prueba");
  assert.equal(scriptUrl.searchParams.get("v"), "weekly");
  assert.equal(scriptUrl.searchParams.get("language"), "es");
  assert.equal(scriptUrl.searchParams.get("libraries"), "maps");
});
