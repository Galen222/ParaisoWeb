// frontend/src/components/Charcuteria.tsx

import React, { useEffect, useState } from "react";
import { getCharcuteriaProducts, CharcuteriaProduct } from "../services/charcuteriaService";

const CharcuteriaPage: React.FC = () => {
  const [products, setProducts] = useState<CharcuteriaProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getCharcuteriaProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Ocurrió un error al cargar los productos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Productos de Charcutería</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((product) => (
          <div key={product.id_producto} style={{ border: "1px solid #ccc", padding: "15px", maxWidth: "300px" }}>
            <h3>{product.nombre}</h3>
            {product.imagen_url && <img src={product.imagen_url} alt={product.nombre} style={{ maxWidth: "100%" }} />}
            <p>{product.descripcion}</p>
            {product.categoria && (
              <p>
                <strong>Categoría:</strong> {product.categoria}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharcuteriaPage;
