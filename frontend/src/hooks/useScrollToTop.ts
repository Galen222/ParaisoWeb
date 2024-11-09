import { useState, useEffect } from "react";
import { useIntl } from "react-intl"; // Importar para obtener el idioma actual

export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollButtonStyle: React.CSSProperties;
  scrollToTop: () => void;
}

/**
 * Custom hook que gestiona la visibilidad y el estilo de un botón para desplazarse al inicio de la página.
 *
 * @returns {UseScrollToTopOutput} Un objeto que contiene la visibilidad del botón, el estilo del botón, y la función para desplazarse al inicio.
 */
const useScrollToTop = (): UseScrollToTopOutput => {
  // Estado que indica si el botón de desplazamiento es visible
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState<boolean>(false);
  // Estado que contiene el estilo actual del botón de desplazamiento
  const [scrollButtonStyle, setScrollButtonStyle] = useState<React.CSSProperties>({});
  // Estado que determina si el dispositivo es una tablet
  const [isTablet, setIsTablet] = useState<boolean>(false);
  // Estado que determina si el dispositivo es un móvil
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // Estado que indica si es un móvil de pantalla pequeña
  const [isMobileSmallScreen, setIsMobileSmallScreen] = useState<boolean>(false);

  const intl = useIntl(); // Hook para obtener la información de internacionalización
  const locale = intl.locale; // Idioma actual

  /**
   * Función para verificar el tamaño de la pantalla y actualizar los estados relevantes.
   */
  const checkScreenSize = () => {
    const mobileSmallScreen = window.innerWidth <= 396; // Pantallas pequeñas
    const mobileScreen = window.innerWidth <= 768; // Pantallas móviles
    const tabletScreen = window.innerWidth <= 1024; // Pantallas de tablet

    setIsTablet(tabletScreen);
    setIsMobile(mobileScreen);
    setIsMobileSmallScreen(mobileSmallScreen);

    // Si el idioma es "de" (alemán) y el dispositivo es móvil, activar el comportamiento de `isMobileSmallScreen`
    if (locale === "de" && mobileScreen) {
      setIsMobileSmallScreen(true);
    }
  };

  useEffect(() => {
    // Verifica el tamaño de la pantalla al cargar el componente
    checkScreenSize();

    /**
     * Función que maneja el evento de scroll y actualiza la visibilidad y el estilo del botón.
     */
    const handleScroll = () => {
      const scrollTop = window.scrollY; // Posición de desplazamiento vertical actual
      const viewportHeight = window.innerHeight; // Altura de la ventana de visualización
      const documentHeight = document.documentElement.scrollHeight; // Altura total del documento
      const footerHeight = 60; // Altura del footer
      const distanceToStickAboveFooter = isMobileSmallScreen ? 35 : 10; // Distancia de ajuste en móviles pequeños y otros dispositivos
      const scrollTrigger = 400; // Punto de desplazamiento donde aparece el botón

      if (scrollTop > scrollTrigger) {
        setIsScrollButtonVisible(true); // Muestra el botón de desplazamiento
        const distanceFromBottom = documentHeight - (scrollTop + viewportHeight); // Distancia desde la parte inferior del documento

        let bottomPosition = "20px"; // Posición por defecto del botón desde abajo
        let rightPosition = "20px"; // Posición por defecto del botón desde la derecha

        switch (true) {
          case isMobileSmallScreen:
            rightPosition = "20px"; // Mantiene 20px en pantallas pequeñas y móviles en modo alemán
            if (distanceFromBottom <= footerHeight) {
              bottomPosition = `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`;
            }
            break;
          case isMobile:
            rightPosition = "20px"; // Para móviles
            if (distanceFromBottom <= footerHeight) {
              bottomPosition = `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`;
            }
            break;
          case isTablet:
            rightPosition = "20px"; // Para tablets
            bottomPosition = locale === "de" ? "65px" : "40px"; // Si el idioma es alemán, subir 20px más
            break;
          default:
            rightPosition = "calc(25% + 20px)"; // Para escritorio
            bottomPosition = "70px";
            break;
        }

        // Actualiza el estilo del botón
        setScrollButtonStyle({
          position: "fixed",
          bottom: bottomPosition,
          right: rightPosition,
          transition: "all 0.3s ease-in-out",
          opacity: 1,
          pointerEvents: "auto",
        });
      } else {
        // Oculta el botón si no se ha alcanzado el punto de activación
        setIsScrollButtonVisible(false);
        setScrollButtonStyle({
          opacity: 0,
          pointerEvents: "none",
        });
      }
    };

    // Agrega los event listeners para los eventos de scroll y resize
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => {
      checkScreenSize();
      handleScroll();
    });

    // Limpia los event listeners al desmontar el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [isMobile, isMobileSmallScreen, isTablet, locale]); // Dependencias que disparan el efecto

  /**
   * Función que permite desplazarse suavemente al inicio de la página.
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { isScrollButtonVisible, scrollButtonStyle, scrollToTop };
};

export default useScrollToTop;
