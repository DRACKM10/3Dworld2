"use client";
import { useCart } from '../context/CartContext';
import { Box, Image, Button, Text, VStack } from '@chakra-ui/react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      p={4}
      bg="white"
      boxShadow="md"
      _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
    >
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
        
        <Button 
          colorScheme="teal" 
          width="100%"
          onClick={handleAddToCart}
          size="lg"
        >
          🛒 Agregar al Carrito
        </Button>
      </VStack>
    </Box>
  );
}