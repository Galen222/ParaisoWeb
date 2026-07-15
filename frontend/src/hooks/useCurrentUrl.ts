// hooks/useCurrentUrl.ts
import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/router";
import { buildCanonicalPageUrl } from "../utils/canonicalUrl";

const DEFAULT_SITE_URL = "https://www.paraisodeljamon.com";

/**
 * Hook personalizado para obtener la URL actual de la página.
 * En SSR devuelve una URL absoluta determinista para que Open Graph y JSON-LD no se rendericen
 * con una URL vacía. Tanto en servidor como en navegador elimina query y fragmento para no
 * convertir parámetros de campaña o estado temporal en URLs SEO y enlaces compartidos distintos.
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

  const getCurrentUrl = useCallback(
    (): string => buildCanonicalPageUrl(siteUrl, window.location.pathname),
    [siteUrl]
  );
  const getServerUrl = useCallback(
    (): string =>
      buildCanonicalPageUrl(
        siteUrl,
        router.asPath,
        router.locale,
        router.defaultLocale,
        router.locales
      ),
    [router.asPath, router.defaultLocale, router.locale, router.locales, siteUrl]
  );

  return useSyncExternalStore(subscribe, getCurrentUrl, getServerUrl);
};

export default useCurrentUrl;
