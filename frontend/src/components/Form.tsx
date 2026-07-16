// components/Form.tsx

import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useButtonClickTrackingGA } from "../hooks/useTrackingGA";
import { useToastMessage } from "../hooks/useToast";
import {
  submitForm,
  isFormSubmissionCancelled,
  FormData as FormServiceData,
} from "../services/formService";
import validator from "validator";
import styles from "../styles/components/Form.module.css";
import { isContactFormComplete } from "../utils/contactFormValidation";

const ALLOWED_FILE_MIME_TYPES = new Set(["image/jpeg", "application/pdf"]);
const GENERIC_FILE_MIME_TYPES = new Set(["", "application/octet-stream"]);
const ALLOWED_FILE_EXTENSIONS = new Set([".jpg", ".jpeg", ".pdf"]);

export interface FormProps {
  onSubmit: () => void;
}

/**
 * Oculta el correo para poder depurar envíos sin escribir la dirección completa en consola.
 */
const maskEmailForLog = (email: string): string => {
  const separatorIndex = email.lastIndexOf("@");
  if (separatorIndex <= 0 || separatorIndex === email.length - 1) {
    return "***";
  }

  const maskPart = (value: string): string => {
    if (value.length <= 2) {
      return "*".repeat(value.length);
    }

    return `${value[0]}${"*".repeat(value.length - 2)}${value[value.length - 1]}`;
  };

  const localPart = email.slice(0, separatorIndex);
  const domainParts = email.slice(separatorIndex + 1).split(".");
  const maskedDomain = domainParts
    .map((part, index) => (index === domainParts.length - 1 && domainParts.length > 1 ? part : maskPart(part)))
    .join(".");

  return `${maskPart(localPart)}@${maskedDomain}`;
};

/**
 * Obtiene un mensaje de error seguro para diagnóstico sin registrar los datos del formulario.
 */
const getErrorMessageForLog = (error: unknown): string =>
  error instanceof Error ? error.message : "Error desconocido al enviar el formulario";

const Form: React.FC<FormProps> = ({ onSubmit }: FormProps): React.JSX.Element => {
  const intl = useIntl();
  const [isPushingSend, setIsPushingSend] = useState(false);
  const [isPushingFile, setIsPushingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSubmitControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [formData, setFormData] = useState<FormServiceData>({
    name: "",
    reason: "",
    email: "",
    message: "",
    file: null,
  });
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

  const { showToast } = useToastMessage();
  const trackButtonClick = useButtonClickTrackingGA();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeSubmitControllerRef.current?.abort();
      activeSubmitControllerRef.current = null;
      isSubmittingRef.current = false;
    };
  }, []);

  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  /** Comprueba marcas Unicode combinadas sin admitirlas aisladas al inicio o tras un separador. */
  const isValidNameInput = (value: string): boolean => {
    let previousWasLetterOrMark = false;

    for (const character of value) {
      // U+02BC es Unicode Lm, pero aquí es un apóstrofe separador y no una letra.
      if (/^[ '’ʼ-]$/u.test(character)) {
        previousWasLetterOrMark = false;
        continue;
      }
      if (/\p{L}/u.test(character)) {
        previousWasLetterOrMark = true;
        continue;
      }
      if (/\p{M}/u.test(character) && previousWasLetterOrMark) {
        continue;
      }
      return false;
    }

    return true;
  };

  /** Exige al menos una letra real, sin contar los apóstrofes Unicode de categoría Lm. */
  const hasNameLetter = (value: string): boolean =>
    Array.from(value).some((character) => !/^[ '’ʼ-]$/u.test(character) && /\p{L}/u.test(character));

  /**
   * Valida y sanitiza el nombre permitiendo solo caracteres válidos
   */
  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const normalizedValue = value.normalize("NFC");
    if (isValidNameInput(normalizedValue)) {
      setFormData((current) => ({ ...current, [name]: normalizedValue }));
    }
  };

  /**
   * Valida el email en tiempo real sin modificar silenciosamente lo escrito.
   * Eliminar espacios o caracteres inválidos podría transformar una dirección
   * equivocada en otra dirección válida y enviar el mensaje a un destinatario distinto.
   */
  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.normalize("NFC");

    setFormData((current) => ({ ...current, email: value }));
    // La librería aplica la sintaxis de correo completa. Añadir restricciones sobre
    // guiones rechazaba direcciones que el backend acepta y que son válidas.
    setIsValidEmail(validator.isEmail(value));
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const containsUnsupportedControl = Array.from(value).some((character) => {
      if (character === "\t" || character === "\n" || character === "\r") {
        return false;
      }

      return /[\p{C}\p{Zl}\p{Zp}]/u.test(character);
    });

    if (!containsUnsupportedControl) {
      setFormData((current) => ({ ...current, [name]: value }));
    }
  };

  /**
   * Valida el archivo subido (tipo y tamaño)
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    const clearSelectedFile = () => {
      setFormData((current) => ({ ...current, file: null }));
      e.target.value = "";
    };

    if (file) {
      const extensionSeparatorIndex = file.name.lastIndexOf(".");
      const fileExtension = extensionSeparatorIndex >= 0 ? file.name.slice(extensionSeparatorIndex).toLowerCase() : "";
      const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.has(fileExtension);
      const hasAllowedMimeType = ALLOWED_FILE_MIME_TYPES.has(file.type) || GENERIC_FILE_MIME_TYPES.has(file.type);

      // Algunos navegadores no informan el MIME o usan application/octet-stream.
      // En esos casos se permite continuar por extensión; el backend valida el contenido real.
      if (!hasAllowedExtension || !hasAllowedMimeType) {
        clearSelectedFile();
        showToast("contacto_ArchivoNoJPG-PDF", 4000, "error");
        return;
      }
      if (file.size > 10485760) {
        clearSelectedFile();
        showToast("contacto_ArchivoGrande", 4000, "error");
        return;
      }
      setFormData((current) => ({ ...current, file }));
    } else {
      clearSelectedFile();
    }
  };

  /**
   * Verifica si el formulario está completo y válido.
   */
  const isFormComplete = (): boolean =>
    isContactFormComplete(
      formData,
      hasNameLetter(formData.name),
      isValidEmail,
      isPrivacyChecked
    );

  /**
   * Maneja el envío del formulario.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // El botón deshabilitado mejora la experiencia, pero no protege frente a envíos
    // programáticos o disparados por otras vías. Se repite la validación antes de crear
    // el token, registrar el intento o llamar al backend.
    if (isSubmittingRef.current || !isFormComplete()) {
      return;
    }

    isSubmittingRef.current = true;
    trackButtonClick("Enviar Formulario");
    setIsSubmitting(true);

    const controller = new AbortController();
    activeSubmitControllerRef.current = controller;

    try {
      console.log("📤 Enviando formulario:", {
        reason: formData.reason,
        email: maskEmailForLog(formData.email),
        messageLength: formData.message.length,
        hasFile: formData.file !== null,
        fileType: formData.file?.type ?? null,
        fileSize: formData.file?.size ?? 0,
      });
      await submitForm(formData, controller.signal);
      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }

      showToast("contacto_Formulario_Ok", 4000, "success");
      setFormData({
        name: "",
        reason: "",
        email: "",
        message: "",
        file: null,
      });
      setIsValidEmail(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsPrivacyChecked(false);
      onSubmit();
    } catch (error: unknown) {
      if (!isFormSubmissionCancelled(error) && isMountedRef.current) {
        console.error("Error al enviar el formulario:", getErrorMessageForLog(error));
        showToast("contacto_Formulario_Error", 4000, "error");
      }
    } finally {
      if (activeSubmitControllerRef.current === controller) {
        activeSubmitControllerRef.current = null;
        isSubmittingRef.current = false;
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    }
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
          maxLength={100}
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
          <option value="reclamacion">{intl.formatMessage({ id: "contacto_MotivoReclamacion" })}</option>
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
          maxLength={254}
          required
          className={`${styles.input} ${isValidEmail ? styles.emailValid : styles.emailInvalid}`}
        />
      </div>

      <div>
        <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleValidateMessage} maxLength={5000} required></textarea>
      </div>

      <div className={styles.archiveText}>
        <span>{intl.formatMessage({ id: "contacto_SubirArchivo1" })}</span>
        <span className="fs-14p">{intl.formatMessage({ id: "contacto_SubirArchivo2" })}</span>
      </div>

      <div className={styles.fileUploadContainer}>
        <div className="w-600p">
          <input
            ref={fileInputRef}
            type="file"
            id="fileUpload"
            name="fileUpload"
            accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf"
            className="d-none"
            onChange={handleFileChange}
            aria-required={formData.reason === "factura" || formData.reason === "curriculum"}
          />
          <button
            type="button"
            className={`btn btn-outline-secondary ${styles.fileButton} ${isPushingFile ? "animate-push" : ""}`}
            onClick={() => {
              setIsPushingFile(true);
              fileInputRef.current?.click();
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
          <label className={styles.checkboxControl} htmlFor="privacyCheck">
            <input
              type="checkbox"
              id="privacyCheck"
              checked={isPrivacyChecked}
              onChange={handlePrivacyCheck}
              className={styles.hiddenCheckbox}
              required
            />
            {isPrivacyChecked && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L6 12L14 4" stroke="green" strokeWidth="3" />
              </svg>
            )}
          </label>
          <span className={styles.checkText}>
            <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_1" })}</span>
            <Link href="/politica-privacidad" className={styles.link}>
              <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_2" })}</span>
            </Link>
          </span>
        </div>
      </div>

      <button
        type="submit"
        className={`btn btn-primary mt-25p mx-auto ${styles.submitButton} ${isPushingSend ? "animate-push" : ""}`}
        disabled={!isFormComplete() || isSubmitting}
        onClick={() => setIsPushingSend(true)}
        onAnimationEnd={() => setIsPushingSend(false)}
        aria-disabled={!isFormComplete() || isSubmitting}
      >
        {isSubmitting ? intl.formatMessage({ id: "contacto_BotonEnviando" }) : intl.formatMessage({ id: "contacto_BotonEnviar" })}
      </button>
    </form>
  );
};

export default Form;
