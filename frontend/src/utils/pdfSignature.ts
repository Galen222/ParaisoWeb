const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d] as const; // %PDF-
const PDF_HEADER_SEARCH_BYTES = 1024;
const PDF_COMMENT_MARKER = 0x25; // %
const PDF_LINE_FEED = 0x0a;
const PDF_CARRIAGE_RETURN = 0x0d;
const PDF_WHITESPACE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]);

/**
 * Acepta únicamente espacio PDF y líneas de comentario completas antes de la cabecera.
 * Si `%PDF-` aparece dentro de una línea que ya empezó por `%`, forma parte del
 * comentario y no constituye una cabecera válida.
 */
const hasValidPdfPrefix = (bytes: Uint8Array, markerOffset: number): boolean => {
  let inComment = false;
  let lineContainsOnlyWhitespace = true;

  for (let index = 0; index < markerOffset; index += 1) {
    const byte = bytes[index];

    if (inComment) {
      if (byte === PDF_LINE_FEED || byte === PDF_CARRIAGE_RETURN) {
        inComment = false;
        lineContainsOnlyWhitespace = true;
      }
      continue;
    }

    if (byte === PDF_LINE_FEED || byte === PDF_CARRIAGE_RETURN) {
      lineContainsOnlyWhitespace = true;
      continue;
    }

    if (byte === PDF_COMMENT_MARKER && lineContainsOnlyWhitespace) {
      inComment = true;
      continue;
    }

    if (PDF_WHITESPACE.has(byte)) {
      continue;
    }

    return false;
  }

  // El marcador encontrado en la misma línea que un comentario sigue comentado.
  return !inComment;
};

/**
 * Comprueba una cabecera PDF real dentro de los primeros 1024 bytes. Algunas
 * herramientas anteponen espacio o comentarios, pero no se acepta contenido
 * arbitrario ni un marcador `%PDF-` incluido dentro de una línea comentada.
 */
export const hasPdfSignature = async (blob: Blob): Promise<boolean> => {
  const headerBytes = new Uint8Array(
    await blob.slice(0, PDF_HEADER_SEARCH_BYTES).arrayBuffer()
  );

  for (let offset = 0; offset <= headerBytes.length - PDF_SIGNATURE.length; offset += 1) {
    const matches = PDF_SIGNATURE.every(
      (byte, index) => headerBytes[offset + index] === byte
    );
    if (matches && hasValidPdfPrefix(headerBytes, offset)) {
      return true;
    }
  }

  return false;
};
