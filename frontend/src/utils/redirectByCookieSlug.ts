// utils/redirectByCookieSlug.ts

import axios from "axios";
import { GetServerSidePropsContext } from "next";
import type { AppLogger } from "../logging/appLogger";
import { clientLogger } from "../logging/clientLogger";
import { BlogPost, getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";
import { isSameRequestHost } from "./requestHost";
import { normalizeBlogSlug } from "./blogSlug";
import { buildLocalizedBlogPath } from "./blogPath";
import { getBlogFallbackLocales, selectUniqueBlogFallbackPost } from "./blogLocaleFallback";
import { LOCALE_COOKIE_NAME } from "./localeCookie";

const DEFAULT_LOCALE = "es";
const SUPPORTED_LOCALES = new Set(["es", "en", "de", "fr"]);

/** Obtiene el idioma de una ruta; las rutas sin prefijo corresponden al español por defecto. */
const getLocaleFromPath = (pathname: string): string => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? firstSegment : DEFAULT_LOCALE;
};

/** Obtiene el slug canónico de una ruta de detalle del blog. */
const getBlogDetailsSlugFromPath = (pathname: string): string | null => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && SUPPORTED_LOCALES.has(segments[0])) {
    segments.shift();
  }

  if (segments.length !== 2 || segments[0] !== "blog") {
    return null;
  }

  try {
    return normalizeBlogSlug(decodeURIComponent(segments[1]));
  } catch {
    return null;
  }
};

interface BlogRefererCandidate {
  locale: string;
  slug: string;
}

/**
 * Detecta una posible navegación manual entre traducciones sin asumir que cualquier
 * artículo en otro idioma representa la misma noticia.
 */
const getBlogRefererCandidate = (
  context: GetServerSidePropsContext,
  locale: string
): BlogRefererCandidate | null => {
  const referer = context.req.headers.referer;
  if (!referer) {
    return null;
  }

  try {
    const refererUrl = new URL(referer);
    const refererLocale = getLocaleFromPath(refererUrl.pathname);
    const refererSlug = getBlogDetailsSlugFromPath(refererUrl.pathname);

    if (
      !isSameRequestHost(refererUrl, context.req.headers) ||
      refererLocale === locale ||
      refererSlug === null
    ) {
      return null;
    }

    return { locale: refererLocale, slug: refererSlug };
  } catch {
    return null;
  }
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


/** Localiza la noticia aunque el enlace conserve el slug de otro idioma. */
const findBlogPostBySlug = async (
  slug: string,
  locale: string,
  token: string
): Promise<BlogPost | null> => {
  try {
    // Una coincidencia en el idioma de la ruta siempre tiene prioridad y no es ambigua.
    return await getBlogPostBySlug(slug, token, locale);
  } catch (error: unknown) {
    if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
      throw error;
    }
  }

  const fallbackPosts: BlogPost[] = [];
  for (const fallbackLocale of getBlogFallbackLocales(locale)) {
    try {
      fallbackPosts.push(await getBlogPostBySlug(slug, token, fallbackLocale));
    } catch (error: unknown) {
      if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
        throw error;
      }
    }
  }

  // No elige arbitrariamente una noticia si dos idiomas reutilizan el mismo slug.
  return selectUniqueBlogFallbackPost(fallbackPosts);
};

/**
 * Redirige a un slug basado en la cookie de idioma si corresponde.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<{ redirect: { destination: string, permanent: boolean } } | null>} Objeto de redirección o null si no aplica.
 */
export async function redirectByCookieSlug(
  context: GetServerSidePropsContext,
  logger: AppLogger = clientLogger
): Promise<{ redirect: { destination: string; permanent: boolean } } | null> {
  const slug = context.params?.slug;
  const locale = context.locale || DEFAULT_LOCALE;

  // No se consulta la API si la ruta dinámica no contiene un slug simple y válido.
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug === null || !SUPPORTED_LOCALES.has(locale)) {
    return null;
  }

  const refererCandidate = getBlogRefererCandidate(context, locale);

  // Next.js ya expone las cookies parseadas; así no se depende de que la cabecera
  // utilice un espacio después de cada punto y coma.
  const localeCookie = context.req.cookies[LOCALE_COOKIE_NAME];

  // Solo aplica la redirección si la cookie contiene un idioma soportado y distinto del actual.
  if (localeCookie && SUPPORTED_LOCALES.has(localeCookie) && locale !== localeCookie) {
    try {
      const token = await getTimedToken();
      const blogPost = await findBlogPostBySlug(normalizedSlug, locale, token);

      if (blogPost) {
        if (refererCandidate) {
          try {
            const refererBlogPost = await getBlogPostBySlug(
              refererCandidate.slug,
              token,
              refererCandidate.locale
            );

            // Solo se omite la redirección por cookie cuando ambas rutas pertenecen
            // realmente a la misma noticia. Otro artículo en distinto idioma debe
            // seguir respetando la preferencia guardada del usuario.
            if (refererBlogPost.id_noticia === blogPost.id_noticia) {
              return null;
            }
          } catch (error: unknown) {
            if (!(axios.isAxiosError(error) && error.response?.status === 404)) {
              logger.error(
                "No se pudo confirmar el cambio manual de idioma del artículo:",
                getErrorMessageForLog(error)
              );
              return null;
            }
          }
        }

        const translatedBlogPost =
          blogPost.idioma === localeCookie
            ? blogPost
            : await getBlogPostById(blogPost.id_noticia, localeCookie, token);

        const normalizedTranslatedSlug = normalizeBlogSlug(translatedBlogPost?.slug);
        if (
          isValidTranslatedPost(translatedBlogPost, localeCookie, blogPost.id_noticia) &&
          normalizedTranslatedSlug !== null
        ) {
          return {
            redirect: {
              destination: buildLocalizedBlogPath(
                localeCookie,
                normalizedTranslatedSlug,
                getQuerySuffix(context.resolvedUrl)
              ),
              permanent: false,
            },
          };
        }

        logger.error("Redirección por cookie ignorada: la traducción recibida no es válida.");
      }
    } catch (error: unknown) {
      logger.error("Error durante la redirección basada en cookie:", getErrorMessageForLog(error));
    }
  }

  // Retorna null si no se requiere redirección
  return null;
}
