// hooks/usePagination.ts

import { useState, useMemo, useEffect, useRef } from "react";

/**
 * Interfaz para las opciones de paginación
 * @interface PaginationOptions
 * @property {number} itemsPerPage - Número de elementos por página
 * @property {number} [initialPage] - Página inicial (opcional)
 */
export interface PaginationOptions {
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
export interface PaginationResult<T> {
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

const clampPage = (page: number, totalPages: number): number => Math.min(Math.max(1, page), totalPages);

/**
 * Hook personalizado para manejar la paginación
 * @template T - Tipo de los elementos a paginar
 * @param {Object} params - Parámetros del hook
 * @param {T[]} params.items - Array de elementos a paginar
 * @returns {PaginationResult<T>} Objeto con el estado y funciones de paginación
 */
export function usePagination<T>({
  items,
  itemsPerPage,
  initialPage = 1,
}: {
  items: T[];
} & PaginationOptions): PaginationResult<T> {
  if (!Number.isInteger(itemsPerPage) || itemsPerPage <= 0) {
    throw new Error("itemsPerPage debe ser un número entero mayor que cero");
  }

  // Calcular el número total de páginas (mínimo 1 página)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Estado para la página solicitada. El valor usado durante el render se limita de forma derivada
  // para no llamar a setState mientras React está renderizando el componente.
  const [requestedPage, setRequestedPage] = useState<number>(() => clampPage(initialPage, totalPages));
  const currentPage = clampPage(requestedPage, totalPages);

  /*
   * Si disminuye el número de páginas, sincroniza el estado después del render. Sin esta
   * actualización, una página antigua podía reaparecer inesperadamente al crecer de nuevo
   * la lista después de aplicar y retirar un filtro.
   */
  useEffect(() => {
    if (requestedPage <= totalPages) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setRequestedPage((page) => clampPage(page, totalPages));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [requestedPage, totalPages]);

  /**
   * Memoriza los elementos de la página actual
   * Se recalcula solo cuando cambian los items, la página actual o items por página
   */
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  // Conserva la página anterior para distinguir una navegación real del montaje inicial.
  const previousPageRef = useRef(currentPage);

  /**
   * Efecto para hacer scroll suave al principio del contenido principal
   * cuando cambia la página pulsando en el paginador. No se ejecuta al montar
   * la página, evitando que la vista salte automáticamente por debajo de la cabecera.
   */
  useEffect(() => {
    if (previousPageRef.current === currentPage) {
      return;
    }

    previousPageRef.current = currentPage;
    document.getElementById("principal")?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currentPage]);

  /**
   * Funciones de navegación
   */
  const goToPage = (page: number) => {
    setRequestedPage(clampPage(page, totalPages));
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
    currentPage,
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
