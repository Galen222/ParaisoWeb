interface ReCaptchaRenderParameters {
  sitekey: string;
  theme?: "light" | "dark";
  size?: "compact" | "normal";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface ReCaptchaV2Api {
  ready: (callback: () => void) => void;
  render: (container: HTMLElement, parameters: ReCaptchaRenderParameters) => number;
  reset: (widgetId?: number) => void;
}

interface Window {
  grecaptcha?: ReCaptchaV2Api;
}
