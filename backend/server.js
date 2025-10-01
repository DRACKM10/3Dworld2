import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./src/config/db.js";

import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Verificar conexión DB
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

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);  // <-- Aquí están tus rutas de login/register
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API de 3Dworld backend funcionando!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
