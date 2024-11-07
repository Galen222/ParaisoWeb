// pages/contacto.tsx

import React from "react";
import type { ComponentType } from "react";
import Loader from "../components/Loader";
import Localization from "../components/Localization";
import LegalInfo from "../components/LegalInfo";
import Form from "../components/Form";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/pages/contacto.module.css";

/**
 * Propiedades para el componente `ContactPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
export interface ContactPageProps {
  loadingMessages: boolean;
}

/**
 * Tipo de componente para `ContactPage` que incluye una propiedad opcional `pageTitleText`.
 */
export type ContactPageComponent = ComponentType<ContactPageProps> & { pageTitleText?: string };

/**
 * Componente funcional para la página de Contacto.
 * Incluye información de contacto, un formulario, detalles legales y ubicaciones.
 *
 * @param {ContactPageProps} props - Propiedades para el componente `ContactPage`.
 * @returns {JSX.Element} Página de Contacto.
 */
const ContactPage: ContactPageComponent = ({ loadingMessages }: ContactPageProps) => {
  const intl = useIntl(); // Hook para la internacionalización
  const { isScrollButtonVisible, scrollButtonStyle, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll // Hook para el botón de desplazamiento hacia arriba

  // Seguimiento de la visita a la página "Contacto" para análisis interno y Google Analytics
  useVisitedPageTracking("contacto");
  useVisitedPageTrackingGA("contacto");

  /**
   * Función para manejar el envío del formulario de contacto.
   * Aquí se pueden agregar acciones adicionales tras el envío.
   */
  const handleFormSubmit = () => {
    // Aquí se pueden realizar acciones adicionales después del envío
  };

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Información introductoria de contacto */}
      <div>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto2a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto2b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto2c" })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto3a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto3b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto3c" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto4" })}</p>
      </div>

      {/* Formulario de contacto */}
      <div className={styles.formContainer}>
        <Form onSubmit={handleFormSubmit} />
      </div>

      {/* Información legal */}
      <div>
        <LegalInfo />
      </div>

      {/* Información adicional de contacto y enlaces de email */}
      <div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto4_1" })}
          <a className={styles.link} href="mailto:info@paraisodeljamon.com">
            {intl.formatMessage({ id: "contacto_texto4_enlace" })}
          </a>
          {intl.formatMessage({ id: "contacto_Texto4_2" })}
        </p>
      </div>

      {/* Localizaciones de las sedes del negocio */}
      <div>
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>

      {/* Botón de desplazamiento hacia arriba */}
      <div className="scrollToTopContainer">
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop" style={scrollButtonStyle}>
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

// Define `pageTitleText` como una propiedad estática del componente `ContactPage`
ContactPage.pageTitleText = "contacto";

export default ContactPage; // Exporta el componente para su uso en la aplicación
