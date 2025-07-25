// hooks/useCurrentUrl.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Hook personalizado para obtener la URL actual de la página en el navegador.
 * Devuelve la URL completa (incluyendo protocolo, dominio y path) y la actualiza automáticamente
 * cada vez que cambia la ruta en la aplicación Next.js (por ejemplo, al cambiar de idioma o navegar).
 *
 * @returns {string} La URL actual del navegador.
 */
const useCurrentUrl = (): string => {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
    // Se actualiza cada vez que cambia la ruta (por navegación SPA o cambio de idioma)
  }, [router.asPath]);

  return currentUrl;
};

export default useCurrentUrl;
