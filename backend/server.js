import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./src/config/supabase.js";

import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";


dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Verificar conexión a Supabase
const verifyConnection = async () => {
  try {
    // Hacer una consulta simple para verificar la conexión
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("❌ Error conectando a Supabase:", error.message);
    } else {
      console.log("✅ Conectado a Supabase correctamente");
    }
  } catch (err) {
    console.error("❌ Error al verificar conexión:", err.message);
  }
};
verifyConnection();

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 API de 3Dworld backend funcionando con Supabase!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`));