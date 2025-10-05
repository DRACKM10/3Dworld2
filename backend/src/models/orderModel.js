import pool from '../config/db.js';

const OrderModel = {
  // Crear nueva orden
  create: async (orderData) => {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO orders (user_id, total, status, shipping_address, billing_address, payment_method, payment_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.userId,
          orderData.total,
          orderData.status || 'pending',
          orderData.shippingAddress,
          orderData.billingAddress,
          orderData.paymentMethod,
          orderData.paymentStatus || 'pending'
        ]
      );
      return { id: result.insertId, ...orderData };
    } finally {
      connection.release();
    }
  },

  // Encontrar orden por ID
  findById: async (id) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  },

  // Encontrar órdenes por usuario
  findByUserId: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  // Actualizar orden
  update: async (id, updates) => {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      });
      
      values.push(id);
      
      await connection.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return await OrderModel.findById(id);
    } finally {
      connection.release();
    }
  },

  // Eliminar orden
  delete: async (id) => {
    const connection = await pool.getConnection();
    try {
      const order = await OrderModel.findById(id);
      if (!order) return null;
      
      await connection.execute('DELETE FROM orders WHERE id = ?', [id]);
      return order;
    } finally {
      connection.release();
    }
  },

  // Obtener todas las órdenes
  findAll: async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
      return rows;
    } finally {
      connection.release();
    }
  },

  // CREAR ORDEN DESDE CARRITO (NUEVA FUNCIÓN)
  createOrderFromCart: async (userId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Obtener items del carrito del usuario
      const [cartItems] = await connection.execute(
        `SELECT ci.*, p.price, p.name 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.user_id = ?`,
        [userId]
      );

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Carrito vacío");
      }

      // 2. Calcular total
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // 3. Crear la orden
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, total, status, shipping_address, billing_address, payment_method, payment_status) 
         VALUES (?, ?, 'pending', 'Por definir', 'Por definir', 'tarjeta', 'pending')`,
        [userId, total]
      );

      const orderId = orderResult.insertId;

      // 4. Crear order items desde cart items
      for (const item of cartItems) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      // 5. Vaciar el carrito
      await connection.execute(
        'DELETE FROM cart_items WHERE user_id = ?',
        [userId]
      );

      await connection.commit();

      // 6. Obtener la orden creada con sus items
      const [orders] = await connection.execute(
        `SELECT o.*, 
                oi.product_id, oi.quantity, oi.price,
                p.name as product_name, p.image
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.id = ?`,
        [orderId]
      );

      return orders;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // OBTENER ÓRDENES POR USUARIO (NUEVA FUNCIÓN)
  getOrdersByUser: async (userId) => {
    const connection = await pool.getConnection();
    try {
      const [orders] = await connection.execute(
        `SELECT o.*, 
                oi.product_id, oi.quantity, oi.price,
                p.name as product_name, p.image
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [userId]
      );
      return orders;
    } finally {
      connection.release();
    }
  }
};

export default OrderModel;