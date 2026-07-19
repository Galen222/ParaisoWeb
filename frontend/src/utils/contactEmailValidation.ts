const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 253;
const MAX_DOMAIN_LABEL_LENGTH = 63;
const MIN_TOP_LEVEL_DOMAIN_LENGTH = 2;

const LOCAL_PART_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const DOMAIN_INITIAL_CHARACTER_PATTERN = /^[\p{L}\p{N}]$/u;
const DOMAIN_CHARACTER_PATTERN = /^[\p{L}\p{N}\p{M}]$/u;
const DOMAIN_LETTER_PATTERN = /^\p{L}$/u;
const DOMAIN_MARK_PATTERN = /^\p{M}$/u;

/**
 * Valida literalmente el correo escrito por el usuario.
 *
 * No recorta espacios, no cambia mayúsculas/minúsculas, no normaliza Unicode y
 * no transforma el dominio a punycode. El backend aplica las mismas reglas en
 * Python antes de procesar el formulario.
 *
 * Reglas del formulario:
 * - una única dirección simple con exactamente un carácter `@`;
 * - parte local ASCII de tipo dot-atom, con un máximo de 64 caracteres;
 * - dominio con letras Unicode, números, marcas combinantes y guiones;
 * - al menos dos etiquetas y un sufijo final de dos caracteres con alguna letra;
 * - máximos de 63 caracteres por etiqueta, 253 para el dominio y 254 en total.
 */
export const validateContactEmail = (value: string): string | null => {
  const valueCharacters = Array.from(value);
  if (valueCharacters.length === 0 || valueCharacters.length > MAX_EMAIL_LENGTH) {
    return null;
  }

  const separatorIndex = value.indexOf("@");
  if (
    separatorIndex <= 0 ||
    separatorIndex !== value.lastIndexOf("@") ||
    separatorIndex === value.length - 1
  ) {
    return null;
  }

  const localPart = value.slice(0, separatorIndex);
  const domain = value.slice(separatorIndex + 1);
  const localCharacters = Array.from(localPart);
  const domainCharacters = Array.from(domain);

  if (
    localCharacters.length > MAX_LOCAL_PART_LENGTH ||
    domainCharacters.length > MAX_DOMAIN_LENGTH ||
    !LOCAL_PART_PATTERN.test(localPart) ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return null;
  }

  const labels = domain.split(".");
  if (labels.length < 2) {
    return null;
  }

  for (const label of labels) {
    const labelCharacters = Array.from(label);
    if (labelCharacters.length === 0 || labelCharacters.length > MAX_DOMAIN_LABEL_LENGTH) {
      return null;
    }

    if (!DOMAIN_INITIAL_CHARACTER_PATTERN.test(labelCharacters[0])) {
      return null;
    }

    if (labelCharacters[labelCharacters.length - 1] === "-") {
      return null;
    }

    let previousWasHyphen = false;
    for (const character of labelCharacters) {
      if (character === "-") {
        previousWasHyphen = true;
        continue;
      }

      if (!DOMAIN_CHARACTER_PATTERN.test(character)) {
        return null;
      }
      if (previousWasHyphen && DOMAIN_MARK_PATTERN.test(character)) {
        return null;
      }
      previousWasHyphen = false;
    }
  }

  const topLevelDomain = Array.from(labels[labels.length - 1]);
  if (
    topLevelDomain.length < MIN_TOP_LEVEL_DOMAIN_LENGTH ||
    !topLevelDomain.some((character) => DOMAIN_LETTER_PATTERN.test(character))
  ) {
    return null;
  }

  return value;
};

/** Indica si el correo literal cumple las reglas del formulario. */
export const isValidContactEmail = (value: string): boolean =>
  validateContactEmail(value) !== null;
