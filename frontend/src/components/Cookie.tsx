// components/Cookie.tsx

import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
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
 * @returns {React.JSX.Element} Modal de preferencias de cookies.
 */
const Cookie: React.FC<CookieProps> = ({
  onAccept,
  onAcceptAll,
  onDeclineAll,
  onCookiesPolicyLinkClick,
  onPrivacyPolicyLinkClick,
}: CookieProps): React.JSX.Element => {
  const intl = useIntl();
  const [isCustomizing, setIsCustomizing] = useState(false); // Estado para manejar si se están personalizando las cookies
  const dialogRef = useRef<HTMLDivElement>(null);

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
  const handleAcceptCookiePersonalizationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAcceptCookiePersonalization(event.target.checked);
  };

  /**
   * Maneja el cambio de estado para la cookie de análisis.
   */
  const handleAcceptCookieAnalysisChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAcceptCookieAnalysis(event.target.checked);
  };

  /**
   * Maneja el cambio de estado para la cookie de análisis de Google.
   */
  const handleAcceptCookieAnalysisGoogleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAcceptCookieAnalysisGoogle(event.target.checked);
  };

  /**
   * Verifica si todas las opciones de cookies están deshabilitadas, lo cual permitiría desactivar el botón de aceptar.
   * @returns {boolean} Verdadero si todas las cookies están deshabilitadas, falso de lo contrario.
   */
  const checkCookiesState = (): boolean => {
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

  /**
   * Coloca el foco dentro del diálogo al abrirlo y lo devuelve al elemento anterior al cerrarse.
   * De este modo el teclado no continúa navegando por el contenido oculto tras el modal.
   */
  useEffect(() => {
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousBodyOverflow = document.body.style.overflow;

    // Un diálogo modal no debe permitir que la rueda o el gesto táctil desplacen
    // el contenido que permanece oculto detrás del fondo semitransparente.
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    };
  }, []);

  /** Mantiene la navegación por tabulador dentro del diálogo modal. */
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");

    if (focusableElements.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && (activeElement === firstElement || activeElement === dialog)) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div className={styles.cookieModalBackdrop}>
      <div
        ref={dialogRef}
        className={styles.cookieModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-description"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <p id="cookie-dialog-title" role="heading" aria-level={2} className="fs-16p fw-bold">
          {intl.formatMessage({ id: "cookie_Texto1" })}
        </p>
        <p id="cookie-dialog-description">{intl.formatMessage({ id: "cookie_Texto2" })}</p>

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
              {/* La etiqueta activa el input nativo y evita mantener un segundo manejador de clic desincronizado. */}
              <label htmlFor="cookiePersonalization" className={styles.slider}></label>
              <label htmlFor="cookiePersonalization">
                {intl.formatMessage({
                  id: "cookie_AceptarPersonalizacion",
                })}
              </label>
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
              <label htmlFor="cookieAnalysis" className={styles.slider}></label>
              <label htmlFor="cookieAnalysis">{intl.formatMessage({ id: "cookie_AceptarAnalisis" })}</label>
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
              <label htmlFor="cookieAnalysisGoogle" className={styles.slider}></label>
              <label htmlFor="cookieAnalysisGoogle">
                {intl.formatMessage({
                  id: "cookie_AceptarAnalisisGoogle",
                })}
              </label>
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
              href="/politica-cookies"
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
              href="/politica-privacidad"
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
