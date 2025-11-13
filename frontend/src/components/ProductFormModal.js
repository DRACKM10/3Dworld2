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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

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

  // Estados para STL
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingSTL, setUploadingSTL] = useState(false);

  const toast = useToast();

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
      if (editProduct.stlFile) {
        setUploadedFiles([{ name: editProduct.stlFile.split("/").pop(), url: editProduct.stlFile }]);
      }
    } else {
      setFormData({ name: "", description: "", price: "", category: "", stock: "" });
      setImage(null);
      setPreviewImage("");
      setUploadedFiles([]);
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
        });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Subir archivo STL a Supabase (a través del backend)
  // 🧠 Versión con logs de depuración
const handleSTLUpload = async (e) => {
  console.log("➡️ [FRONT] Iniciando subida STL...");

  const file = e.target.files[0];
  if (!file) {
    console.log("⚠️ [FRONT] No se seleccionó ningún archivo");
    return;
  }

  console.log("📁 [FRONT] Archivo seleccionado:", file.name, "-", file.size, "bytes");

  if (!["stl", "obj", "gcode"].some((ext) => file.name.toLowerCase().endsWith(ext))) {
    console.warn("❌ [FRONT] Tipo de archivo no permitido:", file.name);
    toast({
      title: "Error",
      description: "Solo se permiten archivos STL, OBJ o GCODE",
      status: "error",
    });
    return;
  }

  setUploadingSTL(true);

  try {
    const formData = new FormData();
    formData.append("stl", file);
    formData.append("productId", editProduct?.id || "temp");

    const token = localStorage.getItem("token");
    const url = "http://localhost:8000/api/products/upload-stl";

    console.log("🌍 [FRONT] Enviando fetch a:", url);
    console.log("📦 [FRONT] FormData keys:", [...formData.keys()]);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        // ⚠️ No pongas Content-Type manualmente
      },
      body: formData,
    });

    console.log("📥 [FRONT] Respuesta recibida. Status:", response.status);

    // Obtener respuesta como texto (para capturar posibles errores de formato)
    const raw = await response.text();
    console.log("📦 [FRONT] Respuesta cruda del servidor:", raw);

    if (!response.ok) {
      throw new Error(`Error en backend (${response.status}): ${raw}`);
    }

    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("💀 [FRONT] Error parseando JSON:", err);
      throw new Error("El backend no devolvió JSON válido");
    }

    console.log("✅ [FRONT] Respuesta parseada correctamente:", data);

    setUploadedFiles([data.file]);

    toast({
      title: "✅ Archivo subido correctamente",
      description: file.name,
      status: "success",
    });
  } catch (error) {
    console.error("💀 [FRONT] Error durante la subida:", error);
    toast({
      title: "❌ Error",
      description: error.message,
      status: "error",
    });
  } finally {
    setUploadingSTL(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Nombre y precio son requeridos",
        status: "error",
      });
      return;
    }

    if (!editProduct && !image) {
      toast({
        title: "Error",
        description: "La imagen es requerida",
        status: "error",
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
      submitData.append("stock", formData.stock);

      if (image) submitData.append("image", image);
      if (editProduct && !image) submitData.append("currentImage", editProduct.image);
      if (uploadedFiles.length > 0) submitData.append("stlFile", uploadedFiles[0].url); // ✅ STL URL

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
        throw new Error("El servidor no devolvió un JSON válido");
      }

      if (!response.ok) throw new Error(result.error || "Error al crear producto");

      onAddProduct(result.product);
      toast({
        title: editProduct ? "✅ Producto actualizado" : "✅ Producto creado",
        description: `El producto se ${editProduct ? "actualizó" : "agregó"} exitosamente`,
        status: "success",
      });

      setFormData({ name: "", description: "", price: "", category: "", stock: "" });
      setImage(null);
      setPreviewImage("");
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editProduct ? "Editar" : "Agregar"} Producto</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  bg="blackAlpha.400"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  bg="blackAlpha.400"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  bg="blackAlpha.400"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  bg="blackAlpha.400"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Stock</FormLabel>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  bg="blackAlpha.400"
                />
              </FormControl>

              <FormControl isRequired={!editProduct}>
                <FormLabel>
                  Imagen {editProduct && "(dejar vacío para mantener actual)"}
                </FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>

              {previewImage && (
                <Box>
                  <Image src={previewImage} alt="Preview" maxH="200px" />
                  <Box fontSize="sm" color="green.600">
                    ✅ {image ? "Nueva imagen" : "Imagen actual"}
                  </Box>
                </Box>
              )}

              {/* ✅ Input STL */}
              <FormControl>
                <FormLabel>Archivo 3D (STL / OBJ / GCODE)</FormLabel>
                <Input
                  type="file"
                  accept=".stl,.obj,.gcode"
                  onChange={handleSTLUpload}
                  isDisabled={uploadingSTL}
                />
                {uploadingSTL && (
                  <Text fontSize="sm" color="blue.400">
                    Subiendo archivo...
                  </Text>
                )}
              </FormControl>

              {uploadedFiles.length > 0 && (
                <Box width="100%">
                  <Text fontWeight="bold" mb={2}>
                    Archivo 3D subido:
                  </Text>
                  <Box p={2} bg="gray.700" borderRadius="md">
                    <Text fontSize="sm">📁 {uploadedFiles[0].name}</Text>
                    <Text fontSize="xs" color="gray.400">
                      {uploadedFiles[0].type} - {uploadedFiles[0].size} MB
                    </Text>
                  </Box>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              bg="#646464ff"
              _hover={{ bg: "#a1a1a1ff" }}
              variant="outline"
              mr={3}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              bg="#5c212b"
              color="white"
              type="submit"
              isLoading={isLoading}
              _hover={{ bg: "#333333" }}
            >
              {editProduct ? "Actualizar" : "Crear"} Producto
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
