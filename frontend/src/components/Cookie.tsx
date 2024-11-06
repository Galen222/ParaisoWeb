// components/Cookie.tsx

import React, { useState } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useCookieConsent } from "../contexts/CookieContext";
import styles from "../styles/components/Cookie.module.css";
import { useToastMessage } from "../hooks/useToast";

/**
 * Propiedades para el componente Cookie.
 * @property {function} onAccept - Función que se ejecuta al aceptar las cookies seleccionadas.
 * @property {function} onAcceptAll - Función que se ejecuta al aceptar todas las cookies.
 * @property {function} onDeclineAll - Función que se ejecuta al rechazar todas las cookies.
 * @property {function} onCookiesPolicyLinkClick - Función que se ejecuta al hacer clic en el enlace de la política de cookies.
 * @property {function} onPrivacyPolicyLinkClick - Función que se ejecuta al hacer clic en el enlace de la política de privacidad.
 */
export interface CookieProps {
  onAccept: () => void;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  onCookiesPolicyLinkClick: () => void;
  onPrivacyPolicyLinkClick: () => void;
}

/**
 * Componente Cookie
 *
 * Muestra un modal para la aceptación, personalización o rechazo de cookies.
 * Permite a los usuarios personalizar sus preferencias de cookies y muestra notificaciones (toast) según la acción realizada.
 *
 * @param {CookieProps} props - Propiedades del componente Cookie.
 * @returns {JSX.Element} Modal de preferencias de cookies.
 */
const Cookie: React.FC<CookieProps> = ({ onAccept, onAcceptAll, onDeclineAll, onCookiesPolicyLinkClick, onPrivacyPolicyLinkClick }) => {
  const intl = useIntl();
  const [isCustomizing, setIsCustomizing] = useState(false); // Estado para manejar si se están personalizando las cookies

  // Obtiene y maneja el estado de consentimiento de cookies del contexto
  const {
    AcceptCookieAnalysis,
    setAcceptCookieAnalysis,
    AcceptCookieAnalysisGoogle,
    setAcceptCookieAnalysisGoogle,
    AcceptCookiePersonalization,
    setAcceptCookiePersonalization,
  } = useCookieConsent();

  const { showToast } = useToastMessage(); // Utiliza el hook para mostrar las notificaciones

  /**
   * Maneja el cambio de estado para la cookie de personalización.
   */
  const handleAcceptCookiePersonalizationChange = () => {
    setAcceptCookiePersonalization(!AcceptCookiePersonalization);
  };

  /**
   * Maneja el cambio de estado para la cookie de análisis.
   */
  const handleAcceptCookieAnalysisChange = () => {
    setAcceptCookieAnalysis(!AcceptCookieAnalysis);
  };

  /**
   * Maneja el cambio de estado para la cookie de análisis de Google.
   */
  const handleAcceptCookieAnalysisGoogleChange = () => {
    setAcceptCookieAnalysisGoogle(!AcceptCookieAnalysisGoogle);
  };

  /**
   * Verifica si todas las opciones de cookies están deshabilitadas, lo cual permitiría desactivar el botón de aceptar.
   * @returns {boolean} Verdadero si todas las cookies están deshabilitadas, falso de lo contrario.
   */
  const checkCookiesState = () => {
    return !(AcceptCookieAnalysis || AcceptCookieAnalysisGoogle || AcceptCookiePersonalization);
  };

  /**
   * Maneja la aceptación de las cookies personalizadas y muestra el toast correspondiente.
   */
  const handleAccept = () => {
    onAccept();
    showToast("app_CookieAccept", 2000, "success"); // Muestra el toast utilizando el hook
  };

  /**
   * Maneja la aceptación de todas las cookies y muestra el toast correspondiente.
   */
  const handleAcceptAll = () => {
    onAcceptAll();
    showToast("app_CookieAcceptAll", 2000, "success"); // Muestra el toast utilizando el hook
  };

  /**
   * Maneja el rechazo de todas las cookies y muestra el toast correspondiente.
   */
  const handleDeclineAll = () => {
    onDeclineAll();
    showToast("app_CookieDenied", 2000, "success"); // Muestra el toast utilizando el hook
  };

  /**
   * Activa la vista de personalización de cookies.
   */
  const handleCustomize = () => {
    setIsCustomizing(true);
  };

  return (
    <div className={styles.cookieModalBackdrop}>
      <div className={styles.cookieModal}>
        <p className="fs-16p fw-bold">{intl.formatMessage({ id: "cookie_Texto1" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto2" })}</p>

        {/* Sección de personalización de cookies si se está en modo de personalización */}
        {isCustomizing && (
          <div className={styles.switchContainer}>
            <div className={styles.switch}>
              <input
                type="checkbox"
                role="checkbox"
                id="cookiePersonalization"
                name="cookiePersonalization"
                checked={AcceptCookiePersonalization}
                onChange={handleAcceptCookiePersonalizationChange}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.slider} onClick={handleAcceptCookiePersonalizationChange}></span>
              <span>
                {intl.formatMessage({
                  id: "cookie_AceptarPersonalizacion",
                })}
              </span>
            </div>
            <div className={styles.switch}>
              <input
                type="checkbox"
                role="checkbox"
                id="cookieAnalysis"
                name="cookieAnalysis"
                checked={AcceptCookieAnalysis}
                onChange={handleAcceptCookieAnalysisChange}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.slider} onClick={handleAcceptCookieAnalysisChange}></span>
              <span>{intl.formatMessage({ id: "cookie_AceptarAnalisis" })}</span>
            </div>
            <div className={styles.switch}>
              <input
                type="checkbox"
                role="checkbox"
                id="cookieAnalysisGoogle"
                name="cookieAnalysisGoogle"
                checked={AcceptCookieAnalysisGoogle}
                onChange={handleAcceptCookieAnalysisGoogleChange}
                className={styles.hiddenCheckbox}
              />
              <span className={styles.slider} onClick={handleAcceptCookieAnalysisGoogleChange}></span>
              <span>
                {intl.formatMessage({
                  id: "cookie_AceptarAnalisisGoogle",
                })}
              </span>
            </div>
          </div>
        )}

        {/* Botones para aceptar, rechazar o personalizar las cookies */}
        <div className={styles.buttonContainer}>
          <button className={`btn btn-primary ${styles.cancelButton}`} onClick={handleDeclineAll}>
            {intl.formatMessage({ id: "cookie_BotonRechazarTodo" })}
          </button>
          {!isCustomizing && (
            <button className={`btn btn-primary ${styles.acceptButton}`} onClick={handleCustomize}>
              {intl.formatMessage({ id: "cookie_BotonPersonalizar" })}
            </button>
          )}
          {isCustomizing && (
            <button className={`btn btn-primary ${styles.acceptButton}`} disabled={checkCookiesState()} onClick={handleAccept}>
              {intl.formatMessage({ id: "cookie_BotonAceptar" })}
            </button>
          )}
          <button className={`btn btn-primary ${styles.acceptButton}`} onClick={handleAcceptAll}>
            {intl.formatMessage({ id: "cookie_BotonAceptarTodo" })}
          </button>
        </div>

        {/* Enlaces a las políticas de cookies y privacidad */}
        <div className="mt-25p">
          <p className="d-inline">
            {intl.formatMessage({ id: "cookie_Texto4_1" })}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCookiesPolicyLinkClick();
              }}
              className={`${styles.link} d-inline`}
            >
              {intl.formatMessage({ id: "cookie_Texto4_Enlace1" })}
            </Link>
            {intl.formatMessage({ id: "cookie_Texto4_2" })}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPrivacyPolicyLinkClick();
              }}
              className={`${styles.link} d-inline`}
            >
              {intl.formatMessage({ id: "cookie_Texto4_Enlace2" })}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookie;
