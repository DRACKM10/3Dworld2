export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'client';

    console.log('🔐 Verificando autorización:', {
      userRole,
      allowedRoles,
      userId: req.user?.id
    });

    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Acceso denegado - Rol insuficiente');
      return res.status(403).json({ 
        error: "No tienes permisos para realizar esta acción" 
      });
    }

    console.log('✅ Autorización concedida');
    next();
  };
};