import { useEffect, useState } from 'react';
import { 
  SimpleGrid, 
  Box, 
  Text, 
  Select,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Badge,
  Button
} from '@chakra-ui/react';
import { SearchIcon, FilterIcon } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductList({ refreshTrigger, onEdit }) {
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Obtener productos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:8000/api/products');
        if (!response.ok) throw new Error('Error al fetch productos');
        const data = await response.json();
        setFetchedProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    }
    fetchProducts();
  }, [refreshTrigger]);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = [...fetchedProducts];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.creator_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Filtro por creador
    if (creatorFilter !== 'all') {
      if (creatorFilter === '3Dworld') {
        filtered = filtered.filter(product => product.creator_name === '3Dworld');
      } else {
        filtered = filtered.filter(product => product.creator_name !== '3Dworld');
      }
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [fetchedProducts, searchTerm, categoryFilter, creatorFilter, sortBy]);

  // Obtener categorías únicas
  const categories = ['all', ...new Set(fetchedProducts.map(p => p.category))];
  
  // Obtener creadores únicos
  const creators = [
    { value: 'all', label: 'Todos los creadores' },
    { value: '3Dworld', label: '🏢 3Dworld' },
    { value: 'users', label: '👤 Creadores independientes' }
  ];

  const handleDelete = (productId) => {
    setFetchedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCreatorFilter('all');
    setSortBy('newest');
  };

  // Estadísticas
  const totalProducts = filteredProducts.length;
  const officialProducts = filteredProducts.filter(p => p.creator_name === '3Dworld').length;
  const userProducts = filteredProducts.filter(p => p.creator_name !== '3Dworld').length;

  return (
    <VStack spacing={6} align="stretch">
      {/* Filtros y Búsqueda */}
      <Box p={4} bg="white" borderRadius="lg" shadow="sm">
        <VStack spacing={4}>
          {/* Barra de búsqueda */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon size={18} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar productos por nombre, descripción o creador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {/* Filtros */}
          <HStack spacing={4} wrap="wrap" width="100%">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              maxW="200px"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              maxW="250px"
            >
              {creators.map(creator => (
                <option key={creator.value} value={creator.value}>
                  {creator.label}
                </option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW="200px"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="name">Orden alfabético</option>
            </Select>

            <Button
              leftIcon={<FilterIcon size={16} />}
              variant="outline"
              onClick={clearFilters}
              size="sm"
            >
              Limpiar filtros
            </Button>
          </HStack>

          {/* Estadísticas */}
          <HStack spacing={4} justify="space-between" width="100%">
            <Text fontSize="sm" color="gray.600">
              Mostrando {totalProducts} de {fetchedProducts.length} productos
            </Text>
            <HStack spacing={3}>
              <Badge colorScheme="blue" variant="subtle">
                🏢 Oficial: {officialProducts}
              </Badge>
              <Badge colorScheme="green" variant="subtle">
                👤 Usuarios: {userProducts}
              </Badge>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">
            No se encontraron productos
          </Text>
          <Text fontSize="sm" color="gray.400" mt={2}>
            Intenta ajustar los filtros de búsqueda
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}