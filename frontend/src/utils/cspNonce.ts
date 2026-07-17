/**
 * Obtiene el nonce aplicado por Next.js a sus scripts del documento.
 * Se usa únicamente en el navegador al crear scripts externos de Google.
 */
export const getDocumentCspNonce = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const script = document.querySelector<HTMLScriptElement>("script[nonce]");
  return script?.nonce || undefined;
};
