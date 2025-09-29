"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Función para obtener el token guardado en localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.warn("No token found, cannot fetch cart");
          return;
        }
        const response = await fetch("http://localhost:8000/api/carts", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
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
      const token = getToken();
      if (!token) {
        console.warn("No token found, cannot add to cart");
        return;
      }
      const response = await fetch("http://localhost:8000/api/carts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.id, quantity: 1 }),
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
      const token = getToken();
      if (!token) {
        console.warn("No token found, cannot remove from cart");
        return;
      }
      const response = await fetch(`http://localhost:8000/api/carts/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error removing from cart");
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
  if (context === null) throw new Error("useCart must ser usado dentro de CartProvider");
  return context;
};
