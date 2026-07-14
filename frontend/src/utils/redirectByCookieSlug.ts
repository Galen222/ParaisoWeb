// utils/redirectByCookieSlug.ts

import { GetServerSidePropsContext } from "next";
import { BlogPost, getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);
const VALID_SLUG_PATTERN = /^[a-zA-Z0-9-]+$/;

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

/** Comprueba que la respuesta corresponde realmente a una traducción navegable. */
const isValidTranslatedPost = (post: BlogPost | null | undefined, locale: string): post is BlogPost =>
  Boolean(post && post.idioma === locale && VALID_SLUG_PATTERN.test(post.slug));

/** Devuelve un mensaje acotado para depuración sin registrar respuestas, cabeceras ni tokens. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error desconocido";
};

/** Construye la ruta traducida respetando que español es el idioma sin prefijo. */
const buildLocalizedBlogPath = (locale: string, slug: string): string =>
  `${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/blog/${slug}`;

/**
 * Redirige a un slug basado en la cookie de idioma si corresponde.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<{ redirect: { destination: string, permanent: boolean } } | null>} Objeto de redirección o null si no aplica.
 */
export async function redirectByCookieSlug(context: GetServerSidePropsContext): Promise<{ redirect: { destination: string; permanent: boolean } } | null> {
  const slug = context.params?.slug;
  const locale = context.locale || DEFAULT_LOCALE;

  // No se consulta la API si la ruta dinámica no contiene un slug simple y válido.
  if (typeof slug !== "string" || !VALID_SLUG_PATTERN.test(slug) || !SUPPORTED_LOCALES.has(locale)) {
    return null;
  }

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
      const blogPost = await getBlogPostBySlug(slug, token, locale);

      if (blogPost) {
        const translatedBlogPost = await getBlogPostById(blogPost.id_noticia, localeCookie, token);

        if (isValidTranslatedPost(translatedBlogPost, localeCookie)) {
          return {
            redirect: {
              destination: buildLocalizedBlogPath(localeCookie, translatedBlogPost.slug),
              permanent: false,
            },
          };
        }

        console.error("Redirección por cookie ignorada: la traducción recibida no es válida.");
      }
    } catch (error: unknown) {
      console.error("Error durante la redirección basada en cookie:", getErrorMessageForLog(error));
    }
  }

  // Retorna null si no se requiere redirección
  return null;
}
