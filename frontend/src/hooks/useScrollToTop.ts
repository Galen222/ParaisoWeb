import { useState, useEffect } from "react";

export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollButtonStyle: React.CSSProperties;
  scrollToTop: () => void;
}

const useScrollToTop = (): UseScrollToTopOutput => {
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState<boolean>(false);
  const [scrollButtonStyle, setScrollButtonStyle] = useState<React.CSSProperties>({});
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileSmallScreen, setIsMobileSmallScreen] = useState<boolean>(false);

  // Función para detectar el tamaño de la pantalla
  const checkScreenSize = () => {
    setIsTablet(window.innerWidth <= 1024);
    setIsMobile(window.innerWidth <= 768);
    setIsMobileSmallScreen(window.innerWidth <= 396);
  };

  useEffect(() => {
    checkScreenSize();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 60; // Altura del footer
      const distanceToStickAboveFooter = isMobileSmallScreen ? 35 : 10; // Distancia para móviles pequeños y otros dispositivos
      const scrollTrigger = 400; // Punto de scroll donde aparece el botón

      if (scrollTop > scrollTrigger) {
        setIsScrollButtonVisible(true);
        const distanceFromBottom = documentHeight - (scrollTop + viewportHeight);

        let bottomPosition = "20px";
        let rightPosition = "20px";

        switch (true) {
          case isMobileSmallScreen:
            rightPosition = "20px"; // Para pantallas pequeñas, mantener 20px
            if (distanceFromBottom <= footerHeight) {
              bottomPosition = `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`;
            }
            break;
          case isMobile:
            rightPosition = "20px"; // Móviles
            if (distanceFromBottom <= footerHeight) {
              bottomPosition = `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`;
            }
            break;
          case isTablet:
            rightPosition = "20px"; // Tabletas
            bottomPosition = "40px";
            break;
          default:
            rightPosition = "calc(25% + 20px)"; // Escritorio
            bottomPosition = "70px";
            break;
        }

        setScrollButtonStyle({
          position: "fixed",
          bottom: bottomPosition,
          right: rightPosition,
          transition: "all 0.3s ease-in-out",
          opacity: 1,
          pointerEvents: "auto",
        });
      } else {
        setIsScrollButtonVisible(false);
        setScrollButtonStyle({
          opacity: 0,
          pointerEvents: "none",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => {
      checkScreenSize();
      handleScroll();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [isMobile, isMobileSmallScreen, isTablet]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { isScrollButtonVisible, scrollButtonStyle, scrollToTop };
};

export default useScrollToTop;
