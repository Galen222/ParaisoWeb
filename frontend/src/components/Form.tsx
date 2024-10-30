// form.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import { toast, Slide } from "react-toastify";
import { useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import Link from "next/link";
import styles from "../styles/Form.module.css";

interface FormProps {
  onSubmit: () => void;
}

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const intl = useIntl();
  const [isPushingSend, setIsPushingSend] = useState(false);
  const [isPushingFile, setIsPushingFile] = useState(false);
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
      if (file.type !== "image/jpeg" && file.type !== "application/pdf") {
        toast.error(intl.formatMessage({ id: "contacto_ArchivoNoJPG-PDF" }), {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackButtonClick("Enviar Formulario");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("reason", formData.reason);
    data.append("email", formData.email);
    data.append("message", formData.message);
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      const response = await fetch("http://localhost:8000/api/contact", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        // Manejo de errores cuando la respuesta no es exitosa
        let errorMessage = "Error al enviar el formulario";
        try {
          const errorData = await response.json();
          /* console.error("Error del servidor:", errorData); */
        } catch (e) {
          // El servidor no devolvió un JSON válido
          /* console.error("Error al parsear la respuesta del servidor:", e); */
        }
        throw new Error(errorMessage);
      }

      // Éxito
      toast.success(intl.formatMessage({ id: "contacto_Formulario_Ok" }), {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
        transition: Slide,
      });
      // Restablecer el formulario
      setFormData({
        name: "",
        reason: "",
        email: "",
        message: "",
        file: null,
      });
      setIsPrivacyChecked(false);
      onSubmit();
    } catch (error) {
      /* console.error("Error:", error); */
      toast.error(intl.formatMessage({ id: "contacto_Formulario_Error" }), {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
        transition: Slide,
      });
    }
  };

  const CheckFormComplete = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.message.trim() !== "" &&
      formData.reason !== "" &&
      isValidEmail &&
      isPrivacyChecked &&
      ((formData.reason !== "invoice" && formData.reason !== "curriculum") || formData.file !== null)
    );
  };

  return (
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
  );
};

export default Form;
