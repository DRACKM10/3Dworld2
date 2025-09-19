import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      500: '#593da7cc',
    },
    teal: {
      500: '#52389bb0',
    }
  },
  fonts: {
    heading: `'Bree Serif', serif`,
    body: `'Lexend Deca', sans-serif`,
  },
});

export default theme;