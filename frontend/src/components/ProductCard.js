"use client";

import { useEffect, useState } from "react";
import { useCart } from '../context/CartContext';
import { 
  Box, 
  Image, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  IconButton, 
  useToast,
  Badge,
  useDisclosure,
  Avatar
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { DownloadIcon, UserIcon, BuildingIcon, StarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StlViewer } from "react-stl-viewer";
import ProductFormModal from './ProductFormModal';

export default function ProductCard({ product, onEdit, onDelete }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentStats, setCommentStats] = useState({ totalComments: 0, averageRating: 0 });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(role === 'admin');
    setCurrentUser(user);
    fetchCommentStats();
  }, [product.id]);

  const fetchCommentStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/comments/product/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setCommentStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching comment stats:', error);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    
    toast({
      title: '✅ Producto agregado',
      description: `${product.name} se añadió al carrito`,
      status: 'success',
      duration: 2000,
    });
  };

  const handleProductClick = () => {
    router.push(`/productos/${product.id}`);
  };

  const handleCreatorClick = (e) => {
    e.stopPropagation();
    if (product.creator_name === '3Dworld') {
      // Navegar a página de 3Dworld
      router.push('/3dworld');
    } else {
      // Navegar al perfil del usuario creador
      router.push(`/perfil/${product.created_by}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onOpen();
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8000/api/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast({
        title: '✅ Producto eliminado',
        status: 'success',
        duration: 2000,
      });

      onDelete(product.id);
    } catch (error) {
      toast({
        title: '❌ Error al eliminar',
        description: error.message,
        status: 'error',
      });
    }
  };

  const handleDownloadSTL = (e) => {
    e.stopPropagation();
    if (product.stl_file) {
      window.open(product.stl_file, '_blank');
    } else {
      toast({
        title: '❌ Sin archivo STL',
        description: 'Este producto no tiene archivo STL disponible',
        status: 'warning',
      });
    }
  };

  // Determinar el tipo de creador y estilos
  const isOfficial = product.creator_name === '3Dworld';
  const creatorIcon = isOfficial ? <BuildingIcon size={14} /> : <UserIcon size={14} />;
  const creatorColor = isOfficial ? 'blue' : 'green';
  const isOwner = currentUser && (currentUser.id === product.created_by || isAdmin);

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg="transparent"
        boxShadow="md"
        position="relative"
        _hover={{
          transform: 'scale(1.02)',
          transition: 'transform 0.2s',
          cursor: 'pointer',
          boxShadow: 'lg',
        }}
        onClick={handleProductClick}
      >
        {/* Botones admin/propietario */}
        {isOwner && (
          <HStack position="absolute" top={2} right={2} spacing={1} zIndex={10}>
            <IconButton
              icon={<EditIcon />}
              size="sm"
              colorScheme="blue"
              onClick={handleEdit}
              aria-label="Editar"
            />
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              onClick={handleDeleteClick}
              aria-label="Eliminar"
            />
          </HStack>
        )}

        {/* Badges informativos */}
        <HStack position="absolute" top={2} left={2} spacing={1} zIndex={10}>
          <Badge
            colorScheme={creatorColor}
            variant="solid"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            <HStack spacing={1}>
              {creatorIcon}
              <Text>{isOfficial ? '3Dworld' : 'Usuario'}</Text>
            </HStack>
          </Badge>

          <Badge
            colorScheme="gray"
            variant="solid"
            borderRadius="md"
            px={2}
            fontSize="xs"
          >
            {product.category}
          </Badge>
        </HStack>

        {/* Imagen del producto */}
        <Box position="relative" mb={4}>
          <Image
            src={product.image}
            alt={product.name}
            height="200px"
            width="100%"
            objectFit="contain"
            borderRadius="md"
          />
          
          {/* Badge STL disponible */}
          {product.stl_file && (
            <Badge
              position="absolute"
              bottom={2}
              right={2}
              colorScheme="green"
              variant="solid"
              borderRadius="md"
              px={2}
            >
              STL Disponible
            </Badge>
          )}
        </Box>

        {/* Visor STL */}
        {product.stl_file && (
          <Box
            height="250px"
            width="100%"
            bg="black"
            borderRadius="md"
            mb={4}
            onClick={(e) => e.stopPropagation()}
            position="relative"
          >
            <StlViewer
              url={product.stl_file}
              style={{ width: "100%", height: "100%" }}
              modelProps={{
                color: "#4FD1C5",
                position: [0, 0, 0],
              }}
            />
            <IconButton
              icon={<DownloadIcon size={16} />}
              aria-label="Descargar STL"
              size="sm"
              colorScheme="blue"
              position="absolute"
              bottom={2}
              right={2}
              onClick={handleDownloadSTL}
            />
          </Box>
        )}

        {/* Información del creador - CLICKABLE */}
        <Box
          p={2}
          bg={isOfficial ? 'blue.50' : 'green.50'}
          borderRadius="md"
          borderLeftWidth="4px"
          borderLeftColor={isOfficial ? 'blue.400' : 'green.400'}
          mb={3}
          onClick={handleCreatorClick}
          cursor="pointer"
          _hover={{
            bg: isOfficial ? 'blue.100' : 'green.100',
            transform: 'translateX(2px)'
          }}
          transition="all 0.2s"
        >
          <HStack spacing={2}>
            <Avatar 
              size="xs" 
              name={isOfficial ? '3Dworld' : product.creator_name}
              bg={isOfficial ? 'blue.500' : 'green.500'}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="medium" color="gray.800">
                {isOfficial ? '🏢 Producto oficial de 3Dworld' : `👤 Creado por ${product.creator_name}`}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {new Date(product.created_at).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Estadísticas de comentarios */}
        {(commentStats.totalComments > 0 || commentStats.averageRating > 0) && (
          <HStack spacing={4} mb={3} fontSize="sm" color="gray.600">
            {commentStats.averageRating > 0 && (
              <HStack spacing={1}>
                <StarIcon size={14} fill="gold" color="gold" />
                <Text>{commentStats.averageRating}</Text>
              </HStack>
            )}
            {commentStats.totalComments > 0 && (
              <Text>{commentStats.totalComments} comentarios</Text>
            )}
          </HStack>
        )}

        {/* Información del producto */}
        <VStack align="start" spacing={3}>
          <Text fontWeight="bold" fontSize="lg" noOfLines={1} color="white">
            {product.name}
          </Text>
          
          <Text color="gray.300" fontSize="sm" noOfLines={2}>
            {product.description}
          </Text>

          <HStack justify="space-between" width="100%">
            <Text fontWeight="bold" color="#a3aaff" fontSize="xl">
              ${product.price}
            </Text>
            <Text fontSize="sm" color="gray.400">
              Stock: {product.stock}
            </Text>
          </HStack>

          <Button
            colorScheme="teal"
            width="100%"
            onClick={handleAddToCart}
            size="lg"
            color="white"
            bg="#5c212b"
            _hover={{ 
              bg: "#6d6c6c73", 
              transform: "scale(1.05)" 
            }}
            isDisabled={product.stock === 0}
          >
            {product.stock === 0 ? '❌ Agotado' : '🛒 Agregar al Carrito'}
          </Button>
        </VStack>
      </Box>

      {/* Modal de edición */}
      <ProductFormModal
        isOpen={isOpen}
        onClose={onClose}
        product={product}
        onSuccess={() => {
          onClose();
          if (onEdit) onEdit();
        }}
      />
    </>
  );
}