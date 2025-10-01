import { createUser, getUserByEmail } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

/**
 * Registro de usuario
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ error: "username es requerido y debe tener al menos 3 caracteres" });
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "email no válido" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "password debe tener al menos 6 caracteres" });
    }

    const user = await createUser(req.body);
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error("Error en registerUser:", err);
    if (err.message === "El email ya está registrado") {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Login de usuario
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "email no válido" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT sin role
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
