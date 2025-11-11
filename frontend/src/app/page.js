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
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  IconButton,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Todos"]);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Detectar rol del usuario
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    
    console.log("🔍 Rol detectado:", role);
    console.log("🔐 Token existe:", !!token);
    
    setUserRole(role);
    setIsLoggedIn(!!token);
  }, []);

  // Cargar productos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        if (!response.ok) throw new Error("Error al cargar productos");
        const data = await response.json();

        console.log("📦 Productos cargados:", data.length);

        setProducts(data);
        setFilteredProducts(data);

        const uniqueCategories = [
          "Todos",
          ...new Set(data.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("❌ Error al cargar productos:", err);
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

  // Filtrado
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

  // Acciones de Admin
  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();
    
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar producto");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== id));
      
      toast({
        title: "✅ Producto eliminado",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error("❌ Error:", err);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el producto",
        status: "error",
      });
    }
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    router.push(`/productos?edit=${product.id}`);
  };

  const handleAddNewProduct = () => {
    router.push("/productos");
  };

  // Acción de Cliente
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    
    toast({
      title: "Agregado al carrito",
      description: `${product.name} agregado exitosamente`,
      status: "success",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack>
          <Spinner size="xl" color="#5c212b" />
          <Text color="white" mt={4}>Cargando productos...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="black" minH="100vh" p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb={8} textAlign="center">
          <Heading 
            color="white" 
            size="2xl" 
            mb={2}
            bgGradient="linear(to-r, #5c212b, #a3aaffff)"
            bgClip="text"
          >
            Bienvenido a 3Dworld
          </Heading>
          <Text color="gray.400" fontSize="lg">
            {userRole === "admin"
              ? "🔧 Panel de administración de productos"
              : "Descubre nuestros increíbles productos de impresión 3D"}
          </Text>

          {/* Botón Agregar Producto - Solo Admin */}
          {userRole === "admin" && (
            <Button
              mt={4}
              bg="#5c212b"
              color="white"
              _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
              onClick={handleAddNewProduct}
              size="lg"
            >
              ➕ Agregar nuevo producto
            </Button>
          )}
        </Box>

        {/* Barra de búsqueda */}
        <Box mb={6}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.900"
              color="white"
              border="2px solid #5c212b"
              _focus={{ 
                borderColor: "#a3aaffff", 
                boxShadow: "0 0 10px #5c212b" 
              }}
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
              bg={selectedCategory === category ? "#5c212b" : "gray.800"}
              border="2px solid"
              borderColor={selectedCategory === category ? "#a3aaffff" : "#5c212b"}
              color="white"
              _hover={{
                bg: "#7a2d3b",
                transform: "scale(1.05)",
                borderColor: "#a3aaffff"
              }}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </HStack>

        {/* Contador de productos */}
        <Text color="gray.400" mb={4} textAlign="center">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
        </Text>

        {/* Grid de productos */}
        {filteredProducts.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                position="relative"
                border="2px solid #5c212b"
                borderRadius="lg"
                overflow="hidden"
                p={4}
                bg="gray.900"
                boxShadow="0 0 10px rgba(92, 33, 43, 0.3)"
                transition="all 0.3s"
                _hover={{
                  transform: "scale(1.03)",
                  boxShadow: "0 0 20px rgba(163, 170, 255, 0.4)",
                  borderColor: "#a3aaffff",
                  cursor: "pointer",
                }}
                onClick={() => router.push(`/productos/${product.id}`)}
              >
                {/* Botones de Admin - Solo visible para admin */}
                {userRole === "admin" && (
                  <Flex
                    position="absolute"
                    top={2}
                    right={2}
                    gap={2}
                    zIndex={10}
                  >
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      onClick={(e) => handleEditProduct(product, e)}
                      aria-label="Editar"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={(e) => handleDeleteProduct(product.id, e)}
                      aria-label="Eliminar"
                    />
                  </Flex>
                )}

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
                  <Text 
                    color="gray.400" 
                    fontSize="sm" 
                    noOfLines={2}
                  >
                    {product.description}
                  </Text>
                  <Text 
                    fontWeight="bold" 
                    color="#a3aaffff" 
                    fontSize="2xl"
                  >
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

                  {/* Botón Cliente - Solo visible para no-admin o no logueados */}
                  {userRole !== "admin" && (
                    <Button
                      bg="#5c212b"
                      color="white"
                      width="100%"
                      _hover={{
                        bg: "#7a2d3b",
                        transform: "scale(1.05)",
                      }}
                      onClick={(e) => handleAddToCart(product, e)}
                      size="lg"
                      isDisabled={product.stock === 0}
                    >
                      🛒 Agregar al carrito
                    </Button>
                  )}
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