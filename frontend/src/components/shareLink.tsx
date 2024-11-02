// src/components/shareLink.tsx

import React from "react";
import { useIntl } from "react-intl";
import Styles from "../styles/shareLink.module.css";
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

interface ShareLinkProps {
  url: string;
  title: string;
}

const ShareLink: React.FC<ShareLinkProps> = ({ url, title }) => {
  const intl = useIntl(); // Inicializar intl

  return (
    <div className="text-end d-inline-flex align-items-center ptl-3">
      {/* Botón para compartir en Twitter con título y URL */}
      <TwitterShareButton url={url} title={title}>
        <XIcon size={32} round={true} className={Styles.icon} />
      </TwitterShareButton>

      {/* Botón para compartir en Facebook con URL y hashtag */}
      <FacebookShareButton url={url} hashtag={`#${title.replace(/\s+/g, "")}`}>
        <FacebookIcon size={32} round={true} className={Styles.icon} />
      </FacebookShareButton>

      {/* Botón para compartir en WhatsApp con título y URL */}
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={32} round={true} className={Styles.icon} />
      </WhatsappShareButton>

      {/* Botón para compartir en Telegram */}
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
