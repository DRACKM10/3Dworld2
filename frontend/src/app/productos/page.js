import { Box, SimpleGrid, Heading } from '@chakra-ui/react';
import ProductCard from '../../components/Productcard';

export default function Products() {
  // Datos simulados (puedes conectar a una API)
  const products = [
    { id: 1, name: 'Producto 1', price: 100, image: '../public/iamges/product1.png' },
    { id: 2, name: 'Producto 2', price: 200, image: '/images/product2.jpg' },
  ];

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Heading mb={6}>Catálogo de Productos</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Box>
  );
}