import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const loadPaginationHook = async (reactHooks) => {
  const source = (await readFile(
    new URL("../src/hooks/usePagination.ts", import.meta.url),
    "utf8",
  ))
    .replace(
      /import \{ useState, useMemo, useEffect, useRef \} from "react";/,
      "const { useState, useMemo, useEffect, useRef } = globalThis.__paginationTest.reactHooks;",
    )
    .replace(
      /import \{ getMotionSafeScrollBehavior \} from "\.\.\/utils\/motion";/,
      "const { getMotionSafeScrollBehavior } = globalThis.__paginationTest;",
    );

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (module, exports) { ${outputText}\n })`,
  );

  globalThis.__paginationTest = {
    reactHooks,
    getMotionSafeScrollBehavior: () => "smooth",
  };
  wrapper(loadedModule, loadedModule.exports);
  return loadedModule.exports.usePagination;
};

const createHookRunner = () => {
  const slots = [];
  let cursor = 0;
  let pendingEffects = [];

  const hooks = {
    useState(initialValue) {
      const slotIndex = cursor++;
      if (!slots[slotIndex]) {
        slots[slotIndex] = {
          kind: "state",
          value: typeof initialValue === "function" ? initialValue() : initialValue,
        };
      }
      const setValue = (nextValue) => {
        const previousValue = slots[slotIndex].value;
        slots[slotIndex].value =
          typeof nextValue === "function" ? nextValue(previousValue) : nextValue;
      };
      return [slots[slotIndex].value, setValue];
    },
    useMemo(factory) {
      cursor += 1;
      return factory();
    },
    useRef(initialValue) {
      const slotIndex = cursor++;
      if (!slots[slotIndex]) {
        slots[slotIndex] = { kind: "ref", value: { current: initialValue } };
      }
      return slots[slotIndex].value;
    },
    useEffect(effect, dependencies) {
      const slotIndex = cursor++;
      pendingEffects.push({ slotIndex, effect, dependencies });
    },
  };

  const render = (hook, props) => {
    cursor = 0;
    pendingEffects = [];
    const result = hook(props);

    for (const pendingEffect of pendingEffects) {
      const previous = slots[pendingEffect.slotIndex];
      const dependenciesChanged =
        !previous ||
        !previous.dependencies ||
        previous.dependencies.length !== pendingEffect.dependencies.length ||
        previous.dependencies.some(
          (dependency, index) => !Object.is(dependency, pendingEffect.dependencies[index]),
        );
      if (!dependenciesChanged) continue;

      previous?.cleanup?.();
      slots[pendingEffect.slotIndex] = {
        kind: "effect",
        dependencies: [...pendingEffect.dependencies],
        cleanup: pendingEffect.effect(),
      };
    }

    return result;
  };

  return { hooks, render };
};

test("la paginación solo desplaza el contenido tras una navegación solicitada por el usuario", async () => {
  const previousDocument = globalThis.document;
  const previousTestApi = globalThis.__paginationTest;
  const scrollCalls = [];
  globalThis.document = {
    getElementById(id) {
      assert.equal(id, "principal");
      return {
        scrollIntoView(options) {
          scrollCalls.push(options);
        },
      };
    },
  };

  try {
    const runner = createHookRunner();
    const usePagination = await loadPaginationHook(runner.hooks);
    const thirtyItems = Array.from({ length: 30 }, (_, index) => index);

    let pagination = runner.render(usePagination, {
      items: thirtyItems,
      itemsPerPage: 10,
    });
    assert.equal(pagination.currentPage, 1);
    assert.equal(scrollCalls.length, 0);

    pagination.goToPage(3);
    pagination = runner.render(usePagination, {
      items: thirtyItems,
      itemsPerPage: 10,
    });
    assert.equal(pagination.currentPage, 3);
    assert.deepEqual(scrollCalls, [{ behavior: "smooth" }]);

    pagination = runner.render(usePagination, {
      items: thirtyItems.slice(0, 5),
      itemsPerPage: 10,
    });
    assert.equal(pagination.currentPage, 1);
    assert.equal(scrollCalls.length, 1);

    await Promise.resolve();
    pagination = runner.render(usePagination, {
      items: thirtyItems.slice(0, 5),
      itemsPerPage: 10,
    });
    assert.equal(pagination.currentPage, 1);
    assert.equal(scrollCalls.length, 1);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousTestApi === undefined) delete globalThis.__paginationTest;
    else globalThis.__paginationTest = previousTestApi;
  }
});
