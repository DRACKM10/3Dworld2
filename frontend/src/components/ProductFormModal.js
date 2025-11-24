"use client";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  VStack,
  Box,
  Image,
  Text,
  Select,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

// ✅ Categorías predefinidas para clientes
const CLIENT_CATEGORIES = [
  "Figuras y Estatuas",
  "Juguetes",
  "Decoración",
  "Útiles y Herramientas",
  "Accesorios",
  "Prototipos",
  "Arte",
  "Joyería",
  "Otro"
];

export default function ProductFormModal({ isOpen, onClose, onAddProduct, editProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedSTL, setUploadedSTL] = useState(null);
  const [uploadingSTL, setUploadingSTL] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const toast = useToast();

  // ✅ Detectar rol del usuario
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || "",
        description: editProduct.description || "",
        price: editProduct.price || "",
        category: editProduct.category || "",
        stock: editProduct.stock || "",
      });
      setPreviewImage(editProduct.image || "");
      
      if (editProduct.stlFile || editProduct.stl_file) {
        const stlUrl = editProduct.stlFile || editProduct.stl_file;
        setUploadedSTL({
          name: stlUrl.split("/").pop(),
          url: stlUrl,
          size: "N/A",
          type: "STL"
        });
      }
    } else {
      setFormData({ name: "", description: "", price: "", category: "", stock: "" });
      setImage(null);
      setPreviewImage("");
      setUploadedSTL(null);
    }
  }, [editProduct, isOpen]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen",
          status: "error",
          duration: 3000,
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSTLUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!["stl", "obj", "gcode"].includes(ext)) {
      toast({
        title: "❌ Error",
        description: "Solo se permiten archivos STL, OBJ o GCODE",
        status: "error",
        duration: 3000,
      });
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "❌ Error",
        description: "El archivo no debe superar 20MB",
        status: "error",
        duration: 3000,
      });
      e.target.value = "";
      return;
    }

    setUploadingSTL(true);

    try {
      const formData = new FormData();
      formData.append("stl", file);
      formData.append("productId", editProduct?.id || "temp");

      const token = localStorage.getItem("token");
      const url = "http://localhost:8000/api/products/upload-stl";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setUploadedSTL(data.file);

      toast({
        title: "✅ Archivo subido",
        description: file.name,
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("💀 Error:", error);
      toast({
        title: "❌ Error al subir archivo",
        description: error.message,
        status: "error",
        duration: 4000,
      });
      e.target.value = "";
    } finally {
      setUploadingSTL(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: "❌ Error",
        description: "Nombre y precio son requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!editProduct && !image) {
      toast({
        title: "❌ Error",
        description: "La imagen es requerida para productos nuevos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // ✅ Validar categoría para clientes
    if (userRole === "client" && !formData.category) {
      toast({
        title: "❌ Error",
        description: "Por favor selecciona una categoría",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("category", formData.category);
      submitData.append("stock", formData.stock || "0");

      if (image) {
        submitData.append("image", image);
      } else if (editProduct) {
        submitData.append("currentImage", editProduct.image);
      }

      if (uploadedSTL) {
        submitData.append("stlFile", uploadedSTL.url);
      }

      const url = editProduct
        ? `http://localhost:8000/api/products/${editProduct.id}`
        : "http://localhost:8000/api/products";
      
      const method = editProduct ? "PUT" : "POST";
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: submitData,
      });

      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        throw new Error("El servidor no devolvió JSON válido");
      }

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      onAddProduct(result.product);
      
      toast({
        title: editProduct ? "✅ Producto actualizado" : "✅ Producto creado",
        description: userRole === "client" 
          ? "Tu producto se publicó correctamente" 
          : "Operación exitosa",
        status: "success",
        duration: 2000,
      });

      setFormData({ name: "", description: "", price: "", category: "", stock: "" });
      setImage(null);
      setPreviewImage("");
      setUploadedSTL(null);
      onClose();
    } catch (error) {
      console.error("💀 Error en submit:", error);
      toast({
        title: "❌ Error",
        description: error.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white" color="black">
        <ModalHeader color="#5c212b">
          {editProduct ? "Editar" : userRole === "client" ? "Publicar" : "Agregar"} Producto
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* ✅ Alerta informativa para clientes */}
              {userRole === "client" && !editProduct && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Estás publicando un producto. Otros usuarios podrán verlo en la tienda.
                  </Text>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Nombre del producto</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  bg="white"
                  border="2px solid #5c212b"
                  _focus={{ borderColor: "#a3aaffff" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  bg="white"
                  border="2px solid #5c212b"
                  _focus={{ borderColor: "#a3aaffff" }}
                  placeholder="Describe tu producto..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio (USD)</FormLabel>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  bg="white"
                  border="2px solid #5c212b"
                  _focus={{ borderColor: "#a3aaffff" }}
                />
              </FormControl>

              {/* ✅ Categoría: Select para clientes, Input para admin */}
              <FormControl isRequired={userRole === "client"}>
                <FormLabel>Categoría</FormLabel>
                {userRole === "client" ? (
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    bg="white"
                    border="2px solid #5c212b"
                    _focus={{ borderColor: "#a3aaffff" }}
                    placeholder="Selecciona una categoría"
                  >
                    {CLIENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    bg="white"
                    border="2px solid #5c212b"
                    _focus={{ borderColor: "#a3aaffff" }}
                    placeholder="Ej: Electrónica, Decoración..."
                  />
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Stock disponible</FormLabel>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  bg="white"
                  border="2px solid #5c212b"
                  _focus={{ borderColor: "#a3aaffff" }}
                />
              </FormControl>

              <FormControl isRequired={!editProduct}>
                <FormLabel>
                  Imagen {editProduct && "(dejar vacío para mantener actual)"}
                </FormLabel>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  border="2px solid #5c212b"
                />
              </FormControl>

              {previewImage && (
                <Box>
                  <Image src={previewImage} alt="Preview" maxH="200px" borderRadius="md" />
                  <Text fontSize="sm" color="green.500" mt={2}>
                    ✅ {image ? "Nueva imagen" : "Imagen actual"}
                  </Text>
                </Box>
              )}

              {/* Archivo STL */}
              <FormControl>
                <FormLabel>Archivo 3D (Opcional - STL/OBJ/GCODE)</FormLabel>
                <Input
                  type="file"
                  accept=".stl,.obj,.gcode"
                  onChange={handleSTLUpload}
                  isDisabled={uploadingSTL}
                  border="2px solid #5c212b"
                />
                {uploadingSTL && (
                  <Text fontSize="sm" color="blue.500" mt={2}>
                    ⏳ Subiendo archivo...
                  </Text>
                )}
              </FormControl>

              {uploadedSTL && (
                <Box width="100%" p={3} bg="gray.50" borderRadius="md" border="2px solid #5c212b">
                  <Text fontWeight="bold" color="green.500" mb={1}>
                    ✅ Archivo 3D cargado:
                  </Text>
                  <Text fontSize="sm">📁 {uploadedSTL.name}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {uploadedSTL.type} - {uploadedSTL.size} MB
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    mt={2}
                    onClick={() => setUploadedSTL(null)}
                  >
                    Eliminar archivo
                  </Button>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              isDisabled={isLoading || uploadingSTL}
            >
              Cancelar
            </Button>
            <Button
              bg="#5c212b"
              color="white"
              type="submit"
              isLoading={isLoading}
              isDisabled={uploadingSTL}
              _hover={{ bg: "#7a2d3b" }}
            >
              {editProduct ? "Actualizar" : userRole === "client" ? "Publicar" : "Crear"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}