"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Select,
  Text,
  Divider,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function PagoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    tipoPago: "",
    tarjeta: "",
    expiracion: "",
    cvv: "",
  });
  const [usuarioValido, setUsuarioValido] = useState(true);

  // Validar si el usuario ha iniciado sesión
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("usuario");
      if (!user) {
        setUsuarioValido(false);
        alert("Debes iniciar sesión para continuar con el pago.");
        router.push("/login");
      } else {
        setUsuarioValido(true);
      }
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, direccion, telefono, tipoPago, tarjeta, expiracion, cvv } = formData;

    if (!nombre || !direccion || !telefono || !tipoPago) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (tipoPago === "tarjeta" && (!tarjeta || !expiracion || !cvv)) {
      alert("Por favor completa todos los datos de la tarjeta.");
      return;
    }
  
    localStorage.setItem("pagoData", JSON.stringify(formData));
    router.push("/pago/confirmacion");
  };

  if (!usuarioValido) return null;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={10}
    >
      <Box
        bg="rgba(0, 0, 0, 1)"
        p={10}
        rounded="2xl"
        boxShadow="0 0 25px rgba(92, 33, 43,0.8)"
        maxW="550px"
        w="full"
      >
        <Heading
          color="#ffffffff"
          mb={6}
          textAlign="center"
          fontSize="2xl"
          letterSpacing="wide"
        >
          💳 Proceso de Pago Seguro
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.300">Nombre completo</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor="#5c212b"
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Dirección</FormLabel>
              <Input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Tu dirección"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor="#5c212b"
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300">Teléfono</FormLabel>
              <Input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Tu número de contacto"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor="#5c212b"
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
               
              />
            </FormControl>

            <Divider borderColor="gray.600" my={4} />

            <FormControl>
              <FormLabel color="gray.300">Método de pago</FormLabel>
              <Select
                name="tipoPago"
                value={formData.tipoPago}
                onChange={handleChange}
                placeholder="Selecciona un método de pago"
                bg="#1e1e1e"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor="#5c212b"
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
                css={{
                  '& option': {
                    background: '#1e1e1e !important',  
                    color: 'white !important', 
                  },
                 
                  '& option:hover': {
                    background: '#2d2d2d !important',
                  },
                 
                
                  '&:-moz-focusring option': {
                    background: '#1e1e1e',
                    color: 'white',
                  },
                }}
              >
                <option style={{ color: "black" }}  value="tarjeta">
                  Tarjeta de crédito / débito
                </option>
                <option style={{ color: "black" }} value="transferencia">
                  Transferencia bancaria
                </option>
                <option style={{ color: "black" }} value="contraEntrega">
                  Pago contra entrega
                </option>
              </Select>
            </FormControl>

            {formData.tipoPago === "tarjeta" && (
              <>
                <FormControl>
                  <FormLabel color="gray.300">Número de tarjeta</FormLabel>
                  <Input
                    name="tarjeta"
                    value={formData.tarjeta}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    bg="whiteAlpha.100"
                    color="gray.200"
                    _placeholder={{ color: "gray.500" }}
                    maxLength={19}
                  />
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel color="gray.300">Expiración</FormLabel>
                    <Input
                      name="expiracion"
                      value={formData.expiracion}
                      onChange={handleChange}
                      placeholder="MM/AA"
                      bg="whiteAlpha.100"
                      color="gray.200"
                      _placeholder={{ color: "gray.500" }}
                      maxLength={5}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.300">CVV</FormLabel>
                    <Input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      bg="whiteAlpha.100"
                      color="gray.200"
                      _placeholder={{ color: "gray.500" }}
                      maxLength={3}
                      type="password"
                    />
                  </FormControl>
                </HStack>
              </>
            )}

            <Button
              type="submit"
              mt={4}
              bg="#5c212b"
              color="white"
              _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
              w="full"
            >
              Continuar con el pago
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
