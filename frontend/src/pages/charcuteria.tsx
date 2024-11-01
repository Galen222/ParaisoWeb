// frontend/src/components/Charcuteria.tsx
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl"; // Importa el hook useIntl para internacionalización.
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";
import type { ComponentType } from "react";
import CharcuteriaStyles from "../styles/charcuteria.module.css";
import errorStyles from "../styles/error.module.css";

interface CharcuteriaPageProps {
  loadingMessages: boolean;
}

type CharcuteriaPageComponent = ComponentType<CharcuteriaPageProps> & { pageTitleText?: string };

const CharcuteriaPage: CharcuteriaPageComponent = ({ loadingMessages }: CharcuteriaPageProps) => {
  const intl = useIntl(); // Utiliza el hook de internacionalización para obtener funciones de traducción.
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const [products, setProducts] = useState<CharcuteriaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClickFlipEnabled, setIsClickFlipEnabled] = useState<boolean>(window.innerWidth <= 800);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getCharcuteriaProducts();
        setProducts(data);
      } catch (error) {
        /* console.error("Error recibiendo productos:", error);
        if (error instanceof Error) {
          setError(error.message); // Obtiene el mensaje de error si es una instancia de Error
        } else {
          setError(String(error)); // Convierte el valor a string si no es un Error
        }
        */
        setError(intl.formatMessage({ id: "charcuteria_Error" }));
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsClickFlipEnabled(window.innerWidth <= 800);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loadingProducts) {
    return <Loader />;
  }

  const imageFileName = "/images/web/error.png";

  if (error) {
    return (
      <div className={CharcuteriaStyles.errorContainer}>
        <p className={CharcuteriaStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageFileName} alt={"Error"} />
        </div>
      </div>
    );
  }

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className={CharcuteriaStyles.charcuteriaContainer}>
      <div className={CharcuteriaStyles.content}>
        {products.map((product) => (
          <div className={CharcuteriaStyles.card} key={product.id_producto}>
            <div
              className={`${CharcuteriaStyles.cardInner}`}
              onClick={(e) => {
                if (isClickFlipEnabled) {
                  const target = e.currentTarget;
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
