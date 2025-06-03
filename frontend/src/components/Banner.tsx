// components/Banner.tsx

import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/components/Banner.module.css";
import { getBannerContent } from "../utils/bannersData";

/**
 * Propiedades para el componente Banner.
 * @property {"restaurantes" | "gastronomia" | "charcuteria" | "nosotros" | "empleo"} bannerType - Tipo de banner a mostrar.
 * Cada tipo representa una sección diferente con contenido específico.
 */
export interface BannerProps {
  bannerType: "restaurantes" | "gastronomia" | "charcuteria" | "nosotros" | "empleo" | "empleoTemp";
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
const Banner: React.FC<BannerProps> = ({ bannerType }: BannerProps): JSX.Element => {
  // `intl` es una instancia del hook useIntl, utilizado para obtener mensajes localizados.
  const intl = useIntl();

  // Obtiene el contenido del banner desde la función de utils.
  const bannerContent = getBannerContent(intl);

  // Extrae el contenido correspondiente al tipo de banner especificado en las props
  const content = bannerContent[bannerType];

  // Construye las clases para el contenedor combinando .Container y la clase específica del tipo de banner
  const containerClasses = `${styles.Container} ${styles[`${bannerType}Container`]}`;

  // Construye las clases para FrameContent incluyendo Size y reverse
  const frameContentClasses = `${styles.FrameContent} ${content.reverse ? styles.reverse : ""} ${content.reverseMobile ? styles.reverseMobile : ""} ${
    styles[`FrameContentSize${content.size}`]
  }`;

  // Construye las clases para Buttons
  const buttonsClasses = `${styles.buttonsSection} ${styles[`buttons${content.buttons}`]}`;

  return (
    <div className={containerClasses}>
      <div className={frameContentClasses}>
        {/* Sección de texto que incluye el título y el texto destacado */}
        <div className={styles.textSection}>
          <h2 className={styles.text}>{content.text}</h2>
          <h3 className={styles.highlightText}>{content.highlightText}</h3>
        </div>
        {/* Sección de botones que enlaza a las páginas relacionadas */}
        <div className={buttonsClasses}>
          {content.links.map((link, index) => (
            <Link key={index} href={link.href} passHref>
              <button className={`btn btn-primary mx-auto ${styles.button}`}>{link.text}</button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
