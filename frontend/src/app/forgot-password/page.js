"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  useToast,
  Link as ChakraLink
} from "@chakra-ui/react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        status: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSent(true);
      toast({
        title: "✅ Email enviado",
        description: "Revisa tu bandeja de entrada",
        status: "success",
      });

    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="black"
      p={4}
    >
      <Box
        maxW="400px"
        w="100%"
        bg="gray.900"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
      >
        <Heading color="white" mb={6} textAlign="center">
          ¿Olvidaste tu contraseña?
        </Heading>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
              </Text>

              <FormControl isRequired>
                <FormLabel color="white">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  bg="gray.800"
                  color="white"
                  border="1px solid"
                  borderColor="gray.600"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                width="100%"
                isLoading={isLoading}
              >
                Enviar instrucciones
              </Button>

              <Link href="/login" passHref>
                <ChakraLink color="purple.400" fontSize="sm">
                  Volver al login
                </ChakraLink>
              </Link>
            </VStack>
          </form>
        ) : (
          <VStack spacing={4}>
            <Text color="green.400" textAlign="center">
              ✅ Si tu email está registrado, recibirás las instrucciones en breve
            </Text>
            <Text color="gray.400" fontSize="sm" textAlign="center">
              Revisa tu bandeja de entrada y carpeta de spam
            </Text>
            <Link href="/login" passHref>
              <ChakraLink color="purple.400">
                Volver al login
              </ChakraLink>
            </Link>
          </VStack>
        )}
      </Box>
    </Box>
  );
}