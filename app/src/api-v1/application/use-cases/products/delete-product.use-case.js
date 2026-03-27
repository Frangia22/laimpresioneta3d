'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function deleteProduct({ productRepository, id }) {
  const deleted = await productRepository.delete(id);
  if (!deleted) {
    throw new HttpError(404, 'NOT_FOUND', 'Producto no encontrado');
  }
  return { deleted: true };
}

module.exports = { deleteProduct };
