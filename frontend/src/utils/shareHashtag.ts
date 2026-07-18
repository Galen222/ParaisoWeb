/** Nombre de marca utilizado cuando el título no contiene letras ni números. */
const DEFAULT_FACEBOOK_HASHTAG = "ElParaisoDelJamon";

/**
 * Construye un hashtag de Facebook eliminando espacios, puntuación, símbolos y
 * caracteres de control sin retirar letras Unicode válidas del título.
 */
export const buildFacebookHashtag = (title: string): string => {
  const sanitizedTitle = title
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}_]+/gu, "");

  return `#${sanitizedTitle || DEFAULT_FACEBOOK_HASHTAG}`;
};
