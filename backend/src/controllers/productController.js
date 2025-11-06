// controllers/productController.js
import { 
  getAllProducts, 
  getProductById, 
  createProduct,
  updateProductById,
  deleteProductById
} from "../models/productModel.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";
import multer from 'multer';

// ✅ Configurar Multer para permitir imágenes y modelos 3D
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // hasta 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "model/stl",
      "model/obj",
      "application/octet-stream", // algunos navegadores envían STL así
      "text/plain",               // algunos OBJ o GCODE pueden venir así
      "application/vnd.ms-pki.stl"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes o archivos STL/OBJ/GCODE"));
    }
  }
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


// ✅ Agregar nuevo producto
export const addProduct = async (req, res) => {
  console.log('📤 Subiendo producto a Supabase...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "La imagen o modelo es requerida" });
    }

    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Nombre y precio son requeridos" });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('☁️ Subiendo archivo a Supabase:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error al subir archivo:', uploadError);
      return res.status(500).json({ error: "Error al subir el archivo: " + uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;
    console.log('✅ Archivo subido exitosamente:', fileUrl);

    const productData = {
      name: name.trim(),
      description: description || '',
      price: parseFloat(price),
      image: fileUrl,
      category: category || 'General',
      stock: stock ? parseInt(stock) : 0
    };

    const newProduct = await createProduct(productData);
    
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


// ✅ Actualizar producto
export const updateProduct = async (req, res) => {
  console.log('📝 Actualizando producto...');
  
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, category, stock } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    let imageUrl = req.body.currentImage;

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
        console.error('❌ Error al subir archivo:', uploadError);
        return res.status(500).json({ error: "Error al subir el archivo" });
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
      console.log('✅ Nueva imagen subida:', imageUrl);

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

    const updatedProduct = await updateProductById(id, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

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


// ✅ Eliminar producto
export const deleteProduct = async (req, res) => {
  console.log('🗑️ Eliminando producto...');
  
  try {
    const id = parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (product.image) {
      const fileName = product.image.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      console.log('🗑️ Archivo eliminado de Supabase');
    }

    await deleteProductById(id);
    
    res.json({
      success: true,
      message: "Producto eliminado exitosamente"
    });

  } catch (err) {
    console.error("❌ Error en deleteProduct:", err);
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  }
};


// ✅ Subida de archivos STL / OBJ / GCODE
export const uploadSTLFile = async (req, res) => {
  console.log('📤 Subiendo archivo STL...');
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "El archivo STL es requerido" });
    }

    const productId = req.body.productId;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    if (!['stl', 'obj', 'gcode'].includes(fileExt)) {
      return res.status(400).json({ error: "Solo se permiten archivos STL, OBJ o GCODE" });
    }

    const fileName = `product_${productId}_${Date.now()}.${fileExt}`;
    const MODEL_BUCKET = "models";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(MODEL_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Error al subir archivo:', uploadError);
      return res.status(500).json({ error: "Error al subir el archivo: " + uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(MODEL_BUCKET)
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;
    const fileSize = (req.file.size / 1024 / 1024).toFixed(2);

    console.log('✅ Archivo subido:', fileUrl);

    res.json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: fileSize,
        type: fileExt.toUpperCase()
      }
    });

  } catch (err) {
    console.error("❌ Error en uploadSTLFile:", err);
    res.status(500).json({ error: "Error interno del servidor: " + err.message });
  }
};
