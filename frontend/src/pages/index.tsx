import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Carousel from "../components/Carousel";
import styles from "../styles/index.module.css";

interface HomeProps {
  cookiesModalClosed: boolean;
}

export default function Home({ cookiesModalClosed }: HomeProps) {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);

  useVisitedPageTracking("inicio");
  useVisitedPageTrackingGA("inicio");

  useEffect(() => {
    if (intl) {
      setLoading(false);
    }
  }, [intl]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className={styles.body}>
        <h1 className={styles.blockEffect}>
          {cookiesModalClosed ? (
            <>
              <div className={`${styles.blockReveal} ${styles.blockReveal1}`}>
                <div>{intl.formatMessage({ id: "inicio_Titulo_Texto1" })}</div>
              </div>
              <div className={`${styles.blockReveal} ${styles.blockReveal2}`}>
                <div>{intl.formatMessage({ id: "inicio_Titulo_Texto2" })}</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div>{intl.formatMessage({ id: "inicio_Titulo_Texto1" })}</div>
                <div>{intl.formatMessage({ id: "inicio_Titulo_Texto2" })}</div>
              </div>
            </>
          )}
        </h1>
      </div>
      <div>
        <p>{intl.formatMessage({ id: "inicio_Descripcion" })}</p>
        <Carousel />
      </div>
    </div>
  );
}
