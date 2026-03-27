'use strict';

var express = require('express');
var router = express.Router();

function legacyGoneJson(req, res) {
  res.status(410).json({
    code: 'LEGACY_DEPRECATED',
    message:
      'Ruta legada retirada. Usá /api/v1 (ver docs/api-v1.md y Swagger en /api/v1/docs).',
  });
}

function legacyGoneGet(req, res) {
  res.status(410).send(
    '<!DOCTYPE html><html lang="es"><meta charset="utf-8"><title>410 Gone</title>' +
      '<body style="font-family:system-ui;padding:2rem">' +
      '<h1>Ruta deprecada</h1><p>Esta acción ya no está disponible por GET. ' +
      'Gestioná el contenido desde el panel usando la API v1.</p>' +
      '<p><a href="/products">Volver a productos</a> · <a href="/">Inicio</a></p></body></html>'
  );
}

/* GET home — datos públicos se cargan en cliente vía GET /api/v1/services y /api/v1/products */
router.get('/', async (req, res) => {
  var message = req.session.message;
  req.session.message = null;
  res.render('index', {
    title: 'Laimpresioneta3d',
    user: null,
    products: [],
    services: [],
    message: message,
  });
});

router.get('/addProduct', async (req, res) => {
  res.render('pages/add', {
    title: 'Agregar producto',
    user: null,
    categorys: [],
    errorMessages: null,
    data: '',
  });
});

router.post('/addproduct', legacyGoneJson);

router.get('/addService', async (req, res) => {
  res.render('pages/add', {
    title: 'Agregar servicio',
    user: null,
    errorMessages: null,
    data: '',
  });
});

router.post('/addservice', legacyGoneJson);

router.get('/categorys', async (req, res) => {
  res.render('pages/add', {
    title: 'Categorias',
    user: null,
    categorys: [],
    successMessage: null,
    errorMessages: null,
    data: '',
  });
});

router.post('/addcategory', legacyGoneJson);

router.get('/deletecategory/:id', legacyGoneGet);

router.get('/products', async (req, res) => {
  res.render('pages/products', {
    title: 'Productos',
    user: null,
    products: [],
    successMessage: null,
    errorMessages: null,
  });
});

router.get('/deleteproduct/:id', legacyGoneGet);

router.get('/deleteservice/:id', legacyGoneGet);

router.get('/editproduct/:id', async (req, res) => {
  res.render('forms/editProduct', {
    title: 'Editar producto',
    user: null,
    product: { id: req.params.id },
    categorys: [],
  });
});

router.post('/editproduct/:id', legacyGoneJson);

router.get('/editservice/:id', async (req, res) => {
  res.render('forms/editService', {
    title: 'Editar Servicio',
    user: null,
    service: { id: req.params.id },
  });
});

router.post('/editservice/:id', legacyGoneJson);

module.exports = router;
