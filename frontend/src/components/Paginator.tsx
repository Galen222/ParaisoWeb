// components/Paginator.tsx

import React from "react";
import { useIntl } from "react-intl";
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
export interface PaginatorProps {
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

type PageEntry = number | "ellipsis";

/**
 * Componente Paginator que muestra una barra de navegación de páginas
 * @param {PaginatorProps} props - Propiedades del componente
 * @returns {React.JSX.Element} Elemento JSX que representa el paginador
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
  const intl = useIntl();

  /**
   * Genera el array de números de página a mostrar
   * Implementa una lógica que muestra un número limitado de páginas
   * con puntos suspensivos para indicar saltos
   * @returns {PageEntry[]} Array con números de página y puntos suspensivos
   */
  const getPageNumbers = (): PageEntry[] => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la página actual
    const range: number[] = [];
    const rangeWithDots: PageEntry[] = [];
    let previousPage: number | undefined;

    // Siempre mostrar la primera página
    range.push(1);

    // Calcular el rango de páginas alrededor de la página actual
    for (let page = currentPage - delta; page <= currentPage + delta; page++) {
      if (page > 1 && page < totalPages) {
        range.push(page);
      }
    }

    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Ordenar y eliminar duplicados
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Agregar puntos suspensivos donde sea necesario
    for (const page of uniqueRange) {
      if (previousPage !== undefined) {
        if (page - previousPage === 2) {
          // Si hay un espacio de 2 entre números, agregar el número intermedio
          rangeWithDots.push(previousPage + 1);
        } else if (page - previousPage !== 1) {
          // Si hay un espacio mayor a 2, agregar puntos suspensivos no interactivos
          rangeWithDots.push("ellipsis");
        }
      }
      rangeWithDots.push(page);
      previousPage = page;
    }

    return rangeWithDots;
  };

  return (
    <nav className={styles.paginator} aria-label={intl.formatMessage({ id: "paginador_Navegacion" })}>
      {/* Botón para ir a la primera página */}
      <button
        type="button"
        className={styles.paginatorButton}
        onClick={onFirstPage}
        disabled={!hasPreviousPage || currentPage <= 1}
        aria-label={intl.formatMessage({ id: "paginador_PrimeraPagina" })}
      >
        &laquo;
      </button>

      {/* Botón para ir a la página anterior */}
      <button
        type="button"
        className={styles.paginatorButton}
        onClick={onPreviousPage}
        disabled={!hasPreviousPage || currentPage <= 1}
        aria-label={intl.formatMessage({ id: "paginador_PaginaAnterior" })}
      >
        &lt;
      </button>

      {/* Botones para números de página y separadores no interactivos */}
      {getPageNumbers().map((pageEntry, index) =>
        pageEntry === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={styles.paginatorEllipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            key={`page-${pageEntry}`}
            className={`${styles.paginatorButton} ${pageEntry === currentPage ? styles.active : ""}`}
            onClick={() => onPageChange(pageEntry)}
            disabled={pageEntry === currentPage}
            aria-current={pageEntry === currentPage ? "page" : undefined}
            aria-label={intl.formatMessage(
              { id: pageEntry === currentPage ? "paginador_PaginaActual" : "paginador_Pagina" },
              { page: pageEntry }
            )}
          >
            {pageEntry}
          </button>
        )
      )}

      {/* Botón para ir a la página siguiente */}
      <button
        type="button"
        className={styles.paginatorButton}
        onClick={onNextPage}
        disabled={!hasNextPage || currentPage >= totalPages}
        aria-label={intl.formatMessage({ id: "paginador_PaginaSiguiente" })}
      >
        &gt;
      </button>

      {/* Botón para ir a la última página */}
      <button
        type="button"
        className={styles.paginatorButton}
        onClick={onLastPage}
        disabled={!hasNextPage || currentPage >= totalPages}
        aria-label={intl.formatMessage({ id: "paginador_UltimaPagina" })}
      >
        &raquo;
      </button>
    </nav>
  );
};
