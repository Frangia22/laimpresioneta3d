'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function updateProduct({ productRepository, id, data }) {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new HttpError(404, 'NOT_FOUND', 'Producto no encontrado');
  }
  const affected = await productRepository.update(id, data);
  if (!affected) {
    throw new HttpError(404, 'NOT_FOUND', 'Producto no encontrado');
  }
  return productRepository.findById(id);
}

module.exports = { updateProduct };
