'use strict';

async function createProduct({ productRepository, data }) {
  return productRepository.create(data);
}

module.exports = { createProduct };
