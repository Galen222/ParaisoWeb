// Cookie.tsx
import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import styles from "../styles/Cookie.module.css";

interface CookieProps {
  onAccept: () => void;
  onDecline: () => void;
  onPolicyLinkClick: () => void;
}

const Cookie: React.FC<CookieProps> = ({ onAccept, onDecline, onPolicyLinkClick }) => {
  const intl = useIntl();

  return (
    <div className={styles.cookieModalBackdrop}>
      <div className={styles.cookieModal}>
        <p>{intl.formatMessage({ id: "cookie_Texto" })}</p>
        <div className={styles.buttonContainer}>
          <button className="w-200p btn btn-success" onClick={onAccept}>
            {intl.formatMessage({ id: "cookie_BotonAceptar" })}
          </button>
          <button className="w-200p btn btn-danger" onClick={onDecline}>
            {intl.formatMessage({ id: "cookie_BotonRechazar" })}
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
