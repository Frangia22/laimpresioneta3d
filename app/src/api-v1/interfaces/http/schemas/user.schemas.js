'use strict';

const { z } = require('./common.schemas');

const UserPublicSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    email: z.string().email(),
    roleId: z.number().int(),
    status: z.boolean(),
  })
  .openapi('UserPublic');

module.exports = { UserPublicSchema };
