// pages/charcuteria.tsx

import React, { useState, useEffect } from "react";
import type { NextPage, GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { useIntl } from "react-intl";
import Loader from "../components/Loader";
import { useFetchCharcuteria } from "../hooks/useFetchCharcuteria";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import ScrollToTopButton from "../components/ScrollToTopButton";
import errorStyles from "../styles/pages/error.module.css";
import styles from "../styles/pages/charcuteria.module.css";
import { NextSeo, OrganizationJsonLd } from "next-seo";
import getSEOConfig from "../config/next-seo.config";
import { redirectByCookie } from "../utils/redirectByCookie";
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
 * Tipo de componente para `CharcuteriaPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type CharcuteriaPageComponent = NextPage & { pageTitleText?: string };

/**
 * URL base para las imágenes de charcutería y error.
 */
const IMAGE_BASE_URL = "/images/charcuteria/";
const errorImage = "/images/web/error.png";

/**
 * Componente de la página de Charcutería.
 * Muestra una lista paginada de productos de charcutería con imágenes y descripciones.
 *
 * @returns {JSX.Element} Elemento JSX de la página.
 */
const CharcuteriaPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  // Hooks de internacionalización y URL
  const intl = useIntl();
  const currentUrl = useCurrentUrl();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es";
  const currentMessages = messages[currentLocale] || messages["es"];

  // Hook para obtener los datos de charcutería y estados de carga
  const { data: products, loading: loadingProducts, error } = useFetchCharcuteria();

  // Aseguro que products sea siempre un array
  const safeProducts = products || [];

  // Configuración de la paginación
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = usePagination({
    items: safeProducts,
    itemsPerPage: 6,
    initialPage: 1,
  });

  // Estado para el control de flip en dispositivos móviles
  const [isClickFlipEnabled, setIsClickFlipEnabled] = useState<boolean>(false);

  /**
   * Efecto que habilita el flip de las tarjetas si el ancho de la ventana es menor o igual a 800px.
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Establece el estado inicial
      setIsClickFlipEnabled(window.innerWidth <= 800);

      /**
       * Función para manejar el evento de redimensionamiento de la ventana.
       */
      const handleResize = () => {
        setIsClickFlipEnabled(window.innerWidth <= 800);
      };

      // Añade el event listener para el redimensionamiento
      window.addEventListener("resize", handleResize);

      // Limpia el event listener al desmontar el componente
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Seguimiento de la visita a la página "charcuteria" para análisis interno y Google Analytics
  useVisitedPageTracking("charcuteria");
  useVisitedPageTrackingGA("charcuteria");

  return (
    <>
      {/* Configuración de SEO específica de la página */}
      <NextSeo
        {...getSEOConfig(currentLocale, currentMessages)}
        title={intl.formatMessage({ id: "charcuteria_SEO_Titulo" })}
        description={intl.formatMessage({ id: "charcuteria_SEO_Descripcion" })}
        openGraph={{
          title: intl.formatMessage({ id: "charcuteria_SEO_Titulo" }),
          description: intl.formatMessage({ id: "charcuteria_SEO_Descripcion" }),
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
          <h3 className={errorStyles.errorText}>{error}</h3>
          <div className={errorStyles.imageContainer}>
            <img src={errorImage} alt="Error" />
          </div>
        </div>
      )}

      {/* Loader mientrás se accede a los productos */}
      {loadingProducts && <Loader className="BD" />}

      {/* Contenido principal */}
      {!loadingProducts && !error && safeProducts && (
        <div className={styles.charcuteriaContainer} id="principal">
          {/* Título y descripción */}
          <div>
            <h1 className="text-center">{intl.formatMessage({ id: "charcuteria_Titulo" })}</h1>
          </div>
          <div className="mt-25p">
            <p className="ti-20p">{intl.formatMessage({ id: "charcuteria_Texto" })}</p>
          </div>

          {/* Contenido  */}
          <div className={styles.content}>
            {/* Mapeo de los productos de charcutería en tarjetas */}
            {paginatedProducts.map((product) => (
              <div className={styles.card} key={product.id_producto}>
                <div
                  className={styles.cardInner}
                  onClick={(e) => {
                    // Habilita el flip al hacer clic solo en dispositivos pequeños
                    if (isClickFlipEnabled) {
                      const target = e.currentTarget as HTMLElement;
                      target.style.transform = target.style.transform === "rotateY(180deg)" ? "rotateY(0deg)" : "rotateY(180deg)";
                    }
                  }}
                >
                  {/* Lado frontal de la tarjeta con imagen y nombre del producto */}
                  <div className={styles.front}>
                    <img src={`${IMAGE_BASE_URL}${product.imagen_url}`} alt={product.nombre} className={styles.productImage} />
                    <div className={styles.textOverlay}>
                      <h3 className={styles.frontProductName}>{product.nombre}</h3>
                      {product.categoria && <h3 className={styles.frontCategory}>{product.categoria}</h3>}
                    </div>
                  </div>
                  {/* Lado posterior de la tarjeta con descripción del producto */}
                  <div className={styles.back}>
                    <div>
                      <h3 className={styles.backProductName}>{product.nombre}</h3>
                      {product.categoria && <h3 className={styles.backCategory}>{product.categoria}</h3>}
                      <p className={styles.descripcion}>{product.descripcion}</p>
                      <h3 className={styles.empresa}>{product.empresa}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginador de los productos */}
          {paginatedProducts.length > 0 && (
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
CharcuteriaPage.pageTitleText = "charcuteria";

/**
 * Obtiene las propiedades del servidor para la página de Charcutería.
 * Aplica redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<{ props: {} } | { redirect: { destination: string, permanent: boolean } }>} Propiedades o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies si es necesario
  const redirectResponse = redirectByCookie(context, "/charcuteria");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default CharcuteriaPage; // Exporta el componente para su uso en la aplicación
