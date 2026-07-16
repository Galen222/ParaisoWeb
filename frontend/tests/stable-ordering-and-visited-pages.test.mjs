import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("el sitemap ordena las entradas tras eliminar duplicados", async () => {
  const source = await readFile(
    new URL("../src/services/sitemapService.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /Array\.from\(uniqueRoutes\.values\(\)\)\.sort/);
  assert.match(source, /left\.id_noticia - right\.id_noticia/);
  assert.match(source, /left\.idioma\.localeCompare\(right\.idioma\)/);
});

test("el seguimiento no vacía la cookie ante nombres de página excesivos", async () => {
  const source = await readFile(
    new URL("../src/hooks/useVisitedPageTracking.ts", import.meta.url),
    "utf8"
  );

  assert.match(source, /MAX_VISITED_PAGE_LENGTH = 200/);
  assert.match(source, /normalizedCurrentPage\.length > MAX_VISITED_PAGE_LENGTH/);
  assert.match(source, /page\.length > 0 && page\.length <= MAX_VISITED_PAGE_LENGTH/);
});
