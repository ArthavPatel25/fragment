// src/app.js
const express = require('express');
const compression = require('compression');
const passport = require('passport');
const auth = require('./auth'); // add this
const cors = require('cors');
const { createErrorResponse } = require('./response');

// Create an Express app
const app = express();

app.use(cors({
  origin: 'http://localhost:1234', // replace with your frontend URL
  // You can add options like credentials: true if needed
}));
// Use gzip/deflate compression middleware
app.use(compression());

// Initialize passport and use our strategy
passport.use(auth.strategy());
app.use(passport.initialize());

// Define routes

app.use('/', require('./routes'));
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'Not Found'));
});
module.exports = app;
