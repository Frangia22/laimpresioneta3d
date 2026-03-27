'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { buildOpenApiDocument } = require('../openapi/build-open-api-document');
const { validateRequest } = require('../middlewares/validate-request');
const { asyncHandler } = require('../middlewares/async-handler');
const { requireSessionAuth, requireAdmin } = require('../middlewares/api-auth');

const { SequelizeProductRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-product-repository');
const { SequelizeServiceRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-service-repository');
const { SequelizeCategoryRepository } = require('../../../infrastructure/persistence/sequelize/sequelize-category-repository');

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

const productRepository = new SequelizeProductRepository();
const serviceRepository = new SequelizeServiceRepository();
const categoryRepository = new SequelizeCategoryRepository();

const router = express.Router();

const openApiDocument = buildOpenApiDocument();
router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customSiteTitle: 'Laimpresioneta API v1' })
);

router.get(
  '/openapi.json',
  (req, res) => {
    res.json(openApiDocument);
  }
);

router.get(
  '/health',
  (req, res) => {
    res.json({ status: 'ok', version: 'v1' });
  }
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
  requireSessionAuth,
  requireAdmin,
  validateRequest({ body: productCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createProduct({ productRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.put(
  '/products/:id',
  requireSessionAuth,
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
  requireSessionAuth,
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
  requireSessionAuth,
  requireAdmin,
  validateRequest({ body: serviceCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createService({ serviceRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.put(
  '/services/:id',
  requireSessionAuth,
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
  requireSessionAuth,
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
  requireSessionAuth,
  requireAdmin,
  validateRequest({ body: categoryCreateBodySchema }),
  asyncHandler(async (req, res) => {
    const data = await createCategory({ categoryRepository, data: req.body });
    res.status(201).json(data);
  })
);

router.delete(
  '/categories/:id',
  requireSessionAuth,
  requireAdmin,
  validateRequest({ params: categoryIdParam }),
  asyncHandler(async (req, res) => {
    const data = await deleteCategory({ categoryRepository, id: req.params.id });
    res.json(data);
  })
);

module.exports = router;
