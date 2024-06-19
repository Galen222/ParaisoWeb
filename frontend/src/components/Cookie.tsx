// components/Cookie.tsx
import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useCookieConsent } from "../context/CookieContext";
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
  const { AcceptCookieAnalysis, setAcceptCookieAnalysis, AcceptCookiePersonalization, setAcceptCookiePersonalization } = useCookieConsent();

  const handleAcceptCookiePersonalizationChange = () => {
    setAcceptCookiePersonalization(!AcceptCookiePersonalization);
  };

  const handleAcceptCookieAnalysisChange = () => {
    setAcceptCookieAnalysis(!AcceptCookieAnalysis);
  };

  const checkCookiesState = () => {
    if (!AcceptCookieAnalysis && !AcceptCookiePersonalization) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className={styles.cookieModalBackdrop}>
      <div className={styles.cookieModal}>
        <p className="fw-bold">{intl.formatMessage({ id: "cookie_Texto1" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto2" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto3" })}</p>
        <p>{intl.formatMessage({ id: "cookie_Texto4" })}</p>
        <div className={styles.switchContainer}>
          <div className={styles.switch}>
            <input
              type="checkbox"
              id="cookiePersonalization"
              name="cookiePersonalization"
              checked={AcceptCookiePersonalization}
              onChange={handleAcceptCookiePersonalizationChange}
              className={styles.hiddenCheckbox}
            />
            <span className={styles.slider} onClick={handleAcceptCookiePersonalizationChange}></span>
            {intl.formatMessage({ id: "cookie_AceptarPersonalizacion" })}
          </div>
          <div className={styles.switch}>
            <input
              type="checkbox"
              id="cookieAnalysis"
              name="cookieAnalysis"
              checked={AcceptCookieAnalysis}
              onChange={handleAcceptCookieAnalysisChange}
              className={styles.hiddenCheckbox}
            />
            <span className={styles.slider} onClick={handleAcceptCookieAnalysisChange}></span>
            {intl.formatMessage({ id: "cookie_AceptarAnalisis" })}
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={`btn btn-primary ${styles.acceptButton}`} disabled={checkCookiesState()} onClick={onAccept}>
            {intl.formatMessage({ id: "cookie_BotonAceptar" })}
          </button>
          <button className={`btn btn-primary ${styles.acceptButton}`} onClick={onAcceptAll}>
            {intl.formatMessage({ id: "cookie_BotonAceptarTodo" })}
          </button>
          <button className={`btn btn-primary ${styles.cancelButton}`} onClick={onDeclineAll}>
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
