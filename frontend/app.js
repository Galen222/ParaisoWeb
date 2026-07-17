"use strict";

process.env.NODE_ENV = "production";

const { startServer } = require("./server.cjs");

startServer().catch((error) => {
  // Solo se usa para errores críticos que impidan arrancar Next.js.
  console.error("No se pudo iniciar Next.js:", error);
  process.exitCode = 1;
});
