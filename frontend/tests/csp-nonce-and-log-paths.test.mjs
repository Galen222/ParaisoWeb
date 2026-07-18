import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("la CSP genera un nonce por petición y no permite scripts inline sin nonce", async () => {
  const proxySource = await readSource("../src/proxy.ts");

  assert.match(proxySource, /crypto\.randomUUID\(\)/);
  assert.match(proxySource, /script-src 'self' 'nonce-\$\{nonce\}' 'strict-dynamic'/);
  assert.doesNotMatch(proxySource, /script-src[^;]*'unsafe-inline'/);
  assert.match(proxySource, /requestHeaders\.set\("x-nonce", nonce\)/);
  assert.match(proxySource, /response\.headers\.set\("Content-Security-Policy"/);
  assert.match(proxySource, /source: "\/"/);
});

test("Next, Google Maps, Analytics y JSON-LD reutilizan el nonce", async () => {
  const [documentSource, appSource, mapsSource, analyticsSource, jsonLdSource] =
    await Promise.all([
      readSource("../src/pages/_document.tsx"),
      readSource("../src/pages/_app.tsx"),
      readSource("../src/utils/GoogleMapsLoader.ts"),
      readSource("../src/utils/gaUtils.ts"),
      readSource("../src/components/JsonLd.tsx"),
    ]);

  assert.match(documentSource, /<Head nonce=\{this\.props\.nonce\}>/);
  assert.match(documentSource, /<NextScript nonce=\{this\.props\.nonce\} \/>/);
  assert.match(documentSource, /<style nonce=\{this\.props\.nonce\}>/);
  assert.match(appSource, /NextApp\.getInitialProps/);
  assert.match(appSource, /<CspNonceProvider nonce=\{props\.pageProps\.nonce\}>/);
  assert.match(mapsSource, /setOptions\(\{[\s\S]*?key: apiKey[\s\S]*?language/);
  assert.match(analyticsSource, /ReactGA\.initialize\(analyticsId, \{ nonce: getDocumentCspNonce\(\) \}\)/);
  assert.match(jsonLdSource, /nonce=\{nonce\}/);
});

test("los logs de producción se configuran fuera del document root", async () => {
  const [frontendLogger, frontendEnv, backendEnv] = await Promise.all([
    readSource("../src/server/frontendLogger.ts"),
    readSource("../.env.example"),
    readSource("../../backend/.env.example"),
  ]);

  assert.match(frontendLogger, /process\.env\.FRONTEND_LOG_DIR/);
  assert.match(frontendLogger, /process\.cwd\(\), "\.\.", "logs"/);
  assert.match(
    frontendEnv,
    /FRONTEND_LOG_DIR=\/var\/www\/vhosts\/paraisodeljamon\.com\/logs/
  );
  assert.match(
    backendEnv,
    /BACKEND_LOG_DIR=\/var\/www\/vhosts\/paraisodeljamon\.com\/logs/
  );
});
