// utils/redirectByCookieSlug.ts

import { GetServerSidePropsContext } from "next";
import { BlogPost, getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";
import { isSameRequestHost } from "./requestHost";
import { normalizeBlogSlug } from "./blogSlug";

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

/** Comprueba que la respuesta corresponde realmente a una traducción navegable. */
const isValidTranslatedPost = (
  post: BlogPost | null | undefined,
  locale: string,
  expectedId: number
): post is BlogPost =>
  Boolean(
    post &&
      post.id_noticia === expectedId &&
      post.idioma === locale &&
      normalizeBlogSlug(post.slug) !== null
  );

/** Devuelve un mensaje acotado para depuración sin registrar respuestas, cabeceras ni tokens. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error desconocido";
};

/** Conserva los parámetros de consulta originales al redirigir a la traducción. */
const getQuerySuffix = (resolvedUrl: string): string => {
  const queryIndex = resolvedUrl.indexOf("?");
  return queryIndex >= 0 ? resolvedUrl.slice(queryIndex) : "";
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
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug === null || !SUPPORTED_LOCALES.has(locale)) {
    return null;
  }

  // No aplica la preferencia anterior cuando la petición procede de un cambio manual de idioma en otro detalle del blog.
  const referer = context.req.headers.referer;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isSameHost = isSameRequestHost(refererUrl, context.req.headers);
      const refererLocale = getLocaleFromPath(refererUrl.pathname);

      if (isSameHost && isBlogDetailsPath(refererUrl.pathname) && refererLocale !== locale) {
        return null;
      }
    } catch {
      // Si el referer no es una URL válida, se continúa con la preferencia guardada.
    }
  }

  // Next.js ya expone las cookies parseadas; así no se depende de que la cabecera
  // utilice un espacio después de cada punto y coma.
  const localeCookie = context.req.cookies._locale;

  // Solo aplica la redirección si la cookie contiene un idioma soportado y distinto del actual.
  if (localeCookie && SUPPORTED_LOCALES.has(localeCookie) && locale !== localeCookie) {
    try {
      const token = await getTimedToken();
      const blogPost = await getBlogPostBySlug(normalizedSlug, token, locale);

      if (blogPost) {
        const translatedBlogPost = await getBlogPostById(blogPost.id_noticia, localeCookie, token);

        const normalizedTranslatedSlug = normalizeBlogSlug(translatedBlogPost?.slug);
        if (
          isValidTranslatedPost(translatedBlogPost, localeCookie, blogPost.id_noticia) &&
          normalizedTranslatedSlug !== null
        ) {
          return {
            redirect: {
              destination: `${buildLocalizedBlogPath(localeCookie, normalizedTranslatedSlug)}${getQuerySuffix(context.resolvedUrl)}`,
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
