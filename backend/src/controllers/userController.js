import { createUser, getUserByEmail } from "../models/userModel.js";
import bcrypt from "bcrypt"; // Solo si necesitas, pero quítalo si model lo maneja
import jwt from "jsonwebtoken";
import validator from "validator";

/**
 * Registro de usuario
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // Incluye role si lo usas

    console.log('Register body recibido:', { username, email, password: '*', role }); // Log sin password plana

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ error: "username es requerido y debe tener al menos 3 caracteres" });
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "email no válido" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "password debe tener al menos 6 caracteres" });
    }

    // Llama a createUser (model hashea)
    const user = await createUser({ username, email, password, role }); // Pasa role si tabla lo tiene

    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error("Error en registerUser:", err.message, err.stack);
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

    console.log('Login attempt con email:', email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "email no válido" });
    }

    const user = await getUserByEmail(email);
    console.log('User encontrado en DB:', user ? { id: user.id, email: user.email } : 'null'); // Log sin password

    if (!user) {
      console.log('No user found for email:', email);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password compare result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.id);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
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
    console.error("Error en loginUser:", err.message, err.stack);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};