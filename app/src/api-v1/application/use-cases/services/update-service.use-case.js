'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function updateService({ serviceRepository, id, data }) {
  const existing = await serviceRepository.findById(id);
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Servicio no encontrado');
  }
  const affected = await serviceRepository.update(id, data);
  if (!affected) {
    throw new HttpError(404, 'NOT_FOUND', 'Servicio no encontrado');
  }
  return serviceRepository.findById(id);
}

module.exports = { updateService };
