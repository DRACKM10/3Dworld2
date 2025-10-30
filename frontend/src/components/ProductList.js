import { useEffect, useState } from 'react';
import { SimpleGrid, Text } from '@chakra-ui/react';
import ProductCard from './ProductCard';

export default function ProductList({ refreshTrigger, onEdit }) {
  const [fetchedProducts, setFetchedProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:8000/api/products');
        if (!response.ok) throw new Error('Error al fetch productos');
        const data = await response.json();
        console.log('Datos de la API:', data); // Depuración completa
        const adjustedProducts = data.map((product) => {
          // Asegurar que id y otras propiedades existan
          const imageArray = Array.isArray(product.images) ? product.images : [];
          const mainImage = imageArray[product.mainImageIndex] || imageArray[0] || '/images/default.jpg';
          return {
            id: product.id || `fallback-${Math.random().toString(36).substr(2, 9)}`, // Fallback único si id falta
            name: product.name || 'Producto sin nombre',
            description: product.description || 'Sin descripción',
            price: product.price || 0,
            image: mainImage,
          };
        });
        if (adjustedProducts.length === 0) {
          console.warn('No se encontraron productos en la API');
        }
        setFetchedProducts(adjustedProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        // Fallback con datos simulados si la API falla
        console.log('Usando datos simulados debido a error en la API');
        setFetchedProducts([
          { id: "1", name: "Producto 1", image: "/images/default.jpg", price: 10, description: "Descripción 1" },
          { id: "2", name: "Producto 2", image: "/images/default.jpg", price: 20, description: "Descripción 2" },
        ]);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = (productId) => {
    setFetchedProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {fetchedProducts.length > 0 ? (
        fetchedProducts.map((product) => {
          console.log('Producto renderizado:', product); // Depuración por producto
          return <ProductCard key={product.id} product={product} />;
        })
      ) : (
        <Text color="white">No hay productos disponibles</Text>
      )}
    </SimpleGrid>
  );
}