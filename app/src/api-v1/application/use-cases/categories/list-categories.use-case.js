'use strict';

async function listCategories({ categoryRepository }) {
  return categoryRepository.findAll();
}

module.exports = { listCategories };
