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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function ProductFormModal({ isOpen, onClose, onAddProduct, editProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Cargar datos si es edición
  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: editProduct.price || '',
        category: editProduct.category || '',
        stock: editProduct.stock || ''
      });
      setPreviewImage(editProduct.image || '');
    } else {
      // Limpiar formulario
      setFormData({ name: '', description: '', price: '', category: '', stock: '' });
      setImage(null);
      setPreviewImage('');
    }
  }, [editProduct, isOpen]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Solo se permiten archivos de imagen',
          status: 'error',
        });
        return;
      }
      setImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: 'Error',
        description: 'Nombre y precio son requeridos',
        status: 'error',
      });
      return;
    }

    // Si es edición y no hay nueva imagen, requerir imagen existente
    if (!editProduct && !image) {
      toast({
        title: 'Error',
        description: 'La imagen es requerida',
        status: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      submitData.append('stock', formData.stock);
      
      if (image) {
        submitData.append('image', image);
      }
      
      if (editProduct && !image) {
        submitData.append('currentImage', editProduct.image);
      }

      const url = editProduct 
        ? `http://localhost:8000/api/products/${editProduct.id}`
        : 'http://localhost:8000/api/products';
      
      const method = editProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();
      onAddProduct(result.product);
      
      toast({
        title: editProduct ? '✅ Producto actualizado' : '✅ Producto creado',
        description: `El producto se ${editProduct ? 'actualizó' : 'agregó'} exitosamente`,
        status: 'success',
      });

      // Limpiar formulario
      setFormData({ name: '', description: '', price: '', category: '', stock: '' });
      setImage(null);
      setPreviewImage('');
      onClose();
      
    } catch (error) {
      toast({
        title: '❌ Error',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{editProduct ? 'Editar' : 'Agregar'} Producto</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Input name="category" value={formData.category} onChange={handleInputChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Stock</FormLabel>
                <Input name="stock" type="number" value={formData.stock} onChange={handleInputChange} />
              </FormControl>

              <FormControl isRequired={!editProduct}>
                <FormLabel>Imagen {editProduct && '(dejar vacío para mantener actual)'}</FormLabel>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>

              {previewImage && (
                <Box>
                  <Image src={previewImage} alt="Preview" maxH="200px" />
                  <Box fontSize="sm" color="green.600">
                    ✅ {image ? 'Nueva imagen' : 'Imagen actual'}
                  </Box>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" type="submit" isLoading={isLoading}>
              {editProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}