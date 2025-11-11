'use client';

import { StlViewer } from 'react-stl-viewer';
import { Box } from '@chakra-ui/react';

interface STLViewerProps {
  url: string; // URL de tu archivo STL (puedes subirlo a /public o un CDN)
  width?: string;
  height?: string;
}

export default function MySTLViewer({ url, width = '100%', height = '400px' }: STLViewerProps) {
  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      // Aquí puedes agregar más estilos de Chakra si quieres
    >
      <StlViewer
        url={url}
        style={{ width, height }}
        orbitControls // Permite rotar con el mouse
        shadows // Agrega sombras para mejor visual
        showAxes // Muestra ejes X, Y, Z
        // Opcional: onFinishLoading={(dimensions) => console.log('Modelo cargado:', dimensions)}
      />
    </Box>
  );
}