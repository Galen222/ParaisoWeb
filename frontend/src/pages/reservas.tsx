import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/reservas.module.css";

const ReservasPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "reservasTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "reservasDescripcion" })}</p>
    </div>
  );
};

export default ReservasPage;
