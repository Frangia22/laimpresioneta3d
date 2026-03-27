'use strict';

const { z } = require('zod');

/**
 * Valida params, query y/o body con Zod. Los valores parseados reemplazan req.*.
 * @param {{ params?: import('zod').ZodTypeAny; query?: import('zod').ZodTypeAny; body?: import('zod').ZodTypeAny }} schemas
 */
function validateRequest(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Validación fallida',
          details: err.issues ?? err.errors ?? [],
        });
      }
      next(err);
    }
  };
}

module.exports = { validateRequest };
