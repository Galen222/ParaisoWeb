// hooks/useStickynav.ts

import { useState, useEffect } from "react";

const useStickyNav = <T extends HTMLElement>(navbarRef: React.RefObject<T | null>) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let lastKnownPosition: number | null = null;
    let animationFrameId: number | null = null;
    let orientationTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let previousInlinePosition: string | null = null;

    const restoreNavbarPosition = () => {
      if (navbarRef.current && previousInlinePosition !== null) {
        navbarRef.current.style.position = previousInlinePosition;
      }
      previousInlinePosition = null;
    };

    const calculatePosition = () => {
      if (!navbarRef.current) return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        restoreNavbarPosition();
      }

      // Force reflow and restore position
      previousInlinePosition = navbarRef.current.style.position;
      navbarRef.current.style.position = "static";
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        if (!navbarRef.current) return;

        restoreNavbarPosition();

        // Calculate new position
        const rect = navbarRef.current.getBoundingClientRect();
        lastKnownPosition = rect.top + window.scrollY;

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
      restoreNavbarPosition();
    };
  }, [navbarRef]);

  return { isSticky };
};

export default useStickyNav;
