const GENERIC_FILE_MIME_TYPES = new Set(["", "application/octet-stream"]);
const ALLOWED_FILE_EXTENSIONS_BY_MIME_TYPE: Readonly<Record<string, ReadonlySet<string>>> = {
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "application/pdf": new Set([".pdf"]),
};
const ALLOWED_FILE_EXTENSIONS = new Set(
  Object.values(ALLOWED_FILE_EXTENSIONS_BY_MIME_TYPE).flatMap((extensions) => [
    ...extensions,
  ])
);

/** Obtiene la extensión final normalizada de un nombre de archivo. */
const getFileExtension = (fileName: string): string => {
  const extensionSeparatorIndex = fileName.lastIndexOf(".");
  return extensionSeparatorIndex >= 0
    ? fileName.slice(extensionSeparatorIndex).toLowerCase()
    : "";
};

/**
 * Valida los metadatos que el navegador conoce antes de subir el adjunto.
 * Si el navegador informa un MIME concreto, debe coincidir con la extensión;
 * con MIME ausente o genérico se permite continuar por extensión y el backend
 * conserva la validación definitiva mediante la firma real del contenido.
 */
export const hasAllowedContactFileMetadata = (
  fileName: string,
  mimeType: string
): boolean => {
  const fileExtension = getFileExtension(fileName);
  if (!ALLOWED_FILE_EXTENSIONS.has(fileExtension)) {
    return false;
  }

  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (GENERIC_FILE_MIME_TYPES.has(normalizedMimeType)) {
    return true;
  }

  return Boolean(
    ALLOWED_FILE_EXTENSIONS_BY_MIME_TYPE[normalizedMimeType]?.has(fileExtension)
  );
};
