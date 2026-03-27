'use strict';

const { z } = require('zod');
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi');

extendZodWithOpenApi(z);

const idParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ example: 1 }),
});

module.exports = { z, idParamSchema };
