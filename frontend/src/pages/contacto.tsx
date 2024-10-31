// contacto.tsx
import React from "react";
import { useIntl } from "react-intl";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import Localization from "../components/Localization";
import LegalInfo from "../components/LegalInfo";
import useScrollToTop from "../hooks/useScrollToTop";
import Form from "../components/Form";
import styles from "../styles/contacto.module.css";
import type { ComponentType } from "react";

interface ContactPageProps {
  loadingMessages: boolean;
}

type ContactPageComponent = ComponentType<ContactPageProps> & { pageTitleText?: string };

const ContactPage: ContactPageComponent = ({ loadingMessages }: ContactPageProps) => {
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("contacto");
  useVisitedPageTrackingGA("contacto");

  const handleFormSubmit = () => {
    // Aquí puedes realizar acciones adicionales después del envío
  };

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <div>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto1" })}</p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto2a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto2b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto2c" })}
        </p>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto3a" })}
          <span className="fw-bold">{intl.formatMessage({ id: "contacto_Texto3b" })}</span>
          {intl.formatMessage({ id: "contacto_Texto3c" })}
        </p>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto4" })}</p>
      </div>
      <div className={styles.formContainer}>
        <Form onSubmit={handleFormSubmit} />
      </div>
      <div>
        <LegalInfo />
      </div>
      <div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto4_1" })}
          <a className={styles.link} href="mailto:info@paraisodeljamon.com">
            {intl.formatMessage({ id: "contacto_texto4_enlace" })}
          </a>
          {intl.formatMessage({ id: "contacto_Texto4_2" })}
        </p>
      </div>
      <div>
        <Localization localizationName="san-bernardo" />
        <Localization localizationName="bravo-murillo" />
        <Localization localizationName="reina-victoria" />
        <Localization localizationName="arenal" />
      </div>
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

ContactPage.pageTitleText = "contacto";

export default ContactPage;
