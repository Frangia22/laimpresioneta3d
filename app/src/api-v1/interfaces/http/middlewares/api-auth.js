'use strict';

function requireSessionAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      code: 'UNAUTHENTICATED',
      message: 'Se requiere autenticación. Inicia sesión vía POST /singin (sesión + cookie).',
    });
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user || Number(req.user.roleId) !== 1) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Se requiere rol administrador.',
    });
  }
  return next();
}

module.exports = { requireSessionAuth, requireAdmin };
