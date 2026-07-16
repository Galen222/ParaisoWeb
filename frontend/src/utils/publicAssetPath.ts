/** Número máximo de capas de codificación aceptadas antes de considerar la ruta ambigua. */
const MAX_DECODE_PASSES = 5;

/** Decodifica un segmento hasta estabilizarlo y evita cadenas codificadas de forma recursiva. */
const decodePathSegment = (segment: string): string | null => {
  let decodedSegment = segment;

  try {
    for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
      const nextValue = decodeURIComponent(decodedSegment);
      if (nextValue === decodedSegment) {
        return nextValue;
      }
      decodedSegment = nextValue;
    }
  } catch {
    return null;
  }

  // Una ruta que todavía cambia tras varias pasadas es deliberadamente ambigua.
  return null;
};

/** Comprueba que una ruta de imagen procedente de la API permanezca dentro del directorio público esperado. */
export const isSafePublicAssetPath = (value: unknown): value is string => {
  if (typeof value !== "string" || value === "" || value.trim() !== value) {
    return false;
  }

  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    /[?#\p{Cc}\p{Cf}]/u.test(value)
  ) {
    return false;
  }

  const segments = value.split("/");
  return segments.every((segment) => {
    if (segment === "") {
      return false;
    }

    const decodedSegment = decodePathSegment(segment);
    return (
      decodedSegment !== null &&
      decodedSegment !== "." &&
      decodedSegment !== ".." &&
      !decodedSegment.includes("/") &&
      !decodedSegment.includes("\\") &&
      !/[\p{Cc}\p{Cf}]/u.test(decodedSegment)
    );
  });
};
