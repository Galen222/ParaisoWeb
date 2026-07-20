import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

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

test("Next valida la configuración crítica antes de crear el build", async () => {
  const [nextConfig, validation] = await Promise.all([
    readSource("../next.config.ts"),
    readSource("../src/config/environmentValidation.ts"),
  ]);

  assert.match(nextConfig, /validateFrontendBuildEnvironment\(process\.env\)/);
  assert.ok(
    nextConfig.indexOf("validateFrontendBuildEnvironment(process.env)") <
      nextConfig.indexOf("const nextConfig")
  );

  for (const variableName of [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_API_BLOG_URL",
    "NEXT_PUBLIC_API_CHARCUTERIA_URL",
    "NEXT_PUBLIC_API_CONTACTO_URL",
    "SITEMAP_API_URL",
    "NEXT_PUBLIC_COOKIE_DELETION_DOMAINS",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID",
  ]) {
    assert.match(validation, new RegExp(variableName));
  }

  assert.match(validation, /requireLoopbackSitemapApiUrl/);
  assert.match(validation, /parseCookieDeletionDomains/);
  assert.match(validation, /\^\[A-Za-z0-9_-\]\+\$/);
});

test("Analytics vacío se permite pero un ejemplo o identificador mal formado bloquean el build", async () => {
  const [{ validateGoogleAnalyticsIdConfiguration }, envExample] = await Promise.all([
    loadTypeScriptModule("../src/utils/googleAnalyticsId.ts"),
    readSource("../.env.example"),
  ]);

  assert.equal(validateGoogleAnalyticsIdConfiguration(undefined), null);
  assert.equal(validateGoogleAnalyticsIdConfiguration("   "), null);
  assert.equal(validateGoogleAnalyticsIdConfiguration("g-ab12cd34"), "G-AB12CD34");
  assert.throws(() => validateGoogleAnalyticsIdConfiguration("G-XXXXXXXXXX"));
  assert.throws(() => validateGoogleAnalyticsIdConfiguration("UA-123456-1"));
  assert.match(envExample, /^NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$/m);
});

test("la revocación captura una configuración inesperada después de desactivar Analytics", async () => {
  const cookieUtils = await readSource("../src/utils/cookieUtils.ts");
  const revokeFunction = cookieUtils.slice(
    cookieUtils.indexOf("export const revokeCookieCategories"),
    cookieUtils.indexOf("const notifyCookieConsentChanged")
  );

  assert.match(revokeFunction, /if \(googleAnalytics\) \{[\s\S]*?void disableGA\(\);[\s\S]*?try \{/);
  assert.match(revokeFunction, /catch \(error: unknown\)/);
  assert.match(revokeFunction, /clientLogger\.error/);
  assert.match(revokeFunction, /return false/);
});


test("Analytics desactivado por configuración no genera un falso error operativo", async () => {
  const gaUtils = await readSource("../src/utils/gaUtils.ts");
  const disabledBranch = gaUtils.slice(
    gaUtils.indexOf("if (!analyticsId)"),
    gaUtils.indexOf("try {", gaUtils.indexOf("if (!analyticsId)")),
  );

  assert.match(disabledBranch, /clientLogger\.debug/);
  assert.doesNotMatch(disabledBranch, /clientLogger\.error/);
});
