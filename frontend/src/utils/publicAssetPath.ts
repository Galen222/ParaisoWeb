/** Comprueba que una ruta de imagen procedente de la API permanezca dentro del directorio público esperado. */
export const isSafePublicAssetPath = (value: unknown): value is string => {
  if (typeof value !== "string" || value === "" || value.trim() !== value) {
    return false;
  }

  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    /[?#\u0000-\u001F\u007F]/u.test(value)
  ) {
    return false;
  }

  const segments = value.split("/");
  return segments.every((segment) => {
    if (segment === "") {
      return false;
    }

    try {
      const decodedSegment = decodeURIComponent(segment);
      return (
        decodedSegment !== "." &&
        decodedSegment !== ".." &&
        !decodedSegment.includes("/") &&
        !decodedSegment.includes("\\") &&
        !/[\u0000-\u001F\u007F]/u.test(decodedSegment)
      );
    } catch {
      return false;
    }
  });
};
