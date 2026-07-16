import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("el formulario valida el correo con el mismo recorte exterior que el backend", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /validator\.isEmail\(value\.trim\(\)\)/);
  assert.match(source, /<form[\s\S]*?noValidate/);
  assert.match(source, /setFormData\(\(current\) => \(\{ \.\.\.current, email: value \}\)\)/);
});

test("el footer invalida el año cada medianoche sin romper la hidratación", async () => {
  const source = await readFile(
    new URL("../src/components/Footer.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /const subscribeToCurrentYear = \(onStoreChange/);
  assert.match(source, /now\.getDate\(\) \+ 1/);
  assert.match(source, /onStoreChange\(\)/);
  assert.match(source, /const getServerCurrentYear = \(\): string => ""/);
  assert.match(source, /window\.clearTimeout\(timeoutId\)/);
});

test("blog y charcutería descartan textos vacíos o con controles peligrosos", async () => {
  const [blogService, charcuteriaService] = await Promise.all([
    readFile(new URL("../src/services/blogService.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/services/charcuteriaService.ts", import.meta.url), "utf8"),
  ]);

  assert.match(blogService, /isSafePublicSingleLineText\(post\.titulo\)/);
  assert.match(blogService, /isSafePublicMultilineText\(post\.contenido\)/);
  assert.match(blogService, /isSafePublicSingleLineText\(post\.autor\)/);
  assert.match(charcuteriaService, /isSafePublicSingleLineText\(product\.nombre\)/);
  assert.match(charcuteriaService, /isSafePublicMultilineText\(product\.descripcion\)/);
  assert.match(charcuteriaService, /isSafePublicSingleLineText\(product\.categoria\)/);
});

test("el blog y el sitemap eliminan rutas repetidas por slug", async () => {
  const [blogService, sitemapService] = await Promise.all([
    readFile(new URL("../src/services/blogService.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/services/sitemapService.ts", import.meta.url), "utf8"),
  ]);

  assert.match(blogService, /const seenSlugs = new Set<string>\(\)/);
  assert.match(blogService, /seenSlugs\.has\(normalizedSlug\)/);
  assert.match(blogService, /artículos de blog con identificador o slug duplicado/);
  assert.match(sitemapService, /const routeKey = `\$\{entry\.idioma\}:\$\{entry\.slug\}`/);
  assert.match(sitemapService, /rutas duplicadas del sitemap/);
});
