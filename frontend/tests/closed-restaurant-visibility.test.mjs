import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const closedRestaurantPattern = /bravo(?:[-_ ]?murillo)/i;
const runtimeSourceRoot = new URL("../src/", import.meta.url);
const disabledDirectoryNames = new Set(["pages-disabled", "locales-disabled"]);

const collectRuntimeFiles = async (directoryUrl) => {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (disabledDirectoryNames.has(entry.name)) continue;

    const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directoryUrl);
    if (entry.isDirectory()) {
      files.push(...(await collectRuntimeFiles(entryUrl)));
      continue;
    }

    if (/\.(?:ts|tsx|js|jsx|json|css)$/.test(entry.name)) {
      files.push(entryUrl);
    }
  }

  return files;
};

const collectActiveCodeReferences = (source, fileName) => {
  const scriptKind = fileName.endsWith(".tsx")
    ? ts.ScriptKind.TSX
    : fileName.endsWith(".jsx")
      ? ts.ScriptKind.JSX
      : fileName.endsWith(".js")
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const references = [];

  const visit = (node) => {
    if (
      ts.isIdentifier(node) ||
      ts.isStringLiteralLike(node) ||
      ts.isJsxText(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const text = node.getText(sourceFile);
      if (closedRestaurantPattern.test(text)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        references.push(`${fileName}:${line + 1}:${character + 1} ${text}`);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return references;
};

const collectActiveJsonReferences = (value, location = "$") => {
  const references = [];

  if (typeof value === "string") {
    if (closedRestaurantPattern.test(value)) {
      references.push(`${location}=${value}`);
    }
    return references;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      references.push(...collectActiveJsonReferences(entry, `${location}[${index}]`));
    });
    return references;
  }

  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (closedRestaurantPattern.test(key)) {
        references.push(`${location}.${key}`);
      }
      references.push(...collectActiveJsonReferences(entry, `${location}.${key}`));
    }
  }

  return references;
};

test("Bravo Murillo permanece comentado y fuera de la interfaz pública", async () => {
  const [navbar, banners, contacto, reservas, sitemap, map, slides, closedPage] =
    await Promise.all([
      readSource("../src/components/Navbar.tsx"),
      readSource("../src/utils/bannersData.ts"),
      readSource("../src/pages/contacto.tsx"),
      readSource("../src/pages/reservas.tsx"),
      readSource("../src/pages/sitemap.xml.tsx"),
      readSource("../src/components/Map.tsx"),
      readSource("../src/utils/slidesData.ts"),
      readSource("../src/pages-disabled/bravo-murillo.tsx.disabled"),
    ]);

  assert.equal(
    (navbar.match(/Restaurante cerrado: se conserva el enlace comentado/g) ?? []).length,
    2,
  );
  assert.match(banners, /\/\/ Restaurante cerrado: \{ href: "\/bravo-murillo"/);
  assert.match(contacto, /\{\/\* Restaurante cerrado: <Localization localizationName="bravo-murillo" \/> \*\/\}/);
  assert.match(reservas, /\{\/\* Restaurante cerrado: <Localization localizationName="bravo-murillo" \/> \*\/\}/);
  assert.match(sitemap, /\/\/ Restaurante cerrado: "\/bravo-murillo"/);
  assert.match(map, /\/\* Restaurante cerrado: se conserva su configuración/);
  assert.match(slides, /\/\* Restaurante cerrado: se conserva el carrusel comentado/);

  const nonCommentedLines = closedPage
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("//"));
  assert.deepEqual(nonCommentedLines, []);
  assert.match(closedPage, /BravoMurilloPage/);
  assert.match(closedPage, /LocalBusinessJsonLd|Localization|Carousel|Transport|Map/);
});

test("ningún archivo activo puede publicar o ejecutar referencias a Bravo Murillo", async () => {
  const files = await collectRuntimeFiles(runtimeSourceRoot);
  const activeReferences = [];

  for (const fileUrl of files) {
    const source = await readFile(fileUrl, "utf8");
    const fileName = path.relative(
      fileURLToPath(runtimeSourceRoot),
      fileURLToPath(fileUrl),
    );

    if (fileName.endsWith(".json")) {
      const data = JSON.parse(source);
      activeReferences.push(
        ...collectActiveJsonReferences(data).map(
          (reference) => `${fileName}:${reference}`,
        ),
      );
    } else if (fileName.endsWith(".css")) {
      const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
      if (closedRestaurantPattern.test(withoutComments)) {
        activeReferences.push(`${fileName}:referencia CSS activa`);
      }
    } else {
      activeReferences.push(...collectActiveCodeReferences(source, fileName));
    }
  }

  assert.deepEqual(activeReferences, []);
});

test("las traducciones retiradas se conservan completamente comentadas", async () => {
  for (const locale of ["es", "en", "de", "fr"]) {
    const activeMessages = JSON.parse(
      await readSource(`../src/locales/${locale}/common.json`),
    );
    const disabledMessages = await readSource(
      `../src/locales-disabled/${locale}/bravo-murillo.common.jsonc.disabled`,
    );

    assert.equal(
      Object.keys(activeMessages).some((key) => closedRestaurantPattern.test(key)),
      false,
    );
    assert.equal(
      Object.values(activeMessages).some(
        (value) => typeof value === "string" && closedRestaurantPattern.test(value),
      ),
      false,
    );

    const nonCommentedLines = disabledMessages
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("//"));
    assert.deepEqual(nonCommentedLines, []);
    assert.match(disabledMessages, /bravo-murillo_Carousel_Alt10/);
    assert.match(disabledMessages, /contacto_Informacion_bravo-murillo_Direccion_Calle/);
  }
});
