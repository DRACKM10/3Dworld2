// src/components/ProductViewer3D.js
"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Box } from '@chakra-ui/react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={[1, 1, 1]} />;
}

export default function ProductViewer3D({ modelUrl }) {
  return (
    <Box h="400px" w="100%" borderWidth="1px" borderRadius="md">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Model url={modelUrl} />
        <OrbitControls />
      </Canvas>
    </Box>
  );
}