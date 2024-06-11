import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/carta.module.css";

const CartaPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "cartaTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "cartaDescripcion" })}</p>
    </div>
  );
};

export default CartaPage;
