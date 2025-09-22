import { createOrderFromCart, getOrdersByUser } from "../models/orderModel.js";

/**
 * Crea un pedido desde el carrito del usuario autenticado.
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await createOrderFromCart(userId);
    res.status(201).json(order);
  } catch (err) {
    console.error("Error en createOrder:", err);
    if (err.message.includes("Carrito vacío")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene los pedidos del usuario autenticado.
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUser(userId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No se encontraron pedidos" });
    }
    res.json(orders);
  } catch (err) {
    console.error("Error en getOrders:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};