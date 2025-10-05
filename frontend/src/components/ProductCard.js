"use client";

import { Box, Text, Button } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  // Función temporal para agregar al carrito
  const addToCart = (product) => {
    console.log('Agregar al carrito:', product);
    alert(`"${product.name}" agregado al carrito!`);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor="#7D00FF"
      p={4}
      maxW="sm"
      bgGradient="linear(to-b, #0b2b33, #0f0f0f)"
      boxShadow="md"
      zIndex={1}
      _hover={{
        transform: "translateY(-5px)",
        transition: "transform 0.2s ease-in-out"
      }}
    >
      <Link href={`/products/${product.id}`}>
        <Box position="relative" width="100%" height="200px" overflow="hidden" borderRadius="8px">
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: 'cover', borderRadius: '8px' }}
            priority={false}
          />
        </Box>
      </Link>
      
      <Text color="white" fontWeight="bold" mt={2} fontSize="lg">
        {product.name}
      </Text>
      <Text color="white" fontSize="md" mb={3}>${product.price}</Text>
      
      <Button 
        colorScheme="purple" 
        variant="solid" 
        width="100%"
        onClick={() => addToCart(product)}
        _hover={{
          bg: "purple.600",
          transform: "scale(1.05)"
        }}
      >
        Agregar al carrito
      </Button>
    </Box>
  );
}