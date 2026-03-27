'use strict';

async function createCategory({ categoryRepository, data }) {
  return categoryRepository.create(data);
}

module.exports = { createCategory };
