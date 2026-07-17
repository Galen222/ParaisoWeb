import validator from "validator";

const MAX_EMAIL_BYTES = 254;
const MAX_DOMAIN_BYTES = 253;
const MAX_DOMAIN_LABEL_BYTES = 63;
const IDNA_NORMALIZATION_SUFFIX = ".invalid";
const IDNA_DOT_EQUIVALENTS_PATTERN = /[\u3002\uFF0E\uFF61]/g;
// EmailStr rechaza caracteres Unicode de control/formato/uso privado y separadores.
const UNSUPPORTED_EMAIL_CHARACTER_PATTERN = /[\p{C}\p{Z}]/u;
const SPECIAL_USE_DOMAIN_SUFFIXES = new Set(["arpa", "invalid", "local", "localhost", "onion", "test"]);

/**
 * Convierte el dominio a su representación ASCII aplicando la misma normalización IDNA
 * que usa el navegador. El sufijo temporal evita que WHATWG URL interprete como IPv4
 * dominios válidos cuyo último label tiene aspecto hexadecimal, por ejemplo `0xb`.
 */
const normalizeDomainToAscii = (domain: string): string | null => {
  try {
    const normalizedHost = new URL(`http://${domain}${IDNA_NORMALIZATION_SUFFIX}`).hostname.toLowerCase();
    if (!normalizedHost.endsWith(IDNA_NORMALIZATION_SUFFIX)) {
      return null;
    }

    return normalizedHost.slice(0, -IDNA_NORMALIZATION_SUFFIX.length);
  } catch {
    return null;
  }
};

/** Comprueba si el dominio pertenece a un sufijo reservado que el backend tampoco admite. */
const isSpecialUseDomain = (asciiDomain: string): boolean =>
  Array.from(SPECIAL_USE_DOMAIN_SUFFIXES).some(
    (suffix) => asciiDomain === suffix || asciiDomain.endsWith(`.${suffix}`)
  );

/**
 * Valida el correo del formulario con las mismas fronteras que Pydantic `EmailStr`.
 * `validator` cubre el átomo local y la sintaxis básica; las comprobaciones adicionales
 * alinean IDNA, longitud UTF-8, TLD y dominios reservados con la validación del backend.
 */
export const isValidContactEmail = (value: string): boolean => {
  const email = value.trim();

  if (
    email.length === 0 ||
    new TextEncoder().encode(email).length > MAX_EMAIL_BYTES ||
    email.includes('"') ||
    UNSUPPORTED_EMAIL_CHARACTER_PATTERN.test(email)
  ) {
    return false;
  }

  const separatorIndex = email.lastIndexOf("@");
  if (
    separatorIndex <= 0 ||
    separatorIndex !== email.indexOf("@") ||
    separatorIndex === email.length - 1
  ) {
    return false;
  }

  const domain = email.slice(separatorIndex + 1);
  // UTS #46 trata estos tres separadores como puntos ASCII. EmailStr aplica esa
  // normalización IDNA, por lo que el navegador debe validar la misma dirección.
  const normalizedDomain = domain.replace(IDNA_DOT_EQUIVALENTS_PATTERN, ".");
  const normalizedEmail = `${email.slice(0, separatorIndex)}@${normalizedDomain}`;
  if (!normalizedDomain.includes(".")) {
    return false;
  }

  // EmailStr admite TLD de un carácter y no aplica el límite histórico de 64 bytes
  // a la parte local, pero sí limita la dirección completa a 254 bytes.
  if (
    !validator.isEmail(normalizedEmail, {
      require_tld: false,
      ignore_max_length: true,
      blacklisted_chars: '"',
    })
  ) {
    return false;
  }

  const asciiDomain = normalizeDomainToAscii(normalizedDomain);
  if (asciiDomain === null || asciiDomain.length > MAX_DOMAIN_BYTES) {
    return false;
  }

  const labels = asciiDomain.split(".");
  if (
    labels.length < 2 ||
    labels.some((label) => label.length === 0 || label.length > MAX_DOMAIN_LABEL_BYTES)
  ) {
    return false;
  }

  const topLevelDomain = labels[labels.length - 1];
  if (!topLevelDomain || !/[a-z]$/i.test(topLevelDomain) || isSpecialUseDomain(asciiDomain)) {
    return false;
  }

  // RFC 5890 reserva el patrón de dos caracteres seguidos de `--` exclusivamente
  // para etiquetas Punycode que empiecen por `xn--`.
  return labels.every(
    (label) => !(label.length >= 4 && label.slice(2, 4) === "--" && !label.startsWith("xn--"))
  );
};
