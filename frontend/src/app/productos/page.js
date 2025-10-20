"use client";

import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import ProductCard from "../../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Error al cargar los productos");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("No se pudieron cargar los productos. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <Text color="white">Cargando...</Text>;
  if (error) return <Text color="white">{error}</Text>;

  return (
    <Box
      p={4}
      maxW="1200px"
      mx="auto"
      minHeight="100vh"
      bgGradient="linear(to-b, #0F0F0F, #2E2E2E)"
    >
      <Heading
        mb={6}
        color="white"
        textAlign="center"
        textShadow="0 0 10px rgba(0, 0, 0, 0.8)"
        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
      >
        Catálogo de Productos
      </Heading>
      {products.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => router.push(`/productos/${product.id}`)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text color="white" textAlign="center">
          No hay productos disponibles.
        </Text>
      )}
    </Box>
  );
}