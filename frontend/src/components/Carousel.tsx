// src/components/Carousel.tsx
import React from "react";
import Slider from "react-slick";
import { useIntl } from "react-intl";
import { slidesData } from "../utils/slidesData";
import styles from "../styles/Carousel.module.css";

interface Slide {
  type: "image" | "text";
  src?: string;
  alt?: string;
  content?: string;
}

interface CarouselProps {
  carouselType: string;
}

const Carousel = ({ carouselType }: CarouselProps) => {
  const intl = useIntl();

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
        {slides.map((slide, index) => (
          <div key={index}>
            {slide.type === "image" ? (
              <img src={slide.src} alt={slide.alt} className={styles.image} />
            ) : (
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
