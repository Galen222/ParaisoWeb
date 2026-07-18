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
import styles from "../styles/components/Form.module.css";
import {
  isContactFormComplete,
  truncateContactMessage,
  truncateContactName,
} from "../utils/contactFormValidation";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { containsUnsupportedContactMessageControl } from "../utils/contactMessage";
import { isValidContactEmail } from "../utils/contactEmailValidation";
import { hasAllowedContactFileMetadata } from "../utils/contactFileValidation";
import { clientLogger } from "../logging/clientLogger";
import Captcha from "./Captcha";

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
  const prefersReducedMotion = usePrefersReducedMotion();
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
    captchaToken: "",
    file: null,
  });
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [hasInvalidNameInput, setHasInvalidNameInput] = useState(false);
  const [hasInvalidMessageInput, setHasInvalidMessageInput] = useState(false);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const hasEmailValidationError = formData.email.trim() !== "" && !isValidEmail;
  const isFileRequired = formData.reason === "factura" || formData.reason === "curriculum";

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

  const hasNameValidationError =
    hasInvalidNameInput || (formData.name !== "" && !hasNameLetter(formData.name));

  /**
   * Normaliza el nombre y conserva el valor rechazado para que el usuario pueda corregirlo.
   */
  const handleValidateName = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const normalizedValue = truncateContactName(value.normalize("NFC"));
    // El backend elimina el espacio exterior antes de validar los caracteres del nombre.
    // Validar el mismo núcleo permite pegar nombres con espacios accidentales sin perder letras.
    setFormData((current) => ({ ...current, [name]: normalizedValue }));
    setHasInvalidNameInput(!isValidNameInput(normalizedValue.trim()));
  };

  /**
   * Valida el email en tiempo real sin modificar silenciosamente lo escrito.
   * Eliminar espacios o caracteres inválidos podría transformar una dirección
   * equivocada en otra dirección válida y enviar el mensaje a un destinatario distinto.
   */
  const handleValidateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.normalize("NFC");

    setFormData((current) => ({ ...current, email: value }));
    // El backend elimina únicamente espacios exteriores antes de validar. Aplicar
    // el mismo criterio permite pegar una dirección con espacios accidentales sin
    // modificarla mientras se escribe ni discrepar con la respuesta del servidor.
    setIsValidEmail(isValidContactEmail(value));
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleValidateMessage = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const limitedValue = truncateContactMessage(value);
    setFormData((current) => ({ ...current, [name]: limitedValue }));
    setHasInvalidMessageInput(containsUnsupportedContactMessageControl(limitedValue));
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
      // Algunos navegadores no informan el MIME o usan application/octet-stream.
      // En esos casos se permite continuar por extensión; si informan un MIME concreto,
      // debe corresponder con ella. El backend valida después la firma real del contenido.
      if (!hasAllowedContactFileMetadata(file.name, file.type)) {
        clearSelectedFile();
        showToast("contacto_ArchivoNoJPG-PDF", 4000, "error");
        return;
      }
      // Un adjunto vacío nunca puede superar la validación de contenido del backend.
      // Rechazarlo aquí evita solicitar un token y subir un cuerpo que terminaría en 400.
      if (file.size === 0) {
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
    !hasNameValidationError &&
    !hasInvalidMessageInput &&
    isContactFormComplete(
      formData,
      hasNameLetter(formData.name),
      isValidEmail,
      isPrivacyChecked,
      formData.captchaToken !== ""
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
      // Los metadatos del formulario se muestran en desarrollo mediante el logger
      // cliente. En producción, los mensajes informativos propios quedan silenciados.
      clientLogger.info("📤 Enviando formulario:", {
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
        captchaToken: "",
        file: null,
      });
      setIsValidEmail(false);
      setHasInvalidNameInput(false);
      setHasInvalidMessageInput(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsPrivacyChecked(false);
      onSubmit();
    } catch (error: unknown) {
      if (!isFormSubmissionCancelled(error) && isMountedRef.current) {
        clientLogger.error("Error al enviar el formulario:", getErrorMessageForLog(error));
        showToast("contacto_Formulario_Error", 4000, "error");
      }
    } finally {
      if (isMountedRef.current) {
        setFormData((current) => ({ ...current, captchaToken: "" }));
        setCaptchaResetSignal((current) => current + 1);
      }
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
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
    >
      <div>
        <h3 aria-level={2} className="text-center">{intl.formatMessage({ id: "contacto_Titulo_Formulario" })}</h3>
        <label htmlFor="name">{intl.formatMessage({ id: "contacto_Nombre" })}</label>
        <input
          type="text"
          autoComplete="name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleValidateName}
          required
          className={styles.nameInput}
          aria-invalid={hasNameValidationError}
          aria-describedby={hasNameValidationError ? "nameValidationError" : undefined}
        />
        {hasNameValidationError && (
          <span id="nameValidationError" className={styles.validationError} role="alert">
            {intl.formatMessage({ id: "contacto_NombreInvalido" })}
          </span>
        )}
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
          className={hasEmailValidationError ? styles.emailInvalid : styles.emailValid}
          aria-invalid={hasEmailValidationError}
          aria-describedby={hasEmailValidationError ? "emailValidationError" : undefined}
        />
        {hasEmailValidationError && (
          <span id="emailValidationError" className="visually-hidden" role="alert">
            {intl.formatMessage({ id: "contacto_EmailInvalido" })}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="message">{intl.formatMessage({ id: "contacto_Mensaje" })}</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleValidateMessage}
          required
          aria-invalid={hasInvalidMessageInput}
          aria-describedby={hasInvalidMessageInput ? "messageValidationError" : undefined}
        ></textarea>
        {hasInvalidMessageInput && (
          <span id="messageValidationError" className={styles.validationError} role="alert">
            {intl.formatMessage({ id: "contacto_MensajeCaracteresInvalidos" })}
          </span>
        )}
      </div>

      <div id="fileUploadDescription" className={styles.archiveText}>
        <span>{intl.formatMessage({ id: "contacto_SubirArchivo1" })}</span>
        <span className="fs-14p">{intl.formatMessage({ id: "contacto_SubirArchivo2" })}</span>
        {isFileRequired && (
          <span className="fs-14p" role="status">
            {intl.formatMessage({ id: "contacto_ArchivoObligatorio" })}
          </span>
        )}
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
            aria-label={intl.formatMessage({ id: "contacto_BotonSubirArchivo" })}
            aria-describedby="fileUploadDescription fileUploadName"
            aria-required={formData.reason === "factura" || formData.reason === "curriculum"}
          />
          <button
            type="button"
            className={`btn btn-outline-secondary ${styles.fileButton} ${!prefersReducedMotion && isPushingFile ? "animate-push" : ""}`}
            onClick={() => {
              if (!prefersReducedMotion) {
                setIsPushingFile(true);
              }
              fileInputRef.current?.click();
            }}
            onAnimationEnd={() => setIsPushingFile(false)}
            aria-controls="fileUpload"
            aria-describedby="fileUploadDescription fileUploadName"
          >
            <span>{intl.formatMessage({ id: "contacto_BotonSubirArchivo" })}</span>
          </button>
        </div>
        <div
          id="fileUploadName"
          className={`text-center ${styles.fileNameBox}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {formData.file ? formData.file.name : intl.formatMessage({ id: "contacto_Archivo" })}
        </div>
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
              aria-required="true"
              aria-labelledby="privacyCheckText"
            />
            {isPrivacyChecked && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L6 12L14 4" stroke="green" strokeWidth="3" />
              </svg>
            )}
          </label>
          <span id="privacyCheckText" className={styles.checkText}>
            <span className={styles.privacyConsentText}>
              {intl.formatMessage({ id: "contacto_PoliticaPrivacidad_1" })}
            </span>
            <Link href="/politica-privacidad" className={styles.link}>
              <span>{intl.formatMessage({ id: "contacto_PoliticaPrivacidad_2" })}</span>
            </Link>
          </span>
        </div>
      </div>

      <Captcha
        resetSignal={captchaResetSignal}
        onTokenChange={(token) => {
          setFormData((current) => ({ ...current, captchaToken: token ?? "" }));
        }}
      />

      <button
        type="submit"
        className={`btn btn-primary mt-25p mx-auto ${styles.submitButton} ${!prefersReducedMotion && isPushingSend ? "animate-push" : ""}`}
        disabled={!isFormComplete() || isSubmitting}
        onClick={() => {
          if (!prefersReducedMotion) {
            setIsPushingSend(true);
          }
        }}
        onAnimationEnd={() => setIsPushingSend(false)}
        aria-disabled={!isFormComplete() || isSubmitting}
      >
        {isSubmitting ? intl.formatMessage({ id: "contacto_BotonEnviando" }) : intl.formatMessage({ id: "contacto_BotonEnviar" })}
      </button>
    </form>
  );
};

export default Form;
