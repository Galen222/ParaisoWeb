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

// Mensajes de traducción
import esMessages from "../../locales/es/common.json";
import enMessages from "../../locales/en/common.json";
import deMessages from "../../locales/de/common.json";

// Servicios
import { BlogPost } from "../../services/blogService";

// Funciones reutilizables
import { redirectByCookieSlug } from "../../utils/redirectByCookieSlug";
import { loadBlogData } from "../../services/blogLoader";

// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

// Base URL para las imágenes del blog
const IMAGE_BASE_URL = "/images/blog/";

/**
 * Props para el componente BlogDetailsPage.
 * @typedef {Object} BlogDetailsPageProps
 * @property {BlogPost | null} blogDetails - Detalles de la publicación del blog.
 * @property {string | null} error - Mensaje de error, si ocurre.
 */
export interface BlogDetailsPageProps {
  blogDetails: BlogPost | null;
  error: string | null;
}

/**
 * Componente para mostrar los detalles de un artículo del blog.
 *
 * @param {BlogDetailsPageProps} props - Props para el componente.
 * @returns {JSX.Element} JSX renderizado.
 */
const BlogDetailsPage: NextPage<BlogDetailsPageProps> & { pageTitleText?: string } = ({ blogDetails, error }) => {
  const intl = useIntl(); // Hook de internacionalización
  const router = useRouter(); // Hook para manejar la navegación
  const currentLocale = intl.locale || "es"; // Idioma actual con fallback a "es"
  const currentMessages = messages[currentLocale] || messages["es"]; // Mensajes en el idioma actual
  const currentUrl = useCurrentUrl(); // URL actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  // Estado para manejar la animación del botón de volver atrás
  const [isPushingBack, setIsPushingBack] = useState(false);

  // Rastreo de visitas a la página
  useVisitedPageTracking("articulo");
  useVisitedPageTrackingGA("articulo");

  // Maneja cambios de idioma basados en los detalles del blog
  useHandleLanguageChange(blogDetails);

  // Imagen predeterminada para errores
  const imageError = "/images/web/error.png";

  /**
   * Función para manejar la navegación de regreso al blog.
   * Inicia una animación antes de redirigir al usuario.
   */
  const handleBack = () => {
    setIsPushingBack(true);
    router.push("/blog");
  };

  // Título y descripción para SEO
  const previewTitle = blogDetails?.titulo
    ? `Paraíso Del Jamón - ${blogDetails.titulo.slice(0, 50)}...`
    : intl.formatMessage({ id: "blog_Details_SEO_Titulo_Preview" });

  const previewContent = blogDetails?.contenido
    ? `${blogDetails.contenido.slice(0, 150)}...`
    : intl.formatMessage({ id: "blog_Details_SEO_Contenido_Preview" });

  return (
    <>
      {/* Configuración de SEO */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={previewTitle}
        description={previewContent}
        openGraph={{
          title: previewTitle,
          description: previewContent,
          url: currentUrl,
          images: blogDetails?.imagen_url
            ? [
                {
                  url: `${IMAGE_BASE_URL}${blogDetails.imagen_url}`,
                  alt: previewTitle,
                },
              ]
            : [],
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
      {/* Contenido principal */}
      {!error ? (
        <div className={styles.blogDetailsContainer}>
          {/* Detalles del blog */}
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
              {/* Imagen principal */}
              {blogDetails.imagen_url && (
                <div className="mt-25p">
                  <img src={`${IMAGE_BASE_URL}${blogDetails.imagen_url}`} alt={blogDetails.titulo} className={styles.blogImage} />
                </div>
              )}
              {/* Contenido del blog */}
              <div className={`mt-25p ${styles.blogText}`}>
                <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
              </div>
              {/* Imagen secundaria */}
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
              {/* Botón de desplazamiento hacia arriba */}
              <ScrollToTopButton />
            </div>
          )}
        </div>
      ) : (
        <div className={errorStyles.errorContainer}>
          {/* Mensaje de error obtenido desde la internacionalización */}
          <h3 className={errorStyles.errorText}>{intl.formatMessage({ id: "blog_Details_Error" })}</h3>
          <div className={errorStyles.imageContainer}>
            <img src={imageError} alt="Error" />
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Función `getServerSideProps` para obtener los datos del blog o manejar redirecciones según idioma.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<GetServerSidePropsResult<BlogDetailsPageProps>>} Props o redirección.
 */
export const getServerSideProps: GetServerSideProps<BlogDetailsPageProps> = async (context): Promise<GetServerSidePropsResult<BlogDetailsPageProps>> => {
  const { slug } = context.params!;
  const locale = context.locale || "es";

  // Intentar redirigir basado en la cookie de idioma
  const cookieRedirect = await redirectByCookieSlug(context);
  if (cookieRedirect) {
    return {
      redirect: cookieRedirect.redirect, // Esto asegura que siempre devuelvas el formato correcto.
    };
  }

  // Cargar los datos del artículo del blog
  const blogData = await loadBlogData(slug as string, locale);

  if (blogData.redirect) {
    return {
      redirect: blogData.redirect, // Similar, aseguramos que 'redirect' no sea undefined.
    };
  }

  return {
    props: {
      blogDetails: blogData.blogDetails || null,
      error: blogData.error || null,
    },
  };
};

export default BlogDetailsPage;
