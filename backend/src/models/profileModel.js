import pool from "../config/db.js";

/**
 * Obtener perfil de usuario
 */
export const getProfileByUserId = async (userId) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener perfil: ${error.message}`);
  }
};

/**
 * Crear perfil por defecto
 */
export const createDefaultProfile = async (userId, username, email) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO user_profiles (user_id, name, username, description, profile_pic, banner) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        username,
        "¡Bienvenido a mi perfil! Estoy emocionado de ser parte de esta comunidad.",
        `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7D00FF&color=fff&size=128`,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0b2b33&color=7D00FF&size=1200&bold=true`
      ]
    );
    
    return await getProfileByUserId(userId);
  } catch (error) {
    throw new Error(`Error al crear perfil: ${error.message}`);
  }
};

/**
 * Actualizar perfil
 */
export const updateProfile = async (userId, profileData) => {
  const { name, username, description, birthdate, profile_pic, banner } = profileData;
  
  try {
    await pool.query(
      `UPDATE user_profiles 
       SET name = ?, username = ?, description = ?, birthdate = ?, profile_pic = ?, banner = ?
       WHERE user_id = ?`,
      [name, username, description, birthdate || null, profile_pic, banner, userId]
    );
    
    return await getProfileByUserId(userId);
  } catch (error) {
    throw new Error(`Error al actualizar perfil: ${error.message}`);
  }
};