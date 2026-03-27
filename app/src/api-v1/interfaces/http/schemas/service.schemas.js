'use strict';

const { z, idParamSchema } = require('./common.schemas');

const serviceCreateBodySchema = z.object({
  name: z.string().min(1).max(60),
  iconService: z.string().min(1).max(220),
  details: z.string().min(1),
});

const serviceUpdateBodySchema = serviceCreateBodySchema;

const ServiceDtoSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    iconService: z.string(),
    details: z.string(),
  })
  .openapi('Service');

module.exports = {
  idParamSchema,
  serviceCreateBodySchema,
  serviceUpdateBodySchema,
  ServiceDtoSchema,
};
