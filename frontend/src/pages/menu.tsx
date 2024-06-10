import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/menu.module.css";

const MenuPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "menuTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "menuDescripcion" })}</p>
    </div>
  );
};

export default MenuPage;
