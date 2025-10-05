import jwt from "jsonwebtoken";

const authenticateToken = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no definido en .env – configura antes de usar auth");
  }

  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expirado" });
      if (err.name === "JsonWebTokenError") return res.status(401).json({ error: "Token inválido" });
      return res.status(401).json({ error: "Token no válido" });
    }
  };
};

export default authenticateToken;