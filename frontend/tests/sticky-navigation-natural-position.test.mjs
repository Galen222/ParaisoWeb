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

test("la posición natural se mide mientras la barra está estática y después se restaura", async () => {
  const { measureStaticDocumentTop } = await loadTypeScriptModule(
    "../src/utils/elementPosition.ts"
  );
  const measuredPositions = [];
  const element = {
    style: { position: "fixed" },
    getBoundingClientRect() {
      measuredPositions.push(this.style.position);
      return { top: 140 };
    },
  };

  const documentTop = measureStaticDocumentTop(element, 360);

  assert.equal(documentTop, 500);
  assert.deepEqual(measuredPositions, ["static"]);
  assert.equal(element.style.position, "fixed");
});

test("la posición inline se restaura aunque falle la medición", async () => {
  const { measureStaticDocumentTop } = await loadTypeScriptModule(
    "../src/utils/elementPosition.ts"
  );
  const element = {
    style: { position: "absolute" },
    getBoundingClientRect() {
      throw new Error("medición no disponible");
    },
  };

  assert.throws(() => measureStaticDocumentTop(element, 0), /medición no disponible/);
  assert.equal(element.style.position, "absolute");
});

test("el hook sticky utiliza la medición de posición natural", async () => {
  const stickyHook = await readFile(
    new URL("../src/hooks/useStickyNav.ts", import.meta.url),
    "utf8"
  );

  assert.match(stickyHook, /measureStaticDocumentTop\(navbar, window\.scrollY\)/);
  assert.doesNotMatch(stickyHook, /restoreNavbarPosition\(\)[\s\S]*?getBoundingClientRect\(\)/);
});
