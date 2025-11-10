"use client";

import { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function TiendaCliente() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Todos"]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        if (!response.ok) throw new Error("Error al cargar productos");
        const data = await response.json();

        setProducts(data);
        setFilteredProducts(data);

        const uniqueCategories = [
          "Todos",
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== "Todos") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  const handleAddToCart = (product) => {
    toast({
      title: "Agregado al carrito",
      description: `${product.name} agregado exitosamente`,
      status: "success",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center" bg="#000000" minH="100vh">
        <Text color="white" fontSize="xl">
          Cargando productos...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      bgGradient="linear(to-b, #000000, #0d0d0d)"
      minH="100vh"
      p={6}
      borderRadius="lg"
    >
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb={8} textAlign="center">
          <Heading color="white" size="2xl" mb={2}>
            Catálogo de Productos
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Explora nuestros modelos y artículos en 3D
          </Text>
        </Box>

        {/* Barra de búsqueda */}
        <Box mb={6}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="#5c212b" />
            </InputLeftElement>
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="#111"
              color="white"
              border="1px solid #5c212b"
              _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              _placeholder={{ color: "gray.500" }}
              size="lg"
            />
          </InputGroup>
        </Box>

        {/* Filtros de categoría */}
        <HStack spacing={2} mb={6} flexWrap="wrap" justify="center">
          {categories.map((category) => (
            <Button
              key={category}
              size="md"
              bg={
                selectedCategory === category
                  ? "#5c212b"
                  : "transparent"
              }
              border="1px solid #5c212b"
              color="white"
              _hover={{
                bg: "#7a2d3b",
                transform: "scale(1.05)",
              }}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </HStack>

        {/* Contador de productos */}
        <Text color="gray.400" mb={4}>
          {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </Text>

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                border="1px solid #5c212b"
                borderRadius="lg"
                overflow="hidden"
                p={4}
                bg="#111"
                boxShadow="0 0 10px rgba(92, 33, 43, 0.4)"
                transition="all 0.2s"
                _hover={{
                  transform: "scale(1.03)",
                  boxShadow: "0 0 15px rgba(92, 33, 43, 0.6)",
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/productos/${product.id}`)}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  height="200px"
                  width="100%"
                  objectFit="contain"
                  mb={4}
                  borderRadius="md"
                  bg="black"
                />

                <VStack align="start" spacing={2}>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    noOfLines={1}
                    color="white"
                  >
                    {product.name}
                  </Text>
                  <Text color="gray.400" fontSize="sm" noOfLines={2}>
                    {product.description}
                  </Text>
                  <Text fontWeight="bold" color="#a3aaff" fontSize="2xl">
                    ${product.price}
                  </Text>

                  {product.stock !== undefined && (
                    <Text
                      fontSize="xs"
                      color={product.stock > 0 ? "green.400" : "red.400"}
                    >
                      {product.stock > 0
                        ? `${product.stock} disponibles`
                        : "Agotado"}
                    </Text>
                  )}

                  <Button
                    bg="#5c212b"
                    color="white"
                    width="100%"
                    _hover={{
                      bg: "#7a2d3b",
                      transform: "scale(1.05)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    size="lg"
                    isDisabled={product.stock === 0}
                  >
                    🛒 Agregar al carrito
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Text color="white" fontSize="xl" mb={4}>
              No se encontraron productos
            </Text>
            {(selectedCategory !== "Todos" || searchTerm) && (
              <Button
                bg="#5c212b"
                color="white"
                _hover={{ bg: "#7a2d3b" }}
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSearchTerm("");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
