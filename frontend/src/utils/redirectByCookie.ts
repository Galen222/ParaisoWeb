// utils/redirectByCookie.ts

import { GetServerSidePropsContext } from "next";

export function redirectByCookie(context: GetServerSidePropsContext, basePath: string) {
  const { req, locale } = context;
  const cookies = req.headers.cookie || "";
  const localeCookie = cookies
    .split("; ")
    .find((row) => row.startsWith("_locale="))
    ?.split("=")[1];

  // Verifica si el `referer` de la solicitud es de la misma página con un prefijo de idioma diferente
  const referer = req.headers.referer || "";
  const refererLocaleMatch = referer.match(/https?:\/\/[^/]+\/(en|de|es)(\/|$)/);
  const refererLocale = refererLocaleMatch ? refererLocaleMatch[1] : null;

  // console.log(`-----------------------------`);
  // console.log(`context.locale (actual): ${locale}`);
  // console.log(`localeCookie: ${localeCookie}`);
  // console.log(`referer: ${referer}`);
  // console.log(`refererLocale: ${refererLocale}`);

  // No redirige si el referer es de la misma página con un prefijo de idioma diferente (cambio manual)
  if (refererLocale && refererLocale !== locale) {
    // console.log(`[NO REDIRECT] Cambio de idioma manual detectado, referer: ${referer}`);
    return { props: {} };
  }

  // Si no hay cookie o si el locale actual ya coincide con la cookie, no redirige
  if (!localeCookie || locale === localeCookie) {
    // console.log(`[NO REDIRECT] La URL ya tiene el prefijo correcto o no hay cookie`);
    return { props: {} };
  }

  // Si la cookie es "en" o "de" y el locale actual no coincide, redirige
  if ((localeCookie === "en" || localeCookie === "de" || localeCookie === "es") && locale !== localeCookie) {
    // console.log(`[REDIRECT] Redirigiendo a /${localeCookie}${basePath}`);
    return {
      redirect: {
        destination: `/${localeCookie}${basePath}`,
        permanent: false,
      },
    };
  }

  // No se necesita redirección si la lógica anterior no se cumple
  // console.log(`[NO REDIRECT] No se necesita redirección`);
  return { props: {} };
}
