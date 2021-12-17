const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

module.exports = function (app) {
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
};