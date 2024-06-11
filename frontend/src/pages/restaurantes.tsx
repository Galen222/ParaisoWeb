import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/restaurantes.module.css";

const RestaurantsPage = () => {
  const intl = useIntl();

  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "restaurantes" })}</h1>
      <p>{intl.formatMessage({ id: "restaurantesDescripcion" })}</p>
    </div>
  );
};

export default RestaurantsPage;
