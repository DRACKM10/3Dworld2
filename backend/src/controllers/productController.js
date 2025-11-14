// controllers/productController.js
import { 
  getAllProducts, 
  getProductById, 
  createProduct,
  updateProductById,
  deleteProductById
} from "../models/productModel.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";
import multer from "multer";

// ✅ Configurar Multer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // hasta 20MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/webp", "image/jpg",
      "model/stl", "application/octet-stream", "application/vnd.ms-pki.stl"
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Solo se permiten imágenes o STL"));
  },
});


// ✅ Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("Error en getProducts:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// ✅ Obtener producto por ID
export const getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    console.error("Error en getProduct:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// ✅ Crear nuevo producto
export const addProduct = async (req, res) => {
  console.log("📤 Creando producto en Supabase...");
  try {
    const { name, description, price, category, stock, stlFile } = req.body;

    if (!name || !price)
      return res.status(400).json({ error: "Nombre y precio son requeridos" });

    if (!req.file)
      return res.status(400).json({ error: "La imagen del producto es requerida" });

    // 📸 Subir imagen a Supabase
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    const productData = {
      name: name.trim(),
      description: description || "",
      price: parseFloat(price),
      image: imageUrl,
      category: category || "General",
      stock: stock ? parseInt(stock) : 0,
      stlFile: stlFile || null, // ✅ Nuevo campo
    };

    const newProduct = await createProduct(productData);
    res.status(201).json({ success: true, message: "Producto creado", product: newProduct });
  } catch (err) {
    console.error("❌ Error en addProduct:", err);
    res.status(500).json({ error: "Error al crear producto: " + err.message });
  }
};


// ✅ Actualizar producto
export const updateProduct = async (req, res) => {
  console.log("📝 Actualizando producto...");
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });

    const { name, description, price, category, stock, stlFile } = req.body;
    let imageUrl = req.body.currentImage;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const productData = {
      name: name?.trim(),
      description: description || "",
      price: parseFloat(price),
      image: imageUrl,
      category: category || "General",
      stock: stock ? parseInt(stock) : 0,
      stlFile: stlFile || null, // ✅ nuevo campo
    };

    const updated = await updateProductById(id, productData);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ success: true, message: "Producto actualizado", product: updated });
  } catch (err) {
    console.error("❌ Error en updateProduct:", err);
    res.status(500).json({ error: "Error al actualizar producto: " + err.message });
  }
};


// ✅ Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });

    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    if (product.image) {
      const fileName = product.image.split("/").pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    }

    await deleteProductById(id);
    res.json({ success: true, message: "Producto eliminado" });
  } catch (err) {
    console.error("❌ Error en deleteProduct:", err);
    res.status(500).json({ error: "Error al eliminar producto: " + err.message });
  }
};


// ✅ Subida de archivo STL (a bucket “models”)
export const uploadSTLFile = async (req, res) => {
  console.log("📤 [BACK] uploadSTLFile ejecutado");
  console.log("📦 [BACK] req.file:", req.file ? "Archivo recibido" : "NO HAY ARCHIVO");
  console.log("📝 [BACK] req.body:", req.body);

  try {
    if (!req.file) {
      console.error("❌ [BACK] No se recibió archivo");
      return res.status(400).json({ error: "Archivo STL requerido" });
    }

    const productId = req.body.productId || "temp";
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    
    console.log(`📁 [BACK] Archivo: ${req.file.originalname} (${ext})`);
    
    if (!["stl", "obj", "gcode"].includes(ext)) {
      console.error("❌ [BACK] Extensión no permitida:", ext);
      return res.status(400).json({ error: "Solo se permiten STL, OBJ o GCODE" });
    }

    const fileName = `product_${productId}_${Date.now()}.${ext}`;
    const MODEL_BUCKET = "stl-files";

    console.log(`☁️ [BACK] Subiendo a Supabase: ${fileName}`);

    const { error: uploadError } = await supabase.storage
      .from(MODEL_BUCKET)
      .upload(fileName, req.file.buffer, { 
        contentType: req.file.mimetype,
        upsert: false 
      });

    if (uploadError) {
      console.error("❌ [BACK] Error de Supabase:", uploadError);
      throw uploadError;
    }

    console.log("✅ [BACK] Archivo subido exitosamente");

    const { data: publicUrlData } = supabase.storage
      .from(MODEL_BUCKET)
      .getPublicUrl(fileName);
    
    const fileUrl = publicUrlData.publicUrl;
    const fileSize = (req.file.size / 1024 / 1024).toFixed(2);

    const response = {
      success: true,
      file: { 
        url: fileUrl, 
        name: req.file.originalname, 
        size: fileSize, 
        type: ext.toUpperCase() 
      },
    };

    console.log("📤 [BACK] Respuesta enviada:", response);
    res.json(response);
  } catch (err) {
    console.error("💀 [BACK] Error en uploadSTLFile:", err);
    res.status(500).json({ error: "Error al subir modelo 3D: " + err.message });
  }
};
