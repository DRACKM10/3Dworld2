import pool from "../config/db.js";

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
    
    // Obtener los datos completos del producto agregado
    const [itemWithDetails] = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price, p.image, p.description
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = ?`,
      [newItem.id]
    );

    res.status(201).json(itemWithDetails[0]);
  } catch (err) {
    console.error("Error en addCartItem:", err);
    if (err.message.includes("Usuario o producto no válido")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export const updateCartItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity debe ser un número positivo" });
    }

    // Verificar que el item pertenece al usuario
    const [item] = await pool.query("SELECT user_id FROM cart WHERE id = ?", [id]);
    if (!item || item.length === 0 || item[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "No autorizado para modificar este item" });
    }

    const [result] = await pool.query(
      "UPDATE cart SET quantity = ? WHERE id = ?",
      [quantity, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    // Obtener el item actualizado con los datos del producto
    const [updatedItem] = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price, p.image, p.description
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = ?`,
      [id]
    );

    res.json(updatedItem[0]);
  } catch (err) {
    console.error("Error en updateCartItem:", err);
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

    // Verificar que el item pertenece al usuario
    const [item] = await pool.query("SELECT user_id FROM cart WHERE id = ?", [id]);
    if (!item || item.length === 0 || item[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "No autorizado para eliminar este item" });
    }

    const result = await removeFromCart(id);
    res.json(result);
  } catch (err) {
    console.error("Error en deleteCartItem:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Limpia todo el carrito del usuario
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await pool.query("DELETE FROM cart WHERE user_id = ?", [userId]);
    
    res.json({ 
      message: "Carrito limpiado exitosamente", 
      deletedItems: result.affectedRows 
    });
  } catch (err) {
    console.error("Error en clearCart:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene el resumen del carrito (total, cantidad de items)
 */
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query(
      `SELECT 
         COUNT(*) as itemsCount,
         SUM(c.quantity) as totalQuantity,
         SUM(c.quantity * p.price) as totalAmount
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    const summary = rows[0] || {
      itemsCount: 0,
      totalQuantity: 0,
      totalAmount: 0
    };

    res.json(summary);
  } catch (err) {
    console.error("Error en getCartSummary:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Funciones del modelo (manteniendo las que ya tenías)

/**
 * Obtiene los productos en el carrito de un usuario específico.
 */
export const getCartByUser = async (userId) => {
  if (!userId || !Number.isInteger(userId) || userId <= 0) {
    throw new Error("userId debe ser un número entero positivo");
  }

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price, p.image, p.description
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
 */
export const removeFromCart = async (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("id debe ser un número entero positivo");
  }

  try {
    const [result] = await pool.query("DELETE FROM cart WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      throw new Error("Producto no encontrado en el carrito");
    }
    
    return { message: "Producto eliminado del carrito" };
  } catch (error) {
    throw new Error("Error al eliminar del carrito: " + error.message);
  }
};