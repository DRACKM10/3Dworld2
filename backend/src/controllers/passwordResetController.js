import crypto from "crypto";
import bcrypt from "bcrypt";
import { getUserByEmail, updateUserPassword } from "../models/userModel.js";
import { createResetToken, findTokenByValue, markTokenAsUsed } from "../models/passwordResetModel.js";
import sendEmail from "../utils/sendEmail.js";

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El email es requerido" });
    }

    // Buscar usuario
    const user = await getUserByEmail(email);
    
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({ 
        message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" 
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en BD
    await createResetToken(user.id, token, expiresAt);

    // Crear enlace de recuperación
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Enviar email
    await sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - 3Dworld",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5c212b;">Recuperación de Contraseña</h2>
          <p>Hola ${user.name || 'Usuario'},</p>
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

  } catch (error) {
    console.error("❌ Error en requestPasswordReset:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar token
    const resetToken = await findTokenByValue(token);

    if (!resetToken) {
      return res.status(400).json({ error: "Token inválido o expirado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await updateUserPassword(resetToken.user_id, hashedPassword);

    // Marcar token como usado
    await markTokenAsUsed(token);

    console.log(`✅ Contraseña actualizada para user_id: ${resetToken.user_id}`);

    res.json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};