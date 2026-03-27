'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function getCategoryById({ categoryRepository, id }) {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new HttpError(404, 'NOT_FOUND', 'Categoría no encontrada');
  }
  return category;
}

module.exports = { getCategoryById };
