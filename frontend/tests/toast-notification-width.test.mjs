import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("las notificaciones usan 450 px aunque React-Toastify inyecte sus estilos", async () => {
  const [styles, app] = await Promise.all([
    readSource("../src/styles/toastify.css"),
    readSource("../src/pages/_app.tsx"),
  ]);

  assert.match(app, /className="appToastContainer"/);
  assert.match(app, /toastClassName="appToast"/);
  assert.match(styles, /\.Toastify__toast-container\.appToastContainer\s*\{/);
  assert.match(styles, /--toastify-container-width:\s*450px;/);
  assert.match(styles, /--toastify-toast-width:\s*450px;/);
  assert.match(styles, /width:\s*450px;/);
  assert.match(styles, /\.Toastify__toast\.appToast\s*\{[\s\S]*?width:\s*100%;/);
});
