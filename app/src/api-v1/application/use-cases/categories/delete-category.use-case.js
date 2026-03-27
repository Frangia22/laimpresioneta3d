'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function deleteCategory({ categoryRepository, id }) {
  const deleted = await categoryRepository.delete(id);
  if (!deleted) {
    throw new HttpError(404, 'NOT_FOUND', 'Categoría no encontrada');
  }
  return { deleted: true };
}

module.exports = { deleteCategory };
