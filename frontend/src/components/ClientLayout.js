// components/ClientLayout.js
"use client";

import { CartProvider } from '../context/CartContext';
import Header from './header';

export default function ClientLayout({ children }) {
  return (
    <CartProvider>
      <Header />
      <main>
        {children}
      </main>
    </CartProvider>
  );
}