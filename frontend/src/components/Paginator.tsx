// components/Paginator.tsx

import React from "react";
import styles from "../styles/components/Paginator.module.css";

/**
 * Props para el componente Paginator
 * @interface PaginatorProps
 * @property {number} currentPage - Número de página actual
 * @property {number} totalPages - Número total de páginas
 * @property {function} onPageChange - Función para cambiar a una página específica
 * @property {function} onFirstPage - Función para ir a la primera página
 * @property {function} onLastPage - Función para ir a la última página
 * @property {function} onNextPage - Función para ir a la siguiente página
 * @property {function} onPreviousPage - Función para ir a la página anterior
 * @property {boolean} hasNextPage - Indica si hay una página siguiente disponible
 * @property {boolean} hasPreviousPage - Indica si hay una página anterior disponible
 */
interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Componente Paginator que muestra una barra de navegación de páginas
 * @param {PaginatorProps} props - Propiedades del componente
 * @returns {JSX.Element} Elemento JSX que representa el paginador
 */
export const Paginator: React.FC<PaginatorProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
  hasNextPage,
  hasPreviousPage,
}) => {
  /**
   * Genera el array de números de página a mostrar
   * Implementa una lógica que muestra un número limitado de páginas
   * con puntos suspensivos para indicar saltos
   * @returns {(number|string)[]} Array con números de página y puntos suspensivos
   */
  const getPageNumbers = () => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
    const range = [];
    const rangeWithDots = [];
    let l;

    // Siempre mostrar la primera página
    range.push(1);

    // Calcular el rango de páginas alrededor de la página actual
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Ordenar y eliminar duplicados
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Agregar puntos suspensivos donde sea necesario
    for (let i of uniqueRange) {
      if (l) {
        if (i - l === 2) {
          // Si hay un espacio de 2 entre números, agregar el número intermedio
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          // Si hay un espacio mayor a 2, agregar puntos suspensivos
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className={styles.paginator}>
      {/* Botón para ir a la primera página */}
      <button className={styles.paginatorButton} onClick={onFirstPage} disabled={currentPage === 1}>
        &laquo;
      </button>

      {/* Botón para ir a la página anterior */}
      <button className={styles.paginatorButton} onClick={onPreviousPage} disabled={currentPage === 1}>
        &lt;
      </button>

      {/* Botones para números de página */}
      {getPageNumbers().map((pageNum, index) => (
        <button
          key={index}
          className={`${styles.paginatorButton} ${pageNum === currentPage ? styles.active : ""}`}
          onClick={() => (typeof pageNum === "number" ? onPageChange(pageNum) : null)}
          disabled={typeof pageNum !== "number"}
        >
          {pageNum}
        </button>
      ))}

      {/* Botón para ir a la página siguiente */}
      <button className={styles.paginatorButton} onClick={onNextPage} disabled={currentPage === totalPages}>
        &gt;
      </button>

      {/* Botón para ir a la última página */}
      <button className={styles.paginatorButton} onClick={onLastPage} disabled={currentPage === totalPages}>
        &raquo;
      </button>
    </div>
  );
};
