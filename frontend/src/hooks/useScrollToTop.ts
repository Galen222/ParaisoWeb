// hooks/useScrollToTop.ts
import { useState, useEffect } from "react";

interface UseScrollToTopOutput {
  isScrollButtonVisible: boolean;
  scrollToTop: () => void;
}

const useScrollToTop = (): UseScrollToTopOutput => {
  const [isScrollButtonVisible, setisScrollButtonVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setisScrollButtonVisible(true);
      } else {
        setisScrollButtonVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { isScrollButtonVisible, scrollToTop };
};

export default useScrollToTop;
