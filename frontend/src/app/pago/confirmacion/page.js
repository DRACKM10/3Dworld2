"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ConfirmacionPage() {
  const router = useRouter();
  const [pagoData, setPagoData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("pagoData");
    if (data) {
      setPagoData(JSON.parse(data));
    } else {
      router.push("/"); // Si no hay datos, vuelve al inicio
    }
  }, [router]);

  if (!pagoData) return null;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      
      px={4}
    >
      <Box
        bg="#1e1e1e"
        p={10}
        rounded="2xl"
        boxShadow="0 0 25px rgba(92, 33, 43, 0.09)"
        maxW="600px"
        w="full"
      >
        <Heading
          color="#ffffff"
          mb={6}
          textAlign="center"
          fontSize="2xl"
          letterSpacing="wide"
        >
          ✅ Confirmación de Pago
        </Heading>

        <VStack spacing={4} align="stretch" color="gray.200">
          <Text><strong>Nombre:</strong> {pagoData.nombre}</Text>
          <Text><strong>Dirección:</strong> {pagoData.direccion}</Text>
          <Text><strong>Teléfono:</strong> {pagoData.telefono}</Text>
          <Text>
            <strong>Método de pago:</strong>{" "}
            {pagoData.tipoPago === "tarjeta"
              ? "Tarjeta de crédito / débito"
              : pagoData.tipoPago === "transferencia"
              ? "Transferencia bancaria"
              : "Pago contra entrega"}
          </Text>

          {pagoData.tipoPago === "tarjeta" && (
            <>
              <Text>
                <strong>Tarjeta:</strong> **** **** ****{" "}
                {pagoData.tarjeta.slice(-4)}
              </Text>
              <Text>
                <strong>Expiración:</strong> {pagoData.expiracion}
              </Text>
            </>
          )}

          <Divider borderColor="gray.600" />

          <Box textAlign="center">
            <Text fontSize="lg" mb={2} color="#5c212b" fontWeight="bold">
              ¡Tu pago ha sido procesado exitosamente!
            </Text>
            <Text color="gray.400">
              En breve recibirás un correo con la confirmación de tu pedido.
            </Text>
          </Box>

          <HStack justify="center" mt={6} spacing={4}>
            <Button
              bg="#5c212b"
              color="white"
              _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
              onClick={() => router.push("/")}
            >
              Seguir Comprando
            </Button>
            <Button
              variant="outline"
              borderColor="#5c212b"
              color="white"
              _hover={{ bg: "#5c212b", transform: "scale(1.05)" }}
              onClick={() => router.push("/")}
            >
              Volver al Inicio
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
