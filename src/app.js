const express = require('express');
const compression = require('compression');
const passport = require('passport');
const auth = require('./auth');
const cors = require('cors');
const { createErrorResponse } = require('./response');
const logger = require('./logger');

const app = express();

app.use(cors({
  origin: 'http://localhost:1234',
}));

app.use(compression());

passport.use(auth.strategy());
app.use(passport.initialize());

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({
    status: 'error',
    message: err.message,
  });
});
/* eslint-enable no-unused-vars */

module.exports = app;