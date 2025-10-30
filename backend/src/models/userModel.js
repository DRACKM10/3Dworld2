import pool from "../config/db.js";
import bcrypt from "bcrypt";
import validator from "validator";

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} user - Datos del usuario.
 */
export const createUser = async (user) => {
  const { username, email, password } = user;

  console.log('createUser llamado con:', { username, email, password: password ? '*'.repeat(password.length) : 'NULL (Google)' });

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username es requerido y debe tener al menos 3 caracteres");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  // Permitir password null para usuarios de Google
  if (password !== null && password !== undefined && password.length < 6) {
    throw new Error("password debe tener al menos 6 caracteres");
  }

  // Solo hashear si hay password
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hasheado en model');
  } else {
    console.log('Usuario sin password (Google OAuth)');
    hashedPassword = null; // ✅ Ahora podemos usar NULL
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username.trim(), email.trim().toLowerCase(), hashedPassword]
    );
    
    console.log('✅ Usuario insertado con ID:', result.insertId);
    return { id: result.insertId, username, email };
    
  } catch (error) {
    console.error('❌ Error en createUser query:', error.message, error.code);
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes('email')) {
        throw new Error("El email ya está registrado");
      } else if (error.message.includes('username')) {
        throw new Error("El nombre de usuario ya existe");
      }
      throw new Error("El usuario o email ya existe");
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
      "SELECT id, username, email, password FROM users WHERE LOWER(email) = LOWER(?)",
      [email.trim()]
    );
    
    console.log('getUserByEmail rows:', rows.length > 0 ? 'Encontrado' : 'No encontrado');
    if (rows.length > 0) {
      console.log('📋 Datos usuario:', { 
        id: rows[0].id, 
        username: rows[0].username, 
        hasPassword: rows[0].password !== null,
        passwordValue: rows[0].password 
      });
    }
    return rows[0] || null;
    
  } catch (error) {
    console.error('Error en getUserByEmail:', error.message);
    throw new Error(`Error al obtener usuario: ${error.message}`);
  }
};

/**
 * Crear usuario de Google
 */
export const createGoogleUser = async (userData) => {
  const { username, email } = userData;

  console.log('createGoogleUser llamado con:', { username, email });

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("username es requerido y debe tener al menos 3 caracteres");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("email no válido");
  }

  try {
    // ✅ AHORA SÍ PODEMOS USAR NULL
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username.trim(), email.trim().toLowerCase(), null] // ✅ NULL permitido
    );
    
    console.log('✅ Usuario Google insertado con ID:', result.insertId);
    return { id: result.insertId, username, email };
    
  } catch (error) {
    console.error('❌ Error en createGoogleUser:', error.message, error.code);
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes('email')) {
        throw new Error("El email ya está registrado");
      } else if (error.message.includes('username')) {
        throw new Error("El nombre de usuario ya existe");
      }
      throw new Error("El usuario o email ya existe");
    }
    throw error;
  }
};
export const updateUserPassword = async (userId, hashedPassword) => {
  try {
    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );
    console.log('✅ Contraseña actualizada para user_id:', userId);
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error.message);
    throw new Error(`Error al actualizar contraseña: ${error.message}`);
  }
};