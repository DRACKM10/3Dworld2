// frontend/src/styles/theme.js
import { extendTheme } from "@chakra-ui/react";
import { colors } from "./colors";

const theme = extendTheme({
  styles: {
    global: {
      body: { 
        bg: colors.background.main,
        color: colors.text.primary,
      },
    },
  },
  colors: {
    brand: colors.chakra.brand,
    teal: colors.chakra.teal,
  },
  fonts: {
    heading: `'Lexend Deca', sans-serif`,
    body: `'Lexend Deca', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "'Lexend Deca', sans-serif",
      },
      variants: {
        primary: {
          bg: colors.button.primary.bg,
          color: colors.button.primary.color,
          _hover: {
            bg: colors.button.primary.hover,
            transform: "scale(1.05)",
          },
        },
        secondary: {
          bg: colors.button.secondary.bg,
          color: colors.button.secondary.color,
          _hover: {
            bg: colors.button.secondary.hover,
            transform: "scale(1.05)",
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: colors.background.input,
            color: colors.text.primary,
            border: colors.borders.light,
            _placeholder: { color: colors.text.placeholder },
            _focus: {
              borderColor: colors.primary.main,
              boxShadow: colors.shadows.glow,
            },
          },
        },
      },
    },
  },
});

export default theme;