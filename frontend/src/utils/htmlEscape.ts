/** Escapa texto antes de insertarlo en una cadena HTML controlada. */
export const escapeHtmlText = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      default: return "&#39;";
    }
  });

/** Los atributos usan el mismo escape porque siempre se delimitan mediante comillas dobles. */
export const escapeHtmlAttribute = escapeHtmlText;
