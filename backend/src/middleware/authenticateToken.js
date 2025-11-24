// middleware/authenticateToken.js
import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET no definido en .env");
    return res.status(500).json({ error: "Error de configuración del servidor" });
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("🔐 [AUTH] Header:", authHeader ? "Presente" : "Ausente");
  console.log("🔐 [AUTH] Token extraído:", token ? "Sí" : "No");

  if (!token) {
    console.log("❌ [AUTH] Token no proporcionado");
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("✅ [AUTH] Token válido. Usuario:", {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      username: decoded.username,
      role: decoded.role
    });

    // Asegurar que req.user tenga toda la información necesaria
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || decoded.username || 'Usuario',
      username: decoded.username,
      role: decoded.role || 'client'
    };

    next();
  } catch (err) {
    console.error("❌ [AUTH] Error al verificar token:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    }
    return res.status(401).json({ error: "Token no válido" });
  }
};

// Middleware de autorización por roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'client';

    console.log('🛡️ [AUTHORIZE] Usuario:', req.user?.email);
    console.log('🛡️ [AUTHORIZE] Rol del usuario:', userRole);
    console.log('🛡️ [AUTHORIZE] Roles permitidos:', allowedRoles);

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ [AUTHORIZE] Acceso denegado - Rol insuficiente');
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción" 
      });
    }

    console.log('✅ [AUTHORIZE] Autorización concedida');
    next();
  };
};

export default authenticateToken;