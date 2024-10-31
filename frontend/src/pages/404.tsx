// pages/404.tsx
import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import styles from "../styles/error.module.css";

const Custom404 = () => {
  const intl = useIntl();
  const [loading, setLoading] = React.useState(true);

  useVisitedPageTracking("404");
  useVisitedPageTrackingGA("404");

  React.useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  const message = intl.formatMessage({ id: "error_Error404" });
  const imagePath = `/images/web/404.png`; // Asegúrate de tener esta imagen

  return (
    <div className="pageContainer">
      <h1>404</h1>
      <p className="text-center">{message}</p>
      <div className={styles.imageContainer}>
        <img src={imagePath} alt="Error 404" />
      </div>
    </div>
  );
};

export default Custom404;
