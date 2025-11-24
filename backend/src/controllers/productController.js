// controllers/productController.js
import { 
  getAllProducts, 
  getProductById, 
  createProduct,
  updateProductById,
  deleteProductById,
  updateProductSTL,
  getProductsByUser
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

    // ✅ Obtener información del usuario autenticado
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    const userName = req.user?.name;

    console.log("👤 Usuario creador:", { 
      userId, 
      userName, 
      userEmail, 
      userRole 
    });

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

    // ✅ DETERMINAR EL NOMBRE DEL CREADOR SEGÚN EL ROL
    let creatorDisplayName;
    
    if (userRole === 'admin') {
      creatorDisplayName = "3Dworld";
      console.log("🏢 Producto creado por administrador - Mostrar como: 3Dworld");
    } else {
      creatorDisplayName = userName || userEmail || "Usuario";
      console.log("👤 Producto creado por usuario - Mostrar como:", creatorDisplayName);
    }

    const productData = {
      name: name.trim(),
      description: description || "",
      price: parseFloat(price),
      image: imageUrl,
      category: category || "General",
      stock: stock ? parseInt(stock) : 0,
      stlFile: stlFile || null,
      createdBy: userId,
      creatorName: creatorDisplayName,
    };

    const newProduct = await createProduct(productData);
    
    res.status(201).json({ 
      success: true, 
      message: "Producto creado", 
      product: newProduct 
    });
    
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
      stlFile: stlFile || null,
    };

    const updated = await updateProductById(id, productData);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ success: true, message: "Producto actualizado", product: updated });
  } catch (err) {
    console.error("❌ Error en updateProduct:", err);
    res.status(500).json({ error: "Error al actualizar producto: " + err.message });
  }
};

// ✅ Eliminar producto (CON SOFT DELETE O CASCADE)
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });

    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    // Eliminar imagen del storage si existe
    if (product.image) {
      const fileName = product.image.split("/").pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    }

    // Eliminar STL del storage si existe
    if (product.stl_file) {
      const stlFileName = product.stl_file.split("/").pop();
      await supabase.storage.from("stl-files").remove([stlFileName]);
    }

    await deleteProductById(id);
    
    res.json({ 
      success: true, 
      message: "Producto eliminado correctamente" 
    });
    
  } catch (err) {
    console.error("❌ Error en deleteProduct:", err);
    
    // Manejar error de constraint de foreign key
    if (err.message.includes('foreign key constraint')) {
      return res.status(409).json({ 
        error: "No se puede eliminar el producto porque tiene órdenes asociadas. Use eliminación suave (soft delete)." 
      });
    }
    
    res.status(500).json({ error: "Error al eliminar producto: " + err.message });
  }
};

// ✅ Obtener productos del usuario actual
export const getMyProducts = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const products = await getProductsByUser(userId);
    res.json(products);
  } catch (err) {
    console.error("❌ Error en getMyProducts:", err);
    res.status(500).json({ error: "Error al obtener productos del usuario" });
  }
};

// ✅ Actualizar STL de producto existente
export const updateProductSTLFile = async (req, res) => {
  console.log("📤 Actualizando STL del producto...");
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });

    const { stlFile } = req.body;

    if (!stlFile) {
      return res.status(400).json({ error: "URL del STL es requerida" });
    }

    const updated = await updateProductSTL(id, stlFile);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ 
      success: true, 
      message: "Archivo STL actualizado", 
      product: updated 
    });
  } catch (err) {
    console.error("❌ Error en updateProductSTL:", err);
    res.status(500).json({ error: "Error al actualizar STL: " + err.message });
  }
};

// ✅ Subida de archivo STL (a bucket "stl-files")
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

// ✅ Restaurar producto (soft delete)
export const restoreProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido" });

    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_active: true,
        deleted_at: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ 
      success: true, 
      message: "Producto restaurado", 
      product: data 
    });
  } catch (err) {
    console.error("❌ Error en restoreProduct:", err);
    res.status(500).json({ error: "Error al restaurar producto: " + err.message });
  }
};