"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Image, Button, VStack, Flex, useToast } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}`);
        
        if (!response.ok) throw new Error('Error al cargar el producto');
        
        const data = await response.json();
        console.log('📦 Producto cargado:', data);
        
        setProduct(data);
      } catch (error) {
        console.error('Error al cargar producto:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) return (
    <Box p={4} textAlign="center">
      <Text color="white">Cargando producto...</Text>
    </Box>
  );

  if (!product) return (
    <Box p={4} textAlign="center">
      <Text color="white">Producto no encontrado</Text>
      <Button mt={4} onClick={() => router.push('/productos')}>
        Volver a productos
      </Button>
    </Box>
  );

  return (
    <Box p={4} maxW="1200px" mx="auto" mt={4}  minH="100vh">
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Imagen principal */}
        <Box flex={1} position="relative" height={{ base: "300px", md: "500px" }} borderRadius="8px" overflow="hidden" bg="#1a1a1a8a">
          <Image
            src={product.image}
            alt={product.name || 'Producto'}
            width="100%"
            height="100%"
            objectFit="contain"
            borderRadius="8px"
            onError={(e) => {
              console.error('❌ Error al cargar imagen:', product.image);
              e.target.src = '/images/default.jpg';
            }}
          />
        </Box>

        {/* Detalles del producto */}
        <Box flex={1} color="white">
          <Heading as="h1" size="xl" mb={2}>
            {product.name || 'Producto sin nombre'}
          </Heading>
          
          <Text fontSize="2xl" fontWeight="bold" color="#a3aaffff" mb={4}>
            ${product.price || 0}
          </Text>
          
          <Text mb={4} color="gray.300">
            {product.description || 'Sin descripción'}
          </Text>

          {product.category && (
            <Text mb={4} color="gray.400">
              <strong>Categoría:</strong> {product.category}
            </Text>
          )}

          {product.stock !== undefined && (
            <Text mb={4} color={product.stock > 0 ? "green.400" : "red.400"}>
              <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </Text>
          )}

          <VStack spacing={3} align="stretch">
            <Button
              bg="#5c212b"
              size="lg"
              width="100%"
              color="white"
              onClick={() => {

                toast({
                  title: "Agregado al carrito",
                  description: `${product.name} agregado exitosamente`,
                  status: "success",
                  duration: 2000,
                });
              }}
              isDisabled={product.stock === 0}
            >
              🛒 Agregar al carrito
            </Button>

            <Button
              variant="outline"
              bg="white"
              size="lg"
              width="100%"
              onClick={() => router.push('/productos')}
            >
              ← Volver a productos
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}