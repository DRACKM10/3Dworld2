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

  // Función para actualizar cantidad (opcional pero útil)
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token found, cannot update quantity");
        return;
      }
      const response = await fetch(`http://localhost:8000/api/carts/${itemId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) throw new Error("Error updating quantity");
      const updatedItem = await response.json();
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? updatedItem : item))
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Función para limpiar el carrito
  const clearCart = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn("No token found, cannot clear cart");
        return;
      }
      const response = await fetch("http://localhost:8000/api/carts/clear", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error clearing cart");
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Calcular total del carrito
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calcular cantidad total de items
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === null) throw new Error("useCart debe ser usado dentro de CartProvider");
  return context;
};