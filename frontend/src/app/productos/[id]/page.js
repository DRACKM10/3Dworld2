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
  Badge,
  HStack,
  Avatar
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import  STLViewer from "../../../components/STLViewer";
import CommentsSection from "../../../components/CommentsSection";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showSTLViewer, setShowSTLViewer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Obtener usuario actual del localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        console.log("👤 Usuario actual:", user);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    }
  }, []);

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
        console.log("👤 Creador del producto:", {
          creator_name: data.creator_name,
          created_by: data.created_by,
          is_official: data.creator_name === '3Dworld'
        });
        
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

  // Determinar información del creador
  const getCreatorInfo = () => {
    if (!product) return null;
    
    const isOfficial = product.creator_name === '3Dworld';
    
    return {
      name: product.creator_name || "Usuario",
      isOfficial: isOfficial,
      badgeColor: isOfficial ? "blue" : "green",
      icon: isOfficial ? "🏢" : "👤",
      description: isOfficial ? "Producto oficial de 3Dworld" : `Creado por ${product.creator_name}`
    };
  };

  if (loading)
    return (
      <Box p={4} textAlign="center" bg="black" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#5c212b" />
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
  const creatorInfo = getCreatorInfo();

  return (
    <Box p={4} maxW="1200px" mx="auto" mt={4} border="8px solid #5c212b" minH="100vh" borderRadius="lg">
      <Flex direction={{ base: "column", md: "row" }} gap={8} mb={10}>
        <Box 
          flex={1} 
          height={{ base: "300px", md: "500px" }} 
          borderRadius="12px" 
          overflow="hidden" 
          bg="#f9f5f5"
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

        <Box flex={1} color="black" py={4}>
          <Heading as="h1" size="xl" mb={3} color="black">
            {product.name}
          </Heading>
          
          {/* Información del creador */}
          {creatorInfo && (
            <Box 
              mb={4} 
              p={3} 
              bg={creatorInfo.isOfficial ? 'blue.50' : 'green.50'}
              borderRadius="md"
              borderLeft="4px solid"
              borderLeftColor={creatorInfo.isOfficial ? 'blue.400' : 'green.400'}
            >
              <HStack spacing={3}>
                <Avatar 
                  size="sm" 
                  name={creatorInfo.name}
                  bg={creatorInfo.isOfficial ? 'blue.500' : 'green.500'}
                  color="white"
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.800">
                    {creatorInfo.icon} {creatorInfo.description}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Publicado el {new Date(product.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}
          
          <Text fontSize="3xl" fontWeight="bold" color="#7a2d3b" mb={4}>
            ${product.price}
          </Text>
          
          <Text mb={6} color="gray.600" fontSize="lg" lineHeight="1.6">
            {product.description}
          </Text>

          <VStack spacing={3} align="start" mb={8}>
            {product.category && (
              <Text color="#000000">
                <strong>Categoría:</strong> {product.category}
              </Text>
            )}
            {product.stock !== undefined && (
              <Text color={product.stock > 0 ? "green.500" : "red.400"}>
                <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </Text>
            )}
            {stlUrl && (
              <Text color="#5c212b">
                <strong>✅ Modelo 3D disponible</strong>
              </Text>
            )}
            
            {/* Badge de tipo de producto */}
            <Badge 
              colorScheme={creatorInfo?.isOfficial ? "blue" : "green"} 
              variant="subtle"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="full"
            >
              {creatorInfo?.isOfficial ? "🏢 Producto Oficial" : "👤 Creador Independiente"}
            </Badge>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Button
              colorScheme="purple"
              bg="#5c212b"
              _hover={{ 
                bg: "#5c212b", 
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
                colorScheme="white"
                border="1px solid #5c212b"
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
              colorScheme="white"
              color="black"
              size="lg"
              height="50px"
              onClick={() => router.push("/productos")}
              _hover={{ bg: "blackAlpha.300" }}
            >
              ← Volver a productos
            </Button>
          </VStack>
        </Box>
      </Flex>

      {stlUrl && (
        <Box 
          mt={6}
          bg="#5c212b"
          borderRadius="12px"
          border="5px solid #5c212b"
          borderColor="whiteAlpha.200"
        >
          <Collapse in={showSTLViewer} animateOpacity>
            <Box p={6}>
              <Heading size="lg" mb={2} color="white" textAlign="center">
                🎮 Vista 3D Interactiva
              </Heading>
              <Text mb={6} color="white" textAlign="center">
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

      {/* Mostrar sección de comentarios */}
      <Box mt={6}>
        <CommentsSection 
          productId={id} 
          currentUser={currentUser} 
        />
      </Box>
    </Box>
  );
}