import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as fallback } from "../data/store";
import { api } from "../lib/api";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState(fallback);
  const [source, setSource] = useState("sample");

  useEffect(() => {
    api("/api/products")
      .then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          setProducts(rows);
          setSource("database");
        }
      })
      .catch(() => setSource("sample"));
  }, []);

  const getProduct = (id) => products.find((product) => product.id === id);
  const value = useMemo(() => ({ products, source, getProduct }), [products, source]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within CatalogProvider");
  return context;
}
