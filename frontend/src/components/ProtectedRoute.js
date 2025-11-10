"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Spinner, Text } from "@chakra-ui/react";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      // Si no hay token, redirigir al login
      if (!token) {
        router.push("/login");
        return;
      }

      // Si se requiere un rol específico
      if (requiredRole && userRole !== requiredRole) {
        router.push("/"); // Redirigir al home si no tiene el rol
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="black"
      >
        <Spinner size="xl" color="purple.500" />
        <Text color="white" ml={4}>Verificando permisos...</Text>
      </Box>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}