'use strict';

function asyncHandler(fnDisplay) {
  return function asyncHandlerInner(req, res, next) {
    Promise.resolve(fnDisplay(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
