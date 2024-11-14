import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMenu } from "../contexts/MenuContext";
import styles from "../styles/components/Footer.module.css";

const Footer: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const router = useRouter();
  const { closeMobileMenu } = useMenu();

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  const links = (
    <div className={styles.linksContainer}>
      <div className={styles.topLinks}>
        <Link href="/aviso-legal" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
          {intl.formatMessage({ id: "Footer_AvisoLegal" })}
        </Link>
        <span className={styles.separator}> | </span>
        <Link href="/politica-privacidad" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
          {intl.formatMessage({ id: "Footer_PoliticaPrivacidad" })}
        </Link>
      </div>
      <div className={styles.bottomLink}>
        <Link href="/politica-cookies" locale={router.locale} className={styles.link} onClick={handleLinkClick}>
          {intl.formatMessage({ id: "Footer_PoliticaCookies" })}
        </Link>
      </div>
    </div>
  );

  return (
    <footer className={styles.footer}>
      <div>
        <span className={styles.rightsText}>{intl.formatMessage({ id: "Footer_Rights" }, { year: new Date().getFullYear() })}</span>
        <span className={styles.mainSeparator}> | </span>
        <span className={styles.links}>{links}</span>
      </div>
    </footer>
  );
};

export default Footer;
