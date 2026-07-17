/** Caracteres de formato legítimos en escrituras y emojis compuestos. */
const ALLOWED_MESSAGE_FORMAT_CHARACTERS = new Set(["\u200c", "\u200d"]);

/**
 * Detecta controles Unicode que no deben llegar al cuerpo del correo.
 * Conserva tabuladores, saltos normales, ZWNJ y ZWJ.
 */
export const containsUnsupportedContactMessageControl = (value: string): boolean =>
  Array.from(value).some((character) => {
    if (
      character === "\t" ||
      character === "\n" ||
      character === "\r" ||
      ALLOWED_MESSAGE_FORMAT_CHARACTERS.has(character)
    ) {
      return false;
    }

    return /[\p{C}\p{Zl}\p{Zp}]/u.test(character);
  });
