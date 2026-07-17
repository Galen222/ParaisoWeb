import { requirePublicApiUrl } from "../config/api.config";
import { requireLoopbackSitemapApiUrl } from "../utils/sitemapApiUrl";
import { isValidApiDateString, normalizeApiDateValue } from "../utils/apiDate";
import { normalizeBlogSlug } from "../utils/blogSlug";
import type { AppLogger } from "../logging/appLogger";
import { clientLogger } from "../logging/clientLogger";

const SITEMAP_REQUEST_TIMEOUT_MS = 10000;
const SUPPORTED_LANGUAGES = new Set(["es", "en", "de", "fr"]);
const TIMED_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}=$/;

export type SitemapLocale = "es" | "en" | "de" | "fr";


export interface SitemapBlogEntry {
  id_noticia: number;
  idioma: SitemapLocale;
  slug: string;
  lastmod: string;
}

const getSitemapApiUrl = (): string =>
  requireLoopbackSitemapApiUrl(
    requirePublicApiUrl(process.env.SITEMAP_API_URL, "SITEMAP_API_URL")
  );

const getTokenUrlForSitemap = (sitemapApiUrl: string): string =>
  new URL("../get-token", sitemapApiUrl).toString();

const requestSitemapToken = async (
  tokenUrl: string,
  signal: AbortSignal
): Promise<string> => {
  const response = await fetch(tokenUrl, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`La API de tokens respondió con HTTP ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("token" in data)) {
    throw new Error("La API de tokens devolvió un formato no válido.");
  }

  const token = (data as { token?: unknown }).token;
  if (typeof token !== "string" || !TIMED_TOKEN_PATTERN.test(token)) {
    throw new Error("La API de tokens devolvió un token no válido.");
  }

  return token;
};

const requestSitemapEntries = async (
  sitemapApiUrl: string,
  token: string,
  signal: AbortSignal
): Promise<Response> =>
  fetch(sitemapApiUrl, {
    headers: {
      Accept: "application/json",
      "x-timed-token": token,
    },
    signal,
  });

const isSitemapBlogEntry = (value: unknown): value is SitemapBlogEntry => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id_noticia === "number" &&
    Number.isInteger(entry.id_noticia) &&
    entry.id_noticia > 0 &&
    typeof entry.idioma === "string" &&
    SUPPORTED_LANGUAGES.has(entry.idioma) &&
    normalizeBlogSlug(entry.slug) !== null &&
    isValidApiDateString(entry.lastmod)
  );
};

export const getSitemapBlogEntries = async (
  logger: AppLogger = clientLogger
): Promise<SitemapBlogEntry[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEMAP_REQUEST_TIMEOUT_MS);

  try {
    const sitemapApiUrl = getSitemapApiUrl();
    const tokenUrl = getTokenUrlForSitemap(sitemapApiUrl);
    let token = await requestSitemapToken(tokenUrl, controller.signal);
    let response = await requestSitemapEntries(
      sitemapApiUrl,
      token,
      controller.signal
    );

    // El token puede cambiar entre las dos peticiones justo al cruzar una ventana
    // temporal. En ese único caso se obtiene uno nuevo y se repite la lectura una vez.
    if (response.status === 403) {
      const refreshedToken = await requestSitemapToken(tokenUrl, controller.signal);
      if (refreshedToken !== token) {
        token = refreshedToken;
        response = await requestSitemapEntries(
          sitemapApiUrl,
          token,
          controller.signal
        );
      }
    }

    if (!response.ok) {
      throw new Error(`La API del sitemap respondió con HTTP ${response.status}.`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("La API del sitemap devolvió un formato no válido.");
    }

    const validEntries = data.filter(isSitemapBlogEntry);
    const discardedEntries = data.length - validEntries.length;
    if (discardedEntries > 0) {
      logger.error(`Se omitieron ${discardedEntries} entradas no válidas del sitemap.`);
    }

    const normalizedEntries = validEntries.map((entry) => ({
      ...entry,
      slug: normalizeBlogSlug(entry.slug) as string,
      lastmod: new Date(normalizeApiDateValue(entry.lastmod)).toISOString(),
    }));

    // Cada artículo solo puede aportar una URL por idioma. Si llega repetida, se
    // conserva la actualización más reciente para evitar alternates duplicados.
    const uniqueArticleLocales = new Map<string, SitemapBlogEntry>();
    for (const entry of normalizedEntries) {
      const key = `${entry.id_noticia}:${entry.idioma}`;
      const current = uniqueArticleLocales.get(key);
      if (!current || entry.lastmod > current.lastmod) {
        uniqueArticleLocales.set(key, entry);
      }
    }

    // Dos IDs distintos con el mismo slug e idioma producirían exactamente la misma
    // URL pública y una ruta ambigua. Se conserva la versión más reciente y, en empate,
    // el ID menor para que el resultado sea estable entre ejecuciones.
    const uniqueRoutes = new Map<string, SitemapBlogEntry>();
    let duplicateRoutes = 0;
    for (const entry of uniqueArticleLocales.values()) {
      const routeKey = `${entry.idioma}:${entry.slug}`;
      const current = uniqueRoutes.get(routeKey);
      if (current) {
        duplicateRoutes += 1;
      }
      if (
        !current ||
        entry.lastmod > current.lastmod ||
        (entry.lastmod === current.lastmod && entry.id_noticia < current.id_noticia)
      ) {
        uniqueRoutes.set(routeKey, entry);
      }
    }

    if (duplicateRoutes > 0) {
      logger.error(`Se omitieron ${duplicateRoutes} rutas duplicadas del sitemap.`);
    }

    return Array.from(uniqueRoutes.values()).sort((left, right) =>
      left.id_noticia - right.id_noticia || left.idioma.localeCompare(right.idioma)
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
