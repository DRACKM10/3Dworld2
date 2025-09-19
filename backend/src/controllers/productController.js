import { getAllProducts, getProductById, createProduct } from "../models/productModel.js";

/**
 * Obtiene todos los productos disponibles.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con la lista de productos o un error.
 */
export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No se encontraron productos" });
    }
    res.json(products);
  } catch (err) {
    console.error("Error en getProducts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Obtiene un producto por su ID.
 * @param {Object} req - Objeto de solicitud con id en params.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con el producto o un error.
 */
export const getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error en getProduct:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Crea un nuevo producto.
 * @param {Object} req - Objeto de solicitud con datos del producto en body.
 * @param {Object} res - Objeto de respuesta.
 * @returns {Promise<void>} - Responde con el producto creado o un error.
 */
export const addProduct = async (req, res) => {
  try {
    const { name, price, image } = req.body;

    // Validaciones básicas
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "name es requerido y debe ser una cadena no vacía" });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: "price debe ser un número positivo" });
    }
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "image es requerido y debe ser una cadena" });
    }

    // Opcional: Verificar autenticación
    // if (!req.user || !req.user.isAdmin) {
    //   return res.status(403).json({ error: "No autorizado para crear productos" });
    // }

    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error en addProduct:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};