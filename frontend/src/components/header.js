// frontend/src/components/header.js
"use client";

import {
  Box,
  Flex,
  Heading,
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  useToast,
  Divider,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartIndicator from "./CartIndicator";
import { colors, commonStyles } from "../styles/colors";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Header() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState(null); // Cambiado de usuario/userData a user
  const toast = useToast();

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        console.log('🔍 Header - Buscando usuario en localStorage...');
        
        // PRIMERO: Usar el nuevo sistema (user)
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Header - Usuario cargado del nuevo sistema:', parsedUser);
          setUser(parsedUser);
          return;
        }

        // SEGUNDO: Intentar cargar desde el sistema antiguo (para compatibilidad)
        const userKey = localStorage.getItem("currentUser");
        if (userKey) {
          const storedUserData = localStorage.getItem(userKey);
          if (storedUserData) {
            const oldUser = JSON.parse(storedUserData);
            console.log('🔄 Header - Usuario cargado del sistema antiguo:', oldUser);
            
            // Migrar a nuevo sistema
            const newUser = {
              id: oldUser.id || 'temp-id',
              name: oldUser.name,
              username: oldUser.username || oldUser.name,
              email: oldUser.email || '',
              profilePic: oldUser.profilePic || '',
              role: oldUser.role || 'client'
            };
            
            localStorage.setItem("user", JSON.stringify(newUser));
            setUser(newUser);
            return;
          }
        }

        // TERCERO: Intentar cargar solo el nombre
        const storedUserName = localStorage.getItem("usuario");
        if (storedUserName) {
          console.log('📝 Header - Solo nombre disponible:', storedUserName);
          const basicUser = {
            id: 'temp-id',
            name: storedUserName,
            username: storedUserName,
            email: '',
            profilePic: '',
            role: 'client'
          };
          setUser(basicUser);
        } else {
          console.log('❌ Header - No hay usuario en sesión');
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Header - Error loading user:", error);
        setUser(null);
      }
    };

    // Cargar inicialmente
    loadCurrentUser();

    // Escuchar cambios en el localStorage
    const handleStorageChange = () => {
      console.log("🔄 Header - Storage change detected");
      loadCurrentUser();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Verificar cada 500ms para cambios más rápidos
    const interval = setInterval(loadCurrentUser, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    console.log('🚪 Header - Cerrando sesión...');
    
    // Limpiar ambos sistemas (nuevo y antiguo)
    localStorage.removeItem("currentUser");
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ← NUEVO SISTEMA
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    // Limpiar datos antiguos
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_")) localStorage.removeItem(key);
    });

    setUser(null);

    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
      status: "info",
      duration: 2500,
      isClosable: true,
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const getAvatarSrc = () => {
    if (!user) return "";
    
    // PRIMERO: Usar la foto de perfil del nuevo sistema si existe
    if (user.profilePic && user.profilePic.trim() !== "" && user.profilePic !== "/default-avatar.png") {
      console.log("📸 Header - Usando foto de perfil:", user.profilePic);
      return user.profilePic;
    }
    
    // SEGUNDO: Usar avatar generado por nombre
    if (user.name) {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7D00FF&color=fff`;
      console.log("🎨 Header - Usando avatar generado:", avatarUrl);
      return avatarUrl;
    }
    
    return "";
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.name || user.username || "Usuario";
  };

  // ✅ Funciones para cambiar entre modales
  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  return (
    <Box
      as="header"
      p={4}
      bgGradient={colors.gradients.header}
      color={colors.text.primary}
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        w="100%"
        px={{ base: 4, md: 8 }}
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={3}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Heading
            size="md"
            color={colors.text.secondary}
            _hover={{ textShadow: colors.shadows.text }}
            transition="all 0.3s ease-in-out"
          >
            3DWORLD
          </Heading>
        </Link>

        {/* Menú de navegación */}
        <Flex gap={4} flexWrap="wrap" align="center">
          <CartIndicator />

          {user ? (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Avatar
                  name={getDisplayName()}
                  src={getAvatarSrc()}
                  size="sm"
                  cursor="pointer"
                  border={`2px solid ${colors.text.secondary}`}
                  transition="all 0.2s ease-in-out"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </PopoverTrigger>

              <PopoverContent
                bg={colors.background.modal}
                border={colors.borders.primary}
                color={colors.text.primary}
                borderRadius="lg"
                boxShadow={colors.shadows.primary}
                w="220px"
                p={3}
              >
                <PopoverArrow bg={colors.text.secondary} />
                <PopoverCloseButton color={colors.text.secondary} />
                <PopoverBody textAlign="center">
                  <Avatar
                    size="lg"
                    src={getAvatarSrc()}
                    name={getDisplayName()}
                    mb={2}
                    border={`2px solid ${colors.primary.main}`}
                    mx="auto"
                  />
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    {getDisplayName()}
                  </Text>
                  {user.email && (
                    <Text fontSize="xs" color={colors.text.muted} mb={2}>
                      {user.email}
                    </Text>
                  )}

                  <Divider borderColor="#ffffff40" my={2} />

                  <Link href="/perfil" style={{ width: "100%" }}>
                    <Button
                      w="full"
                      size="sm"
                      {...commonStyles.buttonPrimary}
                      mb={2}
                    >
                      👤 Ver perfil
                    </Button>
                  </Link>

                  <Button
                    w="full"
                    size="sm"
                    {...commonStyles.buttonPrimary}
                    onClick={handleLogout}
                  >
                    🚪 Cerrar sesión
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            <Box>
              <Button
                onClick={openLogin}
                variant="surface"
                bg={colors.button.secondary.bg}
                color={colors.button.secondary.color}
                _hover={{
                  bg: colors.button.secondary.hover,
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s ease-in-out"
              >
                Iniciar Sesión
              </Button>

              {/* ✅ Ambos modales con funciones para cambiar entre ellos */}
              <LoginModal 
                isOpen={isLoginOpen} 
                onClose={() => setLoginOpen(false)} 
                goToRegister={openRegister}
              />

              <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setRegisterOpen(false)}
                goToLogin={openLogin}
              />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}