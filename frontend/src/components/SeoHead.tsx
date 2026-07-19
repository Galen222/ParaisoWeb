import React from "react";
import Head from "next/head";
import { generateNextSeo, type NextSeoProps } from "next-seo/pages";

/** Inserta la configuración SEO de una página mediante la API del Pages Router de next-seo 7. */
const SeoHead = (props: NextSeoProps): React.JSX.Element => (
  <Head>{generateNextSeo(props)}</Head>
);

export default SeoHead;
