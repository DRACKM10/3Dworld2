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
import { useCart } from "../context/CartContext";
import ProductFormModal from "../components/ProductFormModal";

export default function HomePage() {
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Todos"]);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Detectar rol
  useEffect(() => {
    const checkAuth = () => {
      const role = localStorage.getItem("userRole");
      const token = localStorage.getItem("token");

      setUserRole(role);
      setIsLoggedIn(!!token);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Cargar productos
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
        console.error("❌ Error:", err);
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

  // Filtros
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

  // Modal
  const openCreateModal = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  const handleProductSaved = (newOrUpdatedProduct) => {
    if (editProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === newOrUpdatedProduct.id ? newOrUpdatedProduct : p))
      );
    } else {
      setProducts((prev) => [...prev, newOrUpdatedProduct]);
    }
    closeModal();
  };

  // Eliminar producto
  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: "Producto eliminado",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
      });
    }
  };

  // Agregar al carrito
  const handleAddToCart = (product, e) => {
    e.stopPropagation();

    addToCart(product);
    toast({
      title: "Agregado al carrito",
      description: `${product.name} agregado exitosamente`,
      status: "success",
      duration: 2000,
    });
  };

  if (loading) {
    return (
      <Box
        p={4}
        textAlign="center"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="white"
      >
        <VStack>
          <Spinner size="xl" color="#5c212b" thickness="4px" />
          <Text color="black" mt={4} fontSize="lg">
            Cargando productos...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Box minH="100vh" p={4} bg="white">
        <Box maxW="1400px" mx="auto">

          {/* 🔥 Banner superior */}
          <Box
            w="100%"
            h="250px"
            bgImage="url('/images/banner.jpg')"
            bgSize="cover"
            bgPosition="center"
            borderRadius="lg"
            mb={8}
            boxShadow="0 4px 15px rgba(0,0,0,0.3)"
            position="relative"
          >
            <Flex
              w="100%"
              h="100%"
              align="center"
              justify="center"
              direction="column"
              bg="rgba(0,0,0,0.35)"
              borderRadius="lg"
            >
              <Heading 
                color="white"
                size="2xl"
                mb={2}
                textShadow="2px 2px 5px rgba(0,0,0,0.7)"
              >
                Bienvenido a 3Dworld
              </Heading>

              <Text color="white" fontSize="lg" fontWeight="500">
                {userRole === "admin"
                  ? "🔧 Panel de administración de productos"
                  : "Descubre nuestros increíbles productos de impresión 3D"}
              </Text>
            </Flex>
          </Box>

          {/* Buscador */}
          <Box mb={6}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="#5c212b" />
              </InputLeftElement>
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                color="black"
                border="2px solid #5c212b"
                _focus={{
                  borderColor: "#a3aaffff",
                  boxShadow: "0 0 10px rgba(163, 170, 255, 0.5)",
                }}
                _placeholder={{ color: "gray.500" }}
              />
            </InputGroup>
          </Box>

          {/* Filtros */}
          <HStack spacing={2} mb={6} flexWrap="wrap" justify="center">
            {categories.map((category) => (
              <Button
                key={category}
                size="md"
                bg={selectedCategory === category ? "#5c212b" : "white"}
                border="2px solid #5c212b"
                color={selectedCategory === category ? "white" : "#5c212b"}
                _hover={{
                  bg: selectedCategory === category ? "#7a2d3b" : "#5c212b",
                  color: "white",
                  transform: "scale(1.05)",
                }}
                onClick={() => setSelectedCategory(category)}
                transition="all 0.2s"
              >
                {category}
              </Button>
            ))}
          </HStack>

          <Text color="black" mb={4} textAlign="center" fontWeight="500">
            {filteredProducts.length} producto
            {filteredProducts.length !== 1 ? "s" : ""} encontrado
            {filteredProducts.length !== 1 ? "s" : ""}
          </Text>

          {/* Grid */}
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
                  bg="white"
                  boxShadow="0 4px 10px rgba(92, 33, 43, 0.2)"
                  transition="all 0.3s"
                  _hover={{
                    transform: "scale(1.03)",
                    boxShadow: "0 8px 20px rgba(163, 170, 255, 0.4)",
                    borderColor: "#a3aaffff",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/productos/${product.id}`)}
                >
                  {/* Botones admin */}
                  {userRole === "admin" && (
                    <Flex position="absolute" top={2} right={2} gap={2} zIndex={10}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(product);
                        }}
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
                    bg="gray.50"
                  />

                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg" noOfLines={1} color="black">
                      {product.name}
                    </Text>
                    <Text color="gray.600" fontSize="sm" noOfLines={2}>
                      {product.description}
                    </Text>
                    <Text fontWeight="bold" color="#5c212b" fontSize="2xl">
                      ${product.price}
                    </Text>

                    {product.stock !== undefined && (
                      <Text fontSize="xs" color={product.stock > 0 ? "green.500" : "red.500"}>
                        {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                      </Text>
                    )}

                    {userRole !== "admin" && (
                      <Button
                        bg="#5c212b"
                        color="white"
                        width="100%"
                        _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
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
              <Text color="black" fontSize="xl" mb={4}>
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

        {/* Botón flotante cliente */}
        {userRole === "client" && (
          <Button
            position="fixed"
            bottom="30px"
            right="30px"
            zIndex="999999"
            bg="#5c212b"
            color="white"
            height="70px"
            width="70px"
            borderRadius="full"
            fontSize="40px"
            fontWeight="bold"
            boxShadow="0 0 20px rgba(92, 33, 43, 0.5)"
            _hover={{
              transform: "scale(1.15)",
              bg: "#7a2d3b",
            }}
            onClick={openCreateModal}
          >
            +
          </Button>
        )}
      </Box>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddProduct={handleProductSaved}
        editProduct={editProduct}
      />
    </>
  );
}
