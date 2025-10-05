import { Box, Heading, Text } from '@chakra-ui/react';
import ProductViewer3D from '../../../components/ProductViewer3D';

export default function ProductPage({ params }) {
  const { id } = params;
  // Datos simulados (puedes obtenerlos de una API)
  const product = {
    id,
    name: `Producto ${id}`, 
    price: 100 * id,
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Heading mb={4}>{product.name}</Heading>
      <Text mb={4}>Precio: ${product.price}</Text>
      <ProductViewer3D modelUrl={`/models/product-${id}.gltf`} />
    </Box>
  );
}