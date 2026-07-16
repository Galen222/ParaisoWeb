// pages/blog/[slug].tsx

import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage, GetServerSideProps, GetServerSidePropsResult } from "next";
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
import { formatBlogDate } from "../../utils/blogDate";
import { normalizeBlogSlug } from "../../utils/blogSlug";
import { buildLocalizedBlogPath } from "../../utils/blogPath";
import { getPublicSiteUrl } from "../../utils/publicSiteUrl";

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

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Conserva los parámetros de consulta al redirigir una variante no canónica del slug. */
const getQuerySuffix = (resolvedUrl: string): string => {
  const queryIndex = resolvedUrl.indexOf("?");
  return queryIndex >= 0 ? resolvedUrl.slice(queryIndex) : "";
};

/** Construye la URL canónica del artículo respetando que español no lleva prefijo. */
const buildCanonicalBlogPath = (locale: string, slug: string): string =>
  buildLocalizedBlogPath(locale, slug);

/** Genera metadatos compactos sin añadir puntos suspensivos a textos no truncados. */
const buildSeoPreview = (value: string, maxLength: number): string => {
  const normalizedValue = value.replace(/\s+/g, " ").trim();
  const characters = Array.from(normalizedValue);
  if (characters.length <= maxLength) {
    return normalizedValue;
  }

  return `${characters.slice(0, maxLength).join("").trimEnd()}…`;
};

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
 * @returns {React.JSX.Element} JSX renderizado.
 */
const BlogDetailsPage: NextPage<BlogDetailsPageProps> & { pageTitleText?: string } = ({ blogDetails, error }) => {
  const intl = useIntl(); // Hook de internacionalización
  const router = useRouter(); // Hook para manejar la navegación
  const currentLocale = intl.locale || "es"; // Idioma actual con fallback a "es"
  const currentMessages = messages[currentLocale] || messages["es"]; // Mensajes en el idioma actual
  const currentUrl = useCurrentUrl(); // URL actual
  const siteUrl = getPublicSiteUrl();
  const normalizedSiteUrl = siteUrl.replace(/\/+$/, "");
  const publicationDate = blogDetails ? formatBlogDate(blogDetails.fecha_publicacion, currentLocale) : "";
  const updateDate = blogDetails?.fecha_actualizacion ? formatBlogDate(blogDetails.fecha_actualizacion, currentLocale) : null;

  // Estado para manejar la animación del botón de volver atrás
  const [isPushingBack, setIsPushingBack] = useState(false);
  const isPushingBackRef = useRef(false);

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
  const handleBack = async () => {
    // Evita iniciar varias navegaciones si el usuario pulsa el botón repetidamente.
    if (isPushingBackRef.current) {
      return;
    }

    isPushingBackRef.current = true;
    setIsPushingBack(true);

    try {
      const navigationCompleted = await router.push("/blog", undefined, { locale: router.locale });

      // Si Next.js cancela la navegación, vuelve a habilitar el botón para permitir otro intento.
      if (!navigationCompleted) {
        isPushingBackRef.current = false;
        setIsPushingBack(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && error.message.trim() ? error.message : "Error desconocido";
      console.error("Error al volver al listado del blog:", errorMessage);
      isPushingBackRef.current = false;
      setIsPushingBack(false);
    }
  };

  // Título y descripción para SEO
  const previewTitle = blogDetails?.titulo
    ? `Paraíso Del Jamón - ${buildSeoPreview(blogDetails.titulo, 50)}`
    : intl.formatMessage({ id: "blog_Details_SEO_Titulo_Preview" });

  const previewContent = blogDetails?.contenido
    ? buildSeoPreview(blogDetails.contenido, 150)
    : intl.formatMessage({ id: "blog_Details_SEO_Contenido_Preview" });

  return (
    <>
      {/* Configuración de SEO */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={previewTitle}
        description={previewContent}
        noindex={Boolean(error)}
        nofollow={Boolean(error)}
        openGraph={{
          title: previewTitle,
          description: previewContent,
          url: currentUrl,
          images: blogDetails?.imagen_url
            ? [
                {
                  url: `${normalizedSiteUrl}${IMAGE_BASE_URL}${blogDetails.imagen_url.replace(/^\/+/, "")}`,
                  alt: previewTitle,
                },
              ]
            : [],
        }}
      />
      {/* JSON-LD para Organización */}
      <OrganizationJsonLd
        type="Organization"
        id={`${siteUrl.replace(/\/+$/, "")}/#organization`}
        name="Paraíso Del Jamón"
        url={siteUrl.replace(/\/+$/, "")}
        logo={`${siteUrl.replace(/\/+$/, "")}/images/navbar/imagenLogo.png`}
        contactPoint={[
          {
            telephone: "+34 91 532 83 50",
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
                  {intl.formatMessage({ id: "blog_Details_Publicado" })} {publicationDate}
                  {updateDate &&
                    updateDate !== publicationDate && (
                      <>
                        {" "}
                        | {intl.formatMessage({ id: "blog_Details_Actualizado" })} {updateDate}
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
                  onClick={() => void handleBack()}
                  disabled={isPushingBack}
                  aria-busy={isPushingBack}
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

// Asigna un texto de título de página específico (si es necesario para otras funcionalidades)
BlogDetailsPage.pageTitleText = "blog";

/**
 * Función `getServerSideProps` para obtener los datos del blog o manejar redirecciones según idioma.
 *
 * @param {GetServerSidePropsContext} context - Contexto proporcionado por Next.js.
 * @returns {Promise<GetServerSidePropsResult<BlogDetailsPageProps>>} Props o redirección.
 */
export const getServerSideProps: GetServerSideProps<BlogDetailsPageProps> = async (context): Promise<GetServerSidePropsResult<BlogDetailsPageProps>> => {
  const slug = context.params?.slug;
  const locale = context.locale || "es";

  // Una ruta dinámica incompleta o con una forma inesperada no debe llegar a los servicios de la API.
  const normalizedSlug = normalizeBlogSlug(slug);
  if (normalizedSlug === null || !SUPPORTED_LOCALES.has(locale)) {
    return { notFound: true };
  }

  // Dos representaciones Unicode pueden verse iguales pero generar URLs distintas. La
  // variante no canónica se redirige antes de consultar la API para evitar duplicados SEO.
  if (typeof slug === "string" && slug !== normalizedSlug) {
    return {
      redirect: {
        destination: `${buildCanonicalBlogPath(locale, normalizedSlug)}${getQuerySuffix(context.resolvedUrl)}`,
        permanent: true,
      },
    };
  }

  // Intentar redirigir basado en la cookie de idioma
  const cookieRedirect = await redirectByCookieSlug(context);
  if (cookieRedirect) {
    return {
      redirect: cookieRedirect.redirect, // Esto asegura que siempre devuelvas el formato correcto.
    };
  }

  // Cargar los datos del artículo del blog
  const blogData = await loadBlogData(
    normalizedSlug,
    locale,
    getQuerySuffix(context.resolvedUrl)
  );

  if (blogData.notFound) {
    return { notFound: true };
  }

  if (blogData.redirect) {
    return {
      redirect: blogData.redirect, // Similar, aseguramos que 'redirect' no sea undefined.
    };
  }

  if (blogData.error) {
    context.res.statusCode = blogData.statusCode ?? 503;
    context.res.setHeader("Cache-Control", "no-store, max-age=0");
    context.res.setHeader("Pragma", "no-cache");
  }

  return {
    props: {
      blogDetails: blogData.blogDetails || null,
      error: blogData.error || null,
    },
  };
};

export default BlogDetailsPage;
