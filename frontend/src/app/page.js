import { Box, SimpleGrid, Heading } from "@chakra-ui/react";
import ProductCard from "../components/productCard";

export default function Home() {
  const products = [
    { id: 1, name: "Producto 1", price: 100, image: "/images/ej1.jpg" },
    { id: 2, name: "Producto 2", price: 200, image: "/images/ej2.jpg" },
    { id: 3, name: "Producto 3", price: 150, image: "/images/ej3.jpg" },
  ];

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
      <Heading
        mb={6}
        color="white"
        textAlign="center"
        textShadow="0 0 10px rgba(0, 0, 0, 0.8)"
      >
        Nuestros Productos
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Box>
  );
}