"use client";
import { useState } from 'react';
import { Flex, Button, Box, Heading } from "@chakra-ui/react";
import ProductList from "../components/ProductList";
import ProductFormModal from "../components/ProductFormModal";

export default function Home() {
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
    <Box
      p={4}
      maxW="1200px"
      mx="auto"
      position="relative"
      zIndex={1}
      minHeight="100vh"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="white">Nuestros Productos</Heading>
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
  );
}