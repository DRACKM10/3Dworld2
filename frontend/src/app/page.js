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
      bg="black"
      maxW="1200px"
      mx="auto"
      position="relative"
      zIndex={1}
      minHeight="100vh"
    >
     
     <Flex justify="space-between" align="center" mb={6}>
          <Heading color="white">Nuestros Productos</Heading>
          <Button color="white" bg="#5c212b"  _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)",}} onClick={() => setIsModalOpen(true)}>
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