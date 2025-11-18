// frontend/src/styles/colors.js

/**
 * Sistema de Colores Centralizado - 3DWORLD
 * 
 * INSTRUCCIONES DE USO:
 * ====================
 * 
 * 1. En componentes de Chakra UI:
 *    import { colors } from '@/styles/colors';
 *    <Box bg={colors.primary.main} color={colors.text.primary}>
 * 
 * 2. Para gradientes:
 *    <Box bgGradient={colors.gradients.primary}>
 * 
 * 3. Para sombras:
 *    <Box boxShadow={colors.shadows.primary}>
 * 
 * 4. Para bordes:
 *    <Box border={colors.borders.primary}>
 */

export const colors = {
  // ==========================================
  // COLORES PRINCIPALES DE LA MARCA
  // ==========================================
  primary: {
    main: '#5c212b',        // Color principal (rojo oscuro)
    light: '#7a2d3b',       // Versión más clara
    dark: '#4a1a22',        // Versión más oscura
    hover: '#6d6c6c73',     // Color al pasar el mouse
    accent: '#a3aaffff',    // Color de acento (azul claro)
  },

  // ==========================================
  // COLORES DE FONDO
  // ==========================================
  background: {
    main: '#ffffffff',           // Fondo principal (negro)
    secondary: '#1A1A1A',      // Fondo secundario
    card: '#292929e0',         // Fondo de tarjetas
    dark: 'rgba(20, 20, 20, 0.85)',  // Fondo oscuro con transparencia
    modal: 'rgba(20, 20, 20, 0.95)',  // Fondo de modales
    gray: '#1e1e1e',           // Fondo gris
    input: '#1A1A1A',          // Fondo de inputs
    hover: '#18181873',        // Fondo hover
  },

  // ==========================================
  // COLORES DE TEXTO
  // ==========================================
  text: {
    primary: '#EDEDED',        // Texto principal (blanco)
    secondary: '#ffffff',      // Texto secundario
    muted: 'gray.400',         // Texto apagado
    dark: '#0F0F0F',           // Texto oscuro
    light: 'gray.300',         // Texto claro
    placeholder: 'gray.500',   // Placeholder de inputs
  },

  // ==========================================
  // COLORES DE ESTADO
  // ==========================================
  status: {
    success: 'green.400',
    error: 'red.400',
    warning: 'yellow.400',
    info: 'blue.400',
  },

  // ==========================================
  // BORDES
  // ==========================================
  borders: {
    primary: '2px solid #5c212b',
    secondary: '1px solid #5c212b',
    light: '2px solid #333333',
    focus: '2px solid #5c212b',
    card: '1px solid #5c212b',
    gray: '1px solid gray.600',
  },

  // ==========================================
  // SOMBRAS
  // ==========================================
  shadows: {
    primary: '0 0 20px #5c212b',
    card: '0 0 10px rgba(92, 33, 43, 0.3)',
    hover: '0 0 20px rgba(163, 170, 255, 0.4)',
    glow: '0 0 10px #5c212b',
    text: '0 0 10px #5c212b',
    red: '0 0 8px rgba(255, 0, 0, 0.6)',
  },

  // ==========================================
  // GRADIENTES
  // ==========================================
  gradients: {
    primary: 'linear(to-r, #5c212bff, #5c212b)',
    secondary: 'linear(to-r, #5c212b, #a3aaffff)',
    header: 'linear(to-r, #5c212bff, #5c212b)',
    footer: 'linear(to-r, #0b2b33, #0f0f0f)',
    background: 'linear(to bottom, #0f0f0fe5, #2e2e2eda)',
  },

  // ==========================================
  // COLORES DE BOTONES
  // ==========================================
  button: {
    primary: {
      bg: '#5c212b',
      color: 'white',
      hover: '#7a2d3b',
    },
    secondary: {
      bg: 'blackAlpha.700',
      color: '#EDEDED',
      hover: '#18181873',
    },
    outline: {
      bg: 'transparent',
      color: 'white',
      border: '2px solid #5c212b',
      hover: '#5c212b',
    },
  },

  // ==========================================
  // COLORES ESPECÍFICOS DE CHAKRA UI
  // ==========================================
  chakra: {
    brand: {
      500: '#593da7cc',
    },
    teal: {
      500: '#52389bb0',
    },
  },
};

// ==========================================
// ESTILOS REUTILIZABLES
// ==========================================
export const commonStyles = {
  // Card básica
  card: {
    bg: colors.background.card,
    border: colors.borders.card,
    borderRadius: 'lg',
    p: 4,
    color: colors.text.primary,
    boxShadow: colors.shadows.card,
    _hover: {
      transform: 'scale(1.02)',
      boxShadow: colors.shadows.hover,
      borderColor: colors.primary.accent,
    },
  },

  // Input básico
  input: {
    bg: colors.background.input,
    color: colors.text.primary,
    border: colors.borders.light,
    _placeholder: { color: colors.text.placeholder },
    _focus: {
      borderColor: colors.primary.main,
      boxShadow: colors.shadows.glow,
    },
  },

  // Modal básico
  modal: {
    bg: colors.background.modal,
    color: colors.text.primary,
    borderRadius: 'xl',
    boxShadow: colors.shadows.primary,
  },

  // Botón primario
  buttonPrimary: {
    bg: colors.button.primary.bg,
    color: colors.button.primary.color,
    _hover: {
      bg: colors.button.primary.hover,
      transform: 'scale(1.05)',
    },
  },

  // Header
  header: {
    bgGradient: colors.gradients.header,
    color: colors.text.primary,
    boxShadow: 'md',
  },
};

export default colors;