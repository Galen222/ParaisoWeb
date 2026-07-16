import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("blog omite filas inválidas sin perder las válidas y elimina duplicados", async () => {
  const source = await readFile(new URL("../src/services/blogService.ts", import.meta.url), "utf8");
  assert.match(source, /const validPosts = response\.data\.filter/);
  assert.match(source, /Se omitieron \$\{discardedPosts\} artículos/);
  assert.match(source, /const seenIds = new Set<number>\(\)/);
  assert.match(source, /const seenSlugs = new Set<string>\(\)/);
});

test("charcutería omite filas inválidas sin perder las válidas y elimina duplicados", async () => {
  const source = await readFile(new URL("../src/services/charcuteriaService.ts", import.meta.url), "utf8");
  assert.match(source, /const validProducts = response\.data\.filter/);
  assert.match(source, /Se omitieron \$\{discardedProducts\} productos/);
  assert.match(source, /new Map\(validProducts\.map\(\(product\) => \[product\.id_producto, product\]\)\)/);
});

test("el sitemap tolera entradas parciales y conserva una traducción única por idioma", async () => {
  const source = await readFile(new URL("../src/services/sitemapService.ts", import.meta.url), "utf8");
  assert.match(source, /const validEntries = data\.filter\(isSitemapBlogEntry\)/);
  assert.match(source, /Se omitieron \$\{discardedEntries\} entradas no válidas/);
  assert.match(source, /const key = `\$\{entry\.id_noticia\}:\$\{entry\.idioma\}`/);
  assert.match(source, /entry\.lastmod > current\.lastmod/);
  assert.match(source, /const routeKey = `\$\{entry\.idioma\}:\$\{entry\.slug\}`/);
});
