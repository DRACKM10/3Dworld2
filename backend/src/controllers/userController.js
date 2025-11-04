import { createUser, getUserByEmail, createGoogleUser } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

// 🔹 VERIFICACIÓN DEL CLIENT ID
console.log("🔧 Configurando Google OAuth Client...");
console.log("🔧 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Configurado" : "❌ FALTANTE");

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ ERROR CRÍTICO: GOOGLE_CLIENT_ID no está configurado en las variables de entorno");
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Registro de usuario
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== "string" || username.trim().length < 3)
      return res.status(400).json({ error: "El nombre de usuario es requerido y debe tener al menos 3 caracteres" });

    if (!email || !validator.isEmail(email))
      return res.status(400).json({ error: "Por favor, proporciona un email válido" });

    if (!password || password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username))
      return res.status(400).json({ error: "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos" });

    const user = await createUser({ username: username.trim(), email: email.toLowerCase().trim(), password });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 🔹 CREAR PERFIL POR DEFECTO
    const { getProfileByUserId, createDefaultProfile } = await import("../models/profileModel.js");
    let profile = await getProfileByUserId(user.id);
    if (!profile) {
      profile = await createDefaultProfile(user.id, user.username, user.email);
      console.log("✅ Perfil creado para nuevo usuario:", user.id);
    }

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Error en registerUser:", err.message);
    if (err.message.includes("ya está registrado") || err.message.includes("ya existe")) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Login normal
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña son requeridos" });

    if (!validator.isEmail(email))
      return res.status(400).json({ error: "Por favor, proporciona un email válido" });

    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    // 🔹 VERIFICACIÓN: Usuario de Google no puede hacer login normal
    if (user.password === null) {
      return res.status(401).json({ error: "Este email está registrado con Google. Por favor usa Google Sign-In." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 🔹 CREAR PERFIL SI NO EXISTE
    const { getProfileByUserId, createDefaultProfile } = await import("../models/profileModel.js");
    let profile = await getProfileByUserId(user.id);
    if (!profile) {
      profile = await createDefaultProfile(user.id, user.username, user.email);
      console.log("✅ Perfil creado para usuario existente:", user.id);
    }

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
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * Verificar token
 */
export const verifyToken = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch {
    res.status(500).json({ error: "Error al verificar el token" });
  }
};

/**
 * 🔹 OLVIDÉ MI CONTRASEÑA - ACTUALIZADO
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es requerido" });
    }

    const user = await getUserByEmail(email.toLowerCase().trim());
    
    if (!user) {
      return res.json({ 
        message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" 
      });
    }

    if (user.password === null) {
      return res.status(400).json({ 
        error: "Este email está registrado con Google. No tiene contraseña para resetear." 
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    const { createResetToken } = await import("../models/passwordResetModel.js");
    await createResetToken(user.id, resetToken, expiresAt);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - 3Dworld",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5c212b;">Recuperación de Contraseña</h2>
          <p>Hola ${user.username},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #5c212b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, ignora este correo.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">3Dworld - Tu tienda de impresiones 3D</p>
        </div>
      `,
    });

    console.log(`✅ Email de recuperación enviado a: ${email}`);

    res.json({ 
      message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" 
    });

  } catch (err) {
    console.error("❌ Error en forgotPassword:", err.message);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

/**
 * 🔹 RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const { findTokenByValue, markTokenAsUsed } = await import("../models/passwordResetModel.js");
    const { updateUserPassword } = await import("../models/userModel.js");

    const resetToken = await findTokenByValue(token);

    if (!resetToken) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserPassword(resetToken.user_id, hashedPassword);
    await markTokenAsUsed(token);

    console.log(`✅ Contraseña actualizada para user_id: ${resetToken.user_id}`);

    res.json({ message: "Contraseña actualizada exitosamente" });

  } catch (err) {
    console.error("❌ Error en resetPassword:", err.message);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};

/**
 * 🔹 LOGIN CON GOOGLE
 */
export const googleLogin = async (req, res) => {
  try {
    console.log("🔐 === INICIANDO GOOGLE LOGIN ===");
    const { token } = req.body;

    if (!token) {
      console.log("❌ No se recibió token de Google");
      return res.status(400).json({ error: "Token de Google es requerido" });
    }

    console.log("✅ Token recibido");

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    console.log("✅ Token verificado correctamente");
    console.log("📧 Email:", email);

    if (!email) {
      return res.status(400).json({ error: "No se pudo obtener el email de Google" });
    }

    let user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      console.log("👤 Creando nuevo usuario de Google...");
      
      let username = name || email.split('@')[0];
      if (username.length > 50) {
        username = username.substring(0, 50);
      }
      
      user = await createGoogleUser({
        username: username,
        email: email.toLowerCase().trim()
      });
      
      console.log("✅ Usuario creado con ID:", user.id);

      // 🔹 CREAR PERFIL PARA NUEVO USUARIO GOOGLE
      const { createDefaultProfile } = await import("../models/profileModel.js");
      await createDefaultProfile(user.id, username, email);
      console.log("✅ Perfil creado para usuario Google:", user.id);

    } else {
      console.log("✅ Usuario encontrado:", user.id);
      
      if (user.password !== null) {
        return res.status(409).json({ 
          error: "Este email ya está registrado con contraseña. Por favor usa el login normal." 
        });
      }

      // 🔹 VERIFICAR/CREAR PERFIL PARA USUARIO GOOGLE EXISTENTE
      const { getProfileByUserId, createDefaultProfile } = await import("../models/profileModel.js");
      let profile = await getProfileByUserId(user.id);
      if (!profile) {
        profile = await createDefaultProfile(user.id, user.username, user.email);
        console.log("✅ Perfil creado para usuario Google existente:", user.id);
      }
    }

    const jwtToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("🎉 Login con Google EXITOSO");

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: picture
      }, 
      token: jwtToken 
    });

  } catch (err) {
    console.error("❌ ERROR en googleLogin:", err.message);
    
    if (err.message.includes("Token used too late")) {
      return res.status(400).json({ error: "Token de Google expirado" });
    } else if (err.message.includes("Wrong number of segments")) {
      return res.status(400).json({ error: "Token de Google inválido" });
    }
    
    res.status(400).json({ error: "Error con Google Login: " + err.message });
  }
};