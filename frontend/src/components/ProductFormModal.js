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
  Select,
  Box,
  Image,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function ProductFormModal({ isOpen, onClose, onAddProduct }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || images.length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor, completa todos los campos e incluye al menos una imagen.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    images.forEach((image) => formData.append('images', image));
    formData.append('mainImageIndex', mainImageIndex);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al guardar el producto');

      const newProduct = await response.json();
      onAddProduct(newProduct);
      toast({
        title: 'Éxito',
        description: 'Producto agregado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setName('');
      setDescription('');
      setPrice('');
      setImages([]);
      setMainImageIndex(0);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el producto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const previewImages = images.map((file) => ({
    url: URL.createObjectURL(file),
    name: file.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Agregar Nuevo Producto</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nombre</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del producto"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del producto"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Precio</FormLabel>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio del producto"
                step="0.01"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Imágenes</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
              />
            </FormControl>
            {images.length > 0 && (
              <>
                <FormControl>
                  <FormLabel>Previsualización</FormLabel>
                  <Wrap spacing={4}>
                    {previewImages.map((img, index) => (
                      <WrapItem key={index}>
                        <Box position="relative" width="100px" height="100px" borderRadius="8px" overflow="hidden">
                          <Image
                            src={img.url}
                            alt={`Previsualización ${img.name}`}
                            fill
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </Box>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
                <FormControl>
                  <FormLabel>Imagen principal</FormLabel>
                  <Select
                    value={mainImageIndex}
                    onChange={(e) => setMainImageIndex(Number(e.target.value))}
                  >
                    {images.map((_, index) => (
                      <option key={index} value={index}>
                        Imagen {index + 1} ({previewImages[index].name})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSubmit}>
            Guardar
          </Button>
          <Button variant="ghost" onClick={onClose} ml={3}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}