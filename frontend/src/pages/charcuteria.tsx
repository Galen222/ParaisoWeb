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
import { redirectByCookie } from "../utils/redirectByCookie"; // Importa la función de redirección
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
 * Tipo del componente que incluye `pageTitleText` como propiedad estática.
 */
export type CharcuteriaPageComponent = NextPage & { pageTitleText?: string };

/**
 * URL base para las imágenes de charcutería.
 */
const IMAGE_BASE_URL = "/images/charcuteria/";

/**
 * Componente de la página de Charcutería.
 *
 * @returns {JSX.Element} Elemento JSX de la página.
 */
const CharcuteriaPage: NextPage & { pageTitleText?: string } = (): JSX.Element => {
  const intl = useIntl(); // Hook de internacionalización para acceder a las funciones de traducción
  const currentUrl = useCurrentUrl(); // Hook para obtener la página web actual
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.paraisodeljamon.com";
  const currentLocale = intl.locale || "es"; // Fallback a 'es' si no está definido
  const currentMessages = messages[currentLocale] || messages["es"];
  const { data: products, loading: loadingProducts, error } = useFetchCharcuteria();

  // Seguimiento de la visita a la página "charcuteria" para analítica
  useVisitedPageTracking("charcuteria");
  useVisitedPageTrackingGA("charcuteria");

  /**
   * Estado para determinar si el flip de las tarjetas está habilitado basado en el ancho de la ventana.
   *
   * @type {[boolean, Function]}
   */
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

  /**
   * URL de la imagen de error a mostrar en caso de fallo en la carga de productos.
   */
  const imageError = "/images/web/error.png";

  /**
   * Renderiza un mensaje de error si ocurre un problema al obtener los productos.
   */
  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <h2 className={errorStyles.errorText}>{error}</h2>
        <div className={errorStyles.imageContainer}>
          <img src={imageError} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.charcuteriaContainer}>
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
            telephone: "+34 532 83 50",
            email: "info@paraisodeljamon.com",
          },
        ]}
      />
      {/* Renderizado condicional del encabezado */}
      {!loadingProducts && products && (
        <div>
          <div>
            <h1 className="text-center">{intl.formatMessage({ id: "charcuteria_Titulo" })}</h1>
          </div>
          <div className="mt-25p">
            <p className="ti-20p">{intl.formatMessage({ id: "charcuteria_Texto" })}</p>
          </div>
        </div>
      )}
      <div className={styles.content}>
        {/* Mapeo de los productos de charcutería en tarjetas */}
        {products?.map((product) => (
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

      {/* Mostrar el loader mientras se cargan los productos */}
      {loadingProducts && <Loader className="BD" />}
      <ScrollToTopButton />
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `CharcuteriaPage`
CharcuteriaPage.pageTitleText = "charcuteria";

/**
 * Obtiene las propiedades del servidor para la página de Charcutería.
 * Aplica redirección basada en cookies.
 *
 * @param {GetServerSidePropsContext} context - Contexto de la página de Next.js.
 * @returns {Promise<{ props: {} } | { redirect: { destination: string, permanent: boolean } }>} Propiedades o redirección.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
  // Aplicar redirección basada en cookies
  const redirectResponse = redirectByCookie(context, "/charcuteria");
  if (redirectResponse.redirect) {
    return redirectResponse;
  }

  return {
    props: {},
  };
};

export default CharcuteriaPage;
