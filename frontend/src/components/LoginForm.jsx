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
  Link as ChakraLink,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Spinner,
  Divider,

} from "@chakra-ui/react";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { colors, commonStyles } from "../styles/colors"; 
 

 
export default function LoginForm({ onClose,  goToRegister }) {
  const router = useRouter();
  const toast = useToast();
   
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleTogglePassword = () => setShowPassword(!showPassword);

  // ---------------- LOGIN NORMAL ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    if (!email) return setErrorEmail("El correo es obligatorio");
    if (!password) return setErrorPassword("La contraseña es obligatoria");

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      if (data.user) {
        const userName =
          data.user.username ||
          data.user.name ||
          data.user.email ||
          "Usuario";

        localStorage.setItem("usuario", userName);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userRole", data.user.role || "client");

        if (data.user.email) {
          localStorage.setItem("userEmail", data.user.email);
        }
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido`,
        status: "success",
        duration: 2000,
      });

      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- LOGIN GOOGLE ----------------
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);

    try {
      const token = credentialResponse.credential;

      const response = await fetch("http://localhost:8000/api/users/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error con Google");

      if (data.user) {
        const userName =
          data.user.username ||
          data.user.name ||
          data.user.email ||
          "Usuario";

        localStorage.setItem("usuario", userName);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userRole", data.user.role || "client");

        if (data.user.email) {
          localStorage.setItem("userEmail", data.user.email);
        }
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast({
        title: "Inicio de sesión exitoso",
        status: "success",
        duration: 1500,
      });

      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      toast({
        title: "Error en Google Login",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={colors.text.dark}
    >
      <Box
        bg={colors.background.main  }
        p={8}
        borderRadius="2xl"
        boxShadow="0 0 20px #5c212b"
        maxW="400px"
        width="100%"
        backdropFilter="blur(10px)"
      >
        <Heading textAlign="center" mb={6} fontSize="2xl">
          Iniciar Sesión
        </Heading>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={!!errorEmail} mb={4}>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input
              type="email"
              placeholder="correo@mail.com"
              value={email}
              bg={colors.background.main}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errorEmail && <FormErrorMessage>{errorEmail}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errorPassword} mb={4}>
            <FormLabel>Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                bg={colors.background.main}
                onChange={(e) => setPassword(e.target.value)}
              />

              <InputRightElement>
                <IconButton
                  aria-label="toggle-password"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  bg="transparent"
                  color="#5c212b"
                  onClick={handleTogglePassword}
                />
              </InputRightElement>
            </InputGroup>
            {errorPassword && (
              <FormErrorMessage>{errorPassword}</FormErrorMessage>
            )}
          </FormControl>

          <Box textAlign="right" mb={4}>
            <Link href="/forgot-password" passHref>
              <ChakraLink color="#5c212b">¿Olvidaste tu contraseña?</ChakraLink>
            </Link>
          </Box>

          <Button
            type="submit"
            width="full"
            bg="#5c212b"
            color="white"
            isLoading={isSubmitting}
            loadingText="Entrando..."
          >
            Iniciar Sesión
          </Button>
        </form>

        <Divider my={6} />

        {/* GOOGLE LOGIN */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast({ title: "Error con Google", status: "error" })}
          theme="filled_black"
          width="100%"
        />

        {isGoogleLoading && (
          <Box textAlign="center" mt={3}>
            <Spinner size="sm" color="#5c212b" />
            <Text fontSize="xs">Verificando con Google...</Text>
          </Box>
        )}
        
        <Text mt={4} textAlign="center" fontSize="sm" color="gray.400">
          ¿No tienes cuenta?{" "}
        
         <Button variant="link" onClick={goToRegister}>
            Registrarse
         </Button>
        </Text>
       
      </Box>
    </Box>
  );
}
