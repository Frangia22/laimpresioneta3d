'use strict';

const bcrypt = require('bcrypt');
const { HttpError } = require('../../../domain/errors/HttpError');

async function loginApi({ userRepository, jwtTokenService, email, password }) {
  const userRow = await userRepository.findByEmailWithPasswordHash(email);
  if (!userRow) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }
  const match = await bcrypt.compare(password, userRow.password);
  if (!match) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos');
  }
  const roleId = Number(userRow.roleId);
  const tokens = jwtTokenService.issueTokenPair({
    userId: userRow.id,
    roleId,
  });
  return tokens;
}

module.exports = { loginApi };
