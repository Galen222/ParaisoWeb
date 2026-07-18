import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const buildContentSecurityPolicy = (nonce: string): string => {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const developmentScriptSources = isDevelopment ? " 'unsafe-eval'" : "";
  const developmentConnectSources = isDevelopment
    ? " http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*"
    : "";
  const productionUpgrade = isDevelopment ? "" : " upgrade-insecure-requests;";

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptSources} https://maps.googleapis.com https://maps.gstatic.com https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com;
    script-src-attr 'none';
    style-src-elem 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://maps.googleapis.com https://maps.gstatic.com;
    style-src-attr 'unsafe-inline';
    img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googleusercontent.com https://*.ggpht.com https://*.google-analytics.com https://*.googletagmanager.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' data: blob:${developmentConnectSources} https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    frame-src 'self' https://*.google.com https://maps.google.com;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    manifest-src 'self';${productionUpgrade}
  `
    .replace(/\s{2,}/g, " ")
    .trim();
};

/** Genera una CSP estricta y un nonce criptográfico nuevo para cada documento HTML. */
export function proxy(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|images|fonts|files|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
