'use strict';

const { z, idParamSchema } = require('./common.schemas');

const categoryCreateBodySchema = z.object({
  name: z.string().min(1).max(60),
});

const CategoryDtoSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
  })
  .openapi('Category');

module.exports = {
  idParamSchema,
  categoryCreateBodySchema,
  CategoryDtoSchema,
};
