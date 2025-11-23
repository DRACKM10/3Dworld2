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
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function ConfirmacionPage() {
  const router = useRouter();
  const toast = useToast();
  const [pagoData, setPagoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);

  useEffect(() => {
    const procesarPedido = async () => {
      const data = localStorage.getItem("pagoData");
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!data) {
        router.push("/");
        return;
      }

      const pagoInfo = JSON.parse(data);
      setPagoData(pagoInfo);

      // Calcular total
      const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

      try {
        // Enviar pedido al backend
        const response = await fetch("http://localhost:8000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            email: userEmail || pagoInfo.email,
            nombre: pagoInfo.nombre,
            direccion: pagoInfo.direccion,
            telefono: pagoInfo.telefono,
            tipoPago: pagoInfo.tipoPago,
            tarjeta: pagoInfo.tarjeta,
            expiracion: pagoInfo.expiracion,
            items: cartItems,
            total: total,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el pedido");
        }

        const result = await response.json();
        console.log("✅ Pedido creado:", result);

        setOrderCreated(true);

        // Limpiar carrito y datos de pago
        localStorage.removeItem("cartItems");
        localStorage.removeItem("pagoData");

        toast({
          title: "✅ Pedido confirmado",
          description: "Recibirás un email con los detalles",
          status: "success",
          duration: 5000,
        });

      } catch (error) {
        console.error("❌ Error:", error);
        toast({
          title: "❌ Error",
          description: "Hubo un problema al procesar tu pedido",
          status: "error",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    procesarPedido();
  }, [router, toast]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="black"
      >
        <VStack>
          <Spinner size="xl" color="#5c212b" />
          <Text color="white" mt={4}>
            Procesando tu pedido...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!pagoData) return null;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
      px={4}
    >
      <Box
        bg="whiteAlpha.100"
        p={10}
        rounded="2xl"
        border={"4px solid #5c212b"}
        maxW="600px"
        w="full"
      >
        <Heading
          color="#5c212b"
          mb={6}
          textAlign="center"
          fontSize="2xl"
          letterSpacing="wide"
        >
          ✅ Confirmación de Pago
        </Heading>

        <VStack spacing={4} align="stretch" color="black">
          <Text>
            <strong>Nombre:</strong> {pagoData.nombre}
          </Text>
          <Text>
            <strong>Dirección:</strong> {pagoData.direccion}
          </Text>
          <Text>
            <strong>Teléfono:</strong> {pagoData.telefono}
          </Text>
          <Text>
            <strong>Método de pago:</strong>{" "}
            {pagoData.tipoPago === "tarjeta"
              ? "Tarjeta de crédito / débito"
              : pagoData.tipoPago === "transferencia"
              ? "Transferencia bancaria"
              : "Pago contra entrega"}
          </Text>

          {pagoData.tipoPago === "tarjeta" && pagoData.tarjeta && (
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

          <Divider borderColor="#5c212b" />

          <Box textAlign="center">
            <Text fontSize="lg" mb={2} color="#5c212b" fontWeight="bold">
              ¡Tu pago ha sido procesado exitosamente!
            </Text>
            <Text color="black">
              📧 Hemos enviado un correo con la confirmación de tu pedido.
            </Text>
            <Text color="black" fontSize="sm" mt={2}>
              Revisa tu bandeja de entrada y spam.
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
              color="black"
              _hover={{ bg: "#5c212b", transform: "scale(1.05)" }}
              onClick={() => router.push("/perfil")}
            >
              Ver Mis Pedidos
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}