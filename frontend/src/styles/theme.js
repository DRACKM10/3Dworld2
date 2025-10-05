// src/styles/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bgGradient: "linear(to-b, #0F0F0F, #2E2E2E)",
      },
    },
  },
  colors: {
    brand: {
      500: "#593da7cc",
    },
    teal: {
      500: "#52389bb0",
    },
  },
  fonts: {
    heading: `'Bree Serif', serif`,
    body: `'Lexend Deca', sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "'Lexend Deca', sans-serif",
      },
    },
  },
});

export default theme;