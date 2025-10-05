import pool from "../config/db.js";
import validator from "validator";

/**
 * Obtiene los productos en el carrito de un usuario específico.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Array>} - Lista de productos en el carrito con id, quantity, name, price, e image.
 * @throws {Error} - Si el userId es inválido o ocurre un error en la consulta.
 */
export const getCartByUser = async (userId) => {
  if (!userId || !Number.isInteger(userId) || userId <= 0) {
    throw new Error("userId debe ser un número entero positivo");
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price, p.image
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener el carrito: ${error.message}`);

  }
};

/**
 * Agrega un producto al carrito de un usuario o actualiza la cantidad si ya existe.
 * @param {number} userId - ID del usuario.
 * @param {number} productId - ID del producto.
 * @param {number} quantity - Cantidad a agregar.
 * @returns {Promise<Object>} - Objeto con id, userId, productId, y quantity.
 * @throws {Error} - Si los parámetros son inválidos o ocurre un error en la consulta.
 */
export const addToCart = async (userId, productId, quantity) => {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("userId inválido");
  if (!Number.isInteger(productId) || productId <= 0) throw new Error("productId inválido");
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("quantity debe ser un número positivo");

  try {
    // Verificar si el producto ya está en el carrito
    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      const [result] = await pool.query(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        [newQuantity, existing[0].id]
      );
      return { id: existing[0].id, userId, productId, quantity: newQuantity };
    } else {
      const [result] = await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity]
      );
      return { id: result.insertId, userId, productId, quantity };
    }
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_NO_REFERENCED_ROW_2") {
      throw new Error("Usuario o producto no válido");
    }
    throw new Error(`Error al agregar al carrito: ${error.message}`);

  }
};

/**
 * Elimina un producto del carrito por su ID.
 * @param {number} id - ID del item en el carrito.
 * @returns {Promise<Object>} - Objeto con mensaje de confirmación.
 * @throws {Error} - Si el id es inválido o ocurre un error en la consulta.
 */
export const removeFromCart = async (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("id debe ser un número entero positivo");
  }

  try {
    await pool.query("DELETE FROM cart WHERE id = ?", [id]);
    return { message: "Producto eliminado del carrito" };
  } catch (error) {
   throw new Error("Error al eliminar del carrito: " + error.message);

  }
};