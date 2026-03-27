'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function getServiceById({ serviceRepository, id }) {
  const service = await serviceRepository.findById(id);
  if (!service) {
    throw new HttpError(404, 'NOT_FOUND', 'Servicio no encontrado');
  }
  return service;
}

module.exports = { getServiceById };
