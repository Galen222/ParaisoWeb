import React from "react";
import Link from "next/link";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Loader from "../components/Loader";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import { useFetchBlog } from "../hooks/useFetchBlog";
import errorStyles from "../styles/pages/error.module.css";
import styles from "../styles/pages/blog.module.css";
import { useIntl } from "react-intl"; // Hook para internacionalización
import { NextSeo, OrganizationJsonLd } from "next-seo"; // Importa NextSeo para configuraciones de SEO
import { redirectByCookie } from "../utils/redirectByCookie"; // Importa la función de redirección
import getSEOConfig from "../next-seo.config";
import useCurrentUrl from "../hooks/useCurrentUrl";
// Importa los mensajes de traducción
import esMessages from "../locales/es/common.json";
import enMessages from "../locales/en/common.json";
import deMessages from "../locales/de/common.json";
// Mapea los locales a sus respectivos mensajes
const messages: Record<string, Record<string, string>> = {
  es: esMessages,
  en: enMessages,
  de: deMessages,
};

/**
 * Tipo de componente para `BlogPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type BlogPageComponent = NextPage & { pageTitleText?: string };

// Define la ruta base de las imágenes
const IMAGE_BASE_URL = "/images/blog/";

/**
 * Componente funcional para la página del blog.
 * Muestra una lista de publicaciones del blog en formato de tarjetas enlazadas a sus detalles.
 *
 * @returns {JSX.Element} Página del Blog.
 */
const BlogPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl();
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];
  const currentUrl = useCurrentUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  // Hook para obtener las publicaciones del blog
  const { data: blogs, loading: loadingBlog, error } = useFetchBlog();

  // Seguimiento de la visita a la página "blog" para análisis interno y Google Analytics
  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  // Ruta de la imagen de error
  const imageError = "/images/web/error.png";

  return (
    <div className={styles.blogContainer}>
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "blog_SEO_Titulo" })}
        description={intl.formatMessage({ id: "blog_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "blog_SEO_Titulo" }),
          description: intl.formatMessage({ id: "blog_SEO_Descripcion" }),
          locale: currentUrl,
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
      {!loadingBlog && !error && (
        <div>
          <h1 className="ti-20p texto">{intl.formatMessage({ id: "blog_Texto" })}</h1>
        </div>
      )}
      <div className={styles.content}>
        {loadingBlog && (
          // Muestra el Loader mientras se cargan las publicaciones del blog
          <div className={styles.loaderContainer}>
            <Loader className="BD" />
          </div>
        )}

        {error && (
          // Manejo general de errores
          <div className={errorStyles.errorContainer}>
            <p className={errorStyles.errorText}>{intl.formatMessage({ id: "blog_Error" })}</p>
            <div className={errorStyles.imageContainer}>
              <img src={imageError} alt="Error" />
            </div>
          </div>
        )}

        {!loadingBlog &&
          !error &&
          blogs &&
          // Renderiza las tarjetas de las publicaciones del blog
          blogs.map((blog) => (
            <Link className={styles.blogLink} href={`/blog/${blog.slug}`} key={blog.id_noticia} passHref>
              <div className={styles.blogCard}>
                <div className={styles.imageContainer}>
                  <img src={`${IMAGE_BASE_URL}${blog.imagen_url}`} alt={blog.titulo} className={styles.blogImage} />
                </div>
                <div className={styles.blogText}>
                  <p>{blog.titulo}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
      {!loadingBlog && !error && <ScrollToTopButton />} {/* Muestra el botón solo si no está cargando ni hay error */}
    </div>
  );
};

// Asigna un texto de título de página específico (si es necesario para otras funcionalidades)
BlogPage.pageTitleText = "blog";

/**
 * Función `getServerSideProps` para manejar la redirección basada en cookies.
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

export default BlogPage; // Exporta el componente para su uso en la aplicación
