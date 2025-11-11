"use client";

import { useState } from 'react';
import { Flex, Button, Box, Heading, Text } from "@chakra-ui/react";
import ProductList from "../../components/ProductList";
import ProductFormModal from "../../components/ProductFormModal";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function ProductosAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editProduct, setEditProduct] = useState(null);

  const handleAddOrUpdateProduct = (product) => {
    setRefreshKey(prev => prev + 1);
    console.log('✅ Producto guardado, recargando lista...');
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <Box
        p={4}
        bg="black"
        maxW="1200px"
        mx="auto"
        position="relative"
        zIndex={1}
        minHeight="100vh"
      >
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading color="white" mb={2}>
              🔧 Panel de Administración
            </Heading>
            <Text color="gray.400">
              Gestiona todos los productos de la tienda
            </Text>
          </Box>
          
          <Button 
            color="white" 
            bg="#5c212b" 
            _hover={{ bg:"#7a2d3b", transform: "scale(1.05)" }} 
            onClick={() => {
              setEditProduct(null);
              setIsModalOpen(true);
            }}
            size="lg"
          >
            ➕ Agregar Producto
          </Button>
        </Flex>

        <ProductFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddProduct={handleAddOrUpdateProduct}
          editProduct={editProduct}
        />

        <ProductList 
          refreshTrigger={refreshKey}
          onEdit={handleEdit}
        />
      </Box>
    </ProtectedRoute>
  );
}