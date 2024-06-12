import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import styles from "../styles/contacto.module.css";

const ContactPage = () => {
  const intl = useIntl();
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null as File | null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true);

  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      // Solo permite letras y espacios
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Actualizado para exigir al menos dos caracteres después del punto
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
      if (file.type !== "image/jpeg") {
        alert(intl.formatMessage({ id: "contacto_ArchivoNoJPG" }));
        return;
      }
      if (file.size > 1048576) {
        // 1MB en bytes
        alert(intl.formatMessage({ id: "contacto_ArchivoGrande" }));
        return;
      }
      setFormData({ ...formData, file });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(intl.formatMessage({ id: "contacto_Formulario" }));
  };

  const CheckFormComplete = () => {
    // Verifica que los campos requeridos no esten vacios y sea un email valido
    return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.message.trim() !== "" && isValidEmail;
  };

  return (
    <div className="container">
      <div className={`mt-30p ${styles.recuadro}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name">{intl.formatMessage({ id: "contacto_Nombre" })}</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleValidateName} required className={styles.input} />
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
            id="email"
            name="email"
            value={formData.email}
            onChange={handleValidateEmail}
            required
            style={{ color: isValidEmail ? "black" : "red" }}
          />
          <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} required></textarea>
          <label>{intl.formatMessage({ id: "contacto_SubirImagen" })}</label>
          <div className={styles.fileUploadContainer}>
            <input type="file" id="imageUpload" name="imageUpload" accept="image/jpeg" className="d-none" onChange={handleFileChange} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => document.getElementById("imageUpload")?.click()}>
              {intl.formatMessage({ id: "contacto_BotonSubirImagen" })}
            </button>
            <div className={styles.fileNameBox}>{formData.file ? formData.file.name : intl.formatMessage({ id: "contacto_Archivo" })}</div>
          </div>
          <button type="submit" className={`btn btn-primary w-200p mt-20p mx-auto ${styles.submitButton}`} disabled={!CheckFormComplete()}>
            {intl.formatMessage({ id: "contacto_BotonEnviar" })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
