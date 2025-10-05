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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username) {
      setError("El nombre de usuario es obligatorio");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Simulación de registro exitoso
    router.push("/login");
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLoginRedirect = () => {
    router.push("/login"); // Redirige a la página de login
  };

  return (
    <>
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
            color="#ffffffff"
            textShadow="0 0 10px rgba(125, 0, 255, 0.6)"
          >
            Registrarse
          </Heading>

          <form onSubmit={handleSubmit}>
            <FormControl isInvalid={error !== ""} mb={4}>
              <FormLabel color="#EDEDED">Nombre de Usuario</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
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
            </FormControl>

            <FormControl isInvalid={error !== ""} mb={4}>
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
            </FormControl>

            <FormControl isInvalid={error !== ""} mb={4}>
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
            </FormControl>

            <FormControl isInvalid={error !== ""} mb={6}>
              <FormLabel color="#EDEDED">Confirmar Contraseña</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
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
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                    onClick={handleToggleConfirmPassword}
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

            <Text textAlign="center" color="#EDEDED">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                color="#7D00FF"
                _hover={{
                  textDecoration: "underline",
                  textShadow: "0 0 8px #7D00FF",
                }}
                onClick={handleLoginRedirect} // Manejador opcional
              >
                Inicia sesión aquí
              </Link>
            </Text>
          </form>
        </Box>
      </Box>
    </>
  );
}