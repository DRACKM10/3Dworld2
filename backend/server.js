import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";

import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js"; // Nuevo: para manejar pedidos

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));  // Más específico para seguridad
app.use(express.json());

// Verificar conexión a la base de datos (estilo async) – buena elección, evita bloquear el hilo principal
const verifyConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado a la base de datos MySQL");
    connection.release();
  } catch (err) {
    console.error("Error conectando a la base de datos:", err.message);
    process.exit(1);
  }
};
verifyConnection();

// Chequeo rápido de variables env críticas (e.g., para JWT) – lección: siempre valida configs al inicio
if (!process.env.JWT_SECRET) {
  console.error("Error: JWT_SECRET no definido en .env – tu autenticación fallará");
  process.exit(1);
}

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes); // Nuevo: integra los pedidos aquí

// Middleware de manejo de errores – simple pero efectivo, bien
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal en el servidor" });
});

// Ruta raíz para probar – útil para health check
app.get("/", (req, res) => {
  res.json({ message: "API de 3Dworld backend funcionando!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));