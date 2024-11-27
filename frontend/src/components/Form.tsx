import React, { useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import { useToastMessage } from "../hooks/useToast";
import { submitForm, FormData as FormServiceData } from "../services/formService";
import validator from "validator";
import styles from "../styles/components/Form.module.css";

export interface FormProps {
  onSubmit: () => void;
}

const Form: React.FC<FormProps> = ({ onSubmit }: FormProps): JSX.Element => {
  const intl = useIntl();
  const [isPushingSend, setIsPushingSend] = useState(false);
  const [isPushingFile, setIsPushingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormServiceData>({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null,
  });
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

  const { showToast } = useToastMessage();
  const trackButtonClick = useButtonClickTrackingGA();

  /**
   * Valida cada parte del email (nombre, dominio, servidor) según reglas específicas
   * @param part - Parte del email a validar
   * @returns boolean indicando si la parte es válida
   */
  const validateEmailPart = (part: string): boolean => {
    // No permite . o - al inicio o final de cada parte
    if (part.startsWith(".") || part.startsWith("-") || part.endsWith(".") || part.endsWith("-")) {
      return false;
    }
    // No permite múltiples . o - consecutivos
    if (/[.-]{2,}/.test(part)) {
      return false;
    }
    return true;
  };

  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  /**
   * Valida y sanitiza el nombre permitiendo solo caracteres válidos
   */
  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nameRegex = /^[\p{L}\s'-]*$/u;
    if (nameRegex.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  /**
   * Maneja la validación y sanitización del email en tiempo real
   * Implementa reglas estrictas para el formato del email
   */
  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let sanitizedValue = "";

    for (const char of value) {
      if (!/[a-zA-Z0-9.@-]/.test(char)) continue;

      if (char === "@" && sanitizedValue.includes("@")) continue;

      if (char === "." || char === "-") {
        // Si el siguiente carácter es @, no añadimos el . o -
        if (value.indexOf("@") > -1 && value.indexOf("@") === sanitizedValue.length + 1) continue;

        if (sanitizedValue === "" || sanitizedValue.endsWith("@")) continue;
        if (sanitizedValue.endsWith(".") || sanitizedValue.endsWith("-")) continue;
      }

      sanitizedValue += char;
    }

    if (sanitizedValue.includes("@")) {
      const [localPart, domainPart] = sanitizedValue.split("@");

      if (validateEmailPart(localPart) && domainPart && validateEmailPart(domainPart)) {
        const isValid = validator.isEmail(sanitizedValue);
        setIsValidEmail(isValid);
        setFormData({ ...formData, email: sanitizedValue });
        return;
      }
    }

    setFormData({ ...formData, email: sanitizedValue });
    setIsValidEmail(false);
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Valida el archivo subido (tipo y tamaño)
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.type !== "image/jpeg" && file.type !== "application/pdf") {
        showToast("contacto_ArchivoNoJPG-PDF", 4000, "error");
        return;
      }
      if (file.size > 10485760) {
        showToast("contacto_ArchivoGrande", 4000, "error");
        return;
      }
      setFormData({ ...formData, file });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackButtonClick("Enviar Formulario");
    setIsSubmitting(true);

    try {
      await submitForm(formData);
      showToast("contacto_Formulario_Ok", 4000, "success");
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
      showToast("contacto_Formulario_Error", 4000, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Verifica si el formulario está completo y válido
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

      <div>
        <label htmlFor="reason">{intl.formatMessage({ id: "contacto_Motivo" })}</label>
        <select id="reason" name="reason" value={formData.reason} onChange={handleSelect} required>
          <option value="" disabled>
            {intl.formatMessage({ id: "contacto_SeleccioneMotivo" })}
          </option>
          <option value="informacion">{intl.formatMessage({ id: "contacto_MotivoInfo" })}</option>
          <option value="comercial">{intl.formatMessage({ id: "contacto_MotivoComercial" })}</option>
          <option value="factura">{intl.formatMessage({ id: "contacto_MotivoFactura" })}</option>
          <option value="curriculum">{intl.formatMessage({ id: "contacto_MotivoCurriculum" })}</option>
          <option value="error">{intl.formatMessage({ id: "contacto_MotivoBug" })}</option>
          <option value="otro">{intl.formatMessage({ id: "contacto_MotivoOtro" })}</option>
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
        disabled={!CheckFormComplete() || isSubmitting}
        onClick={() => setIsPushingSend(true)}
        onAnimationEnd={() => setIsPushingSend(false)}
        aria-disabled={!CheckFormComplete() || isSubmitting}
      >
        {isSubmitting ? intl.formatMessage({ id: "contacto_BotonEnviando" }) : intl.formatMessage({ id: "contacto_BotonEnviar" })}
      </button>
    </form>
  );
};

export default Form;
