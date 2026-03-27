'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function getCurrentUser({ userRepository, userId }) {
  const user = await userRepository.findByIdPublic(userId);
  if (!user) {
    throw new HttpError(404, 'NOT_FOUND', 'Usuario no encontrado');
  }
  return user;
}

module.exports = { getCurrentUser };
