const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});
const auth = require('./auth');

const app = express();

// Logging, security, and compression middleware
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

// Set up Passport for JWT-based authentication
passport.use(auth.strategy());
app.use(passport.initialize());

// Use routes (includes / and /v1 routes)
app.use('/', require('./routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});

module.exports = app;
