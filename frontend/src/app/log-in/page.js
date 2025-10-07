"use client";

import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    if (!email) return setErrorEmail("El correo es obligatorio");
    if (!password) return setErrorPassword("La contraseña es obligatoria");

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido ${res.user?.name || ""}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Error al iniciar sesión",
        description: res.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="100vh" bg="#0F0F0F">
        <Spinner size="xl" color="#7D00FF" />
      </Box>
    );
  }

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-b, #0F0F0F, #2E2E2E)"
      color="#EDEDED"
    >
      <Box
        bg="rgba(20, 20, 20, 0.85)"
        p={8}
        borderRadius="2xl"
        boxShadow="0 0 20px rgba(125, 0, 255, 0.4)"
        maxW="400px"
        width="100%"
      >
        <Heading
          mb={6}
          textAlign="center"
          color="#FFFFFFFF"
          textShadow="0 0 10px rgba(125, 0, 255, 0.6)"
        >
          Iniciar Sesión
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={!!errorEmail} mb={4}>
            <FormLabel color="#EDEDED">Correo Electrónico</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              bg="#EDEDED"
              color="#0F0F0F"
              _placeholder={{ color: "gray.600" }}
              border="2px solid #7D00FF"
              _focus={{
                borderColor: "#9B4DFF",
                boxShadow: "0 0 10px #7D00FF",
              }}
              required
            />
            {errorEmail && <FormErrorMessage>{errorEmail}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errorPassword} mb={6}>
            <FormLabel color="#EDEDED">Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                bg="#EDEDED"
                color="#0F0F0F"
                _placeholder={{ color: "gray.600" }}
                border="2px solid #7D00FF"
                _focus={{
                  borderColor: "#9B4DFF",
                  boxShadow: "0 0 10px #7D00FF",
                }}
                required
                pr="3.5rem"
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={handleTogglePassword}
                  bg="transparent"
                  color="#7D00FF"
                  _hover={{
                    bg: "rgba(125, 0, 255, 0.1)",
                    transform: "scale(1.1)",
                  }}
                  transition="all 0.2s ease-in-out"
                />
              </InputRightElement>
            </InputGroup>
            {errorPassword && <FormErrorMessage>{errorPassword}</FormErrorMessage>}
          </FormControl>

          <Button
            type="submit"
            width="full"
            bgGradient="linear(to-r, #7D00FF, #9B4DFF)"
            color="#EDEDED"
            _hover={{
              bgGradient: "linear(to-r, #9B4DFF, #7D00FF)",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s ease-in-out"
            mb={4}
            isLoading={isSubmitting}
            loadingText="Entrando..."
          >
            Iniciar Sesión
          </Button>

          <Text textAlign="center" color="#EDEDED">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              color="#7D00FF"
              _hover={{
                textDecoration: "underline",
                textShadow: "0 0 8px #7D00FF",
              }}
            >
              Regístrate aquí
            </Link>
          </Text>
        </form>
      </Box>
    </Box>
  );
}
