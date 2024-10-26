import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import { toast, Slide } from "react-toastify";
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA, useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import Link from "next/link";
import AnimatedTitle from "../components/AnimatedTitle";
import styles from "../styles/contacto.module.css";

interface ContactPageProps {
  cookiesModalClosed: boolean;
  loadingMessages: boolean;
}

const ContactPage = ({ cookiesModalClosed, loadingMessages }: ContactPageProps) => {
  const intl = useIntl();
  const [isPushingSend, setIsPushingSend] = useState(false);
  const [isPushingFile, setIsPushingFile] = useState(false);

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  useVisitedPageTracking("contacto");
  useVisitedPageTrackingGA("contacto");

  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null as File | null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^[a-zA-ZäöüÄÖÜß\s]*$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isValid = emailRegex.test(value);
    setIsValidEmail(isValid);
    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Permitir tanto imágenes JPEG como documentos PDF
      if (file.type !== "image/jpeg" && file.type !== "application/pdf") {
        toast.error(intl.formatMessage({ id: "contacto_ArchivoNoJPG-PDF" }), {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Slide,
        });
        return;
      }
      if (file.size > 10485760) {
        toast.error(intl.formatMessage({ id: "contacto_ArchivoGrande" }), {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Slide,
        });
        return;
      }
      setFormData({ ...formData, file });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  const trackButtonClick = useButtonClickTrackingGA();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackButtonClick("Enviar Formulario");
    toast.success(intl.formatMessage({ id: "contacto_Formulario" }), {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
    setFormData({
      name: "",
      reason: "",
      email: "",
      message: "",
      file: null,
    });
    setIsPrivacyChecked(false);
  };

  const CheckFormComplete = () => {
    if (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.message.trim() !== "" &&
      formData.reason !== "" &&
      isValidEmail &&
      isPrivacyChecked
    ) {
      if (formData.reason === "invoice" || formData.reason === "curriculum") {
        return formData.file !== null;
      }
      return true;
    }
    return false;
  };
  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className="pageContainer">
      <AnimatedTitle textName="contacto" cookiesModalClosed={cookiesModalClosed} />
      <div>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto1" })}</p>
        <p className="fw-bold ti-20p">{intl.formatMessage({ id: "contacto_Texto2" })}</p>
        <p className="fw-bold ti-20p">{intl.formatMessage({ id: "contacto_Texto3" })}</p>
        <p className="ti-20p">{intl.formatMessage({ id: "contacto_Texto4" })}</p>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div>
              <h3 className="text-center">{intl.formatMessage({ id: "contacto_Titulo_Formulario" })}</h3>
              <label htmlFor="name">{intl.formatMessage({ id: "contacto_Nombre" })}</label>
              <input
                type="text"
                autoComplete="given-name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleValidateName}
                required
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="reason">{intl.formatMessage({ id: "contacto_Motivo" })}</label>
              <select id="reason" name="reason" value={formData.reason} onChange={handleSelect} required>
                <option value="" disabled>
                  {intl.formatMessage({ id: "contacto_SeleccioneMotivo" })}
                </option>
                <option value="info">{intl.formatMessage({ id: "contacto_MotivoInfo" })}</option>
                <option value="commercial">{intl.formatMessage({ id: "contacto_MotivoComercial" })}</option>
                <option value="invoice">{intl.formatMessage({ id: "contacto_MotivoFactura" })}</option>
                <option value="curriculum">{intl.formatMessage({ id: "contacto_MotivoCurriculum" })}</option>
                <option value="bug">{intl.formatMessage({ id: "contacto_MotivoBug" })}</option>
                <option value="other">{intl.formatMessage({ id: "contacto_MotivoOtro" })}</option>
              </select>
            </div>
            <div>
              <label htmlFor="email">{intl.formatMessage({ id: "contacto_Email" })}</label>
              <input
                type="email"
                autoComplete="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleValidateEmail}
                required
                className={`${styles.input} ${isValidEmail ? styles.emailValid : styles.emailInvalid}`}
              />
            </div>
            <div>
              <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} required></textarea>
            </div>
            <div className={styles.archiveText}>
              <span>{intl.formatMessage({ id: "contacto_SubirArchivo1" })}</span>
              <span className="fs-14p">{intl.formatMessage({ id: "contacto_SubirArchivo2" })}</span>
            </div>
            <div className={styles.fileUploadContainer}>
              <div className="w-600p">
                <input type="file" id="fileUpload" name="fileUpload" accept="image/jpeg,application/pdf" className="d-none" onChange={handleFileChange} />
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${styles.fileButton} ${isPushingFile ? "animate-push" : ""}`}
                  onClick={() => {
                    setIsPushingFile(true);
                    document.getElementById("fileUpload")?.click();
                  }}
                  onAnimationEnd={() => setIsPushingFile(false)}
                >
                  <span>{intl.formatMessage({ id: "contacto_BotonSubirArchivo" })}</span>
                </button>
              </div>
              <div className={`text-center ${styles.fileNameBox}`}>{formData.file ? formData.file.name : intl.formatMessage({ id: "contacto_Archivo" })}</div>
            </div>
            <div className={styles.customCheckbox}>
              <div className={styles.checkboxLabelContainer}>
                <span className={styles.checkboxControl} onClick={() => setIsPrivacyChecked(!isPrivacyChecked)}>
                  <input type="checkbox" id="privacyCheck" checked={isPrivacyChecked} onChange={handlePrivacyCheck} className={styles.hiddenCheckbox} />
                  {isPrivacyChecked && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8L6 12L14 4" stroke="green" strokeWidth="3" />
                    </svg>
                  )}
                </span>
                <label htmlFor="privacyCheck" className={styles.checkText}>
                  <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_1" })}</span>
                  <Link href="/politica-privacidad" className={styles.link}>
                    <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_2" })}</span>
                  </Link>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className={`btn btn-primary mt-25p mx-auto ${styles.submitButton} ${isPushingSend ? "animate-push" : ""}`}
              disabled={!CheckFormComplete()}
              onClick={() => setIsPushingSend(true)}
              onAnimationEnd={() => setIsPushingSend(false)}
            >
              {intl.formatMessage({ id: "contacto_BotonEnviar" })}
            </button>
          </form>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-striped-columns mw-600p mt-25p mx-auto text-center mb-40p">
            <thead>
              <tr>
                <th colSpan={2}>{intl.formatMessage({ id: "contacto_Tabla_Titulo" })}</th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda1_1" })}</td>
                <td>PACAVA S.A.</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_1" })}</td>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_2" })}</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_1" })}</td>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_2" })}</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda4_1" })}</td>
                <td>PACAVA S.A.</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_1" })}</td>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_2" })}</td>
              </tr>
              <tr>
                <td>{intl.formatMessage({ id: "contacto_Tabla_Celda6_1" })}</td>
                <td>
                  {intl.formatMessage({ id: "contacto_Tabla_Celda6_2" })}
                  <Link href="/politica-privacidad" className={styles.link}>
                    <span className="fs-16p">{intl.formatMessage({ id: "contacto_Tabla_Celda6_3" })}</span>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="ti-20p">
          {intl.formatMessage({ id: "contacto_Texto4_1" })}
          <a className={styles.link} href="mailto:info@paraisodeljamon.com">
            {intl.formatMessage({ id: "contacto_texto4_enlace" })}
          </a>
          {intl.formatMessage({ id: "contacto_Texto4_2" })}
        </p>
        <div className={styles.localesContainer}>
          <div className={styles.contactLocation}>
            <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Titulo" })}</h3>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Direccion_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Direccion_Calle" })}
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Telefono_Texto" })}</span>
              <a className={styles.link} href="tel:+345328350">
                {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Telefono_Numero" })}
              </a>
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Horario_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_SanBernardo_Horario_Numero" })}
            </p>
          </div>
          <div className={styles.contactLocation}>
            <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Titulo" })}</h3>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Direccion_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Direccion_Calle" })}
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Telefono_Texto" })}</span>
              <a className={styles.link} href="tel:+345539783">
                {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Telefono_Numero" })}
              </a>
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Horario_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_BravoMurillo_Horario_Numero" })}
            </p>
          </div>
          <div className={styles.contactLocation}>
            <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Titulo" })}</h3>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Direccion_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Direccion_Calle" })}
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Telefono_Texto" })}</span>
              <a className={styles.link} href="tel:+345341820">
                {intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Telefono_Numero" })}
              </a>
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Horario_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_ReinaVictoria_Horario_Numero" })}
            </p>
          </div>
          <div className={styles.contactLocation}>
            <h3 className="text-center">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Titulo" })}</h3>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Direccion_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_Arenal_Direccion_Calle" })}
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Telefono_Texto" })}</span>
              <a className={styles.link} href="tel:+345419519">
                {intl.formatMessage({ id: "contacto_Informacion_Arenal_Telefono_Numero" })}
              </a>
            </p>
            <p>
              <span className="fw-bold">{intl.formatMessage({ id: "contacto_Informacion_Arenal_Horario_Texto" })}</span>
              {intl.formatMessage({ id: "contacto_Informacion_Arenal_Horario_Numero" })}
            </p>
          </div>
        </div>
      </div>
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}
    </div>
  );
};

export default ContactPage;
