// pages/blog.tsx

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
import { useIntl } from "react-intl";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import { redirectByCookie } from "../utils/redirectByCookie";
import getSEOConfig from "../config/next-seo.config";
import useCurrentUrl from "../hooks/useCurrentUrl";
import { usePagination } from "../hooks/usePagination";
import { Paginator } from "../components/Paginator";
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

/**
 * Define la ruta base de las imágenes del blog y error
 */
const IMAGE_BASE_URL = "/images/blog/";
const imageError = "/images/web/error.png";

/**
 * Componente funcional para la página del blog.
 * Muestra una lista paginada de publicaciones del blog en formato de tarjetas enlazadas a sus detalles.
 *
 * @returns {JSX.Element} Página del Blog.
 */
const BlogPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  // Hooks de internacionalización y URL
  const intl = useIntl();
  const currentLocale = intl.locale || "es";
  const currentMessages = messages[currentLocale] || messages["es"];
  const currentUrl = useCurrentUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";

  // Hook para obtener las publicaciones del blog
  const { data: blogs, loading: loadingBlog, error } = useFetchBlog();

  // Aseguro que blogs sea siempre un array
  const safeBlogs = blogs || [];

  // Hook de paginación para los artículos del blog
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBlogs,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination({
    items: safeBlogs,
    itemsPerPage: 4,
    initialPage: 1,
  });

  // Seguimiento de la visita a la página "blog" para análisis interno y Google Analytics
  useVisitedPageTracking("blog");
  useVisitedPageTrackingGA("blog");

  return (
    <>
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
        name="Paraíso Del Jamón"
        url={currentUrl}
        logo={`${siteUrl}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 91 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />

      {/* Mensaje de error si ocurre un problema al obtener los productos*/}
      {error && (
        <div className={errorStyles.errorContainer}>
          <h3 className={errorStyles.errorText}>{intl.formatMessage({ id: "blog_Error" })}</h3>
          <div className={errorStyles.imageContainer}>
            <img src={imageError} alt="Error" />
          </div>
        </div>
      )}

      {/* Loader mientrás se accede a los artículos */}
      {loadingBlog && <Loader className="BD" />}

      {/* Contenido principal */}
      {!loadingBlog && !error && safeBlogs && (
        <div className={styles.blogContainer} id="principal">
          {/* Título y descripción */}
          <div>
            <h1 className="text-center">{intl.formatMessage({ id: "blog_Titulo" })}</h1>
          </div>
          <div className="mt-25p">
            <p className="ti-20p">{intl.formatMessage({ id: "blog_Texto" })}</p>
          </div>

          {/* Contenido  */}
          <div className={styles.content}>
            {paginatedBlogs.map((blog) => (
              <Link className={styles.blogLink} href={`/blog/${blog.slug}`} key={blog.id_noticia} passHref>
                <div className={styles.blogCard}>
                  <div className={styles.imageContainer}>
                    <img src={`${IMAGE_BASE_URL}${blog.imagen_url}`} alt={blog.titulo} className={styles.blogImage} />
                  </div>
                  <div className={styles.blogText}>
                    <h3>{blog.titulo}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginador de los productos */}
          {paginatedBlogs.length > 0 && (
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onFirstPage={goToFirstPage}
              onLastPage={goToLastPage}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          )}

          {/* Boton de scroll arriba */}
          <ScrollToTopButton />
        </div>
      )}
    </>
  );
};

// Define `pageTitleText` como una propiedad estática del componente
BlogPage.pageTitleText = "blog";

/**
 * Función `getServerSideProps` para manejar la redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de Next.js que contiene información de la solicitud.
 * @returns {Promise<GetServerSidePropsResult<{}>>} Redirección o props vacíos.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies si es necesario
  const redirectResponse = redirectByCookie(context, "/blog");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default BlogPage; // Exporta el componente para su uso en la aplicación
