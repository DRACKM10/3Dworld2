'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Spinner, 
  VStack, 
  Heading 
} from '@chakra-ui/react';

// Componente SIMPLE que evita Three.js
const STLViewer = ({ url }) => {
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);

  useEffect(() => {
    const checkSTLFile = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
          const size = response.headers.get('content-length');
          setFileInfo({
            size: size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'Desconocido',
            type: 'STL',
            url: url
          });
        } else {
          throw new Error('Archivo no disponible');
        }
      } catch (err) {
        console.error('Error verificando STL:', err);
      } finally {
        setLoading(false);
      }
    };

    if (url) checkSTLFile();
  }, [url]);

  if (loading) {
    return (
      <Box 
        height="400px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.800"
        borderRadius="md"
        flexDirection="column"
      >
        <Spinner size="xl" color="purple.500" />
        <Text mt={3} color="white">Verificando archivo 3D...</Text>
      </Box>
    );
  }

  return (
    <Box 
      height="400px" 
      bg="#000000"
      borderRadius="md"
      border="8px solid #5c212b"
      borderColor="#000000"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      p={6}
    >
      <VStack spacing={4} textAlign="center">
        <Box fontSize="6xl">🎮</Box>
        <Heading size="md" color="white">Vista 3D Disponible</Heading>
        
        {fileInfo && (
          <VStack spacing={2} color="gray.300">
            <Text>Tipo: <strong>{fileInfo.type}</strong></Text>
            <Text>Tamaño: <strong>{fileInfo.size}</strong></Text>
          </VStack>
        )}
        
        <Text color="white" fontSize="sm" textAlign="center">
          El modelo 3D está listo para descargar y visualizar en cualquier software 3D
        </Text>
        
        <VStack spacing={3} mt={4}>
          <Button 
            colorScheme="#5c212b"
            bg="#5c212b" 
            _hover={{ 
                bg: "#5c212b", 
                transform: "translateY(-2px)",
                boxShadow: "lg"
            }}
            onClick={() => window.open(url, '_blank')}
            leftIcon={<Text>📥</Text>}
          >
            Descargar Archivo STL
          </Button>
          
          <Button 
            variant="outline" 
            colorScheme="blue"
            onClick={() => window.open('https://www.meshlab.net/', '_blank')}
            size="sm"
          >
            Abrir con MeshLab (Gratis)
          </Button>
        </VStack>
        
        <Text color="gray.500" fontSize="xs" mt={4}>
          💡 Recomendamos: MeshLab, Blender o cualquier visualizador STL
        </Text>
      </VStack>
    </Box>
  );
};

export default STLViewer;