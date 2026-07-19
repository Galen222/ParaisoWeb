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

test("el adjunto exige correspondencia entre MIME concreto y extensión", async () => {
  const { hasAllowedContactFileMetadata } = await loadTypeScriptModule(
    "../src/utils/contactFileValidation.ts"
  );

  assert.equal(hasAllowedContactFileMetadata("factura.pdf", "application/pdf"), true);
  assert.equal(hasAllowedContactFileMetadata("foto.jpg", "image/jpeg"), true);
  assert.equal(hasAllowedContactFileMetadata("foto.JPEG", "image/jpeg"), true);
  assert.equal(hasAllowedContactFileMetadata("factura.pdf", "image/jpeg"), false);
  assert.equal(hasAllowedContactFileMetadata("foto.jpg", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("factura.pdf", ""), true);
  assert.equal(
    hasAllowedContactFileMetadata("foto.jpg", "application/octet-stream"),
    true
  );
  assert.equal(hasAllowedContactFileMetadata("archivo.png", "image/jpeg"), false);
});

test("el selector exige un nombre real antes de la extensión del adjunto", async () => {
  const { hasAllowedContactFileMetadata } = await loadTypeScriptModule(
    "../src/utils/contactFileValidation.ts"
  );

  assert.equal(hasAllowedContactFileMetadata(".pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("..pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata(".factura.pdf", "application/pdf"), true);
});

test("el formulario usa el contrato de metadatos antes de subir el archivo", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(
    source,
    /import \{ hasAllowedContactFileMetadata \} from "\.\.\/utils\/contactFileValidation"/
  );
  assert.match(
    source,
    /if \(!hasAllowedContactFileMetadata\(file\.name, file\.type\)\)/
  );
  assert.doesNotMatch(source, /hasAllowedExtension \|\| !hasAllowedMimeType/);
});

test("las páginas de error usan un padding CSS válido", async () => {
  const source = await readFile(
    new URL("../src/styles/pages/error.module.css", import.meta.url),
    "utf8"
  );

  assert.match(source, /\.errorContainer\s*\{[\s\S]*?padding:\s*20px;/);
  assert.doesNotMatch(source, /padding:\s*auto;/);
});

test("el selector rechaza nombres de adjunto con rutas o controles invisibles", async () => {
  const { hasAllowedContactFileMetadata } = await loadTypeScriptModule(
    "../src/utils/contactFileValidation.ts"
  );

  assert.equal(hasAllowedContactFileMetadata("factura\u202Efdp.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("factura\uE000.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("factura\u0378.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("factura\uD800.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("carpeta/factura.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("carpeta\\factura.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata(" factura.pdf", "application/pdf"), false);
  assert.equal(hasAllowedContactFileMetadata("factura.pdf", "application/pdf"), true);
});
