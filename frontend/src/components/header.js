import { Box, Flex, Heading, Input, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';

export default function Header() {
  return (
    <Box as="header" p={4} bg="teal.500" color="white">
      <Flex maxW="1200px" mx="auto" justify="space-between" align="center" >
        <Link href="/">
          <Heading size="md">3Dworld</Heading>
        </Link>
        
        <Input placeholder="Buscar productos" maxW="400px" bg="white" color="black" />
        <Flex gap={4}>
          <Link href="/productos">
          <Button colorPalette="gray" variant="outline" color="white" _hover={{background: "pink.800"}} >Productos</Button>
          </Link>
          <Link href="/carrito">
            <Button colorScheme="gray" variant="outline" color="white"_hover={{background: "pink.800"}}>Carrito</Button>
          </Link>
          <Link href="/log-in">
            <Button colorScheme="gray" variant="outline" color="white"_hover={{background: "pink.800"}}>Iniciar Sesión</Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}