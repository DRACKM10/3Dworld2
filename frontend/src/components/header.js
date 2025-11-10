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
  Divider,
  Text,
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
      bgGradient="linear(to-r, #5c212bff, #5c212b)"
      color="#EDEDED"
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
        {/* 🔹 Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Heading
            size="md"
            color="#ffffffff"
            _hover={{ textShadow: "0 0 10px #000000ff" }}
            transition="all 0.3s ease-in-out"
          >
            3DWORLD
          </Heading>
        </Link>

        {/* 🔹 Buscador */}
        <Input
          placeholder="Buscar productos"
          flex="1"
          maxW={{ base: "100%", md: "600px" }}
          bg="white"
          color="black"
          borderRadius="lg"
          border="2px solid #ffffff"
          _focus={{
            borderColor: "#000000ff",
            boxShadow: "0 0 0 1px #000000ff",
          }}
          _placeholder={{ color: "gray.500" }}
        />

        {/* 🔹 Menú de navegación */}
        <Flex gap={4} flexWrap="wrap" align="center">

          {/* 🔹 Carrito */}
          <CartIndicator />

          {/* 🔹 Usuario logueado o no */}
          {usuario ? (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Avatar
                  name={usuario}
                  src={getAvatarSrc()}
                  size="sm"
                  cursor="pointer"
                  border="2px solid #ffffff"
                  transition="all 0.2s ease-in-out"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </PopoverTrigger>

              <PopoverContent
                bg="#130000ff"
                border="1px solid #ffffffff"
                color="#EDEDED"
                borderRadius="lg"
                boxShadow="0 0 20px rgba(255, 255, 255, 0.3)"
                w="220px"
                p={3}
              >
                <PopoverArrow bg="#ffffffff" />
                <PopoverCloseButton color="#fff" />
                <PopoverBody textAlign="center">
                  {/* Avatar dentro del popover */}
                  <Avatar
                    size="lg"
                    src={getAvatarSrc()}
                    name={usuario}
                    mb={2}
                    border="2px solid #5c212b"
                    mx="auto"
                  />
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    {usuario}
                  </Text>
                  {userData?.email && (
                    <Text fontSize="xs" color="gray.400" mb={2}>
                      {userData.email}
                    </Text>
                  )}

                  <Divider borderColor="#ffffff40" my={2} />

                  <Link href="/perfil" style={{ width: "100%" }}>
                    <Button
                      w="full"
                      size="sm"
                      bg="#5c212b"
                      color="#EDEDED"
                      borderColor="#5c212b"
                      _hover={{
                        bg: "#18181873",
                        transform: "scale(1.05)",
                      }}
                      transition="all 0.2s ease-in-out"
                      mb={2}
                    >
                      👤 Ver perfil
                    </Button>
                  </Link>

                  <Button
                    w="full"
                    size="sm"
                    bg="#5c212b"
                    color="#EDEDED"
                    borderColor="#5c212b"
                    _hover={{
                      bg: "#18181873",
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.2s ease-in-out"
                    onClick={handleLogout}
                  >
                    🚪 Cerrar sesión
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          ) : (
            <Link href="/log-in" style={{ textDecoration: "none" }}>
              <Button
                variant="surface"
                color="#EDEDED"
                bg="blackAlpha.700"
                borderColor="#000000ff"
                _hover={{
                  bg: "#18181873",
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
