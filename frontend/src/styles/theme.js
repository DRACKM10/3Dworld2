// src/styles/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: { 
        bg: "black"
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
    heading: `'Lexend Dec', sans-serif`,
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