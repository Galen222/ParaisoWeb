// hooks/useCurrentUrl.ts
import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/router";

const DEFAULT_SITE_URL = "https://www.paraisodeljamon.com";

/**
 * Construye una URL absoluta estable para SSR a partir de la ruta y el locale actuales.
 * Next.js no incluye necesariamente el prefijo del locale en `router.asPath`, por lo que
 * se añade solo cuando corresponde y no está ya presente.
 */
const buildServerUrl = (
  siteUrl: string,
  asPath: string,
  locale?: string,
  defaultLocale?: string,
  locales?: readonly string[]
): string => {
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const normalizedPath = asPath.startsWith("/") ? asPath : `/${asPath}`;
  const pathWithoutQueryOrHash = normalizedPath.split(/[?#]/, 1)[0];
  const firstSegment = pathWithoutQueryOrHash.split("/").filter(Boolean)[0];
  const pathAlreadyHasLocale = Boolean(firstSegment && locales?.includes(firstSegment));
  const shouldPrefixLocale = Boolean(locale && locale !== defaultLocale && !pathAlreadyHasLocale);
  const localePrefix = shouldPrefixLocale ? `/${locale}` : "";

  return `${normalizedSiteUrl}${localePrefix}${normalizedPath}`;
};

/**
 * Hook personalizado para obtener la URL actual de la página.
 * En SSR devuelve una URL absoluta determinista para que Open Graph y JSON-LD no se rendericen
 * con una URL vacía. En el navegador usa la URL real y se actualiza en cada navegación.
 *
 * @returns {string} La URL actual completa.
 */
const useCurrentUrl = (): string => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  const subscribe = useCallback(
    (onUrlChange: () => void): (() => void) => {
      // Next.js emite eventos distintos para cambios de ruta y cambios únicamente en el hash.
      router.events.on("routeChangeComplete", onUrlChange);
      router.events.on("hashChangeComplete", onUrlChange);

      return () => {
        router.events.off("routeChangeComplete", onUrlChange);
        router.events.off("hashChangeComplete", onUrlChange);
      };
    },
    [router.events]
  );

  const getCurrentUrl = useCallback((): string => window.location.href, []);
  const getServerUrl = useCallback(
    (): string => buildServerUrl(siteUrl, router.asPath, router.locale, router.defaultLocale, router.locales),
    [router.asPath, router.defaultLocale, router.locale, router.locales, siteUrl]
  );

  return useSyncExternalStore(subscribe, getCurrentUrl, getServerUrl);
};

export default useCurrentUrl;
