/**
 * Controles bidireccionales que pueden hacer que el texto se muestre en un orden
 * distinto al contenido validado o registrado.
 */
const BIDI_CONTROL_PATTERN = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
const ALLOWED_FORMAT_CHARACTERS = new Set(["\u00AD", "\u200C", "\u200D"]);

/** Comprueba que el texto contiene al menos un carácter realmente visible. */
const hasVisibleCharacter = (value: string): boolean =>
  Array.from(value).some((character) => /[\p{L}\p{N}\p{P}\p{S}]/u.test(character));

/**
 * Rechaza controles incompatibles con contenido público. En campos multilínea se
 * conservan únicamente tabulador, salto de línea y retorno de carro.
 */
const hasUnsupportedControl = (value: string, multiline: boolean): boolean =>
  Array.from(value).some((character) => {
    if (multiline && (character === "\t" || character === "\n" || character === "\r")) {
      return false;
    }

    return (
      (/\p{C}/u.test(character) && !ALLOWED_FORMAT_CHARACTERS.has(character)) ||
      /[\p{Zl}\p{Zp}]/u.test(character) ||
      BIDI_CONTROL_PATTERN.test(character)
    );
  });

/** Valida textos públicos de una sola línea, como títulos, autores o categorías. */
export const isSafePublicSingleLineText = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim() !== "" &&
  hasVisibleCharacter(value) &&
  !hasUnsupportedControl(value, false);

/** Valida textos públicos multilínea, conservando los saltos de línea normales. */
export const isSafePublicMultilineText = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim() !== "" &&
  hasVisibleCharacter(value) &&
  !hasUnsupportedControl(value, true);
