import React from "react";
import Link from "next/link";
import { useIntl } from "react-intl";
import styles from "../styles/Banner.module.css";

interface BannerProps {
  bannerType: "restaurantes" | "gastronomia" | "nosotros" | "empleo";
}

const Banner: React.FC<BannerProps> = ({ bannerType }) => {
  const intl = useIntl();

  const bannerContent = {
    restaurantes: {
      title: intl.formatMessage({ id: "banner_Restaurantes_Texto1" }),
      highlight: intl.formatMessage({ id: "banner_Restaurantes_Texto2" }),
      links: [
        { href: "/san-bernardo", text: "San Bernardo" },
        { href: "/bravo-murillo", text: "Bravo Murillo" },
        { href: "/reina-victoria", text: "Reina Victoria" },
        { href: "/arenal", text: "Arenal" },
      ],
      reverse: false,
      reverseMobile: false,
    },
    gastronomia: {
      title: intl.formatMessage({ id: "banner_Gastronomia_Texto1" }),
      highlight: intl.formatMessage({ id: "banner_Gastronomia_Texto2" }),
      links: [{ href: "/gastronomia", text: intl.formatMessage({ id: "banner_Gastronomia_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
    },
    nosotros: {
      title: intl.formatMessage({ id: "banner_About_Texto1" }),
      highlight: intl.formatMessage({ id: "banner_About_Texto2" }),
      links: [{ href: "/about", text: intl.formatMessage({ id: "banner_About_Texto3" }) }],
      reverse: false,
      reverseMobile: false,
    },
    empleo: {
      title: intl.formatMessage({ id: "banner_Empleo_Texto1" }),
      highlight: intl.formatMessage({ id: "banner_Empleo_Texto2" }),
      links: [{ href: "/contacto", text: intl.formatMessage({ id: "banner_Empleo_Texto3" }) }],
      reverse: true,
      reverseMobile: true,
    },
  };

  const content = bannerContent[bannerType];

  return (
    <div className={styles[`${bannerType}Container`]}>
      <div className={`${styles[`${bannerType}FrameContent`]} ${content.reverse ? styles.reverse : ""} ${content.reverseMobile ? styles.reverseMobile : ""}`}>
        <div className={styles[`${bannerType}TextSection`]}>
          <h1 className={styles[`${bannerType}Title`]}>{content.title}</h1>
          <h1 className={styles[`${bannerType}Highlight`]}>{content.highlight}</h1>
        </div>
        <div className={styles[`${bannerType}ButtonsSection`]}>
          {content.links.map((link, index) => (
            <Link key={index} href={link.href} passHref>
              <button className={`btn btn-primary mx-auto ${styles.bannerButton}`}>{link.text}</button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
