// src/pages/gastronomia.tsx

import React, { useState } from "react";
import { useIntl } from "react-intl"; // Hook para internacionalización
import { useVisitedPageTracking } from "../hooks/useVisitedPageTracking";
import { useVisitedPageTrackingGA } from "../hooks/useTrackingGA";
import Loader from "../components/Loader";
import type { ComponentType } from "react";
import { toast, Slide } from "react-toastify";
import useScrollToTop from "../hooks/useScrollToTop";
import Carousel from "../components/Carousel";
import { saveAs } from "file-saver";
import styles from "../styles/gastronomia.module.css"; // Estilos específicos para la página

interface GastronomiaPageProps {
  loadingMessages: boolean; // Prop para el estado de carga
}

type GastronomiaPageComponent = ComponentType<GastronomiaPageProps> & { pageTitleText?: string };

// Componente funcional GastronomiaPage
const GastronomiaPage: GastronomiaPageComponent = ({ loadingMessages }: GastronomiaPageProps) => {
  const intl = useIntl(); // Inicializa el hook de internacionalización
  const [isPushingDownloadMenuFile, setIsPushingDownloadMenuFile] = useState(false); // Estado para animaciones
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop(); // Hook para manejar el botón de scroll
  useVisitedPageTracking("gastronomia"); // Tracking personalizado
  useVisitedPageTrackingGA("gastronomia"); // Tracking para Google Analytics

  // Función para manejar el clic en el enlace de descarga
  const handleDownloadMenu = async () => {
    setIsPushingDownloadMenuFile(true);
    try {
      // Obtener el archivo PDF desde la carpeta public
      const response = await fetch("/files/cartaparaiso.pdf", {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error("Error descargando el archivo");
      }

      const blob = await response.blob();
      saveAs(blob, "cartaparaiso.pdf"); // Iniciar la descarga utilizando file-saver
      // Mostrar notificación de éxito
      toast.success(intl.formatMessage({ id: "gastronomia_Descargar_Carta_Ok" }), {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    } catch (error) {
      console.error("Error descargando el archivo:", error);
      // Mostrar notificación de error
      toast.error(intl.formatMessage({ id: "gastronomia_Descargar_Carta_Error" }), {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    }
  };

  // Mostrar el loader si los mensajes están cargando
  if (loadingMessages) {
    return <Loader />;
  }

  // Renderiza el contenido del componente
  return (
    <div className="pageContainer">
      <div>
        {/* Título y Texto 1 */}
        <h1>{intl.formatMessage({ id: "gastronomia_Titulo1" })}</h1>
        <p>{intl.formatMessage({ id: "gastronomia_Texto1" })}</p>

        {/* Botón de descarga estilizado como <a> */}
        <div className="text-center">
          <button
            className={`btn btn-primary mx-auto ${styles.downloadMenuButton} ${isPushingDownloadMenuFile ? "animate-push" : ""}`} // Clases para estilos y animaciones
            onClick={handleDownloadMenu} // Maneja el clic para activar la animación
            onAnimationEnd={() => setIsPushingDownloadMenuFile(false)} // Resetea el estado de animación
          >
            {intl.formatMessage({ id: "gastronomia_Boton" })} {/* Texto del botón */}
          </button>
        </div>

        <br></br>
        <br></br>

        {/* Título y Texto 2 */}
        <h1>{intl.formatMessage({ id: "gastronomia_Titulo2" })}</h1>
        <p>{intl.formatMessage({ id: "gastronomia_Texto2" })}</p>
        <br></br>

        {/* Título y Texto 3 */}
        <h1>{intl.formatMessage({ id: "gastronomia_Titulo3" })}</h1>
        <p>{intl.formatMessage({ id: "gastronomia_Texto3" })}</p>

        {/* Contenedor de imágenes */}
        <div className={`${styles.imageContainer}`}>
          <img src="/images/gastronomia/raciones1.png" alt="Gastronomia 1" className={styles.responsiveImage} />
          <img src="/images/gastronomia/raciones2.png" alt="Gastronomia 2" className={styles.responsiveImage} />
          <img src="/images/gastronomia/raciones3.png" alt="Gastronomia 3" className={styles.responsiveImage} />
        </div>

        {/* Carousel para dispositivos móviles */}
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia1" />
        </div>

        <br></br>

        {/* Título y Texto 4 */}
        <h1>{intl.formatMessage({ id: "gastronomia_Titulo4" })}</h1>
        <p>{intl.formatMessage({ id: "gastronomia_Texto4" })}</p>

        {/* Contenedor de imágenes */}
        <div className={`${styles.imageContainer}`}>
          <img src="/images/gastronomia/combinados1.png" alt="Gastronomia 1" className={styles.responsiveImage} />
          <img src="/images/gastronomia/combinados2.png" alt="Gastronomia 2" className={styles.responsiveImage} />
          <img src="/images/gastronomia/combinados3.png" alt="Gastronomia 3" className={styles.responsiveImage} />
        </div>

        {/* Carousel para dispositivos móviles */}
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia2" />
        </div>

        <br></br>

        {/* Título y Texto 5 */}
        <h1>{intl.formatMessage({ id: "gastronomia_Titulo5" })}</h1>
        <p>{intl.formatMessage({ id: "gastronomia_Texto5" })}</p>

        {/* Contenedor de imágenes */}
        <div className={`${styles.imageContainer}`}>
          <img src="/images/gastronomia/bocadillos1.png" alt="Gastronomia 1" className={styles.responsiveImage} />
          <img src="/images/gastronomia/bocadillos2.png" alt="Gastronomia 2" className={styles.responsiveImage} />
          <img src="/images/gastronomia/bocadillos3.png" alt="Gastronomia 3" className={styles.responsiveImage} />
        </div>

        {/* Carousel para dispositivos móviles */}
        <div className={styles.mobileCarousel}>
          <Carousel carouselType="gastronomia3" />
        </div>
      </div>

      {/* Botón para subir al inicio de la página */}
      {isScrollButtonVisible && (
        <button onClick={scrollToTop} className="scrollTop" aria-label="Subir">
          <img src="/images/web/flechaArriba.png" alt="Subir" />
        </button>
      )}

      <br />
    </div>
  );
};

// Asigna un título de página opcional
GastronomiaPage.pageTitleText = "gastronomia";

export default GastronomiaPage; // Exporta el componente para su uso en otras partes de la aplicación
