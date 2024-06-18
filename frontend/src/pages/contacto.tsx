import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl"; // Para internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import Link from "next/link";
import styles from "../styles/contacto.module.css"; // Estilos específicos para esta página

const ContactPage = () => {
  const intl = useIntl(); // Hook para utilizar la internacionalización
  useVisitedPageTracking("contacto");
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null as File | null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true); // Estado para la validez del email
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false); // Estado para el checkbox de privacidad

  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  // Maneja la validación del nombre, permitiendo solo letras y espacios
  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      // Regex para verificar la entrada
      setFormData({ ...formData, [name]: value });
    }
  };

  // Maneja la validación del email según un patrón específico
  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Regex para validar el email
    const isValid = emailRegex.test(value);
    setIsValidEmail(isValid);
    setFormData({ ...formData, [name]: value });
  };

  // Maneja cambios en el selector de motivo
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Actualiza el estado del mensaje conforme se edita
  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja el cambio de archivo, asegurando que sea una imagen JPEG y no exceda 1MB
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "image/jpeg") {
        // Verifica el tipo de archivo
        alert(intl.formatMessage({ id: "contacto_ArchivoNoJPG" }));
        return;
      }
      if (file.size > 1048576) {
        // Verifica el tamaño del archivo
        alert(intl.formatMessage({ id: "contacto_ArchivoGrande" }));
        return;
      }
      setFormData({ ...formData, file });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  // Procesa el envío del formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(intl.formatMessage({ id: "contacto_Formulario" }));
    // Resetear el formulario
    setFormData({
      name: "",
      reason: "",
      email: "",
      message: "",
      file: null,
    });
    setIsPrivacyChecked(false);
  };

  // Verifica que los campos requeridos no estén vacíos y sea un email válido
  const CheckFormComplete = () => {
    // Si el motivo es solicitar factura es necesario que se suba una imagen de la factura
    if (formData.reason === "invoice") {
      return (
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.message.trim() !== "" &&
        isValidEmail &&
        formData.file !== null &&
        isPrivacyChecked
      );
    }
    return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.message.trim() !== "" && isValidEmail && isPrivacyChecked;
  };

  return (
    <div className="container">
      <div className={`mt-25p ${styles.recuadro}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <label htmlFor="reason">{intl.formatMessage({ id: "contacto_Motivo" })}</label>
          <select id="reason" name="reason" value={formData.reason} onChange={handleSelect} required>
            <option value="info">{intl.formatMessage({ id: "contacto_MotivoInfo" })}</option>
            <option value="bug">{intl.formatMessage({ id: "contacto_MotivoBug" })}</option>
            <option value="commercial">{intl.formatMessage({ id: "contacto_MotivoComercial" })}</option>
            <option value="invoice">{intl.formatMessage({ id: "contacto_MotivoFactura" })}</option>
            <option value="other">{intl.formatMessage({ id: "contacto_MotivoOtro" })}</option>
          </select>
          <label htmlFor="email">{intl.formatMessage({ id: "contacto_Email" })}</label>
          <input
            type="email"
            autoComplete="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleValidateEmail}
            required
            className={`${styles.input} ${isValidEmail ? styles.emailValid : styles.emailInvalid}`} // Cambia de color si el email no es válido
          />
          <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} required></textarea>
          <span className={styles.archiveText}>{intl.formatMessage({ id: "contacto_SubirImagen" })}</span>
          <div className={styles.fileUploadContainer}>
            <input type="file" id="imageUpload" name="imageUpload" accept="image/jpeg" className="d-none" onChange={handleFileChange} />
            <button type="button" className={`btn btn-outline-secondary ${styles.fileButton}`} onClick={() => document.getElementById("imageUpload")?.click()}>
              {intl.formatMessage({ id: "contacto_BotonSubirImagen" })}
            </button>
            <div className={styles.fileNameBox}>{formData.file ? formData.file.name : intl.formatMessage({ id: "contacto_Archivo" })}</div>
          </div>
          <div className={styles.customCheckbox}>
            <input type="checkbox" id="privacyCheck" checked={isPrivacyChecked} onChange={handlePrivacyCheck} className={styles.hiddenCheckbox} />
            <span className={styles.checkboxControl} onClick={() => setIsPrivacyChecked(!isPrivacyChecked)}>
              {isPrivacyChecked && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8L6 12L14 4" stroke="green" strokeWidth="3" />
                </svg>
              )}
            </span>
            <span className={styles.checkText}>
              {intl.formatMessage({ id: "contacto_PoliticaPrivacidad_1" })}{" "}
              <Link href="/politica-privacidad" className={styles.link}>
                <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_2" })}</span>
              </Link>
            </span>
          </div>
          <button type="submit" className={`btn btn-primary mt-25p mx-auto ${styles.submitButton}`} disabled={!CheckFormComplete()}>
            {intl.formatMessage({ id: "contacto_BotonEnviar" })}
          </button>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped-columns mw-600p mt-25p mx-auto">
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
                  <span>{intl.formatMessage({ id: "contacto_Tabla_Celda6_3" })}</span>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactPage;
