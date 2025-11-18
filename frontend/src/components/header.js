// Ejemplo: frontend/src/components/header.js
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
import { colors, commonStyles } from "../styles/colors"; // ← IMPORTAR AQUÍ
import LoginModal from "./loginModal";
import { useDisclosure } from "@chakra-ui/react";

 


export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [usuario, setUsuario] = useState(null);
  const [userData, setUserData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const userKey = localStorage.getItem("currentUser");
        if (userKey) {
          const storedUserData = localStorage.getItem(userKey);
          if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setUsuario(user.name);
            setUserData(user);
            return;
          }
        }

        const storedUserName = localStorage.getItem("usuario");
        if (storedUserName) {
          setUsuario(storedUserName);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadCurrentUser();
    const handleStorageChange = () => loadCurrentUser();
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadCurrentUser, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_")) localStorage.removeItem(key);
    });

    setUsuario(null);
    setUserData(null);

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
    if (userData?.profilePic && userData.profilePic.trim() !== "") {
      return userData.profilePic;
    }
    if (usuario) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        usuario
      )}&background=7D00FF&color=fff`;
    }
    return "";
  };

  return (
    <Box
      as="header"
      p={4}
      bgGradient={colors.gradients.header}  // ← USO DEL SISTEMA DE COLORES
      color={colors.text.primary}           // ← USO DEL SISTEMA DE COLORES
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
            color={colors.text.secondary}       // ← USO DEL SISTEMA
            _hover={{ textShadow: colors.shadows.text }} // ← USO DEL SISTEMA
            transition="all 0.3s ease-in-out"
          >
            3DWORLD
          </Heading>
        </Link>

        {/* Menú de navegación */}
        <Flex gap={4} flexWrap="wrap" align="center">
          <CartIndicator />

          {usuario ? (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Avatar
                  name={usuario}
                  src={getAvatarSrc()}
                  size="sm"
                  cursor="pointer"
                  border={`2px solid ${colors.text.secondary}`} // ← USO DEL SISTEMA
                  transition="all 0.2s ease-in-out"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </PopoverTrigger>

              <PopoverContent
                bg={colors.background.modal}      // ← USO DEL SISTEMA
                border={colors.borders.primary}   // ← USO DEL SISTEMA
                color={colors.text.primary}       // ← USO DEL SISTEMA
                borderRadius="lg"
                boxShadow={colors.shadows.primary} // ← USO DEL SISTEMA
                w="220px"
                p={3}
              >
                <PopoverArrow bg={colors.text.secondary} />
                <PopoverCloseButton color={colors.text.secondary} />
                <PopoverBody textAlign="center">
                  <Avatar
                    size="lg"
                    src={getAvatarSrc()}
                    name={usuario}
                    mb={2}
                    border={`2px solid ${colors.primary.main}`} // ← USO DEL SISTEMA
                    mx="auto"
                  />
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    {usuario}
                  </Text>
                  {userData?.email && (
                    <Text fontSize="xs" color={colors.text.muted} mb={2}>
                      {userData.email}
                    </Text>
                  )}

                  <Divider borderColor="#ffffff40" my={2} />

                  <Link href="/perfil" style={{ width: "100%" }}>
                    <Button
                      w="full"
                      size="sm"
                      {...commonStyles.buttonPrimary}  // ← USO DE ESTILOS COMUNES
                      mb={2}
                    >
                      👤 Ver perfil
                    </Button>
                  </Link>

                  <Button
                    w="full"
                    size="sm"
                    {...commonStyles.buttonPrimary}   // ← USO DE ESTILOS COMUNES
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
                onClick={onOpen}
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

              <LoginModal isOpen={isOpen} onClose={onClose} />
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}