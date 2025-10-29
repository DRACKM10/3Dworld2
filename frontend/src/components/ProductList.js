import { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import ProductCard from './ProductCard';

export default function ProductList({ refreshTrigger, onEdit }) {
  const [fetchedProducts, setFetchedProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:8000/api/products');
        if (!response.ok) throw new Error('Error al fetch productos');
        const data = await response.json();
        setFetchedProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    }
    fetchProducts();
  }, [refreshTrigger]);

  const handleDelete = (productId) => {
    setFetchedProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {fetchedProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </SimpleGrid>
  );
}