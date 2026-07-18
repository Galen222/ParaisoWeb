import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("las notificaciones ocupan el ancho personalizado del contenedor tras actualizar React-Toastify", async () => {
  const source = await readSource("../src/styles/toastify.css");

  assert.match(source, /\.Toastify__toast-container\s*\{[\s\S]*?width:\s*420px;/);
  assert.match(source, /\.Toastify__toast\s*\{[\s\S]*?width:\s*100%;/);
});
