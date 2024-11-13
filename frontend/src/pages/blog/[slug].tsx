// pages/blog/[slug].tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Loader from "../../components/Loader";
import ShareLink from "../../components/ShareLink";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import ReactMarkdown from "react-markdown";
import { useIntl } from "react-intl";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
import { useVisitedPageTracking } from "../../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../../hooks/useTrackingGA";
import { useHandleLanguageChange } from "../../hooks/useHandleLanguageChange";
import errorStyles from "../../styles/pages/error.module.css";
import styles from "../../styles/pages/slug.module.css";
import { redirectByCookie } from "../../utils/redirectByCookie";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../../next-seo.config";
import useCurrentUrl from "../../hooks/useCurrentUrl";
// Importa los mensajes de traducción
import esMessages from "../../locales/es/common.json";
import enMessages from "../../locales/en/common.json";
import deMessages from "../../locales/de/common.json";
// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

/**
 * Tipo de componente para `BlogDetailsPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type BlogDetailsPageComponent = NextPage & { pageTitleText?: string };

const IMAGE_BASE_URL = "/images/blog/";

/**
 * Componente funcional para la página de detalles de una publicación del blog.
 * Muestra el contenido completo de una publicación específica.
 *
 * @returns {JSX.Element} Página de detalles del Blog.
 */
const BlogDetailsPage: BlogDetailsPageComponent = (): JSX.Element => {
  const intl = useIntl();
  const router = useRouter();
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];
  const currentUrl = useCurrentUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  const { slug } = router.query;
  const [isPushingBack, setIsPushingBack] = useState(false);

  // Seguimiento de la visita a la página de detalles del blog para análisis interno y Google Analytics
  useVisitedPageTracking("blog-noticia");
  useVisitedPageTrackingGA("blog-noticia");

  // Hook para obtener los detalles de la publicación del blog
  const { data: blogDetails, loadingBlogDetails, error } = useFetchBlogDetails(slug as string);

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
    ? `El Paraíso Del Jamón - ${blogDetails.titulo.slice(0, 50)}...`
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
        name="El Paraíso Del Jamón"
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
                new Date(blogDetails.fecha_actualizacion).toLocaleDateString() !== new Date(blogDetails.fecha_publicacion).toLocaleDateString() &&
                ` | ${intl.formatMessage({ id: "blog_Details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
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
          <div className="text-center mt-25p">
            <button
              className={`btn btn-outline-secondary mx-auto ${styles.backButton} ${isPushingBack ? "animate-push" : ""}`}
              onAnimationEnd={() => setIsPushingBack(false)}
              onClick={handleBack}
            >
              {intl.formatMessage({ id: "blog_Details_Boton" })}
            </button>
          </div>
          {/* Muestra el botón solo si no está cargando ni hay error */}
          {!loadingBlogDetails && !error && <ScrollToTopButton />}
        </div>
      )}
      {/* Renderiza el mensaje de error si existe */}
      {error && (
        <div className={errorStyles.errorContainer}>
          <p className={errorStyles.errorText}>{intl.formatMessage({ id: "blog_Details_Error" })}</p>
          <div className={errorStyles.imageContainer}>
            <img src={imageError} alt="Error" />
          </div>
        </div>
      )}
      {/* Muestra el Loader si está accediendo al back-end */}
      {loadingBlogDetails && (
        <div className={styles.loaderContainer}>
          <Loader className="BD" />
        </div>
      )}
    </div>
  );
};

// Asigna un texto de título de página específico (si es necesario para otras funcionalidades)
BlogDetailsPage.pageTitleText = "blog";

/**
 * Función `getServerSideProps` para la redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Redirección o props vacíos.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies si es necesario
  const redirectResponse = redirectByCookie(context, "");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default BlogDetailsPage; // Exporta el componente para su uso en la aplicación
