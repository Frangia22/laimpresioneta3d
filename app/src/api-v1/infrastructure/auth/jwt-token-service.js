'use strict';

const jwt = require('jsonwebtoken');

function getAccessSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) {
    throw new Error('JWT_ACCESS_SECRET no está configurado');
  }
  return s;
}

function getRefreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) {
    throw new Error('JWT_REFRESH_SECRET no está configurado');
  }
  return s;
}

function signAccessToken({ userId, roleId }) {
  const opts = {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  };
  return jwt.sign(
    { sub: String(userId), roleId: Number(roleId), typ: 'access' },
    getAccessSecret(),
    opts
  );
}

function signRefreshToken({ userId, roleId }) {
  const opts = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
  return jwt.sign(
    { sub: String(userId), roleId: Number(roleId), typ: 'refresh' },
    getRefreshSecret(),
    opts
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getAccessSecret());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getRefreshSecret());
}

function issueTokenPair({ userId, roleId }) {
  return {
    accessToken: signAccessToken({ userId, roleId }),
    refreshToken: signRefreshToken({ userId, roleId }),
    tokenType: 'Bearer',
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueTokenPair,
};
