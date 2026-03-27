'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function deleteService({ serviceRepository, id }) {
  const deleted = await serviceRepository.delete(id);
  if (!deleted) {
    throw new HttpError(404, 'NOT_FOUND', 'Servicio no encontrado');
  }
  return { deleted: true };
}

module.exports = { deleteService };
