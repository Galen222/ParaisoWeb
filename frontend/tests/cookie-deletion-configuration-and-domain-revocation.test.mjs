import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const loadTypeScriptModule = async (relativePath) => {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourceUrl.pathname,
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
};

test("los dominios de borrado se leen de entorno, se validan y normalizan sin duplicados", async () => {
  const { parseCookieDeletionDomains } = await loadTypeScriptModule(
    "../src/utils/cookieDeletionConfig.ts"
  );

  assert.deepEqual(
    parseCookieDeletionDomains(
      " galenn.asuscomm.com, .galenn.asuscomm.com,paraisodeljamon.com,galenn.asuscomm.com "
    ),
    ["galenn.asuscomm.com", "paraisodeljamon.com"]
  );
  assert.throws(() => parseCookieDeletionDomains(undefined));
  assert.throws(() => parseCookieDeletionDomains("https://paraisodeljamon.com"));
  assert.throws(() => parseCookieDeletionDomains("paraisodeljamon.com/path"));
  assert.throws(() => parseCookieDeletionDomains("paraisodeljamon.com,"));
});

test("la configuración incluye los dominios exactos de desarrollo y producción", async () => {
  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");

  assert.match(
    envExample,
    /NEXT_PUBLIC_COOKIE_DELETION_DOMAINS=galenn\.asuscomm\.com,paraisodeljamon\.com/
  );
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_COOKIES_TO_DELETE/);
});

test("el botón borra todas las cookies visibles en cada dominio configurado", async () => {
  const cookieUtils = await readFile(
    new URL("../src/utils/cookieUtils.ts", import.meta.url),
    "utf8"
  );
  const deleteFunction = cookieUtils.slice(cookieUtils.indexOf("export const deleteCookies"));

  assert.match(deleteFunction, /getVisibleCookieNames\(\)\.forEach\(expireCookieAcrossConfiguredDomains\)/);
  assert.match(deleteFunction, /expireCookieAcrossConfiguredDomains\(COOKIE_CONSENT_NAME\)/);
  assert.match(deleteFunction, /deletionSucceeded = getVisibleCookieNames\(\)\.length === 0/);
  assert.doesNotMatch(deleteFunction, /matchesCookieDeletionPattern|COOKIES_TO_DELETE/);
});

test("revocar Analytics desactiva el seguimiento antes de borrar sus cookies en los dominios de entorno", async () => {
  const cookieUtils = await readFile(
    new URL("../src/utils/cookieUtils.ts", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(cookieUtils, /GOOGLE_ANALYTICS_COOKIE_DOMAINS/);
  assert.match(cookieUtils, /getConfiguredCookieDeletionDomains\(\)\.forEach/);
  assert.match(
    cookieUtils,
    /if \(googleAnalytics\) \{[\s\S]*?void disableGA\(\);[\s\S]*?\.forEach\(expireCookieAcrossConfiguredDomains\);/
  );
});
