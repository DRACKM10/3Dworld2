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

  const [uploadedSTL, setUploadedSTL] = useState(null);
  const [uploadingSTL, setUploadingSTL] = useState(false);

  const toast = useToast();

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
        setUploadedSTL({
          name: editProduct.stlFile.split("/").pop(),
          url: editProduct.stlFile,
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
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo imágenes",
        status: "error",
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSTLUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["stl", "obj", "gcode"].includes(ext)) {
      toast({
        title: "Error",
        description: "Solo STL / OBJ / GCODE",
        status: "error",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Máximo 20MB",
        status: "error",
      });
      e.target.value = "";
      return;
    }

    setUploadingSTL(true);

    try {
      const fd = new FormData();
      fd.append("stl", file);
      fd.append("productId", editProduct?.id || "temp");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/api/products/upload-stl", {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: fd,
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setUploadedSTL(data.file);

      toast({
        title: "Archivo subido",
        status: "success",
      });
    } catch (error) {
      toast({
        title: "Error al subir",
        description: error.message,
        status: "error",
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
        title: "Campos requeridos",
        status: "error",
      });
      return;
    }

    if (!editProduct && !image) {
      toast({
        title: "La imagen es requerida",
        status: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("category", formData.category);
      fd.append("stock", formData.stock);

      if (image) fd.append("image", image);
      else if (editProduct) fd.append("currentImage", editProduct.image);

      if (uploadedSTL) fd.append("stlFile", uploadedSTL.url);

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
        body: fd,
      });

      const raw = await response.text();
      const result = JSON.parse(raw);

      if (!response.ok) throw new Error(result.error);

      onAddProduct(result.product);

      toast({
        title: editProduct ? "Producto actualizado" : "Producto creado",
        status: "success",
      });

      setFormData({ name: "", description: "", price: "", category: "", stock: "" });
      setImage(null);
      setPreviewImage("");
      setUploadedSTL(null);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
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
      <ModalContent bg="gray.900" color="white">
        <ModalHeader>{editProduct ? "Editar" : "Agregar"} Producto</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} bg="blackAlpha.400" />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} bg="blackAlpha.400" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <Input type="number" name="price" value={formData.price} onChange={handleInputChange} bg="blackAlpha.400" />
              </FormControl>

              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Input name="category" value={formData.category} onChange={handleInputChange} bg="blackAlpha.400" />
              </FormControl>

              <FormControl>
                <FormLabel>Stock</FormLabel>
                <Input type="number" name="stock" value={formData.stock} onChange={handleInputChange} bg="blackAlpha.400" />
              </FormControl>

              <FormControl isRequired={!editProduct}>
                <FormLabel>Imagen</FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>

              {previewImage && (
                <Box>
                  <Image src={previewImage} maxH="200px" alt="Preview" />
                </Box>
              )}

              <FormControl>
                <FormLabel>Archivo 3D (STL/OBJ/GCODE)</FormLabel>
                <Input type="file" accept=".stl,.obj,.gcode" onChange={handleSTLUpload} disabled={uploadingSTL} />
              </FormControl>

              {uploadedSTL && (
                <Box bg="gray.700" p={3} borderRadius="md" width="100%">
                  <Text>Archivo cargado: {uploadedSTL.name}</Text>
                  <Button colorScheme="red" size="xs" mt={2} onClick={() => setUploadedSTL(null)}>
                    Eliminar archivo
                  </Button>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose} isDisabled={isLoading || uploadingSTL}>
              Cancelar
            </Button>
            <Button type="submit" colorScheme="red" isLoading={isLoading} isDisabled={uploadingSTL}>
              {editProduct ? "Actualizar" : "Crear"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
