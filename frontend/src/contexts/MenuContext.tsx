// src/contexts/MobileMenuContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextType {
  mobileMenu: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  restaurantsMenu: boolean;
  openRestaurantsMenu: () => void;
  closeRestaurantsMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MobileMenuProvider");
  }
  return context;
};

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMobileMenu = () => setMobileMenu(!mobileMenu);
  const closeMobileMenu = () => setMobileMenu(false);
  const [restaurantsMenu, setRestaurantsMenu] = useState(false);
  const openRestaurantsMenu = () => setRestaurantsMenu(true);
  const closeRestaurantsMenu = () => setRestaurantsMenu(false);

  return (
    <MenuContext.Provider value={{ mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
