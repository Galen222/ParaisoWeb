// pages/politica-cookies.tsx
import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useCookieConsent } from "../context/CookieContext";
import styles from "../styles/politica-privacidad-cookies.module.css";

const PoliticaCookies = () => {
  const intl = useIntl();
  const { cookieConsentAnalysis, setCookieConsentAnalysis, cookieConsentPersonalization, setCookieConsentPersonalization } = useCookieConsent();
  const cookiesState = cookieConsentAnalysis && cookieConsentPersonalization;
  useVisitedPageTracking("politica-privacidad-cookies");

  const deleteCookies = () => {
    if (cookieConsentAnalysis) {
      setCookieConsentAnalysis(false);
      document.cookie = "_device=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "_visited=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    if (cookieConsentPersonalization) {
      setCookieConsentPersonalization(false);
      document.cookie = "_locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  return (
    <div className="container2">
      <div>
        <h1 className="text-center">{intl.formatMessage({ id: "politicaPrivacidadCookies_Principal_Titulo" })}</h1>
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
        <div className="table-responsive">
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
              <tr>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Nombre1" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Titular1" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Finalidad1" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Duracion1" })}</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Nombre2" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Titular2" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Finalidad2" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Duracion2" })}</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Nombre3" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Titular3" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Finalidad3" })}</td>
                <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Duracion3" })}</td>
              </tr>
              {/* <tr>
              <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Nombre4" })}</td>
              <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Titular4" })}</td>
              <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Finalidad4" })}</td>
              <td>{intl.formatMessage({ id: "politicaCookies_Utilizadas_Duracion4" })}</td>
            </tr> */}
            </tbody>
          </table>
        </div>
        {/* <p className="ti-20p">
          {intl.formatMessage({ id: "politicaCookies_Utilizadas_texto1" })}
          <a className={styles.link} href={intl.formatMessage({ id: "politicaCookies_Utilizadas_texto1_Enlace" })} target="_blank">
            Google Analytics
          </a>
          .
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Utilizadas_texto2" })}</p> */}
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto1" })}</p>
        {/* <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto2" })}</p> */}
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3" })}</p>
        <ul className={styles.listas}>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto1" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto2" })}</li>
          <li>{intl.formatMessage({ id: "politicaCookies_Aceptacion_Texto3_Punto3" })}</li>
        </ul>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Denegacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Denegacion_Texto" })}</p>
      </div>
      <div className="text-center">
        <button className={`btn btn-primary mx-auto ${styles.deleteButton}`} disabled={!cookiesState} onClick={deleteCookies}>
          {intl.formatMessage({ id: "politicaCookies_BotonBorrar" })}
        </button>
      </div>
      <div className="mt-25p">
        <h3 className="mb-10p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Titulo" })}</h3>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto1" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto2" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Desactivacion_Texto3" })}</p>
        <ul className={styles.listas}>
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
        <p className="ti-20p">{intl.formatMessage({ id: "politicaCookies_Actualizacion_texto" })}</p>
      </div>
    </div>
  );
};

export default PoliticaCookies;
