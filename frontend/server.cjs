"use strict";

const { createServer } = require("node:http");

/**
 * Devuelve la URL española canónica solo cuando la petición original contiene
 * explícitamente el prefijo `/es`. Las rutas que ya están sin prefijo devuelven
 * `null`, por lo que nunca pueden redirigirse a sí mismas.
 */
function buildSpanishCanonicalRedirect(requestUrl) {
  if (typeof requestUrl !== "string" || requestUrl.length === 0) return null;

  let parsedUrl;
  try {
    parsedUrl = new URL(requestUrl, "http://localhost");
  } catch {
    return null;
  }

  const { pathname, search } = parsedUrl;
  if (pathname !== "/es" && !pathname.startsWith("/es/")) return null;

  // Colapsa únicamente las barras iniciales del resto para impedir que un valor
  // como `/es//otro-dominio` genere una redirección externa protocol-relative.
  const pathWithoutLocale = pathname.slice(3).replace(/^\/+/, "");
  const canonicalPath = pathWithoutLocale ? `/${pathWithoutLocale}` : "/";
  return `${canonicalPath}${search}`;
}

/**
 * Normaliza el puerto de escucha sin aceptar valores parcialmente numéricos ni
 * números que Node.js no puede utilizar como puerto TCP.
 */
function resolvePort(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  if (!/^\d+$/.test(normalizedValue)) return 3000;

  const parsedPort = Number(normalizedValue);
  return Number.isSafeInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535
    ? parsedPort
    : 3000;
}

/**
 * Crea el listener HTTP y transforma tanto errores síncronos como promesas
 * rechazadas de Next.js en una respuesta 500 controlada.
 */
function createRequestListener(handle) {
  return (request, response) => {
    const redirectTarget = buildSpanishCanonicalRedirect(request.url);
    if (redirectTarget !== null) {
      response.statusCode = 308;
      response.setHeader("Location", redirectTarget);
      response.setHeader("Content-Length", "0");
      response.end();
      return;
    }

    Promise.resolve()
      .then(() => handle(request, response))
      .catch((error) => {
        console.error(error);
        if (!response.headersSent) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
        }
        if (!response.writableEnded) response.end("Internal Server Error");
      });
  };
}

/**
 * Espera a que el servidor esté escuchando y rechaza el arranque si el puerto
 * no puede abrirse. Así `app.js` puede informar correctamente del fallo a Plesk.
 */
function listenServer(server, port, hostname) {
  return new Promise((resolve, reject) => {
    const handleError = (error) => {
      server.off("listening", handleListening);
      reject(error);
    };
    const handleListening = () => {
      server.off("error", handleError);
      resolve();
    };

    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(port, hostname);
  });
}

async function startServer() {
  process.env.NODE_ENV ||= "production";

  const next = require("next");
  const port = resolvePort(process.env.PORT);
  const hostname = process.env.HOST || "0.0.0.0";
  const app = next({ dev: false, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = createServer(createRequestListener(handle));
  await listenServer(server, port, hostname);
  console.log(`> Ready on http://${hostname}:${port}`);
  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildSpanishCanonicalRedirect,
  createRequestListener,
  listenServer,
  resolvePort,
  startServer,
};
