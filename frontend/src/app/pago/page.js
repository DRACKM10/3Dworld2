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
  FormErrorMessage,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@chakra-ui/icons";

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
  const [cartItems, setCartItems] = useState([]);
  const [totalCart, setTotalCart] = useState(0);

  // Validar usuario y cargar carrito
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("usuario");
      const userEmail = localStorage.getItem("userEmail");
      
      // Validar sesión
      if (!user) {
        setUsuarioValido(false);
        toast({
          title: "⚠️ Sesión requerida",
          description: "Debes iniciar sesión para continuar con el pago",
          status: "warning",
          duration: 3000,
        });
        router.push("/login");
        return;
      }

      // Cargar carrito desde localStorage
      const storedCart = localStorage.getItem("cartItems");
      console.log("🛒 Carrito en localStorage:", storedCart);

      if (!storedCart || storedCart === "[]") {
        toast({
          title: "🛒 Carrito vacío",
          description: "Debes agregar productos al carrito primero",
          status: "warning",
          duration: 3000,
        });
        router.push("/");
        return;
      }

      try {
        const items = JSON.parse(storedCart);
        console.log("📦 Items del carrito:", items);

        if (!items || items.length === 0) {
          toast({
            title: "🛒 Carrito vacío",
            description: "Debes agregar productos al carrito primero",
            status: "warning",
            duration: 3000,
          });
          router.push("/");
          return;
        }

        setCartItems(items);

        // Calcular total
        const total = items.reduce((sum, item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 1;
          return sum + (price * quantity);
        }, 0);

        console.log("💰 Total calculado:", total);
        setTotalCart(total);

        // Pre-llenar email
        if (userEmail) {
          setFormData(prev => ({ ...prev, email: userEmail }));
        }

        setUsuarioValido(true);
      } catch (error) {
        console.error("❌ Error al parsear carrito:", error);
        toast({
          title: "Error",
          description: "Error al cargar el carrito",
          status: "error",
          duration: 3000,
        });
        router.push("/");
      }
    }
  }, [router, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

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
    console.log("🛒 Items del carrito:", cartItems);
    console.log("💰 Total:", totalCart);

    if (!validateForm()) {
      toast({
        title: "❌ Formulario incompleto",
        description: "Por favor completa todos los campos obligatorios",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "❌ Carrito vacío",
        description: "No hay productos en el carrito",
        status: "error",
        duration: 3000,
      });
      router.push("/");
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

    setTimeout(() => {
      router.push("/pago/confirmacion");
    }, 500);
  };

  if (!usuarioValido || cartItems.length === 0) return null;

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
      px={4}
      py={10}
    >
      <Box
        border={"5px solid #5c212b"}
        p={10}
        rounded="2xl"
        maxW="650px"
        w="full"
      >
        <Heading
          color="#000000ff"
          mb={6}
          textAlign="center"
          fontSize="2xl"
          letterSpacing="wide"
        >
          💳 Proceso de Pago Seguro
        </Heading>

        {/* Resumen del carrito */}
        <Box
          bg="#0000006b"
          p={4}
          borderRadius="md"
          mb={6}
          border="1px solid #5c212b"
        >
          <Heading size="sm" color="white" mb={3}>
            📦 Resumen de tu pedido
          </Heading>
          <List spacing={2}>
            {cartItems.map((item, index) => (
              <ListItem key={index} color="black" fontSize="sm">
                <ListIcon as={CheckCircleIcon} color="#5c212b" />
                {item.name} x {item.quantity || 1} - ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
              </ListItem>
            ))}
          </List>
          <Divider my={3} borderColor="gray.600" />
          <Text color="black" fontSize="lg" fontWeight="bold" textAlign="right">
            Total: ${totalCart.toFixed(2)}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {/* Nombre */}
            <FormControl isInvalid={!!errors.nombre} isRequired>
              <FormLabel color="black">Nombre completo</FormLabel>
              <Input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                bg="whiteAlpha.100"
                color="black"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.nombre ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.nombre}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel color="black">Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                bg="whiteAlpha.100"
                color="black"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.email ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {/* Dirección */}
            <FormControl isInvalid={!!errors.direccion} isRequired>
              <FormLabel color="black">Dirección</FormLabel>
              <Input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle 123 #45-67, Bogotá"
                bg="whiteAlpha.100"
                color="black"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.direccion ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.direccion}</FormErrorMessage>
            </FormControl>

            {/* Teléfono */}
            <FormControl isInvalid={!!errors.telefono} isRequired>
              <FormLabel color="black">Teléfono</FormLabel>
              <Input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="3001234567"
                bg="whiteAlpha.100"
                color="black"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.telefono ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
              />
              <FormErrorMessage>{errors.telefono}</FormErrorMessage>
            </FormControl>

            <Divider borderColor="gray.600" my={4} />

            {/* Método de pago */}
            <FormControl isInvalid={!!errors.tipoPago} isRequired>
              <FormLabel color="black">Método de pago</FormLabel>
              <Select
                name="tipoPago"
                value={formData.tipoPago}
                onChange={handleChange}
                placeholder="Selecciona un método de pago"
                bg="#00000077"
                color="black"
                _placeholder={{ color: "gray.500" }}
                borderColor={errors.tipoPago ? "red.500" : "#5c212b"}
                _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
              >
                <option value="tarjeta">Tarjeta de crédito / débito</option>
                <option value="transferencia">Transferencia bancaria</option>
                <option value="contraEntrega">Pago contra entrega</option>
              </Select>
              <FormErrorMessage>{errors.tipoPago}</FormErrorMessage>
            </FormControl>

            {/* Campos de tarjeta */}
            {formData.tipoPago === "tarjeta" && (
              <>
                <FormControl isInvalid={!!errors.tarjeta} isRequired>
                  <FormLabel color="black">Número de tarjeta</FormLabel>
                  <Input
                    name="tarjeta"
                    value={formData.tarjeta}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    bg="whiteAlpha.100"
                    color="black"
                    _placeholder={{ color: "gray.500" }}
                    borderColor={errors.tarjeta ? "red.500" : "#5c212b"}
                    _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
                    maxLength={19}
                  />
                  <FormErrorMessage>{errors.tarjeta}</FormErrorMessage>
                </FormControl>

                <HStack>
                  <FormControl isInvalid={!!errors.expiracion} isRequired>
                    <FormLabel color="black">Expiración</FormLabel>
                    <Input
                      name="expiracion"
                      value={formData.expiracion}
                      onChange={handleChange}
                      placeholder="MM/AA"
                      bg="whiteAlpha.100"
                      color="black"
                      _placeholder={{ color: "gray.500" }}
                      borderColor={errors.expiracion ? "red.500" : "#5c212b"}
                      _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
                      maxLength={5}
                    />
                    <FormErrorMessage>{errors.expiracion}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.cvv} isRequired>
                    <FormLabel color="black">CVV</FormLabel>
                    <Input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      bg="whiteAlpha.100"
                      color="black"
                      _placeholder={{ color: "gray.500" }}
                      borderColor={errors.cvv ? "red.500" : "#5c212b"}
                      _focus={{ borderColor: "#5c212b", boxShadow: "0 0 10px #5c212b" }}
                      maxLength={4}
                      type="password"
                    />
                    <FormErrorMessage>{errors.cvv}</FormErrorMessage>
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
              size="lg"
            >
              Confirmar pedido por ${totalCart.toFixed(2)}
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}