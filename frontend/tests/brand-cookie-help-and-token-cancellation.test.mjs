import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const locales = ["es", "en", "de", "fr"];

test("la identidad de marca conserva El en SEO y datos estructurados", async () => {
  for (const locale of locales) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    assert.equal(messages.seo_titulo, "El Paraíso Del Jamón");
    for (const [key, value] of Object.entries(messages)) {
      if (key.includes("SEO_Titulo")) {
        assert.doesNotMatch(value, /^Paraíso Del Jamón -/);
      }
    }
  }

  const [home, article, app, navbar, emailTemplate] = await Promise.all([
    readFile(new URL("../src/pages/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/blog/[slug].tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/pages/_app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../backend/core/email_templates.py", import.meta.url), "utf8"),
  ]);
  assert.match(home, /name="El Paraíso Del Jamón"/);
  assert.match(article, /`El Paraíso Del Jamón - \$\{buildSeoPreview/);
  assert.match(app, /<title>El Paraíso Del Jamón<\/title>/);
  assert.match(navbar, /logoAlt: "Logo El Paraíso Del Jamón"/);
  assert.match(emailTemplate, /sitio web El Paraíso Del Jamón\./);
});

test("la ayuda para desactivar cookies usa documentación oficial HTTPS vigente", async () => {
  const expectedHosts = {
    politicaCookies_Desactivacion_Texto3_Punto1_Enlace: "support.microsoft.com",
    politicaCookies_Desactivacion_Texto3_Punto2_Enlace: "support.mozilla.org",
    politicaCookies_Desactivacion_Texto3_Punto5_Enlace: "help.opera.com",
  };

  for (const locale of locales) {
    const messages = JSON.parse(
      await readFile(new URL(`../src/locales/${locale}/common.json`, import.meta.url), "utf8")
    );
    for (const [key, expectedHost] of Object.entries(expectedHosts)) {
      const url = new URL(messages[key]);
      assert.equal(url.protocol, "https:");
      assert.equal(url.hostname, expectedHost);
      assert.doesNotMatch(url.pathname, /windows-vista|Linux\/10\.60/i);
    }
  }
});

test("una solicitud de token ya cancelada no inicia la petición compartida", async () => {
  const source = await readFile(
    new URL("../src/services/tokenService.ts", import.meta.url),
    "utf8"
  );
  const abortGuard = source.indexOf("if (signal?.aborted)");
  const requestCreation = source.indexOf("if (!pendingTokenRequest)");
  assert.ok(abortGuard >= 0);
  assert.ok(requestCreation > abortGuard);
  assert.match(source, /return Promise\.reject\(createAbortError\(\)\)/);
});
