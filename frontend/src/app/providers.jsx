"use client";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";
import { AuthProvider } from "../context/authContext"; 
import { CartProvider } from "../context/CartContext"; 

export function Providers({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <CartProvider> {/* ← Añade esto */}
          {children}
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}