// context/CartContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/carts/1"); // Ajusta a /api/carts
        if (!response.ok) throw new Error("Error fetching cart");
        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (item) => {
    try {
      const response = await fetch("http://localhost:8000/api/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, productId: item.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Error adding to cart");
      const updatedItem = await response.json();
      setCart((prevCart) =>
        prevCart.some((i) => i.id === updatedItem.id)
          ? prevCart.map((i) => (i.id === updatedItem.id ? updatedItem : i))
          : [...prevCart, updatedItem]
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await fetch(`http://localhost:8000/api/carts/${itemId}`, {
        method: "DELETE",
      });
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};