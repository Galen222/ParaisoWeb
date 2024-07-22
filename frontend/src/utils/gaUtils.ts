// utils/gaUtils.ts
import { useState } from "react";
import ReactGA from "react-ga4";
let gaDisabled = false;

export const initGA = () => {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!analyticsId) {
    throw new Error("Google Analytics ID no está definido en las variables de entorno.");
  }
  ReactGA.initialize(analyticsId);
  console.log("GA4 iniciado");
};

export const disableGA = async () => {
  if (!gaDisabled) {
    const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";
    if (analyticsId) {
      (window as any)[`ga-disable-${analyticsId}`] = true;
      gaDisabled = true;
      console.log(`GA desactivado`);
    }
  }
};
