import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";

export default function Home() {
  const intl = useIntl(); // Utiliza el hook useIntl para internacionalización
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "inicio_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "inicio_Descripcion" })}</p>
      <Carousel />
    </div>
  );
}
