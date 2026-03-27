'use strict';

const { OpenAPIRegistry, OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi');
const { z } = require('zod');
require('../schemas/common.schemas'); // extiende Zod con .openapi()
const { ProductDtoSchema, productCreateBodySchema, productUpdateBodySchema, idParamSchema } = require('../schemas/product.schemas');
const { ServiceDtoSchema, serviceCreateBodySchema, serviceUpdateBodySchema } = require('../schemas/service.schemas');
const { CategoryDtoSchema, categoryCreateBodySchema } = require('../schemas/category.schemas');
const { loginBodySchema, refreshBodySchema, loginResponseSchema } = require('../schemas/auth.schemas');
const { UserPublicSchema } = require('../schemas/user.schemas');

function applyBearerSecurity(doc) {
  doc.components = doc.components || {};
  doc.components.securitySchemes = Object.assign({}, doc.components.securitySchemes, {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Access token devuelto por POST /api/v1/auth/login. También puedes usar cookie de sesión Passport (legado EJS); Swagger usa Bearer.',
    },
  });

  const bearer = [{ BearerAuth: [] }];
  const ops = [
    ['post', '/api/v1/products'],
    ['put', '/api/v1/products/{id}'],
    ['delete', '/api/v1/products/{id}'],
    ['post', '/api/v1/services'],
    ['put', '/api/v1/services/{id}'],
    ['delete', '/api/v1/services/{id}'],
    ['post', '/api/v1/categories'],
    ['delete', '/api/v1/categories/{id}'],
    ['get', '/api/v1/users/me'],
    ['get', '/api/v1/users'],
  ];

  for (const [method, pathKey] of ops) {
    if (doc.paths[pathKey] && doc.paths[pathKey][method]) {
      doc.paths[pathKey][method].security = bearer;
    }
  }
  return doc;
}

function buildOpenApiDocument() {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT de acceso (ver POST /api/v1/auth/login)',
  });

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
    method: 'post',
    path: '/api/v1/auth/login',
    summary: 'Iniciar sesión (API)',
    description: 'Devuelve accessToken y refreshToken. Usa Authorization: Bearer &lt;accessToken&gt; en el resto de endpoints.',
    tags: ['Autenticación'],
    request: { body: { content: { 'application/json': { schema: loginBodySchema } } } },
    responses: {
      200: {
        description: 'Tokens emitidos',
        content: { 'application/json': { schema: loginResponseSchema } },
      },
      400: { description: 'Validación' },
      401: { description: 'Credenciales inválidas' },
      500: { description: 'Servidor sin JWT configurado' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/refresh',
    summary: 'Renovar access token',
    tags: ['Autenticación'],
    request: { body: { content: { 'application/json': { schema: refreshBodySchema } } } },
    responses: {
      200: {
        description: 'Nuevo par de tokens',
        content: { 'application/json': { schema: loginResponseSchema } },
      },
      400: { description: 'Validación' },
      401: { description: 'Refresh inválido' },
      500: { description: 'Servidor sin JWT configurado' },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/logout',
    summary: 'Cerrar sesión (cliente)',
    description: 'API stateless: el cliente debe descartar los tokens. Respuesta 204 sin cuerpo.',
    tags: ['Autenticación'],
    responses: {
      204: { description: 'Sin contenido' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/users/me',
    summary: 'Usuario autenticado',
    tags: ['Usuarios'],
    responses: {
      200: {
        description: 'Perfil público',
        content: { 'application/json': { schema: UserPublicSchema } },
      },
      401: { description: 'No autenticado' },
      404: { description: 'Usuario no encontrado' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/users',
    summary: 'Listar usuarios (solo admin)',
    tags: ['Usuarios'],
    responses: {
      200: {
        description: 'Lista de usuarios',
        content: { 'application/json': { schema: UserPublicSchema.array() } },
      },
      401: { description: 'No autenticado' },
      403: { description: 'Sin permiso' },
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
    summary: 'Crear producto (admin; Bearer o sesión)',
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
    summary: 'Actualizar producto (admin; Bearer o sesión)',
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
    summary: 'Eliminar producto (admin; Bearer o sesión)',
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
    summary: 'Crear servicio (admin; Bearer o sesión)',
    tags: ['Servicios'],
    request: { body: { content: { 'application/json': { schema: serviceCreateBodySchema } } } },
    responses: {
      201: { description: 'Creado', content: { 'application/json': { schema: ServiceDtoSchema } } },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/api/v1/services/{id}',
    summary: 'Actualizar servicio (admin; Bearer o sesión)',
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
    summary: 'Eliminar servicio (admin; Bearer o sesión)',
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
    summary: 'Crear categoría (admin; Bearer o sesión)',
    tags: ['Categorías'],
    request: { body: { content: { 'application/json': { schema: categoryCreateBodySchema } } } },
    responses: {
      201: { description: 'Creado', content: { 'application/json': { schema: CategoryDtoSchema } } },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/categories/{id}',
    summary: 'Eliminar categoría (admin; Bearer o sesión)',
    tags: ['Categorías'],
    request: { params: idParamSchema },
    responses: {
      200: { description: 'Eliminado', content: { 'application/json': { schema: z.object({ deleted: z.boolean() }) } } },
    },
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Laimpresioneta3d API',
      version: '1.0.0',
      description:
        'API v1 pensada para frontends modernos (Astro/React) y backoffice. Autenticación recomendada: **Bearer JWT** (`POST /api/v1/auth/login`). Convive con cookie de sesión Passport para el sitio EJS legado.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });

  applyBearerSecurity(doc);
  return doc;
}

module.exports = { buildOpenApiDocument };
