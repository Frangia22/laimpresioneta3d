var express = require('express');
const bcrypt = require('bcrypt');
const apiUsers = require('../api/users');
const apiProducts = require('../api/products');
const apiServices = require('../api/services');
const { isAuthenticated, isAdmin } = require('../controllers/auth');
const { addService } = require('../api/services');
const { check, validationResult } = require('express-validator');
const { validateCreateCategory, validateInputs, validateCreateService, validateCreateProdcut } = require('../controllers/validations');
var router = express.Router();
let user;

/* GET home page. */
router.get('/', async(req, res, next) => {
  user = req.user;
  const message = req.session.message;
  req.session.message = null;
  const services = await apiServices.getLastThreeServices()
  const products = await apiProducts.getLastFourProduct()
  res.render('index', { title: 'Laimpresioneta3d', user, products, services, message});
});
router.get('/addProduct', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  const errorMessages = req.session.errorMessages;
  const data = req.session.data || '';
  req.session.errorMessages = null;
  req.session.data = null;
  const categorys = await apiProducts.getCategory();
  res.render('pages/add', {title: 'Agregar producto', user, categorys, errorMessages, data});
});
router.post('/addproduct', isAuthenticated, isAdmin, validateCreateProdcut, async(req, res) => {
  user = req.user;
  try {
    const validatePassed = validateInputs(req, res);
    if (!validatePassed) {
      return res.redirect('addProduct');
    } else {
  const { name, price, image, details, linkPago, otherDetails, idCategory } = req.body;
  await apiProducts.addProduct(name, price, image, details, linkPago, otherDetails, idCategory);
  req.session.message = 'Producto agregado con exito!!'  
  res.redirect('/');
    }
  } catch(error) {
    req.session.message = 'Hubo un error al agregar el servicio', error;
    res.redirect('/')
  }
});
router.get('/addService', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  const errorMessages = req.session.errorMessages;
  const data = req.session.data || '';
  req.session.errorMessages = null;
  req.session.data = null;
  res.render('pages/add', {title: 'Agregar servicio', user, errorMessages, data});
});
router.post('/addservice', isAuthenticated, isAdmin, validateCreateService, async(req, res) => {
  user = req.user;
  try{
    const validatePassed = validateInputs(req, res);
    if (!validatePassed) {
      return res.redirect('addService');
    } else {
    const { name, iconService, details } = req.body;
    await apiServices.addService(name, iconService, details);
    req.session.message = 'Servicio agregado con exito!!'
    res.redirect('/')
    }
  }catch(error) {
    req.session.message = 'Hubo un error al agregar el servicio', error;
    res.redirect('/')
  }
});
router.get('/categorys', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  const categorys = await apiProducts.getCategory();
  const successMessage = req.session.successMessage;
  const errorMessages = req.session.errorMessages;
  const data = req.session.data || '';
  req.session.successMessage = null;
  req.session.errorMessages = null;
  req.session.data = null;
  res.render('pages/add', {title: 'Categorias', user, categorys, successMessage, errorMessages, data});
});
router.post('/addcategory', isAuthenticated, isAdmin, validateCreateCategory, async(req, res) => {
  user = req.user;
  try {
    const validationPassed = validateInputs(req, res);
    console.log(validationPassed);
    if (!validationPassed) {
      return res.redirect('/categorys');
    }else{
      const { name } = req.body;
      await apiProducts.addCategory(name);
      //const categorys = await apiProducts.getCategory();
      //res.render('pages/add', {title: 'Categorias', user, categorys});
      req.session.successMessage = 'Categoria agregada con exito';
      res.redirect('/categorys');
    }
  } catch(error){
    req.session.errorMessages = 'Hubo un error al agregar la categoria', error;
    res.redirect('/categorys');
  }
})
router.get('/deletecategory/:id',isAuthenticated, isAdmin, async(req, res) =>{
  user = req.user;
  const categorys = await apiProducts.getCategory();
  const affectedRows = await apiProducts.deleteCategory(req.params.id);
  if (affectedRows > 0){
    req.session.successMessage = 'Categoria eliminada con exito!!';
    res.redirect('/categorys')
  }else {
    req.session.errorMessage = 'Hubo un error al eliminar la categoria', error;
    res.redirect('/categorys')
  }
});
router.get('/products', async(req, res) => {
  user = req.user;
  const successMessage = req.session.successMessage;
  const errorMessages = req.session.errorMessages;
  req.session.successMessage = null;
  req.session.errorMessages = null;
  const products = await apiProducts.getProducts();
  res.render('pages/products', { title: 'Productos', user, products, successMessage, errorMessages});
});
router.get('/deleteproduct/:id',isAuthenticated, isAdmin, async(req, res) =>{
  user = req.user;
  const products = await apiProducts.getProducts();
  const affectedRows = await apiProducts.deleteProduct(req.params.id);
  if (affectedRows > 0){
    req.session.successMessage = 'Producto eliminado con exito!!';
    res.redirect('/products')
  }else {
    //res.send('Opps, lo siento algo fallo!!!');
    req.session.errorMessages = 'Hubo un error al eliminar el producto', error;
    res.redirect('/products')
  }
});
router.get('/deleteservice/:id',isAuthenticated, isAdmin, async(req, res) =>{
  user = req.user;
  const services = await apiServices.getServices();
  const affectedRows = await apiServices.deleteService(req.params.id);
  if (affectedRows > 0){
    req.session.message = 'Servicio eliminado con exito!!'
    res.redirect('/')
  }else {
    req.session.message = 'Hubo un error al eliminar el servicio';
    res.redirect('/')
  }
});
router.get('/editproduct/:id',isAuthenticated, isAdmin, async(req, res) =>{
  user = req.user;
  const product = await apiProducts.getProductById(req.params.id);
  const categorys = await apiProducts.getCategory();
  res.render('forms/editProduct', { title: 'Editar producto' ,product, user, categorys})
});
router.post('/editproduct/:id', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  try {
  const id = req.params.id;
  const { name, price, image, details, linkPago, otherDetails, idCategory } = req.body;
  await apiProducts.updateProduct(id, name, price, image, details, linkPago, otherDetails, idCategory);
  req.session.successMessage = 'Producto editado con exito!!'
  res.redirect('/products')  
  /*const products = await apiProducts.getProducts()
  res.render('pages/products', { title: 'Productos', user, products })*/
  } catch(error){
    req.session.errorMessages = 'Hubo un error al editar el producto', error;
    res.redirect('/products')
  }
});
router.get('/editservice/:id', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  const service = await apiServices.getServiceById(req.params.id);
  res.render('forms/editService', { title: 'Editar Servicio', service, user })
});
router.post('/editservice/:id', isAuthenticated, isAdmin, async(req, res) => {
  user = req.user;
  try {
    const id = req.params.id;
    const { name, iconService, details } = req.body;
    await apiServices.updateService(id, name, iconService, details);
    const products = await apiProducts.getLastFourProduct();
    const services = await apiServices.getLastThreeServices();
    req.session.message = 'Servicio editado con exito!!'
    res.redirect('/')
  } catch(error){
    req.session.message = 'Hubo un error al editar el servicio', error;
    res.redirect('/')
  }
});
module.exports = router;
