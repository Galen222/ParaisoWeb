interface ContactFormCompletenessData {
  reason: string;
  email: string;
  message: string;
  file?: File | null;
}

/**
 * Comprueba las reglas que no cubren por completo los atributos HTML nativos del formulario.
 * `hasValidName` se calcula con la validación Unicode específica del componente.
 */
export const isContactFormComplete = (
  data: ContactFormCompletenessData,
  hasValidName: boolean,
  isValidEmail: boolean,
  isPrivacyChecked: boolean
): boolean =>
  hasValidName &&
  data.email.trim() !== "" &&
  data.message.trim() !== "" &&
  data.reason !== "" &&
  isValidEmail &&
  isPrivacyChecked &&
  ((data.reason !== "factura" && data.reason !== "curriculum") || data.file != null);
