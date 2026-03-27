'use strict';

async function createService({ serviceRepository, data }) {
  return serviceRepository.create(data);
}

module.exports = { createService };
