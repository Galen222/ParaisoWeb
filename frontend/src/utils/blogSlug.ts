/** Longitud máxima de la columna `blog.slug` en MySQL. */
export const MAX_BLOG_SLUG_LENGTH = 150;

/**
 * Normaliza un slug y comprueba la misma forma canónica que produce `slugify`:
 * letras/números Unicode, marcas combinadas válidas y guiones simples interiores.
 */
export const normalizeBlogSlug = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const slug = value.normalize("NFC");
  const slugLength = Array.from(slug).length;
  if (slugLength === 0 || slugLength > MAX_BLOG_SLUG_LENGTH) {
    return null;
  }

  let previousWasAlphanumericOrMark = false;
  let hasAlphanumeric = false;

  for (const character of slug) {
    if (character === "-") {
      if (!previousWasAlphanumericOrMark) {
        return null;
      }
      previousWasAlphanumericOrMark = false;
      continue;
    }

    if (/^[\p{L}\p{N}]$/u.test(character)) {
      hasAlphanumeric = true;
      previousWasAlphanumericOrMark = true;
      continue;
    }

    if (/^\p{M}$/u.test(character) && previousWasAlphanumericOrMark) {
      continue;
    }

    return null;
  }

  return hasAlphanumeric && previousWasAlphanumericOrMark ? slug : null;
};

export const isValidBlogSlug = (value: unknown): value is string =>
  normalizeBlogSlug(value) !== null;
