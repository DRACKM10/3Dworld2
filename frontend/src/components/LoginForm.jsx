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
import { colors } from "../styles/colors";
import { color } from "framer-motion";
 

export default function LoginForm({ onClose, goToRegister }) {
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
      minHeight="auto"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg={colors.background.modal}
        p={8} 
        borderRadius="2xl"
        boxShadow={colors.shadows.glow}
        maxW="400px"
        width="100%"
        position="relative"
        color={colors.text.dark}
      >

        <Heading textAlign="center" mb={6} fontSize="2xl" color={colors.text.primary} textshadow={colors.shadows.primary}>
          Iniciar Sesión
        </Heading>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={!!errorEmail} mb={4}>
            <FormLabel  >Correo Electrónico</FormLabel>
            <Input
            color={colors.text.dark}
              type="email"
              placeholder="correo@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg={colors.background.input}
              _placeholder={{ color: "gray.500" }}
              border={colors.borders.light}
              _focus={{
                borderColor: colors.borders.primary ,
                boxShadow: colors.shadows.glow,
              }}
            />
            {errorEmail && <FormErrorMessage>{errorEmail}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errorPassword} mb={4}>
            <FormLabel  >Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg={colors.background.input} 
                _placeholder={{ color: "gray.500" }}
                border={colors.borders.light}
                _focus={{
                  borderColor: colors.borders.primary ,
                  boxShadow: colors.shadows.glow,
                }}
              />
              <InputRightElement>
                <IconButton
                  aria-label="toggle-password"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  bg="transparent"
                  color={colors.primary.main}
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
              <ChakraLink color={colors.text.primary}fontSize="sm">
                ¿Olvidaste tu contraseña?
              </ChakraLink>
            </Link>
          </Box>

          <Button
            type="submit"
            width="full"
            bg={colors.primary.main}
            color={colors.text.secondary}
            isLoading={isSubmitting}
            loadingText="Entrando..."
            _hover={{
              bg: colors.background.card,
              transform: "scale(1.02)",
            }}
            transition="all 0.2s"
            mb={4}
          >
            Iniciar Sesión
          </Button>
        </form>

        <Divider my={6} borderColor="#333333" />

        {/* GOOGLE LOGIN */}
        <Box mb={4}>
          <Text textAlign="center" color={colors.text.muted} fontSize="sm" mb={3}>
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

        <Text textAlign="center" color={colors.text.muted} fontSize="sm">
          ¿No tienes cuenta?{" "}
          <Button
            variant="link"
            color={colors.text.primary}
            onClick={goToRegister}
            _hover={{ textDecoration: "underline" }}
            fontSize="sm"
          >
            Regístrate aquí
          </Button>
        </Text>
      </Box>
    </Box>
  );
}