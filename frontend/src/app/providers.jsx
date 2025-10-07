"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";
import { AuthProvider } from "../context/authContext"; 

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider> {}
        {children}
      </AuthProvider>
    </ChakraProvider>
  );
}
