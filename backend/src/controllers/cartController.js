import { getCartByUser, addToCart, removeFromCart } from "../models/cartModel.js";

/**
 * Obtiene los productos en el carrito del usuario autenticado.
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // De token
    const cart = await getCartByUser(userId);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    console.error("Error en getCart:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Agrega un producto al carrito del usuario autenticado.
 */
export const addCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // De token, no de body

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "productId inválido" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity debe ser un número positivo" });
    }

    const newItem = await addToCart(userId, productId, quantity);
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error en addCartItem:", err);
    if (err.message.includes("Usuario o producto no válido")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Elimina un producto del carrito por su ID (verifica que pertenezca al usuario).
 */
export const deleteCartItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    // Opcional: Verificar que el item pertenece al usuario
    const [item] = await pool.query("SELECT user_id FROM cart WHERE id = ?", [id]);
    if (!item || item.user_id !== req.user.id) {
      return res.status(403).json({ error: "No autorizado para eliminar este item" });
    }

    const result = await removeFromCart(id);
    res.json(result);
  } catch (err) {
    console.error("Error en deleteCartItem:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};