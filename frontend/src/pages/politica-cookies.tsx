import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { deleteCookies } from "../utils/deleteCookies";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA, useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import useDeviceType from "../hooks/useDeviceType";
import useScrollToTop from "../hooks/useScrollToTop";
import { useCookieConsent } from "../contexts/CookieContext";
import styles from "../styles/politica-cookies.module.css";

const PoliticaCookies = () => {
  const intl = useIntl();
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  const {
    setAcceptCookieAnalysis,
    setAcceptCookieAnalysisGoogle,
    setAcceptCookiePersonalization,
    cookieConsentAnalysis,
    setCookieConsentAnalysis,
    cookieConsentAnalysisGoogle,
    setCookieConsentAnalysisGoogle,
    cookieConsentPersonalization,
    setCookieConsentPersonalization,
  } = useCookieConsent();
  const cookiesState = cookieConsentAnalysis || cookieConsentPersonalization;
  useVisitedPageTracking("politica-cookies");
  useVisitedPageTrackingGA("politica-cookies");

  // Seguimiento del botón
  const trackButtonClick = useButtonClickTrackingGA();

  const handleDeleteCookies = () => {
    trackButtonClick("Borrar Cookies");
    deleteCookies(
      intl,
      setAcceptCookiePersonalization,
      cookieConsentAnalysis,
      setAcceptCookieAnalysis,
      setCookieConsentAnalysis,
      cookieConsentAnalysisGoogle,
      setAcceptCookieAnalysisGoogle,
      setCookieConsentAnalysisGoogle,
      cookieConsentPersonalization,
      setCookieConsentPersonalization
    );
  };

  const mobileTable = (
    <table className="table table-dark table-striped-columns">
      <tbody>
        {Array.from({ length: 4 }, (_, i) => (
          <React.Fragment key={i}>
            <tr>
              <td>Nombre</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Nombre${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Titular</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Titular${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Finalidad</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Finalidad${i + 1}` })}</td>
            </tr>
            <tr>
              <td>Duración</td>
              <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Duracion${i + 1}` })}</td>
            </tr>
            {i < 3 && ( // Condición para no mostrar el separador en el último grupo
              <tr className={styles.tableSeparator}>
                <td colSpan={2}></td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  const desktopTable = (
    <table className="table table-dark table-striped-columns">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Titular</th>
          <th>Finalidad</th>
          <th>Duración</th>
        </tr>
      </thead>
      <tbody className="table-group-divider">
        {Array.from({ length: 4 }, (_, i) => i + 1).map((index) => (
          <tr key={index}>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Nombre${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Titular${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Finalidad${index}` })}</td>
            <td>{intl.formatMessage({ id: `politicaCookies_Utilizadas_Duracion${index}` })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container2">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaCookies_Principal_Titulo" })}</h1>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Principal_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Principal_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Informacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Informacion_Texto" })}</p>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Clasificacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Clasificacion1_Texto1" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion1_Texto1_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion1_Texto1_Punto2" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Clasificacion1_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Clasificacion2_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion2_Texto_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion2_Texto_Punto2" })}</li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto3" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto4" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto5" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Clasificacion3_Texto_Punto6" })}</li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Utilizadas_Titulo" })}</h3>
        <div className="table-responsive">{isMobile ? mobileTable : desktopTable}</div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "politicaCookies_Utilizadas_texto1" })}
          <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Utilizadas_texto1_Enlace" })} target="_blank">
            Google Analytics
          </a>
          .
        </p>
        {/* <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Utilizadas_texto2" })}</p> */}
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto3" })}</li>
          <li>
            {intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto4" })}
            <Link href="/politica-privacidad" className={styles.link}>
              <span>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto4_Enlace" })}</span>
            </Link>
            .
          </li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Denegacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Denegacion_Texto" })}</p>
      </div>
      <div className="text-center">
        <button className={`btn btn-primary mx-auto ${styles.deleteButton}`} disabled={!cookiesState} onClick={() => handleDeleteCookies()}>
          {intl.formatMessage({ id: "politicaCookies_BotonBorrar" })}
        </button>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3" })}</p>
        <ul className={`text-left ${styles.listas}`}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto1_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto1" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto2_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto2" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto3_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto3" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto4_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto4" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto5_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3_Punto5" })}
            </a>
          </li>
        </ul>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto4" })}</p>
        <ul className={styles.listas}>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto4_Punto1_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto4_Punto1" })}
            </a>
          </li>
          <li>
            <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto4_Punto2_Enlace" })} target="_blank">
              {intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto4_Punto2" })}
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Actualizacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Actualizacion_Texto" })}</p>
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

export default PoliticaCookies;
