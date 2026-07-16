/**
 * Construye un URI telefónico sin separadores visuales.
 * El texto mostrado puede conservar espacios, pero el destino debe contener solo
 * el prefijo internacional opcional y sus dígitos para funcionar de forma uniforme.
 */
export const buildTelephoneHref = (telephone: string): string => {
  const normalizedTelephone = telephone.normalize("NFKC").trim();
  const internationalPrefix = normalizedTelephone.startsWith("+") ? "+" : "";
  const digits = normalizedTelephone.replace(/\D/g, "");

  return `tel:${internationalPrefix}${digits}`;
};
