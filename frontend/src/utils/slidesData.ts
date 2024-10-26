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
      src: "/images/carousel/inicio/carousel-inicio-1.jpg",
      alt: intl.formatMessage({ id: "carousel_Inicio_Alt1" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Inicio_Texto1" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-2.jpg",
      alt: intl.formatMessage({ id: "carousel_Inicio_Alt2" }),
    },
    {
      type: "text",
      content: intl.formatMessage({ id: "carousel_Inicio_Texto2" }),
    },
    {
      type: "image",
      src: "/images/carousel/inicio/carousel-inicio-3.jpg",
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
      src: "/images/carousel/sb/carousel-sb-1.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-a.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-2.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-b.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-3.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-c.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-4.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-d.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-5.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/sb/carousel-sb-e.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
  ],
  "bravo-murillo": [
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-1.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-a.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-2.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-b.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-3.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-c.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-4.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/bm/carousel-bm-d.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
  ],
  "reina-victoria": [
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-1.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-a.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-2.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-b.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-3.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-c.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-4.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/rv/carousel-rv-d.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
  ],
  arenal: [
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-1.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-a.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-2.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-b.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-3.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-c.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-4.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-d.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-5.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt2" }),
    },
    {
      type: "image",
      src: "/images/carousel/ar/carousel-ar-e.png",
      alt: intl.formatMessage({ id: "carousel_SanBernardo_Alt1" }),
    },
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
