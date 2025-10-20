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
  Divider,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import { GoogleLogin } from "@react-oauth/google";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

      if (res.user?.name) {
        localStorage.setItem("usuario", res.user.name);
      }

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    
    try {
      console.log("🔑 Respuesta de Google recibida:", credentialResponse);
      
      const token = credentialResponse.credential;

      if (!token) {
        throw new Error("No se recibió token de Google");
      }

      console.log("🚀 Enviando token al backend...");
      
      // FORMATO EXACTO QUE ESPERA EL BACKEND
      const res = await fetch("http://localhost:8000/api/users/google", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: token  // ← ESTE ES EL CAMPO CORRECTO
        }),
      });

      console.log("📡 Respuesta del servidor - Status:", res.status);

      if (!res.ok) {
        let errorMessage = `Error HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.log("❌ Error del backend:", errorData);
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("✅ Datos recibidos del backend:", data);

      if (data.success) {
        // Guardar token y usuario
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log("🔐 Token JWT guardado:", data.token.substring(0, 50) + "...");
        }
        if (data.user) {
          const userName = data.user.username || data.user.name || data.user.email || "Usuario";
          localStorage.setItem("usuario", userName);
          console.log("👤 Usuario guardado:", userName);
        }

        toast({
          title: "¡Inicio de sesión exitoso!",
          description: `Bienvenido ${data.user?.username || data.user?.name || data.user?.email || ''}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        // Redirigir después de un breve delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        
      } else {
        throw new Error(data.error || "Error desconocido del servidor");
      }

    } catch (err) {
      console.error("❌ Error completo en Google login:", err);
      
      let errorMessage = err.message;
      
      // Mensajes más específicos
      if (err.message.includes("400")) {
        errorMessage = "Token de Google inválido o expirado";
      } else if (err.message.includes("Error con Google Login")) {
        errorMessage = "El backend no pudo verificar el token de Google";
      } else if (err.message.includes("Network Error")) {
        errorMessage = "No se puede conectar con el servidor. Verifica que esté ejecutándose.";
      }
      
      toast({
        title: "Error al iniciar sesión con Google",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast({
      title: "Error de autenticación de Google",
      description: "No se pudo completar el inicio de sesión con Google",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  };

  // Función para testing
  const handleTestLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const testUser = {
        username: "Usuario Demo",
        email: "demo@example.com"
      };
      
      localStorage.setItem("usuario", testUser.username);
      localStorage.setItem("userEmail", testUser.email);
      localStorage.setItem("token", "demo-token-" + Date.now());

      toast({
        title: "Modo demo activado",
        description: `Bienvenido ${testUser.username}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      
    } catch (err) {
      toast({
        title: "Error en login demo",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="100vh"
        bg="#0F0F0F"
      >
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
        backdropFilter="blur(10px)"
      >
        <Heading
          mb={6}
          textAlign="center"
          color="#FFFFFFFF"
          textShadow="0 0 10px rgba(125, 0, 255, 0.6)"
          fontSize="2xl"
        >
          Iniciar Sesión
        </Heading>

        <form onSubmit={handleSubmit}>
          <FormControl isInvalid={!!errorEmail} mb={4}>
            <FormLabel color="#EDEDED" fontSize="sm" fontWeight="medium">
              Correo Electrónico
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              bg="#1A1A1A"
              color="#EDEDED"
              _placeholder={{ color: "gray.500" }}
              border="2px solid #333333"
              _focus={{
                borderColor: "#7D00FF",
                boxShadow: "0 0 10px rgba(125, 0, 255, 0.4)",
              }}
              required
            />
            {errorEmail && <FormErrorMessage>{errorEmail}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errorPassword} mb={6}>
            <FormLabel color="#EDEDED" fontSize="sm" fontWeight="medium">
              Contraseña
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                bg="#1A1A1A"
                color="#EDEDED"
                _placeholder={{ color: "gray.500" }}
                border="2px solid #333333"
                _focus={{
                  borderColor: "#7D00FF",
                  boxShadow: "0 0 10px rgba(125, 0, 255, 0.4)",
                }}
                required
                pr="3.5rem"
              />
              <InputRightElement width="3rem">
                <IconButton
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  size="sm"
                  onClick={handleTogglePassword}
                  bg="transparent"
                  color="#7D00FF"
                  _hover={{
                    bg: "rgba(125, 0, 255, 0.1)",
                  }}
                />
              </InputRightElement>
            </InputGroup>
            {errorPassword && (
              <FormErrorMessage>{errorPassword}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            type="submit"
            width="full"
            bgGradient="linear(to-r, #7D00FF, #9B4DFF)"
            color="#EDEDED"
            _hover={{
              bgGradient: "linear(to-r, #9B4DFF, #7D00FF)",
              transform: "scale(1.02)",
            }}
            transition="all 0.2s"
            mb={4}
            isLoading={isSubmitting}
            loadingText="Entrando..."
          >
            Iniciar Sesión
          </Button>

          <Text textAlign="center" color="#A0A0A0" mb={6} fontSize="sm">
            <Link
              href="/reset-password"
              color="#9B4DFF"
              _hover={{ textDecoration: "underline" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Text>
        </form>

        <Divider my={6} borderColor="#333333" />

        {/* Google Login Button */}
        <Box mb={4}>
          <Text textAlign="center" color="#A0A0A0" fontSize="sm" mb={3}>
            O continúa con
          </Text>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            width="100%"
            text="continue_with"
            locale="es"
          />
          {isGoogleLoading && (
            <Box textAlign="center" mt={2}>
              <Spinner size="sm" color="#7D00FF" />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Verificando con Google...
              </Text>
            </Box>
          )}
        </Box>

        {/* Botón de demo */}
        <Button
          width="full"
          variant="outline"
          borderColor="#00FF88"
          color="#00FF88"
          _hover={{
            bg: "rgba(0, 255, 136, 0.1)",
          }}
          onClick={handleTestLogin}
          mb={4}
          size="sm"
        >
          🚀 Entrar en Modo Demo
        </Button>

        <Text textAlign="center" color="#A0A0A0" fontSize="sm">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            color="#7D00FF"
            _hover={{ textDecoration: "underline" }}
          >
            Regístrate aquí
          </Link>
        </Text>
      </Box>
    </Box>
  );
}