// components/Carousel.tsx

import React, { useRef, useState } from "react";
import Slider from "react-slick";
import { useIntl } from "react-intl";
import { slidesData } from "../utils/slidesData";
import styles from "../styles/components/Carousel.module.css";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import { clientLogger } from "../logging/clientLogger";

/**
 * Interface para definir las propiedades de cada diapositiva.
 * @property {"image" | "text"} type - Tipo de diapositiva, puede ser imagen o texto.
 * @property {string} [src] - URL de la imagen, obligatorio si el tipo es "image".
 * @property {string} [alt] - Texto alternativo para la imagen, importante para accesibilidad.
 * @property {string} [content] - Texto que se mostrará, obligatorio si el tipo es "text".
 */
interface Slide {
  type: "image" | "text";
  src?: string;
  alt?: string;
  content?: string;
}

/**
 * Propiedades para el componente Carousel.
 * @property {string} carouselType - Tipo de carrusel, utilizado para determinar
 * qué conjunto de diapositivas se mostrará.
 */
export interface CarouselProps {
  carouselType: string;
}

/**
 * Componente Carousel
 *
 * Muestra un carrusel (slider) que despliega diapositivas basadas en el tipo especificado.
 * Cada diapositiva puede ser de tipo "imagen" o "texto", y el carrusel se configura
 * para deslizarse automáticamente.
 *
 * @param {CarouselProps} props - Propiedades para el componente Carousel.
 * @returns {React.JSX.Element} Carrusel de diapositivas.
 */
const Carousel = ({ carouselType }: CarouselProps): React.JSX.Element => {
  // `intl` es una instancia del hook useIntl, utilizada para obtener mensajes localizados.
  const intl = useIntl();
  const prefersReducedMotion = usePrefersReducedMotion();
  const sliderRef = useRef<Slider | null>(null);
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  // Configuración del carrusel utilizando react-slick
  const settings = {
    accessibility: true,
    arrows: false,
    dots: true,
    infinite: true,
    speed: prefersReducedMotion ? 0 : 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !prefersReducedMotion && !isPaused,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    pauseOnFocus: true,
    customPaging: (index: number) => (
      <span className="visually-hidden">
        {intl.formatMessage({ id: "carousel_IrDiapositiva" }, { slide: index + 1 })}
      </span>
    ),
  };

  // Obtener las diapositivas correspondientes al tipo de carrusel
  const allSlides = slidesData(intl);
  const slides: Slide[] | undefined = allSlides[carouselType];

  // Una clave desconocida no debe derribar la página completa con `undefined.map`.
  // Se registra únicamente la clave técnica y se conserva un contenedor vacío.
  if (!slides || slides.length === 0) {
    clientLogger.error(`Carrusel no disponible: tipo desconocido "${carouselType}".`);
    return <div className={styles.carouselContainer} />;
  }

  const handleAutoplayToggle = (): void => {
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;

    if (nextPaused) {
      sliderRef.current?.slickPause();
    } else {
      sliderRef.current?.slickPlay();
    }
    setIsPaused(nextPaused);
  };

  return (
    <div className={styles.carouselContainer}>
      {!prefersReducedMotion && (
        <button
          type="button"
          className={styles.autoplayButton}
          onClick={handleAutoplayToggle}
          aria-label={intl.formatMessage({ id: isPaused ? "carousel_Reanudar" : "carousel_Pausar" })}
          title={intl.formatMessage({ id: isPaused ? "carousel_Reanudar" : "carousel_Pausar" })}
        >
          {isPaused ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" focusable="false">
              <path d="M4 2.5v11l9-5.5-9-5.5Z" fill="currentColor" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 16 16" focusable="false">
              <path d="M3.5 2.5h3v11h-3zm6 0h3v11h-3z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
      <Slider ref={sliderRef} {...settings}>
        {/* Mapea cada diapositiva y la renderiza según su tipo */}
        {slides.map((slide, index) => (
          <div key={index}>
            {slide.type === "image" ? (
              // Si la diapositiva es una imagen, muestra una etiqueta <img>
              <img src={slide.src} alt={slide.alt} className={styles.image} />
            ) : (
              // Si la diapositiva es texto, muestra el contenido en un contenedor de texto
              <div className={styles.text}>
                <h3 aria-level={2}>{slide.content}</h3>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
