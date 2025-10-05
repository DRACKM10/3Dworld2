"use client";

import NextLink from "next/link";
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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Lottie from "lottie-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [animationData, setAnimationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/animations/Space.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username) return setError("El nombre de usuario es obligatorio");
    if (!validateEmail(email))
      return setError("Por favor, ingresa un correo electrónico válido");
    if (password.length < 8)
      return setError("La contraseña debe tener al menos 8 caracteres");
    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");

    // Simula registro y redirige al login
    router.push("/login");
  };

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
          color="#ffffff"
          textShadow="0 0 10px rgba(125, 0, 255, 0.6)"
        >
          Registrarse
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={error !== ""} mb={4}>
            <FormLabel>Nombre de Usuario</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #7D00FF"
              _focus={{
                borderColor: "#9B4DFF",
                boxShadow: "0 0 10px #7D00FF",
              }}
              required
            />
          </FormControl>

          <FormControl isInvalid={error !== ""} mb={4}>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #7D00FF"
              _focus={{
                borderColor: "#9B4DFF",
                boxShadow: "0 0 10px #7D00FF",
              }}
              required
            />
          </FormControl>

          <FormControl isInvalid={error !== ""} mb={4}>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                bg="#EDEDED"
                color="#0F0F0F"
                border="2px solid #7D00FF"
                _focus={{
                  borderColor: "#9B4DFF",
                  boxShadow: "0 0 10px #7D00FF",
                }}
                required
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label="Mostrar u ocultar contraseña"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  bg="transparent"
                  color="#7D00FF"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isInvalid={error !== ""} mb={6}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                bg="#EDEDED"
                color="#0F0F0F"
                border="2px solid #7D00FF"
                _focus={{
                  borderColor: "#9B4DFF",
                  boxShadow: "0 0 10px #7D00FF",
                }}
                required
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label="Mostrar u ocultar confirmación"
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  bg="transparent"
                  color="#7D00FF"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{error}</FormErrorMessage>
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
          >
            Registrarse
          </Button>

          <Text textAlign="center">
            ¿Ya tienes cuenta?{" "}
            <Link
              as={NextLink}
              href="/log-in"
              color="#7D00FF"
              _hover={{
                textDecoration: "underline",
                textShadow: "0 0 8px #7D00FF",
              }}
            >
              Inicia sesión aquí
            </Link>
          </Text>
        </form>
      </Box>
    </Box>
  );
}