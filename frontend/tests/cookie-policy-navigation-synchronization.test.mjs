import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

const extractHandler = (source, handlerName, nextMarker) => {
  const start = source.indexOf(`const ${handlerName} = async () => {`);
  const end = source.indexOf(nextMarker, start);
  assert.ok(start >= 0 && end > start, `No se encontró ${handlerName}`);
  return source.slice(start, end);
};

test("la consulta de políticas bloquea la resincronización antes de iniciar la navegación", async () => {
  const source = await readSource("../src/hooks/useCookieLogic.ts");
  const cookieHandler = extractHandler(
    source,
    "handleCookiesPolicyLinkClick",
    "/**\n   * Maneja el clic en el enlace de la política de privacidad.",
  );
  const privacyHandler = extractHandler(
    source,
    "handlePrivacyPolicyLinkClick",
    "/**\n   * Maneja la aceptación de cookies",
  );

  for (const [handler, route] of [
    [cookieHandler, "/politica-cookies"],
    [privacyHandler, "/politica-privacidad"],
  ]) {
    const guardPosition = handler.indexOf("isReviewingConsentPolicyRef.current = true");
    const navigationPosition = handler.indexOf(`await router.push(\"${route}\")`);
    assert.ok(guardPosition >= 0);
    assert.ok(navigationPosition > guardPosition);
    assert.match(handler, /if \(!navigationCompleted\) \{[\s\S]*isReviewingConsentPolicyRef\.current = false/);
    assert.match(handler, /catch \(error: unknown\) \{[\s\S]*isReviewingConsentPolicyRef\.current = false/);
  }

  assert.match(
    source,
    /if \(isReviewingConsentPolicyRef\.current && !getCookieValue\(COOKIE_CONSENT_NAME\)\) \{\s*return;/,
  );
});
