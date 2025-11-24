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
  useToast,
  Badge
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

  // Cargar datos básicos del usuario desde localStorage
  const loadUserFromLocalStorage = () => {
    try {
      console.log('🔍 Buscando usuario en localStorage...');
      
      // Verificar TODAS las posibles ubicaciones
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");
      const usuario = localStorage.getItem("usuario");
      const currentUser = localStorage.getItem("currentUser");
      
      console.log('📋 Datos encontrados en localStorage:', {
        userData: userData ? 'Sí' : 'No',
        token: token ? 'Sí' : 'No',
        userId: userId || 'No',
        userRole: userRole || 'No',
        usuario: usuario || 'No',
        currentUser: currentUser || 'No'
      });

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        console.log('👤 Usuario cargado de localStorage:', parsedUser);
        return parsedUser;
      }
      
      // Si no hay userData, intentar construir desde otros datos
      if (usuario || userId) {
        const basicUser = {
          id: userId || 'temp-id',
          name: usuario || 'Usuario',
          username: usuario || 'usuario',
          email: '',
          role: userRole || 'client'
        };
        console.log('👤 Usuario básico construido:', basicUser);
        return basicUser;
      }
      
    } catch (error) {
      console.error('❌ Error cargando usuario de localStorage:', error);
    }
    
    console.log('❌ No se pudo cargar ningún usuario');
    return null;
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('🚀 INICIANDO CARGA DE PERFIL...');
        
        const localUser = loadUserFromLocalStorage();
        const token = localStorage.getItem("token");

        console.log('🔐 Token disponible:', token ? 'Sí' : 'No');
        console.log('👤 Usuario local:', localUser);

        if (!localUser || !token) {
          console.log('❌ No hay sesión válida, redirigiendo a login...');
          toast({
            title: "Sesión requerida",
            description: "Debes iniciar sesión para ver tu perfil",
            status: "warning",
            duration: 3000,
          });
          router.push('/log-in');
          return;
        }

        console.log('📋 Intentando cargar perfil del backend para userId:', localUser.id);

        // Obtener perfil desde el backend
        const response = await fetch(`http://localhost:8000/api/profiles/${localUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 Respuesta del backend:', {
          status: response.status,
          ok: response.ok
        });

        let profileData = localUser; // Usar datos locales por defecto

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Perfil cargado del backend:', data);
          profileData = { ...localUser, ...data.profile };
        } else {
          console.log('⚠️ No se pudo cargar perfil del backend, usando datos locales');
          if (response.status === 404) {
            console.log('ℹ️ El perfil no existe en el backend, se creará al guardar');
          }
        }

        const completeProfile = {
          id: profileData.id || localUser.id,
          name: profileData.name || localUser.name || 'Usuario',
          username: profileData.username || localUser.username || `user_${localUser.id}`,
          email: profileData.email || localUser.email || '',
          description: profileData.description || "¡Hola! Soy nuevo en 3DWorld.",
          birthdate: profileData.birthdate || "",
          joinedDate: profileData.created_at 
            ? new Date(profileData.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          following: profileData.following || 0,
          followers: profileData.followers || 0,
          profilePic: profileData.profile_pic || profileData.profilePic || "/default-avatar.png",
          banner: profileData.banner || "/default-banner.jpg",
          role: profileData.role || localUser.role || 'client'
        };

        console.log('🎯 Perfil completo construido:', completeProfile);
        setUser(completeProfile);
        setEditUser(completeProfile);
        
      } catch (error) {
        console.error("❌ Error loading user:", error);
        
        // Intentar cargar solo con datos locales
        const localUser = loadUserFromLocalStorage();
        if (localUser) {
          console.log('🔄 Cargando perfil básico desde localStorage...');
          const basicProfile = {
            id: localUser.id,
            name: localUser.name || 'Usuario',
            username: localUser.username || `user_${localUser.id}`,
            email: localUser.email || '',
            description: "¡Hola! Soy nuevo en 3DWorld.",
            birthdate: "",
            joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            following: 0,
            followers: 0,
            profilePic: "/default-avatar.png",
            banner: "/default-banner.jpg",
            role: localUser.role || 'client'
          };
          setUser(basicProfile);
          setEditUser(basicProfile);
        } else {
          console.log('💥 No se pudo cargar ningún perfil');
          toast({
            title: "Error",
            description: "No se pudo cargar la información del usuario",
            status: "error",
            duration: 3000,
          });
          router.push('/log-in');
        }
      } finally {
        console.log('🏁 Finalizando carga de perfil');
        setLoading(false);
      }
    };

    loadUserData();
  }, [toast, router]);

  // ... el resto del código permanece igual (handleChange, handleFileChange, saveUser, etc.)

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
      const token = localStorage.getItem("token");

      if (!user || !token) {
        toast({
          title: "Error",
          description: "No se encontró el usuario actual",
          status: "error",
          duration: 3000,
        });
        return;
      }

      console.log('💾 Guardando perfil:', editUser);

      // Guardar en el backend
      const response = await fetch('http://localhost:8000/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          name: editUser.name,
          username: editUser.username,
          description: editUser.description,
          birthdate: editUser.birthdate,
          profile_pic: editUser.profilePic,
          banner: editUser.banner
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar perfil');
      }

      const data = await response.json();
      console.log('✅ Perfil guardado:', data.profile);

      // Actualizar localStorage con los nuevos datos
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        id: user.id,
        name: editUser.name,
        username: editUser.username,
        email: editUser.email,
        profilePic: editUser.profilePic,
        role: editUser.role
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Disparar evento para notificar al Header
      window.dispatchEvent(new Event('storage'));
      console.log('📢 Evento de storage disparado para actualizar Header');

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
        description: error.message || "No se pudieron guardar los cambios",
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("usuario");
    localStorage.removeItem("currentUser");
    
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("user_")) localStorage.removeItem(key);
    });
    
    router.push('/');
  };

  if (loading) {
    return (
      <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#ffffffff" />
          <Text color="white">Cargando perfil...</Text>
          <Text color="gray.400" fontSize="sm">Verificando sesión...</Text>
        </VStack>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="white" fontSize="xl">No se pudo cargar el perfil</Text>
          <Text color="gray.400">Parece que no hay una sesión activa</Text>
          <Button 
            colorScheme="purple"
            onClick={() => router.push('/log-in')}
          >
            Ir al Login
          </Button>
        </VStack>
      </Box>
    );
  }

  // ... el resto del JSX permanece igual
  return (
    <Box minH="100vh" py={8} bg="#121212">
      {/* Container Principal */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        px={{ base: 4, md: 6 }}
        border="6px solid #5c212b"
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
        >
          <Image 
            src={user.banner} 
            alt="Banner" 
            width="100%"
            height="100%"
            objectFit="cover"
            fallbackSrc="/default-banner.jpg"
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
                  name={user.name}
                />
              </Box>
              
              <VStack align={{ base: "center", lg: "flex-start" }} spacing={3}>
                <HStack spacing={3}>
                  <Heading size={{ base: "lg", md: "xl" }}>
                    {user.name}
                  </Heading>
                  <Badge 
                    colorScheme={user.role === 'admin' ? 'red' : 'green'} 
                    variant="subtle"
                  >
                    {user.role === 'admin' ? '🏢 Admin' : '👤 Usuario'}
                  </Badge>
                </HStack>
                
                <Text fontSize={{ base: "md", md: "lg" }} color="white">
                  @{user.username}
                </Text>
                
                {user.email && (
                  <Text fontSize="sm" color="white">
                    📧 {user.email}
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
                  <Text>📅 Miembro desde {user.joinedDate}</Text>
                  <Text>•</Text>
                  <Text>👥 {user.following} siguiendo</Text>
                  <Text>•</Text>
                  <Text>❤️ {user.followers} seguidores</Text>
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
                _hover={{ bg:"#7a2d3b", transform: "scale(1.05)" }} 
              >
                ✏️ Editar perfil
              </Button>
              
              <Button 
                variant="outline" 
                colorScheme="red"
                onClick={handleLogout}
                size="md"
                borderRadius="full"
                width="full"
              >
                🚪 Cerrar sesión
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
        <ModalContent bg="rgba(20, 20, 20, 0.95)" color="white" borderRadius="xl">
          <ModalHeader borderBottom="1px solid" borderColor="gray.600">
            ✏️ Editar Perfil
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre completo</FormLabel>
                <Input 
                  name="name" 
                  value={editUser?.name || ""} 
                  onChange={handleChange}
                  borderColor="gray.600"
                  placeholder="Tu nombre completo"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Nombre de usuario</FormLabel>
                <Input 
                  name="username" 
                  value={editUser?.username || ""} 
                  onChange={handleChange}
                  borderColor="gray.600"
                  placeholder="tu_usuario"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea 
                  name="description" 
                  value={editUser?.description || ""} 
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti, tus intereses en impresión 3D..."
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
                {uploadingProfile && <Text fontSize="sm" color="blue.400">📤 Subiendo...</Text>}
                {editUser?.profilePic && editUser.profilePic !== "/default-avatar.png" && (
                  <Box mt={2}>
                    <Text fontSize="sm" color="green.400">Vista previa:</Text>
                    <Image 
                      src={editUser.profilePic} 
                      alt="Vista previa" 
                      width="80px" 
                      height="80px" 
                      borderRadius="full"
                      objectFit="cover"
                      mt={1}
                    />
                  </Box>
                )}
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
                {uploadingBanner && <Text fontSize="sm" color="blue.400">📤 Subiendo...</Text>}
                {editUser?.banner && editUser.banner !== "/default-banner.jpg" && (
                  <Box mt={2}>
                    <Text fontSize="sm" color="green.400">Vista previa:</Text>
                    <Image 
                      src={editUser.banner} 
                      alt="Vista previa banner" 
                      width="100%" 
                      height="80px" 
                      borderRadius="md"
                      objectFit="cover"
                      mt={1}
                    />
                  </Box>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTop="1px solid" borderColor="gray.600">
            <Button variant="outline" onClick={cancelEdit} mr={3}>
              ❌ Cancelar
            </Button>
            <Button bg="#5c212b" color="white" onClick={saveUser} _hover={{ bg: "#7a2d3b" }}>
              💾 Guardar cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}