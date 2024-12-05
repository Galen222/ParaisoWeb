// utils/bannersData.ts

import { IntlShape } from "react-intl";

export const getBannerContent = (intl: IntlShape) => ({
  restaurantes: {
    text: intl.formatMessage({ id: "banner_Restaurantes_Texto1" }),
    highlightText: intl.formatMessage({ id: "banner_Restaurantes_Texto2" }),
    links: [
      { href: "/san-bernardo", text: "San Bernardo" },
      { href: "/bravo-murillo", text: "Bravo Murillo" },
      { href: "/reina-victoria", text: "Reina Victoria" },
      { href: "/arenal", text: "Arenal" },
    ],
    reverse: false,
    reverseMobile: false,
    size: "Large",
    buttons: "Multiple",
  },
  gastronomia: {
    text: intl.formatMessage({ id: "banner_Gastronomia_Texto1" }),
    highlightText: intl.formatMessage({ id: "banner_Gastronomia_Texto2" }),
    links: [{ href: "/gastronomia", text: intl.formatMessage({ id: "banner_Gastronomia_Texto3" }) }],
    reverse: true,
    reverseMobile: true,
    size: "Small",
    buttons: "One",
  },
  charcuteria: {
    text: intl.formatMessage({ id: "banner_Charcuteria_Texto1" }),
    highlightText: intl.formatMessage({ id: "banner_Charcuteria_Texto2" }),
    links: [{ href: "/charcuteria", text: intl.formatMessage({ id: "banner_Charcuteria_Texto3" }) }],
    reverse: false,
    reverseMobile: false,
    size: "Small",
    buttons: "One",
  },
  nosotros: {
    text: intl.formatMessage({ id: "banner_Nosotros_Texto1" }),
    highlightText: intl.formatMessage({ id: "banner_Nosotros_Texto2" }),
    links: [{ href: "/nosotros", text: intl.formatMessage({ id: "banner_Nosotros_Texto3" }) }],
    reverse: true,
    reverseMobile: true,
    size: "Small",
    buttons: "One",
  },
  empleo: {
    text: intl.formatMessage({ id: "banner_Empleo_Texto1" }),
    highlightText: intl.formatMessage({ id: "banner_Empleo_Texto2" }),
    links: [{ href: "/contacto", text: intl.formatMessage({ id: "banner_Empleo_Texto3" }) }],
    reverse: false,
    reverseMobile: false,
    size: "Small",
    buttons: "One",
  },
});
