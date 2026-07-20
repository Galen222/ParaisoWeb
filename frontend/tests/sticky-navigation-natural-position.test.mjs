import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("el umbral sticky se mide después de restaurar la posición normal del menú", async () => {
  const stickyHook = await readFile(
    new URL("../src/hooks/useStickyNav.ts", import.meta.url),
    "utf8"
  );

  assert.match(
    stickyHook,
    /navbarRef\.current\.style\.position = "static";[\s\S]*?requestAnimationFrame\(\(\) => \{[\s\S]*?restoreNavbarPosition\(\);[\s\S]*?getBoundingClientRect\(\)/
  );
  assert.doesNotMatch(stickyHook, /measureStaticDocumentTop/);
});

test("la posición inline temporal se restaura al cancelar o desmontar el hook", async () => {
  const stickyHook = await readFile(
    new URL("../src/hooks/useStickyNav.ts", import.meta.url),
    "utf8"
  );

  assert.match(stickyHook, /cancelAnimationFrame\(animationFrameId\);\s*restoreNavbarPosition\(\);/);
  assert.match(
    stickyHook,
    /return \(\) => \{[\s\S]*?cancelAnimationFrame\(animationFrameId\);[\s\S]*?restoreNavbarPosition\(\);/
  );
});
