// components/Map.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getGoogleMapsLoader } from "../utils/GoogleMapsLoader"; // Cambio: Usamos el Singleton
import { useIntl } from "react-intl";
import styles from "../styles/components/Map.module.css";

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
    name: "Paraíso del Jamón I",
    lat: 40.42182213478454,
    lng: -3.7077311767926227,
    address: "San Bernardo, 8, 28015 Madrid, ",
    address_url: "Paraíso del Jamón Calle de San Bernardo",
    url: "https://www.google.com/maps?ll=40.421868,-3.707702&z=20&t=m&gl=US&mapclient=apiv3&cid=16475304548653478685",
    telephone: "+34 91 532 83 50",
  },
  "bravo-murillo": {
    name: "Paraíso del Jamón II",
    lat: 40.449348434670554,
    lng: -3.7033976601087657,
    address: "Bravo Murillo, 124, 28020 Madrid, ",
    address_url: "Paraíso del Jamón Calle de Bravo Murillo",
    url: "https://www.google.com/maps?ll=40.449348,-3.703398&z=20&t=m&gl=US&mapclient=apiv3&cid=17291774062565476387",
    telephone: "+34 91 553 97 83",
  },
  "reina-victoria": {
    name: "Paraíso del Jamón III",
    lat: 40.44667864352768,
    lng: -3.704447234180926,
    address: "Reina Victoria, 3, 28003 Madrid, ",
    address_url: "Paraíso del Jamón Calle de Reina Victoria",
    url: "https://www.google.com/maps?ll=40.446679,-3.704447&z=20&t=m&gl=US&mapclient=apiv3&cid=8431686105412493623",
    telephone: "+34 91 534 91 08",
  },
  arenal: {
    name: "Paraíso del Jamón IV",
    lat: 40.41781005932472,
    lng: -3.7082838848125155,
    address: "Arenal, 26, 28013 Madrid, ",
    address_url: "Paraíso del Jamón Calle de Arenal",
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
  const location = locations[locationKey]; // Ubicación seleccionada
  const [isLoaded, setIsLoaded] = useState(false); // Indica si el mapa se ha cargado
  const [loadError, setLoadError] = useState<string | null>(null); // Estado para errores de carga

  /**
   * Carga o reemplaza el marcador del mapa, mostrando un InfoWindow con detalles al hacer clic.
   */
  const loadMarker = useCallback(async (): Promise<void> => {
    if (!google.maps || !mapInstanceRef.current) return;

    try {
      // Importa la librería 'marker' si aún no ha sido importada
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

      // Retira el marcador anterior antes de crear el nuevo para no duplicar marcadores ni listeners
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.map = null;
      }

      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: location.lat, lng: location.lng },
        title: location.address_url,
      });
      markerRef.current = marker;

      // Contenido del InfoWindow en formato HTML
      const contentString = `<div class="fw-bold">
        <h5>${location.name}</h5>
        <p>${location.address} ${intl.formatMessage({ id: "Map_Marker_Pais" })}</p>
        <p>${intl.formatMessage({
          id: "Map_Marker_Telefono",
        })}<a class="text-decoration-none" href="tel:${location.telephone}" target="_blank" rel="noopener noreferrer">
       ${location.telephone}
      </a></p>
        <p><a class="text-decoration-none" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          location.address_url,
        )}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({ id: "Map_Marker_Texto1" })}</a></p>
        <p><a class="text-decoration-none" href="${location.url}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({
          id: "Map_Marker_Texto2",
        })}</a></p>
      </div>`;

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(contentString);
      } else {
        infoWindowRef.current = new google.maps.InfoWindow({
          content: contentString,
        });
      }

      // Agrega un evento al marcador para abrir el InfoWindow al hacer clic
      marker.addListener("click", () => {
        if (infoWindowRef.current && mapInstanceRef.current) {
          infoWindowRef.current.open({
            anchor: marker,
            map: mapInstanceRef.current,
            shouldFocus: false,
          });
        }
      });
    } catch {
      setLoadError("No se pudo cargar el marcador en el mapa.");
    }
  }, [intl, location]);

  /**
   * Carga el API de Google Maps y configura el idioma usando importLibrary().
   */
  useEffect(() => {
    const init = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        setLoadError("La clave de API de Google Maps no está configurada.");
        return;
      }

      try {
        // Cambio: Usamos el Singleton del Loader
        const loader = getGoogleMapsLoader(apiKey, mapLocale);
        await Promise.all([loader.importLibrary("maps"), loader.importLibrary("marker")]);
        setIsLoaded(true); // Marca el estado como cargado
      } catch (err: unknown) {
        setLoadError(err instanceof Error ? err.message : "No se pudo cargar Google Maps.");
      }
    };

    init();
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
    return () => {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.map = null;
      }
      infoWindowRef.current?.close();
    };
  }, []);

  // Renderiza un mensaje de error si ocurrió algún problema al cargar el mapa
  if (loadError) {
    return <div>{intl.formatMessage({ id: "Map_Error_Texto" })}</div>;
  }

  // Renderiza un mensaje de carga mientras el mapa se está cargando
  if (!isLoaded) {
    return <div>{intl.formatMessage({ id: "Map_Loading_Texto" })}</div>;
  }

  // Renderiza el contenedor del mapa una vez que se ha cargado
  return (
    <div>
      <div
        ref={mapRef}
        className={styles.mapContainer}
      ></div>
    </div>
  );
};

// Exporta el componente con memo para optimización
export default React.memo(MapComponent);
