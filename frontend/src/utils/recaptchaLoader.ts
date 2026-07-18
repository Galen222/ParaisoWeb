import { getDocumentCspNonce } from "./cspNonce";

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-v2-script";
let recaptchaLoadPromise: Promise<ReCaptchaV2Api> | null = null;

/** Carga una sola vez la API de reCAPTCHA usando el nonce CSP del documento. */
export const loadRecaptcha = (locale: string): Promise<ReCaptchaV2Api> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("reCAPTCHA solo puede cargarse en el navegador"));
  }

  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  if (recaptchaLoadPromise) {
    return recaptchaLoadPromise;
  }

  recaptchaLoadPromise = new Promise<ReCaptchaV2Api>((resolve, reject) => {
    const discardFailedScript = (script: HTMLScriptElement): void => {
      if (script.id === RECAPTCHA_SCRIPT_ID && script.parentNode) {
        script.remove();
      }
      recaptchaLoadPromise = null;
    };

    const finishLoading = (script: HTMLScriptElement): void => {
      const api = window.grecaptcha;
      if (!api) {
        discardFailedScript(script);
        reject(new Error("La API de reCAPTCHA no quedó disponible"));
        return;
      }
      api.ready(() => resolve(api));
    };

    const failLoading = (script: HTMLScriptElement): void => {
      discardFailedScript(script);
      reject(new Error("No se pudo cargar la API de reCAPTCHA"));
    };

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => finishLoading(existingScript), { once: true });
      existingScript.addEventListener("error", () => failLoading(existingScript), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.defer = true;
    const nonce = getDocumentCspNonce();
    if (nonce) {
      script.nonce = nonce;
    }
    script.addEventListener("load", () => finishLoading(script), { once: true });
    script.addEventListener("error", () => failLoading(script), { once: true });
    document.head.appendChild(script);
  });

  return recaptchaLoadPromise;
};
