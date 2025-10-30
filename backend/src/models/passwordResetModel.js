import pool from "../config/db.js";

export const createResetToken = async (userId, token, expiresAt) => {
  try {
    const [result] = await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Error al crear token: ${error.message}`);
  }
};

export const findTokenByValue = async (token) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()",
      [token]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al buscar token: ${error.message}`);
  }
};

export const markTokenAsUsed = async (token) => {
  try {
    await pool.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?",
      [token]
    );
  } catch (error) {
    throw new Error(`Error al marcar token como usado: ${error.message}`);
  }
};