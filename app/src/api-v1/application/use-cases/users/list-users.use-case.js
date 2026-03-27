'use strict';

async function listUsers({ userRepository }) {
  return userRepository.findAllPublic();
}

module.exports = { listUsers };
