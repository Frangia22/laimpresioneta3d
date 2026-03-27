'use strict';

const { HttpError } = require('../../../domain/errors/HttpError');

async function getProductById({ productRepository, id }) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new HttpError(404, 'NOT_FOUND', 'Producto no encontrado');
  }
  return product;
}

module.exports = { getProductById };
