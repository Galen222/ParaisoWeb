import { useState, useEffect } from "react";

export interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollButtonStyle: React.CSSProperties;
  scrollToTop: () => void;
}

const useScrollToTop = (): UseScrollToTopOutput => {
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState<boolean>(false);
  const [scrollButtonStyle, setScrollButtonStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  // Función para detectar si estamos en móvil y si la pantalla es pequeña
  const checkScreenSize = () => {
    setIsMobile(window.innerWidth <= 767); // Ajusta este valor según tu breakpoint
    setIsSmallScreen(window.innerWidth <= 396); // Detecta si la pantalla es igual o menor a 396px
  };

  useEffect(() => {
    checkScreenSize();

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 60; // Altura del footer
      const distanceToStickAboveFooter = isSmallScreen ? 35 : 10; // 20px si la pantalla es igual o menor a 396px, de lo contrario 10px
      const scrollTrigger = 400; // Punto de scroll donde aparece el botón

      if (scrollTop > scrollTrigger) {
        setIsScrollButtonVisible(true);

        if (isMobile) {
          const distanceFromBottom = documentHeight - (scrollTop + viewportHeight);

          if (distanceFromBottom <= footerHeight) {
            // El botón se mueve la distancia especificada por encima del footer al llegar al final del scroll en móviles
            setScrollButtonStyle({
              position: "fixed",
              bottom: `${footerHeight - distanceFromBottom + distanceToStickAboveFooter}px`,
              right: "20px",
              transition: "all 0.3s ease-in-out",
              opacity: 1,
              pointerEvents: "auto",
            });
          } else {
            // Posición inicial a 20px desde el fondo de la pantalla en móviles
            setScrollButtonStyle({
              position: "fixed",
              bottom: "20px",
              right: "20px",
              transition: "all 0.3s ease-in-out",
              opacity: 1,
              pointerEvents: "auto",
            });
          }
        } else {
          // En modo escritorio, el botón permanece fijo a 70px del fondo
          setScrollButtonStyle({
            position: "fixed",
            bottom: "70px",
            right: "calc(25% + 20px)",
            transition: "all 0.3s ease-in-out",
            opacity: 1,
            pointerEvents: "auto",
          });
        }
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
  }, [isMobile, isSmallScreen]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { isScrollButtonVisible, scrollButtonStyle, scrollToTop };
};

export default useScrollToTop;
