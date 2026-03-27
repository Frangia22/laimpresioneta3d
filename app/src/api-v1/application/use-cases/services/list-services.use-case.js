'use strict';

async function listServices({ serviceRepository }) {
  return serviceRepository.findAll();
}

module.exports = { listServices };
