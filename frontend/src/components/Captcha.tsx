import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { loadRecaptcha } from "../utils/recaptchaLoader";
import styles from "../styles/components/Form.module.css";

interface CaptchaProps {
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
}

/** Renderiza reCAPTCHA v2 y comunica un token válido al formulario padre. */
const Captcha: React.FC<CaptchaProps> = ({ onTokenChange, resetSignal }): React.JSX.Element => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const initialLocaleRef = useRef(intl.locale);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  const hasUsableSiteKey = siteKey !== "" && siteKey !== "cambiar_por_clave_publica_de_recaptcha";
  const [hasLoadError, setHasLoadError] = useState(!hasUsableSiteKey);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let active = true;
    onTokenChangeRef.current(null);

    if (!hasUsableSiteKey) {
      return () => {
        active = false;
      };
    }

    void loadRecaptcha(initialLocaleRef.current)
      .then((api) => {
        if (!active || !containerRef.current || widgetIdRef.current !== null) {
          return;
        }

        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
          callback: (token) => {
            if (active) {
              setHasLoadError(false);
              onTokenChangeRef.current(token);
            }
          },
          "expired-callback": () => {
            if (active) {
              onTokenChangeRef.current(null);
            }
          },
          "error-callback": () => {
            if (active) {
              setHasLoadError(true);
              onTokenChangeRef.current(null);
            }
          },
        });
      })
      .catch(() => {
        if (active) {
          setHasLoadError(true);
          onTokenChangeRef.current(null);
        }
      });

    return () => {
      active = false;
    };
  }, [hasUsableSiteKey, siteKey]);

  useEffect(() => {
    const widgetId = widgetIdRef.current;
    if (widgetId !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
      onTokenChangeRef.current(null);
    }
  }, [resetSignal]);

  return (
    <div className={styles.captchaContainer}>
      <div ref={containerRef} className={styles.captchaWidget} />
      {hasLoadError && (
        <span className={styles.captchaError} role="alert">
          {intl.formatMessage({ id: "contacto_CaptchaError" })}
        </span>
      )}
    </div>
  );
};

export default Captcha;
