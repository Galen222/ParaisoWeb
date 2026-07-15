const CONSENT_POLICY_PATHS = new Set(["/politica-cookies", "/politica-privacidad"]);

/** Decide si debe reaparecer el modal tras consultar las políticas sin guardar una elección. */
export const shouldReopenConsentModal = (
  isReviewingConsentPolicy: boolean,
  pathname: string,
  savedPreference?: string
): boolean =>
  isReviewingConsentPolicy &&
  !CONSENT_POLICY_PATHS.has(pathname) &&
  !savedPreference;
