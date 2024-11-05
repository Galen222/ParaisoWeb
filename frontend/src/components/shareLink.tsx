// src/components/ShareLink.tsx

import React from "react";
import { useIntl } from "react-intl";
import Styles from "../styles/components/ShareLink.module.css";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  TelegramShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  EmailIcon,
  TelegramIcon,
} from "react-share";

/**
 * Propiedades para el componente ShareLink.
 * @property {string} url - URL de la página o contenido a compartir.
 * @property {string} title - Título que se muestra o envía en las opciones de compartir.
 */
interface ShareLinkProps {
  url: string;
  title: string;
}

/**
 * Componente ShareLink
 *
 * Renderiza una serie de botones de redes sociales y correo electrónico para compartir
 * una URL específica con un título. Incluye opciones de compartir en Twitter, Facebook,
 * WhatsApp, Telegram y Email.
 *
 * @param {ShareLinkProps} props - Propiedades del componente ShareLink.
 * @returns {JSX.Element} Botones de redes sociales para compartir un enlace.
 */
const ShareLink: React.FC<ShareLinkProps> = ({ url, title }) => {
  const intl = useIntl(); // Hook para obtener mensajes localizados

  return (
    <div className="text-end d-inline-flex align-items-center ptl-3">
      {/* Botón para compartir en Twitter con título y URL */}
      <TwitterShareButton url={url} title={title}>
        <XIcon size={32} round={true} className={Styles.icon} />
      </TwitterShareButton>

      {/* Botón para compartir en Facebook con URL y hashtag generado a partir del título */}
      <FacebookShareButton url={url} hashtag={`#${title.replace(/\s+/g, "")}`}>
        <FacebookIcon size={32} round={true} className={Styles.icon} />
      </FacebookShareButton>

      {/* Botón para compartir en WhatsApp con título y URL */}
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={32} round={true} className={Styles.icon} />
      </WhatsappShareButton>

      {/* Botón para compartir en Telegram con título y URL */}
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round={true} className={Styles.icon} />
      </TelegramShareButton>

      {/* Botón para compartir por Email con asunto (título) y cuerpo internacionalizado */}
      <EmailShareButton url={url} subject={title} body={`${intl.formatMessage({ id: "sharedLink_cuerpo" })} ${url}`}>
        <EmailIcon size={32} round={true} />
      </EmailShareButton>
    </div>
  );
};

export default ShareLink;
