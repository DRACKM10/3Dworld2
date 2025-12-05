"use client";

import { useState, useEffect, Suspense } from 'react';
import { Flex, Button, Box, Heading, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from 'next/navigation';
import ProductList from "../../components/ProductList";
import ProductFormModal from "../../components/ProductFormModal";
import ProtectedRoute from "../../components/ProtectedRoute";

function ProductosContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      console.log("🔍 Detectado producto a editar:", editId);
      fetchProductToEdit(editId);
    }
  }, [searchParams]);

  const fetchProductToEdit = async (id) => {
    try {
      const response = await fetch(`https://threedworld2.onrender.com/api/products/${id}`);
      if (!response.ok) throw new Error("Producto no encontrado");
      
      const product = await response.json();
      console.log("📦 Producto cargado para editar:", product);
      
      setEditProduct(product);
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Error al cargar producto:", error);
    }
  };

  const handleAddOrUpdateProduct = (product) => {
    setRefreshKey(prev => prev + 1);
    console.log('✅ Producto guardado, recargando lista...');
    router.push('/productos');
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
    router.push('/productos');
  };

  return (
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
          <Text color="white">
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
  );
}

export default function ProductosAdmin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Suspense fallback={
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
          <Heading color="white">Cargando productos...</Heading>
        </Box>
      }>
        <ProductosContent />
      </Suspense>
    </ProtectedRoute>
  );
}