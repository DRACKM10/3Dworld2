import { createUser, getUserByEmail } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

/**
 * Registro de usuario
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body; // ← QUITÉ 'role'

    console.log('📝 Register body recibido:', { username, email, password: '*'.repeat(password?.length || 0) });

    // Validaciones
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return res.status(400).json({ error: "El nombre de usuario es requerido y debe tener al menos 3 caracteres" });
    }
    
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Por favor, proporciona un email válido" });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar formato de username
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos" });
    }

    // Crear usuario
    console.log('🔄 Llamando a createUser...');
    const user = await createUser({ 
      username: username.trim(), 
      email: email.toLowerCase().trim(), 
      password
      // ← QUITÉ 'role'
    });

    console.log('✅ Usuario creado exitosamente:', user.id);

    // Generar token automáticamente después del registro
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      },
      token
    });

  } catch (err) {
    console.error("❌ Error en registerUser:", err.message);

    // Manejo específico de errores
    if (err.message === "El email ya está registrado") {
      return res.status(409).json({ error: "Este email ya está registrado" });
    }
    if (err.message === "El nombre de usuario ya existe") {
      return res.status(409).json({ error: "Este nombre de usuario ya está en uso" });
    }

    res.status(500).json({ error: "Error interno del servidor. Por favor, intenta más tarde." });
  }
};

/**
 * Login de usuario
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt con email:', email);

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Por favor, proporciona un email válido" });
    }

    // Buscar usuario
    const user = await getUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      console.log('❌ No user found for email:', email);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.id);
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log('✅ Login exitoso para usuario:', user.id);

    res.json({
      message: "Login exitoso",
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      },
      token
    });

  } catch (err) {
    console.error("❌ Error en loginUser:", err.message);
    res.status(500).json({ error: "Error interno del servidor. Por favor, intenta más tarde." });
  }
};

/**
 * Verificar token
 */
export const verifyToken = async (req, res) => {
  try {
    // El middleware authenticateToken ya verificó el token
    // y adjuntó los datos del usuario a req.user
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (err) {
    console.error("❌ Error en verifyToken:", err.message);
    res.status(500).json({ error: "Error al verificar el token" });
  }
};