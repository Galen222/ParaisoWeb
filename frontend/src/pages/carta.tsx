import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para facilitar la internacionalización de la aplicación.
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/carta.module.css"; // Importa los estilos específicos para la página 'Carta'.

// Define el componente funcional CartaPage utilizando una función flecha.
const CartaPage = () => {
  const intl = useIntl(); // Inicializa el hook de internacionalización para usarlo en este componente.
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking("carta");
  useVisitedPageTrackingGA("carta");

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  // Renderiza el contenido del componente.
  return (
    <div className="container">
      <h1>{intl.formatMessage({ id: "carta_Titulo" })}</h1>
      <p>{intl.formatMessage({ id: "carta_Descripcion" })}</p>
    </div>
  );
};

export default CartaPage; // Exporta el componente CartaPage para su uso en otras partes de la aplicación.
