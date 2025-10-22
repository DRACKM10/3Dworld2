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

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
      status: "info",
      duration: 2500,
      isClosable: true,
    });
  };

  return (
    <Box
      as="header"
      p={4}
      bgGradient="linear(to-r, #0b2b33, #0f0f0f)"
      color="#EDEDED"
      boxShadow="md"
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

          <Link href="/carrito" style={{ textDecoration: "none" }}>
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
              Carrito
            </Button>
          </Link>

          {/* 🔹 Si hay usuario, mostrar avatar con menú */}
          {usuario ? (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Avatar
                  name={usuario}
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    usuario
                  )}&background=7D00FF&color=fff`}
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
                <PopoverBody display="flex" flexDirection="column" gap={2} p={3}>
                  <Link href="/perfil">
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
