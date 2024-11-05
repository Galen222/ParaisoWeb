// pages/politica-privacidad.tsx

import React, { useState } from "react";
import Link from "next/link";
import Loader from "../components/Loader";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/pages/politica-privacidad.module.css";

/**
 * Interfaz para las propiedades de la página de Política de Privacidad.
 */
interface PoliticaPrivacidadPageProps {
  loadingMessages: boolean;
}

/**
 * Componente que representa la página de Política de Privacidad.
 *
 * @param {PoliticaPrivacidadPageProps} props - Las propiedades del componente.
 * @param {boolean} props.loadingMessages - Indica si los mensajes están cargando.
 * @returns {JSX.Element} El componente de la página de Política de Privacidad.
 */
const PoliticaPrivacidadPage = ({ loadingMessages }: PoliticaPrivacidadPageProps) => {
  const intl = useIntl();

  /**
   * Estado para indicar si se está cargando algún proceso adicional.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Hooks para manejar la visibilidad del botón de scroll y la acción de desplazarse hacia arriba.
   */
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  /**
   * Hooks para el seguimiento de la página visitada.
   */
  useVisitedPageTracking("politica-privacidad");
  useVisitedPageTrackingGA("politica-privacidad");

  /**
   * Muestra el cargador mientras se están cargando los mensajes.
   */
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      {/* Título principal de la página */}
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h1>
      </div>

      {/* Sección principal de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto3" })}</p>
      </div>

      {/* Sección de datos identificativos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Titulo" })}</h3>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto3" })}</li>
          {/*<li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto4" })}</li> */}
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto6" })}</li>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7" })}
            <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7_Enlace" })}`}>
              {intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto7_Enlace" })}
            </a>
          </li>
        </ul>
      </div>

      {/* Sección de principios de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Principios_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Principios_Texto_Punto4" })}</li>
        </ul>
      </div>

      {/* Sección de datos personales */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto_Punto1" })}</li>
        </ul>
      </div>

      {/* Sección de derechos de los usuarios */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto1_Punto5" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto2" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_1" })}
          <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_Enlace" })}`}>
            {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_Enlace" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto3_2" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Derechos_Texto4" })}</p>
      </div>

      {/* Sección de finalidad del tratamiento de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto2_Punto1" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto2" })}</li>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto3" })}
            <Link href="/politica-cookies" className={styles.link}>
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto3_Enlace" })}
            </Link>
            .
          </li>
          {/* <li>{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto3_Punto4" })}</li> */}
        </ul>
        {/* 
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4" })}</p>
        <ul className={styles.listas}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto2_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto2" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto3_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto3" })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto5" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto6" })}</p> 
        */}
      </div>

      {/* Sección de seguridad de los datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_1" })}
          <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_2_Enlace" })} target="_blank">
            {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_2" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Seguridad_Texto2_3" })}
        </p>
      </div>

      {/* Sección de contenido de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto2" })}</p>
      </div>

      {/* Sección de política de cookies */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_1" })}
          <Link href="/politica-cookies" className={styles.link}>
            {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_2" })}
          </Link>
          {intl.formatMessage({ id: "politicaPrivacidad_PoliticaCookies_Texto2_3" })}
        </p>
      </div>

      {/* Sección de legitimación para el tratamiento de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1_Punto1" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto2" })}</p>
      </div>

      {/* Sección de categorías de datos personales */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto_Punto1" })}</li>
        </ul>
      </div>

      {/* Sección de conservación de datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Texto" })}</p>
      </div>

      {/* Sección de destinatarios de los datos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Titulo" })}</h3>
        <ul className={styles.listas}>
          <li>
            {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_1" })}
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_2_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_2" })}
            </a>
            {intl.formatMessage({ id: "politicaPrivacidad_Destinatarios_Punto1_3" })}
          </li>
        </ul>
      </div>

      {/* Sección de navegación y uso de cookies */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2_Punto1_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto2_Punto1" })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Navegacion_Texto3" })}</p>
      </div>

      {/* Sección de veracidad de la información */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto2" })}</p>
      </div>

      {/* Sección de aceptación de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Texto" })}</p>
      </div>

      {/* Sección de revocabilidad del consentimiento */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_1" })}
          <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_Enlace" })}`}>
            {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_Enlace" })}
          </a>
          {intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto1_2" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Revocabilidad_Texto2" })}</p>
      </div>

      {/* Sección de actualización de la política de privacidad */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Texto" })}</p>
      </div>

      {/* Botón para desplazarse hacia arriba */}
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollToTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PoliticaPrivacidadPage;
