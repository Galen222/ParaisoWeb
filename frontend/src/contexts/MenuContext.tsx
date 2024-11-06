// contexts/MobileMenuContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Interfaz para el contexto del menú.
 * @property {boolean} mobileMenu - Indica si el menú móvil está abierto o cerrado.
 * @property {() => void} toggleMobileMenu - Función para alternar el estado del menú móvil.
 * @property {() => void} closeMobileMenu - Función para cerrar el menú móvil.
 * @property {boolean} restaurantsMenu - Indica si el submenú de restaurantes está abierto o cerrado.
 * @property {() => void} openRestaurantsMenu - Función para abrir el submenú de restaurantes.
 * @property {() => void} closeRestaurantsMenu - Función para cerrar el submenú de restaurantes.
 */
export interface MenuContextType {
  mobileMenu: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  restaurantsMenu: boolean;
  openRestaurantsMenu: () => void;
  closeRestaurantsMenu: () => void;
}

// Crear el contexto del menú
export const MenuContext = createContext<MenuContextType | undefined>(undefined);

/**
 * Hook personalizado para acceder al contexto del menú.
 *
 * @throws Error si se utiliza fuera de un `MenuProvider`.
 * @returns {MenuContextType} El contexto del menú.
 */
export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu debe ser usado con MobileMenuProvider");
  }
  return context;
};

/**
 * Propiedades para el proveedor del menú.
 * @property {ReactNode} children - Elementos secundarios que estarán envueltos por el proveedor.
 */
export interface MenuProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de contexto para el menú
 *
 * Proporciona el estado y funciones para controlar la visibilidad del menú móvil
 * y del submenú de restaurantes, permitiendo su apertura y cierre en componentes hijos.
 *
 * @param {MenuProviderProps} props - Propiedades del proveedor de contexto.
 * @returns {JSX.Element} Proveedor del contexto del menú para controlar el estado del menú.
 */
export const MenuProvider: React.FC<MenuProviderProps> = ({ children }: MenuProviderProps): JSX.Element => {
  // Estado y funciones para el menú móvil
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMobileMenu = () => setMobileMenu(!mobileMenu); // Alterna el estado del menú móvil
  const closeMobileMenu = () => setMobileMenu(false); // Cierra el menú móvil

  // Estado y funciones para el submenú de restaurantes
  const [restaurantsMenu, setRestaurantsMenu] = useState(false);
  const openRestaurantsMenu = () => setRestaurantsMenu(true); // Abre el submenú de restaurantes
  const closeRestaurantsMenu = () => setRestaurantsMenu(false); // Cierra el submenú de restaurantes

  return (
    <MenuContext.Provider value={{ mobileMenu, toggleMobileMenu, closeMobileMenu, restaurantsMenu, openRestaurantsMenu, closeRestaurantsMenu }}>
      {children}
    </MenuContext.Provider>
  );
};
