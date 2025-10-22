"use client";

import { Box, Heading, Text, VStack, HStack, Button, Image } from '@chakra-ui/react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  return (
    <Box p={4} maxW="1200px" mx="auto" color="white" minH="100vh">
      <Heading mb={6} textAlign="center">🛒 Tu Carrito de Compras</Heading>
      
      {cart.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" mb={4}>Tu carrito está vacío</Text>
          <Button colorScheme="teal" as="a" href="/">
            Seguir Comprando
          </Button>
        </Box>
      ) : (
        <>
          <VStack spacing={4} align="stretch" mb={8}>
            {cart.map((item) => (
              <Box 
                key={item.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="gray.800"
                boxShadow="md"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={4} flex={1}>
                    {item.image && (
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    )}
                    <Box flex={1}>
                      <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
                      <Text>Precio unitario: ${item.price}</Text>
                      <HStack mt={2}>
                        <Button 
                          size="sm" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Text minW="40px" textAlign="center">{item.quantity}</Text>
                        <Button 
                          size="sm" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </HStack>
                    </Box>
                  </HStack>
                  
                  <VStack align="end">
                    <Text fontWeight="bold" fontSize="lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <Button 
                      size="sm" 
                      colorScheme="red" 
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Eliminar
                    </Button>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>

          {/* Resumen y acciones */}
          <Box p={6} borderWidth="1px" borderRadius="md" bg="gray.800">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="2xl" fontWeight="bold">Total:</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.400">
                ${getCartTotal().toFixed(2)}
              </Text>
            </HStack>
            
            <HStack spacing={4}>
              <Button colorScheme="red" variant="outline" onClick={clearCart}>
                Limpiar Carrito
              </Button>
              <Button colorScheme="teal" flex={1} size="lg">
                Proceder al Pago
              </Button>
            </HStack>
          </Box>
        </>
      )}
    </Box>
  );
}