'use strict';

const { z, idParamSchema } = require('./common.schemas');

const productCreateBodySchema = z.object({
  name: z.string().min(1).max(60),
  price: z.coerce.number().int(),
  image: z.string().min(1).max(220),
  details: z.string().min(1),
  linkPago: z.union([z.string().max(220), z.literal('')]).optional().transform((v) => (v === '' ? null : v)),
  otherDetails: z.string().optional().nullable(),
  idCategory: z.coerce.number().int().positive(),
});

const productUpdateBodySchema = productCreateBodySchema;

const ProductDtoSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    price: z.number().int(),
    image: z.string(),
    details: z.string(),
    linkPago: z.string().nullable().optional(),
    otherDetails: z.string().nullable().optional(),
    idCategory: z.number().int(),
  })
  .openapi('Product');

module.exports = {
  idParamSchema,
  productCreateBodySchema,
  productUpdateBodySchema,
  ProductDtoSchema,
};
