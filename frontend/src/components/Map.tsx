import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import styles from "../styles/Map.module.css";

type Location = {
  lat: number;
  lng: number;
  address: string;
  url: string;
};

type Locations = {
  [key: string]: Location;
};

type MapProps = {
  locationKey: string;
};

const locations: Locations = {
  "san-bernardo": {
    lat: 40.42182213478454,
    lng: -3.7077311767926227,
    address: "San Bernardo, 8, 28015 Madrid, España",
    url: "Paraíso del Jamón Calle de San Bernardo",
  },
  "bravo-murillo": {
    lat: 40.449348434670554,
    lng: -3.7033976601087657,
    address: "Bravo Murillo, 124, 28020 Madrid, España",
    url: "Paraíso del Jamón Calle de Bravo Murillo",
  },
  "reina-victoria": {
    lat: 40.44667864352768,
    lng: -3.704447234180926,
    address: "Reina Victoria, 3, 28003 Madrid, España",
    url: "Paraíso del Jamón Calle de Reina Victoria",
  },
  arenal: {
    lat: 40.41781005932472,
    lng: -3.7082838848125155,
    address: "Arenal, 26, 28015 Madrid, España",
    url: "Paraíso del Jamón Calle de Arenal",
  },
};

const MapComponent: React.FC<MapProps> = ({ locationKey }) => {
  const intl = useIntl();
  const mapRef = useRef<HTMLDivElement>(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const location = locations[locationKey];

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error("API Key no definida. Asegúrate de configurarla en tus variables de entorno.");
      return;
    }

    const initMap = async () => {
      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;

      if (mapRef.current && Map) {
        const map = new Map(mapRef.current, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 20,
          mapId: "3c9679b7244c46e5",
        });

        const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as any;

        const marker = new AdvancedMarkerElement({
          position: { lat: location.lat, lng: location.lng },
          map,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div>
                      <h5>Paraíso del Jamón</h5>
                      <p>${location.address}</p>
                      <p><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        location.address
                      )}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({ id: "Map_Marker_Texto1" })}</a></p>
                      <p><a href="${intl.formatMessage({ id: "Map_Marker_Url" })}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({
            id: "Map_Marker_Texto2",
          })}</a></p>
                    </div>`,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
          setInfoWindowShown(true);
        });

        if (infoWindowShown) {
          infoWindow.open(map, marker);
        }
      }
    };

    const mapLoader = () => {
      return new Promise<void>((resolve, reject) => {
        if (!document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)) {
          const script = document.createElement("script");
          script.async = true;
          script.defer = true;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&callback=initMap`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load script"));
          document.head.appendChild(script);
        } else {
          resolve();
        }
      });
    };

    // Asignar initMap al objeto window
    (window as any).initMap = initMap;

    mapLoader().catch((err) => console.error("Error loading Google Maps script:", err));
  }, [location, infoWindowShown, intl]);

  return (
    <div>
      <div ref={mapRef} className={styles.mapContainer}></div>
    </div>
  );
};

export default MapComponent;
