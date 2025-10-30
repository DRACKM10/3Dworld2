"use client";

import { useCart } from '../context/CartContext';
import { Box, Image, Button, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  console.log('Renderizando ProductCard con:', product);
  const { addToCart } = useCart();
  const router = useRouter();
  const toast = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log('Añadiendo al carrito:', product);
    addToCart(product);
  };

  const href = `/productos/${product?.id || 'default'}`;
  console.log('Generando href:', href);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="#5c212b1c"
      boxShadow="md"
      position="relative"
      _hover={{
        transform: 'scale(1.02)',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        boxShadow: 'lg',
      }}
      onClick={handleProductClick}
    >
      <Link href={href} passHref>
        <div style={{ cursor: 'pointer', padding: '4px' }}>
          <Image 
            src={product.image} 
            alt={product.name}
            height="200px"
            width="100%"
            objectFit="cover"
            mb={4}
            borderRadius="md"
          />
          
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>{product.name}</Text>
            <Text color="gray.600" fontSize="sm" noOfLines={2}>{product.description}</Text>
            <Text fontWeight="bold" color="blue.600" fontSize="xl">${product.price}</Text>
          </VStack>
        </div>
      </Link>
      
      <Button 
        colorScheme="teal" 
        width="100%"
        onClick={handleAddToCart}
        size="lg"
        mt={2}
      >
        🛒 Agregar al Carrito
      </Button>
    </Box>
  );
}