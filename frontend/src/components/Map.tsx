// components/Map.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getGoogleMapsLoader } from "../utils/GoogleMapsLoader"; // Cambio: Usamos el Singleton
import { useIntl } from "react-intl";
import styles from "../styles/components/Map.module.css";
import { buildTelephoneHref } from "../utils/telephoneHref";
import { escapeHtmlAttribute, escapeHtmlText } from "../utils/htmlEscape";

/**
 * Tipo de dato para una ubicación específica.
 * @property {number} lat - Latitud de la ubicación.
 * @property {number} lng - Longitud de la ubicación.
 * @property {string} address - Dirección de la ubicación.
 * @property {string} address_url - Nombre de la dirección para mostrar en el marcador.
 * @property {string} url - Enlace directo a Google Maps para la ubicación.
 * @property {string} telephone - Número de teléfono de la ubicación.
 */
export type Location = {
  name: string;
  lat: number;
  lng: number;
  address: string;
  address_url: string;
  url: string;
  telephone: string;
};

/**
 * Tipo de dato para un objeto que contiene múltiples ubicaciones.
 * La clave es el identificador único de la ubicación.
 */
export type Locations = {
  [key: string]: Location;
};

// Lista de ubicaciones para los diferentes puntos de contacto
const locations: Locations = {
  "san-bernardo": {
    name: "Paraíso Del Jamón I",
    lat: 40.42182213478454,
    lng: -3.7077311767926227,
    address: "San Bernardo, 8, 28015 Madrid, ",
    address_url: "Paraíso Del Jamón Calle de San Bernardo",
    url: "https://www.google.com/maps?ll=40.421868,-3.707702&z=20&t=m&gl=US&mapclient=apiv3&cid=16475304548653478685",
    telephone: "+34 91 532 83 50",
  },
  /* Restaurante cerrado: se conserva su configuración sin exponerla en la interfaz.
  "bravo-murillo": {
    name: "Paraíso Del Jamón II",
    lat: 40.449348434670554,
    lng: -3.7033976601087657,
    address: "Bravo Murillo, 124, 28020 Madrid, ",
    address_url: "Paraíso Del Jamón Calle de Bravo Murillo",
    url: "https://www.google.com/maps?ll=40.449348,-3.703398&z=20&t=m&gl=US&mapclient=apiv3&cid=17291774062565476387",
    telephone: "+34 91 553 97 83",
  },
  */
  "reina-victoria": {
    name: "Paraíso Del Jamón III",
    lat: 40.44667864352768,
    lng: -3.704447234180926,
    address: "Reina Victoria, 3, 28003 Madrid, ",
    address_url: "Paraíso Del Jamón Calle de Reina Victoria",
    url: "https://www.google.com/maps?ll=40.446679,-3.704447&z=20&t=m&gl=US&mapclient=apiv3&cid=8431686105412493623",
    telephone: "+34 91 534 91 08",
  },
  arenal: {
    name: "Paraíso Del Jamón IV",
    lat: 40.41781005932472,
    lng: -3.7082838848125155,
    address: "Arenal, 26, 28013 Madrid, ",
    address_url: "Paraíso Del Jamón Calle de Arenal",
    url: "https://www.google.com/maps?ll=40.41781,-3.708284&z=20&t=m&gl=US&mapclient=apiv3&cid=3523718250256320549",
    telephone: "+34 91 541 95 19",
  },
};

/**
 * Propiedades para el componente MapComponent.
 * @property {keyof Locations} locationKey - Clave que identifica la ubicación a mostrar.
 * @property {string} mapLocale - Código de idioma para la localización del mapa.
 */
export type MapProps = {
  locationKey: keyof Locations;
  mapLocale: string;
};

/**
 * Componente MapComponent
 *
 * Renderiza un mapa de Google Maps con un marcador para una ubicación específica,
 * basada en la clave `locationKey`. Usa `Advanced InfoWindow` que muestra detalles
 * de la ubicación al hacer clic en el marcador.
 *
 * @param {MapProps} props - Propiedades del componente MapComponent.
 * @returns {React.JSX.Element} Mapa de Google Maps con marcador e información de la ubicación.
 */
const MapComponent: React.FC<MapProps> = ({ locationKey, mapLocale }: MapProps): React.JSX.Element => {
  const intl = useIntl();
  const mapRef = useRef<HTMLDivElement>(null); // Referencia para el contenedor del mapa
  const mapInstanceRef = useRef<google.maps.Map | null>(null); // Referencia para la instancia del mapa
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null); // Referencia para el InfoWindow
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null); // Referencia para evitar marcadores duplicados
  const markerClickCleanupRef = useRef<(() => void) | null>(null); // Retira el listener DOM del marcador anterior
  const markerLoadSequenceRef = useRef(0); // Invalida cargas antiguas del marcador
  const isMountedRef = useRef(true); // Evita actualizar estado después del desmontaje
  const location = locations[locationKey]; // Ubicación seleccionada
  const [isLoaded, setIsLoaded] = useState(false); // Indica si el mapa se ha cargado
  const [loadError, setLoadError] = useState<string | null>(null); // Estado para errores de carga de la API
  const [markerLoadError, setMarkerLoadError] = useState(false); // Error del marcador sin desmontar el mapa

  /**
   * Carga o reemplaza el marcador del mapa, mostrando un InfoWindow con detalles al hacer clic.
   */
  const loadMarker = useCallback(async (): Promise<void> => {
    // El componente también puede desmontarse después de un fallo de carga, antes de que
    // exista el objeto global de Google Maps. Consultarlo sin comprobarlo provocaría un
    // ReferenceError adicional que ocultaría el error original.
    if (typeof google === "undefined" || !google.maps || !mapInstanceRef.current) return;

    const markerLoadSequence = ++markerLoadSequenceRef.current;
    const isCurrentMarkerLoad = (): boolean =>
      isMountedRef.current && markerLoadSequence === markerLoadSequenceRef.current;

    try {
      // Un reintento debe retirar el error del intento anterior cuando finalmente funciona.
      if (isCurrentMarkerLoad()) {
        setMarkerLoadError(false);
      }

      // Importa la librería 'marker' si aún no ha sido importada
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
      if (!isCurrentMarkerLoad() || !mapInstanceRef.current) return;

      // Retira el marcador anterior antes de crear el nuevo para no duplicar marcadores ni listeners
      if (markerRef.current) {
        markerClickCleanupRef.current?.();
        markerClickCleanupRef.current = null;
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.map = null;
      }

      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: location.lat, lng: location.lng },
        title: location.address_url,
        gmpClickable: true,
      });
      markerRef.current = marker;

      // InfoWindow interpreta una cadena HTML. Escapar cada valor evita que una traducción
      // o un dato de ubicación con caracteres reservados altere la estructura del cuadro.
      const countryText = escapeHtmlText(intl.formatMessage({ id: "Map_Marker_Pais" }));
      const telephoneLabel = escapeHtmlText(intl.formatMessage({ id: "Map_Marker_Telefono" }));
      const directionsText = escapeHtmlText(intl.formatMessage({ id: "Map_Marker_Texto1" }));
      const viewMapText = escapeHtmlText(intl.formatMessage({ id: "Map_Marker_Texto2" }));
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address_url)}`;
      const contentString = `<div class="fw-bold">
        <h5>${escapeHtmlText(location.name)}</h5>
        <p>${escapeHtmlText(location.address)} ${countryText}</p>
        <p>${telephoneLabel}<a class="text-decoration-none" href="${escapeHtmlAttribute(buildTelephoneHref(location.telephone))}">
       ${escapeHtmlText(location.telephone)}
      </a></p>
        <p><a class="text-decoration-none" href="${escapeHtmlAttribute(directionsUrl)}" target="_blank" rel="noopener noreferrer">${directionsText}</a></p>
        <p><a class="text-decoration-none" href="${escapeHtmlAttribute(location.url)}" target="_blank" rel="noopener noreferrer">${viewMapText}</a></p>
      </div>`;

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(contentString);
      } else {
        infoWindowRef.current = new google.maps.InfoWindow({
          content: contentString,
        });
      }

      // Agrega el evento DOM recomendado para AdvancedMarkerElement.
      const handleMarkerClick = (): void => {
        if (infoWindowRef.current && mapInstanceRef.current) {
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstanceRef.current,
            shouldFocus: false,
          });
        }
      };
      marker.addEventListener("gmp-click", handleMarkerClick);
      markerClickCleanupRef.current = () => {
        marker.removeEventListener("gmp-click", handleMarkerClick);
      };
      if (isCurrentMarkerLoad()) {
        setMarkerLoadError(false);
      }
    } catch {
      if (isCurrentMarkerLoad()) {
        setMarkerLoadError(true);
      }
    }
  }, [intl, location]);

  /**
   * Carga el API de Google Maps y configura el idioma usando importLibrary().
   */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
      const isExampleApiKey = apiKey === "cambiar_por_clave_publica_de_google_maps";
      if (!apiKey || isExampleApiKey) {
        if (!cancelled) {
          setIsLoaded(false);
          setLoadError("La clave de API de Google Maps no está configurada.");
        }
        return;
      }

      try {
        // Limpia un error transitorio anterior antes de reintentar la carga.
        if (!cancelled) {
          setLoadError(null);
        }

        // Cambio: Usamos el Singleton del Loader
        const loader = getGoogleMapsLoader(apiKey, mapLocale);
        await Promise.all([loader.importLibrary("maps"), loader.importLibrary("marker")]);
        if (!cancelled) {
          setLoadError(null);
          setIsLoaded(true); // Marca el estado como cargado
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setIsLoaded(false);
          setLoadError(err instanceof Error ? err.message : "No se pudo cargar Google Maps.");
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [mapLocale]);

  /**
   * Inicializa el mapa y el marcador al cargar el mapa.
   * También actualiza el centro y el marcador si cambia la ubicación o el idioma.
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 20,
        mapId: "3c9679b7244c46e5",
      });
    } else {
      mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
    }

    void loadMarker();
  }, [isLoaded, loadMarker, location]);

  /**
   * Limpia los elementos creados por Google Maps al desmontar el componente.
   */
  useEffect(() => {
    // React Strict Mode ejecuta montaje, limpieza y montaje en desarrollo. Se restablece
    // explícitamente la bandera para que el segundo montaje siga aceptando resultados.
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      markerLoadSequenceRef.current += 1;

      // Si el script no llegó a cargarse, `google` no existe. La limpieza debe ser
      // segura también en ese estado para no lanzar una excepción al navegar.
      if (markerRef.current && typeof google !== "undefined" && google.maps) {
        markerClickCleanupRef.current?.();
        markerClickCleanupRef.current = null;
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.map = null;
      }
      infoWindowRef.current?.close();
    };
  }, []);

  // Renderiza un mensaje de error si ocurrió algún problema al cargar el mapa
  if (loadError) {
    return <div role="alert">{intl.formatMessage({ id: "Map_Error_Texto" })}</div>;
  }

  // Renderiza un mensaje de carga mientras el mapa se está cargando
  if (!isLoaded) {
    return (
      <div role="status" aria-live="polite" aria-atomic="true">
        {intl.formatMessage({ id: "Map_Loading_Texto" })}
      </div>
    );
  }

  // Renderiza el contenedor del mapa una vez que se ha cargado
  return (
    <div>
      {markerLoadError && <div role="alert">{intl.formatMessage({ id: "Map_Error_Texto" })}</div>}
      <div
        ref={mapRef}
        className={styles.mapContainer}
      ></div>
    </div>
  );
};

// Exporta el componente con memo para optimización
export default React.memo(MapComponent);
