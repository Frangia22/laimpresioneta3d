'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function refreshTokens({ refreshToken, jwtTokenService, userRepository }) {
  let decoded;
  try {
    decoded = jwtTokenService.verifyRefreshToken(refreshToken);
  } catch (_e) {
    throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido o expirado');
  }
  if (decoded.typ !== 'refresh') {
    throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Token no es de tipo refresh');
  }
  const userId = Number(decoded.sub);
  const user = await userRepository.findByIdPublic(userId);
  if (!user) {
    throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Usuario no encontrado');
  }
  return jwtTokenService.issueTokenPair({
    userId: user.id,
    roleId: user.roleId,
  });
}

module.exports = { refreshTokens };
