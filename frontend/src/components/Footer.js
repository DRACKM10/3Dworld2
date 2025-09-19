import { Box, Text, Flex } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" p={4} bg="gray.800" color="white" mt={8}>
      <Flex maxW="1200px" mx="auto" justify="center">
        <Text>&copy; 2025 Mi Tienda 3D. Todos los derechos reservados.</Text>
      </Flex>
    </Box>
  );
}