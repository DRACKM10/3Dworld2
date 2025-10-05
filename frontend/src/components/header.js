import { Box, Flex, Heading, Input, Button } from '@chakra-ui/react';
import Link from 'next/link';

export default function Header() {
  return (
    <Box
      as="header"
      p={4}
      bgGradient="linear(to-r, #0a012b, #0f0f0f)" // 🔹 Degradado moderno
      color="#EDEDED"
      boxShadow="md"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={3}
      >
        {/* 🔹 Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Heading
            size="md"
            color="#7D00FF"
            _hover={{ textShadow: '0 0 10px #7D00FF' }}
            transition="all 0.3s ease-in-out"
          >
            3Dworld
          </Heading>
        </Link>

        {/* 🔹 Buscador */}
        <Input
          placeholder="Buscar productos"
          maxW="400px"
          bg="white"
          color="black"
          borderRadius="lg"
          border="2px solid #ffffff "
          _focus={{
            borderColor:'#790ceeff',
            boxShadow: '0 0 0 1px #7D00FF'
          }}
          _placeholder={{ color: 'gray.500' }}
        />

        {/* 🔹 Menú de navegación */}
        <Flex gap={4} flexWrap="wrap">
          <Link href="/productos" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              color="#EDEDED"
              borderColor="#7D00FF"
              _hover={{
                bgGradient: 'linear(to-r, #7D00FF, #9B4DFF)',
                transform: 'scale(1.05)',
              }}
              transition="all 0.2s ease-in-out"
            >
              Productos
            </Button>
          </Link>

          <Link href="/carrito" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              color="#EDEDED"
              borderColor="#7D00FF"
              _hover={{
                bgGradient: 'linear(to-r, #7D00FF, #9B4DFF)',
                transform: 'scale(1.05)',
              }}
              transition="all 0.2s ease-in-out"
            >
              Carrito
            </Button>
          </Link>

          <Link href="/log-in" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              color="#EDEDED"
              borderColor="#7D00FF"
              _hover={{
                bgGradient: 'linear(to-r, #7D00FF, #9B4DFF)',
                transform: 'scale(1.05)',
              }}
              transition="all 0.2s ease-in-out"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
