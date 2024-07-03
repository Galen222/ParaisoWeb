// components/Cookie.tsx
import React from "react";
import { useIntl } from "react-intl";
import { toast, Slide } from "react-toastify";
import Link from "next/link";
import { useCookieConsent } from "../contexts/CookieContext";
import styles from "../styles/Cookie.module.css";

interface CookieProps {
  onAccept: () => void;
  onAcceptAll: () => void;
  onDeclineAll: () => void;
  onCookiesPolicyLinkClick: () => void;
  onPrivacyPolicyLinkClick: () => void;
}

const Cookie: React.FC<CookieProps> = ({ onAccept, onAcceptAll, onDeclineAll, onCookiesPolicyLinkClick, onPrivacyPolicyLinkClick }) => {
  const intl = useIntl();
  const {
    AcceptCookieAnalysis,
    setAcceptCookieAnalysis,
    AcceptCookieAnalysisGoogle,
    setAcceptCookieAnalysisGoogle,
    AcceptCookiePersonalization,
    setAcceptCookiePersonalization,
  } = useCookieConsent();

  const handleAcceptCookiePersonalizationChange = () => {
    setAcceptCookiePersonalization(!AcceptCookiePersonalization);
  };

  const handleAcceptCookieAnalysisChange = () => {
    setAcceptCookieAnalysis(!AcceptCookieAnalysis);
  };

  const handleAcceptCookieAnalysisGoogleChange = () => {
    setAcceptCookieAnalysisGoogle(!AcceptCookieAnalysisGoogle);
  };

  const checkCookiesState = () => {
    if (!AcceptCookieAnalysis && !AcceptCookieAnalysisGoogle && !AcceptCookiePersonalization) {
      return true;
    } else {
      return false;
    }
  };

  // Función para mostrar el toast
  const showCookieToast = () => {
    toast.success(intl.formatMessage({ id: "app_CookieSuccess" }), {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  };

  const handleAccept = () => {
    onAccept();
    showCookieToast();
  };

  const handleAcceptAll = () => {
    onAcceptAll();
    showCookieToast();
  };

  const handleDeclineAll = () => {
    onDeclineAll();
    showCookieToast();
  };
  return (
    <div className={styles.cookieModalBackdrop}>
      <div className={styles.cookieModal}>
        <p className="fs-16p fw-bold">{intl.formatMessage({ id: "cookie_Texto1" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto2" })}</p>
        {/* <p>{intl.formatMessage({ id: "cookie_Texto3" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto4" })}</p> */}
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
            <span>{intl.formatMessage({ id: "cookie_AceptarPersonalizacion" })}</span>
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
            <span>{intl.formatMessage({ id: "cookie_AceptarAnalisisGoogle" })}</span>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={`btn btn-primary ${styles.acceptButton}`} disabled={checkCookiesState()} onClick={handleAccept}>
            {intl.formatMessage({ id: "cookie_BotonAceptar" })}
          </button>
          <button className={`btn btn-primary ${styles.acceptButton}`} onClick={handleAcceptAll}>
            {intl.formatMessage({ id: "cookie_BotonAceptarTodo" })}
          </button>
          <button className={`btn btn-primary ${styles.cancelButton}`} onClick={handleDeclineAll}>
            {intl.formatMessage({ id: "cookie_BotonRechazarTodo" })}
          </button>
        </div>
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
