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

export default function LoginPage() {
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

  // Login normal con email y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    if (!email) {
      setErrorEmail("El correo es obligatorio");
      return;
    }
    if (!password) {
      setErrorPassword("La contraseña es obligatoria");
      return;
    }

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

      // Guardar datos del usuario
      if (data.user) {
        const userName = data.user.username || data.user.name || data.user.email || "Usuario";
        localStorage.setItem("usuario", userName);
        
        if (data.user.id) {
          localStorage.setItem("userId", data.user.id);
        }
      }

      // Guardar token si existe
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast({
        title: "✅ Inicio de sesión exitoso",
        description: `Bienvenido ${data.user?.username || ""}`,
        status: "success",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (error) {
      console.error("❌ Error en login:", error);
      toast({
        title: "❌ Error al iniciar sesión",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login con Google
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    
    try {
      console.log("🔑 Token de Google recibido");
      
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("No se recibió token de Google");
      }

      const response = await fetch("http://localhost:8000/api/users/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error con Google Login");
      }

      const data = await response.json();
      console.log("✅ Login con Google exitoso:", data);

      if (data.success && data.user) {
        const userName = data.user.username || data.user.name || data.user.email || "Usuario";
        localStorage.setItem("usuario", userName);
        
        if (data.user.id) {
          localStorage.setItem("userId", data.user.id);
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        toast({
          title: "✅ Inicio de sesión exitoso",
          description: `Bienvenido ${userName}`,
          status: "success",
          duration: 2000,
        });

        setTimeout(() => {
          router.push("/");
        }, 1000);
      }

    } catch (error) {
      console.error("❌ Error con Google login:", error);
      toast({
        title: "❌ Error al iniciar sesión con Google",
        description: error.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "❌ Error de autenticación de Google",
      description: "No se pudo completar el inicio de sesión",
      status: "error",
      duration: 4000,
    });
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="black"
      color="white"
    >
      <Box
        bg="rgba(20, 20, 20, 0.85)"
        p={8}
        borderRadius="2xl"
        boxShadow="0 0 20px #5c212b"
        maxW="400px"
        width="100%"
        backdropFilter="blur(10px)"
      >
        <Heading
          mb={6}
          textAlign="center"
          color="white"
          textShadow="0 0 10px #5c212b"
          fontSize="2xl"
        >
          Iniciar Sesión
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={!!errorEmail} mb={4}>
            <FormLabel color="white" fontSize="sm" fontWeight="medium">
              Correo Electrónico
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              bg="#1A1A1A"
              color="white"
              _placeholder={{ color: "gray.500" }}
              border="2px solid #333333"
              _focus={{
                borderColor: "#5c212b",
                boxShadow: "0 0 10px #5c212b",
              }}
            />
            {errorEmail && <FormErrorMessage>{errorEmail}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errorPassword} mb={4}>
            <FormLabel color="white" fontSize="sm" fontWeight="medium">
              Contraseña
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                bg="#1A1A1A"
                color="white"
                _placeholder={{ color: "gray.500" }}
                border="2px solid #333333"
                _focus={{
                  borderColor: "#5c212b",
                  boxShadow: "0 0 10px #5c212b",
                }}
                pr="3.5rem"
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={handleTogglePassword}
                  bg="transparent"
                  color="#5c212b"
                  _hover={{ bg: "rgba(65, 37, 37, 0.66)" }}
                />
              </InputRightElement>
            </InputGroup>
            {errorPassword && <FormErrorMessage>{errorPassword}</FormErrorMessage>}
          </FormControl>

          <Box textAlign="right" mb={4}>
            <Link href="/forgot-password" passHref>
              <ChakraLink color="purple.400" fontSize="sm" _hover={{ textDecoration: "underline" }}>
                ¿Olvidaste tu contraseña?
              </ChakraLink>
            </Link>
          </Box>

          <Button
            type="submit"
            width="full"
            bg="#5c212b"
            color="white"
            _hover={{
              bg: "#333333",
              transform: "scale(1.02)",
            }}
            transition="all 0.2s"
            mb={4}
            isLoading={isSubmitting}
            loadingText="Entrando..."
          >
            Iniciar Sesión
          </Button>
        </form>

        <Divider my={6} borderColor="#333333" />

        {/* Google Login */}
        <Box mb={4}>
          <Text textAlign="center" color="gray.400" fontSize="sm" mb={3}>
            O continúa con
          </Text>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            width="100%"
            text="continue_with"
            locale="es"
          />
          {isGoogleLoading && (
            <Box textAlign="center" mt={2}>
              <Spinner size="sm" color="#5c212b" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Verificando con Google...
              </Text>
            </Box>
          )}
        </Box>

        <Text textAlign="center" color="gray.400" fontSize="sm">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" passHref>
            <ChakraLink color="#5c212b" _hover={{ textDecoration: "underline" }}>
              Regístrate aquí
            </ChakraLink>
          </Link>
        </Text>
      </Box>
    </Box>
  );
}