export const MAX_CONTACT_NAME_CHARACTERS = 100;
export const MAX_CONTACT_MESSAGE_CHARACTERS = 5000;

/**
 * Recorta por puntos de código Unicode, igual que los límites de longitud de Pydantic.
 * `String.length` y `maxLength` cuentan dos unidades para caracteres suplementarios.
 */
const truncateByUnicodeCharacters = (value: string, maxCharacters: number): string =>
  Array.from(value).slice(0, maxCharacters).join("");

/**
 * Conserva el espacio exterior escrito, pero limita el nombre después de aplicar el
 * mismo `strip` conceptual que ejecuta el backend antes de comprobar sus 100 caracteres.
 * Así un nombre válido pegado con espacios delante o detrás no pierde letras.
 */
export const truncateContactName = (value: string): string => {
  const trimmedValue = value.trim();
  if (trimmedValue === "") {
    return value;
  }

  const leadingWhitespaceLength = value.length - value.trimStart().length;
  const trailingWhitespaceStart = value.trimEnd().length;
  const leadingWhitespace = value.slice(0, leadingWhitespaceLength);
  const trailingWhitespace = value.slice(trailingWhitespaceStart);

  return `${leadingWhitespace}${truncateByUnicodeCharacters(
    trimmedValue,
    MAX_CONTACT_NAME_CHARACTERS
  )}${trailingWhitespace}`;
};

export const truncateContactMessage = (value: string): string =>
  truncateByUnicodeCharacters(value, MAX_CONTACT_MESSAGE_CHARACTERS);

/**
 * Rechaza controles y separadores Unicode distintos del espacio normal antes de
 * recortar los extremos. De otro modo tabuladores, saltos o espacios invisibles
 * podrían desaparecer silenciosamente y convertir una entrada inválida en otra válida.
 */
export const containsUnsupportedContactNameCharacter = (value: string): boolean =>
  Array.from(value).some((character) =>
    character !== " " && /[\p{C}\p{Z}]/u.test(character)
  );

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
  isPrivacyChecked: boolean,
  isCaptchaVerified: boolean
): boolean =>
  hasValidName &&
  data.email.trim() !== "" &&
  data.message.trim() !== "" &&
  data.reason !== "" &&
  isValidEmail &&
  isPrivacyChecked &&
  isCaptchaVerified &&
  ((data.reason !== "factura" && data.reason !== "curriculum") || data.file != null);
