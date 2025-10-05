import { ChakraProvider, Box, Stack, Text, Flex, Button, Input, Textarea, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { FaHome, FaFire, FaPlus, FaUsers, FaGamepad, FaStar, FaPen } from "react-icons/fa";

function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevaPublicacion, setNuevaPublicacion] = useState("");
  const [nuevaMultimedia, setNuevaMultimedia] = useState(null);
  const [comentario, setComentario] = useState("");

  const manejarEnvioPublicacion = (e) => {
    e.preventDefault();
    if (nuevaPublicacion.trim() || nuevaMultimedia) {
      const nuevaPub = {
        id: Date.now(),
        texto: nuevaPublicacion,
        multimedia: nuevaMultimedia ? URL.createObjectURL(nuevaMultimedia) : null,
        likes: 0,
        comentarios: [],
      };
      setPublicaciones([...publicaciones, nuevaPub]);
      setNuevaPublicacion("");
      setNuevaMultimedia(null);
    }
  };

  const manejarLike = (id) => {
    setPublicaciones(publicaciones.map(pub =>
      pub.id === id ? { ...pub, likes: pub.likes + 1 } : pub
    ));
  };

  const manejarEnvioComentario = (pubId, e) => {
    e.preventDefault();
    if (comentario.trim()) {
      setPublicaciones(publicaciones.map(pub =>
        pub.id === pubId
          ? { ...pub, comentarios: [...pub.comentarios, { id: Date.now(), texto: comentario, likes: 0 }] }
          : pub
      ));
      setComentario("");
    }
  };

  const manejarLikeComentario = (pubId, comId) => {
    setPublicaciones(publicaciones.map(pub =>
      pub.id === pubId
        ? {
            ...pub,
            comentarios: pub.comentarios.map(com =>
              com.id === comId ? { ...com, likes: com.likes + 1 } : com
            ),
          }
        : pub
    ));
  };

  return (
    <ChakraProvider>
      <Flex h="100vh">
        {/* Barra lateral */}
        <Box w="200px" bg="gray.800" color="white" p="4">
          <Stack spacing="4">
            <Flex align="center">
              <Icon as={FaHome} mr="2" />
              <Text>Inicio</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaFire} mr="2" />
              <Text>Popular</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaPlus} mr="2" />
              <Text>Crear</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaUsers} mr="2" />
              <Text>Comunidades</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaGamepad} mr="2" />
              <Text>Gaming</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaStar} mr="2" />
              <Text>Creadores</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaPen} mr="2" />
              <Text>Crear post</Text>
            </Flex>
          </Stack>
        </Box>

        {/* Contenido principal */}
        <Box flex="1" p="4" bg="gray.100">
          <Flex align="center" mb="4">
            <Text fontSize="xl" fontWeight="bold">{/* Nombre de usuario desde base de datos */}</Text>
          </Flex>
          <Stack spacing="4">
            <form onSubmit={manejarEnvioPublicacion}>
              <Flex direction="column" gap="2">
                <Textarea
                  placeholder="Escribe tu publicación..."
                  value={nuevaPublicacion}
                  onChange={(e) => setNuevaPublicacion(e.target.value)}
                  mb="2"
                />
                <Input
                  type="file"
                  accept="image/,video/"
                  onChange={(e) => setNuevaMultimedia(e.target.files[0])}
                  mb="2"
                />
                <Button type="submit" colorScheme="teal">Publicar</Button>
              </Flex>
            </form>
            {publicaciones.map((publicacion) => (
              <Box key={publicacion.id} p="4" bg="white" borderRadius="md" boxShadow="md">
                <Text>{publicacion.texto}</Text>
                {publicacion.multimedia && (
                  <Box mt="2">
                    {publicacion.multimedia.match(/\.(jpg|jpeg|png|gif|mp4)$/)
                      ? <img src={publicacion.multimedia} alt="Multimedia" style={{ maxWidth: "100%" }} />
                      : <video controls src={publicacion.multimedia} style={{ maxWidth: "100%" }} />}
                  </Box>
                )}
                <Button mt="2" colorScheme="teal" size="sm" onClick={() => manejarLike(publicacion.id)}>
                  Like ({publicacion.likes})
                </Button>
                <Stack mt="2" spacing="2">
                  {publicacion.comentarios.map((com) => (
                    <Box key={com.id} p="2" bg="gray.50" borderRadius="md">
                      <Text>{com.texto}</Text>
                      <Button mt="1" colorScheme="teal" size="xs" onClick={() => manejarLikeComentario(publicacion.id, com.id)}>
                        Like ({com.likes})
                      </Button>
                    </Box>
                  ))}
                  <form onSubmit={(e) => manejarEnvioComentario(publicacion.id, e)}>
                    <Flex>
                      <Input
                        placeholder="Añade un comentario..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        mb="2"
                        size="sm"
                      />
                      <Button type="submit" colorScheme="teal" ml="2" size="sm">Comentar</Button>
                    </Flex>
                  </form>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}

export default Comunidad;