'use strict';

const jwtTokenService = require('../../../infrastructure/auth/jwt-token-service');

/**
 * Autenticación para /api/v1: prioriza Bearer JWT; si no hay header, acepta sesión Passport (legado EJS).
 * Expone req.actor = { id, roleId }.
 */
function requireApiAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHENTICATED',
        message: 'Bearer token vacío',
      });
    }
    try {
      const decoded = jwtTokenService.verifyAccessToken(token);
      if (decoded.typ !== 'access') {
        return res.status(401).json({
          code: 'INVALID_TOKEN',
          message: 'Token no es de acceso',
        });
      }
      req.actor = {
        id: Number(decoded.sub),
        roleId: Number(decoded.roleId),
      };
      return next();
    } catch (_e) {
      return res.status(401).json({
        code: 'UNAUTHENTICATED',
        message: 'Bearer token inválido o expirado',
      });
    }
  }

  if (req.isAuthenticated && req.isAuthenticated()) {
    req.actor = {
      id: req.user.id,
      roleId: Number(req.user.roleId),
    };
    return next();
  }

  return res.status(401).json({
    code: 'UNAUTHENTICATED',
    message:
      'Autenticación requerida: envía Authorization: Bearer <accessToken> (POST /api/v1/auth/login) o cookie de sesión web.',
  });
}

function requireAdmin(req, res, next) {
  if (!req.actor || Number(req.actor.roleId) !== 1) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Se requiere rol administrador.',
    });
  }
  next();
}

/** @deprecated Usar requireApiAuthentication */
const requireSessionAuth = requireApiAuthentication;

module.exports = {
  requireApiAuthentication,
  requireAdmin,
  requireSessionAuth,
};
