"use client";
import {  useState } from 'react';
import {Flex, Button, Box, SimpleGrid, Heading } from "@chakra-ui/react";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList"
import ProductFormModal from "../components/ProductFormModal"


export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [products, setProducts] = useState([])

    const handleAddProduct = (newProduct) => {
          setProducts((prev) => [...prev, newProduct]);

    };


    return (
    <Box
      p={4}
      maxW="1200px"
      mx="auto"
      position="relative"
      zIndex={1}
      minHeight="100vh"
      bgGradient="linear(to-b, #0F0F0F, #2E2E2E)"
    >
     
     <Flex justify="space-between" align="center" mb={6}>
          <Heading color="white">Nuestros Productos</Heading>
          <Button colorScheme="teal" onClick={() => setIsModalOpen(true)}>
            Agregar Producto
          </Button>
        </Flex>
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
        <ProductList products={products} />
      </Box>
  );
}