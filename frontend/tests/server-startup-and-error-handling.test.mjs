import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createRequestListener, listenServer, resolvePort } = require("../server.cjs");

const closeServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

test("el puerto solo acepta enteros TCP completos dentro del rango válido", () => {
  assert.equal(resolvePort("1"), 1);
  assert.equal(resolvePort("3000"), 3000);
  assert.equal(resolvePort(" 4010 "), 4010);
  assert.equal(resolvePort("65535"), 65535);

  for (const invalidValue of [undefined, "", "abc", "3000abc", "0", "-1", "65536", "70000"]) {
    assert.equal(resolvePort(invalidValue), 3000);
  }
});

test("un error al abrir el puerto rechaza el arranque del servidor", async () => {
  const firstServer = createServer();
  await listenServer(firstServer, 0, "127.0.0.1");
  const address = firstServer.address();
  assert.ok(address && typeof address === "object");

  const secondServer = createServer();
  try {
    await assert.rejects(
      listenServer(secondServer, address.port, "127.0.0.1"),
      (error) => error?.code === "EADDRINUSE",
    );
  } finally {
    await closeServer(firstServer);
    if (secondServer.listening) await closeServer(secondServer);
  }
});

test("un error síncrono del manejador devuelve 500 sin escapar del listener", async () => {
  const response = {
    headers: new Map(),
    headersSent: false,
    writableEnded: false,
    statusCode: 200,
    body: "",
    setHeader(name, value) {
      this.headers.set(name, value);
    },
    end(body = "") {
      this.body = body;
      this.writableEnded = true;
    },
  };
  const expectedError = new Error("fallo síncrono de prueba");
  const listener = createRequestListener(() => {
    throw expectedError;
  });
  const originalConsoleError = console.error;
  const loggedErrors = [];
  console.error = (...args) => loggedErrors.push(args);

  try {
    assert.doesNotThrow(() => listener({ url: "/blog" }, response));
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.statusCode, 500);
  assert.equal(response.headers.get("Content-Type"), "text/plain; charset=utf-8");
  assert.equal(response.body, "Internal Server Error");
  assert.equal(response.writableEnded, true);
  assert.equal(loggedErrors.length, 1);
  assert.equal(loggedErrors[0][0], expectedError);
});
