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
  Spinner,
  Collapse,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import STLViewer from "../../../components/STLViewer"; // ✅ Importar el componente EXTERNO

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showSTLViewer, setShowSTLViewer] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        console.log("🔄 Fetching product with ID:", id);
        const response = await fetch(`http://localhost:8000/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("✅ Product data:", data);
        console.log("📦 STL File:", data.stl_file);
        
        setProduct(data);
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id, toast]);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} fue agregado correctamente`,
      status: "success",
      duration: 2000,
    });
    setTimeout(() => router.push("/carrito"), 1500);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getSTLUrl = () => {
    if (!product?.stl_file) return null;
    
    const url = product.stl_file.startsWith("http")
      ? product.stl_file
      : `http://localhost:8000${product.stl_file}`;
    
    console.log("🔗 STL URL construida:", url);
    return url;
  };

  if (loading)
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" />
          <Text color="white" fontSize="xl">Cargando producto...</Text>
        </VStack>
      </Box>
    );

  if (!product)
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="xl">Producto no encontrado</Text>
          <Button 
            colorScheme="purple" 
            onClick={() => router.push("/productos")}
            size="lg"
          >
            Volver a productos
          </Button>
        </VStack>
      </Box>
    );

  const stlUrl = getSTLUrl();

  return (
    <Box p={4} maxW="1200px" mx="auto" mt={4} bg="blackAlpha.600" minH="100vh" borderRadius="lg">
      <Flex direction={{ base: "column", md: "row" }} gap={8} mb={10}>
        <Box 
          flex={1} 
          height={{ base: "300px", md: "500px" }} 
          borderRadius="12px" 
          overflow="hidden" 
          bg="blackAlpha.400"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {!imageError ? (
            <Image
              src={product.image}
              alt={product.name || "Producto"}
              width="100%"
              height="100%"
              objectFit="contain"
              borderRadius="12px"
              onError={handleImageError}
              fallback={<Spinner color="purple.500" />}
            />
          ) : (
            <VStack spacing={3} color="gray.400">
              <Text fontSize="lg">📷</Text>
              <Text>Imagen no disponible</Text>
            </VStack>
          )}
        </Box>

        <Box flex={1} color="white" py={4}>
          <Heading as="h1" size="xl" mb={3} color="whiteAlpha.900">
            {product.name}
          </Heading>
          
          <Text fontSize="3xl" fontWeight="bold" color="#a3aaff" mb={4}>
            ${product.price}
          </Text>
          
          <Text mb={6} color="gray.300" fontSize="lg" lineHeight="1.6">
            {product.description}
          </Text>

          <VStack spacing={3} align="start" mb={8}>
            {product.category && (
              <Text color="gray.400">
                <strong>Categoría:</strong> {product.category}
              </Text>
            )}
            {product.stock !== undefined && (
              <Text color={product.stock > 0 ? "green.400" : "red.400"}>
                <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </Text>
            )}
            {stlUrl && (
              <Text color="purple.400">
                <strong>✅ Modelo 3D disponible</strong>
              </Text>
            )}
          </VStack>

          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="purple"
              bg="#805AD5"
              _hover={{ 
                bg: "#6B46C1", 
                transform: "translateY(-2px)",
                boxShadow: "lg"
              }}
              size="lg"
              height="60px"
              fontSize="lg"
              onClick={handleAddToCart}
              isDisabled={product.stock === 0}
              transition="all 0.2s"
            >
              {product.stock > 0 ? "🛒 Agregar al carrito" : "❌ Producto agotado"}
            </Button>

            {stlUrl && (
              <Button
                colorScheme="blue"
                variant="outline"
                size="lg"
                height="50px"
                onClick={() => setShowSTLViewer(!showSTLViewer)}
                rightIcon={showSTLViewer ? <ChevronUpIcon /> : <ChevronDownIcon />}
              >
                {showSTLViewer ? "⬆️ Ocultar Vista 3D" : "🎮 Ver en 3D / 360°"}
              </Button>
            )}

            <Button
              variant="outline"
              colorScheme="whiteAlpha"
              size="lg"
              height="50px"
              onClick={() => router.push("/productos")}
              _hover={{ bg: "whiteAlpha.100" }}
            >
              ← Volver a productos
            </Button>
          </VStack>
        </Box>
      </Flex>

      {stlUrl && (
        <Box 
          mt={6}
          bg="blackAlpha.400" 
          borderRadius="12px"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Collapse in={showSTLViewer} animateOpacity>
            <Box p={6}>
              <Heading size="lg" mb={2} color="white" textAlign="center">
                🎮 Vista 3D Interactiva
              </Heading>
              <Text mb={6} color="gray.400" textAlign="center">
                Explora el modelo en 3D desde todos los ángulos
              </Text>
              
              {/* ✅ Esto usa el componente EXTERNO STLViewer */}
              <STLViewer url={stlUrl} />
              
              <Text mt={4} color="gray.500" textAlign="center" fontSize="sm">
                💡 Usa el mouse para rotar • Rueda para zoom
              </Text>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}