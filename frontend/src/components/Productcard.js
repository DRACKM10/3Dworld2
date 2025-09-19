"use client";

import { Box, Image, Text, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} maxW="sm">
      <Link href={`/products/${product.id}`}>
        <Image src={product.image} alt={product.name} borderRadius="md" />
      </Link>
      <Text color='white' fontWeight="bold" mt={2}>{product.name}</Text>
      <Text color='white'> Precio: ${product.price}</Text>
      <Button colorScheme="teal" mt={2} onClick={() => addToCart(product)}>
        Agregar al carrito
      </Button>
    </Box>
  );
}