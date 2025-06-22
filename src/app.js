// src/app.js

const express = require('express');
const compression = require('compression');
const passport = require('passport');
const cors = require('cors');

// Add these two lines to import the logger and the http-logger middleware
const logger = require('./logger');
const pinoHttp = require('pino-http');

const auth = require('./auth');
const { createErrorResponse } = require('./response');

// Create an Express app
const app = express();

// Add the pino-http middleware to log all requests.
// This is the line that was missing.
app.use(pinoHttp({ logger }));

app.use(cors({
  origin: 'http://localhost:1234', 
}));

app.use(compression());

passport.use(auth.strategy());
app.use(passport.initialize());

// routes
app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'Not Found'));
});

module.exports = app;