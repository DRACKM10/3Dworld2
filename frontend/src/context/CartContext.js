"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    loadCartFromLocalStorage();
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  };

  const loadCartFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  };

  const saveCartToLocalStorage = (cartData) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(cartData));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  };

  // Sincronizar carrito local con BD cuando el usuario se autentica
  const syncCartWithBackend = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem("token");
      
      // Para cada item en el carrito local, agregarlo al carrito del backend
      for (const item of cart) {
        await fetch("http://localhost:8000/api/carts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });
      }

      // Limpiar carrito local después de sincronizar
      setCart([]);
      localStorage.removeItem("cart");

      console.log("Carrito sincronizado con el backend");
    } catch (error) {
      console.error("Error sincronizando carrito:", error);
    }
  };

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      
      let newCart;
      if (existingItem) {
        // Incrementar cantidad si ya existe
        newCart = prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Agregar nuevo item
        const newItem = {
          id: `product_${product.id}_${Date.now()}`, // ID único
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          addedAt: new Date().toISOString()
        };
        newCart = [...prevCart, newItem];
      }

      saveCartToLocalStorage(newCart);
      return newCart;
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(item => item.id !== itemId);
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  };

  // Actualizar cantidad
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      saveCartToLocalStorage(newCart);
      return newCart;
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
    }
  };

  // Calcular total
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
    getCartItemsCount,
    isAuthenticated,
    syncCartWithBackend
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de CartProvider");
  }
  return context;
};