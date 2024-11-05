// pages/aviso-legal.tsx

import React from "react";
import Link from "next/link";
import Loader from "../components/Loader";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/pages/aviso-legal.module.css";

/**
 * Propiedades para el componente `AvisoLegalPage`.
 * @property {boolean} loadingMessages - Indica si los mensajes están en proceso de carga.
 */
interface AvisoLegalPageProps {
  loadingMessages: boolean;
}

/**
 * Componente funcional para la página de "Aviso Legal".
 * Muestra información legal y de privacidad, incluyendo enlaces a otras políticas.
 *
 * @param {AvisoLegalPageProps} props - Propiedades para el componente `AvisoLegalPage`.
 * @returns {JSX.Element} Página de Aviso Legal.
 */
const AvisoLegalPage = ({ loadingMessages }: AvisoLegalPageProps) => {
  const intl = useIntl(); // Hook para manejar la internacionalización

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de desplazamiento hacia arriba

  // Seguimiento de la visita a la página "Aviso Legal" para análisis interno y Google Analytics
  useVisitedPageTracking("aviso-legal");
  useVisitedPageTrackingGA("aviso-legal");

  // Muestra un loader si los mensajes están en proceso de carga
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto3" })}</p>
      </div>

      {/* Datos Identificativos */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Titulo" })}</h3>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto6" })}</li>
          <li>
            {intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7" })}
            <a className={styles.link} href={`mailto:${intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7_Enlace" })}`}>
              {intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Punto7_Enlace" })}
            </a>
          </li>
        </ul>
      </div>

      {/* Secciones adicionales de contenido legal */}
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Objeto_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Objeto_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Privacidad_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Privacidad_Texto" })}
          <Link href="/politica-privacidad" className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Privacidad_Texto_Enlace" })}
          </Link>
          .
        </p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto3" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Propiedad_Texto4" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1" })}</li>
          <ul className={styles.listas2}>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_1" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_2" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_3" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto1_4" })}</li>
          </ul>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto1_Punto3" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto6" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto7" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto8" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9" })}</li>
          <ul className={styles.listas2}>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_1" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_2" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_3" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_4" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_5" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_6" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_7" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_8" })}</li>
            <li>{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto2_Punto9_9" })}</li>
          </ul>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Obligaciones_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto3_Punto4" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Responsabilidad_Texto5" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto3_Punto4" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto4" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Hipervinculos_Texto5" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Proteccion_Titulo" })}</h3>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Proteccion_Texto" })}
          <Link href="/politica-privacidad" className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Proteccion_Texto_Enlace" })}
          </Link>
          .
        </p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Cookies_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Cookies_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "avisoLegal_Cookies_Texto2" })}
          <Link href="/politica-cookies" className={styles.link}>
            {intl.formatMessage({ id: "avisoLegal_Cookies_Texto2_Enlace" })}
          </Link>
          .
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Cookies_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Declaraciones_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Declaraciones_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Fuerza_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Fuerza_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Resolucion_Texto2" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Actualizacion_Texto" })}</p>
      </div>
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

export default AvisoLegalPage; // Exporta el componente para su uso en la aplicación
