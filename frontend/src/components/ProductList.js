// src/components/ProductList.js
import { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import ProductCard from './ProductCard';

export default function ProductList({ products }) {
  const [fetchedProducts, setFetchedProducts] = useState(products || []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Error al fetch productos');
        const data = await response.json();
        const adjustedProducts = data.map((product) => {
          // Asegurar que images sea un array y usar la imagen principal o primera como fallback
          const imageArray = Array.isArray(product.images) ? product.images : [];
          const mainImage = imageArray[product.mainImageIndex] || imageArray[0] || '/images/default.jpg';
          return {
            ...product,
            image: mainImage, // Ajustar a una sola imagen para ProductCard
          };
        });
        setFetchedProducts(adjustedProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setFetchedProducts(products || []); // Usar props como fallback
      }
    }
    fetchProducts();
  }, []); // Ejecutar solo al montar

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {fetchedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </SimpleGrid>
  );
}