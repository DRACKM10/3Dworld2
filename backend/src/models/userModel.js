import pool from "../config/db.js";
import bcrypt from "bcrypt";
import validator from "validator";

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} user - Datos del usuario.
 */
export const createUser = async (user) => {
  const { username, email, password } = user;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username es requerido y debe tener al menos 3 caracteres");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }
  if (!password || password.length < 6) {
    throw new Error("password debe tener al menos 6 caracteres");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username.trim(), email, hashedPassword]
    );
    return { id: result.insertId, username, email };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El email ya está registrado");
    }
    throw error;
  }
};

/**
 * Busca un usuario por su email.
 */
export const getUserByEmail = async (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, password FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener usuario: ${error.message}`);
  }
};
