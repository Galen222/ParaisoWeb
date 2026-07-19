import { getDocumentCspNonce } from "./cspNonce";

const RECAPTCHA_SCRIPT_ID = "google-recaptcha-v2-script";
const RECAPTCHA_LOAD_TIMEOUT_MS = 15_000;
const RECAPTCHA_SCRIPT_STATE_KEY = "recaptchaLoaderState";
let recaptchaLoadPromise: Promise<ReCaptchaV2Api> | null = null;

/** Comprueba que el objeto global expone la API completa necesaria para el widget v2. */
const isUsableRecaptchaApi = (api: ReCaptchaV2Api | undefined): api is ReCaptchaV2Api =>
  typeof api?.ready === "function" &&
  typeof api.render === "function" &&
  typeof api.reset === "function";

/** Carga una sola vez la API de reCAPTCHA usando el nonce CSP del documento. */
export const loadRecaptcha = (locale: string): Promise<ReCaptchaV2Api> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("reCAPTCHA solo puede cargarse en el navegador"));
  }

  if (isUsableRecaptchaApi(window.grecaptcha)) {
    return Promise.resolve(window.grecaptcha);
  }

  if (recaptchaLoadPromise) {
    return recaptchaLoadPromise;
  }

  recaptchaLoadPromise = new Promise<ReCaptchaV2Api>((resolve, reject) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let script: HTMLScriptElement;

    const cleanupListeners = (): void => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      script.removeEventListener("load", finishLoading);
      script.removeEventListener("error", failLoading);
    };

    const discardFailedScript = (): void => {
      if (script.id === RECAPTCHA_SCRIPT_ID && script.parentNode) {
        script.remove();
      }
      recaptchaLoadPromise = null;
    };

    const rejectLoading = (message: string): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanupListeners();
      discardFailedScript();
      reject(new Error(message));
    };

    function finishLoading(): void {
      if (settled) {
        return;
      }
      const api = window.grecaptcha;
      if (!isUsableRecaptchaApi(api)) {
        rejectLoading("La API de reCAPTCHA no quedó disponible");
        return;
      }
      try {
        api.ready(() => {
          if (settled) {
            return;
          }
          settled = true;
          cleanupListeners();
          script.dataset[RECAPTCHA_SCRIPT_STATE_KEY] = "loaded";
          // La promesa compartida solo representa una carga en curso. Si la API global
          // se corrompe después, una llamada posterior debe poder reemplazar el script.
          recaptchaLoadPromise = null;
          resolve(api);
        });
      } catch {
        rejectLoading("La API de reCAPTCHA no pudo inicializarse");
      }
    }

    function failLoading(): void {
      rejectLoading("No se pudo cargar la API de reCAPTCHA");
    }

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    const loadingScript =
      existingScript?.dataset[RECAPTCHA_SCRIPT_STATE_KEY] === "loading" ? existingScript : null;

    // Un script que ya terminó no volverá a emitir `load`. Si la API global dejó de ser
    // utilizable, reutilizarlo obligaba a esperar el timeout en cada intento de recuperación.
    if (existingScript && !loadingScript) {
      existingScript.remove();
    }

    if (loadingScript) {
      script = loadingScript;
    } else {
      script = document.createElement("script");
      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${encodeURIComponent(locale)}`;
      script.async = true;
      script.defer = true;
      script.dataset[RECAPTCHA_SCRIPT_STATE_KEY] = "loading";
      const nonce = getDocumentCspNonce();
      if (nonce) {
        script.nonce = nonce;
      }
    }

    script.addEventListener("load", finishLoading, { once: true });
    script.addEventListener("error", failLoading, { once: true });
    timeoutId = setTimeout(
      () => rejectLoading("La carga de reCAPTCHA agotó el tiempo de espera"),
      RECAPTCHA_LOAD_TIMEOUT_MS
    );

    if (!loadingScript) {
      document.head.appendChild(script);
    }
  });

  return recaptchaLoadPromise;
};
