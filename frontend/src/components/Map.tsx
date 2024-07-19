import React, { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useIntl } from "react-intl";
import styles from "../styles/Map.module.css";

type Location = {
  lat: number;
  lng: number;
  address: string;
  address_url: string;
  url: string;
  telephone: string;
};

type Locations = {
  [key: string]: Location;
};

const locations: Locations = {
  "san-bernardo": {
    lat: 40.42182213478454,
    lng: -3.7077311767926227,
    address: "San Bernardo, 8, 28015 Madrid, España",
    address_url: "Paraíso del Jamón Calle de San Bernardo",
    url: "https://www.google.com/maps?ll=40.421868,-3.707702&z=20&t=m&gl=US&mapclient=apiv3&cid=16475304548653478685",
    telephone: "+34 532 83 50",
  },
  "bravo-murillo": {
    lat: 40.449348434670554,
    lng: -3.7033976601087657,
    address: "Bravo Murillo, 124, 28020 Madrid, España",
    address_url: "Paraíso del Jamón Calle de Bravo Murillo",
    url: "https://www.google.com/maps?ll=40.449348,-3.703398&z=20&t=m&gl=US&mapclient=apiv3&cid=17291774062565476387",
    telephone: "+34 553 97 83",
  },
  "reina-victoria": {
    lat: 40.44667864352768,
    lng: -3.704447234180926,
    address: "Reina Victoria, 3, 28003 Madrid, España",
    address_url: "Paraíso del Jamón Calle de Reina Victoria",
    url: "https://www.google.com/maps?ll=40.446679,-3.704447&z=20&t=m&gl=US&mapclient=apiv3&cid=8431686105412493623",
    telephone: "+34 534 18 20",
  },
  arenal: {
    lat: 40.41781005932472,
    lng: -3.7082838848125155,
    address: "Arenal, 26, 28015 Madrid, España",
    address_url: "Paraíso del Jamón Calle de Arenal",
    url: "https://www.google.com/maps?ll=40.41781,-3.708284&z=20&t=m&gl=US&mapclient=apiv3&cid=3523718250256320549",
    telephone: "+34 541 95 19",
  },
};

type MapProps = {
  locationKey: keyof Locations;
};

const libraries: ("marker" | "places")[] = ["marker"];

const MapComponent: React.FC<MapProps> = ({ locationKey }) => {
  const intl = useIntl();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    version: "weekly",
    language: "es",
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map>();
  const infoWindowRef = useRef<google.maps.InfoWindow>();
  const location = locations[locationKey];
  const [currentLocale, setCurrentLocale] = useState(intl.locale);

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 20,
        mapId: "3c9679b7244c46e5",
      });

      loadMarker();
    }
  }, [isLoaded, location]);

  useEffect(() => {
    if (currentLocale !== intl.locale) {
      setCurrentLocale(intl.locale);
    }
  }, [intl.locale]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      loadMarker();
    }
  }, [currentLocale]);

  const loadMarker = async () => {
    const { AdvancedMarkerElement } = await window.google.maps.marker;
    const marker = new AdvancedMarkerElement({
      map: mapInstanceRef.current,
      position: { lat: location.lat, lng: location.lng },
      title: location.address_url,
    });

    const contentString = `<div class="fw-bold">
      <h5>Paraíso del Jamón</h5>
      <p>${location.address}</p>
      <p>${intl.formatMessage({
        id: "Map_Marker_Telefono",
      })}<a class="text-decoration-none" href="tel:${location.telephone}" target="_blank" rel="noopener noreferrer">
     ${location.telephone}
    </a></p>
      <p><a class="text-decoration-none" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        location.address_url
      )}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({ id: "Map_Marker_Texto1" })}</a></p>
      <p><a class="text-decoration-none" href="${location.url}" target="_blank" rel="noopener noreferrer">${intl.formatMessage({
      id: "Map_Marker_Texto2",
    })}</a></p>
    </div>`;

    if (infoWindowRef.current) {
      infoWindowRef.current.setContent(contentString);
    } else {
      infoWindowRef.current = new google.maps.InfoWindow({
        content: contentString,
      });
    }

    marker.addListener("click", () => {
      if (infoWindowRef.current && mapInstanceRef.current) {
        infoWindowRef.current.open({
          anchor: marker,
          map: mapInstanceRef.current,
          shouldFocus: false,
        });
      }
    });
  };

  if (loadError) {
    return <div>{intl.formatMessage({ id: "Map_Error_Texto" })}</div>;
  }

  if (!isLoaded) {
    return <div>{intl.formatMessage({ id: "Map_Loading_Texto" })}</div>;
  }

  return (
    <div>
      <div ref={mapRef} className={styles.mapContainer}></div>
    </div>
  );
};

export default React.memo(MapComponent);
