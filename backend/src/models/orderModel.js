import pool from "../config/db.js";

/**
 * Crea un nuevo pedido desde el carrito del usuario, calcula total, inserta items y vacía carrito.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Object>} - Objeto con id del pedido, total, items.
 * @throws {Error} - Si el carrito está vacío o error en transacción.
 */
export const createOrderFromCart = async (userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener carrito
    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      throw new Error("Carrito vacío");
    }

    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // Crear pedido
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [userId, total]
    );
    const orderId = orderResult.insertId;

    // Insertar items
    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Vaciar carrito
    await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);

    await connection.commit();

    return { id: orderId, total, items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity, price: item.price })) };
  } catch (error) {
    await connection.rollback();
    throw new Error(`Error al crear pedido: ${error.message}`);
  } finally {
    connection.release();
  }
};

/**
 * Obtiene los pedidos de un usuario.
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Array>} - Lista de pedidos con id, total, created_at, status, y items.
 */
export const getOrdersByUser = async (userId) => {
  try {
    const [orders] = await pool.query(
      "SELECT id, total, created_at, status FROM orders WHERE user_id = ?",
      [userId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        "SELECT product_id, quantity, price FROM order_items WHERE order_id = ?",
        [order.id]
      );
      order.items = items;
    }

    return orders;
  } catch (error) {
    throw new Error(`Error al obtener pedidos: ${error.message}`);
  }
};