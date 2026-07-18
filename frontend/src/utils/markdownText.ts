/**
 * Convierte Markdown en texto legible para metadatos SEO. El contenido visible
 * conserva las palabras de enlaces e imágenes, pero omite destinos, marcas de
 * formato y bloques de código que no aportan una descripción útil.
 */
export const stripMarkdownForSeo = (value: string): string =>
  value
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[([^\]]*)\]\([^\n)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^\n)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-+*]\s+|\d+[.)]\s+)/gm, "")
    .replace(/[*_~]/g, " ")
    .replace(/\\([\\`*_[\]{}()#+.!-])/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
