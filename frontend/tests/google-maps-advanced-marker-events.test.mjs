import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("el marcador avanzado usa gmp-click y retira su listener DOM", async () => {
  const source = await readSource("../src/components/Map.tsx");

  assert.match(source, /gmpClickable:\s*true/);
  assert.match(source, /marker\.addEventListener\("gmp-click",\s*handleMarkerClick\)/);
  assert.match(source, /marker\.removeEventListener\("gmp-click",\s*handleMarkerClick\)/);
  assert.doesNotMatch(source, /marker\.addListener\("click"/);
});
