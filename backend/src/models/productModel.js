import pool from "../config/db.js";

export const getAllProducts = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, image, category, stock FROM products WHERE is_active = TRUE"
    );
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, image, category, stock FROM products WHERE id = ? AND is_active = TRUE",
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

export const createProduct = async (product) => {
  const { name, description, price, image, category, stock } = product;

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, image, category, stock]
    );
    
    // Devolver el producto creado
    const [newProduct] = await pool.query(
      "SELECT * FROM products WHERE id = ?", 
      [result.insertId]
    );
    
    return newProduct[0];
  } catch (error) {
    throw new Error(`Error al crear producto: ${error.message}`);
  }
};