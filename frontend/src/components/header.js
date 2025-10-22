"use client";

import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartIndicator from "./CartIndicator";

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const [userData, setUserData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        // 1. Primero intentar cargar con el nuevo sistema (currentUser)
        const userKey = localStorage.getItem("currentUser");
        if (userKey) {
          const storedUserData = localStorage.getItem(userKey);
          if (storedUserData) {
            const user = JSON.parse(storedUserData);
            setUsuario(user.name);
            setUserData(user);
            console.log("👤 Usuario cargado (nuevo sistema):", user.name);
            return;
          }
        }
        
        // 2. Fallback al sistema antiguo (solo nombre)
        const storedUserName = localStorage.getItem("usuario");
        if (storedUserName) {
          setUsuario(storedUserName);
          console.log("👤 Usuario cargado (sistema antiguo):", storedUserName);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadCurrentUser();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadCurrentUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling para detectar cambios (útil cuando se cambia de pestaña)
    const interval = setInterval(loadCurrentUser, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    // Limpiar ambos sistemas
    localStorage.removeItem("currentUser");
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    
    // Limpiar todos los datos de usuario del localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_')) {
        localStorage.removeItem(key);
      }
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

    // Recargar la página para limpiar estados
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const getAvatarSrc = () => {
    if (userData?.profilePic) {
      return userData.profilePic;
    }
    if (usuario) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario)}&background=7D00FF&color=fff`;
    }
    return "";
  };

  return (
    <Box
      as="header"
      p={4}
      bgGradient="linear(to-r, #0b2b33, #0f0f0f)"
      color="#EDEDED"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={3}
      >
        {/* 🔹 Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Heading
            size="md"
            color="#7D00FF"
            _hover={{ textShadow: "0 0 10px #7D00FF" }}
            transition="all 0.3s ease-in-out"
          >
            3Dworld
          </Heading>
        </Link>

        {/* 🔹 Buscador */}
        <Input
          placeholder="Buscar productos"
          maxW="400px"
          bg="white"
          color="black"
          borderRadius="lg"
          border="2px solid #ffffff"
          _focus={{
            borderColor: "#790ceeff",
            boxShadow: "0 0 0 1px #7D00FF",
          }}
          _placeholder={{ color: "gray.500" }}
        />

        {/* 🔹 Menú de navegación */}
        <Flex gap={4} flexWrap="wrap" align="center">
          <Link href="/productos" style={{ textDecoration: "none" }}>
            <Button
              variant="outline"
              color="#EDEDED"
              borderColor="#7D00FF"
              _hover={{
                bgGradient: "linear(to-r, #7D00FF, #9B4DFF)",
                transform: "scale(1.05)",
              }}
              transition="all 0.2s ease-in-out"
            >
              Productos
            </Button>
          </Link>

          {/* 🔹 CartIndicator */}
          <CartIndicator />

          {/* 🔹 Si hay usuario, mostrar avatar con menú */}
          {usuario ? (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Avatar
                  name={usuario}
                  src={getAvatarSrc()}
                  size="sm"
                  cursor="pointer"
                  border="2px solid #9B4DFF"
                  transition="all 0.2s ease-in-out"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </PopoverTrigger>

              <PopoverContent
                bg="#1E1E1E"
                border="1px solid #7D00FF"
                color="#EDEDED"
                borderRadius="lg"
                boxShadow="0 0 15px rgba(125, 0, 255, 0.4)"
                w="180px"
              >
                <PopoverArrow bg="#7D00FF" />
                <PopoverCloseButton />
                <PopoverBody display="flex" flexDirection="column" gap={2} p={3}>
                  {/* Información del usuario - SIN USAR COMPONENTE TEXT */}
                  <Box mb={2} textAlign="center">
                    <Box 
                      as="span" 
                      fontSize="sm" 
                      fontWeight="bold" 
                      display="block"
                      noOfLines={1}
                    >
                      {usuario}
                    </Box>
                    {userData?.email && (
                      <Box 
                        as="span" 
                        fontSize="xs" 
                        color="gray.400" 
                        display="block"
                        noOfLines={1}
                      >
                        {userData.email}
                      </Box>
                    )}
                  </Box>
                  
                  <Link href="/perfil" style={{ width: '100%' }}>
                    <Button
                      w="full"
                      size="sm"
                      variant="outline"
                      color="#EDEDED"
                      borderColor="#7D00FF"
                      _hover={{
                        bgGradient: "linear(to-r, #7D00FF, #9B4DFF)",
                      }}
                    >
                      Ver perfil
                    </Button>
                  </Link>
                  
                  <Button
                    w="full"
                    size="sm"
                    colorScheme="purple"
                    variant="solid"
                    bgGradient="linear(to-r, #7D00FF, #9B4DFF)"
                    _hover={{
                      bgGradient: "linear(to-r, #9B4DFF, #7D00FF)",
                    }}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            <Link href="/log-in" style={{ textDecoration: "none" }}>
              <Button
                variant="outline"
                color="#EDEDED"
                borderColor="#7D00FF"
                _hover={{
                  bgGradient: "linear(to-r, #7D00FF, #9B4DFF)",
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s ease-in-out"
              >
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}