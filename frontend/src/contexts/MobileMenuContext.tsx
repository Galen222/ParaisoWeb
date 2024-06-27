// src/contexts/MobileMenuContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MobileMenuContextType {
  mobileMenu: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error("useMobileMenu must be used within a MobileMenuProvider");
  }
  return context;
};

interface MobileMenuProviderProps {
  children: ReactNode;
}

export const MobileMenuProvider: React.FC<MobileMenuProviderProps> = ({ children }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMobileMenu = () => setMobileMenu(!mobileMenu);
  const closeMobileMenu = () => setMobileMenu(false);

  return <MobileMenuContext.Provider value={{ mobileMenu, toggleMobileMenu, closeMobileMenu }}>{children}</MobileMenuContext.Provider>;
};
