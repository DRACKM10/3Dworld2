"use client"; // Marcamos como Client Component porque usaremos useState y useRouter

import { Box, Heading, Input, Button, FormControl, FormLabel, FormErrorMessage, Text, Link } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import loginAnimation from '/3Dworld/frontend/public/animations/login.json';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulación de validación (puedes conectar a una API aquí)
    if (email === 'usuario@ejemplo.com' && password === 'contraseña123') {
      // Redirige a la página principal tras "iniciar sesión"
      router.push('/');
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    
    

    <Box p={4} maxW="400px" mx="auto" mt={10}>
      <Heading mb={6} textAlign="center">Iniciar Sesión</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl isInvalid={error !== ''} mb={4}>
          <FormLabel>Correo Electrónico</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={error !== ''} mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
          <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="teal" width="full" mb={4} _hover={{background: "rgba(162, 147, 185, 0.8)"}}>
          Iniciar Sesión
        </Button>

        <Text textAlign="center">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" color="teal.500" _hover={{ textDecoration: "underline" }}>
            Regístrate aquí
          </Link>
        </Text>
      </form>
    </Box>
  );
}