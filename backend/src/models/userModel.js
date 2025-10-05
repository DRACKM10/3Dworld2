import pool from "../config/db.js";
import bcrypt from "bcrypt";
import validator from "validator";

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} user - Datos del usuario.
 */
export const createUser = async (user) => {
  const { username, email, password = "user" } = user; // Default  si no pasado

  console.log('createUser llamado con:', { username, email, password: '*',  });

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
  console.log('Password hasheado en model');

  try {
    // Agrega  al INSERT si tu tabla lo tiene; sino quita ,  y ?
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, ) VALUES (?, ?, ?, ?)",
      [username.trim(), email.trim().toLowerCase(), hashedPassword, ] // Trim y lowercase email
    );
    return { id: result.insertId, username, email };
  } catch (error) {
    console.error('Error en createUser query:', error.message, error.code);
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
      "SELECT id, username, email, password FROM users WHERE LOWER(email) = LOWER(?)", // Case-insensitive
      [email.trim()]
    );
    console.log('getUserByEmail rows:', rows.length > 0 ? 'Encontrado' : 'No encontrado');
    return rows[0] || null;
  } catch (error) {
    console.error('Error en getUserByEmail:', error.message);
    throw new Error(`Error al obtener usuario: ${error.message}`);

  }
};
