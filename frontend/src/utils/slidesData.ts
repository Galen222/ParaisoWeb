// utils/slidesData.ts

import { IntlShape } from "react-intl";

/**
 * Interfaz para representar los datos de un slide en un carrusel.
 * Los slides pueden ser de tipo imagen o texto.
 */
export interface Slide {
  type: "image" | "text"; // Tipo de slide: imagen o texto.
  src?: string; // URL de la imagen (opcional si es tipo "text").
  alt?: string; // Texto alternativo para la imagen (opcional).
  content?: string; // Contenido del texto (solo para slides de tipo "text").
}

/**
 * Genera los datos de slides para distintos carruseles en la aplicación, utilizando internacionalización
 * para los atributos `alt` de las imágenes.
 *
 * @param {IntlShape} intl - Objeto de internacionalización para generar textos traducidos.
 * @returns {Record<string, Slide[]>} - Un objeto que contiene los datos de los slides categorizados por carrusel.
 */
export const slidesData = (intl: IntlShape): { [key: string]: Slide[] } => ({
  inicio: [
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-1.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-2.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-3.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt3" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-4.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-5.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-6.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt6" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-7.png",
      alt: intl.formatMessage({ id: "Inicio_Carousel_Alt7" }),
    },
  ],
  "san-bernardo": [
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-1.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-a.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-2.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt3" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-b.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-3.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-c.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt6" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-4.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt7" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-d.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt8" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-5.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt9" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-e.png",
      alt: intl.formatMessage({ id: "san-bernardo_Carousel_Alt10" }),
    },
  ],
  "bravo-murillo": [
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-1.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-a.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-2.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt3" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-b.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-3.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-c.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt6" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-4.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt7" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-d.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt8" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-5.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt9" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-e.png",
      alt: intl.formatMessage({ id: "bravo-murillo_Carousel_Alt10" }),
    },
  ],
  "reina-victoria": [
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-1.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-a.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-2.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt3" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-b.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-3.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-c.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt6" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-4.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt7" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-d.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt8" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-5.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt9" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-e.png",
      alt: intl.formatMessage({ id: "reina-victoria_Carousel_Alt10" }),
    },
  ],
  arenal: [
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-1.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-a.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-2.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt3" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-b.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-3.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-c.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt6" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-4.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt7" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-d.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt8" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-5.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt9" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-e.png",
      alt: intl.formatMessage({ id: "arenal_Carousel_Alt10" }),
    },
  ],
  gastronomia1: [
    {
      type: "image",
      src: "/images/gastronomia/raciones1.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/raciones2.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/raciones3.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt3" }),
    },
  ],
  gastronomia2: [
    {
      type: "image",
      src: "/images/gastronomia/combinados1.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/combinados2.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt5" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/combinados3.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt6" }),
    },
  ],
  gastronomia3: [
    {
      type: "image",
      src: "/images/gastronomia/bocadillos1.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt7" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/bocadillos2.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt8" }),
    },
    {
      type: "image",
      src: "/images/gastronomia/bocadillos3.png",
      alt: intl.formatMessage({ id: "gastronomia_Carousel_Alt9" }),
    },
  ],
  about1: [
    {
      type: "image",
      src: "/images/about/nosotros1.png",
      alt: intl.formatMessage({ id: "about_Carousel_Alt1" }),
    },
    {
      type: "image",
      src: "/images/about/nosotros2.png",
      alt: intl.formatMessage({ id: "about_Carousel_Alt2" }),
    },
    {
      type: "image",
      src: "/images/about/nosotros3.png",
      alt: intl.formatMessage({ id: "about_Carousel_Alt3" }),
    },
  ],
  about2: [
    {
      type: "image",
      src: "/images/about/nosotros4.png",
      alt: intl.formatMessage({ id: "about_Carousel_Alt4" }),
    },
    {
      type: "image",
      src: "/images/about/nosotros5.png",
      alt: intl.formatMessage({ id: "about_Carousel_Alt5" }),
    },
  ],
});
