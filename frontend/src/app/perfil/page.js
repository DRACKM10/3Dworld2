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
  useDisclosure,
  HStack,
  VStack,
  Spinner,
  useToast
} from "@chakra-ui/react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const loadUserData = () => {
      try {
        // 1. Obtener la clave del usuario actual
        const userKey = localStorage.getItem("currentUser");
        
        if (!userKey) {
          // Si no hay usuario logueado, redirigir al login
          window.location.href = '/log-in';
          return;
        }

        // 2. Cargar datos del usuario específico
        let storedUser = localStorage.getItem(userKey);
        
        if (!storedUser) {
          // Si no existe, crear usuario por defecto para este usuario
          const userEmail = userKey.replace('user_', '');
          const defaultUser = {
            id: userKey,
            name: userEmail.split('@')[0], // Usar parte del email como nombre
            username: userEmail.split('@')[0],
            email: userEmail,
            description: "¡Bienvenido a mi perfil! Estoy emocionado de ser parte de esta comunidad.",
            birthdate: "",
            joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            following: 0,
            followers: 0,
            profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail.split('@')[0])}&background=7D00FF&color=fff&size=128`,
            banner: `https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail.split('@')[0])}&background=0b2b33&color=7D00FF&size=1200&bold=true`
          };
          localStorage.setItem(userKey, JSON.stringify(defaultUser));
          storedUser = JSON.stringify(defaultUser);
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setEditUser(parsedUser);
      } catch (error) {
        console.error("Error loading user:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [toast]);

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
    try {
      const userKey = localStorage.getItem("currentUser");
      if (!userKey) {
        toast({
          title: "Error",
          description: "No se encontró el usuario actual",
          status: "error",
          duration: 3000,
        });
        return;
      }

      localStorage.setItem(userKey, JSON.stringify(editUser));
      setUser(editUser);
      onClose();
      
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        status: "error",
        duration: 3000,
      });
    }
  };

  const cancelEdit = () => {
    setEditUser(user);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = '/';
  };

  if (loading) {
    return (
      <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#ffffffff" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white">No se pudo cargar el perfil</Text>
          <Button 
            colorScheme="purple"
            onClick={() => window.location.href = '/log-in'}
          >
            Ir al Login
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg="#121212" minH="100vh" py={8}>
      {/* Container Principal */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        px={{ base: 4, md: 6 }}
        border="1px solid #5c212b"
        borderRadius="16px"
        bg="black"
        overflow="hidden"
      >
        {/* Banner */}
        <Box 
          position="relative" 
          height={{ base: "140px", md: "200px", lg: "240px" }} 
          width="100%"
          overflow="hidden" 
          paddingTop="1px"
        >
          <Image 
            src={user.banner} 
            alt="Banner" 
            width="100%"
            height="100%"
            objectFit="cover"
            onError={(e) => {
              const userKey = localStorage.getItem("currentUser");
              const userName = userKey ? userKey.replace('user_', '').split('@')[0] : 'Usuario';
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0b2b33&color=7D00FF&size=1200`;
            }}
          />
        </Box>

        {/* Profile Header */}
        <Box p={{ base: 4, md: 6 }}>
          <Flex 
            direction={{ base: "column", lg: "row" }}
            gap={6}
            align={{ base: "center", lg: "flex-start" }}
            justify="space-between"
          >
            {/* Columna Izquierda - Avatar e Información */}
            <Flex 
              direction="column" 
              align={{ base: "center", lg: "flex-start" }}
              textAlign={{ base: "center", lg: "left" }}
              flex="1"
              color="rgba(255, 255, 255, 0.8)"
            >
              <Box mt={{ base: "-60px", lg: "-80px" }} mb={4}>
                <Avatar
                  src={user.profilePic}
                  size={{ base: "xl", md: "2xl" }}
                  border="4px solid black"
                  bg="gray.800"
                />
              </Box>
              
              <VStack align={{ base: "center", lg: "flex-start" }} spacing={3}>
                <Heading size={{ base: "lg", md: "xl" }}>
                  {user.name}
                </Heading>
                
                <Text fontSize={{ base: "md", md: "lg" }} color="white">
                  @{user.username}
                </Text>
                
                {user.email && (
                  <Text fontSize="sm" color="white">
                    {user.email}
                  </Text>
                )}
                
                <Text 
                  fontSize={{ base: "sm", md: "md" }}
                  lineHeight="1.6"
                  maxW="500px"
                  textAlign={{ base: "center", lg: "left" }}
                  color="whiteAlpha.700"
                >
                  {user.description} 
                </Text>
                
                <HStack spacing={6} color="whiteAlpha.700" fontSize="sm">
                  <Text>Miembro desde {user.joinedDate}</Text>
                  <Text>•</Text>
                  <Text>{user.following} siguiendo</Text>
                  <Text>•</Text>
                  <Text>{user.followers} seguidores</Text>
                </HStack>
              </VStack>
            </Flex>

            {/* Columna Derecha - Botones */}
            <VStack spacing={3}>
              <Button 
                variant="surface" 
                color="white"
                bg="#5c212b"
                onClick={onOpen}
                size="md"
                borderRadius="full"
                width="full"
                _hover={{ bg:"#6d6c6c73", transform: "scale(1.05)" }} 
              >
                Editar perfil
              </Button>
              
            </VStack>
          </Flex>
        </Box>
      </Box>

      {/* Modal de Edición (se mantiene igual) */}
      <Modal 
        isOpen={isOpen} 
        onClose={cancelEdit} 
        size={{ base: "full", md: "2xl" }}
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="gray.800" color="white" borderRadius="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.600">
            Editar Perfil
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input 
                  name="name" 
                  value={editUser?.name || ""} 
                  onChange={handleChange}
                  borderColor="gray.600"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Usuario</FormLabel>
                <Input 
                  name="username" 
                  value={editUser?.username || ""} 
                  onChange={handleChange}
                  borderColor="gray.600"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea 
                  name="description" 
                  value={editUser?.description || ""} 
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti..."
                  rows={4}
                  borderColor="gray.600"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Input 
                  type="date" 
                  name="birthdate" 
                  value={editUser?.birthdate || ""} 
                  onChange={handleChange}
                  borderColor="gray.600"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Foto de Perfil</FormLabel>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "profilePic")}
                  border="none"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Banner</FormLabel>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "banner")}
                  border="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTop="1px solid" borderColor="gray.600">
            <Button variant="outline" onClick={cancelEdit} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme="purple" onClick={saveUser}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}