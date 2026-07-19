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

test("los límites del formulario cuentan caracteres Unicode como el backend", async () => {
  const { truncateContactMessage, truncateContactName } = await loadTypeScriptModule(
    "../src/utils/contactFormValidation.ts"
  );

  const name = "𐐀".repeat(101);
  const message = "😀".repeat(5001);
  const limitedName = truncateContactName(name);
  const limitedMessage = truncateContactMessage(message);

  assert.equal(Array.from(limitedName).length, 100);
  assert.equal(limitedName, "𐐀".repeat(100));
  assert.equal(Array.from(limitedMessage).length, 5000);
  assert.equal(limitedMessage, "😀".repeat(5000));
});

test("el formulario no delega los límites Unicode en maxLength", async () => {
  const source = await readFile(
    new URL("../src/components/Form.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /truncateContactName\(value\.normalize\("NFC"\)\)/);
  assert.match(source, /truncateContactMessage\(value\)/);
  assert.doesNotMatch(source, /maxLength=\{100\}/);
  assert.doesNotMatch(source, /maxLength=\{5000\}/);
});


test("el nombre rechaza controles y separadores invisibles aunque estén en los extremos", async () => {
  const { containsUnsupportedContactNameCharacter } = await loadTypeScriptModule(
    "../src/utils/contactFormValidation.ts"
  );

  for (const value of ["\tAna", "Ana\n", "\u0085Ana", "\u00A0Ana", "\uFEFFAna"]) {
    assert.equal(containsUnsupportedContactNameCharacter(value), true, JSON.stringify(value));
  }

  assert.equal(containsUnsupportedContactNameCharacter("  Ana María  "), false);
});
