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
  const [loadAttempt, setLoadAttempt] = useState(0);

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
  }, [hasUsableSiteKey, loadAttempt, siteKey]);

  const handleRetry = (): void => {
    if (!hasUsableSiteKey) {
      return;
    }

    setHasLoadError(false);
    onTokenChangeRef.current(null);

    const widgetId = widgetIdRef.current;
    if (widgetId !== null && window.grecaptcha) {
      try {
        // Un error del widget ya renderizado se recupera reiniciándolo.
        window.grecaptcha.reset(widgetId);
        return;
      } catch {
        // Si la instancia quedó dañada, se elimina el contenido antes de renderizar
        // otra para no acumular iframes ni conservar un identificador inutilizable.
      }
    }

    widgetIdRef.current = null;
    containerRef.current?.replaceChildren();
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  };

  useEffect(() => {
    const widgetId = widgetIdRef.current;
    if (widgetId === null) {
      return;
    }

    let cancelled = false;
    const recreateWidget = (): void => {
      // Un widget retirado o una API global dañada no deben dejar el formulario
      // sin CAPTCHA después del envío. Se recrea con el mismo idioma inicial.
      widgetIdRef.current = null;
      containerRef.current?.replaceChildren();
      queueMicrotask(() => {
        if (!cancelled) {
          setHasLoadError(false);
          setLoadAttempt((currentAttempt) => currentAttempt + 1);
        }
      });
    };

    onTokenChangeRef.current(null);
    if (typeof window.grecaptcha?.reset !== "function") {
      recreateWidget();
    } else {
      try {
        window.grecaptcha.reset(widgetId);
      } catch {
        recreateWidget();
      }
    }

    return () => {
      cancelled = true;
    };
  }, [resetSignal]);

  return (
    <div className={styles.captchaContainer}>
      <div ref={containerRef} className={styles.captchaWidget} />
      {hasLoadError && (
        <div className={styles.captchaError} role="alert">
          <span>{intl.formatMessage({ id: "contacto_CaptchaError" })}</span>
          {hasUsableSiteKey && (
            <button
              type="button"
              className={`btn btn-outline-secondary ${styles.captchaRetryButton}`}
              onClick={handleRetry}
            >
              {intl.formatMessage({ id: "contacto_CaptchaReintentar" })}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Captcha;
