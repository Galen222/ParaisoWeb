// components/ShareLink.tsx

import React from "react";
import { useIntl } from "react-intl";
import Styles from "../styles/components/ShareLink.module.css";
import { buildFacebookHashtag } from "../utils/shareHashtag";
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

export interface ShareLinkProps {
  url: string;
  title: string;
}

const ShareLink: React.FC<ShareLinkProps> = ({ url, title }: ShareLinkProps): React.JSX.Element => {
  const intl = useIntl();

  // Prefijo para cada título
  const fullTitle = `El Paraíso Del Jamón - ${title}`;
  const messageWithLink = `${fullTitle}\n${intl.formatMessage({ id: "sharedLink_cuerpo" })}`;
  const getShareLabel = (messageId: string): string =>
    `${intl.formatMessage({ id: messageId })}: ${title}`;

  return (
    <div className="text-end d-inline-flex align-items-center ptl-3">
      {/* Twitter: Incluir el nombre de la web y el título */}
      <TwitterShareButton url={url} title={messageWithLink} aria-label={getShareLabel("sharedLink_CompartirX")}>
        <XIcon size={32} round={true} className={Styles.icon} />
      </TwitterShareButton>

      {/* Facebook: Se mantiene igual, pero el título se incluye al generar el hashtag */}
      <FacebookShareButton
        url={url}
        hashtag={buildFacebookHashtag(title)}
        aria-label={getShareLabel("sharedLink_CompartirFacebook")}
      >
        <FacebookIcon size={32} round={true} className={Styles.icon} />
      </FacebookShareButton>

      {/* WhatsApp: Incluir el nombre de la web y el título */}
      <WhatsappShareButton
        url={url}
        title={messageWithLink}
        aria-label={getShareLabel("sharedLink_CompartirWhatsApp")}
      >
        <WhatsappIcon size={32} round={true} className={Styles.icon} />
      </WhatsappShareButton>

      {/* Telegram: Incluir el nombre de la web y el título */}
      <TelegramShareButton
        url={url}
        title={messageWithLink}
        aria-label={getShareLabel("sharedLink_CompartirTelegram")}
      >
        <TelegramIcon size={32} round={true} className={Styles.icon} />
      </TelegramShareButton>

      {/* Email: Incluir el nombre de la web en el asunto y en el cuerpo */}
      <EmailShareButton
        url={url}
        subject={fullTitle}
        body={messageWithLink}
        aria-label={getShareLabel("sharedLink_CompartirEmail")}
      >
        <EmailIcon size={32} round={true} />
      </EmailShareButton>
    </div>
  );
};

export default ShareLink;
