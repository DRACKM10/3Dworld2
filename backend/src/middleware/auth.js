import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware para autenticar usuarios mediante un token JWT.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware o ruta.
 * @param {boolean|string} [role] - Rol requerido (opcional, ej. "admin") o true para cualquier usuario autenticado.
 * @returns {void} - Continúa al siguiente middleware/ruta si el token es válido, o envía un error.
 */
export const authenticateToken = (role) => {
  return (req, res, next) => {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Extrae el token después de "Bearer"

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Añade la información decodificada al objeto req

      // Verificar rol si se especifica
      if (role) {
        const requiredRole = typeof role === "string" ? role : "user"; // Por defecto, "user"
        if (!req.user.role || req.user.role !== requiredRole) {
          return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
        }
      }

      next(); // Continúa si todo es válido
    } catch (err) {
      console.error("Error al verificar token:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }
  };
};