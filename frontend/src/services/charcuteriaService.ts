// services/charcuteriaService.ts

/**
 * Servicio para manejar las operaciones relacionadas con los productos de charcutería.
 */

import axios from "axios";
import { requestWithTimedToken } from "./timedTokenRequest";
import { isValidApiDateString } from "../utils/apiDate";
import { READ_REQUEST_TIMEOUT_MS, requirePublicApiUrl } from "../config/api.config";
import { isSafePublicAssetPath } from "../utils/publicAssetPath";

/**
 * Interfaz para representar los datos de un producto de charcutería.
 */
export interface CharcuteriaProduct {
  id_producto: number; // Identificador único del producto.
  idioma: string; // Idioma al que pertenece el producto.
  nombre: string; // Nombre del producto.
  empresa: string | null; // Empresa del producto; puede no estar informada en la base de datos.
  descripcion: string; // Descripción del producto.
  imagen_url: string; // URL de la imagen del producto.
  categoria: string; // Categoría del producto.
  fecha: string | null; // Puede ser nula en registros antiguos de la base de datos.
}

/**
 * URL base de la API de charcutería, obtenida desde una variable de entorno.
 */
const API_URL = process.env.NEXT_PUBLIC_API_CHARCUTERIA_URL;
const SUPPORTED_LANGUAGES = new Set(["es", "en", "de"]);

/**
 * Obtiene la URL configurada sin hacer fallar la importación del módulo durante el build.
 */
const getApiUrl = (): string =>
  requirePublicApiUrl(API_URL, "NEXT_PUBLIC_API_CHARCUTERIA_URL");

/** Comprueba el contrato mínimo que necesita la interfaz antes de renderizar una tarjeta. */
const isCharcuteriaProduct = (value: unknown, expectedLanguage: string): value is CharcuteriaProduct => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;
  return (
    Number.isInteger(product.id_producto) &&
    typeof product.id_producto === "number" &&
    product.id_producto > 0 &&
    product.idioma === expectedLanguage &&
    typeof product.nombre === "string" &&
    (product.empresa === null || typeof product.empresa === "string") &&
    typeof product.descripcion === "string" &&
    isSafePublicAssetPath(product.imagen_url) &&
    typeof product.categoria === "string" &&
    (product.fecha === null || isValidApiDateString(product.fecha))
  );
};

/**
 * Obtiene la lista de productos de charcutería en el idioma especificado.
 *
 * @param {string} idioma - El idioma en el cual se desean obtener los productos.
 * @returns {Promise<CharcuteriaProduct[]>} - Una promesa que resuelve a un array de objetos CharcuteriaProduct.
 * @throws {Error} - Si falla la solicitud.
 */
export const getCharcuteriaProducts = async (
  idioma: string,
  signal?: AbortSignal
): Promise<CharcuteriaProduct[]> => {
  try {
    const apiUrl = getApiUrl();
    if (!SUPPORTED_LANGUAGES.has(idioma)) {
      throw new Error(`El idioma "${idioma}" no es válido. Solo se permiten: es, en, de.`);
    }
    // Realiza la solicitud GET y renueva una sola vez el token si caduca durante la petición.
    const response = await requestWithTimedToken(
      (token) =>
        axios.get<unknown>(apiUrl, {
          headers: {
            "x-timed-token": token,
          },
          params: { idioma },
          timeout: READ_REQUEST_TIMEOUT_MS,
          signal,
        }),
      undefined,
      signal
    );

    if (
      !Array.isArray(response.data) ||
      !response.data.every((product) => isCharcuteriaProduct(product, idioma))
    ) {
      throw new Error("La respuesta del servidor para charcutería no tiene el formato esperado.");
    }

    return response.data;
  } catch (error) {
    /* // console.error("Error recibiendo los productos de charcuteria:", error); */
    throw error;
  }
};
