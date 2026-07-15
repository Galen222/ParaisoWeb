import { requirePublicApiUrl } from "../config/api.config";
import { isValidApiDateString, normalizeApiDateValue } from "../utils/apiDate";

const SITEMAP_REQUEST_TIMEOUT_MS = 10000;
const SUPPORTED_LANGUAGES = new Set(["es", "en", "de"]);
const MAX_SLUG_LENGTH = 150;
const TIMED_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}=$/;

export type SitemapLocale = "es" | "en" | "de";


const isValidSitemapSlug = (value: string): boolean => {
  const normalizedSlug = value.normalize("NFC");
  if (normalizedSlug.length === 0 || normalizedSlug.length > MAX_SLUG_LENGTH) {
    return false;
  }

  let previousWasAlphanumericOrMark = false;
  for (const character of normalizedSlug) {
    if (character === "-") {
      previousWasAlphanumericOrMark = false;
      continue;
    }
    if (/^[\p{L}\p{N}]$/u.test(character)) {
      previousWasAlphanumericOrMark = true;
      continue;
    }
    if (/^\p{M}$/u.test(character) && previousWasAlphanumericOrMark) {
      continue;
    }
    return false;
  }

  return true;
};

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
    typeof entry.slug === "string" &&
    isValidSitemapSlug(entry.slug) &&
    isValidApiDateString(entry.lastmod)
  );
};

export const getSitemapBlogEntries = async (): Promise<SitemapBlogEntry[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEMAP_REQUEST_TIMEOUT_MS);

  try {
    const sitemapApiUrl = getSitemapApiUrl();
    const token = await requestSitemapToken(
      getTokenUrlForSitemap(sitemapApiUrl),
      controller.signal
    );
    const response = await fetch(sitemapApiUrl, {
      headers: {
        Accept: "application/json",
        "x-timed-token": token,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`La API del sitemap respondió con HTTP ${response.status}.`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(isSitemapBlogEntry)) {
      throw new Error("La API del sitemap devolvió un formato no válido.");
    }

    return data.map((entry) => ({
      ...entry,
      slug: entry.slug.normalize("NFC"),
      lastmod: new Date(normalizeApiDateValue(entry.lastmod)).toISOString(),
    }));
  } finally {
    clearTimeout(timeoutId);
  }
};
