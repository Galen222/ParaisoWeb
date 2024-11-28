/* hooks/useStickynav.ts */

import { useState, useEffect } from "react";

const useStickyNav = (navbarRef: React.RefObject<HTMLElement>) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let lastKnownPosition: number | null = null;

    const calculatePosition = () => {
      if (!navbarRef.current) return;

      // Force reflow and restore position
      navbarRef.current.style.position = "static";
      requestAnimationFrame(() => {
        if (!navbarRef.current) return;
        navbarRef.current.style.position = "";

        // Calculate new position
        const rect = navbarRef.current.getBoundingClientRect();
        lastKnownPosition = rect.top + window.pageYOffset;

        // Update sticky state
        setIsSticky(window.pageYOffset >= lastKnownPosition);
      });
    };

    const updatePosition = () => {
      setIsSticky(false);
      calculatePosition();
    };

    const handleDelayedUpdate = () => {
      setIsSticky(false);
      setTimeout(calculatePosition, 100);
    };

    const handleScroll = () => {
      if (!lastKnownPosition) return;
      setIsSticky(window.pageYOffset >= lastKnownPosition);
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
    };
  }, [navbarRef]);

  return { isSticky };
};

export default useStickyNav;
