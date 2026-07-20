// hooks/useStickynav.ts

import { useState, useEffect } from "react";
import { measureStaticDocumentTop } from "../utils/elementPosition";

const useStickyNav = <T extends HTMLElement>(
  navbarRef: React.RefObject<T | null>,
  enabled = true
) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!enabled) {
      // El estado visible ya se fuerza a false al devolver el hook. La limpieza diferida
      // evita una actualización síncrona dentro del efecto y elimina cualquier valor anterior.
      const resetTimeoutId = window.setTimeout(() => setIsSticky(false), 0);
      return () => window.clearTimeout(resetTimeoutId);
    }

    let lastKnownPosition: number | null = null;
    let animationFrameId: number | null = null;
    let orientationTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const calculatePosition = () => {
      if (!navbarRef.current) return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      // La medición se hace dentro del frame con `position: static`. Restaurar antes
      // volvía a aplicar la clase sticky y convertía el umbral en la posición fija actual.
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        const navbar = navbarRef.current;
        if (!navbar) return;

        lastKnownPosition = measureStaticDocumentTop(navbar, window.scrollY);

        // Update sticky state
        setIsSticky(window.scrollY >= lastKnownPosition);
      });
    };

    const updatePosition = () => {
      setIsSticky(false);
      calculatePosition();
    };

    const handleDelayedUpdate = () => {
      setIsSticky(false);
      if (orientationTimeoutId !== null) {
        clearTimeout(orientationTimeoutId);
      }
      orientationTimeoutId = setTimeout(() => {
        orientationTimeoutId = null;
        calculatePosition();
      }, 100);
    };

    const handleScroll = () => {
      if (lastKnownPosition === null) return;
      setIsSticky(window.scrollY >= lastKnownPosition);
    };

    // Initialize and set up event listeners
    calculatePosition();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("orientationchange", handleDelayedUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("orientationchange", handleDelayedUpdate);

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (orientationTimeoutId !== null) {
        clearTimeout(orientationTimeoutId);
      }
    };
  }, [navbarRef, enabled]);

  return { isSticky: enabled && isSticky };
};

export default useStickyNav;
