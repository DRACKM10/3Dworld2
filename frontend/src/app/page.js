"use client";

import { useEffect, useState } from "react";
import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import ProductCard from "../components/Productcard";
import Lottie from "lottie-react";

export default function Home() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/public/animations/dashboard.json") // Carga desde public
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  const products = [
    { id: 1, name: "Producto 1", price: 100, image: "/images/product1.png" },
    { id: 2, name: "Producto 2", price: 200, image: "/images/product2.png" },
    { id: 3, name: "Producto 3", price: 150, image: "/images/product3.jpg" },
  ];

  return (
    <>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -2,
          }}
        />
      )}

      <Box
        p={4}
        maxW="1200px"
        mx="auto"
        position="relative"
        zIndex={1}
        minHeight="100vh"
        bg="rgba(0, 0, 0, 0.7)"
      >
        <Heading mb={6} color="white">
          Nuestros Productos
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </Box>
    </>
  );
}
