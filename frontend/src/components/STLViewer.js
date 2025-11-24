'use client';
import { useState } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  VStack, 
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { DownloadIcon, ViewIcon } from '@chakra-ui/icons';

const STLViewer = ({ url }) => {
  const [viewerMode, setViewerMode] = useState('info'); // 'info' o 'viewer'

  if (!url) {
    return (
      <Box 
        height="500px" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="black"
        borderRadius="lg"
        border="4px solid #5c212b"
      >
        <Text color="white">No hay modelo 3D disponible</Text>
      </Box>
    );
  }

  const handleDownload = () => {
    console.log("📥 Descargando STL desde:", url);
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Tabs 
        variant="enclosed" 
        colorScheme="purple"
        onChange={(index) => setViewerMode(index === 0 ? 'info' : 'viewer')}
      >
        <TabList borderColor="#5c212b">
          <Tab 
            _selected={{ 
              color: 'white', 
              bg: '#5c212b',
              borderColor: '#5c212b'
            }}
            fontWeight="bold"
          >
            📋 Información
          </Tab>
          <Tab 
            _selected={{ 
              color: 'white', 
              bg: '#5c212b',
              borderColor: '#5c212b'
            }}
            fontWeight="bold"
          >
            🎮 Vista 3D Interactiva
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de información */}
          <TabPanel p={0}>
            <Box 
              minHeight="500px" 
              bg="black"
              borderRadius="0 0 lg lg"
              border="4px solid #5c212b"
              borderTop="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={8}
            >
              <VStack spacing={6} textAlign="center">
                <Box fontSize="8xl">🎮</Box>
                
                <Heading size="xl" color="white">
                  Vista 3D Disponible
                </Heading>

                <HStack spacing={4}>
                  <Badge 
                    colorScheme="purple" 
                    fontSize="md" 
                    px={4} 
                    py={2} 
                    borderRadius="full"
                    bg="#a3aaffff"
                    color="black"
                  >
                    📁 STL
                  </Badge>
                </HStack>

                <Text color="gray.300" fontSize="md" maxW="500px">
                  Haz clic en la pestaña "Vista 3D Interactiva" para explorar el modelo 
                  en tu navegador, o descárgalo para verlo en tu software favorito.
                </Text>

                <Button 
                  width="100%"
                  maxW="400px"
                  size="lg"
                  height="60px"
                  bg="#5c212b"
                  color="white"
                  _hover={{ 
                    bg: "#7a2d3b", 
                    transform: "translateY(-2px)",
                    boxShadow: "0 0 20px rgba(92, 33, 43, 0.5)"
                  }}
                  onClick={handleDownload}
                  leftIcon={<DownloadIcon />}
                >
                  Descargar Archivo STL
                </Button>
              </VStack>
            </Box>
          </TabPanel>

          {/* Panel del visor 3D */}
          <TabPanel p={0}>
            <Box 
              height="600px" 
              bg="black"
              borderRadius="0 0 lg lg"
              border="4px solid #5c212b"
              borderTop="none"
              overflow="hidden"
              position="relative"
            >
              {/* Método 1: Visor online con ViewSTL */}
              <iframe
                src={`https://www.viewstl.com/?embedded&url=${encodeURIComponent(url)}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="STL Viewer"
              />

              {/* Instrucciones flotantes */}
              <Box
                position="absolute"
                bottom={4}
                left="50%"
                transform="translateX(-50%)"
                bg="blackAlpha.800"
                color="white"
                px={4}
                py={2}
                borderRadius="md"
                fontSize="sm"
                textAlign="center"
                pointerEvents="none"
              >
                🖱️ Arrastra para rotar | 🔍 Scroll para zoom
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default STLViewer;