"use client";

import { useEffect, useState } from "react";
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Text, 
  Flex, 
  Button, 
  HStack,
  Input,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import ProductCard from "../../components/ProductCard";
import ProductFormModal from "../../components/ProductFormModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(["Todos"]);
  
  // Para admin (opcional)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:8000/api/products");
        if (!response.ok) throw new Error("Error al cargar los productos");
        const data = await response.json();
        
        setProducts(data);
        setFilteredProducts(data);
        
        // Extraer categorías únicas
        const uniqueCategories = ["Todos", ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("No se pudieron cargar los productos. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [refreshKey]);

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let result = products;

    // Filtrar por categoría
    if (selectedCategory !== "Todos") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  const handleEdit = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddOrUpdateProduct = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return (
    <Box p={4} textAlign="center">
      <Text color="white" fontSize="xl">Cargando productos...</Text>
    </Box>
  );

  if (error) return (
    <Box p={4} textAlign="center">
      <Text color="red.400" fontSize="xl">{error}</Text>
    </Box>
  );

  return (
    <Box
      p={4}
      maxW="1200px"
      mx="auto"
      minHeight="100vh"
       
    >
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading
          color="white"
          fontSize={{ base: "2xl", md: "3xl" }}
        >
          Catálogo de Productos
        </Heading>
        
        {/* Botón admin (opcional, puedes quitarlo si no quieres editar desde aquí) */}
        <Button 
          color="white" 
          bg="#5c212b" 
          _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)" }} 
          onClick={() => {
            setEditProduct(null);
            setIsModalOpen(true);
          }}
        >
          Agregar Producto
        </Button>
      </Flex>

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
            bg="white"
            color="white"
            border="1px solid"
            borderColor="#5c212b"
            _placeholder={{ color: "gray.400" }}
          />
        </InputGroup>
      </Box>

      {/* Filtros de categoría */}
      <HStack spacing={2} mb={6} flexWrap="wrap">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            colorScheme={selectedCategory === category ? "black" : "black"} bg="#5c212b" color="white" _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)" }} 
            variant={selectedCategory === category ? "outline" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </HStack>

      {/* Cantidad de productos */}
      <Text color="gray.400" mb={4}>
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
      </Text>

      {/* Grid de productos */}
      {filteredProducts.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Text color="white" fontSize="xl">
            No se encontraron productos
          </Text>
          {(selectedCategory !== "Todos" || searchTerm) && (
            <Button 
              mt={4} 
              colorScheme="purple" 
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

      {/* Modal para agregar/editar */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onAddProduct={handleAddOrUpdateProduct}
        editProduct={editProduct}
      />
    </Box>
  );
}