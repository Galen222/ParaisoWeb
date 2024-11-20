import { GetServerSidePropsContext } from "next";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";

/**
 * Redirige a un slug basado en la cookie de idioma si corresponde.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<{ redirect: { destination: string, permanent: boolean } } | null>} Objeto de redirección o null si no aplica.
 */
export async function redirectByCookieSlug(context: GetServerSidePropsContext): Promise<{ redirect: { destination: string; permanent: boolean } } | null> {
  const { slug } = context.params!;
  const locale = context.locale || "es";

  // Obtener cookies y buscar la de idioma
  const cookies = context.req.headers.cookie || "";
  const localeCookie = cookies
    .split("; ")
    .find((row) => row.startsWith("_locale="))
    ?.split("=")[1];

  // Si la cookie de idioma existe y difiere del idioma actual
  if (localeCookie && locale !== localeCookie) {
    try {
      const token = await getTimedToken();
      const blogPost = await getBlogPostBySlug(slug as string, token, locale);

      if (blogPost) {
        const translatedBlogPost = await getBlogPostById(blogPost.id_noticia, localeCookie, token);

        if (translatedBlogPost) {
          return {
            redirect: {
              destination: `/${localeCookie}/blog/${translatedBlogPost.slug}`,
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
