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

test("los artículos válidos publican canonical y conservan Open Graph global", async () => {
  const source = await readFile(
    new URL("../src/pages/blog/[slug].tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /const baseSeoConfig = getSEOConfig\(currentLocale, currentMessages\)/);
  assert.match(source, /canonical=\{error \? undefined : currentUrl\}/);
  assert.match(source, /openGraph=\{\{[\s\S]*?\.\.\.baseSeoConfig\.openGraph/);
});

test("la personalización de cookies mueve el foco al primer interruptor", async () => {
  const source = await readFile(
    new URL("../src/components/Cookie.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /const firstCustomizationInputRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(source, /if \(isCustomizing\) \{[\s\S]*?firstCustomizationInputRef\.current\?\.focus/);
  assert.match(source, /ref=\{firstCustomizationInputRef\}[\s\S]*?id="cookiePersonalization"/);
});

test("los mensajes permiten emojis compuestos pero rechazan controles peligrosos", async () => {
  const { containsUnsupportedContactMessageControl } = await loadTypeScriptModule(
    "../src/utils/contactMessage.ts"
  );

  assert.equal(containsUnsupportedContactMessageControl("Familia 👨‍👩‍👧"), false);
  assert.equal(containsUnsupportedContactMessageControl("می‌خواهم"), false);
  assert.equal(containsUnsupportedContactMessageControl("línea 1\nlínea 2"), false);
  assert.equal(containsUnsupportedContactMessageControl("texto\u0000oculto"), true);
  assert.equal(containsUnsupportedContactMessageControl("texto\u202eoculto"), true);
});
