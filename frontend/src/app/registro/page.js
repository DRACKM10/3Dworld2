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
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/authContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!username) {
      setError("El nombre de usuario es obligatorio");
      return;
    }
    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const result = await register({
      username: username.trim(),
      email: email.trim(),
      password: password,
    });

    if (result.success) {
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirigir al home después del registro
      router.push("/");
    } else {
      setError(result.error);
      toast({
        title: "Error en registro",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
        boxShadow="0 0 20px #5c212b"
        maxW="400px"
        width="100%"
      >
        <Heading
          mb={6}
          textAlign="center"
          color="#ffffff"
          textShadow="0 0 10px #5c212b"
        >
          Registrarse
        </Heading>

        <form onSubmit={handleSubmit}>
          {/* Nombre de usuario */}
          <FormControl isInvalid={error !== ""} mb={4}>
            <FormLabel>Nombre de Usuario</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #5c212b"
              _focus={{
                borderColor: "#5c212b",
                boxShadow: "0 0 10px #5c212b",
              }}
              required
              disabled={loading}
            />
          </FormControl>

          {/* Correo electrónico */}
          <FormControl isInvalid={error !== ""} mb={4}>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #5c212b"
              _focus={{
                borderColor: "#5c212b",
                boxShadow: "0 0 10px #5c212b",
              }}
              required
              disabled={loading}
            />
          </FormControl>

          {/* Contraseña */}
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
                border="2px solid #5c212b"
                _focus={{
                  borderColor: "#5c212b",
                  boxShadow: "0 0 10px #5c212b",
                }}
                required
                disabled={loading}
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label="Mostrar u ocultar contraseña"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  bg="transparent"
                  color="#5c212b"
                  disabled={loading}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Confirmar contraseña */}
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
                border="2px solid #5c212b"
                _focus={{
                  borderColor: "#5c212b",
                  boxShadow: "0 0 10px #5c212b",
                }}
                required
                disabled={loading}
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
                  color="#5c212b"
                  disabled={loading}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          {/* Botón Registrarse */}
          <Button
            type="submit"
            width="full"
            bg="#5c212b"
            color="#EDEDED"
            _hover={{
            bg:"#6d6c6c73", transform: "scale(1.05)" 
            }}
            transition="all 0.2s ease-in-out"
            mb={4}
            isLoading={loading}
            loadingText="Registrando..."
          >
            Registrarse
          </Button>

          {/* Enlace de inicio de sesión */}
          <Text textAlign="center">
            ¿Ya tienes cuenta?{" "}
            <Link
              as={NextLink}
              href="/log-in"
              color="#ad3e50ff"
              _hover={{
                textDecoration: "underline",
                textShadow: "0 0 8px #5c212b",
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
