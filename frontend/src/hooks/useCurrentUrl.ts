import { useState, useEffect } from "react";

const useCurrentUrl = () => {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return currentUrl;
};

export default useCurrentUrl;
