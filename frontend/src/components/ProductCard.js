"use client";

import { useEffect, useState } from "react";
import { useCart } from '../context/CartContext';
import { Box, Image, Button, Text, VStack, HStack, IconButton, useToast } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import StlViewer from "react-stl-viewer";

export default function ProductCard({ product, onEdit, onDelete }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setIsAdmin(role === 'admin');
  }, []);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = () => {
    router.push(`/productos/${product.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(product);
  };

  const handleDelete = async (e) => {
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

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="red"
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
      {/* Botones solo admin */}
      {isAdmin && (
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
            onClick={handleDelete}
            aria-label="Eliminar"
          />
        </HStack>
      )}

      {/* ============================ */}
      {/* 📌 IMAGEN DEL PRODUCTO */}
      {/* ============================ */}
      <Image
        src={product.image}
        alt={product.name}
        height="100%"
        width="100%"
        objectFit="cover"
        borderRadius="md"
      />

      {/* ============================ */}
      {/* 🔥 VISOR STL DESDE SUPABASE */}
      {/* ============================ */}
      {product.stlFile && (
        <Box
          height="250px"
          width="100%"
          bg="black"
          borderRadius="md"
          mb={4}
          onClick={(e) => e.stopPropagation()} // evita navegar al hacer click en el viewer
        >
          <StlViewer
            url={product.stlFile}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      )}

      {/* ============================ */}
      {/* INFO DEL PRODUCTO */}
      {/* ============================ */}
      <VStack align="start" spacing={2}>
        <Text fontWeight="bold" fontSize="lg" noOfLines={1} color="white">
          {product.name}
        </Text>
        <Text color="white" fontSize="sm" noOfLines={2}>
          {product.description}
        </Text>
        <Text fontWeight="bold" color="#a3aaffff" fontSize="xl">
          ${product.price}
        </Text>

        <Button
          colorScheme="teal"
          width="100%"
          onClick={handleAddToCart}
          size="lg"
          color="white"
          bg="#5c212b"
          _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)" }}
        >
          🛒 Agregar al Carrito
        </Button>
      </VStack>
    </Box>
  );
}
