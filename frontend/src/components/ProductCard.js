"use client";

import { useCart } from '../context/CartContext';
import { Box, Image, Button, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evita que el click se propague al contenedor
    addToCart(product);
  };

  const handleProductClick = () => {
    // Redirigir a la página del producto
    // Asumiendo que tienes una ruta como /productos/[id]
    router.push(`/productos/${product.id}`);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="#5c212b1c"
      boxShadow="md"
      _hover={{
        transform: 'scale(1.02)',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        boxShadow: 'lg',
      }}
      onClick={handleProductClick} // Hace toda la card clickeable
    >
      <Image
        src={product.image}
        alt={product.name}
        height="200px"
        width="100%"
        objectFit="contain"
        mb={4}
        borderRadius="md"
      />
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold" fontSize="lg" noOfLines={1} color="white">
          {product.name}
        </Text>
        <Text color="white" fontSize="sm" noOfLines={2}>
          {product.description}
        </Text>
        <Text fontWeight="bold" color="#a3aaffff" fontSize="xl">
          ${product.price}
        </Text>
        <Button
          colorScheme="teal"
          width="100%"
          onClick={handleAddToCart}
          size="lg"
          color="white" bg="#5c212b"  _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)",}}
        >
          🛒 Agregar al Carrito
        </Button>
      </VStack>
    </Box>
  );
}
