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
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export default function Tienda() {
  const router = useRouter();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Todos"]);
  const [userRole, setUserRole] = useState("cliente");

  // --- Obtener rol desde Supabase ---
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          const role = profile?.role || "cliente";
          setUserRole(role);
          localStorage.setItem("userRole", role);
        } else {
          setUserRole("cliente");
        }
      } catch (err) {
        console.error("Error al obtener rol:", err);
        setUserRole("cliente");
      }
    }

    fetchUserRole();
  }, []);

  // --- Cargar productos ---
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

  // --- Filtrado ---
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

  // --- ACCIONES ADMIN ---
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar producto");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Producto eliminado",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        status: "error",
      });
    }
  };

  const handleAddProduct = () => router.push("/admin/agregar-producto");
  const handleEditProduct = (id) => router.push(`/admin/editar-producto/${id}`);

  // --- ACCIONES CLIENTE ---
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
        <Spinner size="xl" color="red.500" />
        <Text color="white" mt={4}>
          Cargando productos...
        </Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={6}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb={8} textAlign="center">
          <Heading color="white" size="2xl" mb={2}>
            Bienvenido a 3Dworld
          </Heading>
          <Text color="gray.400" fontSize="lg">
            {userRole === "admin"
              ? "Panel de administración de productos"
              : "Descubre nuestros increíbles productos de impresión 3D"}
          </Text>

          {userRole === "admin" && (
            <Button
              mt={4}
              bg="#5c212b"
              color="white"
              _hover={{ bg: "#7a2d3b" }}
              onClick={handleAddProduct}
            >
              ➕ Agregar nuevo producto
            </Button>
          )}
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
              bg={selectedCategory === category ? "#5c212b" : "transparent"}
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
                }}
                 onClick={() => router.push(`/productos/${product.id}`)} // 👈 Redirige al detalle
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
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {product.name}
                  </Text>
                  <Text color="gray.400" fontSize="sm" noOfLines={2}>
                    {product.description}
                  </Text>
                  <Text fontWeight="bold" color="#a3aaff" fontSize="2xl">
                    ${product.price}
                  </Text>

                  {/* Botones dinámicos */}
                  {userRole === "admin" ? (
                    <HStack w="100%">
                      <Button
                        bg="blue.600"
                        color="white"
                        _hover={{ bg: "blue.700" }}
                        onClick={() => handleEditProduct(product.id)}
                        w="50%"
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        bg="red.600"
                        color="white"
                        _hover={{ bg: "red.700" }}
                        onClick={() => handleDeleteProduct(product.id)}
                        w="50%"
                      >
                        🗑️ Eliminar
                      </Button>
                    </HStack>
                  ) : (
                    <Button
                      bg="#5c212b"
                      color="white"
                      width="100%"
                      _hover={{
                        bg: "#7a2d3b",
                        transform: "scale(1.05)",
                      }}
                      onClick={() => handleAddToCart(product)}
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
            <Text color="white" fontSize="xl">
              No se encontraron productos
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
