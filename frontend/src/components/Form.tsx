// components/Form.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import { useToastMessage } from "../hooks/useToast";
import { submitForm, FormData as FormServiceData } from "../services/formService"; // Importa el servicio y la interfaz
import styles from "../styles/components/Form.module.css";

/**
 * Propiedades para el componente Form.
 * @property {function} onSubmit - Función que se ejecuta al enviar el formulario exitosamente.
 */
export interface FormProps {
  onSubmit: () => void;
}

/**
 * Componente Form
 *
 * Renderiza un formulario de contacto que permite al usuario ingresar su nombre, correo electrónico,
 * mensaje, seleccionar el motivo de contacto, y cargar un archivo. Incluye validaciones y opciones
 * para personalizar la interacción con las cookies y la política de privacidad.
 *
 * @param {FormProps} props - Propiedades del componente Form.
 * @returns {JSX.Element} Formulario de contacto.
 */
const Form: React.FC<FormProps> = ({ onSubmit }: FormProps): JSX.Element => {
  const intl = useIntl(); // Hook para obtener mensajes localizados
  const [isPushingSend, setIsPushingSend] = useState(false); // Estado para la animación del botón de enviar
  const [isPushingFile, setIsPushingFile] = useState(false); // Estado para la animación del botón de subir archivo
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envío del formulario

  // Estado del formulario, incluyendo los datos que se enviarán
  const [formData, setFormData] = useState<FormServiceData>({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true); // Validación del email
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false); // Validación del checkbox de privacidad

  const { showToast } = useToastMessage(); // Utiliza el hook para mostrar las notificaciones
  const trackButtonClick = useButtonClickTrackingGA(); // Seguimiento del botón de envío en Google Analytics

  /**
   * Maneja el cambio del checkbox de privacidad.
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio en el checkbox de privacidad.
   */
  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  /**
   * Valida el nombre ingresado permitiendo solo letras y espacios.
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio en el campo de nombre.
   */
  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^[a-zA-ZäöüÄÖÜß\s]*$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Valida el formato del correo electrónico y actualiza el estado.
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio en el campo de email.
   */
  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const isValid = emailRegex.test(value);
    setIsValidEmail(isValid);
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Maneja la selección en el campo de motivo.
   * @param {ChangeEvent<HTMLSelectElement>} e - Evento de cambio en el campo de selección de motivo.
   */
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Maneja el cambio en el campo de mensaje.
   * @param {ChangeEvent<HTMLTextAreaElement>} e - Evento de cambio en el área de texto del mensaje.
   */
  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Maneja el cambio de archivo y valida el tipo y tamaño.
   * @param {ChangeEvent<HTMLInputElement>} e - Evento de cambio en el campo de carga de archivo.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "image/jpeg" && file.type !== "application/pdf") {
        showToast("contacto_ArchivoNoJPG-PDF", 4000, "error"); // Muestra el toast utilizando el hook
        return;
      }
      if (file.size > 10485760) {
        showToast("contacto_ArchivoGrande", 4000, "error"); // Muestra el toast utilizando el hook
        return;
      }
      setFormData({ ...formData, file });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  /**
   * Maneja el envío del formulario, incluyendo validación, envío a la API y notificación.
   * @param {FormEvent<HTMLFormElement>} e - Evento de envío del formulario.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackButtonClick("Enviar Formulario");
    setIsSubmitting(true); // Comienza el envío

    try {
      await submitForm(formData); // Enviar el formulario

      // Notificación de éxito
      showToast("contacto_Formulario_Ok", 4000, "success"); // Muestra el toast utilizando el hook

      // Restablece el formulario
      setFormData({
        name: "",
        reason: "",
        email: "",
        message: "",
        file: null,
      });
      setIsPrivacyChecked(false);
      onSubmit();
    } catch (error: any) {
      // Notificación de error
      showToast("contacto_Formulario_Error", 4000, "error"); // Muestra el toast utilizando el hook
    } finally {
      setIsSubmitting(false); // Finaliza el envío
    }
  };

  /**
   * Verifica si el formulario está completo y todos los campos requeridos están llenos y válidos.
   * @returns {boolean} Verdadero si el formulario está listo para enviar, falso de lo contrario.
   */
  const CheckFormComplete = (): boolean => {
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
      {/* Campo de nombre */}
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
          className={`${styles.input} ${styles.nameInput}`}
        />
      </div>

      {/* Campo de selección de motivo */}
      <div>
        <label htmlFor="reason">{intl.formatMessage({ id: "contacto_Motivo" })}</label>
        <select id="reason" name="reason" value={formData.reason} onChange={handleSelect} required>
          <option value="" disabled>
            {intl.formatMessage({ id: "contacto_SeleccioneMotivo" })}
          </option>
          <option value="informacion">{intl.formatMessage({ id: "contacto_MotivoInfo" })}</option>
          <option value="comercial">
            {intl.formatMessage({
              id: "contacto_MotivoComercial",
            })}
          </option>
          <option value="factura">
            {intl.formatMessage({
              id: "contacto_MotivoFactura",
            })}
          </option>
          <option value="curriculum">
            {intl.formatMessage({
              id: "contacto_MotivoCurriculum",
            })}
          </option>
          <option value="error">{intl.formatMessage({ id: "contacto_MotivoBug" })}</option>
          <option value="otro">{intl.formatMessage({ id: "contacto_MotivoOtro" })}</option>
        </select>
      </div>

      {/* Campo de correo electrónico */}
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

      {/* Campo de mensaje */}
      <div>
        <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} required></textarea>
      </div>

      {/* Subir archivo */}
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

      {/* Checkbox de política de privacidad */}
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
            <span>
              {intl.formatMessage({
                id: "contacto_PoliticaPrivacidad_1",
              })}
            </span>
            <Link href="/politica-privacidad" className={styles.link}>
              <span>
                {intl.formatMessage({
                  id: "contacto_PoliticaPrivacidad_2",
                })}
              </span>
            </Link>
          </label>
        </div>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        className={`btn btn-primary mt-25p mx-auto ${styles.submitButton} ${isPushingSend ? "animate-push" : ""}`}
        disabled={!CheckFormComplete() || isSubmitting} // Desactiva el botón si no se completa el formulario o está enviando
        onClick={() => setIsPushingSend(true)}
        onAnimationEnd={() => setIsPushingSend(false)}
      >
        {isSubmitting ? intl.formatMessage({ id: "contacto_BotonEnviando" }) : intl.formatMessage({ id: "contacto_BotonEnviar" })}
      </button>
    </form>
  );
};

export default Form;
