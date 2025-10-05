"use client";

import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, addToCart, removeFromCart } = useCart();

  return (
    <Box p={4} maxW="1200px" mx="auto" color="white">
      <Heading mb={6}>Carrito de Compras</Heading>
      {cart.length === 0 ? (
        <Text>El carrito está vacío</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {cart.map((item) => (
            <Box key={item.id} p={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="bold">{item.name}</Text>
              <Text>Precio: ${item.price}</Text>
              <Button size="sm" onClick={() => addToCart(item)}>
                Agregar otro
              </Button>
              <Button size="sm" ml={2} onClick={() => removeFromCart(item.id)}>
                Eliminar producto
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}