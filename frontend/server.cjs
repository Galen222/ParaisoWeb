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

async function startServer() {
  process.env.NODE_ENV ||= "production";

  const next = require("next");
  const parsedPort = Number.parseInt(process.env.PORT || "3000", 10);
  const port = Number.isSafeInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
  const hostname = process.env.HOST || "0.0.0.0";
  const app = next({ dev: false, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = createServer((request, response) => {
    const redirectTarget = buildSpanishCanonicalRedirect(request.url);
    if (redirectTarget !== null) {
      response.statusCode = 308;
      response.setHeader("Location", redirectTarget);
      response.setHeader("Content-Length", "0");
      response.end();
      return;
    }

    Promise.resolve(handle(request, response)).catch((error) => {
      console.error(error);
      if (!response.headersSent) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
      }
      if (!response.writableEnded) response.end("Internal Server Error");
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { buildSpanishCanonicalRedirect, startServer };
