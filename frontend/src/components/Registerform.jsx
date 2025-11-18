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
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import { colors } from "../styles/colors";
import { color } from "framer-motion";

export default function RegisterForm({ onClose, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username) {
      setError("El nombre de usuario es obligatorio");
      return;
    }
    if (!validateEmail(email)) {
      setError("Correo inválido");
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
        title: "✅ Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
        status: "success",
        duration: 2000,
      });

      // Cerrar modal y redirigir
      onClose();
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setError(result.error);
      toast({
        title: "❌ Error en registro",
        description: result.error,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box
      position="relative"
      bg={colors.background.modal}
      p={8}
      borderRadius="2xl"
      boxShadow={colors.shadows.primary}
      maxW="400px"
      width="100%"
      color={colors.text.dark}
    >  

      <Heading mb={6} textAlign="center" color={colors.text.primary} textShadow={colors.shadows.primary}>
        Registrarse
      </Heading>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* Usuario */}
        <FormControl isInvalid={!!error} mb={4}>
          <FormLabel>Nombre de Usuario</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu nombre de usuario"
            bg={colors.background.input}
            color={colors.text.dark}
            border={colors.borders.primary}
            _focus={{
              boxShadow: colors.shadows.glow,
            }}
            disabled={loading}
          />
        </FormControl>

        {/* Email */}
        <FormControl isInvalid={!!error} mb={4}>
          <FormLabel>Correo Electrónico</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            bg={colors.background.input}
            color={colors.text.dark}
            border={colors.borders.primary}
            _focus={{ 
              boxShadow: colors.shadows.glow,
            }}
            disabled={loading}
          />
        </FormControl>

        {/* Contraseña */}
        <FormControl isInvalid={!!error} mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              bg={colors.background.input}
              color={colors.text.dark}
              border={colors.borders.primary}
              _focus={{ 
                boxShadow: colors.shadows.glow,
              }}
              disabled={loading}
            />
            <InputRightElement>
              <IconButton
                size="sm"
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                bg="transparent"
                color={colors.primary.main}
                disabled={loading}
                aria-label="Mostrar contraseña"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        {/* Confirmación */}
        <FormControl isInvalid={!!error} mb={6}>
          <FormLabel>Confirmar Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              bg={colors.background.input}
              color={colors.text.dark}
              border={colors.borders.primary}
              _focus={{ 
                boxShadow: colors.shadows.glow,
              }}
              disabled={loading}
            />
            <InputRightElement>
              <IconButton
                size="sm"
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                bg="transparent"
                color={colors.primary.main}
                disabled={loading}
                aria-label="Mostrar confirmación"
              />
            </InputRightElement>
          </InputGroup>
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>

        <Button 
          type="submit"
          width="full"
          bg={colors.primary.main}
          color={colors.text.secondary} 
          _hover={{ bg: colors.background.card ,transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
          mb={4}
          isLoading={loading}
          loadingText="Registrando..."
        >
          Registrarse
        </Button>

        <Text textAlign="center" fontSize="sm" color={colors.text.muted}>
          ¿Ya tienes cuenta?{" "}
          <Button
            variant="link"
            color={colors.text.primary}
            onClick={goToLogin}
            _hover={{ textDecoration: "underline" }}
            fontSize="sm"
          >
            Inicia sesión aquí
          </Button>
        </Text>
      </form>
    </Box>
  );
}