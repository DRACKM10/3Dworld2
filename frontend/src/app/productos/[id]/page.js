"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext"; 

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}`);
        if (!response.ok) throw new Error("Error al cargar el producto");

        const data = await response.json();
        console.log("📦 Producto cargado:", data);
        setProduct(data);
      } catch (error) {
        console.error("Error al cargar producto:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id, toast]);

  if (loading)
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh">
        <Text color="white" fontSize="xl">
          Cargando producto...
        </Text>
      </Box>
    );

  if (!product)
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh">
        <Text color="white" fontSize="xl">
          Producto no encontrado
        </Text>
        <Button mt={4} colorScheme="purple" onClick={() => router.push("/productos")}>
          Volver a productos
        </Button>
      </Box>
    );

  return (
    <Box p={4} maxW="1200px" mx="auto" mt={4} bg="blackAlpha.600" minH="100vh">
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Imagen principal */}
        <Box
          flex={1}
          position="relative"
          height={{ base: "300px", md: "500px" }}
          borderRadius="8px"
          overflow="hidden"
          bg="black.500"
        >
          <Image
            src={product.image}
            alt={product.name || "Producto"}
            width="100%"
            height="100%"
            objectFit="contain"
            borderRadius="8px"
            onError={(e) => {
              console.error("❌ Error al cargar imagen:", product.image);
              e.target.src = "/images/default.jpg";
            }}
          />
        </Box>

        {/* Detalles del producto */}
        <Box flex={1} color="white">
          <Heading as="h1" size="xl" mb={2}>
            {product.name || "Producto sin nombre"}
          </Heading>

          <Text fontSize="2xl" fontWeight="bold" color="#a3aaffff" mb={4}>
            ${product.price || 0}
          </Text>

          <Text mb={4} color="gray.300">
            {product.description || "Sin descripción"}
          </Text>

          {product.category && (
            <Text mb={4} color="gray.400">
              <strong>Categoría:</strong> {product.category}
            </Text>
          )}

          {product.stock !== undefined && (
            <Text mb={4} color={product.stock > 0 ? "green.400" : "red.400"}>
              <strong>Stock:</strong>{" "}
              {product.stock > 0
                ? `${product.stock} disponibles`
                : "Agotado"}
            </Text>
          )}

          <VStack spacing={3} align="stretch">
            {/* ✅ Botón mejorado con redirección */}
            <Button
              colorScheme="purple"
              bg="#5c212b"
              _hover={{ bg: "#6d6c6c73", transform: "scale(1.05)" }}
              size="lg"
              width="100%"
              onClick={() => {
                addToCart(product);
                toast({
                  title: "Agregado al carrito",
                  description: `${product.name} agregado exitosamente`,
                  status: "success",
                  duration: 1200,
                });
                setTimeout(() => router.push("/carrito"), 1000); // ✅ Redirige al carrito
              }}
              isDisabled={product.stock === 0}
            >
              🛒 Agregar al carrito
            </Button>

            <Button
              variant="outline"
              colorScheme="white"
              size="lg"
              bg="white"
              color="black"
              width="100%"
              onClick={() => router.push("/productos")}
            >
              ← Volver a productos
            </Button>
          </VStack>
        </Box>
      </Flex>

      {/* Sección de archivos descargables */}
      {product.files && product.files.length > 0 && (
        <Box mt={6}>
          <Heading size="md" mb={4} color="white">
            Archivos descargables
          </Heading>
          <VStack align="stretch" spacing={3}>
            {product.files.map((file, index) => (
              <Flex
                key={index}
                p={4}
                bg="gray.800"
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <Box>
                  <Text fontWeight="bold" color="white">
                    📁 {file.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {file.type} - {file.size} MB
                  </Text>
                </Box>
                <Button as="a" href={file.url} download colorScheme="purple" size="sm">
                  Descargar
                </Button>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
