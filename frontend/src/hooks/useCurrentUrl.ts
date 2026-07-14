// hooks/useCurrentUrl.ts
import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/router";

/**
 * Hook personalizado para obtener la URL actual de la página en el navegador.
 * Devuelve la URL completa (incluyendo protocolo, dominio y path) y la actualiza automáticamente
 * cada vez que cambia la ruta en la aplicación Next.js (por ejemplo, al cambiar de idioma o navegar).
 *
 * @returns {string} La URL actual del navegador.
 */
const useCurrentUrl = (): string => {
  const router = useRouter();

  const subscribe = useCallback(
    (onUrlChange: () => void): (() => void) => {
      // Next.js emite eventos distintos para cambios de ruta y cambios únicamente en el hash.
      router.events.on("routeChangeComplete", onUrlChange);
      router.events.on("hashChangeComplete", onUrlChange);

      return () => {
        router.events.off("routeChangeComplete", onUrlChange);
        router.events.off("hashChangeComplete", onUrlChange);
      };
    },
    [router.events]
  );

  const getCurrentUrl = useCallback((): string => window.location.href, []);
  const getServerUrl = useCallback((): string => "", []);

  return useSyncExternalStore(subscribe, getCurrentUrl, getServerUrl);
};

export default useCurrentUrl;
