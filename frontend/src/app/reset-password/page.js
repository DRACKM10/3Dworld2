"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast({
        title: "Error",
        description: "Token inválido",
        status: "error",
      });
      router.push("/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        status: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        status: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        status: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://threedworld2.onrender.com/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast({
        title: "✅ Contraseña actualizada",
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
        status: "success",
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
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
      p={4}
    >
      <Box
        maxW="400px"
        w="100%"
        bg="rgba(20, 20, 20, 0.85)"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
      >
        <Heading color="white" mb={6} textAlign="center">
          Nueva Contraseña
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color="white">Nueva Contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  bg="#1a1a1a"
                  color="white"
                  _placeholder={{ color: "gray.500" }}
                  border="2px solid #333333"
                  _focus={{
                    borderColor: "#5c212b",
                    boxShadow: "0 0 10px #5c212b",
                  }}
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    aria-label="Toggle password"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="white">Confirmar Contraseña</FormLabel>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                bg="#1a1a1a"
                color="white"
                _placeholder={{ color: "gray.500" }}
                border="2px solid #333333"
                _focus={{
                  borderColor: "#5c212b",
                  boxShadow: "0 0 10px #5c212b",
                }}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="100%"
              isLoading={isLoading}
            >
              Restablecer Contraseña
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Heading color="white">Cargando...</Heading>
      </Box>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}