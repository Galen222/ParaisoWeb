// components/Cookie.tsx
import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useCookieConsent } from "../context/CookieContext";
import styles from "../styles/Cookie.module.css";

interface CookieProps {
  onAccept: () => void;
  onPolicyLinkClick: () => void;
}

const Cookie: React.FC<CookieProps> = ({ onAccept, onPolicyLinkClick }) => {
  const intl = useIntl();
  const { AcceptCookieAnalysis, setAcceptCookieAnalysis, AcceptCookiePersonalization, setAcceptCookiePersonalization } = useCookieConsent();

  const handleAcceptCookiePersonalizationChange = () => {
    setAcceptCookiePersonalization(!AcceptCookiePersonalization);
    console.log("el slider es: ", !AcceptCookiePersonalization);
  };

  const handleAcceptCookieAnalysisChange = () => {
    setAcceptCookieAnalysis(!AcceptCookieAnalysis);
    console.log("el slider es: ", !AcceptCookieAnalysis);
  };

  return (
    <div className={styles.cookieModalBackdrop}>
      <div className={styles.cookieModal}>
        <p>{intl.formatMessage({ id: "cookie_Texto" })}</p>
        <div className={styles.switchContainer}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              id="cookiePersonalization"
              name="cookiePersonalization"
              defaultChecked
              role="switch"
              checked={AcceptCookiePersonalization}
              onChange={handleAcceptCookiePersonalizationChange}
            />
            <span className={styles.slider}></span>
            {intl.formatMessage({ id: "cookie_AceptarPersonalizacion" })}
          </label>
          <label className={styles.switch}>
            <input
              type="checkbox"
              id="cookieAnalysis"
              name="cookieAnalysis"
              defaultChecked
              role="switch"
              checked={AcceptCookieAnalysis}
              onChange={handleAcceptCookieAnalysisChange}
            />
            <span className={styles.slider}></span>
            {intl.formatMessage({ id: "cookie_AceptarAnalisis" })}
          </label>
        </div>
        <div className={styles.buttonContainer}>
          <button className={`btn btn-primary mt-25p mx-auto ${styles.acceptButton}`} onClick={onAccept}>
            {intl.formatMessage({ id: "cookie_BotonAceptar" })}
          </button>
        </div>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onPolicyLinkClick();
          }}
          className={styles.link}
        >
          {intl.formatMessage({ id: "cookie_Enlace" })}
        </Link>
      </div>
    </div>
  );
};

export default Cookie;
