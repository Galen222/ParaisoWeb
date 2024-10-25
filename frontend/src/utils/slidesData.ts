// src/utils/slidesData.ts
import { IntlShape } from "react-intl";

interface Slide {
  type: "image" | "text";
  src?: string;
  alt?: string;
  content?: string;
}

export const slidesData = (intl: IntlShape): { [key: string]: Slide[] } => ({
  inicio: [
    {
      type: "image",
      src: "/images/carousel/carousel-inicio-1.jpg",
      alt: intl.formatMessage({ id: "carousel_Inicio_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Inicio_Texto1" }),
    },
    {
      type: "image",
      src: "/images/carousel/carousel-inicio-2.jpg",
      alt: intl.formatMessage({ id: "carousel_Inicio_Alt2" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Inicio_Texto2" }),
    },
    {
      type: "image",
      src: "/images/carousel/carousel-inicio-3.jpg",
      alt: intl.formatMessage({ id: "carousel_Inicio_Alt3" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Inicio_Texto3" }),
    },
  ],
  "san-bernardo": [
    {
      type: "image",
      src: "/images/carousel/san-bernardo-1.jpg",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_SanBernardo_Texto1" }),
    },
    {
      type: "image",
      src: "/images/carousel/san-bernardo-2.jpg",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_SanBernardo_Texto2" }),
    },
    // Añade más diapositivas si es necesario
  ],
  "bravo-murillo": [
    {
      type: "image",
      src: "/images/carousel/bravo-murillo-1.jpg",
      alt: intl.formatMessage({ id: "carousel_BravoMurillo_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_BravoMurillo_Texto1" }),
    },
    // Añade más diapositivas para "bravo-murillo"
  ],
  "reina-victoria": [
    {
      type: "image",
      src: "/images/carousel/reina-victoria-1.jpg",
      alt: intl.formatMessage({ id: "carousel_ReinaVictoria_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_ReinaVictoria_Texto1" }),
    },
    // Añade más diapositivas para "reina-victoria"
  ],
  arenal: [
    {
      type: "image",
      src: "/images/carousel/arenal-1.jpg",
      alt: intl.formatMessage({ id: "carousel_Arenal_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Arenal_Texto1" }),
    },
    // Añade más diapositivas para "arenal"
  ],
  "carta-menu": [
    {
      type: "image",
      src: "/images/carousel/carta-menu-1.jpg",
      alt: intl.formatMessage({ id: "carousel_CartaMenu_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_CartaMenu_Texto1" }),
    },
    // Añade más diapositivas para "carta-menu"
  ],
});
