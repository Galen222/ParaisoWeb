import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
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

test("el logger cliente conserva su filtrado de mensajes en producción", async () => {
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

test("el servidor Next escribe y rota frontend.log cuando el destino es archivo", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-front-logs-"));

  try {
    await withEnvironment(
      {
        NODE_ENV: "development",
        FRONTEND_LOG_TARGET: "archivo",
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

test("el servidor Next usa consola aunque NODE_ENV sea production cuando así se configura", async () => {
  await withEnvironment(
    { NODE_ENV: "production", FRONTEND_LOG_TARGET: "consola" },
    async () => {
      let calls = 0;
      const originalInfo = console.info;
      console.info = () => { calls += 1; };
      try {
        const { frontendLogger } = await loadTypeScriptModule("../src/server/frontendLogger.ts");
        frontendLogger.info("salida por consola");
      } finally {
        console.info = originalInfo;
      }
      assert.equal(calls, 1);
    }
  );
});

test("el destino consola respeta el nivel mínimo configurado", async () => {
  await withEnvironment(
    { FRONTEND_LOG_TARGET: "consola", FRONTEND_LOG_LEVEL: "error" },
    async () => {
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
        const { frontendLogger } = await loadTypeScriptModule("../src/server/frontendLogger.ts");
        frontendLogger.debug("debug");
        frontendLogger.info("info");
        frontendLogger.warn("warn");
        frontendLogger.error("error");
      } finally {
        Object.assign(console, originals);
      }

      assert.deepEqual(calls, { debug: 0, info: 0, warn: 0, error: 1 });
    }
  );
});

test("los límites de rotación rechazan valores parcialmente numéricos", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-front-log-config-"));

  try {
    await withEnvironment(
      {
        FRONTEND_LOG_TARGET: "archivo",
        FRONTEND_LOG_LEVEL: "info",
        FRONTEND_LOG_DIR: path.join(directory, "logs"),
        FRONTEND_LOG_MAX_BYTES: "180bytes",
        FRONTEND_LOG_BACKUP_COUNT: "2copias",
      },
      async () => {
        const { frontendLogger } = await loadTypeScriptModule("../src/server/frontendLogger.ts");
        for (let index = 0; index < 8; index += 1) {
          frontendLogger.info(`entrada-${index}-${"x".repeat(50)}`);
        }
      }
    );

    assert.deepEqual(await readdir(path.join(directory, "logs")), ["frontend.log"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("el proceso que arranca Next también obedece el destino de log", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-next-runtime-log-"));

  try {
    await withEnvironment(
      {
        FRONTEND_LOG_TARGET: "archivo",
        FRONTEND_LOG_LEVEL: "info",
        FRONTEND_LOG_DIR: path.join(directory, "logs"),
      },
      async () => {
        const { frontendServerLogger } = require("../serverLogger.cjs");
        frontendServerLogger.info("servidor preparado");
        frontendServerLogger.error("fallo de arranque controlado");
      }
    );

    const contents = await readFile(path.join(directory, "logs", "frontend.log"), "utf8");
    assert.match(contents, /INFO \| servidor preparado/);
    assert.match(contents, /ERROR \| fallo de arranque controlado/);

    const [server, app] = await Promise.all([
      readSource(new URL("../server.cjs", import.meta.url), "utf8"),
      readSource(new URL("../app.js", import.meta.url), "utf8"),
    ]);
    assert.doesNotMatch(server, /console\.(?:log|error)\(/);
    assert.doesNotMatch(app, /console\.(?:log|error)\(/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("los loggers de archivo neutralizan saltos de línea y caracteres de control", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-log-integrity-"));

  try {
    await withEnvironment(
      {
        FRONTEND_LOG_TARGET: "archivo",
        FRONTEND_LOG_LEVEL: "info",
        FRONTEND_LOG_DIR: path.join(directory, "typescript"),
      },
      async () => {
        const { frontendLogger } = await loadTypeScriptModule("../src/server/frontendLogger.ts");
        frontendLogger.info("entrada válida\n2026-01-01T00:00:00.000Z | ERROR | entrada falsa");
        frontendLogger.error(new Error("fallo\r\ncontrolado\u2028sin separar"));
      }
    );

    await withEnvironment(
      {
        FRONTEND_LOG_TARGET: "archivo",
        FRONTEND_LOG_LEVEL: "info",
        FRONTEND_LOG_DIR: path.join(directory, "commonjs"),
      },
      async () => {
        const { frontendServerLogger } = require("../serverLogger.cjs");
        frontendServerLogger.info("inicio\tservidor", { detail: "dato\nexterno" });
        frontendServerLogger.error("fallo\u2029controlado");
      }
    );

    for (const loggerDirectory of ["typescript", "commonjs"]) {
      const contents = await readFile(
        path.join(directory, loggerDirectory, "frontend.log"),
        "utf8"
      );
      const lines = contents.trimEnd().split("\n");

      assert.equal(lines.length, 2);
      assert.ok(lines.every((line) => /^\d{4}-\d{2}-\d{2}T[^|]+ \| (?:INFO|ERROR) \| /.test(line)));
      assert.doesNotMatch(contents, /[\r\u0000-\u0009\u000b-\u001f\u007f-\u009f\u2028\u2029]/);
    }
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


test("una sola entrada sobredimensionada respeta el límite de los logs frontend", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "paraisoweb-bounded-front-log-"));
  const maxBytes = 160;

  try {
    for (const [loggerType, loadLogger] of [
      ["typescript", async () => (await loadTypeScriptModule("../src/server/frontendLogger.ts")).frontendLogger],
      ["commonjs", async () => require("../serverLogger.cjs").frontendServerLogger],
    ]) {
      const logDirectory = path.join(directory, loggerType);
      await withEnvironment(
        {
          FRONTEND_LOG_TARGET: "archivo",
          FRONTEND_LOG_LEVEL: "info",
          FRONTEND_LOG_DIR: logDirectory,
          FRONTEND_LOG_MAX_BYTES: String(maxBytes),
          FRONTEND_LOG_BACKUP_COUNT: "2",
        },
        async () => {
          const logger = await loadLogger();
          logger.error(`entrada-${"🙂".repeat(5_000)}`);
        },
      );

      const logPath = path.join(logDirectory, "frontend.log");
      const [metadata, contents] = await Promise.all([stat(logPath), readFile(logPath, "utf8")]);
      assert.ok(metadata.size <= maxBytes, `${loggerType} escribió ${metadata.size} bytes`);
      assert.doesNotMatch(contents, /�/);
      assert.equal(contents.split("\n").length, 2);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
