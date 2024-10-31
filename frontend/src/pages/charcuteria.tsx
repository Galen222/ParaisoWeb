// frontend/src/components/Charcuteria.tsx
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import useScrollToTop from "../hooks/useScrollToTop";
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";
import type { ComponentType } from "react";
import styles from "../styles/charcuteria.module.css";

interface CharcuteriaPageProps {
  loadingMessages: boolean;
}

type CharcuteriaPageComponent = ComponentType<CharcuteriaPageProps> & { pageTitleText?: string };

const CharcuteriaPage: CharcuteriaPageComponent = ({ loadingMessages }: CharcuteriaPageProps) => {
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();

  const [products, setProducts] = useState<CharcuteriaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getCharcuteriaProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error recibiendo productos:", error);
        setError("Error al cargar los productos.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  if (loadingProducts) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loadingMessages) {
    return <Loader />;
  }

  return (
    <div className={styles.charcuteriaContainer}>
      <div className={styles.content}>
        {products.map((product, index) => (
          <div className={`${styles.card}`} key={product.id_producto}>
            <div className={styles.cardInner}>
              <div className={styles.front} style={{ backgroundImage: `url(${product.imagen_url})` }}>
                <p>{product.nombre}</p>
              </div>
              <div className={styles.back}>
                <div>
                  <p>{product.descripcion}</p>
                  {product.categoria && (
                    <p>
                      <strong>Categoría:</strong> {product.categoria}
                    </p>
                  )}
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
