// components/Banner.tsx

import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/Banner.module.css";

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
 * @component
 * @param {BannerProps} props - Propiedades para el componente Banner.
 * @returns {JSX.Element} Banner personalizado según el tipo especificado.
 */
const Banner: React.FC<BannerProps> = ({ bannerType }) => {
  // `intl` es una instancia del hook useIntl, utilizado para obtener mensajes localizados.
  const intl = useIntl();

  // Objeto que define el contenido y configuración de cada tipo de banner.
  const bannerContent = {
    restaurantes: {
      title: intl.formatMessage({ id: "banner_Restaurantes_Texto1" }), // Título del banner de restaurantes
      highlight: intl.formatMessage({ id: "banner_Restaurantes_Texto2" }), // Texto destacado del banner de restaurantes
      links: [
        { href: "/san-bernardo", text: "San Bernardo" },
        { href: "/bravo-murillo", text: "Bravo Murillo" },
        { href: "/reina-victoria", text: "Reina Victoria" },
        { href: "/arenal", text: "Arenal" },
      ],
      reverse: false,
      reverseMobile: false,
    },
    gastronomia: {
      title: intl.formatMessage({ id: "banner_Gastronomia_Texto1" }), // Título del banner de gastronomía
      highlight: intl.formatMessage({ id: "banner_Gastronomia_Texto2" }), // Texto destacado del banner de gastronomía
      links: [{ href: "/gastronomia", text: intl.formatMessage({ id: "banner_Gastronomia_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
    },
    charcuteria: {
      title: intl.formatMessage({ id: "banner_Charcuteria_Texto1" }), // Título del banner de charcutería
      highlight: intl.formatMessage({ id: "banner_Charcuteria_Texto2" }), // Texto destacado del banner de charcutería
      links: [{ href: "/charcuteria", text: intl.formatMessage({ id: "banner_Charcuteria_Texto3" }) }],
      reverse: false,
      reverseMobile: false,
    },
    nosotros: {
      title: intl.formatMessage({ id: "banner_About_Texto1" }), // Título del banner de "nosotros"
      highlight: intl.formatMessage({ id: "banner_About_Texto2" }), // Texto destacado del banner de "nosotros"
      links: [{ href: "/about", text: intl.formatMessage({ id: "banner_About_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
    },
    empleo: {
      title: intl.formatMessage({ id: "banner_Empleo_Texto1" }), // Título del banner de empleo
      highlight: intl.formatMessage({ id: "banner_Empleo_Texto2" }), // Texto destacado del banner de empleo
      links: [{ href: "/contacto", text: intl.formatMessage({ id: "banner_Empleo_Texto3" }) }],
      reverse: false,
      reverseMobile: false,
    },
  };

  // Extrae el contenido correspondiente al tipo de banner especificado en las props
  const content = bannerContent[bannerType];

  return (
    <div className={styles[`${bannerType}Container`]}>
      <div className={`${styles[`${bannerType}FrameContent`]} ${content.reverse ? styles.reverse : ""} ${content.reverseMobile ? styles.reverseMobile : ""}`}>
        {/* Sección de texto que incluye el título y el texto destacado */}
        <div className={styles[`${bannerType}TextSection`]}>
          <h1 className={styles[`${bannerType}Title`]}>{content.title}</h1>
          <h1 className={styles[`${bannerType}Highlight`]}>{content.highlight}</h1>
        </div>

        {/* Sección de botones que enlaza a las páginas relacionadas */}
        <div className={styles[`${bannerType}ButtonsSection`]}>
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
