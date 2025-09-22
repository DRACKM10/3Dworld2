import jwt from "jsonwebtoken";

/**
 * Middleware para autenticar usuarios mediante un token JWT.
 * @param {string|string[]|undefined} role - Rol(es) requerido(s) (opcional, ej. "admin", ["admin", "moderator"], o undefined para cualquier usuario autenticado).
 * @returns {Function} - El middleware que verifica el token y roles.
 */
const authenticateToken = (role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no definido en .env – configura antes de usar auth");
  }

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
        const userRole = req.user.role;
        if (!userRole) {
          return res.status(403).json({ error: "Acceso denegado: no se encontró rol en el token" });
        }
        if (typeof role === "string" && userRole !== role) {
          return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
        }
        if (Array.isArray(role) && !role.includes(userRole)) {
          return res.status(403).json({ error: "Acceso denegado: rol no autorizado" });
        }
      }

      next(); // Continúa si todo es válido
    } catch (err) {
      console.error("Error al verificar token:", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Token malformado o inválido" });
      }
      if (err.name === "NotBeforeError") {
        return res.status(401).json({ error: "Token no activo aún" });
      }
      return res.status(401).json({ error: "Token inválido" });
    }
  };
};

export default authenticateToken;