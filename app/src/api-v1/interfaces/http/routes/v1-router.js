'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { buildOpenApiDocument } = require('../openapi/build-open-api-document');
const { validateRequest } = require('../middlewares/validate-request');
const { asyncHandler } = require('../middlewares/async-handler');
const { requireApiAuthentication, requireAdmin } = require('../middlewares/api-auth');

const jwtTokenService = require('../../../infrastructure/auth/jwt-token-service');
const { SequelizeUserRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-user-repository');
const { SequelizeProductRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-product-repository');
const { SequelizeServiceRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-service-repository');
const { SequelizeCategoryRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-category-repository');

const { loginApi } = require('../../../application/use-cases/auth/login-api.use-case');
const { refreshTokens } = require('../../../application/use-cases/auth/refresh-tokens.use-case');
const { getCurrentUser } = require('../../../application/use-cases/users/get-current-user.use-case');
const { listUsers } = require('../../../application/use-cases/users/list-users.use-case');

const { listProducts } = require('../../../application/use-cases/products/list-products.use-case');
const { getProductById } = require('../../../application/use-cases/products/get-product.use-case');
const { createProduct } = require('../../../application/use-cases/products/create-product.use-case');
const { updateProduct } = require('../../../application/use-cases/products/update-product.use-case');
const { deleteProduct } = require('../../../application/use-cases/products/delete-product.use-case');

const { listServices } = require('../../../application/use-cases/services/list-services.use-case');
const { getServiceById } = require('../../../application/use-cases/services/get-service.use-case');
const { createService } = require('../../../application/use-cases/services/create-service.use-case');
const { updateService } = require('../../../application/use-cases/services/update-service.use-case');
const { deleteService } = require('../../../application/use-cases/services/delete-service.use-case');

const { listCategories } = require('../../../application/use-cases/categories/list-categories.use-case');
const { getCategoryById } = require('../../../application/use-cases/categories/get-category.use-case');
const { createCategory } = require('../../../application/use-cases/categories/create-category.use-case');
const { deleteCategory } = require('../../../application/use-cases/categories/delete-category.use-case');

const {
  idParamSchema,
  productCreateBodySchema,
  productUpdateBodySchema,
} = require('../schemas/product.schemas');
const {
  idParamSchema: serviceIdParam,
  serviceCreateBodySchema,
  serviceUpdateBodySchema,
} = require('../schemas/service.schemas');
const {
  idParamSchema: categoryIdParam,
  categoryCreateBodySchema,
} = require('../schemas/category.schemas');
const { loginBodySchema, refreshBodySchema } = require('../schemas/auth.schemas');

const productRepository = new SequelizeProductRepository();
const serviceRepository = new SequelizeServiceRepository();
const categoryRepository = new SequelizeCategoryRepository();
const userRepository = new SequelizeUserRepository();

const router = express.Router();

const openApiDocument = buildOpenApiDocument();
router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customSiteTitle: 'Laimpresioneta API v1' })
);

router.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

router.post(
  '/auth/login',
  validateRequest({ body: loginBodySchema }),
  asyncHandler(async (req, res) => {
    try {
      const tokens = await loginApi({
        userRepository,
        jwtTokenService,
        email: req.body.email,
        password: req.body.password,
      });
      res.json(tokens);
    } catch (e) {
      if (e && e.message && /JWT_(ACCESS|REFRESH)_SECRET/.test(String(e.message))) {
        return res.status(500).json({
          code: 'SERVER_CONFIG',
          message: 'Configuración JWT incompleta (JWT_ACCESS_SECRET / JWT_REFRESH_SECRET).',
        });
      }
      throw e;
    }
  })
);

router.post(
  '/auth/refresh',
  validateRequest({ body: refreshBodySchema }),
  asyncHandler(async (req, res) => {
    try {
      const tokens = await refreshTokens({
        refreshToken: req.body.refreshToken,
        jwtTokenService,
        userRepository,
      });
      res.json(tokens);
    } catch (e) {
      if (e && e.message && /JWT_(ACCESS|REFRESH)_SECRET/.test(String(e.message))) {
        return res.status(500).json({
          code: 'SERVER_CONFIG',
          message: 'Configuración JWT incompleta (JWT_ACCESS_SECRET / JWT_REFRESH_SECRET).',
        });
      }
      throw e;
    }
  })
);

router.post(
  '/auth/logout',
  asyncHandler(async (req, res) => {
    res.status(204).send();
  })
);

router.get(
  '/users/me',
  requireApiAuthentication,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser({
      userRepository,
      userId: req.actor.id,
    });
    res.json(user);
  })
);

router.get(
  '/users',
  requireApiAuthentication,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await listUsers({ userRepository });
    res.json(users);
  })
);

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const data = await listProducts({ productRepository });
    res.json(data);
  })
);

router.get(
  '/products/:id',
  validateRequest({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const data = await getProductById({ productRepository, id: req.params.id });
    res.json(data);
  })
);

router.post(
  '/products',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ body: productCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createProduct({ productRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.put(
  '/products/:id',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ params: idParamSchema, body: productUpdateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await updateProduct({
      productRepository,
      id: req.params.id,
      data: req.body,
    });
    res.json(data);
  })
);

router.delete(
  '/products/:id',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const data = await deleteProduct({ productRepository, id: req.params.id });
    res.json(data);
  })
);

router.get(
  '/services',
  asyncHandler(async (req, res) => {
    const data = await listServices({ serviceRepository });
    res.json(data);
  })
);

router.get(
  '/services/:id',
  validateRequest({ params: serviceIdParam }),
  asyncHandler(async (req, res) => {
    const data = await getServiceById({ serviceRepository, id: req.params.id });
    res.json(data);
  })
);

router.post(
  '/services',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ body: serviceCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createService({ serviceRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.put(
  '/services/:id',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ params: serviceIdParam, body: serviceUpdateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await updateService({
      serviceRepository,
      id: req.params.id,
      data: req.body,
    });
    res.json(data);
  })
);

router.delete(
  '/services/:id',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ params: serviceIdParam }),
  asyncHandler(async (req, res) => {
    const data = await deleteService({ serviceRepository, id: req.params.id });
    res.json(data);
  })
);

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const data = await listCategories({ categoryRepository });
    res.json(data);
  })
);

router.get(
  '/categories/:id',
  validateRequest({ params: categoryIdParam }),
  asyncHandler(async (req, res) => {
    const data = await getCategoryById({ categoryRepository, id: req.params.id });
    res.json(data);
  })
);

router.post(
  '/categories',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ body: categoryCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createCategory({ categoryRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.delete(
  '/categories/:id',
  requireApiAuthentication,
  requireAdmin,
  validateRequest({ params: categoryIdParam }),
  asyncHandler(async (req, res) => {
    const data = await deleteCategory({ categoryRepository, id: req.params.id });
    res.json(data);
  })
);

module.exports = router;
