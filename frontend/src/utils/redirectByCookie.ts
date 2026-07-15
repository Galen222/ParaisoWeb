// utils/redirectByCookie.ts

import type { GetServerSidePropsContext } from "next";
import { isSameRequestHost } from "./requestHost";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Normaliza una ruta para poder comparar la página actual con el referer. */
const normalizePath = (path: string): string => {
  const normalized = `/${path}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

/** Elimina el prefijo de idioma de una ruta y conserva la ruta de la página. */
const stripLocalePrefix = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && SUPPORTED_LOCALES.has(segments[0])) {
    segments.shift();
  }

  return normalizePath(segments.join("/"));
};

/** Obtiene el idioma de una ruta; las rutas sin prefijo corresponden al español por defecto. */
const getLocaleFromPath = (pathname: string): string => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? firstSegment : DEFAULT_LOCALE;
};

/** Construye la ruta localizada sin añadir `/es` al idioma predeterminado. */
const buildLocalizedDestination = (locale: string, basePath: string): string => {
  const normalizedBasePath = basePath ? normalizePath(basePath) : "";

  if (locale === DEFAULT_LOCALE) {
    return normalizedBasePath || "/";
  }

  return `/${locale}${normalizedBasePath}`;
};

export function redirectByCookie(context: GetServerSidePropsContext, basePath: string) {
  const { req, locale } = context;
  const localeCookie = req.cookies._locale;

  // Verifica si el `referer` procede de la misma página en otro idioma.
  const referer = req.headers.referer || "";

  // console.log(`-----------------------------`);
  // console.log(`context.locale (actual): ${locale}`);
  // console.log(`localeCookie: ${localeCookie}`);
  // console.log(`referer: ${referer}`);
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isSameHost = isSameRequestHost(refererUrl, req.headers);
      const isSamePage = stripLocalePrefix(refererUrl.pathname) === normalizePath(basePath);
      const refererLocale = getLocaleFromPath(refererUrl.pathname);
      // console.log(`refererLocale: ${refererLocale}`);

      // No redirige al cambiar el idioma manualmente, incluido el español sin prefijo `/es`.
      if (isSameHost && isSamePage && refererLocale !== locale) {
        // console.log(`[NO REDIRECT] Cambio de idioma manual detectado, referer: ${referer}`);
        return { props: {} };
      }
    } catch {
      // Si el referer no es una URL válida, se continúa con la preferencia guardada.
    }
  }

  // Si no hay una cookie válida o el locale actual ya coincide, no redirige.
  if (!localeCookie || !SUPPORTED_LOCALES.has(localeCookie) || locale === localeCookie) {
    // console.log(`[NO REDIRECT] La URL ya tiene el prefijo correcto, la cookie no es válida o no existe`);
    return { props: {} };
  }

  // console.log(`[REDIRECT] Redirigiendo a ${buildLocalizedDestination(localeCookie, basePath)}`);
  return {
    redirect: {
      destination: buildLocalizedDestination(localeCookie, basePath),
      permanent: false,
    },
  };
}
