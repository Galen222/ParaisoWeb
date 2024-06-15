// pages/politica-cookies.tsx
import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/PoliticaCookies.module.css"; // Asumiendo que tienes un archivo de estilo.

const PoliticaCookies = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "politicaCookies_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "politicaCookies_Descripcion" })}</p>
    </div>
  );
};

export default PoliticaCookies;
