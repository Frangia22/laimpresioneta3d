'use strict';

const { z } = require('./common.schemas');

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

const loginResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenType: z.literal('Bearer'),
  })
  .openapi('LoginResponse');

module.exports = {
  loginBodySchema,
  refreshBodySchema,
  loginResponseSchema,
};
