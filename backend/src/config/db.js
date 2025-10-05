import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "3dworld",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar la conexión al iniciar el pool
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Conectado a la base de datos MySQL");
    connection.release();
  } catch (err) {
    console.error("Error conectando a la base de datos:", err.message);
    process.exit(1);
  }
})();

export default pool;