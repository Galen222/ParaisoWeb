// hooks/useLocaleChange.ts

import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { useCookieConsent } from "../contexts/CookieContext";
import { getBlogPostBySlug, getBlogPostById } from "../services/blogService";
import { getTimedToken } from "../services/tokenService";
import {
  clearLocalePreference,
  getCookieValue,
  saveLocalePreference,
} from "../utils/cookieUtils";
import { normalizeBlogSlug } from "../utils/blogSlug";
import { buildBlogPath } from "../utils/blogPath";
import { clientLogger } from "../logging/clientLogger";

const SUPPORTED_LOCALES = new Set(["es", "en", "de"]);

/** Devuelve un mensaje breve para depurar sin registrar respuestas, cabeceras ni tokens. */
const getErrorMessageForLog = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error desconocido";
};

/** Conserva query y fragmento al cambiar únicamente el slug o el locale. */
const getRouteSuffix = (asPath: string): string => {
  const queryIndex = asPath.indexOf("?");
  const hashIndex = asPath.indexOf("#");
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  return indexes.length > 0 ? asPath.slice(Math.min(...indexes)) : "";
};

/**
 * Tipo de la función que cambia el idioma de la aplicación.
 */
export type LocaleChangeHandler = (newLocale: string) => Promise<void>;

/**
 * Hook que maneja el cambio de idioma y actualiza la cookie de idioma si se permite la personalización.
 *
 * @returns {LocaleChangeHandler} Función para cambiar el idioma.
 */
export function useLocaleChange(): LocaleChangeHandler {
  const router = useRouter();
  const { cookieConsentPersonalization } = useCookieConsent();
  const localeChangeSequenceRef = useRef(0);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const activeNavigationLocaleRef = useRef<string | null>(null);
  const stableLocalePreferenceRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      activeRequestControllerRef.current?.abort();
      activeRequestControllerRef.current = null;
      activeNavigationLocaleRef.current = null;
    };
  }, []);

  /**
   * Cambia el idioma de la aplicación y guarda en cookies si se permite la personalización.
   *
   * @param {string} newLocale - Nuevo idioma a establecer (por ejemplo, 'es', 'en', 'de').
   */
  const handleLocaleChange = useCallback(
    async (newLocale: string) => {
      // Ignora valores ajenos a los idiomas configurados para no generar rutas ni cookies inválidas.
      if (!SUPPORTED_LOCALES.has(newLocale)) {
        clientLogger.error(`Cambio de idioma ignorado: locale no soportado "${newLocale}".`);
        return;
      }

      // Pulsar el locale actual mientras otro cambio sigue pendiente significa cancelar
      // la elección anterior. El retorno temprano previo dejaba viva aquella petición o
      // navegación y podía terminar cambiando el idioma después de la última pulsación.
      if (newLocale === router.locale) {
        const pendingController = activeRequestControllerRef.current;
        const pendingNavigationLocale = activeNavigationLocaleRef.current;
        if (pendingController === null) {
          return;
        }

        pendingController.abort();
        activeRequestControllerRef.current = null;
        activeNavigationLocaleRef.current = null;
        ++localeChangeSequenceRef.current;

        if (cookieConsentPersonalization) {
          const stableLocalePreference = stableLocalePreferenceRef.current;
          if (stableLocalePreference && SUPPORTED_LOCALES.has(stableLocalePreference)) {
            saveLocalePreference(stableLocalePreference);
          } else {
            clearLocalePreference();
          }
        }

        // AbortController detiene las consultas del blog, pero no una transición de Next.js
        // que ya haya comenzado. Una sustitución hacia el locale que el usuario acaba de
        // confirmar invalida esa transición sin añadir otra entrada al historial.
        if (pendingNavigationLocale && pendingNavigationLocale !== newLocale) {
          try {
            await router.replace(router.asPath, router.asPath, { locale: newLocale });
          } catch (error: unknown) {
            clientLogger.error(
              "No se pudo cancelar el cambio de idioma pendiente:",
              getErrorMessageForLog(error)
            );
          }
        }
        return;
      }

      // Conserva la preferencia estable anterior únicamente al iniciar una secuencia nueva.
      // Una segunda pulsación rápida no debe tomar como referencia la cookie provisional
      // escrita por la primera navegación todavía pendiente.
      if (activeRequestControllerRef.current === null) {
        const savedLocalePreference = getCookieValue("_locale");
        stableLocalePreferenceRef.current =
          savedLocalePreference && SUPPORTED_LOCALES.has(savedLocalePreference)
            ? savedLocalePreference
            : undefined;
      }

      // Cada solicitud invalida y cancela las anteriores para que una respuesta lenta no
      // sobrescriba el último idioma elegido ni siga consumiendo token, red y rate limit.
      activeRequestControllerRef.current?.abort();
      const controller = new AbortController();
      activeRequestControllerRef.current = controller;
      const localeChangeSequence = ++localeChangeSequenceRef.current;
      const routeSuffix = getRouteSuffix(router.asPath);
      let newPath = router.asPath;

      // Verifica si estás en la página `[slug]`
      if (router.pathname === "/blog/[slug]") {
        const slug = typeof router.query.slug === "string" ? router.query.slug : null;

        // No solicita tokens ni artículos cuando Next.js todavía no dispone de un slug válido.
        const normalizedSlug = normalizeBlogSlug(slug);
        if (normalizedSlug === null) {
          clientLogger.error("Cambio de idioma del blog ignorado: slug no disponible o inválido.");
          if (activeRequestControllerRef.current === controller) {
            activeRequestControllerRef.current = null;
          }
          return;
        }

        try {
          const token = await getTimedToken(controller.signal);
          if (localeChangeSequence !== localeChangeSequenceRef.current) return;

          // Obtenemos el artículo actual utilizando el slug y el idioma actuales.
          // El idioma evita resolver una traducción distinta cuando dos versiones comparten slug.
          const currentBlogPost = await getBlogPostBySlug(
            normalizedSlug,
            token,
            router.locale || "es",
            controller.signal
          );
          if (localeChangeSequence !== localeChangeSequenceRef.current) return;

          // No consulta la traducción con un identificador vacío, decimal o negativo devuelto por la API.
          if (!Number.isInteger(currentBlogPost.id_noticia) || currentBlogPost.id_noticia <= 0) {
            clientLogger.error("Cambio de idioma del blog cancelado: identificador de artículo inválido.");
            newPath = `/blog${routeSuffix}`;
          } else {
            // Obtenemos el artículo en el nuevo idioma utilizando el ID del artículo actual
            const newBlogPost = await getBlogPostById(
              currentBlogPost.id_noticia,
              newLocale,
              token,
              controller.signal
            );
            if (localeChangeSequence !== localeChangeSequenceRef.current) return;

            const normalizedNewSlug = normalizeBlogSlug(newBlogPost.slug);
            const isExpectedTranslation =
              newBlogPost.id_noticia === currentBlogPost.id_noticia &&
              newBlogPost.idioma === newLocale &&
              normalizedNewSlug !== null;

            if (isExpectedTranslation && normalizedNewSlug) {
              // Construimos la nueva ruta con la forma Unicode canónica del slug traducido.
              newPath = buildBlogPath(normalizedNewSlug, routeSuffix);
            } else {
              // Si la respuesta no corresponde a la traducción solicitada, redirige al blog principal.
              clientLogger.error("Cambio de idioma del blog cancelado: la traducción recibida no es válida.");
              newPath = `/blog${routeSuffix}`;
            }
          }
        } catch (error: unknown) {
          // Una navegación posterior o el desmontaje cancelan de forma intencionada esta lectura.
          if (controller.signal.aborted || localeChangeSequence !== localeChangeSequenceRef.current) return;

          clientLogger.error("Error al obtener la traducción del artículo:", getErrorMessageForLog(error));
          // En caso de error, podríamos redirigir al blog principal
          newPath = `/blog${routeSuffix}`;
        }
      }

      if (localeChangeSequence !== localeChangeSequenceRef.current) return;

      // Si el usuario ha consentido la personalización, actualiza la cookie antes de navegar.
      // Así getServerSideProps recibe ya el nuevo idioma y no redirige de vuelta por leer la preferencia anterior.
      const previousLocalePreference = stableLocalePreferenceRef.current;
      let localePreferenceUpdated = false;
      if (cookieConsentPersonalization) {
        saveLocalePreference(newLocale);
        localePreferenceUpdated = true;
      }

      const restorePreviousLocalePreference = (): void => {
        if (!localePreferenceUpdated || localeChangeSequence !== localeChangeSequenceRef.current) {
          return;
        }

        if (previousLocalePreference && SUPPORTED_LOCALES.has(previousLocalePreference)) {
          saveLocalePreference(previousLocalePreference);
        } else {
          clearLocalePreference();
        }
      };

      // Espera a que termine la navegación para que la promesa del manejador represente el cambio real de idioma.
      try {
        activeNavigationLocaleRef.current = newLocale;
        const navigationCompleted = await router.push(newPath, newPath, { locale: newLocale });
        if (localeChangeSequence === localeChangeSequenceRef.current) {
          if (navigationCompleted) {
            stableLocalePreferenceRef.current = localePreferenceUpdated
              ? newLocale
              : previousLocalePreference;
          } else {
            restorePreviousLocalePreference();
            clientLogger.error("El cambio de idioma fue cancelado antes de completar la navegación.");
          }
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted && localeChangeSequence === localeChangeSequenceRef.current) {
          restorePreviousLocalePreference();
          clientLogger.error("No se pudo completar el cambio de idioma:", getErrorMessageForLog(error));
        }
      } finally {
        if (activeRequestControllerRef.current === controller) {
          activeRequestControllerRef.current = null;
        }
        if (activeNavigationLocaleRef.current === newLocale) {
          activeNavigationLocaleRef.current = null;
        }
      }
    },
    [router, cookieConsentPersonalization]
  );

  return handleLocaleChange;
}
