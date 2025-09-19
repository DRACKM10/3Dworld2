// src/components/ClientLayout.js
"use client";

import { CartProvider } from '../context/CartContext';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../styles/theme';
import Header from './header';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  return (
    <ChakraProvider theme={theme}>
      <CartProvider>
        <Header />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </ChakraProvider>
  );
}