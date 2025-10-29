// controllers/productController.js - SIN CLOUDINARY
import { getAllProducts, getProductById, createProduct } from "../models/productModel.js";
import { upload } from "../config/multer.js"; // ← Cambia esta importación

export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error en getProducts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

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

export const addProduct = async (req, res) => {
  console.log('📤 Subiendo producto...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "La imagen es requerida" });
    }

    console.log('✅ Archivo guardado:', req.file.filename);

    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Nombre y precio son requeridos" });
    }

    // Guardar en BD con la ruta local
    const productData = {
      name: name.trim(),
      description: description || '',
      price: parseFloat(price),
      image: `/uploads/${req.file.filename}`, // ← Ruta local
      category: category || 'General',
      stock: stock ? parseInt(stock) : 0
    };

    console.log('💾 Guardando en BD:', productData);
    const newProduct = await createProduct(productData);
    
    console.log('🎉 Producto creado exitosamente!');
    
    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      product: newProduct
    });

  } catch (err) {
    console.error("❌ Error en addProduct:", err);
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  }
};

export { upload };