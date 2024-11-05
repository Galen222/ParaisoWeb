// components/Banner.tsx

import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/components/Banner.module.css";

/**
 * Propiedades para el componente Banner.
 * @property {"restaurantes" | "gastronomia" | "charcuteria" | "nosotros" | "empleo"} bannerType - Tipo de banner a mostrar.
 * Cada tipo representa una sección diferente con contenido específico.
 */
interface BannerProps {
  bannerType: "restaurantes" | "gastronomia" | "charcuteria" | "nosotros" | "empleo";
}

/**
 * Componente Banner
 *
 * Muestra un banner específico según el tipo (`bannerType`) proporcionado en las props.
 * Cada tipo de banner tiene su propio contenido, enlaces y estilo, y puede tener una configuración
 * de inversión para el diseño en escritorio y móvil.
 *
 * @param {BannerProps} props - Propiedades para el componente Banner.
 * @returns {JSX.Element} Banner personalizado según el tipo especificado.
 */
const Banner: React.FC<BannerProps> = ({ bannerType }) => {
  // `intl` es una instancia del hook useIntl, utilizado para obtener mensajes localizados.
  const intl = useIntl();

  // Objeto que define el contenido y configuración de cada tipo de banner.
  // reverse: Intercambia secciones en modo escritorio
  // reverseMobile: Intercambia secciones en modo movil
  // Size: Tamaño del texto, texto destacado y banner
  // Buttons: colocación en modo movil dependiendo de uno o varios botones
  const bannerContent = {
    restaurantes: {
      text: intl.formatMessage({ id: "banner_Restaurantes_Texto1" }), // Texto del banner de restaurantes
      highlightText: intl.formatMessage({ id: "banner_Restaurantes_Texto2" }), // Texto destacado del banner de restaurantes
      links: [
        { href: "/san-bernardo", text: "San Bernardo" },
        { href: "/bravo-murillo", text: "Bravo Murillo" },
        { href: "/reina-victoria", text: "Reina Victoria" },
        { href: "/arenal", text: "Arenal" },
      ],
      reverse: false,
      reverseMobile: false,
      Size: "Large",
      Buttons: "Multiple",
    },
    gastronomia: {
      text: intl.formatMessage({ id: "banner_Gastronomia_Texto1" }), // Texto del banner de gastronomía
      highlightText: intl.formatMessage({ id: "banner_Gastronomia_Texto2" }), // Texto destacado del banner de gastronomía
      links: [{ href: "/gastronomia", text: intl.formatMessage({ id: "banner_Gastronomia_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
      Size: "Medium",
      Buttons: "One",
    },
    charcuteria: {
      text: intl.formatMessage({ id: "banner_Charcuteria_Texto1" }), // Texto del banner de charcutería
      highlightText: intl.formatMessage({ id: "banner_Charcuteria_Texto2" }), // Texto destacado del banner de charcutería
      links: [{ href: "/charcuteria", text: intl.formatMessage({ id: "banner_Charcuteria_Texto3" }) }],
      reverse: false,
      reverseMobile: false,
      Size: "Medium",
      Buttons: "One",
    },
    nosotros: {
      text: intl.formatMessage({ id: "banner_About_Texto1" }), // Texto del banner de "nosotros"
      highlightText: intl.formatMessage({ id: "banner_About_Texto2" }), // Texto destacado del banner de "nosotros"
      links: [{ href: "/about", text: intl.formatMessage({ id: "banner_About_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
      Size: "Small",
      Buttons: "One",
    },
    empleo: {
      text: intl.formatMessage({ id: "banner_Empleo_Texto1" }), // Texto del banner de empleo
      highlightText: intl.formatMessage({ id: "banner_Empleo_Texto2" }), // Texto destacado del banner de empleo
      links: [{ href: "/contacto", text: intl.formatMessage({ id: "banner_Empleo_Texto3" }) }],
      reverse: false,
      reverseMobile: false,
      Size: "Small",
      Buttons: "One",
    },
  };

  // Extrae el contenido correspondiente al tipo de banner especificado en las props
  const content = bannerContent[bannerType];

  // Construye las clases para el contenedor combinando .Container y la clase específica del tipo de banner
  const containerClasses = `${styles.Container} ${styles[`${bannerType}Container`]}`;

  // Construye las clases para FrameContent incluyendo Size y reverse
  const frameContentClasses = `${styles.FrameContent} ${content.reverse ? styles.reverse : ""} ${content.reverseMobile ? styles.reverseMobile : ""} ${
    styles[`Size${content.Size}`]
  }`;

  // Construye las clases para Buttons incluyendo Buttons type
  const buttonsClasses = `${styles.Buttons} ${styles[`Buttons${content.Buttons}`]}`;

  return (
    <div className={containerClasses}>
      <div className={frameContentClasses}>
        {/* Sección de texto que incluye el título y el texto destacado */}
        <div className={styles.textSection}>
          <h1 className={styles.text}>{content.text}</h1>
          <h1 className={styles.highlightText}>{content.highlightText}</h1>
        </div>

        {/* Sección de botones que enlaza a las páginas relacionadas */}
        <div className={buttonsClasses}>
          {content.links.map((link, index) => (
            <Link key={index} href={link.href} passHref>
              <button className={`btn btn-primary mx-auto ${styles.bannerButton}`}>{link.text}</button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
