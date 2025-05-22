const express = require('express');
const compression = require('compression');
const passport = require('passport');
const auth = require('./auth');
const cors = require('cors');
const { createErrorResponse } = require('./response');

//  Create an Express app first
const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:1234', // change if deploying elsewhere
}));

// Use gzip/deflate compression middleware
app.use(compression());

// Initialize passport and use our auth strategy
passport.use(auth.strategy());
app.use(passport.initialize());

// Define routes
app.use('/', require('./routes'));

//  404 middleware for unknown routes (placed last)
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

module.exports = app;
