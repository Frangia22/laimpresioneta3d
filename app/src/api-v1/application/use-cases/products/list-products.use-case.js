'use strict';

async function listProducts({ productRepository }) {
  return productRepository.findAll();
}

module.exports = { listProducts };
