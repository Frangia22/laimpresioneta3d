'use strict';

class HttpError extends Error {
  /**
   * @param {number} status - HTTP status
   * @param {string} code - Código estable para clientes
   * @param {string} message - Mensaje legible
   * @param {unknown} [details]
   */
  constructor(status, code, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = { HttpError };
