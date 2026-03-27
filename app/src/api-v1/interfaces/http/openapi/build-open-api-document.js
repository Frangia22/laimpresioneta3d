'use strict';

const { OpenAPIRegistry, OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi');
const { z } = require('zod');
require('../schemas/common.schemas'); // extiende Zod con .openapi()
const { ProductDtoSchema, productCreateBodySchema, productUpdateBodySchema, idParamSchema } = require('../schemas/product.schemas');
const { ServiceDtoSchema, serviceCreateBodySchema, serviceUpdateBodySchema } = require('../schemas/service.schemas');
const { CategoryDtoSchema, categoryCreateBodySchema } = require('../schemas/category.schemas');

function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  const HealthSchema = z.object({ status: z.literal('ok'), version: z.literal('v1') }).openapi('Health');

  registry.registerPath({
    method: 'get',
    path: '/api/v1/health',
    summary: 'Estado del servicio',
    tags: ['Sistema'],
    responses: {
      200: {
        description: 'Servicio operativo',
        content: { 'application/json': { schema: HealthSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/products',
    summary: 'Listar productos',
    tags: ['Productos'],
    responses: {
      200: {
        description: 'Lista de productos',
        content: { 'application/json': { schema: ProductDtoSchema.array() } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/products/{id}',
    summary: 'Obtener producto por id',
    tags: ['Productos'],
    request: { params: idParamSchema },
    responses: {
      200: {
        description: 'Producto',
        content: { 'application/json': { schema: ProductDtoSchema } },
      },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/products',
    summary: 'Crear producto (admin + sesión)',
    tags: ['Productos'],
    request: { body: { content: { 'application/json': { schema: productCreateBodySchema } } } },
    responses: {
      201: {
        description: 'Creado',
        content: { 'application/json': { schema: ProductDtoSchema } },
      },
      400: { description: 'Validación' },
      401: { description: 'No autenticado' },
      403: { description: 'Sin permiso' },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/v1/products/{id}',
    summary: 'Actualizar producto (admin + sesión)',
    tags: ['Productos'],
    request: {
      params: idParamSchema,
      body: { content: { 'application/json': { schema: productUpdateBodySchema } } },
    },
    responses: {
      200: {
        description: 'Actualizado',
        content: { 'application/json': { schema: ProductDtoSchema } },
      },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/products/{id}',
    summary: 'Eliminar producto (admin + sesión)',
    tags: ['Productos'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Eliminado', content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } } },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/services',
    summary: 'Listar servicios',
    tags: ['Servicios'],
    responses: {
      200: {
        description: 'Lista de servicios',
        content: { 'application/json': { schema: ServiceDtoSchema.array() } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/services/{id}',
    summary: 'Obtener servicio por id',
    tags: ['Servicios'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Servicio', content: { 'application/json': { schema: ServiceDtoSchema } } },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/services',
    summary: 'Crear servicio (admin + sesión)',
    tags: ['Servicios'],
    request: { body: { content: { 'application/json': { schema: serviceCreateBodySchema } } } },
    responses: {
      201: { description: 'Creado', content: { 'application/json': { schema: ServiceDtoSchema } } },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/v1/services/{id}',
    summary: 'Actualizar servicio (admin + sesión)',
    tags: ['Servicios'],
    request: {
      params: idParamSchema,
      body: { content: { 'application/json': { schema: serviceUpdateBodySchema } } },
    },
    responses: {
      200: { description: 'Actualizado', content: { 'application/json': { schema: ServiceDtoSchema } } },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/services/{id}',
    summary: 'Eliminar servicio (admin + sesión)',
    tags: ['Servicios'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Eliminado', content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/categories',
    summary: 'Listar categorías',
    tags: ['Categorías'],
    responses: {
      200: {
        description: 'Lista de categorías',
        content: { 'application/json': { schema: CategoryDtoSchema.array() } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/categories/{id}',
    summary: 'Obtener categoría por id',
    tags: ['Categorías'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Categoría', content: { 'application/json': { schema: CategoryDtoSchema } } },
      404: { description: 'No encontrado' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/categories',
    summary: 'Crear categoría (admin + sesión)',
    tags: ['Categorías'],
    request: { body: { content: { 'application/json': { schema: categoryCreateBodySchema } } } },
    responses: {
      201: { description: 'Creado', content: { 'application/json': { schema: CategoryDtoSchema } } },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/categories/{id}',
    summary: 'Eliminar categoría (admin + sesión)',
    tags: ['Categorías'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Eliminado', content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } } },
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Laimpresioneta3d API',
      version: '1.0.0',
      description:
        'API versionada v1. La autenticación de escritura usa la misma sesión que el sitio (Passport): inicia sesión con POST /singin (form-urlencoded o JSON según el cliente) y envía la cookie en peticiones a /api/v1.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });
}

module.exports = { buildOpenApiDocument };
