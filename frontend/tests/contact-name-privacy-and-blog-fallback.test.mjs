import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

const loadTypeScriptModule = async (relativePath) => {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (require, module, exports) { ${outputText}\n })`
  );
  wrapper(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
};

test("el límite del nombre se aplica después de conservar el espacio exterior", async () => {
  const { truncateContactName } = await loadTypeScriptModule(
    "../src/utils/contactFormValidation.ts"
  );

  const leadingSpaces = " ".repeat(120);
  assert.equal(truncateContactName(`${leadingSpaces}Ana`), `${leadingSpaces}Ana`);

  const limitedName = truncateContactName(` ${"𐐀".repeat(101)} `);
  assert.equal(limitedName, ` ${"𐐀".repeat(100)} `);
  assert.equal(Array.from(limitedName.trim()).length, 100);
});

test("el formulario valida el nombre como el backend y usa el logger informativo", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /isValidNameInput\(normalizedValue\.trim\(\)\)/);
  assert.match(
    source,
    /clientLogger\.info\("📤 Enviando formulario:"/
  );
});

test("los slugs compartidos solo se resuelven si identifican la misma noticia", async () => {
  const { selectUniqueBlogFallbackPost } = await loadTypeScriptModule(
    "../src/utils/blogLocaleFallback.ts"
  );

  const spanish = { id_noticia: 7, idioma: "es", slug: "jamon" };
  const germanSameArticle = { id_noticia: 7, idioma: "de", slug: "jamon" };
  const germanDifferentArticle = { id_noticia: 9, idioma: "de", slug: "jamon" };

  assert.equal(selectUniqueBlogFallbackPost([]), null);
  assert.equal(selectUniqueBlogFallbackPost([spanish]), spanish);
  assert.equal(
    selectUniqueBlogFallbackPost([spanish, germanSameArticle]),
    spanish
  );
  assert.equal(
    selectUniqueBlogFallbackPost([spanish, germanDifferentArticle]),
    null
  );
});

test("carga y redirección del blog rechazan fallbacks de slug ambiguos", async () => {
  const [loader, redirect] = await Promise.all([
    readFile(new URL("../src/services/blogLoader.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/utils/redirectByCookieSlug.ts", import.meta.url), "utf8"),
  ]);

  assert.match(loader, /const fallbackPosts: BlogPost\[\] = \[\]/);
  assert.match(loader, /selectUniqueBlogFallbackPost\(fallbackPosts\)/);
  assert.doesNotMatch(loader, /blogDetails = await getBlogPostBySlug[\s\S]*?break;/);

  assert.match(redirect, /const fallbackPosts: BlogPost\[\] = \[\]/);
  assert.match(redirect, /return selectUniqueBlogFallbackPost\(fallbackPosts\)/);
});
