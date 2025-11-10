"use client";

import { Box, Heading, Text, VStack, HStack, Button, Image } from '@chakra-ui/react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const router = useRouter();

  return (
    <Box p={4} maxW="1200px" mx="auto" color="white" minH="100vh" bg="black">
      <Heading
        mb={6}
        textAlign="center"
        textShadow="0 0 10px #5c212b"
      >
        🛒 Tu Carrito de Compras
      </Heading>

      {cart.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" mb={4}>Tu carrito está vacío</Text>
          <Button
            bg="#5c212b"
            color="white"
            _hover={{ bg: "#333333", transform: "scale(1.02)" }}
            onClick={() => router.push("/productos")}
          >
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
                bg="#292929e0"
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
                          isDisabled={item.quantity <= 1}
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
                      bg="#5c212b"
                      color="#EDEDED"
                      variant="outline"
                      _hover={{ bg: "#333333", transform: "scale(1.02)" }}
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
          <Box p={6} borderWidth="1px" borderRadius="md" bg="#292929e0">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="2xl" fontWeight="bold">Total:</Text>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                ${getCartTotal().toFixed(2)}
              </Text>
            </HStack>

            <HStack spacing={4}>
              <Button
                bg="#5c212b"
                color="white"
                variant="surface"
                onClick={clearCart}
                _hover={{ bg: "#333333", transform: "scale(1.02)" }}
              >
                Limpiar Carrito
              </Button>

              <Button
                bg="#5c212b"
                color="white"
                flex={1}
                size="lg"
                _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
                onClick={() => router.push("/pago")}
              >
                Proceder al Pago
              </Button>
            </HStack>
          </Box>
        </>
      )}
    </Box>
  );
}
