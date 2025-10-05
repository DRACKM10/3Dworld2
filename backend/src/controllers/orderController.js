import OrderModel from "../models/orderModel.js";

// Crea un pedido desde el carrito del usuario autenticado.
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await OrderModel.createOrderFromCart(userId);
    res.status(201).json({
      message: "Orden creada exitosamente",
      order: order
    });
  } catch (err) {
    console.error("Error en createOrder:", err);
    if (err.message.includes("Carrito vacío")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtiene los pedidos del usuario autenticado.
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await OrderModel.getOrdersByUser(userId);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No se encontraron pedidos" });
    }
    res.json({
      message: "Pedidos obtenidos exitosamente",
      orders: orders
    });
  } catch (err) {
    console.error("Error en getOrders:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener orden por ID
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    
    res.json({
      message: "Orden obtenida exitosamente",
      order: order
    });
  } catch (err) {
    console.error("Error en getOrderById:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar orden
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;
    
    const updatedOrder = await OrderModel.update(orderId, updates);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    
    res.json({
      message: "Orden actualizada exitosamente",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Error en updateOrder:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar orden
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await OrderModel.delete(orderId);
    
    if (!deletedOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    
    res.json({
      message: "Orden eliminada exitosamente",
      order: deletedOrder
    });
  } catch (err) {
    console.error("Error en deleteOrder:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};