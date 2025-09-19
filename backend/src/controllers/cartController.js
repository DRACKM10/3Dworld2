import { getCartByUser, addToCart, removeFromCart } from "../models/cartModel.js";

/**
 * Obtiene los productos en el carrito de un usuario específico.
 * @param {Object} req - Objeto de solicitud con userId en params.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con la lista de productos en el carrito o un error.
 */
export const getCart = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "userId inválido" });
    }

    const cart = await getCartByUser(userId);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ error: "Carrito no encontrado para este usuario" });
    }
    res.json(cart);
  } catch (err) {
    console.error("Error en getCart:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Agrega un producto al carrito de un usuario o actualiza su cantidad.
 * @param {Object} req - Objeto de solicitud con userId, productId, y quantity en body.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con el item agregado o un error.
 */
export const addCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validaciones
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "userId inválido" });
    }
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: "productId inválido" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity debe ser un número positivo" });
    }

    // Opcional: Verificar que el userId coincide con el usuario autenticado
    // if (req.user && req.user.id !== userId) {
    //   return res.status(403).json({ error: "No autorizado para modificar este carrito" });
    // }

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
 * Elimina un producto del carrito por su ID.
 * @param {Object} req - Objeto de solicitud con id en params.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con un mensaje de confirmación o un error.
 */
export const deleteCartItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    const result = await removeFromCart(id);
    res.json(result);
  } catch (err) {
    console.error("Error en deleteCartItem:", err);
    if (err.message.includes("Error al eliminar del carrito")) {
      return res.status(404).json({ error: "Item del carrito no encontrado" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};