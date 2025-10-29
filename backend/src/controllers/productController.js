// controllers/productController.js
import { 
  getAllProducts, 
  getProductById, 
  createProduct,
  updateProductById,  // ← AGREGAR
  deleteProductById   // ← AGREGAR
} from "../models/productModel.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";
import multer from 'multer';

// Configurar Multer para memoria (no guardamos en disco)
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

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
  console.log('📤 Subiendo producto a Supabase...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "La imagen es requerida" });
    }

    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Nombre y precio son requeridos" });
    }

    // Generar nombre único para la imagen
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('☁️ Subiendo imagen a Supabase:', fileName);

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error al subir imagen:', uploadError);
      return res.status(500).json({ error: "Error al subir la imagen: " + uploadError.message });
    }

    // Obtener URL pública de la imagen
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    console.log('✅ Imagen subida exitosamente:', imageUrl);

    // Guardar en BD con la URL de Supabase
    const productData = {
      name: name.trim(),
      description: description || '',
      price: parseFloat(price),
      image: imageUrl, // ← URL de Supabase
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
// Agregar al final de productController.js

export const updateProduct = async (req, res) => {
  console.log('📝 Actualizando producto...');
  
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, category, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    let imageUrl = req.body.currentImage; // Mantener imagen actual si no se sube nueva

    // Si hay nueva imagen, subirla a Supabase
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('☁️ Subiendo nueva imagen a Supabase:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error al subir imagen:', uploadError);
        return res.status(500).json({ error: "Error al subir la imagen" });
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
      console.log('✅ Nueva imagen subida:', imageUrl);

      // Opcional: Eliminar imagen anterior de Supabase
      if (req.body.currentImage) {
        const oldFileName = req.body.currentImage.split('/').pop();
        await supabase.storage.from(BUCKET_NAME).remove([oldFileName]);
      }
    }

    const productData = {
      name: name?.trim(),
      description: description || '',
      price: parseFloat(price),
      image: imageUrl,
      category: category || 'General',
      stock: stock ? parseInt(stock) : 0
    };

    console.log('💾 Actualizando en BD:', productData);

    const updatedProduct = await updateProductById(id, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.log('🎉 Producto actualizado exitosamente!');
    
    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      product: updatedProduct
    });

  } catch (err) {
    console.error("❌ Error en updateProduct:", err);
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  }
};

export const deleteProduct = async (req, res) => {
  console.log('🗑️ Eliminando producto...');
  
  try {
    const id = parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Obtener producto para eliminar imagen de Supabase
    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Eliminar imagen de Supabase
    if (product.image) {
      const fileName = product.image.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      console.log('🗑️ Imagen eliminada de Supabase');
    }

    // Eliminar de BD
    await deleteProductById(id);
    
    console.log('🎉 Producto eliminado exitosamente!');
    
    res.json({
      success: true,
      message: "Producto eliminado exitosamente"
    });

  } catch (err) {
    console.error("❌ Error en deleteProduct:", err);
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  }
};