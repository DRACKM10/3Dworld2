"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          console.log('❌ No hay sesión, redirigiendo...');
          router.push('/log-in');
          return;
        }

        console.log('📋 Cargando perfil para userId:', userId);

        // Obtener perfil desde el backend
        const response = await fetch(`http://localhost:8000/api/profiles/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar perfil');
        }

        const data = await response.json();
        console.log('✅ Perfil cargado:', data.profile);

        const profile = {
          id: data.profile.user_id,
          name: data.profile.name,
          username: data.profile.username,
          email: localStorage.getItem("usuario") || "",
          description: data.profile.description,
          birthdate: data.profile.birthdate || "",
          joinedDate: new Date(data.profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          following: data.profile.following || 0,
          followers: data.profile.followers || 0,
          profilePic: data.profile.profile_pic,
          banner: data.profile.banner
        };

        setUser(profile);
        setEditUser(profile);
        
      } catch (error) {
        console.error("❌ Error loading user:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          status: "error",
          duration: 3000,
        });
        router.push('/log-in');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [toast, router]);

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const isProfile = field === 'profilePic';
    const setUploading = isProfile ? setUploadingProfile : setUploadingBanner;

    try {
      setUploading(true);
      
      toast({
        title: "Subiendo imagen...",
        status: "info",
        duration: 2000,
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', isProfile ? 'profile' : 'banner');
      formData.append('userId', user.id);

      const response = await fetch('http://localhost:8000/api/profiles/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();
      console.log('✅ Imagen subida:', data.imageUrl);

      setEditUser({ ...editUser, [field]: data.imageUrl });

      toast({
        title: "✅ Imagen subida",
        status: "success",
        duration: 2000,
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo subir la imagen",
        status: "error",
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const saveUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId) {
        toast({
          title: "Error",
          description: "No se encontró el usuario actual",
          status: "error",
          duration: 3000,
        });
        return;
      }

      // Guardar en el backend
      const response = await fetch('http://localhost:8000/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          name: editUser.name,
          username: editUser.username,
          description: editUser.description,
          birthdate: editUser.birthdate,
          profile_pic: editUser.profilePic,
          banner: editUser.banner
        }),
      });

      if (!response.ok) throw new Error('Error al guardar perfil');

      const data = await response.json();
      console.log('✅ Perfil guardado:', data.profile);

      setUser(editUser);
      onClose();
      
      toast({
        title: "✅ Perfil actualizado",
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
    localStorage.clear();
    router.push('/');
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
            onClick={() => router.push('/login')}
          >
            Ir al Login
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box  minH="100vh" py={8}>
      {/* Container Principal */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        px={{ base: 4, md: 6 }}
        border="1px solid #5c212b"
        borderRadius="16px"
        bg="#1a1a1ade"
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
              
              <Button 
                variant="outline" 
                colorScheme="red"
                onClick={handleLogout}
                size="md"
                borderRadius="full"
                width="full"
              >
                Cerrar sesión
              </Button>
            </VStack>
          </Flex>
        </Box>
      </Box>

      {/* Modal de Edición */}
      <Modal 
        isOpen={isOpen} 
        onClose={cancelEdit} 
        size={{ base: "full", md: "2xl" }}
      >
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="rgba(20, 20, 20, 0.95 )" color="white" borderRadius="xl">
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
                  isDisabled={uploadingProfile}
                />
                {uploadingProfile && <Text fontSize="sm" color="blue.400">Subiendo...</Text>}
              </FormControl>
              
              <FormControl>
                <FormLabel>Banner</FormLabel>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, "banner")}
                  border="none"
                  isDisabled={uploadingBanner}
                />
                {uploadingBanner && <Text fontSize="sm" color="blue.400">Subiendo...</Text>}
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTop="1px solid" borderColor="gray.600">
            <Button variant="outline" bg="white" onClick={cancelEdit} mr={3}>
              Cancelar
            </Button>
            <Button bg="#5c212b" color="white" onClick={saveUser}>
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}