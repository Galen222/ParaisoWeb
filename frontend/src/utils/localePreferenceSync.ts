export interface LocalePreferenceSnapshot {
  locale: string;
  personalizationEnabled: boolean;
}

/**
 * Solo persiste cambios reales de idioma cuando la personalización ya estaba activa.
 * Una restauración de consentimiento desde otra pestaña no debe sobrescribir la cookie
 * `NEXT_LOCALE` que acaba de guardar la pestaña donde el usuario tomó la decisión.
 */
export const shouldPersistLocalePreference = (
  previous: LocalePreferenceSnapshot,
  current: LocalePreferenceSnapshot
): boolean =>
  previous.personalizationEnabled &&
  current.personalizationEnabled &&
  previous.locale !== current.locale;
