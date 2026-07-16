// utils/pdfSignature.ts

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d] as const; // %PDF-
const PDF_HEADER_SEARCH_BYTES = 1024;

/**
 * Comprueba la cabecera PDF dentro de los primeros 1024 bytes. El estándar
 * permite que exista contenido previo a `%PDF-`, por lo que exigir byte cero
 * rechazaría documentos válidos generados por algunas herramientas.
 */
export const hasPdfSignature = async (blob: Blob): Promise<boolean> => {
  const headerBytes = new Uint8Array(
    await blob.slice(0, PDF_HEADER_SEARCH_BYTES).arrayBuffer()
  );

  for (let offset = 0; offset <= headerBytes.length - PDF_SIGNATURE.length; offset += 1) {
    const matches = PDF_SIGNATURE.every(
      (byte, index) => headerBytes[offset + index] === byte
    );
    if (matches) {
      return true;
    }
  }

  return false;
};
