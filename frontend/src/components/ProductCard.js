"use client";

import { Box, Text, Button } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product, onClick }) {
  const addToCart = (product) => {
    console.log('Agregar al carrito:', product);
    alert(`"${product.name}" agregado al carrito!`);
  };

  // Usar product.images como array y tomar la primera imagen si existe
  const imageSrc = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image || '/images/default.jpg';

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
      onClick={onClick} // Opcional: permite redirección desde el contenedor
    >
      <Link href={`/productos/${product.id}`}>
        <Box position="relative" width="100%" height="200px" overflow="hidden" borderRadius="8px">
          <Image
            src={imageSrc}
            alt={product.name || "Producto"}
            fill
            style={{ objectFit: 'cover', borderRadius: '8px' }}
            priority={false}
            onError={(e) => {
              e.target.src = '/images/default.jpg';
              console.error('Imagen no encontrada en ProductCard:', imageSrc);
            }}
          />
        </Box>
      </Link>
      
      <Text color="white" fontWeight="bold" mt={2} fontSize="lg">
        {product.name || "Sin nombre"}
      </Text>
      <Text color="white" fontSize="md" mb={3}>${product.price || 0}</Text>
      
      <Button 
        colorScheme="purple" 
        variant="solid" 
        width="100%"
        onClick={(e) => {
          e.stopPropagation(); // Evita que el onClick del Box se dispare
          addToCart(product);
        }}
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