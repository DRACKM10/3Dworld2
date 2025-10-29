"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, Image, Button, SimpleGrid, Stack, Flex, FormControl, FormLabel, Input, VStack, Tabs, TabList, Tab, TabPanels, TabPanel, Textarea, Link, Accordion, AccordionItem, AccordionButton, AccordionPanel as AccordionContent, AccordionIcon } from "@chakra-ui/react";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printSettings, setPrintSettings] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [fileUpload, setFileUpload] = useState(null);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products`);
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const products = await response.json();
        const foundProduct = products.find((p) => p.id === id);
        if (!foundProduct) throw new Error('Producto no encontrado');
        if (!foundProduct.images || foundProduct.images.length === 0) {
          console.warn('Producto sin imágenes:', id);
          foundProduct.images = ['/images/default.jpg'];
          foundProduct.mainImageIndex = 0;
        }
        // Inicializar propiedades faltantes para evitar errores
        foundProduct.files = foundProduct.files || [];
        foundProduct.comments = foundProduct.comments || [];
        setProduct(foundProduct);
        setPrintSettings(foundProduct.printSettings || '');
        setVideoLink(foundProduct.videoLink || '');
      } catch (error) {
        console.error('Error al fetch productos:', error);
        setProduct({ id, name: 'Producto no disponible', images: ['/images/default.jpg'], mainImageIndex: 0, price: 0, description: 'Error al cargar los datos', files: [], comments: [] });
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <Text color="white">Cargando...</Text>;

  if (!product) return <Text color="white">Producto no encontrado</Text>;

  const mainImage = product.images[product.mainImageIndex] || product.images[0] || '/images/default.jpg';
  const additionalImages = product.images.filter((_, index) => index !== product.mainImageIndex).length > 0
    ? product.images.filter((_, index) => index !== product.mainImageIndex)
    : [];

  const handleSaveSettings = async () => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('printSettings', printSettings);
    formData.append('videoLink', videoLink);
    if (pdfFile) formData.append('pdf', pdfFile);
    if (fileUpload) formData.append('file', fileUpload);

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Error al guardar las configuraciones');
      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      alert('Configuraciones guardadas con éxito');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      alert('Error al guardar las configuraciones');
    }
  };

  const handleAddComment = async () => {
    if (!comment) return alert('Escribe un comentario');
    const formData = new FormData();
    formData.append('id', id);
    formData.append('comment', comment);
    formData.append('replyTo', replyTo || '');

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Error al agregar comentario');
      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setComment('');
      setReplyTo(null);
      alert('Comentario agregado con éxito');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar el comentario');
    }
  };

  return (
    <Box p={4} maxW="1200px" mx="auto" mt={4}>
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Imagen principal */}
        <Box flex={1} position="relative" height={{ base: "300px", md: "400px" }} borderRadius="8px" overflow="hidden">
          <Image
            src={mainImage}
            alt={product.name || 'Producto'}
            height="400px"
            width="100%"
            style={{ objectFit: "contain", borderRadius: "8px" }}
            priority
            onError={(e) => { e.target.src = '/images/default.jpg'; console.error('Imagen no encontrada:', mainImage); }}
          />
        </Box>

        {/* Detalles del producto */}
        <Box flex={1} color="white">
          <Heading as="h1" size="xl" mb={2}>
            {product.name || 'Producto sin nombre'}
          </Heading>
          <Text fontSize="lg" mb={4}>
            ${product.price || 0}
          </Text>
          <Text mb={4}>{product.description || 'Sin descripción'}</Text>
          <Button
            colorScheme="purple"
            variant="solid"
            width="100%"
            mb={4}
            onClick={() => alert(`"${product.name || 'Producto'}" agregado al carrito!`)}
            _hover={{ bg: "purple.600", transform: "scale(1.05)" }}
          >
            Agregar al carrito
          </Button>
          <Button variant="outline" colorScheme="blue" onClick={() => alert("Compartir funcionalidad pendiente")}>
            Compartir
          </Button>
        </Box>
      </Flex>

      {/* Imágenes adicionales (solo si hay más de una imagen) */}
      {additionalImages.length > 0 && (
        <Box mt={6}>
          <Heading as="h2" size="md" color="white" mb={4}>
            Imágenes adicionales
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            {additionalImages.map((img, index) => (
              <Box key={index} position="relative" height={{ base: "150px", md: "200px" }} borderRadius="8px" overflow="hidden">
                <Image
                  src={img}
                  alt={`${product.name || 'Producto'} - Imagen ${index + 1}`}
                  height="200px"
                  width="100%"
                  style={{ objectFit: "contain", borderRadius: "8px" }}
                  onError={(e) => { e.target.src = '/images/default.jpg'; console.error('Imagen adicional no encontrada:', img); }}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Secciones con Tabs horizontales */}
      <Box mt={6}>
        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab color="white">Informacion</Tab>
            <Tab color="white">Archivos</Tab>
            <Tab color="white">Comentarios</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch" color="white">
                <FormControl>
                  <FormLabel>ajustes de impresion</FormLabel>
                  <Textarea value={printSettings} onChange={(e) => setPrintSettings(e.target.value)} placeholder="Altura de capa, soportes, boquilla, material del filamento, etc." />
                </FormControl>
                <FormControl>
                  <FormLabel>Video Link (YouTube)</FormLabel>
                  <Input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                  {videoLink && (
                    <Box mt={2}>
                      <iframe src={`https://www.youtube.com/embed/${videoLink.split('v=')[1]}`} width="100%" height="315" frameBorder="0" allowFullScreen />
                    </Box>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Subir PDF informativo</FormLabel>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  {product.pdf && (
                    <Link href={product.pdf} isExternal mt={2}>
                      Ver PDF
                    </Link>
                  )}
                </FormControl>
                <Button colorScheme="teal" onClick={handleSaveSettings}>
                  Guardar
                </Button>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={2} align="stretch" color="white">
                {product.files && product.files.map((file, index) => (
                  <Box key={index} p={2} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="bold">{file.name}</Text>
                    <Text>Tamaño: {file.size} KB</Text>
                    <Text>Actualizado: {file.date}</Text>
                    <Link href={file.url} isExternal>
                      Descargar
                    </Link>
                  </Box>
                ))}
                <FormControl>
                  <FormLabel>Subir archivo (STL, GCODE, etc.)</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) => setFileUpload(e.target.files[0])}
                  />
                </FormControl>
                <Button colorScheme="teal" onClick={handleSaveSettings}>
                  Guardar
                </Button>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch" color="white">
                <Accordion allowMultiple>
                  {product.comments && product.comments.map((comment, index) => (
                    <AccordionItem key={index}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            {comment.user} - {comment.date}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionContent pb={4}>
                        <Text>{comment.content}</Text>
                        {comment.replies && comment.replies.map((reply, rIndex) => (
                          <Box key={rIndex} ml={4} mt={2} borderLeft="2px solid white" pl={4}>
                            <Text fontWeight="bold">{reply.user} - {reply.date}</Text>
                            <Text>{reply.content}</Text>
                          </Box>
                        ))}
                        <Input
                          mt={2}
                          placeholder="Responder..."
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onFocus={() => setReplyTo(index)}
                        />
                        <Button mt={2} onClick={handleAddComment}>
                          Responder
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <FormControl mt={4}>
                  <FormLabel>Agregar comentario</FormLabel>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario" />
                  <Button mt={2} onClick={handleAddComment}>
                    Enviar
                  </Button>
                </FormControl>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}