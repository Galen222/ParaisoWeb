// utils/gaUtils.ts
import ReactGA from "react-ga4";

export const initGA = () => {
  if (!window.ga) {
    const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    if (!analyticsId) {
      throw new Error("Google Analytics ID no está definido en las variables de entorno.");
    }
    ReactGA.initialize(analyticsId);
    console.log("GA4 iniciado");
  }
};
