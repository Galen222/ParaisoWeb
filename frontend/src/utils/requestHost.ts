import type { IncomingHttpHeaders } from "http";

/** Obtiene el host público comunicado por el proxy o por la petición directa. */
const getRequestHost = (headers: IncomingHttpHeaders): string | null => {
  const forwardedHost = headers["x-forwarded-host"];
  const forwardedValue = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
  const rawHost = forwardedValue?.split(",", 1)[0].trim() || headers.host?.trim();
  return rawHost || null;
};

/** Compara hosts de forma insensible a mayúsculas y sin depender del puerto publicado. */
export const isSameRequestHost = (refererUrl: URL, headers: IncomingHttpHeaders): boolean => {
  const requestHost = getRequestHost(headers);
  if (!requestHost) {
    return true;
  }

  try {
    const parsedRequestHost = new URL(`http://${requestHost}`);
    return refererUrl.hostname.toLowerCase() === parsedRequestHost.hostname.toLowerCase();
  } catch {
    return refererUrl.host.toLowerCase() === requestHost.toLowerCase();
  }
};
