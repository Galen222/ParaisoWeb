import { requirePublicApiUrl } from "../config/api.config";
import { isValidApiDateString, normalizeApiDateValue } from "../utils/apiDate";
import { normalizeBlogSlug } from "../utils/blogSlug";

const SITEMAP_REQUEST_TIMEOUT_MS = 10000;
const SUPPORTED_LANGUAGES = new Set(["es", "en", "de"]);
const TIMED_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}=$/;

export type SitemapLocale = "es" | "en" | "de";


export interface SitemapBlogEntry {
  id_noticia: number;
  idioma: SitemapLocale;
  slug: string;
  lastmod: string;
}

const getSitemapApiUrl = (): string =>
  requirePublicApiUrl(process.env.SITEMAP_API_URL, "SITEMAP_API_URL");

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

export const getSitemapBlogEntries = async (): Promise<SitemapBlogEntry[]> => {
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
    if (!Array.isArray(data) || !data.every(isSitemapBlogEntry)) {
      throw new Error("La API del sitemap devolvió un formato no válido.");
    }

    return data.map((entry) => ({
      ...entry,
      slug: normalizeBlogSlug(entry.slug) as string,
      lastmod: new Date(normalizeApiDateValue(entry.lastmod)).toISOString(),
    }));
  } finally {
    clearTimeout(timeoutId);
  }
};
