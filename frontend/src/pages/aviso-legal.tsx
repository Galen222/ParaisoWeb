import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/aviso-legal.module.css";

const AvisoLegalPage = () => {
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  useVisitedPageTracking("aviso-legal");

  return (
    <div className="container2">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "avisoLegal_Principal_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "avisoLegal_DatosIdentificativos_Titulo" })}</h3>
        <ul className={styles.listas}>
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
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

export default AvisoLegalPage;
