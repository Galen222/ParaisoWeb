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

  const encoded = Buffer.from(transpiled, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
};

test("los textos públicos rechazan controles peligrosos sin bloquear formato normal", async () => {
  const { isSafePublicMultilineText, isSafePublicSingleLineText } =
    await loadTypeScriptModule("../src/utils/publicText.ts");

  assert.equal(isSafePublicSingleLineText("\u202eTítulo invertido"), false);
  assert.equal(isSafePublicSingleLineText("Autor\x00oculto"), false);
  assert.equal(isSafePublicSingleLineText("\u200b"), false);
  assert.equal(isSafePublicSingleLineText("Texto\u200boculto"), false);
  assert.equal(isSafePublicSingleLineText("Marca\ufeffoculta"), false);
  assert.equal(isSafePublicSingleLineText("Título visible"), true);

  assert.equal(isSafePublicMultilineText("\u200b"), false);
  assert.equal(isSafePublicMultilineText("Texto\u2028separado"), false);
  assert.equal(
    isSafePublicMultilineText("Primera línea\n\tFamilia 👨‍👩‍👧‍👦"),
    true
  );
});

test("los textos públicos rechazan caracteres Unicode sin representación estable", async () => {
  const { isSafePublicMultilineText, isSafePublicSingleLineText } =
    await loadTypeScriptModule("../src/utils/publicText.ts");

  for (const character of ["\uD800", "\uE000", "\u0378"]) {
    assert.equal(isSafePublicSingleLineText(`Título${character}oculto`), false);
    assert.equal(isSafePublicMultilineText(`Texto${character}oculto`), false);
  }

  assert.equal(isSafePublicSingleLineText("Idioma فارسی‌ معتبر"), true);
  assert.equal(isSafePublicMultilineText("Familia 👨‍👩‍👧‍👦"), true);
});

test("blog y charcutería usan el mismo contrato de texto seguro", async () => {
  const [blogService, charcuteriaService] = await Promise.all([
    readFile(new URL("../src/services/blogService.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/services/charcuteriaService.ts", import.meta.url), "utf8"),
  ]);

  assert.match(blogService, /isSafePublicSingleLineText\(post\.titulo\)/);
  assert.match(blogService, /isSafePublicMultilineText\(post\.contenido\)/);
  assert.match(blogService, /isSafePublicSingleLineText\(post\.autor\)/);

  assert.match(charcuteriaService, /isSafePublicSingleLineText\(product\.nombre\)/);
  assert.match(charcuteriaService, /isSafePublicSingleLineText\(product\.empresa\)/);
  assert.match(charcuteriaService, /isSafePublicMultilineText\(product\.descripcion\)/);
  assert.match(charcuteriaService, /isSafePublicSingleLineText\(product\.categoria\)/);
});

test("el desplazamiento cambia a instantáneo con movimiento reducido", async () => {
  const previousWindow = globalThis.window;
  const { getMotionSafeScrollBehavior, prefersReducedMotion } =
    await loadTypeScriptModule("../src/utils/motion.ts");

  try {
    globalThis.window = {
      matchMedia: () => ({ matches: true }),
    };
    assert.equal(prefersReducedMotion(), true);
    assert.equal(getMotionSafeScrollBehavior(), "auto");

    globalThis.window = {
      matchMedia: () => ({ matches: false }),
    };
    assert.equal(prefersReducedMotion(), false);
    assert.equal(getMotionSafeScrollBehavior(), "smooth");
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
});

test("carrusel, botones, loader y scroll respetan movimiento reducido", async () => {
  const [carousel, form, pagination, scrollToTop, hook, buttonCss, loaderCss] =
    await Promise.all([
      readFile(new URL("../src/components/Carousel.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/Form.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/hooks/usePagination.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/hooks/useScrollToTop.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/hooks/usePrefersReducedMotion.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/styles/animateButton.css", import.meta.url), "utf8"),
      readFile(new URL("../src/styles/components/Loader.module.css", import.meta.url), "utf8"),
    ]);

  assert.match(carousel, /autoplay: !prefersReducedMotion/);
  assert.match(carousel, /speed: prefersReducedMotion \? 0 : 500/);
  assert.match(carousel, /pauseOnFocus: true/);
  assert.match(form, /if \(!prefersReducedMotion\)/);
  assert.match(pagination, /behavior: getMotionSafeScrollBehavior\(\)/);
  assert.match(scrollToTop, /behavior: getMotionSafeScrollBehavior\(\)/);
  assert.match(hook, /const getServerSnapshot = \(\): boolean => true/);
  assert.match(buttonCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(loaderCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test("el loader anuncia el estado de carga sin leer los puntos decorativos", async () => {
  const loader = await readFile(
    new URL("../src/components/Loader.tsx", import.meta.url),
    "utf8"
  );

  assert.match(loader, /role="status"/);
  assert.match(loader, /aria-live="polite"/);
  assert.match(loader, /styles\.visuallyHidden/);
  assert.equal((loader.match(/aria-hidden="true"/g) ?? []).length, 3);
});
