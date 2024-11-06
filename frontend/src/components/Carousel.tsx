// components/Carousel.tsx

import React from "react";
import Slider from "react-slick";
import { useIntl } from "react-intl";
import { slidesData } from "../utils/slidesData";
import styles from "../styles/components/Carousel.module.css";

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
 * @returns {JSX.Element} Carrusel de diapositivas.
 */
const Carousel = ({ carouselType }: CarouselProps): JSX.Element => {
  // `intl` es una instancia del hook useIntl, utilizada para obtener mensajes localizados.
  const intl = useIntl();

  // Configuración del carrusel utilizando react-slick
  const settings = {
    accessibility: true,
    arrows: false,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Obtener las diapositivas correspondientes al tipo de carrusel
  const allSlides = slidesData(intl);
  const slides: Slide[] = allSlides[carouselType];

  return (
    <div className={styles.carouselContainer}>
      <Slider {...settings}>
        {/* Mapea cada diapositiva y la renderiza según su tipo */}
        {slides.map((slide, index) => (
          <div key={index}>
            {slide.type === "image" ? (
              // Si la diapositiva es una imagen, muestra una etiqueta <img>
              <img src={slide.src} alt={slide.alt} className={styles.image} />
            ) : (
              // Si la diapositiva es texto, muestra el contenido en un contenedor de texto
              <div className={styles.text}>
                <h3>{slide.content}</h3>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
