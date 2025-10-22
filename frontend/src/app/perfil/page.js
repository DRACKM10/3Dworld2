"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Image,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // 🔹 Crear usuario de prueba si no existe
    let storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      const defaultUser = {
        name: "Pancito",
        username: "pancito3d360",
        description: "Diseñador 3D apasionado por la impresión 3D y el modelado digital. ¡Creando el futuro una capa a la vez!",
        birthdate: "1990-05-15",
        joinedDate: "October 2025",
        following: 3,
        followers: 1,
        profilePic: `https://ui-avatars.com/api/?name=Pancito&background=7D00FF&color=fff&size=128`,
        banner: `https://ui-avatars.com/api/?name=Pancito3D&background=0b2b33&color=7D00FF&size=1200&bold=true`
      };
      localStorage.setItem("user", JSON.stringify(defaultUser));
      storedUser = JSON.stringify(defaultUser);
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditUser(parsedUser);
  }, []);

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditUser({ ...editUser, [field]: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUser = () => {
    localStorage.setItem("user", JSON.stringify(editUser));
    setUser(editUser);
    onClose();
  };

  if (!user) return <Text color="white">Cargando...</Text>;

  return (
    <Box 
      bg="#121212" 
      color="white" 
      minH="100vh" 
      w="100vw"
      maxW="none"
    >
      {/* 🔹 TODO EN UN SOLO CONTAINER CENTRADO */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        w="100%" 
        px={{ base: 4, md: 6 }}
        pt={4}
        border="1px solid #9B4DFF"
        borderRadius="16px"
        bg="black"
        p="6"
        marginTop="30px"
        marginBottom="30px"

      >
        {/* Banner */}
        <Box 
          position="relative" 
          height={{ base: "200px", md: "260px" }} 
          overflow="hidden" 
          borderRadius="lg"
          w="100%"
          mb={{ base: 4, md: 6 }}
        >
          <Image 
            src={user.banner} 
            alt="Banner" 
            fill 
            style={{ objectFit: "cover" }}
            onError={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=Pancito3D&background=0b2b33&color=7D00FF&size=1200';
            }}
          />
        </Box>

        {/* Profile Header - NUEVA ESTRUCTURA */}
        <Flex 
          direction={{ base: "column", lg: "row" }}  // Móvil: columna, Desktop grande: fila
          gap={{ base: 4, lg: 8 }}
          align={{ base: "center", lg: "flex-start" }}
          mb={8}
        >
          {/* 🔹 COLUMNA IZQUIERDA: Foto de perfil + Texto */}
          <Flex 
            direction="column" 
            align={{ base: "center", lg: "flex-start"}}
            ml={{ base: 0, lg: 0}}
            flex="1"
            textAlign={{ base: "center", lg: "left" }}
          >
            {/* Foto de perfil */}
            <Avatar
              src={user.profilePic}
              size={{ base: "lg", md: "xl" }}
              border="3px solid white"
              bg="gray.800"
              mb={4}
            />
            
            {/* 🔹 TEXTO A LA IZQUIERDA DEBAJO DE LA FOTO */}
            <Box>
              <Heading 
                size={{ base: "md", md: "lg" }} 
                mb={1}
              >
                {user.name}
              </Heading>
              <Text 
                fontSize={{ base: "sm", md: "md" }} 
                color="gray.400" 
                mb={2}
              >
                @{user.username}
              </Text>
              <Text 
                mb={3} 
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="1.6"
                maxW="500px"
              >
                {user.description}
              </Text>
              <Text 
                color="gray.400" 
                mb={3}
                fontSize={{ base: "sm", md: "md" }}
              >
                Miembro desde {user.joinedDate}
              </Text>
            </Box>
          </Flex>

          {/* 🔹 COLUMNA DERECHA: Botón + Siguiendo/Seguidores */}
          <Flex 
            direction="column" 
            align="center" 
            lg={{ align: "flex-end" }}
            flex="0"
            gap={4}
          >
            {/* Botón Editar Perfil - DERECHA */}
            <Button 
              variant="outline" 
              colorScheme="purple" 
              onClick={onOpen}
              size={{ base: "sm", md: "md" }}
              borderRadius="full"
              w={{ base: "full", lg: "auto" }}
            >
              Editar perfil
            </Button>
            
            {/* Siguiendo/Seguidores - DERECHA */}
    
          </Flex>
        </Flex>
      </Box>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "2xl" }}>
        <ModalOverlay />
        <ModalContent 
          bg="gray.800" 
          color="white"
          maxH="100vh"
          overflowY="auto"
        >
          <ModalHeader>Editar Perfil</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Nombre</FormLabel>
              <Input name="name" value={editUser?.name || ""} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Usuario</FormLabel>
              <Input name="username" value={editUser?.username || ""} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Descripción</FormLabel>
              <Textarea 
                name="description" 
                value={editUser?.description || ""} 
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Fecha de Nacimiento</FormLabel>
              <Input type="date" name="birthdate" value={editUser?.birthdate || ""} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Foto de Perfil</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profilePic")} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Banner</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "banner")} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={saveUser} mr={3}>
              Guardar
            </Button>
            <Button colorScheme="purple" onClick={saveUser} mr={3}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}