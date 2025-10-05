import pool from "../config/db.js";
import validator from "validator";

/**
 * Obtiene todos los productos.
 * @returns {Promise<Array>} - Lista de todos los productos.
 * @throws {Error} - Si ocurre un error en la consulta.
 */
export const getAllProducts = async () => {
  try {
    const [rows] = await pool.query("SELECT id, name, price, image FROM products");
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener productos: ${error.message}`);

  }
};

/**
 * Obtiene un producto por su ID.
 * @param {number} id - ID del producto.
 * @returns {Promise<Object|null>} - Objeto del producto o null si no existe.
 * @throws {Error} - Si el id es inválido o ocurre un error en la consulta.
 */
export const getProductById = async (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("id debe ser un número entero positivo");
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name, price, image FROM products WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);

  }
};

/**
 * Crea un nuevo producto.
 * @param {Object} product - Datos del producto.
 * @param {string} product.name - Nombre del producto.
 * @param {number} product.price - Precio del producto.
 * @param {string} product.image - URL o ruta de la imagen.
 * @returns {Promise<Object>} - Objeto con id y datos del producto creado.
 * @throws {Error} - Si los datos son inválidos o ocurre un error en la consulta.
 */
export const createProduct = async (product) => {
  const { name, price, image } = product;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("name es requerido y debe ser una cadena no vacía");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("price debe ser un número positivo");
  }
  if (!image || typeof image !== "string") {
    throw new Error("image es requerido y debe ser una cadena");
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
      [name.trim(), price, image]
    );
    return { id: result.insertId, name, price, image };
  } catch (error) {
    throw new Error(`Error al crear producto: ${error.message}`);

  }
};