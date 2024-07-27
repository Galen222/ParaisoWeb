// components/AnimatedTitle.tsx
import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/AnimatedTitle.module.css"; // Puedes definir estilos específicos si lo necesitas

interface AnimatedTitleProps {
  text1Id: string;
  text2Id: string;
  cookiesModalClosed: boolean;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text1Id, text2Id, cookiesModalClosed }) => {
  const intl = useIntl();

  return (
    <div className={styles.animationContainer}>
      <h1>
        {cookiesModalClosed ? (
          <div className={styles.animationTime}>
            <div className="animate__animated animate__fadeInLeft">
              <div className={styles.animationFont}>{intl.formatMessage({ id: text1Id })}</div>
            </div>
            <div className="animate__animated animate__fadeInRight animate__delay-1s">
              <div className={styles.animationFont}>{intl.formatMessage({ id: text2Id })}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.animationFont}>{intl.formatMessage({ id: text1Id })}</div>
            <div className={styles.animationFont}>{intl.formatMessage({ id: text2Id })}</div>
          </div>
        )}
      </h1>
    </div>
  );
};

export default AnimatedTitle;
