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
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/authContext";

export default function RegisterForm({ onClose, goToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username) return setError("El nombre de usuario es obligatorio");
    if (!validateEmail(email)) return setError("Correo inválido");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");

    const result = await register({
      username,
      email,
      password,
    });

    if (result.success) {
      onClose(); // 🔥 Cierra el modal automáticamente
    } else {
      setError(result.error);
    }
  };

  if (result.success) {
   onClose();
    goToLogin(); // abrir modal login
  }


  return (
    <Box
      position="relative"
      bg="rgba(20,20,20,0.85)"
      p={8}
      borderRadius="2xl"
      boxShadow="0 0 20px #5c212b"
      maxW="400px"
      width="100%"
      color="#EDEDED"
    >
      {/* ❌ Botón para cerrar */}
      {onClose && (
        <Button
          onClick={onClose}
          position="absolute"
          top="12px"
          right="12px"
          bg="transparent"
          fontSize="22px"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
        >
          ✕
        </Button>
      )}

      <Heading mb={6} textAlign="center" color="#fff" textShadow="0 0 10px #5c212b">
        Registrarse
      </Heading>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* Usuario */}
        <FormControl isInvalid={error !== ""} mb={4}>
          <FormLabel>Nombre de Usuario</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            bg="#EDEDED"
            color="#0F0F0F"
            border="2px solid #5c212b"
          />
        </FormControl>

        {/* Email */}
        <FormControl isInvalid={error !== ""} mb={4}>
          <FormLabel>Correo Electrónico</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg="#EDEDED"
            color="#0F0F0F"
            border="2px solid #5c212b"
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
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #5c212b"
            />
            <InputRightElement>
              <IconButton
                size="sm"
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        {/* Confirmación */}
        <FormControl isInvalid={error !== ""} mb={6}>
          <FormLabel>Confirmar Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              bg="#EDEDED"
              color="#0F0F0F"
              border="2px solid #5c212b"
            />
            <InputRightElement>
              <IconButton
                size="sm"
                icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </InputRightElement>
          </InputGroup>

          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          width="full"
          bg="#5c212b"
          color="#EDEDED"
          _hover={{ bg: "#6d6c6c73", transform: "scale(1.05)" }}
        >
          Registrarse
        </Button>
      </form>
    </Box>
  );
}
