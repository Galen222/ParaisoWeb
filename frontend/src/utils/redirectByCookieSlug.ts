// utils/redirectByCookieSlug.ts

import { GetServerSidePropsContext } from "next";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Obtiene el idioma de una ruta; las rutas sin prefijo corresponden al español por defecto. */
const getLocaleFromPath = (pathname: string): string => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? firstSegment : DEFAULT_LOCALE;
};

/** Comprueba si una ruta corresponde al detalle de un artículo del blog. */
const isBlogDetailsPath = (pathname: string): boolean => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && SUPPORTED_LOCALES.has(segments[0])) {
    segments.shift();
  }

  return segments.length === 2 && segments[0] === "blog" && Boolean(segments[1]);
};

/**
 * Redirige a un slug basado en la cookie de idioma si corresponde.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<{ redirect: { destination: string, permanent: boolean } } | null>} Objeto de redirección o null si no aplica.
 */
export async function redirectByCookieSlug(context: GetServerSidePropsContext): Promise<{ redirect: { destination: string; permanent: boolean } } | null> {
  const { slug } = context.params!;
  const locale = context.locale || DEFAULT_LOCALE;

  // No aplica la preferencia anterior cuando la petición procede de un cambio manual de idioma en otro detalle del blog.
  const referer = context.req.headers.referer;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const requestHost = context.req.headers.host;
      const isSameHost = !requestHost || refererUrl.host === requestHost;
      const refererLocale = getLocaleFromPath(refererUrl.pathname);

      if (isSameHost && isBlogDetailsPath(refererUrl.pathname) && refererLocale !== locale) {
        return null;
      }
    } catch {
      // Si el referer no es una URL válida, se continúa con la preferencia guardada.
    }
  }

  // Obtener cookies y buscar la de idioma
  const cookies = context.req.headers.cookie || "";
  const localeCookie = cookies
    .split("; ")
    .find((row) => row.startsWith("_locale="))
    ?.split("=")[1];

  // Solo aplica la redirección si la cookie contiene un idioma soportado y distinto del actual.
  if (localeCookie && SUPPORTED_LOCALES.has(localeCookie) && locale !== localeCookie) {
    try {
      const token = await getTimedToken();
      const blogPost = await getBlogPostBySlug(slug as string, token, locale);

      if (blogPost) {
        const translatedBlogPost = await getBlogPostById(blogPost.id_noticia, localeCookie, token);

        if (translatedBlogPost) {
          return {
            redirect: {
              destination: `${localeCookie === DEFAULT_LOCALE ? "" : `/${localeCookie}`}/blog/${translatedBlogPost.slug}`,
              permanent: false,
            },
          };
        }
      }
    } catch (err) {
      console.error("Error durante la redirección basada en cookie:", err);
    }
  }

  // Retorna null si no se requiere redirección
  return null;
}
