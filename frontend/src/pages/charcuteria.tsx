// frontend/src/components/Charcuteria.tsx

import React, { useState, useEffect } from "react";
import { useFetch } from "../hooks/useFetch"; // Importa el hook personalizado
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import type { ComponentType } from "react";
import CharcuteriaStyles from "../styles/charcuteria.module.css";
import errorStyles from "../styles/error.module.css";

interface CharcuteriaPageProps {
  loadingMessages: boolean;
}

type CharcuteriaPageComponent = ComponentType<CharcuteriaPageProps> & { pageTitleText?: string };

const CharcuteriaPage: CharcuteriaPageComponent = ({ loadingMessages }: CharcuteriaPageProps) => {
  const {
    data: products,
    loading: loadingProducts,
    error,
  } = useFetch<CharcuteriaProduct[]>({
    fetchFunction: getCharcuteriaProducts,
    errorMessagePage: "charcuteria", // Pasar 'charcuteria' en lugar de 'charcuteria_Error'
  });

  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  const [isClickFlipEnabled, setIsClickFlipEnabled] = useState<boolean>(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => {
      setIsClickFlipEnabled(window.innerWidth <= 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loadingProducts || loadingMessages) {
    return <Loader />;
  }

  const imageFileName = "/images/web/error.png";

  if (error) {
    return (
      <div className={CharcuteriaStyles.errorContainer}>
        <p className={CharcuteriaStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageFileName} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={CharcuteriaStyles.charcuteriaContainer}>
      <div className={CharcuteriaStyles.content}>
        {products?.map((product) => (
          <div className={CharcuteriaStyles.card} key={product.id_producto}>
            <div
              className={CharcuteriaStyles.cardInner}
              onClick={(e) => {
                if (isClickFlipEnabled) {
                  const target = e.currentTarget as HTMLElement;
                  if (target.style.transform === "rotateY(180deg)") {
                    target.style.transform = "rotateY(0deg)";
                  } else {
                    target.style.transform = "rotateY(180deg)";
                  }
                }
              }}
            >
              <div className={CharcuteriaStyles.front} style={{ backgroundImage: `url(${product.imagen_url})` }}>
                <p>{product.nombre}</p>
                {product.categoria && <p className={CharcuteriaStyles.category}>{product.categoria}</p>}
              </div>
              <div className={CharcuteriaStyles.back}>
                <div>
                  <p className={CharcuteriaStyles.productName}>{product.nombre}</p>
                  {product.categoria && <p className={CharcuteriaStyles.category}>{product.categoria}</p>}
                  <p className={CharcuteriaStyles.descripcion}>{product.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

CharcuteriaPage.pageTitleText = "charcuteria";

export default CharcuteriaPage;
