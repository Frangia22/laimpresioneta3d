var express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('../models');
const apiUsers = require('../api/users');
const { validationResult, body } = require('express-validator');
let user;
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      //console.log("Username:", email);
      //console.log("Password:", password);
      try {
        const user = await db.users.findOne({ 
          where: { email }
        });
        if (!user) {
          //console.log("Fallo");
          return done(null, false, { message: "Usuario incorrecto." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          //console.log("Fallo");
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        return done(null, user);
      } catch (error) {
        //console.log(error);
        return done(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.users.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
var router = express.Router();
/* GET loginAdmin */
router.get('/admin', async(req, res) => {
  user = req.user
  const errorMessage = req.session.errorMessages;
  const successMessage = req.session.successMessage;
  req.session.successMessage = null;
  res.render('pages/singin', { title: 'Administración', errorMessage, user, successMessage});
});
/* POST SingIn — deprecado: usar POST /api/v1/auth/login + JWT */
router.post('/singin', (req, res) => {
  res.status(410).json({
    code: 'LEGACY_DEPRECATED',
    message: 'Este flujo fue reemplazado. Usá POST /api/v1/auth/login y guardá accessToken/refreshToken en el cliente.',
  });
});
/* GET singUp */
router.get('/singup', async(req, res) => {
  user = req.user
  const errorMessages = req.session.errorMessages;
  const data = req.session.data || '';
  req.session.errorMessages = null;
  req.session.data = null
  res.render('pages/singup', { title: 'Registrarse', user, errorMessages, data});
});
/* POST SingUp */
router.post('/singUpUsers', [
  body('nombre').notEmpty()
  .withMessage('Complete el campo nombre')
  .isLength({ min: 3, max: 25})
  .withMessage('El nombre debe tener minimo 3 caracteres y maximo 25')
  .isAlpha()
  .withMessage('Solo puede contener letras el campo nombre'),
  body('email').notEmpty()
  .withMessage('Complete el campo email')
  .isEmail()
  .withMessage('Debe ingresar un dirección valida'),
  body('password').notEmpty()
  .withMessage('Complete el campo contraseña')
  .isStrongPassword()
  .withMessage('La contraseña no es segura. Debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un caracter especial.')
],async(req, res) => {
  try {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si hay errores de validación, renderiza la vista con los mensajes de error
        req.session.errorMessages = errors.array().map(error => error.msg);  
        req.session.data = req.body;      
        return res.redirect('/singup');
        //let errorMessages = errors.array().map(error => error.msg);
        //return res.render('pages/singup', { data: req.body, title: 'Registrarse', errorMessages, user}) 
      }
  const { nombre, email } = req.body;
  const emailExist = await apiUsers.getUserByEmail(email);
  if(emailExist) {
    req.session.errorMessages = ['La dirección de correo electrónico ya está registrada.'];
    req.session.data = req.body;
    return res.redirect('/singup');
  }
  //Encripto contraseña
  const password = req.body.password;
  const generateHash = (password) => {
    return bcrypt.hashSync(password, 10);
  }
  const userPass = generateHash(password);
  await apiUsers.singUpUser(nombre, email, userPass);
  req.session.successMessage = 'Usuario creado con exito';
  res.redirect('/admin');
  } catch(error){
    req.session.errorMessages = 'Hubo un error al crear el usuario', error;
    res.redirect('/singup');
  }
  //console.log('Pass encriptada',userPass);
  //res.send(`Vamos bien!!, ${nombre}, ${userPass}, ${email}`);
});
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      res.render('pages/logout-redirect', { title: 'Cerrando sesión' });
    }
  });
});
router.get('/dashboard', async (req, res) => {
  res.render('pages/dashboard', { title: 'Usuarios', user: null, users: [] });
});
module.exports = router