"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme"; // Asegúrate de que la ruta sea correcta

export function Providers({ children }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}