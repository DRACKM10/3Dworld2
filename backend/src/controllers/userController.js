import { createUser, getUserByEmail, createGoogleUser, updateUserPassword } from "../models/userModel.js";
import { getProfileByUserId, createDefaultProfile } from "../models/profileModel.js";
import { createResetToken, findTokenByValue, markTokenAsUsed } from "../models/passwordResetModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** 🔹 Registro */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || username.trim().length < 3)
      return res.status(400).json({ error: "El nombre de usuario debe tener al menos 3 caracteres" });
    if (!validator.isEmail(email))
      return res.status(400).json({ error: "Email inválido" });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres" });

    const user = await createUser({ username, email, password });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });

    let profile = await getProfileByUserId(user.id);
    if (!profile) await createDefaultProfile(user.id, username, email);

    res.status(201).json({ message: "Usuario creado", user, token });
  } catch (err) {
    res.status(500).json({ error: "Error en registro: " + err.message });
  }
};

/** 🔹 Login */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña requeridos" });

    const user = await getUserByEmail(email.toLowerCase());
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    if (user.password === null)
      return res.status(401).json({ error: "Cuenta registrada con Google" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });

    let profile = await getProfileByUserId(user.id);
    if (!profile) await createDefaultProfile(user.id, user.username, user.email);

    res.json({ message: "Login exitoso", user, token });
  } catch (err) {
    res.status(500).json({ error: "Error en login: " + err.message });
  }
};

/** 🔹 Verificar token */
export const verifyToken = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch {
    res.status(500).json({ error: "Error al verificar token" });
  }
};

/** 🔹 Olvidé contraseña */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });

    const user = await getUserByEmail(email.toLowerCase());
    if (!user)
      return res.json({ message: "Si el email existe, recibirás instrucciones" });

    if (user.password === null)
      return res.status(400).json({ error: "Cuenta registrada con Google" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    await createResetToken(user.id, resetToken, expiresAt);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Haz clic en el siguiente enlace:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "Si el email existe, recibirás instrucciones" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
};

/** 🔹 Reset contraseña */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "Token y contraseña requeridos" });

    if (newPassword.length < 6)
      return res.status(400).json({ error: "Contraseña mínima de 6 caracteres" });

    const resetToken = await findTokenByValue(token);
    if (!resetToken) return res.status(400).json({ error: "Token inválido o expirado" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(resetToken.user_id, hashed);
    await markTokenAsUsed(token);

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar contraseña: " + err.message });
  }
};

/** 🔹 Login con Google */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token de Google requerido" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;
    if (!email) return res.status(400).json({ error: "Error al obtener email de Google" });

    let user = await getUserByEmail(email);
    if (!user) {
      user = await createGoogleUser({ username: name, email });
      await createDefaultProfile(user.id, name, email);
    }

    const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({ user, token: jwtToken, picture });
  } catch (err) {
    res.status(400).json({ error: "Error Google Login: " + err.message });
  }
};
