// components/Carousel.tsx
import React from "react";
import Slider from "react-slick";
import { useIntl } from "react-intl";
import styles from "../styles/Carousel.module.css";

const Carousel = () => {
  const intl = useIntl();
  const settings = {
    accessibility: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const slides = [
    { type: "image", src: "/images/carousel/carousel1.jpg", alt: intl.formatMessage({ id: "carousel_Alt1" }) },
    { type: "text", content: intl.formatMessage({ id: "carousel_Texto1" }) },
    { type: "image", src: "/images/carousel/carousel2.jpg", alt: intl.formatMessage({ id: "carousel_Alt2" }) },
    { type: "text", content: intl.formatMessage({ id: "carousel_Texto2" }) },
    { type: "image", src: "/images/carousel/carousel3.jpg", alt: intl.formatMessage({ id: "carousel_Alt3" }) },
    { type: "text", content: intl.formatMessage({ id: "carousel_Texto3" }) },
  ];

  return (
    <div className={styles.carouselContainer}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>
            {slide.type === "image" ? (
              <img src={slide.src} alt={slide.alt} className={styles.image} />
            ) : (
              <div className={styles.text}>
                <h2>{slide.content}</h2>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
