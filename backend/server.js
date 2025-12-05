import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./src/config/supabase.js";

import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import commentRoutes from './src/routes/commentRoutes.js';

// Cargar variables de entorno PRIMERO
dotenv.config();

const app = express();

// ✅ CORS permisivo - acepta cualquier origen (incluye todos los subdominios de Vercel)
app.use(cors({ 
  origin: true,
  credentials: true 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, req.body ? 'Con body' : 'Sin body');
  next();
});

// Verificar variables de entorno críticas
console.log("🔧 Verificando variables de entorno...");
console.log("📊 SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Configurado" : "❌ Faltante");
console.log("🔑 SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? "✅ Configurado" : "❌ Faltante");
console.log("🗝️ JWT_SECRET:", process.env.JWT_SECRET ? "✅ Configurado" : "❌ Faltante");
console.log("🔐 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Configurado" : "❌ Faltante (Opcional)");

// Verificar conexión a Supabase
const verifyConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("❌ Error conectando a Supabase:", error.message);
      return false;
    } else {
      console.log("✅ Conectado a Supabase correctamente");
      return true;
    }
  } catch (err) {
    console.error("❌ Error al verificar conexión:", err.message);
    return false;
  }
};

// Rutas API
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/comments", commentRoutes);

// Ruta de salud
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 API de 3Dworld backend funcionando con Supabase!",
    version: "1.0.0",
    features: [
      "✅ Sistema de productos con STL",
      "✅ Carrito de compras", 
      "✅ Autenticación de usuarios",
      "✅ Sistema de órdenes",
      "✅ Perfiles de usuario",
      "✅ Sistema de comentarios y ratings",
      "✅ Subida de archivos STL"
    ]
  });
});

// Ruta de health check
app.get("/health", async (req, res) => {
  const dbStatus = await verifyConnection();
  
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: dbStatus ? "Connected" : "Disconnected",
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ CORREGIDO: Manejo de rutas no encontradas (sin asterisco)
app.use((req, res, next) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("💥 Error global:", err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: "Archivo demasiado grande", 
      message: "El archivo excede el límite de 50MB" 
    });
  }
  
  res.status(500).json({ 
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

const PORT = process.env.PORT || 8000;

// Iniciar servidor después de verificar conexión
const startServer = async () => {
  console.log("🔄 Verificando conexión a Supabase...");
  const dbConnected = await verifyConnection();
  
  if (!dbConnected) {
    console.warn("⚠️  Advertencia: No se pudo conectar a Supabase, pero el servidor iniciará igual");
  }
  
  app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Base de datos: ${dbConnected ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`🔗 CORS habilitado para todos los orígenes`);
  });
};

startServer();