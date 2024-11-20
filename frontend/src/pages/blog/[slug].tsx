// pages/blog/[slug].tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import ShareLink from "../../components/ShareLink";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import ReactMarkdown from "react-markdown";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../../hooks/useTrackingGA";
import { useHandleLanguageChange } from "../../hooks/useHandleLanguageChange";
import errorStyles from "../../styles/pages/error.module.css";
import styles from "../../styles/pages/slug.module.css";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../../config/next-seo.config";
import useCurrentUrl from "../../hooks/useCurrentUrl";
// Importa los mensajes de traducción
import esMessages from "../../locales/es/common.json";
import enMessages from "../../locales/en/common.json";
import deMessages from "../../locales/de/common.json";
import { BlogPost, getBlogPostBySlug, getBlogPostById } from "../../services/blogService";
import { getTimedToken } from "../../services/tokenService";

// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

/**
 * Tipo de componente para BlogDetailsPage que incluye una propiedad opcional pageTitleText.
 */
export type BlogDetailsPageComponent = NextPage & { pageTitleText?: string };

const IMAGE_BASE_URL = "/images/blog/";

/**
 * Props para el componente BlogDetailsPage.
 * @property {BlogPost | null} blogDetails - Contiene los detalles del artículo del blog.
 * @property {string | null} error - Mensaje de error si no se puede cargar el artículo del blog.
 */
export interface BlogDetailsPageProps {
  blogDetails: BlogPost | null;
  error: string | null;
}

const BlogDetailsPage: NextPage<BlogDetailsPageProps> & { pageTitleText?: string } = ({ blogDetails, error }) => {
  const intl = useIntl();
  const router = useRouter();
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];
  const currentUrl = useCurrentUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  // Estado para manejar la animación del botón de volver atrás
  const [isPushingBack, setIsPushingBack] = useState(false);

  // Seguimiento de la visita a la página de detalles del blog para análisis interno y Google Analytics
  useVisitedPageTracking("blog-noticia");
  useVisitedPageTrackingGA("blog-noticia");

  // Maneja cambios de idioma basados en los detalles del blog
  useHandleLanguageChange(blogDetails);

  // Ruta de la imagen de error
  const imageError = "/images/web/error.png";

  /**
   * Función para manejar la navegación de regreso al blog.
   * Añade una animación antes de navegar.
   */
  const handleBack = () => {
    setIsPushingBack(true);
    router.push("/blog");
  };

  // Crea las constantes para SEO
  const previewTitle = blogDetails?.titulo
    ? `Paraíso Del Jamón - ${blogDetails.titulo.slice(0, 50)}...`
    : intl.formatMessage({ id: "blog_Details_SEO_Titulo_Preview" });

  const previewContent = blogDetails?.contenido
    ? `${blogDetails.contenido.slice(0, 150)}...`
    : intl.formatMessage({ id: "blog_Details_SEO_Contenido_Preview" });

  return (
    <div className={styles.blogDetailsContainer}>
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={previewTitle}
        description={previewContent}
        openGraph={{
          title: previewTitle,
          description: previewContent,
          url: currentUrl,
          images: [
            {
              url: `${IMAGE_BASE_URL}${blogDetails?.imagen_url}`,
              alt: previewTitle,
            },
          ],
        }}
      />
      {/* JSON-LD para Organización */}
      <OrganizationJsonLd
        type="Organization"
        id={currentUrl}
        name="Paraíso Del Jamón"
        url={currentUrl}
        logo={`${siteUrl}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* Renderiza el contenido del blog si está disponible */}
      {blogDetails && (
        <div>
          <div className="mt-25p">
            <h1 className={styles.blogTitle}>{blogDetails.titulo}</h1>
          </div>
          <div className="mt-25p">
            <p className={styles.blogAuthor}>
              {intl.formatMessage({ id: "blog_Details_Autor" })} {blogDetails.autor}
            </p>
            <p className={styles.blogDate}>
              {intl.formatMessage({ id: "blog_Details_Publicado" })} {new Date(blogDetails.fecha_publicacion).toLocaleDateString()}
              {/* Verifica si la fecha de actualización es diferente a la de publicación */}
              {blogDetails.fecha_actualizacion &&
                new Date(blogDetails.fecha_actualizacion).toLocaleDateString() !== new Date(blogDetails.fecha_publicacion).toLocaleDateString() && (
                  <>
                    {" "}
                    | {intl.formatMessage({ id: "blog_Details_Actualizado" })} {new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}
                  </>
                )}
            </p>
          </div>
          <div className="mt-25p">
            <ShareLink url={currentUrl} title={blogDetails.titulo} />
          </div>
          {/* Imagen principal del blog */}
          {blogDetails.imagen_url && (
            <div className="mt-25p">
              <img src={`${IMAGE_BASE_URL}${blogDetails.imagen_url}`} alt={blogDetails.titulo} className={styles.blogImage} />
            </div>
          )}
          {/* Contenido del blog */}
          <div className={`mt-25p ${styles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          {/* Imagen secundaria del blog, si está presente */}
          {blogDetails.imagen_url_2 && (
            <div className="mt-25p">
              <img src={`${IMAGE_BASE_URL}${blogDetails.imagen_url_2}`} alt={blogDetails.titulo} className={styles.blogImage} />
            </div>
          )}
          <div>
            <ShareLink url={currentUrl} title={blogDetails.titulo} />
          </div>
          {/* Botón de Volver Atrás */}
          <div className="text-center mt-25p">
            <button
              className={`btn btn-outline-secondary mx-auto ${styles.backButton} ${isPushingBack ? "animate-push" : ""}`}
              onAnimationEnd={() => setIsPushingBack(false)}
              onClick={handleBack}
            >
              {intl.formatMessage({ id: "blog_Details_Boton" })}
            </button>
          </div>
          {/* Muestra el botón solo si no hay error */}
          {!error && <ScrollToTopButton />}
        </div>
      )}
      {/* Renderiza el mensaje de error si existe */}
      {error && (
        <div className={errorStyles.errorContainer}>
          <p className={errorStyles.errorText}>{error}</p>
          <div className={errorStyles.imageContainer}>
            <img src={imageError} alt="Error" />
          </div>
          {/* Botón de Volver Atrás en caso de error */}
          <div className="text-center mt-25p">
            <button
              className={`btn btn-outline-secondary mx-auto ${styles.backButton} ${isPushingBack ? "animate-push" : ""}`}
              onAnimationEnd={() => setIsPushingBack(false)}
              onClick={handleBack}
            >
              {intl.formatMessage({ id: "blog_Details_Boton" })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Asigna un texto de título de página específico (si es necesario para otras funcionalidades)
BlogDetailsPage.pageTitleText = "blog";

/**
 * Función getServerSideProps para obtener los datos del artículo antes de renderizar la página.
 *
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<BlogDetailsPageProps>>} Props con los datos del artículo o error.
 */
export const getServerSideProps: GetServerSideProps<BlogDetailsPageProps> = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<BlogDetailsPageProps>> => {
  const { slug } = context.params!;
  const locale = context.locale || "es";

  try {
    const token = await getTimedToken();

    // Obtenemos el artículo en el idioma actual (locale)
    let blogDetails = await getBlogPostBySlug(slug as string, token, locale);

    // Si el idioma del artículo no coincide con el idioma actual, intentamos obtener la versión traducida
    if (blogDetails.idioma !== locale) {
      const translatedBlogPost = await getBlogPostById(blogDetails.id_noticia, locale, token);
      if (translatedBlogPost) {
        // Redirigimos al slug correspondiente en el nuevo idioma
        return {
          redirect: {
            destination: `/blog/${translatedBlogPost.slug}`,
            permanent: false,
          },
        };
      } else {
        // Si no hay traducción, podemos mostrar un mensaje de error
        return {
          props: {
            blogDetails: null,
            error: "Artículo no disponible en el idioma seleccionado",
          },
        };
      }
    }

    return {
      props: {
        blogDetails,
        error: null,
      },
    };
  } catch (err) {
    return {
      props: {
        blogDetails: null,
        error: "Error al cargar el artículo o el artículo no existe. Por favor, verifica la URL e inténtalo de nuevo.",
      },
    };
  }
};

export default BlogDetailsPage;
