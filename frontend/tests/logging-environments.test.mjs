import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { readFile as readSource } from "node:fs/promises";
import ts from "typescript";

const require = createRequire(import.meta.url);

const loadTypeScriptModule = async (relativePath) => {
  const source = await readSource(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const loadedModule = { exports: {} };
  const wrapper = vm.runInThisContext(
    `(function (require, module, exports) { ${outputText}\n })`
  );
  wrapper(require, loadedModule, loadedModule.exports);
  return loadedModule.exports;
};

const withEnvironment = async (values, callback) => {
  const previous = new Map();
  for (const [name, value] of Object.entries(values)) {
    previous.set(name, process.env[name]);
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }

  try {
    return await callback();
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
};

test("el navegador oculta info en producción pero conserva advertencias y errores", async () => {
  await withEnvironment({ NODE_ENV: "production" }, async () => {
    const calls = { debug: 0, info: 0, warn: 0, error: 0 };
    const originals = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    console.debug = () => { calls.debug += 1; };
    console.info = () => { calls.info += 1; };
    console.warn = () => { calls.warn += 1; };
    console.error = () => { calls.error += 1; };

    try {
      const { clientLogger } = await loadTypeScriptModule("../src/logging/clientLogger.ts");
      clientLogger.debug("debug");
      clientLogger.info("info");
      clientLogger.warn("warn");
      clientLogger.error("error");
    } finally {
      Object.assign(console, originals);
    }

    assert.deepEqual(calls, { debug: 0, info: 0, warn: 1, error: 1 });
  });
});

test("el servidor Next escribe y rota frontend.log en producción", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-front-logs-"));

  try {
    await withEnvironment(
      {
        NODE_ENV: "production",
        FRONTEND_LOG_LEVEL: "debug",
        FRONTEND_LOG_DIR: path.join(directory, "logs"),
        FRONTEND_LOG_MAX_BYTES: "180",
        FRONTEND_LOG_BACKUP_COUNT: "2",
      },
      async () => {
        const previousCwd = process.cwd();
        process.chdir(directory);
        try {
          const { frontendLogger } = await loadTypeScriptModule("../src/server/frontendLogger.ts");
          frontendLogger.info("inicio servidor");
          frontendLogger.error("fallo controlado", { operation: "sitemap" });
          for (let index = 0; index < 8; index += 1) {
            frontendLogger.info(`entrada-${index}-${"x".repeat(50)}`);
          }
        } finally {
          process.chdir(previousCwd);
        }
      }
    );

    const logDirectory = path.join(directory, "logs");
    const files = await readdir(logDirectory);
    assert.ok(files.includes("frontend.log"));
    assert.ok(files.includes("frontend.log.1"));
    assert.ok(files.every((name) => /^frontend\.log(?:\.[12])?$/.test(name)));

    const contents = await Promise.all(
      files.map((name) => readFile(path.join(logDirectory, name), "utf8"))
    );
    assert.match(contents.join("\n"), /INFO/);
    assert.doesNotMatch(contents.join("\n"), /\x1b\[/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("las rutas SSR usan el logger de servidor sin enviarlo al navegador", async () => {
  const [blogPage, sitemapPage, clientLogger, serverLogger] = await Promise.all([
    readSource(new URL("../src/pages/blog/[slug].tsx", import.meta.url), "utf8"),
    readSource(new URL("../src/pages/sitemap.xml.tsx", import.meta.url), "utf8"),
    readSource(new URL("../src/logging/clientLogger.ts", import.meta.url), "utf8"),
    readSource(new URL("../src/server/frontendLogger.ts", import.meta.url), "utf8"),
  ]);

  assert.match(blogPage, /await import\("\.\.\/\.\.\/server\/frontendLogger"\)/);
  assert.match(blogPage, /redirectByCookieSlug\(context, frontendLogger\)/);
  assert.match(blogPage, /loadBlogData\([\s\S]*frontendLogger/);
  assert.match(sitemapPage, /getSitemapBlogEntries\(frontendLogger\)/);
  assert.doesNotMatch(clientLogger, /node:fs|appendFile|frontend\.log/);
  assert.match(serverLogger, /const LOG_FILENAME = "frontend\.log"/);
});
