import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl"; // Para internacionalización
import styles from "../styles/contacto.module.css"; // Estilos específicos para esta página

const ContactPage = () => {
  const intl = useIntl(); // Hook para utilizar la internacionalización
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null as File | null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true); // Estado para la validez del email

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

  // Maneja cambios en los selectores de razones
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
  };

  // Verifica que los campos requeridos no estén vacíos y sea un email válido
  const CheckFormComplete = () => {
    // Si el motivo es solicitar factura es necesario que se suba una imagen de la factura
    if (formData.reason === "invoice") {
      return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.message.trim() !== "" && isValidEmail && formData.file !== null;
    }
    return formData.name.trim() !== "" && formData.email.trim() !== "" && formData.message.trim() !== "" && isValidEmail;
  };

  return (
    <div className="container">
      <div className={`mt-30p ${styles.recuadro}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Entradas de formulario con validaciones específicas para cada campo */}
          {/* Inputs y selectores con etiquetas internacionalizadas */}
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
            style={{ color: isValidEmail ? "black" : "red" }} // Cambia de color si el email no es válido
          />
          <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} required></textarea>
          <label>{intl.formatMessage({ id: "contacto_SubirImagen" })}</label>
          <div className={styles.fileUploadContainer}>
            <input type="file" id="imageUpload" name="imageUpload" accept="image/jpeg" className="d-none" onChange={handleFileChange} />
            <button type="button" className="btn btn-outline-secondary w-200p" onClick={() => document.getElementById("imageUpload")?.click()}>
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
