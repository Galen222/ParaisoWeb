import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import styles from "../styles/politica-privacidad.module.css";

const PoliticaPrivacidadPage = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("politica-privacidad");
  useVisitedPageTrackingGA("politica-privacidad");

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container2">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Principal_Texto3" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Titulo" })}</h3>
        <ul className={`text-left ${styles.listas}`}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_DatosIdentificativos_Punto4" })}</li>
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
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Datos_Texto_Punto1" })}</li>
        </ul>
      </div>
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
        {/* <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4" })}</p>
        <ul className={styles.listas}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto4_Punto1_Enlace" })} target="_blank">
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
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Finalidad_Texto6" })}</p> */}
      </div>
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
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Contenido_Texto2" })}</p>
      </div>
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
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto1_Punto1" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Legitimacion_Texto2" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaPrivacidad_Categorias_Texto_Punto1" })}</li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Conservacion_Texto" })}</p>
      </div>
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
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Veracidad_Texto2" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Aceptacion_Texto" })}</p>
      </div>
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
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaPrivacidad_Actualizacion_Texto" })}</p>
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

export default PoliticaPrivacidadPage;
