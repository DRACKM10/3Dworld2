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
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
    process.exit(1); // Sale del proceso si no se puede conectar
  }
  console.log("Conectado a la base de datos MySQL");
  if (connection) connection.release(); // Libera la conexión después de verificar
});

export default pool;