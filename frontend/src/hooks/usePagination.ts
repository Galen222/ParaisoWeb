// hooks/usePagination.ts

import { useState, useMemo, useEffect } from "react";

/**
 * Interfaz para las opciones de paginación
 * @interface PaginationOptions
 * @property {number} itemsPerPage - Número de elementos por página
 * @property {number} [initialPage] - Página inicial (opcional)
 */
interface PaginationOptions {
  itemsPerPage: number;
  initialPage?: number;
}

/**
 * Interfaz para el resultado de la paginación
 * @interface PaginationResult
 * @property {number} currentPage - Página actual
 * @property {number} totalPages - Total de páginas
 * @property {T[]} paginatedItems - Items de la página actual
 * @property {function} goToPage - Función para ir a una página específica
 * @property {function} goToFirstPage - Función para ir a la primera página
 * @property {function} goToLastPage - Función para ir a la última página
 * @property {function} goToNextPage - Función para ir a la siguiente página
 * @property {function} goToPreviousPage - Función para ir a la página anterior
 * @property {boolean} hasNextPage - Indica si hay página siguiente
 * @property {boolean} hasPreviousPage - Indica si hay página anterior
 */
interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Hook personalizado para manejar la paginación
 * @template T - Tipo de los elementos a paginar
 * @param {Object} params - Parámetros del hook
 * @param {T[]} params.items - Array de elementos a paginar
 * @param {number} params.itemsPerPage - Número de elementos por página
 * @param {number} [params.initialPage=1] - Página inicial (por defecto: 1)
 * @returns {PaginationResult<T>} Objeto con el estado y funciones de paginación
 */
export function usePagination<T>({
  items,
  itemsPerPage,
  initialPage = 1,
}: {
  items: T[];
} & PaginationOptions): PaginationResult<T> {
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calcular el número total de páginas (mínimo 1 página)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Asegurarse de que la página actual es válida
  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

  /**
   * Memoriza los elementos de la página actual
   * Se recalcula solo cuando cambian los items, la página actual o items por página
   */
  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, validCurrentPage, itemsPerPage]);

  /**
   * Efecto para hacer scroll suave al principio del contenido principal
   * cuando cambia la página pulsando en el paginador
   */
  useEffect(() => {
    document.getElementById("principal")?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currentPage]);

  /**
   * Funciones de navegación
   */
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Determinar si hay páginas siguiente y anterior
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Retornar el objeto con todos los valores y funciones necesarias
  return {
    currentPage: validCurrentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
  };
}
