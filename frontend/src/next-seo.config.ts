// next-seo.config.ts

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const SEO = {
  title: "El Paraíso Del Jamón", // Título por defecto
  description: "Sitio Web de El Paraíso Del Jamón donde podrá ver información de los bares restaurantes, consultar la carta o contactar con nosotros.", // Descripción por defecto
  openGraph: {
    type: "website",
    locale: "es_ES", // Idioma por defecto
    url: siteUrl,
    siteName: "El Paraíso Del Jamón",
    images: [
      {
        url: `${siteUrl}/images/navbar/imagenLogo.png`,
        width: 1200,
        height: 630,
        alt: "Logo de El Paraíso Del Jamón",
      },
    ],
  },
  twitter: {
    /* 
    handle: "@tuusuario",
    site: "@tusitio",
    */
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "keywords",
      content:
        "bar, restaurante, charcuteria, jamón, jamón ibérico, menu, carta, gastronomía, formulario de contacto, blog, San Bernardo, Bravo Murillo, Reina Victoria, Arenal",
    },
    {
      httpEquiv: "X-UA-Compatible",
      content: "IE=edge,chrome=1",
    },
  ],
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/images/web/iconoLogo.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/images/web/apple-touch-icon.png",
      sizes: "180x180",
    },
    /* Este archivo se usa para dar funcionaliadad PWA que no se va a implementar
    {
      rel: "manifest",
      href: "/manifest.json",
    },
    */
  ],
};

export default SEO;
