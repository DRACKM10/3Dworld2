import jwt from "jsonwebtoken";

const authenticateToken = (role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no definido en .env – configura antes de usar auth");
  }

  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    console.log(`[AUTH] Request a ${req.path} - Token proporcionado: ${!!token}`); // Log para depurar

    if (!token) {
      console.log(`[AUTH ERROR] No token en ${req.path}`);
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log(`[AUTH] Token válido para userId: ${decoded.id}, role: ${decoded.role}`); // Log útil

      if (role) {
        const userRole = req.user.role;
        if (!userRole || (typeof role === "string" && userRole !== role) || (Array.isArray(role) && !role.includes(userRole))) {
          console.log(`[AUTH ERROR] Rol insuficiente en ${req.path}: ${userRole}`);
          return res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
        }
      }
      next();
    } catch (err) {
      console.error(`[AUTH ERROR] Verificación fallida en ${req.path}: ${err.message}`);
      if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expirado" });
      if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Token malformado o inválido" });
      if (err.name === "NotBeforeError") return res.status(401).json({ error: "Token no activo aún" });
      return res.status(401).json({ error: "Token inválido" });
    }
  };
};

export default authenticateToken;