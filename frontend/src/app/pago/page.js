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
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function PagoPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    direccion: "",
    telefono: "",
    tipoPago: "",
    tarjeta: "",
    expiracion: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [usuarioValido, setUsuarioValido] = useState(true);

  // Validar si el usuario ha iniciado sesión
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("usuario");
      const userEmail = localStorage.getItem("userEmail");
      
      if (!user) {
        setUsuarioValido(false);
        toast({
          title: "⚠️ Sesión requerida",
          description: "Debes iniciar sesión para continuar con el pago",
          status: "warning",
          duration: 3000,
        });
        router.push("/login");
      } else {
        setUsuarioValido(true);
        
        // Pre-llenar email si existe
        if (userEmail) {
          setFormData(prev => ({ ...prev, email: userEmail }));
        }
      }
    }
  }, [router, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos obligatorios
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Teléfono inválido (solo números, 7-15 dígitos)";
    }

    if (!formData.tipoPago) {
      newErrors.tipoPago = "Selecciona un método de pago";
    }

    // Validar campos de tarjeta si se seleccionó ese método
    if (formData.tipoPago === "tarjeta") {
      if (!formData.tarjeta.trim()) {
        newErrors.tarjeta = "El número de tarjeta es obligatorio";
      } else if (!/^\d{13,19}$/.test(formData.tarjeta.replace(/\s/g, ""))) {
        newErrors.tarjeta = "Número de tarjeta inválido";
      }

      if (!formData.expiracion.trim()) {
        newErrors.expiracion = "La fecha de expiración es obligatoria";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiracion)) {
        newErrors.expiracion = "Formato inválido (MM/AA)";
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = "El CVV es obligatorio";
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "CVV inválido (3-4 dígitos)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("📋 Datos del formulario:", formData);

    // Validar formulario
    if (!validateForm()) {
      console.log("❌ Errores de validación:", errors);
      
      toast({
        title: "❌ Formulario incompleto",
        description: "Por favor completa todos los campos obligatorios",
        status: "error",
        duration: 3000,
      });
      
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementsByName(firstErrorField)[0];
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus();
      }
      
      return;
    }

    console.log("✅ Formulario válido, guardando datos...");

    // Guardar datos en localStorage
    localStorage.setItem("pagoData", JSON.stringify(formData));

    toast({
      title: "✅ Datos guardados",
      description: "Procesando tu pedido...",
      status: "success",
      duration: 2000,
    });

    // Redirigir a confirmación
    setTimeout(() => {
      router.push("/pago/confirmacion");
    }, 500);
  };

  if (!usuarioValido) return null;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="black"
      px={4}
      py={10}
    >
      <Box
        bg="rgba(30, 30, 30, 1)"
        p={10}
        rounded="2xl"
        boxShadow="0 0 25px rgba(92, 33, 43, 0.8)"
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
            {/* Nombre */}
            <FormControl isInvalid={!!errors.nombre} isRequired>
              <FormLabel color="gray.300">Nombre completo</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.nombre ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.nombre}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel color="gray.300">Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.email ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {/* Dirección */}
            <FormControl isInvalid={!!errors.direccion} isRequired>
              <FormLabel color="gray.300">Dirección</FormLabel>
              <Input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle 123 #45-67, Bogotá"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.direccion ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.direccion}</FormErrorMessage>
            </FormControl>

            {/* Teléfono */}
            <FormControl isInvalid={!!errors.telefono} isRequired>
              <FormLabel color="gray.300">Teléfono</FormLabel>
              <Input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="3001234567"
                bg="whiteAlpha.100"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.telefono ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.telefono}</FormErrorMessage>
            </FormControl>

            <Divider borderColor="gray.600" my={4} />

            {/* Método de pago */}
            <FormControl isInvalid={!!errors.tipoPago} isRequired>
              <FormLabel color="gray.300">Método de pago</FormLabel>
              <Select
                name="tipoPago"
                value={formData.tipoPago}
                onChange={handleChange}
                placeholder="Selecciona un método de pago"
                bg="#1e1e1e"
                color="gray.200"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.tipoPago ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
              >
                <option value="tarjeta">Tarjeta de crédito / débito</option>
                <option value="transferencia">Transferencia bancaria</option>
                <option value="contraEntrega">Pago contra entrega</option>
              </Select>
              <FormErrorMessage>{errors.tipoPago}</FormErrorMessage>
            </FormControl>

            {/* Campos de tarjeta - Solo si se selecciona "tarjeta" */}
            {formData.tipoPago === "tarjeta" && (
              <>
                <FormControl isInvalid={!!errors.tarjeta} isRequired>
                  <FormLabel color="gray.300">Número de tarjeta</FormLabel>
                  <Input
                    name="tarjeta"
                    value={formData.tarjeta}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    bg="whiteAlpha.100"
                    color="gray.200"
                    _placeholder={{ color: "gray.500" }}
                    borderColor={errors.tarjeta ? "red.500" : "#5c212b"}
                    _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
                    maxLength={19}
                  />
                  <FormErrorMessage>{errors.tarjeta}</FormErrorMessage>
                </FormControl>

                <HStack>
                  <FormControl isInvalid={!!errors.expiracion} isRequired>
                    <FormLabel color="gray.300">Expiración</FormLabel>
                    <Input
                      name="expiracion"
                      value={formData.expiracion}
                      onChange={handleChange}
                      placeholder="MM/AA"
                      bg="whiteAlpha.100"
                      color="gray.200"
                      _placeholder={{ color: "gray.500" }}
                      borderColor={errors.expiracion ? "red.500" : "#5c212b"}
                      _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
                      maxLength={5}
                    />
                    <FormErrorMessage>{errors.expiracion}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.cvv} isRequired>
                    <FormLabel color="gray.300">CVV</FormLabel>
                    <Input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      bg="whiteAlpha.100"
                      color="gray.200"
                      _placeholder={{ color: "gray.500" }}
                      borderColor={errors.cvv ? "red.500" : "#5c212b"}
                      _focus={{ borderColor: "#7a2d3b", boxShadow: "0 0 10px #5c212b" }}
                      maxLength={4}
                      type="password"
                    />
                    <FormErrorMessage>{errors.cvv}</FormErrorMessage>
                  </FormControl>
                </HStack>
              </>
            )}

            {/* Botón de envío */}
            <Button
              type="submit"
              mt={4}
              bg="#5c212b"
              color="white"
              _hover={{ bg: "#7a2d3b", transform: "scale(1.05)" }}
              w="full"
              size="lg"
            >
              Continuar con el pago
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}