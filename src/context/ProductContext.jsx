import React, { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  // Store the lightweight products array (null means not fetched yet)
  const [cachedList, setCachedList] = useState(null);
  
  // Store key-value pairs of individual full products: { "1": productObject, "2": productObject }
  const [cachedDetails, setCachedDetails] = useState({});

  const cacheProductList = (list) => setCachedList(list);

  const cacheProductDetail = (id, detailData) => {
    setCachedDetails((prev) => ({
      ...prev,
      [id]: detailData,
    }));
  };

  return (
    <ProductContext.Provider value={{ cachedList, cachedDetails, cacheProductList, cacheProductDetail }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductsCache = () => useContext(ProductContext);